#!/usr/bin/env python3
"""Конвейер «фото → цветная 3D-модель» через платный Tripo API (r561, Р425, Р427).

Запуск:
  python3 tools/tripo3d.py --papka <фото> --vyhod <папка>          # генерация (нужен ключ)
  python3 tools/tripo3d.py --papka <фото> --vyhod <папка> --dry    # план и цена, ничего не тратит
  python3 tools/tripo3d.py --tolko-obrabotka <папка glb> --vyhod <папка> [--foto <фото>]

Ключ: переменная TRIPO_API_KEY или файл ~/.config/tripo/key (права 600). Нет ключа — выходит, ничего не тратит.
API — https://developers.tripo3d.ai (v3): POST /files, POST /generation/image-to-model, GET /tasks/{id},
GET /account/balance. Цена: 1 кредит = $0,01, модель по фото с текстурой — 30 кредитов (developers.tripo3d.ai/en/pricing).
После скачивания машинно: сжатие ≤3 МБ (meshopt + webp, gltf-transform), снимки с 4 сторон, лист «фото | модель»,
отметка «узнаваемо/нет» по похожести снимков на фото (CLIP ViT-B/32, onnxruntime, без root).
Журнал vyhod/zhurnal.json: повторный запуск не платит второй раз за готовое и дожидается начатых задач.
Откат: удалить этот файл.
"""
import argparse, hashlib, http.server, io, json, os, shutil, socketserver, stat, subprocess, sys, threading, time
from pathlib import Path

API = os.environ.get('TRIPO_API_BASE', 'https://openapi.tripo3d.ai/v3')  # подмена — только для проверки на подставном сервере
KEY_FILE = Path.home() / '.config/tripo/key'
CACHE = Path.home() / '.cache/rc-tripo'
CLIP_URL = 'https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/main/onnx/vision_model_quantized.onnx'
THREE = 'three@0.182.0'
GLTF_TRANSFORM = '@gltf-transform/cli@4'
FONT = '/home/agent/projects/agent-env/libs/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FOTO_EXT = {'.jpg', '.jpeg', '.png', '.webp'}
STORONY = [(0, 'pered'), (90, 'pravo'), (180, 'zad'), (270, 'levo')]
# Порог похожести снимка на фото (косинус CLIP). Подобран r561 на 8 моделях с оценкой глазом (r552 Hunyuan серые, r557 Р-7
# цветная): при 0.75 машина совпала с глазом в 6 из 8, ложных «узнаваемо» 0, серые Луна-1 и вагон машина не признала —
# она строже глаза. Окончательно решает глаз по листу.
POROG = 0.75


def say(*a):
    print(*a, flush=True)


# ───────────────────────── ключ и цена ─────────────────────────

def read_key():
    k = os.environ.get('TRIPO_API_KEY', '').strip()
    if k:
        return k, 'переменная TRIPO_API_KEY'
    if KEY_FILE.exists():
        mode = KEY_FILE.stat().st_mode
        if mode & (stat.S_IRWXG | stat.S_IRWXO):
            say(f'Файл ключа {KEY_FILE} открыт другим (права {oct(mode & 0o777)}). Нужно: chmod 600 {KEY_FILE}. Ключ не читаю.')
            return None, None
        k = KEY_FILE.read_text().strip()
        if k:
            return k, f'файл {KEY_FILE}'
    return None, None


def cena(a):
    """Кредиты за одну модель по таблице developers.tripo3d.ai/en/pricing (сверено 02.11.2026)."""
    c = 30 if a.texture else 20
    c += {'detailed': 10, 'extreme': 20}.get(a.texture_quality, 0)
    if a.geometry_quality == 'detailed':
        c += 20
    return c


# ───────────────────────── входные фото ─────────────────────────

