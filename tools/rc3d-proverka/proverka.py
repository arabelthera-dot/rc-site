#!/usr/bin/env python3
"""Машинная проверка ВИДА 3D-игр rc3d (не логики — логику проверяет test.mjs).

Три замка, сцена зелёная только если прошла все:
 1. Правило сцены: главные объекты дня — type "model" (glTF), не box/cylinder/cone/person…
 2. Снимки: ключевые кадры (середина заставки; начало, середина, итог верного варианта) в окнах
    1280×720 и 390×844 сравниваются с одобренными образцами (etalony/), как Playwright
    toHaveScreenshot: попиксельно в YIQ (как pixelmatch), порог пикселя и доля отличий — pravila.json.
    Нет образца — кадр лежит «на одобрение» (сцена жёлтая, не зелёная).
 3. Бюджеты: вес всех загруженных ресурсов ≤ 15 МБ, кадры/с в программном рендере ≥ 18,
    ошибки и предупреждения консоли = 0 (кроме AudioContext до жеста пользователя).

Запуск (http-сервер public на 8777 должен работать):
  python3 tools/rc3d-proverka/proverka.py                       # все сцены из pravila.json
  python3 tools/rc3d-proverka/proverka.py kotelnikov-parashyut  # одна
  python3 tools/rc3d-proverka/proverka.py --bez-snimkov …       # только правило сцены (секунды)
  python3 tools/rc3d-proverka/proverka.py --odobrit <сцена>     # человек одобрил кадры последнего прогона
Отчёт: tools/rc3d-proverka/vyhod/otchet.html. Код выхода 1 — есть красная.
"""
import html, json, os, shutil, subprocess, sys, time
from pathlib import Path
from statistics import median
from urllib.parse import urlparse, unquote

import numpy as np
from PIL import Image

TUT = Path(__file__).resolve().parent
KOREN = TUT.parent.parent
PUBLIC = KOREN / 'public'
SCEN = PUBLIC / 'muzei/izobreteniya/igry/rc3d/scen'
ETALONY, VYHOD = TUT / 'etalony', TUT / 'vyhod'
P = json.loads((TUT / 'pravila.json').read_text())
HOME = os.path.expanduser('~')
ENV = dict(os.environ,
           LD_LIBRARY_PATH=f'{HOME}/opt/root/usr/lib/x86_64-linux-gnu:{HOME}/opt/root/lib/x86_64-linux-gnu',
           PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS='1', FONTCONFIG_FILE=f'{HOME}/opt/fonts.conf')
ENV.setdefault('CH', f'{HOME}/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell')


# ── 1. Правило сцены ──
def obekty(sc):
    """Все объекты сцены по id: корень, заставка, игра, вложенные сцены, части групп."""
    vse = {}
    def obhod(o):
        if isinstance(o, dict):
            if 'id' in o and 'type' in o and o['id'] not in vse:
                vse[o['id']] = o
            for k, v in o.items():
                if k not in ('timeline', 'outcomes', 'choices'):
                    obhod(v)
        elif isinstance(o, list):
            for v in o:
                obhod(v)
    obhod(sc)
    return vse


def pravilo_sceny(imya, sc):
    vse = obekty(sc)
    glav = list(sc.get('glavnye') or []) + [i for i, o in vse.items() if o.get('glavnyy')] + list(P['glavnye'].get(imya, []))
    glav = list(dict.fromkeys(glav))
    if not glav:
        return [{'ok': False, 'tekst': 'главные объекты не объявлены (glavnye в сцене или pravila.json)'}]
    res = []
    for g in glav:
        o = vse.get(g)
        if o is None:
            res.append({'ok': False, 'tekst': f'{g}: объекта нет в сцене'})
            continue
        t = o.get('type')
        if t == P['glavnye_tip']:
            res.append({'ok': True, 'tekst': f'{g}: model {o.get("src", "")}'})
        else:
            chasti = sorted({c.get('type') for c in obekty(o.get('parts', [])).values()}) if t == 'group' else []
            prim = f' из {", ".join(chasti)}' if chasti else ''
            zapr = ' — запрещённая фигура' if t in P['zapreshchyonnye_tipy'] or set(chasti) & set(P['zapreshchyonnye_tipy']) else ''
            res.append({'ok': False, 'tekst': f'{g}: type {t}{prim}, нужен model (glTF){zapr}'})
    return res


