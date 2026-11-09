#!/usr/bin/env python3
"""Пункт 30 (Р661/Р662): одна карточка на человека, предмет, событие.

Машина читает утверждённые дни (src/data/utverzhdeno/<музей>/01-*.json), дни не правит.
Карточка — src/data/spravochniki/kartochki.json: постоянный номер «tip:slug» в той же
форме, что словарь src/data/slovar.json (Р37), чтобы потом слить в одну базу.
Люди: имя из словаря или «И. О. Фамилия» / «Имя Фамилия» из текста фактов.
Предметы: название в кавычках-ёлочках из заголовков фактов.
Дубли (один человек под двумя написаниями) — src/data/spravochniki/kartochki-dubli.json.
Решённый дубль — запись в src/data/snyatye-nomera.json: снятый номер машина сливает в живой.
Запуск: python3 tools/spravochniki/kartochki.py
"""
import json, re, glob, os
from collections import defaultdict

KOREN = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MUZEI = ['izobreteniya', 'ne-sdayutsya']
TR = dict(zip('абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
  ['a','b','v','g','d','e','e','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','c','ch','sh','shch','','y','','e','yu','ya']))

def slug(s):
    s = ''.join(TR.get(c, c) for c in s.lower())
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

slovar = json.load(open(f'{KOREN}/src/data/slovar.json'))
po_imeni = {v['nazvanie']: k for k, v in slovar.items() if v['tip'] == 'lyudi'}
INIC = re.compile(r'\b([А-ЯЁ])\.\s?(?:([А-ЯЁ])\.\s?)?([А-ЯЁ][а-яё]{2,}(?:-[А-ЯЁ][а-яё]+)?)')
PREDMET = re.compile(r'«([А-ЯЁ0-9][^«»]{1,40})»')

def teksty(d):
    yield d.get('zagolovok', '')
    for f in d.get('fakty', []):
        yield f.get('zagolovok', '') or ''
        yield f.get('podrobnee', '') or ''

kart = {}
vstrechi = defaultdict(set)
for muzej in MUZEI:
    for put in sorted(glob.glob(f'{KOREN}/src/data/utverzhdeno/{muzej}/01-*.json')):
        d = json.load(open(put))
        gde = f"{muzej}/{d['key']}"
        tekst = '\n'.join(teksty(d))
        for imya, nomer in po_imeni.items():
            if imya in tekst:
                kart.setdefault(nomer, {'tip': 'lyudi', 'nazvanie': imya, 'napisaniya': [imya], 'dni': [], 'iz': 'slovar.json'})
                vstrechi[nomer].add(gde)
        for m in INIC.finditer(tekst):
            fam = m.group(3)
            imya = m.group(0).strip()
            nomer = f"lyudi:{slug(fam)}-{slug(m.group(1))}{slug(m.group(2) or '')}"
            k = kart.setdefault(nomer, {'tip': 'lyudi', 'nazvanie': imya, 'napisaniya': [], 'dni': [], 'iz': 'tekst'})
            if imya not in k['napisaniya']: k['napisaniya'].append(imya)
            vstrechi[nomer].add(gde)
        for f in d.get('fakty', []):
            for m in PREDMET.finditer(f.get('zagolovok', '') or ''):
                nazv = m.group(1).strip()
                if len(nazv.split()) > 5: continue  # цитата, не предмет
                nomer = f'predmet:{slug(nazv)}'
                kart.setdefault(nomer, {'tip': 'predmet', 'nazvanie': nazv, 'napisaniya': [nazv], 'dni': [], 'iz': 'tekst'})
                vstrechi[nomer].add(gde)
for nomer, dni in vstrechi.items():
    kart[nomer]['dni'] = sorted(dni)

# Снятые номера (п. 12): карточка снятого номера сливается в живую, как перенаправление Wikidata.
snyatye = json.load(open(f'{KOREN}/src/data/snyatye-nomera.json'))['nomera']
for staryy, z in snyatye.items():
    if z['smotri'] in snyatye: raise SystemExit(f'snyatye-nomera.json: {staryy} → {z["smotri"]}, а тот тоже снят — веди сразу на живой')
    if staryy not in kart: continue
    k = kart.pop(staryy)
    if z['smotri'] not in kart: raise SystemExit(f'snyatye-nomera.json: {staryy} → {z["smotri"]}, а такой карточки нет')
    cel = kart[z['smotri']]
    cel['napisaniya'] += [x for x in k['napisaniya'] if x not in cel['napisaniya']]
    cel['dni'] = sorted(set(cel['dni']) | set(k['dni']))

# Дубли: одна фамилия под разными номерами (инициалы/полное имя), е/ё.
po_fam = defaultdict(list)
for nomer, k in kart.items():
    if k['tip'] != 'lyudi': continue
    fam = k['nazvanie'].split()[-1].replace('ё', 'е')
    po_fam[fam].append(nomer)
dubli = [{'familiya': f, 'nomera': sorted(n), 'napisaniya': sorted({x for i in n for x in kart[i]['napisaniya']})}
         for f, n in sorted(po_fam.items()) if len(n) > 1]

os.makedirs(f'{KOREN}/src/data/spravochniki', exist_ok=True)
json.dump(dict(sorted(kart.items())), open(f'{KOREN}/src/data/spravochniki/kartochki.json', 'w'), ensure_ascii=False, indent=1)
json.dump(dubli, open(f'{KOREN}/src/data/spravochniki/kartochki-dubli.json', 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print('карточек:', len(kart), dict(Counter(k['tip'] for k in kart.values())), '· дублей:', len(dubli))
