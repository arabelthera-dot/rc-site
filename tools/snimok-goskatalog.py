#!/usr/bin/env python3
"""Снимки предметов Госкаталога для таблицы готовности (Р553): проверка по сохранённому снимку, как archive/Perma.cc.
goskatalog.ru закрыт для адреса РФ-выхода таблицы (nginx 403 на любой адрес) — ссылка на предмет иначе вечно серая.
Этот сценарий берёт со страниц января ссылки источников вида goskatalog.ru/portal/#/collections?id=N,
открывает карточку предмета muzfo-rest/rest/exhibits/N через общий российский узел (ru-route.json, 127.0.0.1:8899,
выход 95.163.86.211 — Госкаталог отвечает 200) и пишет снимок: id, рег. №, инв. №, название, музей, адрес,
дата проверки, откуда подтверждено, дни, где ссылка стоит, совпал ли рег. № с подписью на странице.
Таблица засчитывает ссылку Госкаталога «проверено по снимку», только если снимок есть у каждого id дня.
Предмета нет (404) — в снимок не попадает, ссылка остаётся серой: её надо заменить другим источником.
  python3 tools/snimok-goskatalog.py --live --muzej izobreteniya   # по живому сайту, дописать снимки
  python3 tools/snimok-goskatalog.py --dist dist --uzel http://127.0.0.1:8899
Откат — удалить этот файл, data/gotovnost/snimki-goskatalog.json и функцию po_snimku_goskatalog в таблице.
"""
import argparse
import importlib.util
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAJL = os.path.join(KOREN, 'data', 'gotovnost', 'snimki-goskatalog.json')
UZEL = 'http://127.0.0.1:8899'
API = 'https://goskatalog.ru/muzfo-rest/rest'
_spec = importlib.util.spec_from_file_location('tablica', os.path.join(KOREN, 'tools', 'tablica-gotovnosti.py'))
t = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(t)


def poluchit(otkr, put):
    r = otkr.open(urllib.request.Request(API + put, headers={'User-Agent': t.UA, 'Accept': 'application/json'}), timeout=40)
    return json.loads(r.read())


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dist', help='собранная dist')
    ap.add_argument('--live', nargs='?', const=t.SAJT, help='живой сайт')
    ap.add_argument('--muzej', action='append', help='slug музея (можно несколько; по умолчанию — все музеи таблицы)')
    ap.add_argument('--uzel', default=os.environ.get('RC_RU_PROXY', UZEL), help='HTTP-вход российского узла')
    a = ap.parse_args()
    ist = t.Zhivoj(a.live) if a.live else t.Dist(a.dist or 'dist')
    otkr = urllib.request.build_opener(urllib.request.ProxyHandler({'https': a.uzel, 'http': a.uzel}))
    snimki = json.load(open(FAJL, encoding='utf-8')) if os.path.exists(FAJL) else {}
    muzei, dni, podpisi = {}, {}, {}
    for slug in a.muzej or [m for m, _ in t.MUZEI]:
        for d in t.DNI:
            s = ist.stranica(slug, d)
            if s is None:
                continue
            for i in t.goskatalog_id(s):
                dni.setdefault(i, []).append(f'{slug}/{d}')
                podpisi[i] = podpisi.get(i, '') + t.tekst(''.join(t.razdel(s, sid) or '' for sid in t.RAZDELY_ISTOCHNIKOV))
    plokho = 0
    for i in sorted(dni, key=int):
        try:
            p = poluchit(otkr, f'/exhibits/{i}')
        except urllib.error.HTTPError as e:
            print(f'  {i}: Госкаталог {e.code} — предмета нет, снимка нет ({", ".join(dni[i])})')
            plokho += 1
            continue
        except Exception as e:
            print(f'  {i}: узел не ответил ({type(e).__name__}) — снимок не обновлён')
            plokho += 1
            continue
        if not p.get('name'):
            print(f'  {i}: карточка без названия — снимка нет')
            plokho += 1
            continue
        m = p.get('museumId')
        if m not in muzei:
            try:
                muzei[m] = poluchit(otkr, f'/museums/{m}').get('name', '')
            except Exception:
                muzei[m] = ''
        reg = str(p.get('regNumber') or '')
        snimki[i] = {
            'id': int(i),
            'reg_nomer': reg,
            'inv_nomer': (p.get('invNumber') or '').strip(),
            'nazvanie': re.sub(r'\s+', ' ', p['name']).strip(),
            'muzej': muzei[m],
            'muzej_id': m,
            'adres': f'https://goskatalog.ru/portal/#/collections?id={i}',
            'karta_api': f'{API}/exhibits/{i}',
            'provereno': date.today().isoformat(),
            'otkuda': f'goskatalog.ru, карточка muzfo-rest через общий российский узел (ru-route.json, {a.uzel})',
            'dni': sorted(set(dni[i])),
            'reg_na_stranice': bool(reg) and reg in podpisi[i],
        }
        print(f'  {i}: {snimki[i]["nazvanie"][:70]} — {snimki[i]["muzej"][:50]}')
    os.makedirs(os.path.dirname(FAJL), exist_ok=True)
    with open(FAJL, 'w', encoding='utf-8') as f:
        json.dump(dict(sorted(snimki.items(), key=lambda kv: int(kv[0]))), f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(f'snimok-goskatalog: id на страницах {len(dni)}, снимков в файле {len(snimki)}, без снимка {plokho} → {FAJL}')
    return 1 if plokho else 0


if __name__ == '__main__':
    sys.exit(main())