# ── 2. Снимки ──
def yiq(a):
    a = a.astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (r * 0.29889531 + g * 0.58662247 + b * 0.11448223,
            r * 0.59597799 - g * 0.27417610 - b * 0.32180189,
            r * 0.21147017 - g * 0.52261711 + b * 0.31114694)


def sravnit(novyy, obrazec, diff_put):
    a = np.asarray(Image.open(novyy).convert('RGB'))
    b = np.asarray(Image.open(obrazec).convert('RGB'))
    if a.shape != b.shape:
        return {'ok': False, 'dolya': 1.0, 'tekst': f'размер {a.shape[1]}×{a.shape[0]} ≠ образец {b.shape[1]}×{b.shape[0]}'}
    ya, ia, qa = yiq(a)
    yb, ib, qb = yiq(b)
    d = 0.5053 * (ya - yb) ** 2 + 0.299 * (ia - ib) ** 2 + 0.1957 * (qa - qb) ** 2
    mask = d > 35215 * P['snimki']['porog_pikselya'] ** 2
    dolya = float(mask.mean())
    seryy = (ya * 0.3 + 178).clip(0, 255).astype(np.uint8)
    out = np.stack([seryy] * 3, -1)
    out[mask] = (255, 0, 0)
    Image.fromarray(out).save(diff_put)
    ok = dolya <= P['snimki']['porog_doli']
    return {'ok': ok, 'dolya': dolya, 'tekst': f'отличается {dolya * 100:.2f}% (порог {P["snimki"]["porog_doli"] * 100:.1f}%)'}


def ves_resursov(zaprosy):
    """Вес всего, что страница загрузила с нашего сервера, — по файлам на диске (без повторов)."""
    puti, chuzhie = set(), set()
    for z in zaprosy:
        u = urlparse(z['url'])
        if u.scheme not in ('http', 'https'):
            continue
        if u.hostname not in ('localhost', '127.0.0.1'):
            chuzhie.add(z['url'])
            continue
        f = PUBLIC / unquote(u.path).lstrip('/')
        if f.is_file():
            puti.add(f)
    return sum(f.stat().st_size for f in puti), len(puti), sorted(chuzhie)


def bot(imya, w, h, papka):
    papka.mkdir(parents=True, exist_ok=True)
    for f in papka.glob('*.png'):
        f.unlink()
    env = dict(ENV, S=imya, W=str(w), H=str(h), OUT=str(papka))
    r = subprocess.run(['node', str(TUT / 'snimki.mjs')], env=env, capture_output=True, text=True, timeout=900)
    try:
        return json.loads((papka / 'bot.json').read_text())
    except Exception:
        return {'oshibki': ['бот упал: ' + (r.stderr or r.stdout)[-400:]], 'kadry': [], 'zaprosy': [], 'fps': {'z': [], 'g': []}}


