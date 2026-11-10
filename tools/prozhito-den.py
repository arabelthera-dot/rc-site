#!/usr/bin/env python3
"""Пункт 96 (очередь 1): «Прожито» — дневники в этот день. Ручной инструмент, сборка и CI его не зовут.

Дата ММ-ДД → записи дневников этого дня из открытого корпуса «Прожито» (ЕУСПб, corpus.prozhito.org).
Машина берёт то же открытое JSON API, которое зовёт сам сайт корпуса, без ключа и регистрации:
    /api/notes/search?date=ГГГГ-ММ-ДД&dateTop=ГГГГ-ММ-ДД — записи дня (по 25, дальше offset + searchNotesSession)
и countNotes — сколько их всего. По каждому году диапазона один запрос (~1 с), берётся до --na-god записей.
Календарь /api/notes/calendar?year=ГГГГ не берём: он вчетверо медленнее и отдаёт заодно всех авторов.
Выходные данные издания — /api/persons/lang/<автор>/1, поле edition (в самой записи оно пустое), по запросу на автора.

Условия «Прожито»: доступ открытый; при цитировании — ссылка на первую публикацию (поле edition автора),
если её нет — на «Прожито». Тексты принадлежат авторам и наследникам: на страницу — только короткая цитата
со ссылкой (ст. 1274 ГК РФ), выгружать дневники целиком нельзя.

Итог — файл-предложение (JSON, руками не правят, пересобирают), утверждённые дни он не трогает:
    python3 tools/prozhito-den.py 11-10 [--gody 1900-1945] [--na-god 3] [--iz data/prozhito/11-10.json]
По умолчанию пишет в /tmp/prozhito-ММ-ДД.json. Пауза между запросами — 0,3 с, чтобы не нагружать сервер; 1800–1991 — около 5 минут.
"""
import argparse, html, json, re, sys, time
import requests

API = 'https://corpus.prozhito.org/api/'
PAUZA = 0.3
TSITATA = 400   # знаков на цитату, не больше

def zapros(sessiya, put, parametry):
    time.sleep(PAUZA)
    otvet = sessiya.get(API + put, params=parametry, timeout=60)
    otvet.raise_for_status()
    dannye = otvet.json()
    if dannye.get('status') != 1:
        raise RuntimeError(f'{put}: status={dannye.get("status")}')
    return dannye['data']

def chistyi(tekst):
    tekst = html.unescape(re.sub(r'<[^>]+>', ' ', tekst or ''))
    return re.sub(r'\s+', ' ', tekst).strip()

def korotko(tekst):
    if len(tekst) <= TSITATA:
        return tekst
    return tekst[:TSITATA].rsplit(' ', 1)[0] + ' …'

def imya(chelovek):
    return ' '.join(x for x in (chelovek.get('lastName'), chelovek.get('firstName'), chelovek.get('thirdName')) if x)

IZDANIYA = {}

def izdanie(sessiya, z):
    avtor = (z.get('person') or {}).get('id')
    if avtor not in IZDANIYA:
        IZDANIYA[avtor] = chistyi(zapros(sessiya, f'persons/lang/{avtor}/1', {}).get('edition'))
    if IZDANIYA[avtor]:
        return IZDANIYA[avtor]
    if (z.get('diary_data') or {}).get('premier'):
        return 'первая публикация — «Прожито»'
    return 'издание не указано — ссылаться на «Прожито»'

def zapis(sessiya, z):
    chelovek = z.get('person') or {}
    return {
        'data': z['date'],
        'avtor': imya(chelovek),
        'gody_zhizni': ' — '.join(x for x in (chelovek.get('birthDay'), chelovek.get('deathDay')) if x),
        'vozrast': z.get('age') or '',
        'tsitata': korotko(chistyi(z.get('text'))),
        'ssylka': f'https://corpus.prozhito.org/notes?date=%22{z["date"]}%22&diaries=%5B{z["diary"]}%5D',
        'izdanie': izdanie(sessiya, z),
        'id_zapisi': int(z['id']),
    }

def main():
    ap = argparse.ArgumentParser(description='«Прожито»: записи дневников на дату ММ-ДД')
    ap.add_argument('den', help='ММ-ДД, например 11-10')
    ap.add_argument('--gody', default='1800-1991', help='диапазон лет, по умолчанию 1800-1991')
    ap.add_argument('--na-god', type=int, default=3, help='записей с каждого года, по умолчанию 3')
    ap.add_argument('--iz', help='куда писать JSON, по умолчанию /tmp/prozhito-ММ-ДД.json')
    a = ap.parse_args()
    if not re.fullmatch(r'\d\d-\d\d', a.den):
        sys.exit('дата — ММ-ДД')
    ot, do = (int(x) for x in a.gody.split('-'))
    sessiya = requests.Session()
    sessiya.headers['User-Agent'] = 'russian-civilization.ru (ruchnoy poisk, 1 zapros / 0.3 s)'

    gody, zapisi = {}, []
    for god in range(ot, do + 1):
        data = f'{god}-{a.den}'
        if a.den == '02-29' and not (god % 4 == 0 and (god % 100 or god % 400 == 0)):
            continue
        naideno = zapros(sessiya, 'notes/search', {'date': data, 'dateTop': data})
        if not naideno.get('countNotes'):
            continue
        gody[god] = int(naideno['countNotes'])
        for z in (naideno.get('notes') or [])[:a.na_god]:
            if z.get('date') == data and z.get('hidden_note') != 'True':
                zapisi.append(zapis(sessiya, z))
    print(f'годы с записями на {a.den}: {len(gody)} из {do - ot + 1}, записей всего {sum(gody.values())}', file=sys.stderr)

    itog = {
        '_chto': 'Предложение: записи дневников «Прожито» на этот день. Сборка не читает; в день — только короткой цитатой со ссылкой на первую публикацию.',
        'den': a.den, 'gody': a.gody, 'istochnik': 'https://corpus.prozhito.org/',
        'sobrano': time.strftime('%Y-%m-%d'),
        'po_godam': {str(g): n for g, n in sorted(gody.items())},
        'zapisi': zapisi,
    }
    put = a.iz or f'/tmp/prozhito-{a.den}.json'
    with open(put, 'w', encoding='utf-8') as f:
        json.dump(itog, f, ensure_ascii=False, indent=1)
    print(f'{len(zapisi)} записей → {put}', file=sys.stderr)

if __name__ == '__main__':
    main()
