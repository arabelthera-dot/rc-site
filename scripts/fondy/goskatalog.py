"""Госкаталог музейного фонда РФ — адаптер для `kadr.py zamena` (Р90: кадры Викисклада → русские фонды).

po_nomeru(kadr) -> [{fond, card, image, title, avtor, god, osnovanie}]
kadr = {muzey, den, fayl, podpis, derzhatel, inv, avtor, god, syuzhet}

Порядок: 1) инвентарный/КП-номер + музей-держатель (точное совпадение номера, держатель по museumId);
2) нет номера или пусто — автор + сюжет, держатель (если задан) обязателен.
Сеть — fondy/_set.py: напрямую первым (таймаут 9 с), затем туннель kadr.RU_PROXY (127.0.0.1:8899, ru_tunnel.py;
rf-proxy:1080 забанен, 403); не ответил никак — хост пропускается до конца прогона.
Браузерный User-Agent обязателен: с Python-UA портал отвечает 403. Права Госкаталог не даёт.
"""
import json, re, sys, threading, urllib.parse, urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import kadr as _kadr  # noqa: E402  RU_PROXY и find_goskatalog — общие с kadr.py
sys.path.insert(0, str(Path(__file__).parent))
import _set  # noqa: E402

GK = 'https://goskatalog.ru'
HEAD = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0', 'Content-Type': 'application/json',
        'Accept': 'application/json', 'Origin': GK, 'Referer': GK + '/portal/'}
find_goskatalog = _kadr.find_goskatalog  # печатный поиск kadr.py find — тот же API
_MUZ = {}


_S = _set.sessiya(HEAD['User-Agent'])
_S.headers.update(HEAD)


# Напрямую Госкаталог из сервера закрыт: сразу узел, до 60 с (один туннель на 3–4 параллельных запроса).
_HOST = urllib.parse.urlparse(GK).hostname
_POVTOROV = 3


def _open(path, data=None, timeout=None):
    for k in range(_POVTOROV):
        _set._put[_HOST] = 'proxy'
        try:
            r = _set.zapros(_S, 'POST' if data is not None else 'GET', GK + path, data=data,
                            timeout=timeout or 60, proxy=_kadr.RU_PROXY)
            r.raise_for_status()
            return r.json()
        except Exception:
            if k == _POVTOROV - 1:
                raise
            threading.Event().wait(3 * (k + 1))


def poisk(q, n=20):
    """POST /muzfo-rest/rest/exhibits/ext — то же, что find_goskatalog, но объекты, а не печать."""
    qs = urllib.parse.urlencode(dict(statusIds=6, publicationLimit='false', limit=n, offset=0, q=q, calcCountsType=1))
    return _open(f'/muzfo-rest/rest/exhibits/ext?{qs}', data=b'[]').get('objects', [])


def muzey(mid):
    """Название музея по museumId (кэш)."""
    if mid not in _MUZ:
        try:
            _MUZ[mid] = _open(f'/muzfo-rest/rest/museums/{mid}', timeout=30).get('name', '')
        except Exception:
            _MUZ[mid] = ''
    return _MUZ[mid]


def _norm(s):
    return re.sub(r'[\s\-–—_./№]+', '', str(s or '')).upper().replace('Ё', 'Е')


def _slova(s):
    stop = {'государственный', 'музей', 'федеральное', 'учреждение', 'культуры', 'бюджетное', 'имени', 'им'}
    return {w for w in re.findall(r'\w{3,}', str(s or '').lower().replace('ё', 'е')) if w not in stop}


def _derzhatel_ok(o, derzhatel):
    if not derzhatel:
        return True
    want = _slova(derzhatel)
    have = _slova(muzey(o.get('museumId')))
    return bool(want) and len(want & have) >= max(1, (len(want) + 1) // 2)


def _nomer_ok(o, inv):
    n = _norm(inv)
    return bool(n) and n in {_norm(o.get('invNumber')), _norm(o.get('gikNumber')),
                             _norm(f"{o.get('gikCodePart') or ''}{o.get('gikNumPart') or ''}")}


def _vid(o, osnovanie, kadr):
    img = (o.get('mainImage') or {}).get('id')
    avt = ', '.join(a.get('name', '') for a in o.get('authors') or [] if isinstance(a, dict))
    return {'fond': 'goskatalog', 'card': f"{GK}/portal/#/collections?id={o['id']}",
            'image': f'{GK}/muzfo-imaginator/rest/images/original/{img}', 'title': o.get('name', ''),
            'avtor': avt or kadr.get('avtor') or '', 'god': kadr.get('god') or '',
            'osnovanie': f"{osnovanie}; держатель: {muzey(o.get('museumId')) or o.get('museumId')}; "
                         f"инв. {o.get('invNumber') or '—'}, КП {o.get('gikNumber') or '—'}; "
                         'права Госкаталог не даёт — автор и год смерти по карточке'}


def _safe(q, n=20):
    try:
        return poisk(q, n)
    except Exception as e:  # API отдаёт 500 на часть номеров с дефисом — пробуем дальше
        print(f'  goskatalog: «{q}» — {type(e).__name__} {e}', file=sys.stderr)
        return []


def po_nomeru(kadr: dict) -> list:
    inv, derzh = (kadr.get('inv') or '').strip(), (kadr.get('derzhatel') or '').strip()
    out, seen = [], set()

    def add(objs, osn, need_nomer):
        for o in objs:
            if o['id'] in seen or not (o.get('mainImage') or {}).get('id'):
                continue
            if need_nomer and not _nomer_ok(o, inv):
                continue
            if not _derzhatel_ok(o, derzh):
                continue
            seen.add(o['id'])
            out.append(_vid(o, osn, kadr))

    if inv:
        for q in dict.fromkeys([inv, re.sub(r'[\-–—]', ' ', inv), f'{inv} {kadr.get("avtor") or ""}'.strip()]):
            add(_safe(q), f'инв. номер {inv} совпал', True)
            if out:
                return out
    q = ' '.join(x for x in (kadr.get('avtor'), kadr.get('nazvanie') or kadr.get('syuzhet') or kadr.get('podpis')) if x)
    if q:
        add(_safe(q[:120]), f'поиск «{q[:60]}»' + (' + держатель' if derzh else ''), False)
    return out


if __name__ == '__main__':  # проверка: python3 scripts/fondy/goskatalog.py '{"avtor":"Айвазовский","syuzhet":"Девятый вал"}'
    print(json.dumps(po_nomeru(json.loads(sys.argv[1])), ensure_ascii=False, indent=1))
