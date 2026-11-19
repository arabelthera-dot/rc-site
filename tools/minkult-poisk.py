#!/usr/bin/env python3
"""Файл-предложение (r718-minkult, п.112): поиск по открытым данным Минкультуры — «тема или имя → предметы с картинкой и музеем».
Ручной инструмент: ни в CI, ни в сборку не подключён; кадр на страницу по-прежнему ставит только kadr.py put.

Наборы opendata.mkrf.ru (замер 10.11.2026 через socks5h://rf-proxy:1080):
  museum-exhibits — Госкаталог музейного фонда: выгрузка json.zip 11,1 ГБ / csv.zip 6,6 ГБ (версия 4, 27.10.2024) — НЕ качать, только поиск;
  egrkn — ЕГРОКН, 163 701 объект: json.zip 170 МБ / csv.zip 107 МБ (версия 70, 10.11.2026).
Поиск — REST /v2/<набор>/$ (JSON, фильтр f в духе MongoDB, курсор nextPage). Без ключа API /v2 отвечает 401; сессия, которую
портал выдаёт любому посетителю (cookie apisid со страницы набора), его открывает — так работает таблица на самом сайте.
Официальный путь без сессии — бесплатный ключ X-API-KEY по почте (opendata.mkrf.ru/item/dev), ставится в RC_MKRF_KEY.
Условия: «Типовые условия использования открытых данных РФ» (data.gov.ru/information-usage) — на сведения; изображения —
«собственность музеев РФ», права на кадр даёт музей-держатель, не набор.
  python3 tools/minkult-poisk.py gk "Ледокол Ермак" -n 10        # Госкаталог: только предметы с картинкой
  python3 tools/minkult-poisk.py okn "Блинов" -n 5                # ЕГРОКН: памятник, адрес, фото, документ
  python3 tools/minkult-poisk.py gk "Айвазовский" --json > /tmp/x.json
Откат — удалить этот файл.
"""
import argparse
import json
import os
import sys

import requests

OD = 'https://opendata.mkrf.ru'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0'
NABOR = {'gk': ('museum-exhibits', 'data.name'), 'okn': ('egrkn', 'data.general.name')}


def sessiya(nabor):
    s = requests.Session()
    s.proxies = {'https': os.environ.get('RC_RF_PROXY', 'socks5h://rf-proxy:1080')}
    s.headers['User-Agent'] = UA
    if os.environ.get('RC_MKRF_KEY'):
        s.headers['X-API-KEY'] = os.environ['RC_MKRF_KEY']
    else:
        s.get(f'{OD}/opendata/7705851331-{nabor}/', timeout=40).raise_for_status()  # cookie apisid
    return s


def poisk(vid, q, n):
    nabor, pole = NABOR[vid]
    s, out, url = sessiya(nabor), [], f'{OD}/v2/{nabor}/$'
    f = {pole: {'$search': q}}
    params, vsego = {'l': min(100, max(n * 3, 20)), 'f': json.dumps(f, ensure_ascii=False)}, 0
    for _ in range(10):  # не больше 10 страниц курсора
        r = s.get(url, params=params, timeout=90)
        r.raise_for_status()
        d = r.json()
        vsego = d.get('total', vsego)
        for z in d.get('data', []):
            v = (gk if vid == 'gk' else okn)(z)
            if v:
                out.append(v)
            if len(out) >= n:
                return vsego, out
        if not d.get('nextPage') or not d.get('data'):
            break
        url, params = d['nextPage'], None
    return vsego, out


def gk(z):
    d = z.get('data') or {}
    imgs = [i.get('url', '').replace('http://', 'https://') for i in d.get('images') or [] if i.get('url')]
    if not imgs:
        return None
    return {'nazvanie': d.get('name', ''), 'muzey': (d.get('museum') or {}).get('name', ''),
            'period': d.get('periodStr', ''), 'tip': (d.get('typology') or {}).get('name', ''),
            'reg_nomer': d.get('regNumber'), 'inv': d.get('invNumber') or '', 'kp': d.get('gikNumber') or '',
            'kartinka': imgs[0], 'kartinok': len(imgs),
            'kartochka': f"https://goskatalog.ru/portal/#/collections?id={d.get('id')}",
            'prava': 'изображение — собственность музея; права по карточке держателя'}


def okn(z):
    d = (z.get('data') or {}).get('general') or {}
    foto = (d.get('photo') or {}).get('url', '')
    doks = d.get('documents') or []
    return {'nazvanie': z.get('nativeName', ''), 'nomer_egrokn': d.get('regNumber') or z.get('nativeId'),
            'adres': (d.get('address') or {}).get('fullAddress', ''), 'vremya': d.get('createDate', ''),
            'kategoriya': (d.get('categoryType') or {}).get('value', ''), 'vid': (d.get('objectType') or {}).get('value', ''),
            'foto': foto, 'dokument': f"{doks[0].get('name', '')} № {doks[0].get('number', '')} от {doks[0].get('date', '')}" if doks else '',
            'kartochka': f"{OD}/opendata/7705851331-egrkn/#{z.get('nativeId')}"}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('vid', choices=NABOR)
    ap.add_argument('q')
    ap.add_argument('-n', type=int, default=10)
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args()
    vsego, out = poisk(a.vid, a.q, a.n)
    if a.json:
        print(json.dumps({'zapros': a.q, 'vsego': vsego, 'predmety': out}, ensure_ascii=False, indent=1))
        return
    print(f'«{a.q}»: в наборе {vsego}, показано {len(out)}' + (' (только с картинкой)' if a.vid == 'gk' else ''), file=sys.stderr)
    for v in out:
        if a.vid == 'gk':
            print(f"- {v['nazvanie'][:100]} | {v['muzey'][:80]} | {v['period']}\n    {v['kartinka']}\n    {v['kartochka']} рег. № {v['reg_nomer']}")
        else:
            print(f"- {v['nazvanie'][:100]} | {v['adres'][:80]} | {v['vremya']} | {v['kategoriya']}\n    фото: {v['foto'] or '—'}\n    {v['dokument']}")


if __name__ == '__main__':
    main()
