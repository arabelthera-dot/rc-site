#!/usr/bin/env python3
"""Кадр дня: только российские фонды. Викисклад (Commons) выключен (Сергей 21.10.2026, Р90).

Порядок find: ГИМ (shm_catalog, не поддержан: robots.txt запрещает /api/, не обходим) → Госкаталог
(goskatalog) → Русский музей (rusmuseum) → Третьяковка (tretyakov) → Артефакт (ar_culture) →
PastVu (только с --geo lat,lon). Русский музей, Третьяковка и Артефакт ищутся прямыми
открытыми API сайтов (рецепты — knowledge/kadr-recepty-fondov.md, 19.10.2026). К фондам ходит не kadr.py, а реестровый access.py
(навык museum-source-access): путь — переменная RC_ACCESS, по умолчанию
~/projects/russian-civilization/docs/registries/access.py, рядом с ним sources.json. Нет файла,
фонд недоступен, 403, таймаут — строка в stderr и следующий фонд, не падение. Для фонда без
способа поиска в access.py/sources.json печатается «поиск не поддержан» и план поиска (--discover).

Р90 (Сергей 21.10.2026): «викисклад вообще вычеркни… Только по личному моему разрешению и только
в том случае, если… вы что-то не нашли в наших базах данных». Поэтому find и put Викисклад не трогают;
ход туда открывает только --razreshenie "Р№ или дата и слова Сергея" — без него отказ. Подпись к кадру
пишет человек по русскому источнику дня; инструмент кладёт кадр в public/muzei/<музей>/img/.

  kadr.py find "Gherman Titov Vostok 2" [-n 10] [--geo 55.75,37.62]
                                                      кандидаты по фондам: файл, размер, лицензия, автор
  kadr.py put arhitektura 03-05 "pastvu:760729:i/e/n/ien36rd3zgbt83806t.jpg" "подпись" "Автор, 1961"
  kadr.py put … "rusmuseum:https://…/img.jpg" "подпись" "Автор" --card https://…/card --smert 1898
                                                      --smert — год смерти автора: основание показа
                                                      «общественное достояние (ст. 1281 ГК РФ)» в credit;
                                                      без него кадр фонда без открытой лицензии не кладётся
                                                      кадр из российского фонда: автор (шестой) обязателен,
                                                      credit — фонд, название и ссылка на карточку из sources.json
Кадр после put — открыть и посмотреть: в поиске попадаются письма, автографы, плакаты с надписями.
  kadr.py find|put … --razreshenie "Р95: Сергей разрешил кадр …"  — Викисклад, только по слову Сергея
Лицензии — только общественное достояние, CC0, CC BY, CC BY-SA; прочее put отклоняет.
"""
import html, io, json, os, re, subprocess, sys, tempfile, urllib.parse, urllib.request
from pathlib import Path

from PIL import Image

API = 'https://commons.wikimedia.org/w/api.php'
UA = {'User-Agent': 'rc-site-kadr/1.0 (info@russian-civilization.ru)'}
ROOT = Path(__file__).resolve().parent.parent
ACCESS = Path(os.environ.get('RC_ACCESS') or
              Path.home() / 'projects/russian-civilization/docs/registries/access.py').expanduser()
# выход rf-proxy:1080 забанен Госкаталогом (403) — ходим российским туннелем реестра (ru_tunnel.py)


def ru_proxy():
    """Адрес туннеля; погас после часа простоя — поднимает его transport.py реестра, как для access.py."""
    if os.environ.get('RC_RU_PROXY'):
        return os.environ['RC_RU_PROXY']
    sys.path.insert(0, str(ACCESS.parent))
    import transport
    px = transport.ru_proxy('goskatalog.ru')
    if not px:
        raise RuntimeError('российский туннель не поднят (ru-route.json выключен или нет ключа, ru_tunnel.py join)')
    return px
# Права фондов, которых нет в sources.json (рецепты — knowledge/kadr-recepty-fondov.md, 19.10.2026)
PRAVA = {'goskatalog': 'Госкаталог прав не даёт — автор и год смерти по карточке',
         'rusmuseum': '© Русский музей, открытой лицензии нет',
         'tretyakov': 'некоммерческое использование, подпись «Из собрания Третьяковской галереи»',
         'ar_culture': 'у музея-держателя — по карточке Артефакта'}
FONDY = ['shm_catalog', 'goskatalog', 'rusmuseum', 'tretyakov', 'ar_culture', 'pastvu']  # порядок поиска
RAZRESHENIE = None  # Р90: Викисклад — только с --razreshenie (слово Сергея), иначе не трогаем
FREE = re.compile(r'^(public domain|pd\b|pd-|cc0|cc[ -]by(-sa)?[ -]?\d|cc[ -]by(-sa)?$)', re.I)


