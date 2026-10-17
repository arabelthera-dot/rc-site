#!/usr/bin/env python3
"""Кадр дня с Викисклада: поиск со свободной лицензией, скачивание, запись в карточку дня.

Картинки с Викисклада можно (Сергей 12.08.2026), текст оттуда — нельзя: подпись к кадру пишет человек
по русскому источнику дня. Инструмент только находит файл, тянет автора и лицензию и кладёт кадр в
public/muzei/<музей>/img/ — так же, как кадры, перенесённые со старого превью.

  kadr.py find "Gherman Titov Vostok 2" [-n 10]      кандидаты: файл, размер, лицензия, автор
  kadr.py put izobreteniya 10-17 "File:Titov.jpg" "Герман Титов перед полётом, 1961"
                                                      скачать, ужать до 1600 px, дописать images[] дня
  kadr.py put … "подпись" "Фото: ТАСС, 1961"        шестым — строка автора по-русски вместо данных Викисклада
Кадр после put — открыть и посмотреть: в поиске попадаются письма, автографы, плакаты с надписями.
Лицензии — только общественное достояние, CC0, CC BY, CC BY-SA; прочее put отклоняет.
"""
import html, io, json, re, sys, urllib.parse, urllib.request
from pathlib import Path

from PIL import Image

API = 'https://commons.wikimedia.org/w/api.php'
UA = {'User-Agent': 'rc-site-kadr/1.0 (arabelthera@gmail.com)'}
ROOT = Path(__file__).resolve().parent.parent
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


def find(query, n=10):
    r = api(action='query', list='search', srsearch=query, srnamespace=6, srlimit=n)
    titles = [x['title'] for x in r['query']['search']]
    for c in info(titles) if titles else []:
        ok = '✓' if FREE.search(c['license']) and c['mime'] in ('image/jpeg', 'image/png') else '✗'
        print(f"{ok} {c['title']} | {c['w']}×{c['h']} | {c['license']} | {c['author'][:60]} | {c['date']}\n    {c['desc']}")


def slug(s):
    t = str.maketrans('абвгдеёжзийклмнопрстуфхцчшщъыьэюя', 'abvgdeejziyklmnoprstufhccss_y_eua')
    s = re.sub(r'\.[a-z]+$', '', s.lower().replace('file:', '')).translate(t)
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:48]


def put(museum, key, title, caption, avtor=None):
    day = ROOT / 'src/content/days' / museum / f'{key}.json'
    if not day.is_file():
        sys.exit(f'нет дня {day}')
    if not title.startswith('File:'):
        title = 'File:' + title
    c = info([title])
    if not c:
        sys.exit(f'нет файла {title}')
    c = c[0]
    if not FREE.search(c['license']):
        sys.exit(f'лицензия «{c["license"]}» не свободная — не беру')
    raw = urllib.request.urlopen(urllib.request.Request(c['url'], headers=UA), timeout=60).read()
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    im.thumbnail((1600, 1600))
    if min(im.size) < 400:
        sys.exit(f'кадр мелкий ({im.size[0]}×{im.size[1]}) — ищи крупнее')
    rel = f'muzei/{museum}/img/{key}-{slug(title)}.jpg'
    (ROOT / 'public' / rel).parent.mkdir(parents=True, exist_ok=True)
    im.save(ROOT / 'public' / rel, 'JPEG', quality=84, optimize=True, progressive=True)
    year = f'; {c["date"]}' if c['date'] else ''
    if avtor:  # подпись автора по-русски вручную, если Викисклад даёт сканировщика или латиницу
        c['author'], year = avtor, ''
    credit = f'{c["author"]}{year}. Цифровой файл: Wikimedia Commons, «{title[5:]}» ({c["license"]}).'
    d = json.loads(day.read_text())
    imgs = d.get('images', [])
    if any(x['src'] == rel for x in imgs):
        sys.exit(f'кадр уже есть: {rel}')
    imgs.append(dict(src=rel, caption=caption, credit=credit))
    # images — сразу после ключевых полей дня, как у перенесённых дней (порядок полей zod не важен)
    d['images'] = imgs
    day.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    print(f'{rel} {im.size[0]}×{im.size[1]} {c["license"]}\n  {credit}')


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['find'] and len(a) >= 2:
        find(a[1], int(a[a.index('-n') + 1]) if '-n' in a else 10)
    elif a[:1] == ['put'] and len(a) in (5, 6):
        put(*a[1:])
    else:
        sys.exit(__doc__)
