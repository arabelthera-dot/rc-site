"""Адаптер Третьяковской галереи (my.tretyakov.ru) для `kadr.py zamena` (Р90); обёртка find_tretyakov.

po_nomeru(kadr) -> [{fond, card, image, title, avtor, god, osnovanie}]
API: GET /api/v1/gallery/get/?search[q]=<фамилия название>&pageSize=20&lang=ru -> data.items[]
(id, name, author[].nameRaw, pictureBig[]). Сеть — fondy/_set.py (напрямую первым).
Права: некоммерческое использование с подписью «Из собрания Третьяковской галереи» — osnovanie пустое,
решение о праве — за kadr.py/человеком.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import _set  # noqa: E402
from ermitazh import _familiya  # noqa: E402

FOND = "Государственная Третьяковская галерея"
BAZA = "https://my.tretyakov.ru"
_s = _set.sessiya()


def _avtor(i):
    return ', '.join(a.get('nameRaw', '') for a in i.get('author') or [] if isinstance(a, dict))


def datirovka(s):
    """«1905–1906», «Первая половина 1820-х», «Около 1408» -> (от, до) или None."""
    s = str(s or '')
    g = [int(x) for x in re.findall(r'(?<!\d)(1[0-9]\d\d)(?!\d)', s)]
    if not g:
        return None
    ot, do = min(g), max(g)
    if re.search(r'(1[0-9]\d0)-?х', s) and len(g) == 1:
        do = ot + 9
    return ot, do


def god_dlya_sverki(datir, god_kadra):
    """Год для kadr.strogo (берёт первые 4 цифры): год кадра, если он попадает в датировку, иначе начало."""
    d = datirovka(datir)
    if not d:
        return ''
    gk = int(god_kadra) if str(god_kadra or '').isdigit() else None
    if gk and d[0] <= gk <= d[1]:
        return str(gk) if str(datir).strip() == str(gk) else f'{gk} (датировка: {str(datir).strip()})'
    return str(datir).strip() if re.match(r'\d{4}', str(datir).strip()) else f'{d[0]} (датировка: {str(datir).strip()})'


def kartochka(iid):
    """GET /api/v1/gallery/getById/?id= -> data (name, author[].name «Фамилия Имя», creat, invnum, pictureBig)."""
    return (_set.get(_s, f'{BAZA}/api/v1/gallery/getById/', params={'id': iid, 'lang': 'ru'}).json() or {}).get('data') or {}


def _poisk(q):
    r = _set.get(_s, f'{BAZA}/api/v1/gallery/get/', params={'search[q]': q, 'pageNum': 1, 'pageSize': 20, 'lang': 'ru'})
    return ((r.json().get('data') or {}).get('items')) or []


def po_nomeru(kadr: dict) -> list:
    d = (kadr.get('derzhatel') or '').lower()
    if d and 'третьяков' not in d:
        return []
    fam = _familiya(kadr.get('avtor'))
    nazv = (kadr.get('nazvanie') or kadr.get('syuzhet') or '').strip(' «»')
    if not fam or not nazv:
        return []
    try:
        # поиск ищет подстроку в названии: «фамилия + название» часто пуст — тогда название, затем фамилия
        items = []
        for q in (f'{fam} {nazv}', nazv, fam):
            items = [i for i in _poisk(q) if fam.lower() in _avtor(i).lower()]
            if items:
                break
    except Exception as e:
        print(f'[tretyakov] {fam} {nazv}: {e}', file=sys.stderr)
        return []
    out = []
    for i in items[:5]:  # не больше 5 карточек на запрос
        try:
            c = kartochka(i['id'])
        except Exception as e:
            print(f'[tretyakov] карточка {i["id"]}: {e}', file=sys.stderr)
            c = {}
        a = ', '.join(' '.join(reversed((x.get('name') or '').split(' ', 1))) for x in c.get('author') or []
                      if isinstance(x, dict)) or _avtor(i)
        datir = (c.get('creat') or '').strip()
        r = {'fond': FOND, 'card': f"{BAZA}/app/masterpiece/{i['id']}",
             'image': (c.get('pictureBig') or i.get('pictureBig') or [''])[0],
             'title': (c.get('name') or i.get('name') or '').strip(), 'avtor': a,
             'god': god_dlya_sverki(datir, kadr.get('god')), 'datirovka': datir,
             'osnovanie': '', 'derzhatel': FOND}
        d = datirovka(datir)
        if d:
            r['god_ot'], r['god_do'] = d
        inv = re.sub(r'^\s*Инв\.?\s*', '', c.get('invnum') or '').strip()
        if inv:
            r['inv'] = inv
        out.append(r)
    return out