def api(**q):
    q.update(format='json', formatversion=2)
    req = urllib.request.Request(API + '?' + urllib.parse.urlencode(q), headers=UA)
    return json.load(urllib.request.urlopen(req, timeout=30))


def plain(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s or ''))).strip()


def info(titles):
    r = api(action='query', titles='|'.join(titles), prop='imageinfo',
            iiprop='url|size|extmetadata|mime', iiurlwidth=1600)
    out = []
    for p in r['query']['pages']:
        if 'imageinfo' not in p:
            continue
        ii = p['imageinfo'][0]; md = ii.get('extmetadata', {})
        g = lambda k: plain(md.get(k, {}).get('value', ''))
        out.append(dict(title=p['title'], w=ii['width'], h=ii['height'], mime=ii['mime'],
                        url=ii.get('thumburl') or ii['url'], license=g('LicenseShortName'),
                        author=g('Artist') or 'автор не указан', date=g('DateTimeOriginal')[:40],
                        desc=g('ImageDescription')[:160]))
    return out


def warn(msg):
    print(msg, file=sys.stderr)


def sources():
    f = ACCESS.parent / 'sources.json'
    return {x['id']: x for x in json.loads(f.read_text())['sources']}


def access(*args, timeout=90):
    """Вызов реестрового access.py подпроцессом; ответ — его report.json."""
    if not ACCESS.is_file():
        raise RuntimeError(f'нет access.py ({ACCESS}); задай RC_ACCESS')
    with tempfile.TemporaryDirectory(prefix='kadr-') as tmp:
        env = dict(os.environ)
        if any('goskatalog.ru' in x for x in args):  # Госкаталог — только через российский туннель
            px = ru_proxy()
            env.update(HTTPS_PROXY=px, https_proxy=px)
        r = subprocess.run([sys.executable, str(ACCESS), *args, '--out-dir', tmp],
                           capture_output=True, text=True, timeout=timeout, env=env)
        rep = Path(tmp) / 'report.json'
        if not rep.is_file():
            raise RuntimeError(f'access.py код {r.returncode}: {(r.stderr or r.stdout).strip()[-200:]}')
        report = json.loads(rep.read_text())
        for a in report.get('artifacts', []):  # тело забрать до удаления папки
            pth = Path(a.get('path', ''))
            if pth.is_file():
                a['body'] = pth.read_bytes()
        return report


def fetch(url):
    """Тело ровно по этому адресу через access.py, иначе ошибка (подмена другим фондом — не кадр)."""
    rep = access('--url', url)
    for a in rep.get('artifacts', []):
        if a.get('relation') == 'original' and 'body' in a:
            return a['body']
    tries = '; '.join(f"{t.get('state')} {t.get('http') or ''} {t.get('error') or ''}".strip()
                      for t in rep.get('attempts', []))
    raise RuntimeError(f'не получено: {tries or rep.get("status")}')


def find_unsupported(fond, query, n, geo):
    """В access.py/sources.json нет поискового способа: только план поиска, без сети."""
    plan = access('--source', fond, '--discover', '--query', query, timeout=30)
    qs = plan.get('discovery', {}).get('queries', [])
    warn(f'  поиск не поддержан (в access.py/sources.json нет поиска); план: ' + ' | '.join(qs))
    return 0


def find_goskatalog(fond, query, n, geo):
    """Поиск — POST к API Госкаталога через туннель; сам файл потом берёт access.py (put)."""
    gk = 'https://goskatalog.ru'
    q = urllib.parse.urlencode(dict(statusIds=6, publicationLimit='false', limit=n, offset=0, q=query, calcCountsType=1))
    req = urllib.request.Request(f'{gk}/muzfo-rest/rest/exhibits/ext?{q}', data=b'[]', method='POST', headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0', 'Content-Type': 'application/json',
        'Accept': 'application/json', 'Origin': gk, 'Referer': gk + '/portal/'})
    px = ru_proxy()
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({'https': px, 'http': px}))
    objs = json.loads(opener.open(req, timeout=40).read()).get('objects', [])
    for o in objs:
        img = (o.get('mainImage') or {}).get('id')
        if not img:
            continue
        avt = ', '.join(a.get('name', '') for a in o.get('authors') or [] if isinstance(a, dict)) or 'автор не указан'
        print(f"? goskatalog:{gk}/muzfo-imaginator/rest/images/original/{img} | {o.get('name', '')[:90]} | {avt}\n"
              f"    --card {gk}/portal/#/collections?id={o['id']} — права Госкаталог не даёт: автор и год смерти по карточке")
    return len(objs)


