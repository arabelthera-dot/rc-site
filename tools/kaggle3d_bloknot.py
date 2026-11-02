# Блокнот Kaggle для tools/kaggle3d.py: фото предметов → glb с текстурой.
# Ячейки разделены "# %%"; kaggle3d.py собирает из них .ipynb. Чистый python, без "!" —
# чтобы этот же файл можно было прогнать на сервере: RC3D_FAKE=1 python3 tools/kaggle3d_bloknot.py
# Порядок на каждый предмет: Hunyuan3D-2 (форма + текстура) → при сбое TRELLIS → при сбое
# форма Hunyuan без текстуры (помечается tekstura=false). Итог: out/*.glb + out/otchet.json.

# %%
import glob, json, os, subprocess, sys, time, traceback

FAKE = os.environ.get("RC3D_FAKE") == "1"
VHOD = os.environ.get("RC3D_IN", "/kaggle/input")
VYHOD = os.environ.get("RC3D_OUT", "/kaggle/working/out")
os.makedirs(VYHOD, exist_ok=True)
NACHALO = time.time()


def log(*a):
    s = " ".join(str(x) for x in a)
    print(f"[{time.time() - NACHALO:7.0f}s] {s}", flush=True)
    with open(os.path.join(VYHOD, "zhurnal.txt"), "a") as f:
        f.write(s + "\n")


def sh(cmd, cwd=None):
    log("$", cmd)
    r = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if r.returncode:
        log((r.stdout + r.stderr)[-3000:])
        raise RuntimeError(f"код {r.returncode}: {cmd}")
    return r.stdout


FOTO = sorted(p for p in glob.glob(os.path.join(VHOD, "**", "*"), recursive=True)
              if p.lower().endswith((".jpg", ".jpeg", ".png", ".webp")))
log("фото:", len(FOTO), [os.path.basename(p) for p in FOTO])
if not FAKE:
    log(sh("nvidia-smi --query-gpu=name,memory.total --format=csv"))
OTCHET = {os.path.splitext(os.path.basename(p))[0]: {"foto": os.path.basename(p)} for p in FOTO}


def zapisat_otchet():
    with open(os.path.join(VYHOD, "otchet.json"), "w") as f:
        json.dump({"sek": round(time.time() - NACHALO), "predmety": OTCHET}, f, ensure_ascii=False, indent=1)


zapisat_otchet()

# %% Установка Hunyuan3D-2 (~10 мин: зависимости + сборка двух расширений CUDA под T4)
HY = "/kaggle/working/Hunyuan3D-2"
if not FAKE:
    os.environ.setdefault("TORCH_CUDA_ARCH_LIST", "7.5")
    try:
        if not os.path.isdir(HY):
            sh(f"git clone --depth 1 https://github.com/Tencent/Hunyuan3D-2 {HY}")
        # torch в образе Kaggle уже с CUDA — не трогаем; gradio/bpy для облака не нужны
        sh(f"grep -viE '^(torch|torchvision|torchaudio|gradio|bpy|deepspeed)' {HY}/requirements.txt > /tmp/req.txt")
        sh("pip install -q -r /tmp/req.txt")
        sh("pip install -q --no-build-isolation -e .", cwd=HY)
        sh("pip install -q --no-build-isolation .", cwd=f"{HY}/hy3dgen/texgen/custom_rasterizer")
        sh("pip install -q --no-build-isolation .", cwd=f"{HY}/hy3dgen/texgen/differentiable_renderer")
        sys.path.insert(0, HY)
        HY_OK = True
    except Exception as e:
        log("Hunyuan3D-2 не встал:", e)
        HY_OK = False
else:
    HY_OK = True

# %% Форма: все предметы подряд, потом модель выгружается из памяти
import trimesh
from PIL import Image


def fake_mesh(i):
    m = trimesh.creation.box((1, 1.5 + i * 0.1, 0.5))
    m.visual.vertex_colors = [200, 120, 40, 255]
    return m


SETKI, KARTINKI = {}, {}
if HY_OK:
    try:
        if not FAKE:
            import torch
            from hy3dgen.rembg import BackgroundRemover
            from hy3dgen.shapegen import (Hunyuan3DDiTFlowMatchingPipeline, FaceReducer,
                                          FloaterRemover, DegenerateFaceRemover)
            rembg = BackgroundRemover()
            forma = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained("tencent/Hunyuan3D-2")
        for i, p in enumerate(FOTO):
            k = os.path.splitext(os.path.basename(p))[0]
            t = time.time()
            try:
                img = Image.open(p).convert("RGBA")
                if FAKE:
                    m = fake_mesh(i)
                else:
                    if img.getextrema()[3][0] == 255:  # нет прозрачности — вырезаем фон
                        img = rembg(img.convert("RGB"))
                    m = forma(image=img, num_inference_steps=30, octree_resolution=380, num_chunks=20000,
                              generator=torch.manual_seed(1234), output_type="trimesh")[0]
                    m = FloaterRemover()(m)
                    m = DegenerateFaceRemover()(m)
                    m = FaceReducer()(m, max_facenum=40000)
                SETKI[k], KARTINKI[k] = m, img
                OTCHET[k]["forma_sek"] = round(time.time() - t)
                log(k, "форма", len(m.faces), "граней")
            except Exception as e:
                OTCHET[k]["oshibka_forma"] = repr(e)[:500]
                log(k, "форма сбой:", traceback.format_exc()[-1500:])
        if not FAKE:
            del forma
            torch.cuda.empty_cache()
    except Exception as e:
        log("форма — модель не загрузилась:", traceback.format_exc()[-1500:])
