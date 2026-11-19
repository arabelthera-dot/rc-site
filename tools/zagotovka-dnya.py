#!/usr/bin/env python3
"""Пункт 47 (очередь 0, Р616): заготовку файла дня делает машина — из записи словаря и даты.

Даёшь музей, дату ММ-ДД и героя (id записи src/data/slovar/) — машина печатает пустую запись дня
в форме src/content/days/<музей>/ММ-ДД.json (поля и их порядок — src/data/forma-dnya.json, типы —
src/lib/forma-dnya.mjs). Заполнено только то, что машина знает точно:

  museum, key, status: zagotovka, slovar [герой], slovar_roli {герой: geroy};
  nomer_dnya — <музей>-<ММДД>-<slug героя>, проверен на повтор по всем дням и карточкам страниц;
  с --god: data_sobytiya, god, god_tochnost tochno, а до 14.02.1918 — data_staryj_stil (посчитан
  из нового стиля через юлианский день; старый стиль сверь с источником);
  из data/zapas/zapas.json (пункт 7) — кандидат этого героя на эту дату: chto_sluchilos, god, источник.

Остальное — пустое ("" , [] или null): это пишет помощник. Что пусто — машина печатает списком.
Машина ничего не придумывает и ничего не пишет в src/: печатает на экран или в файл --v (не в src/,
существующий не перезаписывает). Сборка сайта этот инструмент не зовёт.

Запуск: python3 tools/zagotovka-dnya.py <музей> <ММ-ДД> <tip:slug> [--god ГГГГ] [--god-pokaza ГГГГ] [--v файл]
"""
import argparse, glob, json, os, re, sys
from datetime import date

import slovar_dannye

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRANICA_STILEJ = date(1918, 2, 14)  # с этого дня в России новый стиль (декрет СНК от 24.01.1918)
VOENNYE = {'ne-sdayutsya'}  # пункт 19 стандарта дня: часть, операция, фронт — только у «Русские не сдаются»


def zagruzit(put):
    return json.load(open(f'{KOREN}/{put}', encoding='utf-8'))


def staryj_stil(d):
    """Григорианская дата → юлианская того же дня (через юлианский день, Fliegel — Van Flandern)."""
    jd = d.toordinal() + 1721425  # юлианский день в полдень
    c = jd + 32082
    dd = (4 * c + 3) // 1461
    e = c - 1461 * dd // 4
    m = (5 * e + 2) // 153
    return f'{dd - 4800 + m // 10:04d}-{m + 3 - 12 * (m // 10):02d}-{e - (153 * m + 2) // 5 + 1:02d}'


def zanyatye_nomera():
    nomera = set()
    for put in glob.glob(f'{KOREN}/src/content/days/*/*.json'):
        n = json.load(open(put, encoding='utf-8')).get('nomer_dnya')
        if n:
            nomera.add(n)
    for put in glob.glob(f'{KOREN}/src/content/dni-shablon/*/*.yaml'):
        for stroka in open(put, encoding='utf-8'):
            if stroka.startswith('nomer_dnya:'):
                nomera.add(stroka.split(':', 1)[1].strip().strip('"\''))
    return nomera


def pustoe(imya):
    if imya in ('god', 'god_pokaza', 'velichina_chislo', 'ves', 'god_tochnost', 'tyazhelaya_tema'):
        return None
    if imya in ('fakty', 'istochniki', 'citaty', 'etiketka_oblozhki', 'images'):
        return []
    return ''