def proverit(imya, snimki=True):
    sc = json.loads((SCEN / f'{imya}.json').read_text())
    S = {'imya': imya, 'title': sc.get('title', imya), 'pravilo': pravilo_sceny(imya, sc), 'okna': [], 'byudzhet': []}
    if snimki:
        B = P['byudzhet']
        zaprosy, oshibki = [], []
        for w, h in P['snimki']['okna']:
            okno = f'{w}x{h}'
            papka = VYHOD / imya / okno
            R = bot(imya, w, h, papka)
            zaprosy += R.get('zaprosy', [])
            oshibki += [f'[{okno}] {e}' for e in R.get('oshibki', [])]
            fps_g, fps_z = R['fps'].get('g', []), R['fps'].get('z', [])
            fps = median(fps_g) if fps_g else (median(fps_z) if fps_z else 0)
            S['byudzhet'].append({'ok': fps >= B['fps_min'], 'tekst': f'кадры/с {okno}: {fps:g} (игра, медиана; заставка {median(fps_z) if fps_z else "—"}), нужно ≥ {B["fps_min"]}'})
            kadry = []
            for k in R.get('kadry', []):
                nov = papka / f'{k}.png'
                obr = ETALONY / imya / okno / f'{k}.png'
                if obr.is_file():
                    c = sravnit(nov, obr, papka / f'{k}.diff.png')
                    kadry.append({'kadr': k, 'status': 'ok' if c['ok'] else 'bad', 'tekst': c['tekst'], 'nov': nov, 'obr': obr, 'diff': papka / f'{k}.diff.png'})
                else:
                    kadry.append({'kadr': k, 'status': 'odobrenie', 'tekst': 'образца нет — на одобрение', 'nov': nov})
            nado = {'z-seredina', 'g-nachalo', 'g-seredina', 'g-itog'} if sc.get('zastavka') else {'g-nachalo', 'g-seredina', 'g-itog'}
            for k in sorted(nado - set(R.get('kadry', []))):
                kadry.append({'kadr': k, 'status': 'bad', 'tekst': 'кадр не снят (бот не дошёл)'})
            S['okna'].append({'okno': okno, 'kadry': kadry, 'itog': R.get('itog'), 'verno': R.get('verno'), 'vremya': R.get('vremya')})
        ves, n, chuzhie = ves_resursov(zaprosy)
        S['byudzhet'].insert(0, {'ok': ves <= B['ves_mb'] * 1024 * 1024, 'tekst': f'вес ресурсов: {ves / 1048576:.2f} МБ в {n} файлах, нужно ≤ {B["ves_mb"]} МБ'})
        if chuzhie:
            oshibki.append(f'загрузка с чужих адресов: {", ".join(chuzhie[:5])}')
        S['byudzhet'].append({'ok': len(oshibki) <= B['oshibki_konsoli'], 'tekst': f'ошибки консоли: {len(oshibki)} (AudioContext до жеста не считается)', 'spisok': oshibki[:20]})
    kr = any(not x['ok'] for x in S['pravilo'] + S['byudzhet']) or any(k['status'] == 'bad' for o in S['okna'] for k in o['kadry'])
    zh = any(k['status'] == 'odobrenie' for o in S['okna'] for k in o['kadry'])
    S['status'] = 'krasnaya' if kr else ('zhyoltaya' if zh else 'zelyonaya')
    return S


# ── Отчёт ──
CVET = {'zelyonaya': ('#1f8f3a', 'ЗЕЛЁНАЯ'), 'krasnaya': ('#c62828', 'КРАСНАЯ'), 'zhyoltaya': ('#c99a06', 'ЖДЁТ ОДОБРЕНИЯ')}
KST = {'ok': ('#1f8f3a', 'совпал'), 'bad': ('#c62828', 'не совпал'), 'odobrenie': ('#c99a06', 'на одобрение')}


def rel(p):
    return os.path.relpath(p, VYHOD)