BROWSER = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0', 'Accept': 'application/json, text/html'}


def get(url, as_json=True):
    """Прямой GET с кодированием кириллицы и пробелов в адресе."""
    u = urllib.parse.urlsplit(url)
    url = urllib.parse.urlunsplit(u._replace(path=urllib.parse.quote(urllib.parse.unquote(u.path))))
    body = urllib.request.urlopen(urllib.request.Request(url, headers=BROWSER), timeout=30).read()
    return json.loads(body) if as_json else body.decode('utf-8', 'replace')


def words(query):
    """Слова запроса, длинные первыми; для сверки — первые 5 букв (падежи: «Айвазовского»)."""
    w = [x for x in re.findall(r'\w+', query.lower().replace('ё', 'е')) if len(x) >= 3]
    return sorted(set(w), key=len, reverse=True)


def rank(items, query, text, n):
    """Локальный фильтр: оставить совпавшие хотя бы одним словом, больше совпадений — выше."""
    stems = [x[:5] for x in words(query)]
    scored = [(sum(st in text(i).lower().replace('ё', 'е') for st in stems), k, i) for k, i in enumerate(items)]
    return [i for sc, k, i in sorted(scored, key=lambda t: (-t[0], t[1])) if sc][:n]


def by_words(search, query):
    """Весь запрос; пусто — по одному слову, начиная с самого длинного (сайты не ищут фразу «автор + название»)."""
    items = search(query)
    for w in words(query) if not items else []:
        items = search(w)
        if items:
            warn(f'  целиком не нашлось — искал по слову «{w}», остальное отфильтровано локально')
            break
    return items


def find_rusmuseum(fond, query, n, geo):
    rm = 'https://rusmuseum.ru'
    search = lambda q: [i for i in get(f'{rm}/api/search/?q=' + urllib.parse.quote(q))['data']['items']
                        if (i.get('detailUrl') or '').startswith('/collections/')]
    items = rank(by_words(search, query), query, lambda i: plain(i.get('name')) + ' ' + plain(i.get('previewText')), n)
    for i in items:
        card = rm + i['detailUrl']
        try:
            h = get(card, as_json=False)
        except Exception as e:
            warn(f'  карточка {card} не открылась: {e}')
            continue
        avt = re.findall(r'class="detail-info__name"[^>]*>([^<]+)<', h)
        avt = next((plain(x).split(':', 1)[-1].strip() for x in avt if plain(x).startswith(('Художник', 'Автор'))),
                   'автор не указан')
        img = re.search(r'class="hero-image"[^>]*>\s*<img src="([^"]+)"', h)
        img = urllib.parse.urljoin(rm, html.unescape(img.group(1))) if img else rm + ((i.get('previewPicture') or {}).get('src') or '')
        print(f"? rusmuseum:{img} | {plain(i.get('name'))[:90]} | {avt}\n"
              f"    --card {card} — права: © Русский музей, открытой лицензии нет")
    return len(items)


def find_tretyakov(fond, query, n, geo):
    tr = 'https://my.tretyakov.ru'
    search = lambda q: (get(f'{tr}/api/v1/gallery/get/?' + urllib.parse.urlencode(
        {'search[q]': q, 'pageNum': 1, 'pageSize': 20, 'lang': 'ru'})).get('data') or {}).get('items') or []
    avt = lambda i: ', '.join(a.get('nameRaw', '') for a in i.get('author') or [] if isinstance(a, dict))
    items = rank(by_words(search, query), query, lambda i: f"{i.get('name', '')} {avt(i)}", n)
    for i in items:
        img = (i.get('pictureBig') or [''])[0]
        print(f"? tretyakov:{img} | {i.get('name', '')[:90]} | {avt(i) or 'автор не указан'}\n"
              f"    --card {tr}/app/masterpiece/{i['id']} — права: некоммерч., подпись «Из собрания Третьяковской галереи»")
    return len(items)