def main():
    ap = argparse.ArgumentParser(description='Заготовка записи дня из записи словаря и даты (пункт 47).')
    ap.add_argument('muzei')
    ap.add_argument('den', help='ММ-ДД')
    ap.add_argument('geroy', help='id записи src/data/slovar/, «tip:slug»')
    ap.add_argument('--god', type=int, help='год события; дата события = год + ММ-ДД')
    ap.add_argument('--god-pokaza', type=int, help='год, в который день показывается')
    ap.add_argument('--v', help='записать в файл (не в src/, существующий не перезаписывается)')
    a = ap.parse_args()

    muzei = {m['slug']: m for m in zagruzit('src/data/museums.json')['museums']}
    if a.muzei not in muzei:
        sys.exit(f'нет музея «{a.muzei}» в src/data/museums.json')
    if not re.fullmatch(r'\d\d-\d\d', a.den):
        sys.exit('дата — ММ-ДД')
    try:
        date(2028, *map(int, a.den.split('-')))  # 2028 — високосный, 02-29 законна
    except ValueError:
        sys.exit(f'нет такого дня: {a.den}')
    slovar = slovar_dannye.chitat()
    if a.geroy.startswith('_') or a.geroy not in slovar:
        sys.exit(f'нет «{a.geroy}» в src/data/slovar/ — сначала запись словаря')
    tip, slug = a.geroy.split(':', 1)
    if tip not in slovar['_roli']['geroy']['tipy']:
        sys.exit(f'«{a.geroy}»: роль geroy только у {", ".join(slovar["_roli"]["geroy"]["tipy"])}')
    if a.den == '02-29':
        print('29 февраля: схема дня его не пускает — день ставят на 28-е, data_uslovnaya объясняет (пункт 3)', file=sys.stderr)

    forma = [p['imya'] for p in zagruzit('src/data/forma-dnya.json')['polya'] if '.' not in p['imya'] and p['imya'] != 'chistyj_tekst']
    # Не по всякому дню: data_uslovnaya — только если день стоит не на дату события, data_staryj_stil — машина ставит сама.
    forma = [k for k in forma if k not in ('data_uslovnaya', 'data_staryj_stil')]
    if a.muzei not in VOENNYE:
        forma = [k for k in forma if k not in ('voinskaya_chast', 'operaciya', 'front')]
    zap = {'museum': a.muzei, 'key': a.den}
    for k in forma:
        zap[k] = pustoe(k)
    zap['status'] = 'zagotovka'
    zap['slovar'] = [a.geroy]
    zap['slovar_roli'] = {a.geroy: 'geroy'}

    nomer = f'{a.muzei}-{a.den.replace("-", "")}-{slug}'
    if nomer in zanyatye_nomera():
        sys.exit(f'номер «{nomer}» уже занят — герой на этой дате в этом музее уже есть')
    zap['nomer_dnya'] = nomer

    otkuda = {}
    kand = [k for k in zagruzit('data/zapas/zapas.json')['dni'].get(f'{a.muzei}/{a.den}', []) if k.get('kartochka') == a.geroy]
    if kand:
        k = kand[0]
        zap['chto_sluchilos'] = k['sobytie']
        if not a.god and re.fullmatch(r'\d{1,4}', str(k['god'])):
            a.god = int(k['god'])
        zap['istochniki'] = [{'id': f'{k["istochnik"]["baza"]}-1', 'baza': k['istochnik']['baza'], 'nazvanie': '', 'ssylka': k['istochnik']['ssylka']}]
        otkuda['chto_sluchilos, istochniki'] = f'запас кандидатов, {k["nashel"]}'
    if a.god:
        d = date(a.god, *map(int, a.den.split('-')))
        zap['data_sobytiya'] = f'{a.god:04d}-{a.den}'
        zap['god'] = a.god
        zap['god_tochnost'] = 'tochno'
        if d < GRANICA_STILEJ:
            # старый стиль — сразу за датой события, как в образце docs/forma-dnya-obrazec.json
            zap = dict(sum(([(k, v), ('data_staryj_stil', staryj_stil(d))] if k == 'data_sobytiya' else [(k, v)] for k, v in zap.items()), []))
            otkuda['data_staryj_stil'] = 'посчитан машиной из нового стиля — сверь с источником'
    if a.god_pokaza:
        zap['god_pokaza'] = a.god_pokaza

    tekst = json.dumps(zap, ensure_ascii=False, indent=2) + '\n'
    if a.v:
        put = os.path.abspath(a.v)
        if put.startswith(f'{KOREN}/src/'):
            sys.exit('в src/ машина не пишет: карточки дней кладёт помощник сам')
        if os.path.exists(put):
            sys.exit(f'{a.v} уже есть — не перезаписываю')
        open(put, 'w', encoding='utf-8').write(tekst)
    else:
        sys.stdout.write(tekst)

    pusto = [k for k, v in zap.items() if v in ('', [], None)]
    print(f'{muzei[a.muzei]["title_ru"]}, {a.den}, герой — {slovar[a.geroy]["nazvanie"]}: номер {nomer}', file=sys.stderr)
    for k, v in otkuda.items():
        print(f'  {k}: {v}', file=sys.stderr)
    print(f'  заполнить ({len(pusto)}): {", ".join(pusto)}', file=sys.stderr)
    print('  data_uslovnaya — дописать, только если день стоит не на дату события (пункт 3)', file=sys.stderr)


if __name__ == '__main__':
    main()