def otchet(scenes):
    e = html.escape
    out = ['<!doctype html><html lang=ru><meta charset=utf-8><title>Проверка вида rc3d</title><style>',
           'body{font:15px/1.4 system-ui,sans-serif;background:#111;color:#eee;margin:20px}h2{margin:28px 0 6px}',
           '.st{display:inline-block;padding:2px 10px;border-radius:4px;color:#fff;font-weight:700}',
           'ul{margin:4px 0;padding-left:20px}li.ok{color:#7ddc8f}li.bad{color:#ff8a80}',
           '.grid{display:flex;flex-wrap:wrap;gap:10px}.k{border:4px solid;border-radius:6px;padding:4px;background:#1b1b1b}',
           '.k img{display:block;max-width:300px;max-height:300px}.k small{display:block;max-width:300px}</style>',
           f'<h1>Проверка вида 3D-игр rc3d</h1><p>{time.strftime("%d.%m.%Y %H:%M")} · правило сцены + снимки против образцов + бюджеты. '
           'Пороги — tools/rc3d-proverka/pravila.json.</p>']
    for S in scenes:
        c, t = CVET[S['status']]
        out.append(f'<h2>{e(S["title"])} <small>({e(S["imya"])})</small> <span class=st style="background:{c}">{t}</span></h2>')
        out.append('<b>Правило сцены</b><ul>' + ''.join(f'<li class={"ok" if x["ok"] else "bad"}>{e(x["tekst"])}</li>' for x in S['pravilo']) + '</ul>')
        if S['byudzhet']:
            li = []
            for x in S['byudzhet']:
                sp = ''.join(f'<br><small>{e(s[:220])}</small>' for s in x.get('spisok', []))
                li.append(f'<li class={"ok" if x["ok"] else "bad"}>{e(x["tekst"])}{sp}</li>')
            out.append('<b>Бюджеты</b><ul>' + ''.join(li) + '</ul>')
        for o in S['okna']:
            out.append(f'<p><b>Окно {o["okno"]}</b> · верный вариант {e(json.dumps(o.get("verno"), ensure_ascii=False))} · итог {e(str((o.get("itog") or {}).get("result")))}</p><div class=grid>')
            for k in o['kadry']:
                kc, kt = KST[k['status']]
                img = f'<a href="{rel(k["nov"])}"><img src="{rel(k["nov"])}" loading=lazy></a>' if k.get('nov') and Path(k['nov']).is_file() else ''
                dop = f' · <a href="{rel(k["obr"])}">образец</a> · <a href="{rel(k["diff"])}">разница</a>' if k.get('obr') else ''
                out.append(f'<div class=k style="border-color:{kc}">{img}<small><b>{k["kadr"]}</b> — {kt}: {e(k["tekst"])}{dop}</small></div>')
            out.append('</div>')
    out.append('<p>Одобрить кадры сцены после просмотра: <code>python3 tools/rc3d-proverka/proverka.py --odobrit &lt;сцена&gt;</code></p>')
    (VYHOD / 'otchet.html').write_text('\n'.join(out))


def odobrit(imya):
    n = 0
    for w, h in P['snimki']['okna']:
        okno = f'{w}x{h}'
        src = VYHOD / imya / okno
        dst = ETALONY / imya / okno
        dst.mkdir(parents=True, exist_ok=True)
        for f in src.glob('*.png'):
            if not f.name.endswith('.diff.png'):
                shutil.copy2(f, dst / f.name)
                n += 1
    print(f'одобрено кадров: {n} → {ETALONY / imya}')


def main(a):
    if a[:1] == ['--odobrit']:
        for s in a[1:]:
            odobrit(s)
        return 0
    snimki = '--bez-snimkov' not in a
    imena = [x for x in a if not x.startswith('--')] or list(P['glavnye'])
    VYHOD.mkdir(exist_ok=True)
    scenes = []
    for s in imena:
        S = proverit(s, snimki)
        scenes.append(S)
        print(f'{s}: {CVET[S["status"]][1]}')
        for x in S['pravilo'] + S['byudzhet']:
            if not x['ok']:
                print('  ✗', x['tekst'])
        for o in S['okna']:
            for k in o['kadry']:
                if k['status'] != 'ok':
                    print(f'  {"✗" if k["status"] == "bad" else "?"} {o["okno"]} {k["kadr"]}: {k["tekst"]}')
    otchet(scenes)
    print('отчёт:', VYHOD / 'otchet.html')
    return 1 if any(S['status'] == 'krasnaya' for S in scenes) else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