zapisat_otchet()

# %% Текстура Hunyuan3D-Paint
GOTOVO = set()
if SETKI:
    try:
        if not FAKE:
            from hy3dgen.texgen import Hunyuan3DPaintPipeline
            kraska = Hunyuan3DPaintPipeline.from_pretrained("tencent/Hunyuan3D-2")
        for k, m in SETKI.items():
            t = time.time()
            try:
                if FAKE:
                    if os.environ.get("RC3D_FAKE_SBOJ") == k:
                        raise RuntimeError("подставной сбой текстуры")
                    mt = m.copy()
                    import numpy as np
                    uv = (mt.vertices[:, :2] - mt.vertices[:, :2].min(0)) / np.ptp(mt.vertices[:, :2], 0)
                    tex = Image.new("RGB", (64, 64), (180, 40, 40))
                    tex.paste((40, 40, 180), (0, 0, 64, 32))
                    mt.visual = trimesh.visual.TextureVisuals(uv=uv, image=tex)
                else:
                    try:
                        mt = kraska(m, image=KARTINKI[k])
                    except torch.cuda.OutOfMemoryError:
                        log(k, "мало памяти — повтор с выгрузкой на ЦП")
                        torch.cuda.empty_cache()
                        if hasattr(kraska, "enable_model_cpu_offload"):
                            kraska.enable_model_cpu_offload()
                        mt = kraska(m, image=KARTINKI[k])
                mt.export(os.path.join(VYHOD, f"{k}.glb"))
                OTCHET[k].update(model="hunyuan3d-2", tekstura_sek=round(time.time() - t), glb=f"{k}.glb")
                GOTOVO.add(k)
                log(k, "текстура готова")
            except Exception as e:
                OTCHET[k]["oshibka_tekstura"] = repr(e)[:500]
                log(k, "текстура сбой:", traceback.format_exc()[-1500:])
        if not FAKE:
            del kraska
            torch.cuda.empty_cache()
    except Exception as e:
        log("текстура — модель не загрузилась:", traceback.format_exc()[-1500:])
zapisat_otchet()

# %% Запасной путь: TRELLIS — только если что-то не вышло (ставится долго, ~20 мин)
OSTALOS = [p for p in FOTO if os.path.splitext(os.path.basename(p))[0] not in GOTOVO]
log("на TRELLIS:", len(OSTALOS))
if OSTALOS and not FAKE and os.environ.get("RC3D_BEZ_TRELLIS") != "1":
    TR = "/kaggle/working/TRELLIS"
    try:
        os.environ["ATTN_BACKEND"] = "xformers"  # flash-attn на T4 не работает
        os.environ["SPCONV_ALGO"] = "native"
        if not os.path.isdir(TR):
            sh(f"git clone --depth 1 --recurse-submodules https://github.com/microsoft/TRELLIS {TR}")
        sh("bash -c '. ./setup.sh --basic --xformers --diffoctreerast --spconv --mipgaussian --kaolin --nvdiffrast'", cwd=TR)
        sys.path.insert(0, TR)
        from trellis.pipelines import TrellisImageTo3DPipeline
        from trellis.utils import postprocessing_utils
        tp = TrellisImageTo3DPipeline.from_pretrained("JeffreyXiang/TRELLIS-image-large")
        tp.cuda()
        for p in OSTALOS:
            k = os.path.splitext(os.path.basename(p))[0]
            t = time.time()
            try:
                out = tp.run(Image.open(p), seed=1)
                g = postprocessing_utils.to_glb(out["gaussian"][0], out["mesh"][0], simplify=0.95, texture_size=1024)
                g.export(os.path.join(VYHOD, f"{k}.glb"))
                OTCHET[k].update(model="trellis", trellis_sek=round(time.time() - t), glb=f"{k}.glb")
                GOTOVO.add(k)
                log(k, "TRELLIS готов")
            except Exception as e:
                OTCHET[k]["oshibka_trellis"] = repr(e)[:500]
                log(k, "TRELLIS сбой:", traceback.format_exc()[-1500:])
    except Exception as e:
        log("TRELLIS не встал:", traceback.format_exc()[-1500:])
        for p in OSTALOS:
            OTCHET[os.path.splitext(os.path.basename(p))[0]]["oshibka_trellis"] = "не встал: " + repr(e)[:300]
zapisat_otchet()

# %% Последний запас: форма без текстуры, чтобы глазом решить, стоит ли предмет повтора
for k, m in SETKI.items():
    if k not in GOTOVO:
        m.export(os.path.join(VYHOD, f"{k}.glb"))
        OTCHET[k].update(model="hunyuan3d-2-forma", glb=f"{k}.glb", bez_tekstury=True)
        log(k, "сохранена только форма")
zapisat_otchet()
log("итог:", sum(1 for v in OTCHET.values() if v.get("glb")), "из", len(OTCHET))
