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
  kadr.py put … "rusmuseum:https://…/img.jpg" "подпись" "Автор" --card https://…/card
                                                      кадр из российского фонда: автор (шестой) обязателен,
                                                      credit — фонд, название и ссылка на карточку из sources.json
Кадр после put — открыть и посмотреть: в поиске попадаются письма, автографы, плакаты с надписями.
  kadr.py find|put … --razreshenie "Р95: Сергей разрешил кадр …"  — Викисклад, только по слову Сергея
  kadr.py zamena [--muzey X] [--primenit]
                                                      Р90: кадры с Викисклада → российские фонды (адаптеры
                                                      scripts/fondy/*.py, po_nomeru); строго: инв. номер у того же
                                                      держателя или автор+год+название; без --primenit — сухой прогон;
                                                      ненайденное — data/r90-na-razreshenie.tsv (на разрешение Сергея)
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
RU_PROXY = os.environ.get('RC_RU_PROXY', 'http://127.0.0.1:8899')  # выход rf-proxy:1080 забанен Госкаталогом (403)
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
        if any('goskatalog.ru' in x for x in args):  # Госкаталог — только через туннель RU_PROXY
            env.update(HTTPS_PROXY=RU_PROXY, https_proxy=RU_PROXY)
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
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({'https': RU_PROXY, 'http': RU_PROXY}))
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


def put(museum, key, title, caption, avtor=None, card=None):
    day = ROOT / 'src/content/days' / museum / f'{key}.json'
    if not day.is_file():
        sys.exit(f'нет дня {day}')
    fond = title.split(':', 1)[0]
    if fond in FONDY:
        return put_fond(day, museum, key, fond, title.split(':', 1)[1], caption, avtor, card)
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


def put_fond(day, museum, key, fond, ref, caption, avtor, card):
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
    rel, im = save(raw, museum, key, slug(f'{fond}-{Path(urllib.parse.unquote(urllib.parse.urlsplit(url).path)).stem}'))
    pravo = src.get('rights') or src.get('license') or PRAVA.get(fond) or 'в sources.json не указаны — сверить по карточке'
    credit = f'{avtor}. Источник: {src["name"]} [{fond}], {card}. Права: {pravo}.'
    write_day(day, rel, caption, credit)
    print(f'{rel} {im.size[0]}×{im.size[1]} {fond}\n  {credit}')

# ── zamena: массовый перевод кадров с Викисклада на российские фонды (Р90, Сергей 21.10.2026) ──
WIKI = re.compile(r'commons\.wikimedia\.org|upload\.wikimedia\.org|wikimedia\s+commons|викисклад', re.I)
DERZH = re.compile(
    r'\b(ГИМ|ГРМ|ГТГ|ГМИИ|РГБ|РНБ|БАН|ЦВММ|ВИМАИВиВС|РГАДА|РГВИА|РГАЭ|ГАРФ|РГАКФД|ЦГАКФФД|ГМЗ|ГЭ|IWM)\b'
    r'|((?:[А-ЯЁа-яё][а-яё]+(?:ий|ый|ой|ая|ое|ые)\s+){0,4}(?:[Мм]узе[йяюем]|[Гг]алере[яиюей]|[Бб]иблиотек[аиеу]'
    r'|[Аа]рхив[аеу]?|Эрмитаж[аеу]?|Кунсткамер[аыеу]|[Мм]узей-заповедник[аеу]?)'
    r'(?:\s+(?:им(?:ени|\.)\s+)?[А-ЯЁ«][^.,;()<\n]{0,50})?)')
INV = [re.compile(p, re.I) for p in (
    r'\bинв(?:ентарный)?\.?\s*(?:номер|№)?\s*:?\s*([A-ZА-ЯЁ]{0,6}[\s-]?\d[\w\-/.]*\d|\d+)',
    r'\b(ЭРР-?\s?\d[\d/-]*)', r'(?<![\w-])(Ж-\s?\d[\d/-]*)', r'\b(ГИМ\s?\d[\d\s/]*\d)',
    r'\b(IWM\s+[A-Z]{1,3}\s?\d+)', r'\b(Ф\.\s?\d+\s*,?\s*(?:оп\.\s?\d+\s*,?\s*)?(?:к|карт|ед\.\s?хр|д)\.\s?\d+[\w.]*)',
    r'\bшифр\s+(?:РГБ\s+)?([A-ZА-ЯЁ0-9][\w./-]*\d)')]
AVTOR = re.compile(r'(?:Фото(?:граф)?:?|Автор:?|работы|[Хх]уд(?:ожник)?\.?|[Гг]равюра|[Лл]итография)\s+'
                   r'((?:[А-ЯЁA-Z]\.\s?){1,2}\s?[А-ЯЁA-Z][\w-]+|[А-ЯЁA-Z][\w-]+(?:\s[А-ЯЁA-Z][\w.-]+){0,2})')
GOD = re.compile(r'\b(1[0-9]{3}|20[0-2]\d)\b')
STRIP = lambda s: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()


def opis(tekst, podpis):
    """Держатель, инв., автор, год, сюжет — из подписи, credit и строки прав."""
    derzh = next((m.group(0).strip() for m in DERZH.finditer(tekst)
                  if not re.match(r'(?i)wikimedia', m.group(0)) and not re.fullmatch(r'[а-яё]+', m.group(0).strip())), '')
    inv = next((m.group(1).strip() for r in INV for m in [r.search(tekst)] if m), '')
    av = AVTOR.search(tekst)
    god = GOD.search(tekst)
    return dict(derzhatel=derzh, inv=inv, avtor=av.group(1).strip() if av else '',
                god=god.group(1) if god else '', syuzhet=re.split(r'(?<=[^А-ЯЁA-Z])\.\s', podpis)[0][:160])


def kadry_json(path):
    d = json.loads(path.read_text())
    for i, im in enumerate(d.get('images') or []):
        tekst = ' '.join(str(im.get(k) or '') for k in ('src', 'caption', 'credit', 'source', 'license'))
        if WIKI.search(tekst):
            yield dict(vid='json', put=path, i=i, fayl=im['src'], podpis=im.get('caption') or '',
                       **opis(urllib.parse.unquote(tekst), im.get('caption') or ''))


def kadry_html(path):
    t = path.read_text()
    rows = [(m.start(), m.end(), m.group(0)) for m in re.finditer(r'<(tr|li)\b[^>]*>.*?</\1>', t, re.S)]
    tags = list(re.finditer(r'<img\b[^>]*>', t, re.S))
    for n, m in enumerate(tags):
        tag = m.group(0)
        at = lambda k: (re.search(rf'\b{k}="([^"]*)"', tag) or [None, ''])[1]
        src, ds, lic = at('src'), at('data-source'), at('data-license')
        konec = tags[n + 1].start() if n + 1 < len(tags) else len(t)
        cap = re.search(r'<(figcaption|div class="scene-cap")[^>]*>(.*?)</(?:figcaption|div)>', t[m.end():min(konec, m.end() + 3000)], re.S)
        podpis = STRIP(cap.group(2)) if cap else ''
        stem = Path(src).stem
        klyuchi = [k for k in (ds, urllib.parse.unquote(ds).replace(' ', '_'), stem) if k and len(k) > 6]
        row, kusok = None, ''
        for a, b, r in rows:
            ur = urllib.parse.unquote(r)
            hit = next((ur.find(urllib.parse.unquote(k)) for k in klyuchi if urllib.parse.unquote(k) in ur), -1)
            if hit >= 0 and 'rights' in t[max(0, a - 3000):a] or hit >= 0 and WIKI.search(r):
                row, kusok = (a, b), STRIP(ur[max(0, hit - 400):hit + 400]) if r.startswith('<li') else STRIP(ur)
                break
        tekst = ' '.join((urllib.parse.unquote(src), urllib.parse.unquote(ds), lic, podpis, at('alt'), kusok))
        if WIKI.search(' '.join((ds, lic, podpis, kusok))):
            yield dict(vid='html', put=path, tag=(m.start(), m.end()), row=row, fayl=src, podpis=podpis,
                       **opis(tekst, podpis or STRIP(at('alt'))))


def adaptery():
    import importlib.util
    out = []
    for f in sorted((ROOT / 'scripts/fondy').glob('*.py')):
        if f.name == '__init__.py':
            continue
        try:
            spec = importlib.util.spec_from_file_location(f'fondy.{f.stem}', f)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            out.append((f.stem, mod.po_nomeru))
        except Exception as e:
            warn(f'адаптер {f.name} не загружен ({type(e).__name__}: {e}) — пропускаю')
    return out


def norm(s):
    return re.sub(r'[^0-9a-zа-я]', '', str(s or '').lower().replace('ё', 'е'))


def strogo(k, r):
    """Р90: только строгое совпадение. Номер у того же держателя — или автор + год + название."""
    if k['inv'] and r.get('inv') and norm(k['inv']) == norm(r['inv']):
        dk, dr = norm(k['derzhatel']), norm(r.get('derzhatel'))
        if dk and dr and (dk in dr or dr in dk):
            return 'инв. номер у того же держателя'
    fam = lambda s: norm(re.split(r'[\s.]+', str(s or '').strip())[-1]) if s else ''
    slova = [w for w in re.findall(r'[а-яёa-z]{4,}', str(r.get('title') or '').lower())]
    tekst = (k['podpis'] + ' ' + k['syuzhet']).lower()
    if (fam(k['avtor']) and fam(k['avtor']) == fam(r.get('avtor')) and k['god'] and str(r.get('god') or '')[:4] == k['god']
            and slova and sum(w[:-1] in tekst for w in slova) >= max(1, round(len(slova) * .6))):
        return 'автор + год + название'
    return None


def bez_wiki(s):
    s = re.sub(r'[,;]?\s*(?:Цифровой файл:\s*)?(?:Wikimedia Commons|Викисклад[ае]?)(?:,\s*«[^»]*»)?(?:\s*\([^)]*\))?', '', s, flags=re.I)
    return re.sub(r'\s+([.,;])', r'\1', s).strip()


def primenit(k, r):
    """Скан через fetch/save (как put_fond), затем подпись, data-source, data-license, строка прав."""
    src = sources().get(r['fond'], {})
    pravo = src.get('rights') or src.get('license') or PRAVA.get(r['fond']) or 'сверить по карточке'
    name = src.get('name') or r['fond']
    try:
        rel, im = save(fetch(r['image']), k['muzey'], k['den'], slug(f'{r["fond"]}-{Path(urllib.parse.urlsplit(r["image"]).path).stem}'))
    except (Exception, SystemExit) as e:
        warn(f'{k["muzey"]}/{k["den"]} {k["fayl"]}: скан не взят ({e})')
        return False
    credit = f'{r.get("avtor") or k["avtor"]}, {r.get("god") or k["god"]}. Источник: {name} [{r["fond"]}], {r["card"]}. Права: {pravo}.'
    p = k['put']
    if k['vid'] == 'json':
        d = json.loads(p.read_text())
        im_ = d['images'][k['i']]
        im_.update(src=rel, caption=bez_wiki(im_.get('caption') or ''), credit=credit)
        for x in ('source', 'license'):
            im_.pop(x, None)
        p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
        return True
    t = p.read_text()
    a, b = k['tag']
    tag = t[a:b]
    old_src = re.search(r'\bsrc="([^"]*)"', tag).group(1)
    tag = tag.replace(f'src="{old_src}"', f'src="/{rel}"', 1)
    for attr, val in (('data-source', r['card']), ('data-license', pravo)):
        val = html.escape(val, quote=True)
        tag = re.sub(rf'\b{attr}="[^"]*"', f'{attr}="{val}"', tag) if f'{attr}=' in tag else tag.replace('<img', f'<img {attr}="{val}"', 1)
    zameny = [(a, b, tag)]
    cap = re.search(r'(<(?:figcaption|div class="scene-cap")[^>]*>)(.*?)(</(?:figcaption|div)>)', t[b:b + 3000], re.S)
    if cap:
        novaya = bez_wiki(cap.group(2)).rstrip('. ') + f'. Источник: {html.escape(name)}.'
        zameny.append((b + cap.start(2), b + cap.end(2), novaya))
    if k['row']:
        ra, rb = k['row']
        row = t[ra:rb]
        ds = re.search(r'\bdata-source="([^"]*)"', t[a:b])
        if ds and ds.group(1):
            for v in {ds.group(1), urllib.parse.unquote(ds.group(1)), ds.group(1).replace('%3A', ':')}:
                row = row.replace(f'href="{v}"', f'href="{html.escape(r["card"], quote=True)}"')
        row = re.sub(r'\(?(?:Wikimedia Commons|Викисклад)(?:, из [^)]*)?\)?', html.escape(name), row, flags=re.I)
        zameny.append((ra, rb, row))
    for x, y, s in sorted(zameny, reverse=True):
        t = t[:x] + s + t[y:]
    p.write_text(t)
    return True


def zamena(muzey=None, prim=False):
    ad = adaptery()
    print(f'адаптеров фондов: {len(ad)} ({", ".join(n for n, _ in ad) or "нет"}); режим: {"ПРИМЕНИТЬ" if prim else "сухой прогон"}')
    kadry = []
    for p in sorted((ROOT / 'src/content/days').glob('*/*.json')) + sorted((ROOT / 'src/data/full-pages').glob('*/*.html')):
        if muzey and p.parent.name != muzey:
            continue
        try:
            for k in (kadry_json(p) if p.suffix == '.json' else kadry_html(p)):
                kadry.append(dict(k, muzey=p.parent.name, den=p.stem))
        except Exception as e:
            warn(f'{p.relative_to(ROOT)}: не разобран ({e})')
    itog, net = {}, []
    # html правится с конца файла, чтобы смещения ещё не обработанных кадров не съезжали
    for k in sorted(kadry, key=lambda k: (str(k['put']), -(k.get('tag') or (0,))[0])):
        s = itog.setdefault(k['muzey'], dict(kadrov=0, derzh=0, inv=0, naydeno=0, zameneno=0))
        s['kadrov'] += 1; s['derzh'] += bool(k['derzhatel']); s['inv'] += bool(k['inv'])
        kk = {x: k[x] for x in ('muzey', 'den', 'fayl', 'podpis', 'derzhatel', 'inv', 'avtor', 'god', 'syuzhet')}
        hit = None
        for name, fn in ad:
            try:
                for r in fn(dict(kk)) or []:
                    why = strogo(kk, r)
                    if why:
                        hit = (r, why); break
            except Exception as e:
                warn(f'адаптер {name} упал на {k["muzey"]}/{k["den"]} ({type(e).__name__}: {e}) — пропускаю')
            if hit:
                break
        if hit:
            s['naydeno'] += 1
            print(f'  {k["muzey"]}/{k["den"]} {k["fayl"]} → {hit[0]["fond"]} {hit[0]["card"]} ({hit[1]})')
            if prim and primenit(k, hit[0]):
                s['zameneno'] += 1
        else:
            iskali = '; '.join(f'{a}: {kk[b]}' for a, b in (('инв.', 'inv'), ('автор', 'avtor'), ('год', 'god')) if kk[b]) \
                     + f'; сюжет: {kk["syuzhet"][:100]}'
            net.append([k['muzey'], k['den'], k['fayl'], k['derzhatel'], k['inv'], iskali])
    out = ROOT / 'data/r90-na-razreshenie.tsv'
    out.parent.mkdir(exist_ok=True)
    if muzey and out.is_file():  # --muzey: строки других музеев сохраняются
        net += [r.split('\t') for r in out.read_text().splitlines()[1:] if r and r.split('\t')[0] != muzey]
    clean = lambda v: re.sub(r'[\t\n]+', ' ', str(v))
    out.write_text('\t'.join(('музей', 'день', 'файл', 'держатель', 'инв', 'что искали')) + '\n'
                   + ''.join('\t'.join(map(clean, r)) + '\n' for r in sorted(net)))
    print(f'\n{"музей":<18}{"кадров":>7}{"держ.":>7}{"инв.":>6}{"найдено":>9}{"не найд.":>9}' + ('  заменено' if prim else ''))
    for m, s in sorted(itog.items()) + [('ВСЕГО', {x: sum(s[x] for s in itog.values()) for x in ('kadrov', 'derzh', 'inv', 'naydeno', 'zameneno')})]:
        print(f'{m:<18}{s["kadrov"]:>7}{s["derzh"]:>7}{s["inv"]:>6}{s["naydeno"]:>9}{s["kadrov"] - s["naydeno"]:>9}'
              + (f'{s["zameneno"]:>10}' if prim else ''))
    print(f'\nна личное разрешение Сергея: {len(net)} строк → {out.relative_to(ROOT)}')


if __name__ == '__main__':
    a = sys.argv[1:]
    opt = lambda k: a[a.index(k) + 1] if k in a and a.index(k) + 1 < len(a) else None
    card = opt('--card')
    RAZRESHENIE = opt('--razreshenie')
    if RAZRESHENIE:
        i = a.index('--razreshenie'); del a[i:i + 2]
    if card:
        i = a.index('--card'); del a[i:i + 2]
    if a[:1] == ['zamena']:
        zamena(opt('--muzey'), '--primenit' in a)
    elif a[:1] == ['find'] and len(a) >= 2:
        find(a[1], int(opt('-n') or 10), opt('--geo'))
    elif a[:1] == ['put'] and len(a) in (5, 6):
        put(*a[1:], card=card) if len(a) == 6 else put(*a[1:], None, card)
    else:
        sys.exit(__doc__)
