"""Адаптер РГБ / НЭБ / Президентской библиотеки для `kadr.py zamena` (Р90).

po_nomeru(kadr) -> [{fond, card, image, title, avtor, god, osnovanie}]
Ищет по шифру (kadr['inv']) и по названию+автору+году (podpis/syuzhet, avtor, god).

Что открыто публично (проверено 21.10.2026):
- РГБ: search.rsl.ru — POST /site/ajax-search (нужен csrf с /ru/search), напрямую.
  Карточка — https://search.rsl.ru/ru/record/<id>; olden.rsl.ru отдаёт 401 всем (и через прокси РФ) —
  не используем. Скан — ссылка «Читать» (viewer.rsl.ru), только у документов открытого доступа.
- НЭБ: rusneb.ru/search/?q= — только через прокси РФ (напрямую 403). Карточка /catalog/<id>/,
  скан — PDF через /local/tools/exalead/getFiles.php (у открытых изданий).
- Президентская: prlib.ru/search?query= — через прокси РФ; выдача без JS почти не фильтруется,
  поэтому берём только записи, где в названии есть слова запроса.
"""
import re
import requests
from bs4 import BeautifulSoup

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import _set  # noqa: E402  напрямую первым, затем прокси; закрытый хост — пропуск на прогон

ODO = 'общественное достояние: автор умер более 70 лет назад / издание до 1925 г. — проверить по автору'


def _s():
    return _set.sessiya()


def _get(s, url, **kw):
    return _set.get(s, url, **kw)


def _god(text):
    m = re.findall(r'\b(1[5-9]\d\d|20[0-2]\d)\b', text or '')
    return m[-1] if m else ''


def _osnovanie(god, avtor_text=''):
    try:
        g = int(god)
    except (TypeError, ValueError):
        return ''
    if g < 1900:
        return f'издание {g} г.; ' + ODO
    return ''


def _slova(text):
    return [w for w in re.findall(r'[A-Za-zА-Яа-яЁё]{4,}', text or '')][:6]


# ---------- РГБ ----------
MAKS_KAND = 5  # записей на запрос, для каждой — запрос карточки
ZHURNALY = ('будильник', 'сатирикон', 'крокодил', 'стрекоза', 'осколки', 'искра', 'развлечение', 'шут',
            'зритель', 'жупел', 'адская почта', 'бич', 'овод', 'пулемёт', 'пулемет', 'заноза', 'нива', 'огонёк', 'огонек')


def _marc(soup):
    """{тег: [строка с $подполями]} из таблицы MARC на карточке search.rsl.ru/ru/record/<id>."""
    m = {}
    for tr in soup.select('table tr'):
        c = [x.get_text(' ', strip=True) for x in tr.find_all(['th', 'td'])]
        if len(c) >= 2 and re.fullmatch(r'\d{3}|LDR', c[0]):
            m.setdefault(c[0], []).append(c[1])
    return m


def _pp(stroka, kod):
    """Подполе $kod из строки MARC («## $a Москва $c 1873» → '1873' для 'c')."""
    m = re.search(r'\$%s\s+(.*?)(?=\s\$[a-z0-9]\s|$)' % kod, stroka or '')
    return m.group(1).strip(' :/;,.') if m else ''


def _imya(a):
    """«Теребенев, Иван Иванович» → «Иван Иванович Теребенев» (фамилия последним словом — для kadr.strogo)."""
    a = (a or '').strip(' ,.')
    if ',' in a:
        f, i = [x.strip() for x in a.split(',', 1)]
        a = f'{i} {f}'.strip()
    return a


def rgb_zapis(s, rid):
    """Карточка РГБ: точное название, автор, год, шифр хранения, выпуск журнала (773 — «часть от»)."""
    soup = BeautifulSoup(_get(s, f'https://search.rsl.ru/ru/record/{rid}').text, 'html.parser')
    m = _marc(soup)
    f = lambda tag, kod: next((_pp(x, kod) for x in m.get(tag, []) if _pp(x, kod)), '')
    title = ' : '.join(x for x in (f('245', 'a'), f('245', 'b')) if x)
    nomer = ' '.join(x for x in (f('245', 'n'), f('245', 'p')) if x)
    chast = f('773', 't')  # выпуск: «1873, № 4» — часть журнала «Будильник»
    if chast:
        title = f'{chast}, {title}'.strip(', ')
    if nomer:
        title = f'{title}. {nomer}'
    god = ''
    for tag in ('260', '264', '773'):
        for x in m.get(tag, []):
            god = god or _god(_pp(x, 'c') or _pp(x, 'd') or _pp(x, 'g'))
    if not god:
        d008 = (m.get('008') or [''])[0]
        god = d008[7:11] if re.fullmatch(r'1[5-9]\d\d|20[0-2]\d', d008[7:11]) else ''
    avtor = _imya(f('100', 'a') or f('700', 'a'))
    shifr = f('852', 'j') or f('852', 'h')
    return {'title': title, 'god': god, 'avtor': avtor, 'inv': shifr}


