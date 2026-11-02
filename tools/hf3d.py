#!/usr/bin/env python3
"""3D предметов через Spaces Hugging Face (второй путь к tools/kaggle3d.py): фото → glb + снимки с 4 сторон
в /tmp/3d/ДД/. Пробует по очереди tencent/Hunyuan3D-2, tencent/Hunyuan3D-2.1, trellis-community/TRELLIS;
кончилась квота ZeroGPU или Space упал — идёт к следующему.

По умолчанию выключено: без --go только показывает, что будет вызвано. С HF_TOKEN квота ZeroGPU больше
(без токена — ~2 мин GPU в сутки, на один предмет не всегда хватает).

  HF_TOKEN=… python3 tools/hf3d.py /tmp/r559/02/k1.jpg /tmp/r559/11/k1.jpg --go
"""
import argparse
import json
import os
import re
import shutil
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import snimki3d  # noqa: E402

KUDA = Path(os.environ.get("RC3D_KUDA", "/tmp/3d"))
SPACES = ["tencent/Hunyuan3D-2", "tencent/Hunyuan3D-2.1", "trellis-community/TRELLIS"]


def klient(space, token):
    if os.environ.get("HF3D_FAKE"):  # подстановка для проверки без токена и квоты
        return FakeClient(space)
    from gradio_client import Client
    return Client(space, token=token, verbose=False) if token else Client(space, verbose=False)


def vyzov(c, space, foto):
    """Вызов Space → путь к glb (с текстурой, если Space её отдал). Сигнатуры сверены по view_api 02.11.2026."""
    from gradio_client import handle_file
    f = handle_file(str(foto))
    if space == "tencent/Hunyuan3D-2":
        # caption, image, 4 вида, steps, guidance, seed, octree, rembg, chunks, randomize → (белая, с текстурой, html, stats, seed)
        r = c.predict(None, f, None, None, None, None, 30, 5.0, 1234, 256, True, 8000, False, api_name="/generation_all")
        return r[1] or r[0]
    if space == "tencent/Hunyuan3D-2.1":  # то же без caption
        r = c.predict(f, None, None, None, None, 30, 5.0, 1234, 256, True, 8000, False, api_name="/generation_all")
        return r[1] or r[0]
    c.predict(api_name="/start_session")
    img = c.predict(f, api_name="/preprocess_image")
    r = c.predict(handle_file(img), [], 0, 7.5, 12, 3.0, 12, "stochastic", 0.95, 1024,
                  api_name="/generate_and_extract_glb")
    return r[2] if isinstance(r[2], str) else r[1]  # (видео, glb для просмотра, glb для скачивания)


def odin(foto, den, token, spaces):
    foto = Path(foto)
    dd = den or foto.parent.name
    if not re.fullmatch(r"\d\d", dd):
        raise SystemExit(f"{foto}: день не виден из папки — укажите --day ДД")
    zap = {"predmet": f"{dd}_{foto.stem}", "den": dd, "iskhodnik": str(foto), "popytki": []}
    for space in spaces:
        t = time.time()
        try:
            glb = vyzov(klient(space, token), space, foto)
            cel = KUDA / dd / f"{foto.stem}.glb"
            cel.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(glb, cel)
            zap.update(snimki3d.proverit_glb(cel), model=space, sek=round(time.time() - t))
            zap["snimki"] = snimki3d.snimki(cel)
            if not zap["tekstura"] and space != spaces[-1]:
                zap["popytki"].append({space: "без текстуры — пробую следующий"})
                continue
            return zap
        except Exception as e:
            msg = str(e)
            # 02.11.2026: Hunyuan3D-2.1 просит 270 с GPU — больше предела бесплатных, нужен PRO
            vid = "квота" if "ZeroGPU quota" in msg else "нужен PRO" if "larger than the maximum" in msg else "сбой"
            zap["popytki"].append({space: f"{vid}: {msg[:300]}"})
            print(f"  {zap['predmet']}: {space} — {vid}: {msg[:160]}", flush=True)
    return zap


class FakeClient:
    """Отдаёт glb так же, как настоящие Spaces (временный файл), или ошибку квоты — по HF3D_FAKE."""

    def __init__(self, space):
        self.space = space

    def predict(self, *a, api_name=None):
        if api_name in ("/start_session",):
            return None
        if api_name == "/preprocess_image":
            return a[0]["path"]
        if self.space in os.environ.get("HF3D_FAKE", "").split(","):
            raise RuntimeError("You have exceeded your ZeroGPU quota (135s requested vs. 55s left).")
        import tempfile, trimesh
        import numpy as np
        from PIL import Image
        m = trimesh.creation.cylinder(0.4, 1.2)
        uv = (m.vertices[:, :2] - m.vertices[:, :2].min(0)) / (np.ptp(m.vertices[:, :2], 0) + 1e-9)
        m.visual = trimesh.visual.TextureVisuals(uv=uv, image=Image.new("RGB", (32, 32), (30, 140, 60)))
        p = tempfile.mktemp(suffix=".glb")
        m.export(p)
        if self.space.startswith("tencent"):
            return (p.replace(".glb", "_w.glb"), p, "<html>", {}, 1234)
        return ({"video": "x.mp4"}, p, p)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("foto", nargs="+")
    ap.add_argument("--day")
    ap.add_argument("--space", action="append", help="только эти Spaces (можно несколько)")
    ap.add_argument("--go", action="store_true", help="вызвать Spaces (без флага — сухой прогон)")
    a = ap.parse_args()
    token = os.environ.get("HF_TOKEN")
    spaces = a.space or SPACES
    if not a.go:
        print(f"сухой прогон: {len(a.foto)} фото → {' → '.join(spaces)}; HF_TOKEN {'есть' if token else 'нет'}"
              " — для вызова добавьте --go")
        return
    if not token:
        print("HF_TOKEN нет — анонимная квота ZeroGPU, на предмет может не хватить")
    svodka = [odin(f, a.day, token, spaces) for f in a.foto]
    for dd in sorted({z["den"] for z in svodka}):
        (KUDA / dd).mkdir(parents=True, exist_ok=True)
        (KUDA / dd / "otchet_hf.json").write_text(json.dumps(
            [z for z in svodka if z["den"] == dd], ensure_ascii=False, indent=1))
    gotovo = [z for z in svodka if z.get("snimki")]
    print(f"\n{len(gotovo)} из {len(svodka)} предметов — glb и снимки готовы")
    for z in svodka:
        if z.get("snimki"):
            tx = "с текстурой" if z["tekstura"] else "БЕЗ текстуры"
            print(f"  {z['predmet']}: {z['model']} {tx}, {z['granej']} граней → {z['glb']}  обзор: {z['snimki'][-1]}")
        else:
            print(f"  {z['predmet']}: НЕ ВЫШЛО {z['popytki']}")


if __name__ == "__main__":
    main()
