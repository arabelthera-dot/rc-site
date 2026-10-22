"""Адаптер ГМИИ им. А. С. Пушкина (collection.pushkinmuseum.art) для `kadr.py zamena` (Р90).

po_nomeru(kadr) -> [{fond, card, image, title, avtor, god, osnovanie, inv, derzhatel}]
Сайт — Angular SPA (платформа КАМИС-коллекции), API открыт без ключа:
  POST /api/search-entities/OBJECT  {"start":0,"count":N,"query":"…","filters":{}}
       -> {totalCount, data:[{id, title:"Фамилия И.О. Вид. Название. Дата", image}]}
       query — слова через И (все должны найтись), ищет и по инв. номеру (record_id, «ГР-86641»).
  GET  /api/entity/OBJECT/<id> -> data[]: author[].title «Фамилия Имя Отчество (автор)», object_title,
       create_date4 (датировка), record_id (инв.), images[].path.
  Карточка — /entity/OBJECT/<id>; картинка /api/spf/<ключ>.jpg без параметров — миниатюра,
  с ?w=4000&h=4000 — наибольший размер, который отдаёт сайт.
Сеть — fondy/_set.py (напрямую первым). Права: osnovanie пустое, решение — за kadr.py/человеком.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import _set  # noqa: E402
from ermitazh import _familiya  # noqa: E402

FOND = "ГМИИ им. А. С. Пушкина"
BAZA = "https://collection.pushkinmuseum.art"
BOLSHOY = "?w=4000&h=4000"
MAKS = 5  # карточек на кадр
_s = _set.sessiya()


def _nash(derzh):
    d = (derzh or '').lower()
    return not d or 'гмии' in d or 'пушкин' in d


def _pole(e, attr):
    for a in e.get('data') or []:
        if a.get('attribute') == attr:
            if a.get('value'):
                return [str(v) for v in a['value']]
            return [str(x.get('title') or '') for x in a.get('data') or []]
    return []


def _imya(t):
    """«Теребенев Иван Иванович (автор)» -> «Иван Иванович Теребенев» (фамилия последней — как ждёт kadr.strogo)."""
    t = re.sub(r'\s*\([^)]*\)\s*$', '', t or '').strip()
    w = t.split()
    return ' '.join(w[1:] + w[:1]) if len(w) > 1 else t


def razobrat(e: dict) -> dict:
    """Ответ /api/entity/OBJECT/<id> -> запись адаптера (офлайн, для тестов)."""
    avtor = ', '.join(_imya(a) for a in _pole(e, 'author') if a)
    data_ = (_pole(e, 'create_date4') or [''])[0]
    g = re.search(r'1[0-9]\d{2}|20[0-2]\d', data_)
    img = next((i.get('path') for i in e.get('images') or [] if i.get('main')), None) or e.get('image') or ''
    return {'fond': FOND, 'card': f"{BAZA}/entity/OBJECT/{e.get('id')}",
            'image': (BAZA + img + BOLSHOY) if img else '',
            'title': (_pole(e, 'object_title') or [e.get('title') or ''])[0].strip(),
            'avtor': avtor, 'god': g.group(0) if g else '', 'datirovka': data_,
            'inv': (_pole(e, 'record_id') or [''])[0], 'derzhatel': FOND, 'osnovanie': ''}


def _poisk(q, n=50):
    r = _set.post(_s, f'{BAZA}/api/search-entities/OBJECT', json={'start': 0, 'count': n, 'query': q, 'filters': {}})
    return r.json().get('data') or []


def _kartochka(i):
    return razobrat(_set.get(_s, f"{BAZA}/api/entity/OBJECT/{i}").json())


def _slova(s):
    return {w[:-1] for w in re.findall(r'[а-яёa-z]{4,}', (s or '').lower().replace('ё', 'е'))}


def po_nomeru(kadr: dict) -> list:
    if not _nash(kadr.get('derzhatel')):
        return []
    inv = (kadr.get('inv') or '').strip()
    fam = _familiya(kadr.get('avtor'))
    nazv = (kadr.get('nazvanie') or kadr.get('syuzhet') or '').strip(' «»')
    out = []
    try:
        if inv:
            for d in _poisk(inv, 10):
                k = _kartochka(d['id'])
                if re.sub(r'\W', '', k['inv']).lower() == re.sub(r'\W', '', inv).lower():
                    out.append(k)
            if out:
                return out
        if not fam:
            return []
        # Поиск — И по всем словам: «фамилия + название» часто пуст, поэтому — по фамилии, сверка названия здесь.
        hity = _poisk(fam, 100)
        sl = _slova(nazv)
        f = fam.lower().replace('ё', 'е')
        hity = [d for d in hity if f in (d.get('title') or '').lower().replace('ё', 'е')]
        if sl:
            hity.sort(key=lambda d: -len(sl & _slova(d.get('title'))))
            hity = [d for d in hity if sl & _slova(d.get('title'))]
        for d in hity[:MAKS]:
            out.append(_kartochka(d['id']))
    except Exception as e:
        print(f'[pushkin] {inv or fam} {nazv}: {e}', file=sys.stderr)
    return out
