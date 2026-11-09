#!/usr/bin/env python3
"""Сверка разметки по закрытому словарю типов (пункты 34 и 36).

Читает src/data/spravochniki/tipy.json и проверяет, что каждый вид в
kartochki-vid.json и dni-sobytiya.json и каждый тип в svyazi-dney.json взят из словаря,
а дни и карточки существуют. Запуск вручную: python3 tools/spravochniki/tipy.py
В сборку не подключён (Р627).
"""
import json, glob, os, sys
from collections import Counter

KOREN = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SPR = f'{KOREN}/src/data/spravochniki'
tipy = json.load(open(f'{SPR}/tipy.json'))
vidy, svyazi = tipy['vidy'], tipy['svyazi']
kart = json.load(open(f'{SPR}/kartochki.json'))
dni_est = {p[len(KOREN) + len('/src/data/utverzhdeno/'):-5]
           for p in glob.glob(f'{KOREN}/src/data/utverzhdeno/*/01-*.json')}
oshibki = []

def vid_ok(gde, kod, dlya):
    if kod not in vidy: oshibki.append(f'{gde}: вида «{kod}» нет в tipy.json')
    elif vidy[kod]['dlya'] not in dlya: oshibki.append(f'{gde}: вид «{kod}» не для {"/".join(dlya)}')

vid = json.load(open(f'{SPR}/kartochki-vid.json'))['vid']
for nomer in kart:
    if nomer not in vid: oshibki.append(f'{nomer}: нет вида')
for nomer, v in vid.items():
    if nomer not in kart: oshibki.append(f'{nomer}: нет такой карточки'); continue
    for den, kod in (v.items() if isinstance(v, dict) else [(None, v)]):
        if den and den not in kart[nomer]['dni']: oshibki.append(f'{nomer}: день {den} не из карточки')
        vid_ok(nomer, kod, ('predmet', 'lyudi'))

sob = json.load(open(f'{SPR}/dni-sobytiya.json'))['sobytie']
for den in sorted(dni_est - set(sob)): oshibki.append(f'{den}: нет типа события')
for den, kod in sob.items():
    if den not in dni_est: oshibki.append(f'{den}: нет такого дня')
    vid_ok(den, kod, ('sobytie',))

sv = json.load(open(f'{SPR}/svyazi-dney.json'))['svyazi']
for s in sv:
    gde = f"{s['ot']} → {s['k']}"
    if s['tip'] not in svyazi: oshibki.append(f'{gde}: типа связи «{s["tip"]}» нет в tipy.json')
    for d in (s['ot'], s['k']):
        if d not in dni_est: oshibki.append(f'{gde}: нет дня {d}')
    if s.get('cherez') and s['cherez'] not in kart: oshibki.append(f'{gde}: нет карточки {s["cherez"]}')

print('карточек с видом:', len(vid), 'из', len(kart), '· дней с типом:', len(sob), 'из', len(dni_est),
      '· связей:', len(sv), dict(Counter(s['tip'] for s in sv)))
for o in oshibki: print('✗', o)
sys.exit(1 if oshibki else 0)