def find_ar_culture(fond, query, n, geo):
    ar = 'https://ar.culture.ru'
    search = lambda q: get(f'{ar}/ru/search?q=' + urllib.parse.quote(q)).get('results', {}).get('subjects') or []
    ru = lambda x: (x or {}).get('ru', '') if isinstance(x, dict) else str(x or '')
    avt = lambda i: ', '.join(a.get('info') or ru(a.get('title')) for a in i.get('authors') or [] if isinstance(a, dict))
    # Артефакт ищет только по одному слову — сразу самое длинное, остальное локально
    w = words(query)
    items = rank(search(w[0]) if w else [], query, lambda i: f"{ru(i.get('title'))} {avt(i)}", n)
    for i in items:
        path = (((i.get('topImage') or {}).get('attachment') or {}).get('original') or {}).get('path')
        if not path:
            continue
        org = ru((i.get('organization') or {}).get('title')) or 'музей не указан'
        print(f"? ar_culture:{ar}/attachments/{path} | {ru(i.get('title'))[:90]} | {avt(i) or 'автор не указан'}\n"
              f"    --card {ar}/ru/subject/{i.get('slug')} — права у держателя: {org}")
    return len(items)


def find_pastvu(fond, query, n, geo):
    if not geo:
        warn('  пропущен: нужен --geo lat,lon (PastVu ищет по точке)')
        return 0
    lat, lon = (float(x) for x in geo.split(','))
    base = sources()[fond]['url'].split('?')[0]  # https://pastvu.com/api2 — из sources.json
    params = json.dumps({'geo': [lat, lon], 'limit': n}, separators=(',', ':'))
    url = base + '?' + urllib.parse.urlencode({'method': 'photo.giveNearestPhotos', 'params': params})
    photos = json.loads(fetch(url)).get('result', {}).get('photos', [])
    for p in photos:
        print(f"? pastvu:{p['cid']}:{p['file']} | {p.get('year', '')} | {p.get('title', '')}\n"
              f"    https://pastvu.com/p/{p['cid']} — автора и права сверить по карточке")
    return len(photos)


def find_commons(fond, query, n, geo):
    r = api(action='query', list='search', srsearch=query, srnamespace=6, srlimit=n)
    titles = [x['title'] for x in r['query']['search']]
    for c in info(titles) if titles else []:
        ok = '✓' if FREE.search(c['license']) and c['mime'] in ('image/jpeg', 'image/png') else '✗'
        print(f"{ok} {c['title']} | {c['w']}×{c['h']} | {c['license']} | {c['author'][:60]} | {c['date']}\n    {c['desc']}")
    return len(titles)


SEARCH = {'shm_catalog': find_unsupported, 'goskatalog': find_goskatalog, 'rusmuseum': find_rusmuseum,
          'tretyakov': find_tretyakov, 'ar_culture': find_ar_culture, 'pastvu': find_pastvu, 'commons': find_commons}


def find(query, n=10, geo=None):
    try:
        names = sources()
    except Exception as e:
        names = {}
        warn(f'sources.json не прочитан ({e}) — российские фонды будут пропущены')
    got = []
    for fond in FONDY + (['commons'] if RAZRESHENIE else []):
        name = names.get(fond, {}).get('name', fond)
        print(f'== {fond} — {name}', flush=True)
        try:
            k = SEARCH[fond](fond, query, n, geo)
            if k:
                got.append(f'{fond}: {k}')
        except Exception as e:
            warn(f'  {fond} недоступен: {type(e).__name__}: {str(e)[:200]} — дальше')
    print('итог: ' + (', '.join(got) if got else 'ни один фонд не дал кандидатов'))


def slug(s):
    t = str.maketrans('абвгдеёжзийклмнопрстуфхцчшщъыьэюя', 'abvgdeejziyklmnoprstufhccss_y_eua')
    s = re.sub(r'\.[a-z]+$', '', s.lower().replace('file:', '')).translate(t)
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:48]


def put(museum, key, title, caption, avtor=None, card=None, smert=None):
    day = ROOT / 'src/content/days' / museum / f'{key}.json'
    if not day.is_file():
        sys.exit(f'нет дня {day}')
    fond = title.split(':', 1)[0]
    if fond in FONDY:
        return put_fond(day, museum, key, fond, title.split(':', 1)[1], caption, avtor, card, smert)
    if not RAZRESHENIE:
        sys.exit('Викисклад выключен (Р90): сначала российские фонды и museum-source-access; '
                 'кадр оттуда — только с --razreshenie "слово Сергея"')
    if not title.startswith('File:'):
        title = 'File:' + title
    c = info([title])
    if not c:
        sys.exit(f'нет файла {title}')
    c = c[0]
    if not FREE.search(c['license']):
        sys.exit(f'лицензия «{c["license"]}» не свободная — не беру')
    raw = urllib.request.urlopen(urllib.request.Request(c['url'], headers=UA), timeout=60).read()
    rel, im = save(raw, museum, key, slug(title))
    year = f'; {c["date"]}' if c['date'] else ''
    if avtor:  # подпись автора по-русски вручную, если Викисклад даёт сканировщика или латиницу
        c['author'], year = avtor, ''
    credit = f'{c["author"]}{year}. Цифровой файл: Wikimedia Commons, «{title[5:]}» ({c["license"]}).'
    write_day(day, rel, caption, credit)
    print(f'{rel} {im.size[0]}×{im.size[1]} {c["license"]}\n  {credit}')