def rgb(zapros, n=MAKS_KAND):
    s = _s()
    r = _get(s, 'https://search.rsl.ru/ru/search')
    m = re.search(r'csrf-token" content="([^"]+)', r.text)
    if not m:
        return []
    tok = m.group(1)
    j = _set.post(s, 'https://search.rsl.ru/site/ajax-search?language=ru',
               data={'SearchFilterForm[search]': zapros, '_csrf': tok},
               headers={'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-Token': tok}).json()
    soup = BeautifulSoup(j.get('content') or '', 'html.parser')
    out, byli = [], set()
    for d in soup.select('div.search-container'):
        rid = d.get('data-id')
        if not rid or rid in byli:
            continue
        byli.add(rid)
        main = d.select_one('.js-item-maininfo')
        title = main.get_text(' ', strip=True) if main else ''
        au = d.select_one('.js-item-authorinfo')
        read = d.select_one('a.rsl-itemaction-read-link')
        href = read.get('href') if read else ''
        if href and href.startswith('/'):
            href = 'https://search.rsl.ru' + href
        z = {}
        try:
            z = rgb_zapis(s, rid)
        except requests.RequestException:
            pass
        god = z.get('god') or _god(title)
        out.append({'fond': 'РГБ', 'derzhatel': 'Российская государственная библиотека', 'inv': z.get('inv', ''),
                    'card': f'https://search.rsl.ru/ru/record/{rid}',
                    'image': href if href and href != '#' else '',
                    'title': (z.get('title') or title)[:300], 'opisanie': title[:300],
                    'avtor': z.get('avtor') or _imya(au.get_text(' ', strip=True) if au else ''),
                    'god': god, 'osnovanie': _osnovanie(god) if href else ''})
        if len(out) >= n:
            break
    return out


def zhurnal(kadr):
    """Название журнала из подписи/названия кадра («Будильник», «Сатирикон»…) или ''."""
    t = ' '.join(str(kadr.get(x) or '') for x in ('nazvanie', 'syuzhet', 'podpis')).lower()
    return next((z for z in ZHURNALY if re.search(r'\b' + z, t)), '')


# ---------- НЭБ ----------
def neb(zapros, n=MAKS_KAND):
    s = _s()
    r = _get(s, 'https://rusneb.ru/search/', params={'q': zapros})
    soup = BeautifulSoup(r.text, 'html.parser')
    seen, out = set(), []
    for a in soup.select('a[href^="/catalog/"]'):
        href = a['href'].rstrip('/')
        t = a.get_text(' ', strip=True)
        if href in seen or not t or t == 'Подробнее' or t.startswith('"'):
            continue
        seen.add(href)
        bid = href.split('/')[-1]
        card = f'https://rusneb.ru/catalog/{bid}/'
        image = ''
        try:
            c = _get(s, card).text
            m = re.search(r'(/local/tools/exalead/getFiles\.php\?book_id=[^"&]+&amp;name=[^"]+?doc_type=pdf)', c) \
                or re.search(r'(/local/tools/exalead/getFiles\.php\?book_id=[^"]+?doc_type=pdf)', c)
            if m:
                image = 'https://rusneb.ru' + m.group(1).replace('&amp;', '&')
        except requests.RequestException:
            pass
        god = _god(t)
        out.append({'fond': 'НЭБ', 'card': card, 'image': image, 'title': t[:300], 'avtor': '',
                    'god': god, 'osnovanie': _osnovanie(god) if image else ''})
        if len(out) >= n:
            break
    return out


# ---------- Президентская ----------
def prlib(zapros, n=MAKS_KAND):
    s = _s()
    try:
        r = _get(s, 'https://www.prlib.ru/search', params={'query': zapros})
    except requests.RequestException:
        return []
    soup = BeautifulSoup(r.text, 'html.parser')
    slova = [w.lower()[:5] for w in _slova(zapros)]
    out, seen = [], set()
    for a in soup.select('a[href^="/item/"]'):
        t = a.get_text(' ', strip=True)
        if not t or a['href'] in seen:
            continue
        seen.add(a['href'])
        if slova and not any(w in t.lower() for w in slova):
            continue  # выдача без JS не фильтруется — отсекаем мусор
        god = _god(t)
        out.append({'fond': 'Президентская библиотека', 'card': 'https://www.prlib.ru' + a['href'],
                    'image': '', 'title': t[:300], 'avtor': '', 'god': god, 'osnovanie': ''})
        if len(out) >= n:
            break
    return out


def po_nomeru(kadr: dict) -> list:
    kadr = kadr or {}
    zaprosy = []
    if kadr.get('inv'):
        zaprosy.append(str(kadr['inv']))
    nazv = kadr.get('nazvanie') or kadr.get('syuzhet') or kadr.get('podpis') or ''
    q = ' '.join(x for x in [nazv, kadr.get('avtor') or '', str(kadr.get('god') or '')] if x).strip()
    zh = zhurnal(kadr)
    if zh and kadr.get('god'):
        # журнал: сначала запись выпуска за год («Будильник 1873» → «1873, № 4 // Будильник»)
        zaprosy.append(f"{zh} {kadr['god']}")
    if q:
        zaprosy.append(q)
    out, seen = [], set()
    for q in zaprosy:
        for f in (rgb, neb, prlib):
            try:
                rows = f(q)
            except Exception:
                rows = []
            for row in rows:
                if row['card'] not in seen:
                    seen.add(row['card'])
                    out.append(row)
    # сначала со сканом
    out.sort(key=lambda r: (not r['image'],))
    return out


if __name__ == '__main__':
    import json
    for k in ({'syuzhet': 'Азбука 1812 года', 'avtor': 'Теребенев', 'god': 1815},
              {'syuzhet': 'Русский Курций', 'avtor': 'Теребенев'},
              {'syuzhet': 'Крокодил', 'god': 1924}):
        res = po_nomeru(k)
        print('==', k, len(res))
        for r in res[:4]:
            print(json.dumps(r, ensure_ascii=False))
