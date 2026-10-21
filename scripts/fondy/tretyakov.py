"""Адаптер Третьяковской галереи (my.tretyakov.ru) для `kadr.py zamena` (Р90); обёртка find_tretyakov.

po_nomeru(kadr) -> [{fond, card, image, title, avtor, god, osnovanie}]
API: GET /api/v1/gallery/get/?search[q]=<фамилия название>&pageSize=20&lang=ru -> data.items[]
(id, name, author[].nameRaw, pictureBig[]). Сеть — fondy/_set.py (напрямую первым).
Права: некоммерческое использование с подписью «Из собрания Третьяковской галереи» — osnovanie пустое,
решение о праве — за kadr.py/человеком.
"""
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


def po_nomeru(kadr: dict) -> list:
    d = (kadr.get('derzhatel') or '').lower()
    if d and 'третьяков' not in d:
        return []
    fam = _familiya(kadr.get('avtor'))
    nazv = (kadr.get('nazvanie') or kadr.get('syuzhet') or '').strip(' «»')
    if not fam or not nazv:
        return []
    try:
        r = _set.get(_s, f'{BAZA}/api/v1/gallery/get/',
                     params={'search[q]': f'{fam} {nazv}', 'pageNum': 1, 'pageSize': 20, 'lang': 'ru'})
        items = ((r.json().get('data') or {}).get('items')) or []
    except Exception as e:
        print(f'[tretyakov] {fam} {nazv}: {e}', file=sys.stderr)
        return []
    out = []
    for i in items:
        a = _avtor(i)
        if fam.lower() not in a.lower():
            continue
        out.append({'fond': FOND, 'card': f"{BAZA}/app/masterpiece/{i['id']}",
                    'image': (i.get('pictureBig') or [''])[0], 'title': (i.get('name') or '').strip(),
                    'avtor': a, 'god': '', 'osnovanie': '', 'derzhatel': FOND})
    return out
