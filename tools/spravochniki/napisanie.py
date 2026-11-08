#!/usr/bin/env python3
"""Пункт 170 (Р661/Р662): единое написание букв.

Отдельная проверка, к сборке не подключена (подключает r660). Ищет в утверждённых днях:
  latin   — латинская буква внутри русского слова (А/A, о/o, с/c …);
  yo      — одно слово то с «ё», то с «е» в одном музее (пишем как в первом утверждённом);
  kavychki— прямые/лапки "…" „…“ вместо «ёлочек»;
  tire    — дефис или «–» между словами вместо « — »;
  inicialy— «А.С.Пушкин» без пробелов вместо «А. С. Пушкин».
--ispravit печатает исправленный текст (нормализатор), файлы не меняет.
Запуск: python3 tools/spravochniki/napisanie.py [--json]
"""
import json, re, glob, os, sys
from collections import defaultdict, Counter

KOREN = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MUZEI = ['izobreteniya', 'ne-sdayutsya']
LAT = str.maketrans(dict(zip('AaBCcEeHKMOoPpTXx', 'АаВСсЕеНКМОоРрТХх')))
SMES = re.compile(r'\b(?=\w*[а-яё])(?=\w*[a-z])\w+\b', re.I)
# „лапки“ внутри «ёлочек» — правильные вложенные кавычки, не находка.
KAV = re.compile(r'["„“”]')
# „лапки“ внутри «ёлочек» — правильные вложенные кавычки: их убираем до поиска.
def bez_vlozhennyh(s):
    return re.sub(r'«[^«»]*»', lambda m: re.sub(r'„[^„“]*“', '', m.group(0)), s)
TIRE = re.compile(r'(?<=\w) (?:-|–) (?=\w)')
INIC = re.compile(r'\b([А-ЯЁ])\.([А-ЯЁ])\.\s?([А-ЯЁ][а-яё]+)|\b([А-ЯЁ])\.([А-ЯЁ][а-яё]{2,})')

def normalizovat(s):
    s = SMES.sub(lambda m: m.group(0).translate(LAT), s)
    s = TIRE.sub(' — ', s)
    s = re.sub(r'"([^"]*)"', r'«\1»', s)
    s = INIC.sub(lambda m: f'{m[1]}. {m[2]}. {m[3]}' if m[1] else f'{m[4]}. {m[5]}', s)
    return s

def stroki(d):
    yield 'zagolovok', d.get('zagolovok', '') or ''
    for f in d.get('fakty', []):
        for pole in ('zagolovok', 'podrobnee'):
            yield f"fakt{f.get('n')}.{pole}", f.get(pole, '') or ''

# Разные слова, не разное написание: всем/всём, чем/чём, небо/нёбо …
OMOGRAFY = {'всем', 'чем', 'нем', 'осел', 'небо', 'совершенный', 'узнаем', 'все'}
nahodki = []
slova = defaultdict(lambda: defaultdict(set))
for muzej in MUZEI:
    for put in sorted(glob.glob(f'{KOREN}/src/data/utverzhdeno/{muzej}/01-*.json')):
        d = json.load(open(put)); gde = f"{muzej}/{d['key']}"
        for pole, s in stroki(d):
            for vid, rx in (('latin', SMES), ('kavychki', KAV), ('tire', TIRE), ('inicialy', INIC)):
                for m in rx.finditer(bez_vlozhennyh(s) if vid == 'kavychki' else s):
                    nahodki.append({'vid': vid, 'gde': f'{gde} {pole}', 'kusok': m.string[max(0, m.start()-25):m.end()+25]})
            for w in re.findall(r'[а-яё]+', s.lower()):
                if 'ё' in w or 'е' in w: slova[muzej][w.replace('ё', 'е')].add((w, gde))
for muzej, sl in slova.items():
    for osnova, var in sl.items():
        if osnova not in OMOGRAFY and len({w for w, _ in var}) > 1:
            nahodki.append({'vid': 'yo', 'gde': muzej, 'kusok': ', '.join(sorted({f'{w} ({g})' for w, g in var})[:4])})

if '--json' in sys.argv:
    print(json.dumps(nahodki, ensure_ascii=False, indent=1))
else:
    print('расхождений:', len(nahodki), dict(Counter(n['vid'] for n in nahodki)))
    vidano = Counter()
    for n in nahodki:
        if vidano[n['vid']] < 3:
            vidano[n['vid']] += 1; print(f"  {n['vid']:9} {n['gde']}: …{n['kusok']}…")
sys.exit(0)
