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
  kadr.py zamena [--muzey X] [--primenit] [-j 6] [--prodolzhit]
                                                      Р90: кадры с Викисклада → российские фонды (адаптеры
                                                      scripts/fondy/*.py, po_nomeru); строго: инв. номер у того же
                                                      держателя или автор+год+название; без --primenit — сухой прогон;
                                                      ненайденное — data/r90-na-razreshenie.tsv (на разрешение Сергея);
                                                      адаптерам идут и avtor/nazvanie/god из подписи (iz_podpisi);
                                                      -j кадров параллельно (≤2 запроса на хост, кэш ответов на прогон);
                                                      таблица — атомарно, при обрыве прежние строки сохраняются;
                                                      --prodolzhit — пропустить кадры, уже стоящие в таблице
  kadr.py razbor [--muzey X] [-n 5]                    без сети: сколько кадров без держателя получили автор/название/год
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
# Права без лицензии (общественное достояние, CC…) кадр не ставят: подпись-заглушка «сверить по карточке» роняла сборку (22.10)
LIC_OK = re.compile(r'\bCC[ -]?(BY|0)|обществен\S* достоян|public domain|свободн\S* лиценз', re.I)
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


def put(museum, key, title, caption, avtor=None, card=None, prava=None):
    day = ROOT / 'src/content/days' / museum / f'{key}.json'
    if not day.is_file():
        sys.exit(f'нет дня {day}')
    fond = title.split(':', 1)[0]
    if fond in FONDY:
        return put_fond(day, museum, key, fond, title.split(':', 1)[1], caption, avtor, card, prava)
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


def put_fond(day, museum, key, fond, ref, caption, avtor, card, prava=None):
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
    pravo = prava or src.get('rights') or src.get('license') or PRAVA.get(fond) or ''
    if not LIC_OK.search(pravo):
        sys.exit(f'{fond}: права не названы ({pravo or "нет"}) — посмотри карточку и дай --prava "общественное достояние (автор умер в ГГГГ)"')
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
AVTOR = re.compile(r'(?:Фото(?:граф)?:?|Автор:?|работы|[Хх]уд(?:ожник)?\.?|[Гг]равюра|[Лл]итография|[Рр]исунок)\s+'
                   r'((?:[А-ЯЁA-Z]\.\s?){1,2}\s?[А-ЯЁA-Z][\w-]+|[А-ЯЁA-Z][\w-]+(?:\s[А-ЯЁA-Z][\w.-]+){0,2})')
GOD = re.compile(r'\b(1[0-9]{3}|20[0-2]\d)\b')
STRIP = lambda s: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()

# Подпись → автор, название, год: «А. Радаков · 1917 «Название» описание», «Автор. Название. 1905»,
# «Название (Автор, 1905)», «Карикатура … журнал «Будильник», 1906»
IMYA = re.compile(r'(?:[А-ЯЁA-Z]\.\s?){1,2}\s?[А-ЯЁA-Z][а-яёa-z]+(?:-[А-ЯЁA-Z][а-яёa-z]+)?'
                  r'|[А-ЯЁA-Z][а-яёa-z]+(?:\s(?:де|фон|ван)?\s?[А-ЯЁA-Z][а-яёa-z]+(?:-[А-ЯЁA-Z][а-яёa-z]+)?){1,2}')
NE_AVTOR = re.compile(r'(?i)^(?:лубок|азбука|журнал|издатель|художник|неизвестн|исторический|обложка|карикатура'
                      r'|плакат|гравюра|литография|страница|рисунок|буква|сатирикон|крокодил|будильник'
                      r'|фото|снимок|портрет|дом\b|здание|вид\b|памятник|почтов|министерств)')  # «Дом Ошевнева», «Фото Министерства обороны»
GOD_PODP = re.compile(r'(?:\bок\.\s?|\bс\.\s?)?\b(1[5-9]\d{2}|20[0-2]\d)\b(?!-)(?:\s?г(?:\.|ода?)?)?')


def kavychki(s):
    """Первое «…» с учётом вложенных «…«…»…»: (начало, конец) или None."""
    a = s.find('«')
    if a < 0:
        return None
    d = 0
    for i in range(a, len(s)):
        d += {'«': 1, '»': -1}.get(s[i], 0)
        if d == 0:
            return a, i + 1
    return a, len(s)


ROD_PRED = re.compile(r'(?i)(?:^|[\s(])(?:фото(?:графия)?|снимок|рисунок|работы|гравюра|литография|картина|портрет|худ\.)$')  # после них — родительный
ZHEN_IMENA = set('Анна Ольга Елена Екатерина Татьяна Ирина Светлана Марина Галина Нина Вера Надежда Зоя Алла Людмила Тамара '
                 'Валентина Александра Евгения Мария Анастасия Лидия Наталия Юлия Виктория Валерия Софья София Ксения Дарья Наталья '
                 'Любовь Полина Алёна Алина Вероника Варвара Зинаида Клавдия Антонина Маргарита Кира Лариса Оксана Яна'.split())


def _fam_im(f, zhen):
    """Фамилия из родительного в именительный; не уверен — как есть."""
    if zhen:
        for a, b in (('ской', 'ская'), ('цкой', 'цкая'), ('овой', 'ова'), ('евой', 'ева'), ('ёвой', 'ёва'), ('иной', 'ина'), ('ыной', 'ына')):
            if f.endswith(a):
                return f[:-len(a)] + b
        return f
    for a, b in (('ского', 'ский'), ('цкого', 'цкий'), ('ова', 'ов'), ('ева', 'ев'), ('ёва', 'ёв'), ('ина', 'ин'), ('ына', 'ын'),
                 ('ея', 'ей'), ('ия', 'ий'), ('ого', 'ой')):
        if f.endswith(a) and len(f) > len(a) + 1:
            return f[:-len(a)] + b
    if re.search(r'[бвгдзклмнпрстфхцчшщ]а$', f) and len(f) > 4:  # Нотбека → Нотбек, Гейтмана → Гейтман
        return f[:-1]
    return f


def _imya_im(n):
    if n == 'Любови':
        return 'Любовь'
    for a, b in (('ьи', 'ья'), ('ии', 'ия'), ('ия', 'ий'), ('ея', 'ей'), ('ая', 'ай'), ('ы', 'а')):
        if n.endswith(a):
            return n[:-len(a)] + b
    if re.search(r'[гкх]и$', n):
        return n[:-1] + 'а'
    return n[:-1] if n.endswith('а') else n


def imenitelny(avtor, pered=''):
    """«Евгения Халдея» → «Евгений Халдей», «Екатерины Борисовой» → «Екатерина Борисова», «Картина Айвазовского» → «Айвазовский».
    pered — текст перед именем: после «фото/рисунок/работы…» без двоеточия — родительный. Не уверен — как есть; мусор — ''."""
    a = re.sub(r'\s+', ' ', avtor or '').strip(' ,;')
    m = re.match(r'(?i)(?:картина|портрет|фото(?:графия)?|рисунок|работы|гравюра|литография)\s+(?=[А-ЯЁ])', a)
    if m:
        a, pered = a[m.end():], m.group(0).strip()
    a = re.sub(r'^(.+?[а-яё]{2})\.\s.*$', r'\1', a)  # «Михаила Калашникова. По» → до точки
    sl = a.split()
    if not re.search(r'[а-яёa-z]', a):
        return ''  # «XIX», «Р-7» — не имя
    if not sl or not re.search('[А-ЯЁ]', a[:1]) or re.search(r'[A-Za-z]', a):
        return a
    if any(w.endswith('ью') for w in sl) or (len(sl) == 1 and re.search(r'(?:ых|их|ной|ного)$', a)):
        return ''  # «Любовью Тимофеевной», «Вооружённых», «Красной» — не имя
    ini = [w for w in sl[:-1] if re.fullmatch(r'[А-ЯЁ]\.(?:[А-ЯЁ]\.)?', w)]
    imena = [w for w in sl[:-1] if w not in ini]
    fam = sl[-1]
    if imena:  # падеж — по имени
        n = imena[0]
        muzh_rod = bool(re.search(r'(?:ея|ия|ого|его|[оеёиы]ва|[иы]на|[бвгдзклмнпрстфхцчшщ]а)$', fam))
        zhen_rod = bool(re.search(r'(?:ы|ьи|ии|[гкх]и)$', n) or n == 'Любови') and bool(re.search(r'(?:ой|ей)$', fam))
        if n == 'Евгения' and re.search(r'(?:ея|ия|ого|его)$', fam):
            pass  # «Евгения Халдея» — мужской родительный
        elif n in ZHEN_IMENA or re.search(r'(?:[йь]|[бвгдзклмнпрстфхцчшщ])$', n):
            return a  # именительный: «Виталий Барсов», «Наталья Филатова», «Иван Шкаев»
        if zhen_rod:
            return ' '.join([_imya_im(w) for w in imena] + [_fam_im(fam, True)])
        if muzh_rod and re.search(r'(?:[бвгдзклмнпрстфхцчшщ]а|[иеа]я)$', n):
            return ' '.join([_imya_im(w) for w in imena] + [_fam_im(fam, False)])
        return a
    if not ROD_PRED.search(pered.strip(' :').strip()) or pered.rstrip().endswith(':'):
        return a  # «Фото: И. Иванов», «Художник В. Завьялов» — уже именительный
    zhen = bool(re.search(r'(?:овой|евой|ёвой|иной|ыной|ской|цкой)$', fam))
    return ' '.join(ini + [_fam_im(fam, zhen)])


def avtor_v(s):
    """Имя человека из куска подписи: «А. Радаков», «Дмитрий Моор», «Уильям Элмс, Лондон» → имя."""
    for kus in re.split(r'\s*[,;]\s*|(?<=[а-яёa-z]{2})\.\s+(?=[А-ЯЁA-Z][а-яёa-z])', s.strip()):
        kus = kus.strip(' .')
        if kus and not NE_AVTOR.match(kus) and IMYA.fullmatch(kus):
            return kus
    return ''


TVORETS = re.compile(r'(?:^|[\s,.;(])(?:[Рр]исунок|работы|[Фф]ото:?|[Хх]уд(?:ожник)?\.?|[Гг]равюра|[Лл]итография|[Аа]втор(?: снимка)?:?)\s+')


def iz_podpisi(podpis):
    """dict(avtor, nazvanie, god) из подписи кадра; автор — тот, кто после «рисунок/работы/фото…», а не изображённый."""
    d = _iz_podpisi(podpis)
    s = re.sub(r'\s+', ' ', podpis or '')
    for m in TVORETS.finditer(s):
        hv = s[m.end():]
        if re.match(r'(?i)неизвестн', hv):
            return dict(d, avtor='')  # «Портрет работы неизвестного художника» — изображённый не автор
        k = re.match(r'(?:[А-ЯЁ]\.\s?){1,2}\s?[А-ЯЁ][а-яё]+(?:-[А-ЯЁ][а-яё]+)?|[А-ЯЁ][а-яё]+(?:\s[А-ЯЁ][а-яё]+){0,2}', hv)
        if k and not NE_AVTOR.match(k.group(0)):
            av = imenitelny(k.group(0), s[:m.end()])
            if av:
                return dict(d, avtor=av)
    if re.search(r'(?i)автор(?: снимка)? (?:неизвест|не установлен)|без имени автора|неизвестн\w* (?:автор|художник|фотограф)', s):
        return dict(d, avtor='')
    return dict(d, avtor=imenitelny(d['avtor']))


def _iz_podpisi(podpis):
    s = re.sub(r'\s+', ' ', podpis or '').strip()
    if not s:
        return dict(avtor='', nazvanie='', god='')
    m = re.fullmatch(r'(.+?)\s*\(([^()]+?),\s*(?:ок\.\s?)?(1[5-9]\d{2}|20[0-2]\d)[^()]*\)\.?(.*)', s)
    if m and avtor_v(m.group(2)):  # «Название (Автор, 1905)»
        return dict(avtor=avtor_v(m.group(2)), nazvanie=m.group(1).strip(' .«»'), god=m.group(3))
    chasti = s.split(' · ')
    if len(chasti) > 1:  # «Автор · год · … «Название» описание»
        hvost = chasti[-1]
        g = GOD_PODP.match(hvost) or re.match(r'(?:(?:нач|кон|сер)\.\s?)?[IVXLC]+\s?в(?:ек|\.)?', hvost)
        if g:
            hvost = hvost[g.end():].strip()
        golova = chasti[:-1] + ([chasti[-1][:g.end()]] if g else [])
        god = next((x.group(1) for c in golova for x in [GOD_PODP.search(c)] if x), '')
        avtor = next((x for c in golova for x in [avtor_v(re.sub(r'«[^»]*»', '', GOD_PODP.sub('', c)))] if x), '')
        fr = [f for f in re.split(r'(?<=[^А-ЯЁA-Z])\.\s', hvost) if f.strip()]
        while len(fr) > 1 and re.search(r'(?i)коллекци|собрани|музе|библиотек|архив', fr[0]):
            fr.pop(0)  # «Наполеоновская коллекция …» — держатель, не название
        kav = [(c, kavychki(c)) for c in [hvost] + [GOD_PODP.sub('', c, 1).strip() for c in chasti[:-1]]]
        c, k = next(((c, k) for c, k in kav if k and k[0] <= 40), (hvost, None))
        nazv = c[:k[1]] if k else (fr[0] if fr else '')
        return dict(avtor=avtor, nazvanie=nazv.strip(' .')[:160], god=god)
    g = GOD_PODP.search(s)
    god = g.group(1) if g else ''
    k = kavychki(s)
    if k and k[0] <= 60:  # «Карикатура … журнал «Будильник», 1906», «Автор «Название», 1905»
        pered = s[:k[0]].strip(' ,.')
        av = avtor_v(pered)
        return dict(avtor=av, nazvanie=(s[k[0]:k[1]] if av or not pered else s[:k[1]]).strip(), god=god)
    m = re.match(r'(.{3,120}?),\s(?:\d{1,2}\.\d{1,2}\.)?(1[5-9]\d{2}|20[0-2]\d)\b(?!-)\.?\s+(?=[А-ЯЁ])', s)
    if m and not re.search(r'[а-яёa-z]{2}\.\s', m.group(1)):  # «Лагерь встречает самолёт, 1934 Печатная подпись …» — название до года, дальше описание
        return dict(avtor='', nazvanie=m.group(1).strip(' .'), god=m.group(2))
    m = re.match(r'((?:[А-ЯЁ]\.\s?){1,2}[А-ЯЁ][а-яё]+(?:-[А-ЯЁ][а-яё]+)?)\s+(?=[А-ЯЁ«])', s)
    if m and not re.match(r'[А-ЯЁ][а-яё]*\.\s', s[m.end():]):  # «А. Радаков Подборка карикатур …»
        rest = s[m.end():]
        k = kavychki(rest)
        return dict(avtor=m.group(1), nazvanie=(rest[:k[1]] if k and k[0] <= 40 else re.split(r'(?<=[^А-ЯЁA-Z])\.\s', rest)[0]).strip(' .')[:160], god=god)
    kus = [c.strip() for c in re.split(r'(?<=[^А-ЯЁA-Z\s])\.\s+', s) if c.strip()]
    if len(kus) >= 2 and avtor_v(kus[0]):  # «Автор. Название. 1905»
        return dict(avtor=avtor_v(kus[0]), nazvanie=GOD_PODP.sub('', kus[1]).strip(' .,'), god=god)
    g0 = GOD_PODP.search(kus[0]) if kus else None  # «Фотография Мандельштама, 1930 год, автор …» — до года
    nazv = (kus[0][:g0.start()] if g0 and g0.start() > 10 else GOD_PODP.sub('', kus[0])) if kus else ''
    return dict(avtor='', nazvanie=re.sub(r'\s+', ' ', nazv).strip(' .,:')[:160], god=god)


def opis(tekst, podpis):
    """Держатель, инв., автор, год, сюжет — из подписи, credit и строки прав."""
    derzh = next((m.group(0).strip() for m in DERZH.finditer(tekst)
                  if not re.match(r'(?i)wikimedia', m.group(0)) and not re.fullmatch(r'[а-яё]+', m.group(0).strip())), '')
    inv = next((m.group(1).strip() for r in INV for m in [r.search(tekst)] if m), '')
    av = next((a for a in AVTOR.finditer(tekst) if not NE_AVTOR.match(a.group(1))), None)
    god = GOD.search(tekst)
    pp = iz_podpisi(podpis)  # год подписи точнее года из имени файла; автор — явный «Фото:/Худ.» прежде
    av = imenitelny(av.group(1), tekst[max(0, av.start(1) - 12):av.start(1)]) if av else ''
    return dict(derzhatel=derzh, inv=inv, avtor=av or pp['avtor'],
                god=pp['god'] or (god.group(1) if god else ''), nazvanie=pp['nazvanie'],
                syuzhet=re.split(r'(?<=[^А-ЯЁA-Z])\.\s', podpis)[0][:160])


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


# Р93 (21.10.2026, Сергей): Библиотека Конгресса — «только в самом крайнем случае», как Википедия:
# по личному разрешению владельца. По умолчанию не загружается; включает только --s-loc.
TOLKO_PO_RAZRESHENIYU = {'loc': 'Р93: Библиотека Конгресса — только с личного разрешения владельца'}


def adaptery(vkl=(), bez=()):
    """Адаптеры scripts/fondy/*.py. Фонды из TOLKO_PO_RAZRESHENIYU — только если названы в vkl; bez — выключить любые."""
    import importlib.util
    out = []
    for f in sorted((ROOT / 'scripts/fondy').glob('*.py')):
        if f.name.startswith('_') or f.stem == 'primer':  # __init__, _set, заглушка — не адаптеры
            continue
        if f.stem in bez or (f.stem in TOLKO_PO_RAZRESHENIYU and f.stem not in vkl):
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


STOP_SLOVA = set('и в во на с со к ко о об от из за по для до при без под над про его ее её их а но же ли не'.split())


def slova_nazv(s):
    """Слова названия: регистр, ё, кавычки, пунктуация сняты; служебные слова и одиночные буквы — вон."""
    s = str(s or '').lower().replace('ё', 'е')
    w = [w for w in re.findall(r'[0-9a-zа-яѳѵі]+', s) if w not in STOP_SLOVA or len(w) == 1]
    dl = [x for x in w if len(x) > 1]
    return w if len(dl) <= 2 else dl  # короткое «Буква «В»» — буква значима; в длинном одиночные — предлоги


def odno_slovo(a, b):
    """Одна словоформа: равны или общая основа ≥5 букв (наполеона/наполеоном, россии/россия)."""
    if a == b:
        return True
    if min(len(a), len(b)) < 5:
        return False
    n = 0
    while n < min(len(a), len(b)) and a[n] == b[n]:
        n += 1
    return n >= max(5, min(len(a), len(b)) - 3)


def pokrytie(iz, v):
    return sum(any(odno_slovo(w, x) for x in v) for w in iz) / len(iz) if iz else 0.0


def gody(r):
    """Годы записи фонда: god и все годы датировки («1813-1814» → 1813..1814, «1950-е» → 1950..1959)."""
    s = f"{r.get('god') or ''} {r.get('datirovka') or ''}"
    g = [int(x) for x in re.findall(r'(?<!\d)(1[0-9]\d{2}|20[0-2]\d)(?!\d)', s)]
    g += [int(x) + 9 for x in re.findall(r'(?<!\d)(1[0-9]\d0|20[0-2]0)-?е', s)]
    return (min(g), max(g)) if g else None


def god_sovpal(k, r):
    if not re.fullmatch(r'\d{4}', str(k.get('god') or '')):
        return False
    d = gody(r)
    return bool(d) and d[0] <= int(k['god']) <= d[1]


def familii(s):
    """Фамилии авторов записи: «Иван Иванович Теребенев, Пётр Соколов» → {теребенев, соколов}."""
    return {norm(re.split(r'[\s.]+', a.strip())[-1]) for a in re.split(r'[,;]', str(s or '')) if a.strip()} - {''}


def nomer_vypuska(s):
    m = re.search(r'№\s*(\d+)', str(s or ''))
    return m.group(1) if m else ''


POROG_NAZV = 0.8  # доля слов названия, найденных в обе стороны
KARTINNYE = {'tretyakov', 'rusmuseum', 'Государственная Третьяковская галерея', 'Государственный Русский музей'}  # FOND адаптеров scripts/fondy/


def strogo(k, r):
    """Р90: только строгое совпадение. Номер у того же держателя; автор + год + название (название фонда —
    с полем nazvanie подписи, не со всей подписью); выпуск журнала — название журнала + год + номер."""
    if k['inv'] and r.get('inv') and norm(k['inv']) == norm(r['inv']):
        dk, dr = norm(k['derzhatel']), norm(r.get('derzhatel'))
        if dk and dr and (dk in dr or dr in dk):
            return 'инв. номер у того же держателя'
    nk, fk = slova_nazv(k.get('nazvanie')), familii(k.get('avtor'))
    # пояснение фонда в скобках не часть названия: «Черное море (На Черном море начинает разыгрываться буря)»
    t = str(r.get('title') or '')
    nfs = [x for x in (slova_nazv(t), slova_nazv(re.sub(r'\s*\([^)]*\)', '', t))) if x]
    nazv = max((min(pokrytie(nf, nk), pokrytie(nk, nf)) for nf in nfs), default=0.0) if nk else 0.0
    if fk and fk & familii(r.get('avtor')) and nazv >= POROG_NAZV:
        if god_sovpal(k, r):
            return 'автор + год + название'
        # картина в одном экземпляре (ГТГ, ГРМ), название слово в слово — год подписи может расходиться
        # с датировкой фонда на 1–3 года (Репин «Крестный ход в Курской губернии»: подпись 1880, ГТГ 1881–1883);
        # в credit идёт год фонда. Гравюры и журналы — тиражи по годам, там год решает (test_fondy_pushkin)
        d = gody(r)
        if r.get('fond') in KARTINNYE and nazv == 1.0 and d and re.fullmatch(r'\d{4}', str(k.get('god') or '')) and d[0] - 3 <= int(k['god']) <= d[1] + 3:
            return 'автор + название слово в слово, год по датировке фонда'
    # выпуск журнала (запись без автора): «Будильник, 1873. № 4» ↔ подпись «… «Будильник», 1873, № 4»
    if not r.get('avtor'):
        nr = nomer_vypuska(r.get('title'))
        nkd = nomer_vypuska(k.get('podpis')) or nomer_vypuska(k.get('nazvanie'))
        zh = slova_nazv(re.split(r'[,.:]|\d', str(r.get('title') or ''))[0])
        tekst = slova_nazv(f"{k.get('podpis') or ''} {k.get('nazvanie') or ''}")
        if (nr and nkd and nr == nkd and zh and str(r.get('god') or '')[:4] == str(k.get('god') or '') and k.get('god')
                and all(any(odno_slovo(w, x) for x in tekst) for w in zh)):
            return 'журнал + год + номер выпуска'
    return None


def bez_wiki(s):
    s = re.sub(r'[,;]?\s*(?:Цифровой файл:\s*)?(?:Wikimedia Commons|Викисклад[ае]?)(?:,\s*«[^»]*»)?(?:\s*\([^)]*\))?', '', s, flags=re.I)
    return re.sub(r'\s+([.,;])', r'\1', s).strip()


def primenit(k, r):
    """Скан через fetch/save (как put_fond), затем подпись, data-source, data-license, строка прав."""
    src = sources().get(r['fond'], {})
    pravo = src.get('rights') or src.get('license') or PRAVA.get(r['fond']) or ''
    if not LIC_OK.search(pravo):
        warn(f'{k["muzey"]}/{k["den"]} {k["fayl"]}: права не названы — кадр не ставлю, через put --prava')
        return False
    name = src.get('name') or r['fond']
    imya = slug(f'{r["fond"]}-{Path(urllib.parse.urlsplit(r["image"]).path).stem}')
    gotov = ROOT / 'public' / f'muzei/{k["muzey"]}/img/{k["den"]}-{imya}.jpg'
    try:
        # имя — из адреса скана: файл уже есть = тот же скан под второй копией кадра дня (крупный + превью)
        rel, im = (gotov.relative_to(ROOT / 'public').as_posix(), Image.open(gotov)) if gotov.exists() \
            else save(fetch(r['image']), k['muzey'], k['den'], imya)
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


# ── параллельный прогон: не больше HOST_MAX запросов на хост разом, кэш одинаковых ответов на прогон ──
HOST_MAX = 2
_set_lock = __import__('threading').Lock()
_hosty, _kesh, _kesh_zamki = {}, {}, {}
VYVOD = __import__('threading').Lock()  # строки вывода не перемешиваются
PLOHO_KESH = {403, 407, 429, 500, 502, 503, 504}


def _host_sem(url):
    import threading
    h = urllib.parse.urlsplit(str(url)).hostname or ''
    with _set_lock:
        return _hosty.setdefault(h, threading.BoundedSemaphore(HOST_MAX))


def _kesh_zamok(key):
    import threading
    with _set_lock:
        return _kesh_zamki.setdefault(key, threading.Lock())


def cherez_kesh(key, url, delat, keshirovat=lambda r: True):
    """Ответ по key из кэша прогона; нет — delat() под семафором хоста. Одинаковые запросы разом — один в сеть."""
    with _kesh_zamok(key):
        if key in _kesh:
            return _kesh[key]
        with _host_sem(url):
            r = delat()
        if keshirovat(r):
            _kesh[key] = r
        return r


class _Otvet(io.BytesIO):
    """Сохранённый ответ urllib: read()/json.load, status, headers, with."""
    def __init__(self, body, status, headers, url):
        super().__init__(body); self.status = self.code = status; self.headers = headers; self.url = url
    def getcode(self): return self.status
    def geturl(self): return self.url
    def info(self): return self.headers


def ustanovit_set():
    """Обёртки над requests.Session.request и urllib OpenerDirector.open для адаптеров scripts/fondy (один раз)."""
    if getattr(ustanovit_set, 'gotovo', False):
        return
    ustanovit_set.gotovo = True
    try:
        import requests
        orig_req = requests.Session.request

        def request(self, method, url, *a, **kw):
            if kw.get('stream'):
                with _host_sem(url):
                    return orig_req(self, method, url, *a, **kw)
            key = ('rq', str(method).upper(), str(url), repr(a), repr(sorted((k, repr(v)) for k, v in kw.items() if k != 'timeout')))
            return cherez_kesh(key, url, lambda: orig_req(self, method, url, *a, **kw),
                               lambda r: getattr(r, 'status_code', 0) not in PLOHO_KESH)
        requests.Session.request = request
    except ImportError:
        pass
    orig_open = urllib.request.OpenerDirector.open

    def open_(self, fullurl, data=None, *a, **kw):
        url = fullurl.full_url if isinstance(fullurl, urllib.request.Request) else str(fullurl)
        if isinstance(fullurl, urllib.request.Request):
            data = data if data is not None else fullurl.data
            key = ('ul', fullurl.get_method(), url, repr(data), repr(sorted(fullurl.header_items())), id(self.handlers[0]) if self.handlers else 0)
        else:
            key = ('ul', 'POST' if data else 'GET', url, repr(data), (), id(self.handlers[0]) if self.handlers else 0)

        def delat():
            with orig_open(self, fullurl, data, *a, **kw) as r:
                return _Otvet(r.read(), getattr(r, 'status', 200), r.headers, r.geturl())
        r = cherez_kesh(key, url, delat)
        return _Otvet(r.getvalue(), r.status, r.headers, r.url)
    urllib.request.OpenerDirector.open = open_


def pechat(*a, err=False):
    with VYVOD:
        print(*a, file=sys.stderr if err else sys.stdout, flush=True)


def iskat(k, ad):
    """Поиск одного кадра по адаптерам (в потоке): (hit, kand, upali)."""
    kk = {x: k[x] for x in ('muzey', 'den', 'fayl', 'podpis', 'derzhatel', 'inv', 'avtor', 'nazvanie', 'god', 'syuzhet')}
    hit, kand, upali = None, 0, []
    for name, fn in ad:
        try:
            for r in fn(dict(kk)) or []:
                kand += 1
                why = strogo(kk, r)
                if why:
                    hit = (r, why); break
        except Exception as e:
            upali.append(name)
            pechat(f'адаптер {name} упал на {k["muzey"]}/{k["den"]} ({type(e).__name__}: {e}) — пропускаю', err=True)
        if hit:
            break
    return kk, hit, kand, upali


def klyuch(stroka):
    """(музей, день, файл) строки таблицы."""
    c = stroka.split('\t')
    return tuple(c[:3]) if len(c) >= 3 else None


def zamena(muzey=None, prim=False, vkl=(), bez=(), j=6, prodolzhit=False):
    import signal
    from concurrent.futures import ThreadPoolExecutor
    ad = adaptery(vkl, bez)
    if any(n == 'goskatalog' for n, _ in ad):  # Госкаталог только через российский туннель; ru_proxy() поднимает его сам (#347)
        try: ru_proxy()
        except RuntimeError as e: warn(f'{e} — goskatalog вернёт пусто')
    ustanovit_set()
    vykl = sorted(set(TOLKO_PO_RAZRESHENIYU) - set(vkl)) + sorted(set(bez) - set(TOLKO_PO_RAZRESHENIYU))
    print(f'адаптеров фондов: {len(ad)} ({", ".join(n for n, _ in ad) or "нет"}); выключены: {", ".join(vykl) or "нет"}; '
          f'режим: {"ПРИМЕНИТЬ" if prim else "сухой прогон"}; потоков: {j}', flush=True)
    kadry = list(kadry_muzeya(muzey))
    itog, po_fondam = {}, {}
    out = ROOT / 'data/r90-na-razreshenie.tsv'
    out.parent.mkdir(exist_ok=True)
    clean = lambda v: re.sub(r'[\t\n]+', ' ', str(v))
    drugie, stary = [], []
    if out.is_file():
        for r in out.read_text().splitlines()[1:]:
            if r:
                (stary if not muzey or r.split('\t')[0] == muzey else drugie).append(r)
    # прежние строки обрабатываемых музеев: при обрыве необработанные дописываются, ничего не теряется
    gotovo = set()  # ключи (музей, день, файл), обработанные в этом прогоне
    propusk = {klyuch(r) for r in stary} if prodolzhit else set()
    # найденное — data/r90-naydeno.tsv, пишется сразу: дозапуск и --primenit берут находку оттуда, без сети
    nayd_put = ROOT / 'data/r90-naydeno.tsv'
    naydeno = naydeno_chitat(nayd_put)
    if prodolzhit:
        n0 = len(kadry)
        kadry = [k for k in kadry if (k['muzey'], k['den'], k['fayl']) not in propusk
                 and (prim or (k['muzey'], k['den'], k['fayl']) not in naydeno)]
        print(f'--prodolzhit: пропускаю {n0 - len(kadry)} кадров, уже стоящих в таблицах', flush=True)
    # пишется во временный файл рядом, в конце — атомарная подмена (os.replace)
    fd, tmp = tempfile.mkstemp(prefix='.r90-', suffix='.tsv', dir=out.parent)
    tsv = os.fdopen(fd, 'w')
    # строки чужих музеев сюда не пишутся: в конце берутся из таблицы заново под замком — параллельные прогоны
    # разных музеев не затирают друг друга
    if prodolzhit:
        tsv.write(''.join(r + '\n' for r in stary))
    tsv.flush()
    n_net, oborvan = 0, False

    def stop(*_):
        raise KeyboardInterrupt
    staryy_sig = signal.signal(signal.SIGTERM, stop) if __import__('threading').current_thread() is __import__('threading').main_thread() else None
    # html правится с конца файла, чтобы смещения ещё не обработанных кадров не съезжали; поиск — параллельно,
    # разбор результатов и правка — по порядку в главном потоке
    kadry.sort(key=lambda k: (str(k['put']), -(k.get('tag') or (0,))[0]))
    pool = ThreadPoolExecutor(max_workers=max(1, j))
    try:
        futs = [(k, None if (k['muzey'], k['den'], k['fayl']) in naydeno else pool.submit(iskat, k, ad)) for k in kadry]
        for k, fu in futs:
            if fu is None:  # найдено прежним прогоном
                kk, hit, kand, upali = k, naydeno[(k['muzey'], k['den'], k['fayl'])], 0, []
            else:
                kk, hit, kand, upali = fu.result()
                if hit:
                    naydeno_zapisat(nayd_put, k, hit)
            s = itog.setdefault(k['muzey'], dict(kadrov=0, derzh=0, inv=0, naydeno=0, zameneno=0))
            s['kadrov'] += 1; s['derzh'] += bool(k['derzhatel']); s['inv'] += bool(k['inv'])
            stranica = f'{k["muzey"]}/{k["den"]}'
            if hit:
                s['naydeno'] += 1
                po_fondam[hit[0]['fond']] = po_fondam.get(hit[0]['fond'], 0) + 1
                pechat(f'{stranica} | {k["fayl"]} | найдено: {hit[0]["fond"]} → {hit[0]["card"]} ({hit[1]})')
                if prim and primenit(k, hit[0]):
                    s['zameneno'] += 1
            else:
                if not ad:
                    pochemu = 'нет включённых адаптеров'
                elif not kk['inv'] and not (kk['avtor'] and (kk['nazvanie'] or kk['syuzhet'])):
                    pochemu = 'в подписи нет ни инв. номера, ни автора с названием'
                elif kand:
                    pochemu = f'кандидатов {kand}, строгой сверки (номер у держателя или автор+год+название) нет'
                    if not kk['god']:
                        pochemu += '; в подписи нет года'
                else:
                    pochemu = 'фонды ничего не вернули'
                if upali:
                    pochemu += f'; упали: {", ".join(upali)}'
                pechat(f'{stranica} | {k["fayl"]} | нет ({pochemu})')
                iskali = '; '.join(f'{a}: {kk[b]}' for a, b in (('инв.', 'inv'), ('автор', 'avtor'), ('название', 'nazvanie'), ('год', 'god')) if kk[b]) \
                         + f'; сюжет: {kk["syuzhet"][:100]}'
                tsv.write('\t'.join(map(clean, [k['muzey'], k['den'], k['fayl'], k['derzhatel'], k['inv'], iskali, pochemu])) + '\n')
                tsv.flush()
                n_net += 1
            gotovo.add((k['muzey'], k['den'], k['fayl']))
    except KeyboardInterrupt:
        oborvan = True
        pool.shutdown(wait=False, cancel_futures=True)
    finally:
        if not oborvan:
            pool.shutdown(wait=False, cancel_futures=True)
        if oborvan or sys.exc_info()[0] is not None:  # обрыв или ошибка: прежние строки необработанных кадров — назад
            vernul = [r for r in stary if klyuch(r) not in gotovo and klyuch(r) not in propusk]
            tsv.write(''.join(r + '\n' for r in vernul))
            warn(f'\nпрогон оборван: обработано {len(gotovo)} из {len(kadry)}, прежних строк возвращено {len(vernul)} '
                 f'(дальше — --prodolzhit)')
        tsv.close()
        import fcntl
        with open(out.parent / '.r90.lock', 'w') as zamok:
            fcntl.flock(zamok, fcntl.LOCK_EX)
            if muzey and out.is_file():
                drugie = [r for r in out.read_text().splitlines()[1:] if r and r.split('\t')[0] != muzey]
            nashi = Path(tmp).read_text().splitlines()
            Path(tmp).write_text('\n'.join(['\t'.join(('музей', 'день', 'файл', 'держатель', 'инв', 'что искали', 'почему нет'))]
                                           + sorted(drugie) + nashi) + '\n')
            os.replace(tmp, out)
        if staryy_sig is not None:
            signal.signal(signal.SIGTERM, staryy_sig)
    print(f'\n{"музей":<18}{"кадров":>7}{"держ.":>7}{"инв.":>6}{"найдено":>9}{"не найд.":>9}' + ('  заменено' if prim else ''))
    for m, s in sorted(itog.items()) + [('ВСЕГО', {x: sum(s[x] for s in itog.values()) for x in ('kadrov', 'derzh', 'inv', 'naydeno', 'zameneno')})]:
        print(f'{m:<18}{s["kadrov"]:>7}{s["derzh"]:>7}{s["inv"]:>6}{s["naydeno"]:>9}{s["kadrov"] - s["naydeno"]:>9}'
              + (f'{s["zameneno"]:>10}' if prim else ''))
    if po_fondam:
        print('найдено по фондам: ' + '; '.join(f'{f} {n}' for f, n in sorted(po_fondam.items(), key=lambda x: -x[1])))
    print(f'\nна личное разрешение Сергея: {n_net} строк → {out.relative_to(ROOT)}', flush=True)
    if oborvan:  # потоки с запросами в полёте не ждём: таблица уже подменена
        sys.stdout.flush(); sys.stderr.flush()
        os._exit(130)
    # Ноль — не результат, а сигнал (21.10, разбор Сергея): 0 из 20+ значит, что ищем не там или не так.
    nol = [m for m, s in itog.items() if s['kadrov'] >= 20 and s['naydeno'] == 0]
    if nol:
        sys.exit(f'СТОП: ноль находок в {", ".join(nol)} — до следующего шага посмотреть кадры глазами, '
                 'разложить по типу (картина, фото войны, марка, газета, экспонат, памятник) и проверить, '
                 'есть ли под каждый тип своя база; сеть виноватой не считать')


NAYD_SHAPKA = ('музей', 'день', 'файл', 'фонд', 'карточка', 'сверка', 'находка (json)')


def naydeno_chitat(put):
    """(музей, день, файл) -> (hit, сверка) из data/r90-naydeno.tsv; поздняя строка того же кадра главнее."""
    d = {}
    if put.is_file():
        for r in put.read_text().splitlines()[1:]:
            c = r.split('\t')
            if len(c) == len(NAYD_SHAPKA):
                d[tuple(c[:3])] = (json.loads(c[6]), c[5])
    return d


def naydeno_zapisat(put, k, hit):
    import fcntl
    clean = lambda v: re.sub(r'[\t\n]+', ' ', str(v))
    with open(put.parent / '.r90.lock', 'w') as zamok:
        fcntl.flock(zamok, fcntl.LOCK_EX)
        novyy = not put.is_file()
        with open(put, 'a') as f:
            if novyy:
                f.write('\t'.join(NAYD_SHAPKA) + '\n')
            f.write('\t'.join(map(clean, [k['muzey'], k['den'], k['fayl'], hit[0]['fond'], hit[0]['card'], hit[1]]))
                    + '\t' + json.dumps(hit[0], ensure_ascii=False) + '\n')


def kadry_muzeya(muzey=None):
    """Все места кадров с Викисклада (без сети) — те же, что берёт zamena."""
    for p in sorted((ROOT / 'src/content/days').glob('*/*.json')) + sorted((ROOT / 'src/data/full-pages').glob('*/*.html')):
        if muzey and p.parent.name != muzey:
            continue
        try:
            for k in (kadry_json(p) if p.suffix == '.json' else kadry_html(p)):
                yield dict(k, muzey=p.parent.name, den=p.stem)
        except Exception as e:
            warn(f'{p.relative_to(ROOT)}: не разобран ({e})')


def razbor(muzey=None, n=5):
    """Офлайн-сводка: что zamena отдаст адаптерам для кадров без держателя и инв. номера."""
    ks = list(kadry_muzeya(muzey))
    bez = [k for k in ks if not k['derzhatel'] and not k['inv']]
    print(f'{muzey or "все музеи"}: мест кадров {len(ks)}, с держателем или инв. {len(ks) - len(bez)}, без них {len(bez)}')
    for x, nm in (('avtor', 'с автором'), ('nazvanie', 'с названием'), ('god', 'с годом')):
        print(f'  {nm:<12} {sum(bool(k[x]) for k in bez):>4} из {len(bez)}')
    print(f'  все три    {sum(all(k[x] for x in ("avtor", "nazvanie", "god")) for k in bez):>4} из {len(bez)}')
    vidno = list({k['podpis']: k for k in bez if k['avtor'] and k['nazvanie']}.values())
    for k in vidno[::max(1, len(vidno) // max(1, n))][:max(0, n)]:
        print(f'  {k["podpis"][:90]!r}\n    → {k["avtor"]} | {k["nazvanie"]} | {k["god"]}')


def main(argv=None):
    import argparse
    global RAZRESHENIE
    ap = argparse.ArgumentParser(prog='kadr.py', description=__doc__.split('\n\n')[0],
                                 epilog='Подробно: python3 scripts/kadr.py <команда> --help', formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True, metavar='{find,put,zamena,razbor}')
    raz = argparse.ArgumentParser(add_help=False)
    raz.add_argument('--razreshenie', metavar='СЛОВО', help='Р90: Викисклад — только по слову Сергея ("Р№ или дата и слова")')
    f = sub.add_parser('find', parents=[raz], help='кандидаты по российским фондам')
    f.add_argument('query', help='что искать')
    f.add_argument('-n', type=int, default=10, help='сколько кандидатов (по умолчанию 10)')
    f.add_argument('--geo', metavar='LAT,LON', help='точка для PastVu')
    pu = sub.add_parser('put', parents=[raz], help='положить кадр из фонда в public/muzei/<музей>/img/')
    pu.add_argument('museum'); pu.add_argument('key', help='день, напр. 03-05')
    pu.add_argument('title', help='"фонд:ссылка" или имя файла'); pu.add_argument('caption', help='подпись')
    pu.add_argument('avtor', nargs='?', help='автор (для фонда обязателен)')
    pu.add_argument('--card', help='ссылка на карточку предмета')
    pu.add_argument('--prava', help='права по карточке: «общественное достояние (автор умер в ГГГГ)», CC BY …')
    z = sub.add_parser('zamena', help='Р90: кадры с Викисклада → российские фонды (сеть; без --primenit сухой прогон)')
    z.add_argument('--muzey', help='только этот музей'); z.add_argument('--primenit', action='store_true', help='применить найденное')
    z.add_argument('--s-loc', action='store_true', help='включить Библиотеку Конгресса — только с личного разрешения владельца, Р93')
    z.add_argument('--bez', metavar='ФОНД,...', default='', help='выключить фонды (имена файлов scripts/fondy/, через запятую)')
    z.add_argument('-j', type=int, default=6, help='кадров параллельно (по умолчанию 6; на один хост — не больше 2 запросов)')
    z.add_argument('--prodolzhit', action='store_true', help='пропустить кадры, уже стоящие в data/r90-na-razreshenie.tsv')
    r = sub.add_parser('razbor', help='без сети: сводка автор/название/год из подписей для zamena')
    r.add_argument('--muzey', help='только этот музей'); r.add_argument('-n', type=int, default=5, help='сколько примеров')
    a = ap.parse_args(argv)
    RAZRESHENIE = getattr(a, 'razreshenie', None)
    if a.cmd == 'zamena':
        zamena(a.muzey, a.primenit, vkl=('loc',) if a.s_loc else (), bez={x.strip() for x in a.bez.split(',') if x.strip()},
               j=a.j, prodolzhit=a.prodolzhit)
    elif a.cmd == 'razbor':
        razbor(a.muzey, a.n)
    elif a.cmd == 'find':
        find(a.query, a.n, a.geo)
    else:
        put(a.museum, a.key, a.title, a.caption, a.avtor, a.card, a.prava)


if __name__ == '__main__':
    main()