def najti_foto(papka, vse):
    """Плоская папка с фото → каждое фото. Папка дней r559 (NN/kandidaty.json) → лучший кандидат дня (или все с --vse)."""
    papka = Path(papka)
    out = []
    dni = any((p / 'kandidaty.json').exists() for p in papka.iterdir() if p.is_dir())
    for f in sorted(papka.iterdir()):
        if not dni and f.is_file() and f.suffix.lower() in FOTO_EXT and not f.name.startswith('_'):
            out.append({'imya': f.stem, 'foto': str(f), 'predmet': ''})
    for d in sorted(p for p in papka.iterdir() if p.is_dir() and (p / 'kandidaty.json').exists()):
        j = json.loads((d / 'kandidaty.json').read_text())
        kand = [k for k in j.get('kandidaty', []) if k.get('file') and Path(k['file']).exists()]
        if not kand:  # пути в json могли устареть — берём файлы k*.jpg рядом
            kand = [{'file': str(f), 'name': ''} for f in sorted(d.glob('k*.jpg'))]
        kand.sort(key=lambda k: -float(k.get('score') or 0))
        for i, k in enumerate(kand if vse else kand[:1]):
            out.append({'imya': f'{d.name}-k{i + 1}' if vse else d.name, 'foto': k['file'],
                        'predmet': j.get('predmet', ''), 'nazvanie': k.get('name', ''), 'kartochka': k.get('card', '')})
    return out


def podgotovit_foto(src, papka, imya):
    """Tripo принимает JPEG/PNG до 20 МБ; крупное и прочее пережимаем в JPEG со стороной ≤2048."""
    from PIL import Image
    im = Image.open(src)
    ok = Path(src).suffix.lower() in {'.jpg', '.jpeg', '.png'} and Path(src).stat().st_size < 20e6 and max(im.size) <= 4096
    if ok:
        dst = papka / (imya + Path(src).suffix.lower())
        shutil.copy(src, dst)
        return dst, im.size, 'как есть'
    dst = papka / (imya + '.jpg')
    im = im.convert('RGB')
    im.thumbnail((2048, 2048))
    im.save(dst, 'JPEG', quality=92)
    return dst, im.size, 'пережато в JPEG ≤2048'


# ───────────────────────── Tripo API ─────────────────────────

class Tripo:
    def __init__(self, key):
        import requests
        self.s = requests.Session()
        self.s.headers['Authorization'] = f'Bearer {key}'

    def _call(self, method, path, retry=True, **kw):
        for popytka in range(6):
            r = self.s.request(method, API + path, timeout=kw.pop('timeout', 60), **kw)
            try:
                j = r.json()
            except ValueError:
                j = {'code': -1, 'message': r.text[:200]}
            if r.status_code == 429 and retry:  # 1007 частота, 2000 параллельность — отказ, не списание
                wait = int(r.headers.get('Retry-After') or 0) or min(60, 5 * 2 ** popytka)
                say(f'  Tripo просит подождать ({j.get("code")}): {wait} с')
                time.sleep(wait)
                continue
            if j.get('code') != 0:
                raise TripoError(j.get('code'), j.get('message'), r.status_code)
            return j['data']
        raise TripoError(429, 'лимит частоты не отпустил за 6 попыток', 429)

    def balans(self):
        return self._call('GET', '/account/balance')

    def zagruzit(self, path):
        with open(path, 'rb') as f:
            return self._call('POST', '/files', files={'file': (Path(path).name, f)}, timeout=180)['file_token']

    def sozdat(self, telo):
        # Повтор только на явный отказ 429; на обрыв связи не повторяем — задача могла создаться и списать кредиты.
        return self._call('POST', '/generation/image-to-model', json=telo)['task_id']

    def zadacha(self, tid):
        return self._call('GET', f'/tasks/{tid}')


class TripoError(Exception):
    def __init__(self, code, msg, http):
        super().__init__(f'Tripo {code} (HTTP {http}): {msg}')
        self.code = code


def skachat(url, dst):
    import requests
    with requests.get(url, stream=True, timeout=300) as r:
        r.raise_for_status()
        with open(dst, 'wb') as f:
            for ch in r.iter_content(1 << 16):
                f.write(ch)


# ───────────────────────── обработка glb ─────────────────────────

def npx(*args, timeout=600):
    return subprocess.run(['npx', '-y', *args], capture_output=True, text=True, timeout=timeout)


