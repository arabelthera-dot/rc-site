#!/usr/bin/env python3
"""Судья «вау по кадру» для 3D-игр дня (Р429, Р432; сценарий r571). Выключен: в CI не стоит, код выхода всегда 0,
пока в tools/vau-sudya/pravila.json "vklyuchen": false.

Что делает с одной сценой:
 1. Снимает её в Playwright с 4 сторон (поворот мышью на 90°, как пальцем) на обычном экране 1280×720
    и отдельно на слабом телефоне (390×844, процессор ×4, сеть 1,6 Мбит/с).
 2. Проверяет машиной:
    • модель не плоская — по 4 сторонам меняется силуэт и есть светотень; сцена вообще поворачивается;
    • не ядовитый цвет — доля кислотно-зелёных/малиновых/неоново-голубых пикселей в модели;
    • 3D готова < 8 с от открытия (на обычном экране);
    • ≥ 30 кадров/с на обычном экране (программный рендер сервера — жёлтый, мерить на железе: r571, 21–22 к/с);
    • 2D-запас включается без WebGL (Chromium --disable-webgl): видна ссылка/блок «без 3D», ведущий к рабочей игре;
    • текст не поверх картинки — ни одной надписи на холсте сцены.
 3. Оценка вау моделью: лист из 4 сторон + телефон и образец-эталон r567 (etalon/r567-obzor.jpg) отдаются
    claude -p вслепую (без названия и без чужих оценок); ответ — балл 0–10 и «вау/не вау».
 Итог «ВАУ» = все машинные замки не красные + модель сказала «вау».

Запуск:
  python3 tools/vau-sudya.py --url https://russian-civilization.ru/muzei/izobreteniya/den/01-12/ --imya 01-12
  python3 tools/vau-sudya.py --glb /путь/model.glb --imya podlodka      # голая модель: страницы нет, 2D/текст не проверяются
  … --bez-modeli          только машинные замки (без claude -p)
  … --start '#r3Run'      кнопка запуска 3D (по умолчанию — первая кнопка внутри [data-igra] со словом «Играть»)
  … --stage '#r3Stage'    блок сцены (по умолчанию [data-igra-scena])
Отчёт: tools/vau-sudya/vyhod/<imya>/otchet.json и list.png.
"""
import argparse, colorsys, json, os, shutil, socket, subprocess, sys, tempfile, time
from pathlib import Path

import numpy as np
from PIL import Image

TUT = Path(__file__).resolve().parent / 'vau-sudya'
P = json.loads((TUT / 'pravila.json').read_text())
HOME = os.path.expanduser('~')
LD = ':'.join(x for x in [os.environ.get('LD_LIBRARY_PATH', ''), f'{HOME}/opt/libs/usr/lib/x86_64-linux-gnu', f'{HOME}/opt/libs/lib/x86_64-linux-gnu',
                          f'{HOME}/opt/root/usr/lib/x86_64-linux-gnu', f'{HOME}/opt/root/lib/x86_64-linux-gnu'] if x)
ENV = dict(os.environ, LD_LIBRARY_PATH=LD, PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS='1')
if os.path.isfile(f'{HOME}/opt/fonts.conf'):
    ENV.setdefault('FONTCONFIG_FILE', f'{HOME}/opt/fonts.conf')
if not ENV.get('PW_FROM') and os.path.isdir(f'{HOME}/tools/shot/node_modules/playwright'):
    ENV['PW_FROM'] = f'{HOME}/tools/shot/x.js'


def three_papka():
    """three для просмотрщика .glb: из node_modules сайта, иначе из кэша конвейера моделей."""
    for c in [Path(__file__).resolve().parent.parent / 'node_modules/three', Path(HOME) / '.cache/rc-tripo/node_modules/three']:
        if (c / 'build/three.module.js').is_file():
            return c
    sys.exit('нет three: ни node_modules/three, ни ~/.cache/rc-tripo/node_modules/three')


def bot(a, rezhim, out):
    out.mkdir(parents=True, exist_ok=True)
    vs = dict(url=a['url'], start=a.get('start'), stage=a.get('stage'), glb=a['glb'], rezhim=rezhim, out=str(out))
    r = subprocess.run(['node', str(TUT / 'bot.mjs')], env=dict(ENV, VS=json.dumps(vs)), capture_output=True, text=True, timeout=600)
    try:
        return json.loads((out / 'bot.json').read_text())
    except Exception:
        return {'oshibki': ['бот упал: ' + (r.stderr or r.stdout)[-400:]], 'kadry': [], 'vremya': {}}