def save(raw, museum, key, name):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    im.thumbnail((1600, 1600))
    if min(im.size) < 400:
        sys.exit(f'кадр мелкий ({im.size[0]}×{im.size[1]}) — ищи крупнее')
    rel = f'muzei/{museum}/img/{key}-{name}.jpg'
    if (ROOT / 'public' / rel).exists():
        sys.exit(f'файл уже есть: {rel}')
    (ROOT / 'public' / rel).parent.mkdir(parents=True, exist_ok=True)
    im.save(ROOT / 'public' / rel, 'JPEG', quality=84, optimize=True, progressive=True)
    return rel, im


def write_day(day, rel, caption, credit):
    d = json.loads(day.read_text())
    imgs = d.get('images', [])
    if any(x['src'] == rel for x in imgs):
        sys.exit(f'кадр уже есть: {rel}')
    imgs.append(dict(src=rel, caption=caption, credit=credit))
    # images — сразу после ключевых полей дня, как у перенесённых дней (порядок полей zod не важен)
    d['images'] = imgs
    day.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')


def osnovanie(pravo, smert):
    """Основание показа для credit (Р84/Б16: без него proverka-podpisey роняет сборку, 21.10.2026)."""
    if re.search(r'\bCC[ -]?(BY|0)|обществен\S* достоян|public domain|PD-', pravo, re.I):
        return pravo
    if not smert:
        sys.exit(f'права фонда «{pravo}» — не основание показа: укажите --smert ГОД (ст. 1281 ГК РФ) '
                 'или не ставьте кадр')
    import datetime
    if datetime.date.today().year <= int(smert) + 70:
        sys.exit(f'автор умер в {smert}: 70 лет не прошло (ст. 1281 ГК РФ) — кадр не ставить')
    return f'общественное достояние (ст. 1281 ГК РФ, автор умер в {smert}); условия фонда: {pravo}'


def put_fond(day, museum, key, fond, ref, caption, avtor, card, smert=None):
    """Кадр из российского фонда: файл через access.py, credit — из записи фонда в sources.json."""
    if not avtor:
        sys.exit(f'{fond}: шестым аргументом — автор и год по-русски (фонд не отдаёт паспорт машинно)')
    src = sources()[fond]
    if fond == 'pastvu':  # ref = <cid>:<файл> из find --geo
        cid, file = ref.split(':', 1)
        url, card = f'https://pastvu.com/_p/a/{file}', card or f'https://pastvu.com/p/{cid}'
    else:  # ref = прямой адрес изображения, --card — карточка предмета
        url, card = ref, card or ref
    try:
        raw = fetch(url)
    except Exception as e:
        sys.exit(f'{fond}: файл не получен ({e})')
    pravo = osnovanie(src.get('rights') or src.get('license') or PRAVA.get(fond)
                      or 'в sources.json не указаны — сверить по карточке', smert)
    rel, im = save(raw, museum, key, slug(f'{fond}-{Path(urllib.parse.unquote(urllib.parse.urlsplit(url).path)).stem}'))
    credit = f'{avtor}. Источник: {src["name"]} [{fond}], {card}. Права: {pravo}.'
    write_day(day, rel, caption, credit)
    print(f'{rel} {im.size[0]}×{im.size[1]} {fond}\n  {credit}')


if __name__ == '__main__':
    a = sys.argv[1:]
    opt = lambda k: a[a.index(k) + 1] if k in a and a.index(k) + 1 < len(a) else None
    card = opt('--card')
    smert = opt('--smert')
    if smert:
        i = a.index('--smert'); del a[i:i + 2]
    RAZRESHENIE = opt('--razreshenie')
    if RAZRESHENIE:
        i = a.index('--razreshenie'); del a[i:i + 2]
    if card:
        i = a.index('--card'); del a[i:i + 2]
    if a[:1] == ['find'] and len(a) >= 2:
        find(a[1], int(opt('-n') or 10), opt('--geo'))
    elif a[:1] == ['put'] and len(a) in (5, 6):
        put(*a[1:], card=card, smert=smert) if len(a) == 6 else put(*a[1:], None, card, smert)
    else:
        sys.exit(__doc__)
