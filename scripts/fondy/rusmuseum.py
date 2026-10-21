"""Адаптер Русского музея (rusmuseum.ru) для `kadr.py zamena` (Р90); обёртка find_rusmuseum.

po_nomeru(kadr) -> [{fond, card, image, title, avtor, god, osnovanie}]
API: GET /api/search/?q= -> data.items[] (name, detailUrl /collections/..., previewPicture);
автор и полный скан — со страницы карточки. Сеть — fondy/_set.py (напрямую первым).
Права: © Русский музей, открытой лицензии нет — osnovanie пустое.
"""
import html
import re
import sys
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import _set  # noqa: E402
from ermitazh import _familiya  # noqa: E402

FOND = "Государственный Русский музей"
BAZA = "https://rusmuseum.ru"
_s = _set.sessiya()


def _plain(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()


def po_nomeru(kadr: dict) -> list:
    d = (kadr.get('derzhatel') or '').lower()
    if d and 'русск' not in d:
        return []
    fam = _familiya(kadr.get('avtor'))
    nazv = (kadr.get('nazvanie') or kadr.get('syuzhet') or '').strip(' «»')
    if not fam or not nazv:
        return []
    try:
        items = _set.get(_s, f'{BAZA}/api/search/', params={'q': f'{fam} {nazv}'}).json()['data']['items']
    except Exception as e:
        print(f'[rusmuseum] {fam} {nazv}: {e}', file=sys.stderr)
        return []
    out = []
    for i in items[:8]:
        if not (i.get('detailUrl') or '').startswith('/collections/'):
            continue
        card = BAZA + i['detailUrl']
        try:
            h = _set.get(_s, card).text
        except Exception:
            continue
        avt = [_plain(x) for x in re.findall(r'class="detail-info__name"[^>]*>(.*?)</', h, re.S)]
        avt = next((x.split(':', 1)[-1].strip() for x in avt if x.startswith(('Художник', 'Автор'))), '')
        if fam.lower() not in avt.lower():
            continue
        img = re.search(r'class="hero-image"[^>]*>\s*<img src="([^"]+)"', h)
        img = urllib.parse.urljoin(BAZA, html.unescape(img.group(1))) if img else \
            BAZA + ((i.get('previewPicture') or {}).get('src') or '')
        god = re.search(r'\b(1[6-9]\d\d)\b', _plain(i.get('name')) + ' ' + _plain(i.get('previewText')))
        out.append({'fond': FOND, 'card': card, 'image': img, 'title': _plain(i.get('name')),
                    'avtor': avt, 'god': god.group(1) if god else '', 'osnovanie': '', 'derzhatel': FOND})
    return out