# ── Разбор снимков ──
def maska(img):
    """Предмет = пиксели, заметно отличающиеся от фона своей строки (фон — медиана 4 % слева и справа: градиенты не мешают)."""
    a = np.asarray(img.convert('RGB')).astype(np.int16)
    k = max(2, a.shape[1] // 25)
    fon = np.median(np.concatenate([a[:, :k], a[:, -k:]], 1), 1)[:, None, :]
    return np.abs(a - fon).sum(2) > P['ploskaya']['porog_fona'], a


def razbor(papka):
    st = [papka / f'{n}.png' for n in ('1-pered', '2-bok', '3-zad', '4-bok2')]
    st = [f for f in st if f.is_file()]
    if len(st) < 4:
        return None
    M, A = zip(*[maska(Image.open(f)) for f in st])
    ploshchadi = [float(m.mean()) for m in M]
    # Светотень: разброс яркости внутри предмета (заливка одним цветом даёт ~0).
    yark = [float((a[m] @ np.array([0.299, 0.587, 0.114])).std()) if m.sum() > 100 else 0.0 for m, a in zip(M, A)]
    # Поворачивается ли: средняя разница соседних сторон.
    raz = [float(np.abs(A[i] - A[i + 1]).mean()) for i in range(3)]
    # Ядовитый цвет: доля пикселей предмета с высокой насыщенностью и яркостью в кислотных тонах.
    yad = []
    for m, a in zip(M, A):
        px = a[m][:: max(1, int(m.sum()) // 20000)] / 255.0
        n = 0
        for r_, g_, b_ in px:
            h, s, v = colorsys.rgb_to_hsv(r_, g_, b_)
            if s >= P['yad']['s'] and v >= P['yad']['v'] and any(lo <= h * 360 <= hi for lo, hi in P['yad']['tona']):
                n += 1
        yad.append(n / max(1, len(px)))
    return dict(ploshchadi=ploshchadi, svetoten=yark, raznica_storon=raz, yad=yad)


def zamki(pk, tel, bw, rz, glb):
    Z = []
    def z(imya, cvet, tekst):
        Z.append({'zamok': imya, 'cvet': cvet, 'tekst': tekst})
    if rz is None:
        z('не плоская', 'red', 'нет 4 снимков: ' + '; '.join(pk.get('oshibki', [])[:3]))
    else:
        mn, mx = min(rz['ploshchadi']), max(rz['ploshchadi'])
        ot = mn / mx if mx else 0
        sv = min(rz['svetoten'])
        pov = max(rz['raznica_storon'])
        ok = ot >= P['ploskaya']['silhuet_min'] and sv >= P['ploskaya']['svetoten_min'] and pov >= P['ploskaya']['povorot_min']
        z('не плоская', 'green' if ok else 'red',
          f'силуэт меньший/больший {ot:.2f} (≥{P["ploskaya"]["silhuet_min"]}), светотень {sv:.0f} (≥{P["ploskaya"]["svetoten_min"]}), '
          f'разница сторон {pov:.1f} (≥{P["ploskaya"]["povorot_min"]}{"" if pov >= P["ploskaya"]["povorot_min"] else " — сцена не поворачивается"})')
        y = max(rz['yad'])
        z('не ядовитый цвет', 'green' if y <= P['yad']['dolya_max'] else 'red', f'кислотных пикселей в предмете {y * 100:.1f} % (≤{P["yad"]["dolya_max"] * 100:.0f} %)')
    t = pk.get('vremya', {}).get('do_3d')
    z('загрузка < 8 с', 'red' if t is None or t >= P['zagruzka_s'] else 'green', f'3D готова за {t:.1f} с' if t else '3D не дождались')
    f, rend = pk.get('fps'), pk.get('render') or ''
    prog = 'SwiftShader' in rend or 'llvmpipe' in rend
    if f is None:
        z('≥ 30 к/с', 'red', 'не мерено')
    elif f >= P['fps']['min']:
        z('≥ 30 к/с', 'green', f'{f} к/с')
    elif prog and f >= P['fps']['min_programmno']:
        z('≥ 30 к/с', 'yellow', f'{f} к/с в программном рендере сервера (≥{P["fps"]["min_programmno"]}) — 30 к/с мерить на железе')
    else:
        z('≥ 30 к/с', 'red', f'{f} к/с ({"программный рендер" if prog else rend})')
    tt = tel.get('vremya', {}).get('do_3d')
    z('слабый телефон', 'green' if tt and tt < P['telefon_zagruzka_s'] else 'yellow',
      f'3D за {tt:.1f} с, {tel.get("fps")} к/с (процессор ×4, сеть 1,6 Мбит/с)' if tt else 'на слабом телефоне 3D не открылась: ' + '; '.join(tel.get('oshibki', [])[:2]))
    if glb:
        z('2D-запас без WebGL', 'grey', 'голая модель — страницы нет, не проверялось')
        z('текст не поверх', 'grey', 'голая модель — страницы нет, не проверялось')
    else:
        zp = bw.get('zapas') or {}
        ok = zp.get('webgl', 1) == 0 and (zp.get('cel_rabochaya') or zp.get('risunok_v_scene')) and not [o for o in bw.get('oshibki', []) if o.startswith('pageerror')]
        z('2D-запас без WebGL', 'green' if ok else 'red', f'ссылка «{zp.get("ssylka", "")}» → рабочая игра: {zp.get("cel_rabochaya")}; 2D на месте сцены: {zp.get("risunok_v_scene")}; '
          f'ошибки: {len(bw.get("oshibki", []))}' + (f'; на странице только надпись «{zp["tekst"].strip()}»' if zp.get('tekst') and not ok else ''))
        tp = pk.get('tekst_poverh', [])
        z('текст не поверх', 'green' if not tp else 'red', 'надписей на сцене нет' if not tp else 'на сцене: ' + ' | '.join(tp[:5]))
    return Z


def list_kadrov(papka):
    st = [Image.open(papka / f'{n}.png').convert('RGB') for n in ('1-pered', '2-bok', '3-zad', '4-bok2') if (papka / f'{n}.png').is_file()]
    if not st:
        return None
    w, h = 640, 360
    tw = h * 2 * 390 // 844   # полоса телефона во всю высоту листа
    L = Image.new('RGB', (w * 2 + tw, h * 2), (12, 14, 18))
    for i, im in enumerate(st):
        L.paste(im.resize((w, h)), ((i % 2) * w, (i // 2) * h))
    t = papka.parent / 'tel' / 'tel.png'
    if t.is_file():
        tm = Image.open(t).convert('RGB')
        tm = tm.resize((tw, h * 2))
        L.paste(tm, (w * 2, 0))
    f = papka.parent / 'list.png'
    L.save(f)
    return f


def ocenka_modelyu(lst):
    et = TUT / 'etalon' / P['vau']['etalon']
    prompt = P['vau']['prompt'].replace('{KANDIDAT}', str(lst)).replace('{ETALON}', str(et))
    try:
        r = subprocess.run(['claude', '-p', prompt, '--model', P['vau']['model'], '--allowedTools', 'Read', '--output-format', 'text'],
                           capture_output=True, text=True, timeout=400, cwd=str(lst.parent))
        t = r.stdout
        o = json.loads(t[t.index('{'):t.rindex('}') + 1])
        return o
    except Exception as e:
        return {'oshibka': f'оценка не получена: {e}', 'vau': None}


def sluga(glb):
    """Папка просмотрщика + http-сервер на свободном порту; вернуть (url, процесс, папка)."""
    d = Path(tempfile.mkdtemp(prefix='vau-sudya-'))
    shutil.copy(TUT / 'smotr.html', d / 'index.html')
    shutil.copy(glb, d / 'model.glb')
    (d / 'three').symlink_to(three_papka())
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    pr = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1', '-d', str(d)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    return f'http://127.0.0.1:{port}/index.html', pr, d


def main():
    ap = argparse.ArgumentParser(description='Судья «вау по кадру» для 3D-игр дня')
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument('--url'); g.add_argument('--glb')
    ap.add_argument('--imya', required=True)
    ap.add_argument('--start', default="[data-igra] button:has-text('Играть')")
    ap.add_argument('--stage', default='[data-igra-scena]')
    ap.add_argument('--bez-modeli', action='store_true')
    o = ap.parse_args()
    VYH = TUT / 'vyhod' / o.imya
    shutil.rmtree(VYH, ignore_errors=True)
    pr = None
    try:
        if o.glb:
            url, pr, tmp = sluga(o.glb)
            a = dict(url=url, glb=True)
        else:
            a = dict(url=o.url, glb=False, start=o.start, stage=o.stage)
        pk = bot(a, 'pk', VYH / 'pk')
        tel = bot(a, 'tel', VYH / 'tel')
        bw = {} if o.glb else bot(a, 'bez-webgl', VYH / 'bez-webgl')
    finally:
        if pr:
            pr.terminate(); pr.wait()
    rz = razbor(VYH / 'pk')
    Z = zamki(pk, tel, bw, rz, bool(o.glb))
    lst = list_kadrov(VYH / 'pk')
    vau = {'vau': None, 'propushcheno': '--bez-modeli'} if o.bez_modeli or not lst else ocenka_modelyu(lst)
    krasnye = [z['zamok'] for z in Z if z['cvet'] == 'red']
    itog = 'ВАУ' if not krasnye and vau.get('vau') is True else ('НЕ ВАУ' if krasnye or vau.get('vau') is False else 'НЕ ОЦЕНЕНО')
    O = dict(imya=o.imya, istochnik=o.url or o.glb, itog=itog, krasnye=krasnye, zamki=Z, vau=vau, razbor=rz, list=str(lst) if lst else None,
             bot={'pk': pk, 'tel': tel, 'bez-webgl': bw}, vklyuchen=P['vklyuchen'])
    (VYH / 'otchet.json').write_text(json.dumps(O, ensure_ascii=False, indent=1))
    znak = {'green': '✅', 'yellow': '🟡', 'red': '❌', 'grey': '—'}
    print(f'{o.imya}: {itog}')
    for z in Z:
        print(f'  {znak[z["cvet"]]} {z["zamok"]}: {z["tekst"]}')
    print(f'  вау (модель): {vau.get("ball", "—")}/10, {"вау" if vau.get("vau") else "не вау" if vau.get("vau") is False else "нет оценки"} — {vau.get("pochemu") or vau.get("oshibka") or ""}')
    print(f'  отчёт: {VYH / "otchet.json"}')
    if P['vklyuchen'] and itog != 'ВАУ':
        sys.exit(1)


if __name__ == '__main__':
    main()
