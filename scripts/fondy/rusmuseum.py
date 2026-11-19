"""Адаптер Русского музея (rusmuseum.ru) для `kadr.py zamena` (Р90); обёртка find_rusmuseum.

po_nomeru(kadr) -> [{fond, card, image, title, avtor, god, osnovanie}]
API: GET /api/search/?q= -> data.items[] (name, detailUrl /collections/..., previewPicture);
автор и полный скан — со страницы карточки. Сеть — fondy/_set.py (напрямую первым).
Права: © Русский музей, открытой лицензии нет — osnovanie пустое.
"""
import html
import json
import re
import sys
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import _set  # noqa: E402
from ermitazh import _familiya  # noqa: E402
from tretyakov import datirovka, god_dlya_sverki  # noqa: E402

FOND = "Государственный Русский музей"
BAZA = "https://rusmuseum.ru"
_s = _set.sessiya()


def _plain(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()


def nuxt_kartochka(h):
    """Карточка из __NUXT_DATA__ (devalue: значения — индексы в общем массиве): name, artist, propertyYears,
    detailPicture.src (полный скан), detailPicture.description (часто «Автор. Название. 1889. …»)."""
    m = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', h, re.S)
    if not m:
        return {}
    try:
        a = json.loads(m.group(1))
        mp = next(v for v in a if isinstance(v, dict) and 'propertyYears' in v and 'artist' in v)
    except (ValueError, StopIteration):
        return {}
    val = lambda i: a[i] if isinstance(i, int) and 0 <= i < len(a) else None
    pic = val(mp.get('detailPicture')) or {}
    pic = pic if isinstance(pic, dict) else {}
    out = {k: val(mp.get(k)) for k in ('name', 'artist', 'propertyYears', 'detailUrl')}
    out['image'], out['opisanie'] = val(pic.get('src')), val(pic.get('description'))
    return {k: (v.strip() if isinstance(v, str) else v) for k, v in out.items() if v not in (None, '')}


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
    for i in [x for x in items if (x.get('detailUrl') or '').startswith('/collections/')][:5]:  # ≤5 карточек
        card = BAZA + i['detailUrl']
        try:
            h = _set.get(_s, card).text
        except Exception:
            continue
        c = nuxt_kartochka(h)
        avt = [_plain(x) for x in re.findall(r'class="detail-info__name"[^>]*>(.*?)</', h, re.S)]
        avt = c.get('artist') or next((x.split(':', 1)[-1].strip() for x in avt if x.startswith(('Художник', 'Автор'))), '')
        if fam.lower() not in avt.lower():
            continue
        img = re.search(r'class="hero-image"[^>]*>\s*<img src="([^"]+)"', h)
        img = urllib.parse.urljoin(BAZA, urllib.parse.quote(c['image'], safe='/%')) if c.get('image') else \
            urllib.parse.urljoin(BAZA, html.unescape(img.group(1))) if img else \
            BAZA + ((i.get('previewPicture') or {}).get('src') or '')
        title = _plain(c.get('name') or i.get('name'))
        datir = str(c.get('propertyYears') or '')
        if not datirovka(datir):  # нет поля — год из подписи скана «Автор. Название. 1889. Холст…» или анонса
            g = re.search(r'\b(1[6-9]\d\d)\b', ' '.join(_plain(x) for x in (c.get('opisanie'), i.get('name'), i.get('previewText'))))
            datir = g.group(1) if g else ''
        r = {'fond': FOND, 'card': card, 'image': img, 'title': title, 'avtor': avt,
             'god': god_dlya_sverki(datir, kadr.get('god')), 'datirovka': datir, 'osnovanie': '', 'derzhatel': FOND}
        d = datirovka(datir)
        if d:
            r['god_ot'], r['god_do'] = d
        inv = re.search(r'\b(Ж|Р|Ск|ДРЖ|Гр)-\d+\b', c.get('image') or '')
        if inv and title.lower()[:6] in (c.get('opisanie') or '').lower():
            r['inv'] = inv.group(0)
        out.append(r)
    return out