def szhat(src, dst, max_mb):
    """meshopt (meshoptimizer) + webp. Лесенка: текстура 2048 → 1024 → упрощение сетки, пока файл не станет ≤ max_mb."""
    lesenka = [(2048, None), (1024, None), (1024, 0.5), (1024, 0.25), (512, 0.1)]
    for tex, simp in lesenka:
        cmd = [GLTF_TRANSFORM, 'optimize', str(src), str(dst), '--compress', 'meshopt',
               '--texture-compress', 'webp', '--texture-size', str(tex)]
        cmd += ['--simplify', 'false'] if simp is None else ['--simplify', 'true', '--simplify-ratio', str(simp), '--simplify-error', '0.01']
        r = npx(*cmd)
        if r.returncode != 0:
            return {'oshibka': (r.stderr or r.stdout)[-400:]}
        mb = dst.stat().st_size / 1e6
        if mb <= max_mb:
            return {'mb': round(mb, 3), 'tekstura': tex, 'uproshchenie': simp or 'нет'}
    return {'mb': round(mb, 3), 'tekstura': tex, 'uproshchenie': simp, 'oshibka': f'не влезло в {max_mb} МБ'}


STAND = """<!doctype html><html><body style="margin:0;background:#fff">
<script type="importmap">{"imports":{"three":"./three/build/three.module.js","three/addons/":"./three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const W=512,H=512;
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(W,H);r.setClearColor(0xffffff,1);
r.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(r.domElement);
const cam=new THREE.PerspectiveCamera(30,W/H,0.01,1000);
const L=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
window.load=async(url)=>{
  const s=new THREE.Scene();s.add(new THREE.HemisphereLight(0xffffff,0x888888,2.2));
  const d=new THREE.DirectionalLight(0xffffff,1.6);s.add(d);
  const o=(await L.loadAsync(url)).scene;
  const box=new THREE.Box3().setFromObject(o),c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3());
  o.position.sub(c);s.add(o);
  let tris=0;o.traverse(m=>{if(m.isMesh)tris+=(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3});
  const R=Math.max(sz.x,sz.y,sz.z)*2.1;
  window.shot=(az)=>{const a=az*Math.PI/180;cam.position.set(Math.sin(a)*R,R*0.12,Math.cos(a)*R);
    d.position.set(Math.sin(a+0.6)*5*R,4*R,Math.cos(a+0.6)*5*R);cam.lookAt(0,0,0);r.render(s,cam);return r.domElement.toDataURL('image/png')};
  return {tris:Math.round(tris),razmer:[sz.x,sz.y,sz.z]};
};
window.ready=true;
</script></body></html>"""


def tri_js():
    d = CACHE / 'node_modules/three'
    if not (d / 'build/three.module.js').exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        say(f'  ставлю {THREE} в {CACHE} (один раз)')
        subprocess.run(['npm', 'install', '--prefix', str(CACHE), '--no-save', '--no-audit', '--no-fund', THREE],
                       check=True, capture_output=True, timeout=600)
    return d


class Stend:
    """Свой http-сервер на свободном порту + headless Chromium (swiftshader). Закрывается сам в close()."""

    def __init__(self, root):
        root.mkdir(parents=True, exist_ok=True)
        (root / 'index.html').write_text(STAND)
        if not (root / 'three').exists():
            (root / 'three').symlink_to(tri_js())
        h = lambda *a, **k: http.server.SimpleHTTPRequestHandler(*a, directory=str(root), **k)
        http.server.SimpleHTTPRequestHandler.log_message = lambda *a: None
        self.srv = socketserver.TCPServer(('127.0.0.1', 0), h)
        self.port = self.srv.server_address[1]
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self.root = root
        from playwright.sync_api import sync_playwright
        self.pw = sync_playwright().start()
        self.b = self.pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        self.p = self.b.new_page()
        self.oshibki = []
        self.p.on('pageerror', lambda e: self.oshibki.append(str(e)))
        self.p.goto(f'http://127.0.0.1:{self.port}/index.html')
        self.p.wait_for_function('window.ready', timeout=60000)

    def snyat(self, glb, out_dir, imya):
        import base64
        tmp = self.root / 'm.glb'
        shutil.copy(glb, tmp)
        info = self.p.evaluate(f"window.load('m.glb?{time.time()}')")
        files = []
        for az, st in STORONY:
            u = self.p.evaluate(f'window.shot({az})')
            f = out_dir / f'{imya}-{st}.png'
            f.write_bytes(base64.b64decode(u.split(',')[1]))
            files.append(str(f))
        return info, files

    def close(self):
        self.b.close(); self.pw.stop(); self.srv.shutdown(); self.srv.server_close()


