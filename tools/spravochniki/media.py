#!/usr/bin/env python3
"""Ролик и аудиогид дня — записи (пункты 45 и 46, Р232, Р36). Разметка готового: ничего не рендерит и не озвучивает.

  python3 tools/spravochniki/media.py [--rolik ~/путь/к/rc-rolik]
      — собрать src/data/spravochniki/roliki.json, audiogidy.json и muzyka.json

Откуда берётся:
  день — src/content/dni-shablon/<музей>/ММ-ДД.yaml (поля video.klyuch и audioguide; карточки только читаются);
  выпуск ролика — public/video/registry/<ключ>.json (длина, пометка о кадрах);
  сцены, картинки, голос, вставка нейросети — сценарий дня в rc-rolik (days/<id>.json);
  музыка — scripts/sfx.py rc-rolik (своя, CC0), список — muzyka.json;
  ударения — src/data/spravochniki/udareniya.json (имена) и udareniya.json rc-rolik (простые слова), как в scripts/tts.py.
"""
import html, json, re, sys
from pathlib import Path

import yaml

KOREN = Path(__file__).resolve().parent.parent.parent
SPR = KOREN / 'src/data/spravochniki'
DNI = KOREN / 'src/content/dni-shablon'
REESTR = KOREN / 'public/video/registry'
MUZEI = {'izobreteniya': 'izobreteniya', 'ne-sdayutsya': 'nesdayutsya'}  # музей дня -> папка реестра роликов
UDAR_ZNAK = '́'

# Музыка и звук роликов. Чужой музыки нет: всё синтезирует scripts/sfx.py rc-rolik (README rc-rolik, «Музыка и звук — лицензия»).
MUZYKA = [
    {'id': 'sfx-gul', 'nazvanie': 'Гул-подложка под всем роликом', 'gde': 'rc-rolik scripts/sfx.py, drone()',
     'avtor': 'своя работа', 'licenziya': 'CC0'},
    {'id': 'sfx-udar', 'nazvanie': 'Удар на смене сцены', 'gde': 'rc-rolik scripts/sfx.py, boom()',
     'avtor': 'своя работа', 'licenziya': 'CC0'},
    {'id': 'sfx-vzhuh', 'nazvanie': '«Вжух» на переходе', 'gde': 'rc-rolik scripts/sfx.py, whoosh()',
     'avtor': 'своя работа', 'licenziya': 'CC0'},
]


def slovar_udareniy(rolik):
    sl = {}
    obshchiy = rolik / 'udareniya.json'
    if obshchiy.exists():
        sl.update({k: v for k, v in json.loads(obshchiy.read_text()).items() if k != '_'})
    for k, z in json.loads((SPR / 'udareniya.json').read_text()).items():
        if k == '_':
            continue
        for f in z['formy']:
            sl[f.replace(UDAR_ZNAK, '').lower()] = f.lower()
    return sl


def udarit(tekst, sl):
    """Тот же приём, что udar() в rc-rolik scripts/tts.py: слово целиком, регистр первой буквы сохраняется."""
    n = 0

    def rep(m):
        nonlocal n
        w = m.group(0)
        v = sl.get(w.lower())
        if not v:
            return w
        n += 1
        return v[0].upper() + v[1:] if w[0].isupper() else v
    return re.sub(r'[А-Яа-яЁё]+', rep, tekst), n


def chistyy(p):
    t = html.unescape(re.sub(r'<[^>]+>', '', p)).strip()
    return t[1:-1].strip() if t.startswith('«') and t.endswith('»') else t


def dni():
    for muzei in MUZEI:
        for f in sorted((DNI / muzei).glob('[0-9][0-9]-[0-9][0-9].yaml')):
            yield muzei, f.stem, yaml.safe_load(f.read_text())


def sovpadenie_dnya(source_md):
    """(музей, ММ-ДД) по source_md сценария: три записи, которые встречаются в rc-rolik."""
    m = re.search(r'(izobreteniya|ne-sdayutsya)/(?:ns-)?(\d\d-\d\d)\.(?:html|yaml|json|md)', source_md)
    if m:
        return m.group(1), m.group(2)
    m = re.search(r'\bns-(\d\d-\d\d)\.md', source_md)  # knowledge/ns-utverzhdeno/ns-01-13.md
    if m:
        return 'ne-sdayutsya', m.group(1)
    m = re.search(r'pilot-(izobreteniya)/day-(\d\d)jan', source_md)  # pilot-izobreteniya/day-05jan-shukhov.md
    if m:
        return m.group(1), '01-' + m.group(2)
    return None


def scenarii(rolik):
    po_imeni, po_dnyu = {}, {}
    for f in sorted((rolik / 'days').glob('*.json')):
        d = json.loads(f.read_text())
        d['_fayl'] = f'days/{f.name}'
        s = d.get('sajt')
        if s:
            po_imeni[f"{s['reestr']}/{s['imya']}"] = d
        den = sovpadenie_dnya(d.get('source_md', ''))
        if den:
            po_dnyu.setdefault(den, d)
    return po_imeni, po_dnyu


