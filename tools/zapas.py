#!/usr/bin/env python3
"""Пункт 7 (очередь 0, Р616): запас 7–8 кандидатов на каждую дату — для второго года.

Машина ничего не ищет и не выдумывает: собирает то, что помощники уже записали при поиске,
в одном формате — файлы kand.tsv (и kand-*.tsv) в своих папках журнала
~/workspace/logs/pomoshchniki/<наряд>/. Столбцы kand.tsv, через табуляцию, первая строка — заголовок:

    muzei  data  imya  sobytie  god  baza  ssylka

muzei — slug из src/data/museums.json; data — ММ-ДД; baza — id из src/data/spravochniki/bazy.json
(раздел razresheny); ssylka — точный адрес https той страницы, где найдено.
Строка без любого из полей, с базой не из списка, с адресом Википедии — не берётся, причина печатается.
Если имя совпадает с карточкой src/data/spravochniki/kartochki.json — машина ставит её номер (поле kartochka).

Итог — data/zapas/zapas.json (руками не правят, пересобирают). Сборка сайта его не читает.
Запуск: python3 tools/zapas.py [папка или файл kand.tsv ...]
"""
import csv, glob, json, os, re, sys
from datetime import date

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZHURNAL = os.path.expanduser('~/workspace/logs/pomoshchniki')
ITOG = f'{KOREN}/data/zapas/zapas.json'
POLYA = ['muzei', 'data', 'imya', 'sobytie', 'god', 'baza', 'ssylka']
NADO = 7      # цель на дату
POTOLOK = 8   # больше не держим
VYCHERK = re.compile(r'wiki(pedia|media|data|source)\.org', re.I)

def zagruzit(put):
    return json.load(open(put, encoding='utf-8'))

bazy = {b['id'] for b in zagruzit(f'{KOREN}/src/data/spravochniki/bazy.json')['razresheny']}
muzei = {m['slug'] for m in zagruzit(f'{KOREN}/src/data/museums.json')['museums']}
kart = {}
for nomer, k in zagruzit(f'{KOREN}/src/data/spravochniki/kartochki.json').items():
    if isinstance(k, dict):
        for n in k.get('napisaniya', []) + [k.get('nazvanie', '')]:
            kart.setdefault(n.strip().lower(), nomer)

def data_verna(s):
    try:
        date(2028, int(s[:2]), int(s[3:]))  # високосный — есть 02-29
        return len(s) == 5 and s[2] == '-'
    except ValueError:
        return False

def faily(argi):
    puti = argi or [ZHURNAL]
    for p in puti:
        if os.path.isdir(p):
            yield from sorted(glob.glob(f'{p}/**/kand.tsv', recursive=True) + glob.glob(f'{p}/**/kand-*.tsv', recursive=True))
        elif os.path.isfile(p):
            yield p

def prichina(s):
    for pole in POLYA:
        if not (s.get(pole) or '').strip():
            return f'нет поля {pole}'
    if s['muzei'] not in muzei:
        return f'музей {s["muzei"]} не из museums.json'
    if not data_verna(s['data']):
        return f'дата {s["data"]} не ММ-ДД'
    if s['baza'] not in bazy:
        return f'база {s["baza"]} не из bazy.json'
    if not re.match(r'https?://', s['ssylka']) or VYCHERK.search(s['ssylka']):
        return 'адрес не http(s) или вычеркнут (Р90)'
    return ''

def main():
    dni, otkaz, vidno, prochitano = {}, [], set(), []
    for put in faily(sys.argv[1:]):
        prochitano.append(put)
        with open(put, encoding='utf-8') as f:
            for i, s in enumerate(csv.DictReader(f, delimiter='\t'), start=2):
                s = {k: (v or '').strip() for k, v in s.items() if k}
                p = prichina(s)
                if p:
                    otkaz.append(f'{put}:{i}: {p}')
                    continue
                klyuch = (s['muzei'], s['data'], s['imya'].lower(), s['sobytie'].lower())
                if klyuch in vidno:
                    continue
                vidno.add(klyuch)
                zap = {'imya': s['imya'], 'sobytie': s['sobytie'], 'god': s['god'],
                       'istochnik': {'baza': s['baza'], 'ssylka': s['ssylka']},
                       'nashel': put.replace(os.path.expanduser('~/workspace/'), '')}
                if s['imya'].lower() in kart:
                    zap['kartochka'] = kart[s['imya'].lower()]
                spisok = dni.setdefault(f"{s['muzei']}/{s['data']}", [])
                if len(spisok) < POTOLOK:
                    spisok.append(zap)
    os.makedirs(os.path.dirname(ITOG), exist_ok=True)
    itog = {'_chto': 'Запас кандидатов на дату для второго года (пункт 7). Собран tools/zapas.py из kand.tsv помощников; '
                     'руками не править. Формат — docs/vtoroy-god.md.',
            'nado_na_datu': NADO, 'potolok': POTOLOK,
            'faylov_prochitano': len(prochitano),
            'dni': dict(sorted(dni.items()))}
    with open(ITOG, 'w', encoding='utf-8') as f:
        json.dump(itog, f, ensure_ascii=False, indent=1)
        f.write('\n')
    zapisey = sum(len(v) for v in dni.values())
    polnyh = sum(len(v) >= NADO for v in dni.values())
    print(f'файлов kand.tsv: {len(prochitano)}; записей: {zapisey}; дат с запасом: {len(dni)}, из них полных (≥{NADO}): {polnyh}; отказов: {len(otkaz)}')
    for o in otkaz[:50]:
        print('  отказ', o)

if __name__ == '__main__':
    main()
