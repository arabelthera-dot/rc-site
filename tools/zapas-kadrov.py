#!/usr/bin/env python3
"""Р764 п.3 (Сергей 13.11.2026): запас кандидатов кадров на месяц одним машинным проходом.

Образец — запас вперёд у «Астрономического снимка дня» NASA (https://apod.nasa.gov/apod/archivepix.html)
и поиск по открытым API собраний с пометкой прав у каждого предмета, как у Европеаны
(https://pro.europeana.eu/page/apis, https://pro.europeana.eu/page/available-rights-statements).

Для каждого дня месяца, у которого есть запись src/content/days/<музей>/ММ-ДД.json, машина строит запросы
из самого дня (герой из slovar, название в «кавычках», фамилия после «·», имя героя в названии, название без
«первый в мире»), проходит наши разрешённые фонды через scripts/kadr.py podbor (Викисклад выключен, Р90;
PastVu без координат и НЭБ без страницы PDF пропускаются: у них нет файла кадра) и кладёт в запись дня поле
kandidaty_kadrov — 3–5 кадров: база, название, страница-источник, адрес файла, пометка прав.
Пометка — по таблице «база → пометка» src/data/spravochniki/pometki-prav.json (Р764 п.2); нет таблицы или базы
в ней — основание из bazy.json, иначе ne-oceneno (решает человек).

Картинки не скачиваются, остальные поля дня не меняются. Поле не входит в схему дня (src/content.config.ts),
Astro его отбрасывает: на сайт оно не попадает. Сборка сайта этот инструмент не зовёт.

  python3 tools/zapas-kadrov.py <музей> <ММ> [ДД ДД …]   — собрать (день с полем пропускается; --zanovo — пересобрать)
  python3 tools/zapas-kadrov.py --schet <музей> <ММ>     — сколько дней получили ≥3 кандидатов
  python3 tools/zapas-kadrov.py --ubrat <музей> <ММ>     — откат: убрать поле из всех дней месяца
  --tablica <файл>   — таблица прав из другого места (пока п.2 не слит: git show origin/r764-prava-tablica:…)
"""
import argparse, contextlib, datetime, io, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
POLE = 'kandidaty_kadrov'
NADO, POTOLOK = 3, 5
FAYL = re.compile(r'^https?://\S+\.(?:jpe?g|png|tiff?|webp)$|/muzfo-imaginator/rest/images/', re.I)
PERVYY = re.compile(r'(?i)\b(?:перв(?:ый|ая|ое|ые)\s+в\s+(?:мире|россии)|первое\s+в\s+мире|первые)\b')


def chitat(p):
    return json.loads(Path(p).read_text(encoding='utf-8'))


def zapisat(p, d):
    """Вид файла сохраняется: отступ 2, кириллица как есть, перевод строки в конце — как был."""
    konec = '\n' if Path(p).read_text(encoding='utf-8').endswith('\n') else ''
    Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=2) + konec, encoding='utf-8')


def zaprosy(d, slovar):
    """Запросы от точного к общему, без повторов; не больше четырёх."""
    t = d.get('title') or ''
    out = []
    for s in d.get('slovar') or []:
        if s.startswith(('lyudi:', 'tema:')) and s in slovar:
            out.append(slovar[s]['nazvanie'])
    out += re.findall(r'«([^»]+)»', t)
    out += re.findall(r'·\s*(?:[А-ЯЁ]\.\s*)+([А-ЯЁ][а-яё-]+)', t)
    imya = re.fullmatch(r'(?:[а-яё]+\s+)?([А-ЯЁ][а-яё]+)\s+([А-ЯЁ][а-яё-]+)(?:\s+\(([^)]+)\))?', t)
    if imya:  # «Виктор Талалихин», «святитель Лука (Войно-Ясенецкий)»
        out += [f'{imya[1]} {imya[2]}', imya[3] or imya[2]]
    for s in list(out):
        if ' ' in s and re.fullmatch(r'[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё-]+', s):
            out.append(s.split()[1])  # фамилия — если полное имя не нашлось
    ochishcheno = re.sub(r'\s+', ' ', PERVYY.sub('', re.sub(r'·.*|\(.*?\)|«|»', '', t))).strip(' ,')
    if ochishcheno and not imya:
        out.append(ochishcheno)
        slova = [w for w in re.findall(r'[А-Яа-яЁё-]{5,}', ochishcheno)]
        if len(slova) > 1:
            out.append(max(slova, key=len))
    vid = []
    for q in out:
        q = q.strip()
        if len(q) >= 3 and q.lower() not in [v.lower() for v in vid]:
            vid.append(q)
    return vid[:4]