class Clip:
    MEAN = (0.48145466, 0.4578275, 0.40821073)
    STD = (0.26862954, 0.26130258, 0.27577711)

    def __init__(self):
        import onnxruntime as ort
        f = CACHE / 'clip/vision_model_quantized.onnx'
        if not f.exists():
            f.parent.mkdir(parents=True, exist_ok=True)
            say('  скачиваю CLIP ViT-B/32 (ONNX, 89 МБ, один раз)')
            skachat(CLIP_URL, f.with_suffix('.part'))
            f.with_suffix('.part').rename(f)
        self.s = ort.InferenceSession(str(f), providers=['CPUExecutionProvider'])
        outs = [o.name for o in self.s.get_outputs()]
        self.out = 'image_embeds' if 'image_embeds' in outs else outs[0]

    def vektor(self, path):
        import numpy as np
        from PIL import Image
        im = Image.open(path).convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im); im = bg.convert('RGB')
        w, h = im.size; k = 224 / min(w, h)
        im = im.resize((max(224, round(w * k)), max(224, round(h * k))), Image.BICUBIC)
        w, h = im.size; l, t = (w - 224) // 2, (h - 224) // 2
        x = (np.asarray(im.crop((l, t, l + 224, t + 224)), dtype=np.float32) / 255 - self.MEAN) / self.STD
        v = self.s.run([self.out], {self.s.get_inputs()[0].name: x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0]
        return v / np.linalg.norm(v)

    def pohozhest(self, foto_list, snimki):
        sn = [self.vektor(s) for s in snimki]
        best = (-1, None)
        for f in foto_list:
            fv = self.vektor(f)
            s = max(float(fv @ v) for v in sn)
            best = max(best, (s, f))
        return round(best[0], 3), best[1]


def list_glaz(stroki, dst):
    """Лист «фото | 4 снимка» — по строке на модель, подпись: имя, вес, треугольники, похожесть, отметка."""
    from PIL import Image, ImageDraw, ImageFont
    S, T = 256, 64
    sheet = Image.new('RGB', (S * 5, (S + T) * len(stroki)), 'white')
    dr = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype(FONT, 18)
    except OSError:
        font = ImageFont.load_default()
    for i, s in enumerate(stroki):
        y = i * (S + T)
        kart = [s.get('foto')] + s.get('snimki', [])
        for j, f in enumerate(kart):
            if f and Path(f).exists():
                im = Image.open(f).convert('RGB'); im.thumbnail((S, S))
                sheet.paste(im, (j * S + (S - im.width) // 2, y + (S - im.height) // 2))
            elif j == 0:
                dr.text((10, y + S // 2), 'фото нет', fill='gray', font=font)
        p = s.get('pohozhest')
        metka = s.get('uznavaemo')
        txt = f"{s['imya']}  {s.get('predmet', '')[:40]}  |  {s.get('szhatie', {}).get('mb', '?')} МБ, {s.get('tris', '?')} тр."
        txt2 = 'похожесть: нет фото' if p is None else f"похожесть {p:.2f} (порог {s['porog']:.2f}) — {'УЗНАВАЕМО' if metka else 'НЕТ'}"
        dr.text((8, y + S + 6), txt, fill='black', font=font)
        dr.text((8, y + S + 32), txt2, fill=('darkgreen' if metka else 'darkred') if p is not None else 'gray', font=font)
        dr.line((0, y + S + T - 1, S * 5, y + S + T - 1), fill='#ccc')
    sheet.save(dst, quality=88)


def foto_dlya(glb, foto_papka):
    """Фото к модели: то же имя, иначе тот же первый кусок имени (день «02-…»)."""
    if not foto_papka:
        return []
    fotos = [f for f in Path(foto_papka).rglob('*') if f.suffix.lower() in FOTO_EXT]
    st = Path(glb).stem
    same = [f for f in fotos if f.stem == st or (f.parent.name == st and f.stem.startswith('k'))]
    if same:
        return [str(f) for f in same]
    key = st.replace('_', '-').split('-')[0]
    return [str(f) for f in fotos if f.stem.replace('_', '-').split('-')[0] == key or f.parent.name == key]


def obrabotka(modeli, vyhod, a):
    """modeli: [{'imya', 'glb', 'foto'(список), ...}] → сжатие, снимки, похожесть, лист, отчёт."""
    for d in ('szhato', 'snimki'):
        (vyhod / d).mkdir(parents=True, exist_ok=True)
    stend, clip, stroki = None, None, []
    try:
        stend = Stend(vyhod / '.stend')
        for m in modeli:
            say(f"• {m['imya']}: сжатие…")
            r = dict(m)
            dst = vyhod / 'szhato' / f"{m['imya']}.glb"
            r['ishodnik_mb'] = round(Path(m['glb']).stat().st_size / 1e6, 3)
            r['szhatie'] = szhat(Path(m['glb']), dst, a.max_mb)
            src = dst if 'oshibka' not in r['szhatie'] or dst.exists() else Path(m['glb'])
            n0 = len(stend.oshibki)
            info, r['snimki'] = stend.snyat(src, vyhod / 'snimki', m['imya'])
            r['tris'] = info['tris']
            if len(stend.oshibki) > n0:
                r['oshibki_stenda'] = stend.oshibki[n0:]
            fl = m.get('foto') or []
            if isinstance(fl, str):
                fl = [fl]
            if fl:
                clip = clip or Clip()
                r['pohozhest'], r['foto'] = clip.pohozhest(fl, r['snimki'])
                r['uznavaemo'] = r['pohozhest'] >= a.porog
            else:
                r['foto'], r['pohozhest'], r['uznavaemo'] = None, None, None
            r['porog'] = a.porog
            say(f"  {r['ishodnik_mb']} → {r['szhatie'].get('mb')} МБ, {r['tris']} тр., похожесть {r['pohozhest']} → "
                f"{'узнаваемо' if r['uznavaemo'] else ('нет фото' if r['uznavaemo'] is None else 'нет')}")
            stroki.append(r)
    finally:
        if stend:
            stend.close()
        shutil.rmtree(vyhod / '.stend', ignore_errors=True)
    if stroki:
        list_glaz(stroki, vyhod / 'list-foto-model.jpg')
    (vyhod / 'otchet.json').write_text(json.dumps(stroki, ensure_ascii=False, indent=1))
    s_foto = [r for r in stroki if r['uznavaemo'] is not None]
    uzn = sum(1 for r in s_foto if r['uznavaemo'])
    vlezlo = sum(1 for r in stroki if 'oshibka' not in r['szhatie'])
    say(f'Узнаваемо {uzn} из {len(s_foto)} (с фото); ≤{a.max_mb} МБ: {vlezlo} из {len(stroki)}. '
        f'Лист: {vyhod / "list-foto-model.jpg"}, отчёт: {vyhod / "otchet.json"}')
    return stroki


# ───────────────────────── генерация ─────────────────────────

def telo_zadachi(token, a):
    t = {'input': token, 'model': a.model, 'texture': a.texture, 'pbr': a.pbr and a.texture,
         'texture_quality': a.texture_quality, 'texture_alignment': 'original_image'}
    if a.geometry_quality != 'standard':
        t['geometry_quality'] = a.geometry_quality
    if a.face_limit:
        t['face_limit'] = a.face_limit
    return t


def generaciya(a, vyhod):
    items = najti_foto(a.papka, a.vse)
    if not items:
        say(f'В {a.papka} нет фото (.jpg/.png/.webp или папок дней с kandidaty.json).')
        return 0
    zh_path = vyhod / 'zhurnal.json'
    zh = json.loads(zh_path.read_text()) if zh_path.exists() else {}
    c1 = cena(a)
    gotovo = [i for i in items if zh.get(i['imya'], {}).get('glb') and Path(zh[i['imya']]['glb']).exists()]
    nado = [i for i in items if i not in gotovo]
    novye = [i for i in nado if not zh.get(i['imya'], {}).get('task_id') or zh[i['imya']].get('status') in ('failed', 'cancelled')]
    v_rabote = [i for i in nado if i not in novye]
    plan = novye[:a.limit]
    key, otkuda = read_key()

    say(f"План: фото {len(items)}, уже готово {len(gotovo)}, ждут начатые {len(v_rabote)}, новых задач {len(plan)}"
        f" (потолок {a.limit}){'; не влезло в потолок: ' + str(len(novye) - len(plan)) if len(novye) > len(plan) else ''}")
    say(f'Параметры: {json.dumps(telo_zadachi("<file_token>", a), ensure_ascii=False)}')
    for i in plan:
        from PIL import Image
        w, h = Image.open(i['foto']).size
        say(f"  {i['imya']:<10} {Path(i['foto']).name:<40} {w}×{h}  {i.get('predmet', '')[:50]}  — {c1} кр.")
    vsego = c1 * len(plan)
    say(f'Цена: {c1} кр. × {len(plan)} = {vsego} кр. = ${vsego / 100:.2f} (1 кр. = $0,01; неудачные задачи не списываются).')

    if a.dry:
        if key:
            try:
                b = Tripo(key).balans()
                say(f"Баланс Tripo ({otkuda}): {b['balance']} кр., заморожено {b['frozen']}; хватит на {int(b['balance'] // c1)} моделей.")
            except Exception as e:
                say(f'Баланс не прочитан: {e}')
        else:
            say('Ключа нет — баланс не спрашивал.')
        say('Сухой режим: ничего не загружено, кредиты не тронуты.')
        return 0
    if not key:
        say(f'Ключа Tripo нет (TRIPO_API_KEY или {KEY_FILE} с правами 600) — ничего не делал, кредиты не тронуты.')
        return 0

    t = Tripo(key)
    b0 = t.balans()
    say(f"Баланс до: {b0['balance']} кр. (заморожено {b0['frozen']}), ключ — {otkuda}")
    if b0['balance'] < vsego:
        plan = plan[:int(b0['balance'] // c1)]
        say(f'Баланса хватает только на {len(plan)} новых моделей — урезаю план.')
    (vyhod / 'foto').mkdir(parents=True, exist_ok=True)
    (vyhod / 'glb').mkdir(parents=True, exist_ok=True)

    def save():
        zh_path.write_text(json.dumps(zh, ensure_ascii=False, indent=1))

    # 1) создаём задачи по одной
    for i in plan:
        z = zh.setdefault(i['imya'], {})
        z.update({k: i[k] for k in ('foto', 'predmet') if k in i})
        try:
            pf, size, kak = podgotovit_foto(i['foto'], vyhod / 'foto', i['imya'])
            z['file_token'] = t.zagruzit(pf)
            z['task_id'] = t.sozdat(telo_zadachi(z['file_token'], a))
            z['status'] = 'queued'; z['sozdano'] = time.strftime('%Y-%m-%d %H:%M:%S')
            say(f"  {i['imya']}: задача {z['task_id']} ({kak})")
        except TripoError as e:
            z['status'] = 'oshibka'; z['oshibka'] = str(e)
            say(f"  {i['imya']}: {e}")
            if e.code in (2010, 2, 1002, 403):  # нет кредитов / ключ не тот — дальше не идём
                save(); break
        except Exception as e:  # обрыв связи: задача могла создаться — не повторяем, разбирать по журналу
            z['status'] = 'neyasno'; z['oshibka'] = repr(e)[:300]
            say(f"  {i['imya']}: обрыв ({e!r}); повторно не создаю — проверьте баланс")
        save()
        time.sleep(1)

    # 2) ждём все начатые, качаем glb
    zhdat = [n for n, z in zh.items() if not n.startswith('_') and z.get('task_id') and z.get('status') in ('queued', 'running', 'unknown')]
    srok = time.time() + a.zhdat_min * 60
    while zhdat and time.time() < srok:
        for n in list(zhdat):
            z = zh[n]
            try:
                d = t.zadacha(z['task_id'])
            except Exception as e:
                say(f'  {n}: опрос не прошёл ({e}), повторю'); continue
            z['status'] = d.get('status'); z['progress'] = d.get('progress')
            if d['status'] == 'success':
                out = d.get('output') or {}
                url = out.get('pbr_model_url') or out.get('model_url') or next((v for v in out.values() if isinstance(v, str) and '.glb' in v), None)
                z['credits'] = d.get('credits_consumed')
                glb = vyhod / 'glb' / f'{n}.glb'
                skachat(url, glb); z['glb'] = str(glb)
                if out.get('rendered_image_url'):
                    try:
                        skachat(out['rendered_image_url'], vyhod / 'glb' / f'{n}-tripo-prevyu.png')
                    except Exception:
                        pass
                say(f"  {n}: готово, {glb.stat().st_size / 1e6:.2f} МБ, списано {z['credits']} кр.")
                zhdat.remove(n)
                if z['credits'] and z['credits'] > c1 * 1.5:
                    say(f'  ВНИМАНИЕ: списано {z["credits"]} кр. вместо {c1} — цена выше документации.')
            elif d['status'] in ('failed', 'cancelled', 'banned', 'expired'):
                z['oshibka'] = f"{d.get('error_code')}: {d.get('error_message')}"
                say(f"  {n}: {d['status']} ({z['oshibka']}) — не списано"); zhdat.remove(n)
            save()
        if zhdat:
            time.sleep(3)
    if zhdat:
        say(f'Не дождался {len(zhdat)} задач за {a.zhdat_min} мин — повторный запуск той же командой их докачает, платить второй раз не придётся.')
    b1 = t.balans()
    potracheno = round(b0['balance'] - b1['balance'], 2)
    zh['_rashod'] = zh.get('_rashod', []) + [{'kogda': time.strftime('%Y-%m-%d %H:%M:%S'), 'do': b0['balance'],
                                              'posle': b1['balance'], 'zamorozheno': b1['frozen'], 'potracheno': potracheno}]
    save()
    say(f"Баланс после: {b1['balance']} кр. (заморожено {b1['frozen']}); за запуск ушло {potracheno} кр. = ${potracheno / 100:.2f}")

    modeli = [{'imya': n, 'glb': z['glb'], 'foto': z.get('foto'), 'predmet': z.get('predmet', '')}
              for n, z in zh.items() if not n.startswith('_') and z.get('glb') and Path(z['glb']).exists()]
    if modeli:
        obrabotka(modeli, vyhod, a)
    return 0


def main():
    ap = argparse.ArgumentParser(description='Фото → цветная 3D-модель через Tripo API, потом сжатие, снимки, лист, похожесть.')
    ap.add_argument('--papka', help='папка с фото (или папка дней r559 с kandidaty.json)')
    ap.add_argument('--tolko-obrabotka', metavar='PAPKA_GLB', help='только обработать готовые .glb (без ключа, без трат)')
    ap.add_argument('--foto', help='фото к готовым glb для похожести (то же имя или тот же день «02-…»)')
    ap.add_argument('--vyhod', required=True)
    ap.add_argument('--dry', action='store_true', help='напечатать план и цену, ничего не тратить')
    ap.add_argument('--limit', type=int, default=10, help='потолок новых моделей за запуск (10)')
    ap.add_argument('--vse', action='store_true', help='все кандидаты дня, а не только лучший')
    ap.add_argument('--model', default='v3.1-20260211', help='v3.1-20260211 | v3.0-20250812 | P1-20260311 | P2-20260801')
    ap.add_argument('--texture-quality', default='standard', choices=['standard', 'detailed', 'extreme'])
    ap.add_argument('--geometry-quality', default='standard', choices=['standard', 'detailed'])
    ap.add_argument('--no-texture', dest='texture', action='store_false')
    ap.add_argument('--no-pbr', dest='pbr', action='store_false')
    ap.add_argument('--face-limit', type=int, default=50000, help='потолок граней (веб: 10–50 тыс.); 0 — как решит Tripo')
    ap.add_argument('--max-mb', type=float, default=3.0)
    ap.add_argument('--porog', type=float, default=POROG)
    ap.add_argument('--zhdat-min', type=int, default=20)
    a = ap.parse_args()
    vyhod = Path(a.vyhod).expanduser(); vyhod.mkdir(parents=True, exist_ok=True)
    if a.tolko_obrabotka:
        glbs = sorted(Path(a.tolko_obrabotka).expanduser().glob('*.glb'))
        if not glbs:
            say(f'В {a.tolko_obrabotka} нет .glb'); return 0
        modeli = [{'imya': g.stem, 'glb': str(g), 'foto': foto_dlya(g, a.foto)} for g in glbs]
        obrabotka(modeli, vyhod, a)
        return 0
    if not a.papka:
        ap.error('нужна --papka <фото> или --tolko-obrabotka <папка glb>')
    if a.model.startswith('P'):
        say('Цена P-серии в документации отдельно не дана — считаю как H (30 кр.), настоящую покажет журнал.')
    try:
        return generaciya(a, vyhod)
    except TripoError as e:  # неверный ключ, нет кредитов и т. п. — понятной строкой, без трассировки
        say(f'Остановился: {e}. Журнал: {vyhod / "zhurnal.json"}')
        return 1


if __name__ == '__main__':
    sys.exit(main())