def zapis_rolika(muzei, den, klyuch, vypusk, sc):
    z = {'klyuch': klyuch, 'muzei': muzei, 'den': den,
         'sec': vypusk.get('horizontal', {}).get('sec'), 'pometka_kadrov': vypusk.get('note', '')}
    if not sc:
        z['scenariy'] = None
        z['pochemu_net_scen'] = 'сценария дня в rc-rolik нет: ролик собран до rc-rolik, сцены не записаны'
        return z
    imena = list(sc['images'])
    z['scenariy'] = 'rc-rolik ' + sc['_fayl']
    z['golos'] = {'vid': 'синтез', 'dvizhok': 'edge-tts', 'golos': sc['voice'], 'temp': sc['rate']}
    z['kartinki'] = [{'n': i + 1, 'klyuch': k, 'fayl': sc['images'][k].get('src', ''),
                      'podpis': sc['images'][k].get('label', '')} for i, k in enumerate(imena)]
    z['sceny'] = [{'n': i + 1, 'id': s['id'], 'kartinka': imena.index(s['image']) + 1 if s.get('image') in imena else None,
                   'priem': s['fx'], 'tekst': s.get('show') or s['say']} for i, s in enumerate(sc['segments'])]
    z['muzyka'] = [m['id'] for m in MUZYKA]
    z['mashinnye_sekundy'] = []
    vstavka = sc.get('insert_b')
    if vstavka and re.search(r'реконструкц|сгенерирован', z['pometka_kadrov'], re.I):
        z['mashinnye_sekundy'].append({'ot': 0, 'do': vstavka['seconds'], 'sekund': vstavka['seconds'],
                                       'podpis': vstavka.get('label', ''), 'fayl': vstavka['file'],
                                       'chem': 'нейросеть Genosai (README rc-rolik, «Вставка Б»)'})
    return z


def zapis_gida(muzei, den, g, sl, rolik):
    src = g['audioSrc']
    fayl = src.lstrip('/') if src.startswith('/') else f'muzei/{muzei}/{src}'
    pometka = g.get('note', '')
    golos = 'синтез' if 'синтез' in pometka.lower() else ('живой голос' if pometka else None)
    ozv = rolik / 'audiogid' / (f'ns-{den}.yaml' if muzei == 'ne-sdayutsya' else f'{den}.yaml')
    if ozv.exists():
        y = yaml.safe_load(ozv.read_text())
        abzacy = y.get('transcript') or y.get('audioguide', {}).get('transcript', [])
        otkuda = 'rc-rolik audiogid/' + ozv.name
    else:
        abzacy, otkuda = g.get('transcript', []), 'страница дня, audioguide.transcript'
    tekst = [chistyy(p) for p in abzacy]
    s_udar, vsego = [], 0
    for p in tekst:
        t, n = udarit(p, sl)
        s_udar.append(t)
        vsego += n
    return {'muzei': muzei, 'den': den, 'fayl': fayl, 'dlina': g.get('durationLabel', ''), 'golos': golos,
            'pometka_na_stranice': pometka, 'tekst_otkuda': otkuda, 'tekst': tekst,
            'tekst_s_udareniyami': s_udar, 'udareniy_postavleno': vsego}


def main(argv):
    rolik = Path(argv[argv.index('--rolik') + 1]).expanduser() if '--rolik' in argv else Path.home() / 'rc-rolik'
    if not (rolik / 'days').is_dir():
        sys.exit(f'нет rc-rolik в {rolik}: склонируй arabelthera-dot/rc-rolik и передай --rolik')
    po_imeni, po_dnyu = scenarii(rolik)
    sl = slovar_udareniy(rolik)
    roliki, gidy, oshibki = [], [], []
    for muzei, den, d in dni():
        v = d.get('video') or {}
        if v.get('klyuch'):
            f = REESTR / f"{v['klyuch']}.json"
            if not f.exists():
                oshibki.append(f'{muzei} {den}: выпуска {v["klyuch"]} нет в реестре роликов')
            else:
                sc = po_imeni.get(v['klyuch']) or po_dnyu.get((muzei, den))
                roliki.append(zapis_rolika(muzei, den, v['klyuch'], json.loads(f.read_text()), sc))
        else:
            oshibki.append(f'{muzei} {den}: у дня нет ролика')
        if d.get('audioguide'):
            gidy.append(zapis_gida(muzei, den, d['audioguide'], sl, rolik))
        else:
            oshibki.append(f'{muzei} {den}: у дня нет аудиогида')
    obshchee = 'Собрано tools/spravochniki/media.py из карточек дней, реестра роликов и rc-rolik; руками не править.'
    (SPR / 'muzyka.json').write_text(json.dumps(
        {'_': 'Реестр музыки и звука роликов (пункт 45). Чужой музыки нет; новый звук — строкой в MUZYKA скрипта. ' + obshchee,
         'muzyka': MUZYKA}, ensure_ascii=False, indent=1) + '\n')
    (SPR / 'roliki.json').write_text(json.dumps(
        {'_': 'Ролик дня — запись (пункт 45, Р232): сцены, картинки (номера), музыка из muzyka.json, '
              'секунды, сделанные машиной, с подписью в кадре. ' + obshchee, 'roliki': roliki},
        ensure_ascii=False, indent=1) + '\n')
    (SPR / 'audiogidy.json').write_text(json.dumps(
        {'_': 'Аудиогид дня — запись (пункт 46, Р232, Р36): файл, текст озвучки, тот же текст с ударениями '
              '(знак U+0301; словари udareniya.json сайта и rc-rolik), голос «синтез» или «живой голос». ' + obshchee,
         'audiogidy': gidy}, ensure_ascii=False, indent=1) + '\n')
    so_scenami = sum(1 for r in roliki if r.get('sceny'))
    mash = sum(1 for r in roliki if r.get('mashinnye_sekundy'))
    print(f'роликов {len(roliki)} (со сценами {so_scenami}, с машинными секундами {mash}); '
          f'аудиогидов {len(gidy)} (синтез {sum(g["golos"] == "синтез" for g in gidy)}, '
          f'живой голос {sum(g["golos"] == "живой голос" for g in gidy)}); '
          f'ударений поставлено {sum(g["udareniy_postavleno"] for g in gidy)}')
    for o in oshibki:
        print('  ' + o)


if __name__ == '__main__':
    main(sys.argv[1:])