def pometka(baza, tablica, bazy):
    if tablica and baza in tablica.get('tablica', {}):
        return tablica['tablica'][baza], 'pometki-prav.json'
    return (bazy.get(baza) or {}).get('osnovanie') or 'ne-oceneno', 'bazy.json'


def sobrat(muzei, key, d, slovar, tablica, bazy):
    import kadr
    kadr.POISK_PDF = []  # НЭБ отдаёт издание, не файл кадра
    qs, kadry, videl = zaprosy(d, slovar), [], set()
    for q in qs:
        with contextlib.redirect_stdout(io.StringIO()):
            vse = kadr.podbor(muzei, key, [q], n=10)
        for r in vse:
            baza, fayl = r['фонд'], r['файл'].split(':', 1)[1]
            if baza not in bazy or not FAYL.search(fayl) or fayl in videl:
                continue
            videl.add(fayl)
            pm, otkuda = pometka(baza, tablica, bazy)
            kadry.append({'baza': baza, 'nazvanie': r['название'], 'avtor': r['автор'], 'stranica': r['карточка'],
                          'fayl': fayl, 'pometka_prav': pm, 'prava_iz': otkuda, 'pasport': r['паспорт'], 'zapros': q})
        if len(kadry) >= POTOLOK:
            break
    return {'sobrano': datetime.date.today().isoformat(), 'mashina': 'tools/zapas-kadrov.py', 'zaprosy': qs,
            'kadry': kadry[:POTOLOK]}


def main():
    ap = argparse.ArgumentParser(description='Запас кандидатов кадров на месяц (Р764 п.3).')
    ap.add_argument('muzei')
    ap.add_argument('mesyac')
    ap.add_argument('dni', nargs='*')
    ap.add_argument('--zanovo', action='store_true')
    ap.add_argument('--schet', action='store_true')
    ap.add_argument('--ubrat', action='store_true')
    ap.add_argument('--tablica', default=str(ROOT / 'src/data/spravochniki/pometki-prav.json'))
    a = ap.parse_args()
    puti = sorted((ROOT / f'src/content/days/{a.muzei}').glob(f'{a.mesyac}-*.json'))
    if a.dni:
        puti = [p for p in puti if p.stem.split('-')[1] in a.dni]
    if a.ubrat:
        n = 0
        for p in puti:
            d = chitat(p)
            if d.pop(POLE, None) is not None:
                zapisat(p, d)
                n += 1
        print(f'{a.muzei} {a.mesyac}: поле {POLE} убрано из {n} дней')
        return
    if a.schet:
        est = [len(chitat(p).get(POLE, {}).get('kadry', [])) for p in puti]
        print(f'{a.muzei} {a.mesyac}: ≥{NADO} кандидатов — {sum(k >= NADO for k in est)} из {len(puti)} дней; '
              f'без поля — {sum(POLE not in chitat(p) for p in puti)}')
        for p, k in zip(puti, est):
            if k < NADO:
                print(f'  {p.stem}: {k}')
        return
    slovar = chitat(ROOT / 'src/data/slovar.json')
    bazy = {b['id']: b for b in chitat(ROOT / 'src/data/spravochniki/bazy.json')['razresheny']}
    tablica = chitat(a.tablica) if Path(a.tablica).is_file() else None
    for p in puti:
        d = chitat(p)
        if POLE in d and not a.zanovo:
            continue
        d[POLE] = sobrat(a.muzei, p.stem, d, slovar, tablica, bazy)
        zapisat(p, d)
        print(f"{a.muzei}/{p.stem}: {len(d[POLE]['kadry'])} — {' | '.join(d[POLE]['zaprosy'])}", flush=True)


if __name__ == '__main__':
    main()
