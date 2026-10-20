#!/usr/bin/env python3
"""Ежедневный автопост в Telegram-канал и сообщество VK «Русская цивилизация» (вариант А, Сергей 18.10.2026).

Запуск — .github/workflows/kanaly.yml, каждый день в 9:00 МСК. Описание — docs/kanaly.md.

День — сегодняшняя дата по Москве (ММ-ДД). В пост идут музеи, у которых на этот день есть карточка с хуком
и большая страница (src/data/full-pages/<музей>/<ММ-ДД>.html). Главный музей — по кругу (порядок по номеру
в каталоге, шаг — номер дня в году), ещё до трёх — строкой «Сегодня также». Хук и title_ru — дословно.
Картинка — первая из images дня (jpg/png/webp, без text_on_image); у дня без такой — первая <img> большой
страницы (локальный файл сайта). Карточки-превью og/ с надписью не берутся: день без картинки идёт только
в «Сегодня также». WebP перед отправкой переводится в JPEG (Pillow) — VK его не принимает.
Возраст (Р41, src/data/vozrast.json): день 16+ — тихий трагический день, в пост не идёт; на 12+ в строке даты знак.
Каждый пропущенный музей — строкой в журнале, замена главного дня не бывает молчаливой.

Проверка (Е8, Р47): перед отправкой пост проходит scripts/kanaly/proverka.mjs — те же функции, что у сборки
(схема дня, title_ru полностью, реестры Минюста, возраст, картинка с основанием прав, ссылки отвечают 200).
Брак — пост не уходит ни на одну площадку, строки брака — в журнал (::error::) и сводку, работа красная.

Секреты (переменные окружения): TG_BOT_TOKEN, TG_CHANNEL, VK_TOKEN, VK_GROUP_ID. Нет секрета — площадка
пропускается. Отметка «уже отправлено» — файл <state>/<площадка>/sent (в Actions его хранит кэш на дату);
у VK дополнительно смотрится стена: пост со ссылкой на этот день уже есть — второй не ставится.
Комментарии VK (20.10.2026): пост уходит с close_comments=1 — модерации нет, правила комментариев сайта —
/pravila-kommentariev/. Открыть комментарии — переменная окружения VK_KOMMENTARII=1. Уже опубликованные
посты закрывает разовый scripts/kanaly/vk_zakryt_kommentarii.py (по умолчанию dry-run).

  python scripts/kanaly/post.py --dry-run [--date ММ-ДД]   собрать и напечатать, ничего не отправлять
  python scripts/kanaly/post.py --state .kanaly             отправить на сегодня
  python scripts/kanaly/post.py --json [--date ММ-ДД]       напечатать пост JSON без проверки (для проб)
"""
import argparse
import datetime as dt
import html
import json
import mimetypes
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]
DAYS = ROOT / 'src/content/days'
FULL = ROOT / 'src/data/full-pages'
PUBLIC = ROOT / 'public'
MSK = ZoneInfo('Europe/Moscow')
VK_API = '5.199'
TG_CAPTION = 1024
ALSO_MAX = 3
MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября',
          'ноября', 'декабря']
IMG_EXT = ('.jpg', '.jpeg', '.png', '.webp')


LOG = sys.stdout  # --json: журнал в stderr, в stdout только JSON поста


def log(msg):
    print(msg, file=LOG, flush=True)


def site_base():
    """Адрес сайта из astro.config.mjs (site + base) — к запуску домен сменится, правится только там."""
    cfg = (ROOT / 'astro.config.mjs').read_text(encoding='utf-8')
    site = re.search(r"^\s*site:\s*'([^']+)'", cfg, re.M).group(1).rstrip('/')
    base = re.search(r"^\s*base:\s*'([^']*)'", cfg, re.M)
    base = base.group(1).strip('/') if base else ''
    return f'{site}/{base}/' if base else f'{site}/'


# Символика врага (ст. 20.3 КоАП, 20.10.2026): кадр из data/simvolika-vraga.json в пост не идёт.
SIMVOLIKA = {k['fail'].lower() for k in json.loads((ROOT / 'data' / 'simvolika-vraga.json').read_text(encoding='utf-8'))['kadry']}


def first_image(slug, key, day):
    """Первая картинка дня — локальный файл в public/. У дня без images — первая <img> большой страницы."""
    for im in day.get('images') or []:
        f = PUBLIC / im['src'].lstrip('/')
        if im.get('text_on_image') or not f.name.lower().endswith(IMG_EXT) or f.name.lower() in SIMVOLIKA:
            continue
        if f.is_file():
            return f
    page = (FULL / slug / f'{key}.html').read_text(encoding='utf-8')
    for src in re.findall(r'<img\b[^>]*?\ssrc="([^"]+)"', page):
        src = html.unescape(src).split('?')[0].split('#')[0]
        if re.match(r'^[a-z][a-z0-9+.-]*:|^//', src, re.I) or not src.lower().endswith(IMG_EXT):
            continue
        f = (PUBLIC / src.lstrip('/')) if src.startswith('/') else (PUBLIC / 'muzei' / slug / src)
        f = f.resolve()
        if f.is_file() and PUBLIC.resolve() in f.parents and f.name.lower() not in SIMVOLIKA:
            return f
    return None


def znak(slug, key, vozrast):
    """Знак 436-ФЗ дня: день-исключение → музей → сайт (тот же порядок, что src/lib/vozrast.mjs znak)."""
    return ((vozrast['dni'].get(slug) or {}).get(key) or {}).get('znak') or vozrast['muzei'].get(slug) or vozrast['sajt']


def collect(key, skipped=None):
    """Музеи с хуком и большой страницей на день key — по номеру в каталоге. 16+ — в skipped с причиной."""
    museums = json.loads((ROOT / 'src/data/museums.json').read_text(encoding='utf-8'))['museums']
    vozrast = json.loads((ROOT / 'src/data/vozrast.json').read_text(encoding='utf-8'))
    skipped = [] if skipped is None else skipped
    out = []
    for m in sorted(museums, key=lambda m: m['number']):
        card = DAYS / m['slug'] / f'{key}.json'
        if not card.is_file() or not (FULL / m['slug'] / f'{key}.html').is_file():
            continue
        day = json.loads(card.read_text(encoding='utf-8'))
        if not (day.get('hook') or '').strip():
            continue
        z = znak(m['slug'], key, vozrast)
        if int(z.rstrip('+')) >= 16:
            skipped.append(f"{m['title_ru']} — день {z}, тихий трагический день, в пост не идёт")
            continue
        out.append({'slug': m['slug'], 'number': m['number'], 'title': m['title_ru'], 'hook': day['hook'].strip(),
                    'image': first_image(m['slug'], key, day), 'znak': z})
    return out


def build(date):
    key = date.strftime('%m-%d')
    base = site_base()
    url = lambda m: f"{base}muzei/{m['slug']}/den/{key}/"
    skipped = []
    found = collect(key, skipped)
    for s in skipped:
        log(f'Пропуск: {s}.')
    if not found:
        return None, key
    # Главный — по кругу: шаг — номер дня в году; у кого нет картинки, главным не идёт.
    start = date.timetuple().tm_yday % len(found)
    ring = found[start:] + found[:start]
    main = next((m for m in ring if m['image']), None)
    if not main:
        return None, key
    for m in ring[:ring.index(main)]:
        log(f"Пропуск главным: {m['title']} — нет картинки без надписи, идёт в «Сегодня также».")
    also = [m for m in ring if m is not main][:ALSO_MAX]
    when = f'{date.day} {MONTHS[date.month - 1]}'
    if int(main['znak'].rstrip('+')) >= 12:
        when += f" · {main['znak']}"

    def tg(also):
        e = html.escape
        s = f"<b>{e(when)} · {e(main['title'])}</b>\n\n{e(main['hook'])}\n\n<a href=\"{e(url(main))}\">Открыть день в музее</a>"
        if also:
            s += '\n\nСегодня также:\n' + '\n'.join(f"• <a href=\"{e(url(m))}\">{e(m['title'])}</a>" for m in also)
        return s

    def visible(s):
        return len(html.unescape(re.sub(r'<[^>]+>', '', s)))

    # Подпись Telegram — до 1024 видимых знаков: не влезает — «Сегодня также» короче.
    n = len(also)
    while n and visible(tg(also[:n])) > TG_CAPTION:
        n -= 1
    caption = tg(also[:n])
    if visible(caption) > TG_CAPTION:
        raise SystemExit(f'подпись Telegram длиннее {TG_CAPTION} знаков даже без «Сегодня также»')

    vk = f"{when} · {main['title']}\n\n{main['hook']}\n\nОткрыть день в музее: {url(main)}"
    if also:
        vk += '\n\nСегодня также:\n' + '\n'.join(f"• {m['title']} — {url(m)}" for m in also)
    return {'key': key, 'url': url(main), 'image': main['image'], 'tg': caption, 'vk': vk,
            'main': main, 'also': also, 'urls': [url(main)] + [url(m) for m in also]}, key


# --- отправка -------------------------------------------------------------------------------------------------

def check(post, offline=False):
    """Проверка поста (scripts/kanaly/proverka.mjs) — те же функции, что у сборки. (код, строки вывода)."""
    cmd = ['node', 'scripts/kanaly/proverka.mjs'] + (['--bez-seti'] if offline else [])
    try:
        r = subprocess.run(cmd, cwd=ROOT, input=json.dumps(as_json(post), ensure_ascii=False), capture_output=True,
                           text=True, timeout=300)
    except (OSError, subprocess.TimeoutExpired) as e:
        return 2, [f'брак: проверка поста не выполнена — {e}']
    lines = [s for s in (r.stdout + r.stderr).splitlines() if s.strip()]
    return r.returncode, lines or [f'брак: проверка поста молча вернула код {r.returncode}']


def as_json(post):
    p = dict(post)
    p['image'] = str(post['image'].relative_to(ROOT))
    p['main'] = {k: v for k, v in post['main'].items() if k != 'image'}
    p['also'] = [{k: v for k, v in m.items() if k != 'image'} for m in post['also']]
    return p


def alarm(lines):
    """Брак — в журнал строкой ::error:: (тревога Actions) и в сводку работы."""
    for s in lines:
        log(f'::error::{s}' if s.startswith('брак') else s)
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a', encoding='utf-8') as f:
            f.write('### Пост дня не отправлен — брак\n\n' + ''.join(f'- {s}\n' for s in lines) + '\n')


def photo_bytes(path):
    """Файл картинки для отправки. WebP VK не принимает — переводится в JPEG (Pillow)."""
    if path.suffix.lower() != '.webp':
        return path.name, path.read_bytes()
    import io
    from PIL import Image
    buf = io.BytesIO()
    Image.open(path).convert('RGB').save(buf, 'JPEG', quality=90)
    return path.with_suffix('.jpg').name, buf.getvalue()


def multipart(fields, file_field, path):
    b = uuid.uuid4().hex
    name, data = photo_bytes(path)
    body = b''
    for k, v in fields.items():
        body += f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    ctype = mimetypes.guess_type(name)[0] or 'application/octet-stream'
    body += (f'--{b}\r\nContent-Disposition: form-data; name="{file_field}"; filename="{name}"\r\n'
             f'Content-Type: {ctype}\r\n\r\n').encode() + data + f'\r\n--{b}--\r\n'.encode()
    return body, f'multipart/form-data; boundary={b}'


def http(url, data=None, ctype=None):
    req = urllib.request.Request(url, data=data, headers={'Content-Type': ctype} if ctype else {})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def send_tg(post, token, channel):
    body, ctype = multipart({'chat_id': channel, 'caption': post['tg'], 'parse_mode': 'HTML'}, 'photo', post['image'])
    try:
        r = http(f'https://api.telegram.org/bot{token}/sendPhoto', body, ctype)
    except urllib.error.HTTPError as e:
        r = json.loads(e.read().decode() or '{}')
    if not r.get('ok'):
        raise RuntimeError(f"Telegram: {r.get('description', r)}")
    return f"сообщение {r['result']['message_id']}"


def vk(method, token, **params):
    params.update(access_token=token, v=VK_API)
    r = http(f'https://api.vk.com/method/{method}', urllib.parse.urlencode(params).encode(),
             'application/x-www-form-urlencoded')
    if 'error' in r:
        raise RuntimeError(f"VK {method}: {r['error'].get('error_msg', r['error'])}")
    return r['response']


def vk_already(post, token, gid):
    wall = vk('wall.get', token, owner_id=f'-{gid}', count=10)
    return any(post['url'] in (it.get('text') or '') for it in wall.get('items', []))


def vk_close_comments():
    """1 — комментарии под постом закрыты (по умолчанию); VK_KOMMENTARII=1 — открыты."""
    return 0 if os.environ.get('VK_KOMMENTARII', '').strip() == '1' else 1


def send_vk(post, token, gid):
    if vk_already(post, token, gid):
        return 'пост на этот день уже на стене — второй не ставлю'
    server = vk('photos.getWallUploadServer', token, group_id=gid)['upload_url']
    body, ctype = multipart({}, 'photo', post['image'])
    up = http(server, body, ctype)
    if not up.get('photo') or up['photo'] == '[]':
        raise RuntimeError(f'VK загрузка картинки: {up}')
    ph = vk('photos.saveWallPhoto', token, group_id=gid, photo=up['photo'], server=up['server'], hash=up['hash'])[0]
    r = vk('wall.post', token, owner_id=f'-{gid}', from_group=1, message=post['vk'],
           attachments=f"photo{ph['owner_id']}_{ph['id']}", close_comments=vk_close_comments())
    return f"пост {r['post_id']}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry-run', action='store_true', help='собрать пост и напечатать, ничего не отправлять')
    ap.add_argument('--date', help='ММ-ДД вместо сегодняшней даты (год — текущий)')
    ap.add_argument('--state', default='.kanaly', help='папка отметок «уже отправлено»')
    ap.add_argument('--json', action='store_true', help='напечатать пост JSON без проверки и отправки (пробы)')
    ap.add_argument('--bez-seti', action='store_true', help='в --dry-run не открывать ссылки')
    a = ap.parse_args()

    today = dt.datetime.now(MSK).date()
    date = dt.date(today.year, *map(int, a.date.split('-'))) if a.date else today
    if a.json:
        global LOG
        LOG = sys.stderr
        post, key = build(date)
        print(json.dumps(as_json(post) if post else None, ensure_ascii=False))
        return 0
    post, key = build(date)
    log(f'Каналы: день {key} ({date.isoformat()}), адрес сайта {site_base()}')
    if not post:
        log(f'Сегодня ({key}) нет музея с хуком, большой страницей и картинкой — пост не ставится.')
        return 0

    log(f"Главный: {post['main']['title']} · картинка {post['image'].relative_to(ROOT)} "
        f"({post['image'].stat().st_size // 1024} КБ)")
    log(f"Сегодня также: {', '.join(m['title'] for m in post['also']) or '—'}")
    log('\n--- Telegram (caption, HTML) ---\n' + post['tg'] + '\n--- VK (message) ---\n' + post['vk'] + '\n---')

    env = os.environ.get
    platforms = [n for n, keys in (('Telegram', ('TG_BOT_TOKEN', 'TG_CHANNEL')), ('VK', ('VK_TOKEN', 'VK_GROUP_ID')))
                 if all(env(k) for k in keys)]
    code, lines = check(post, offline=a.dry_run and a.bez_seti)
    if a.dry_run:
        (alarm if code else lambda ls: [log(s) for s in ls])(lines)
        log('Пробный запуск (--dry-run): ничего не отправлено.')
        return 1 if code else 0
    if not platforms:
        # Каналов ещё нет (М33): проверка — только в журнал, работа зелёная, отправлять некуда.
        for s in lines:
            log(s)
        log('Площадок нет (нет секретов TG_*/VK_*): ничего не отправлено, работа зелёная.')
        return 0
    if code:
        alarm(lines + [f'брак: пост {key} не отправлен ни на одну площадку; день-замена не подставляется'])
        return 1
    for s in lines:
        log(s)

    targets = [
        ('tg', 'Telegram', ('TG_BOT_TOKEN', 'TG_CHANNEL'), lambda: send_tg(post, env('TG_BOT_TOKEN'), env('TG_CHANNEL'))),
        ('vk', 'VK', ('VK_TOKEN', 'VK_GROUP_ID'),
         lambda: send_vk(post, env('VK_TOKEN'), env('VK_GROUP_ID').lstrip('-'))),
    ]
    failed = 0
    for code, name, secrets, send in targets:
        missing = [s for s in secrets if not env(s)]
        if missing:
            log(f"{name}: пропуск — нет секрета {', '.join(missing)} (площадка выключена).")
            continue
        mark = Path(a.state) / code / 'sent'
        if mark.is_file() and mark.read_text(encoding='utf-8').startswith(date.isoformat()):
            log(f'{name}: пропуск — сегодня уже отправлено ({mark.read_text(encoding="utf-8").strip()}).')
            continue
        try:
            res = send()
        except Exception as e:  # noqa: BLE001 — одна площадка упала, другая всё равно идёт
            log(f'{name}: ОШИБКА — {e}')
            failed += 1
            continue
        mark.parent.mkdir(parents=True, exist_ok=True)
        mark.write_text(f"{date.isoformat()} {post['main']['slug']} {res}\n", encoding='utf-8')
        log(f'{name}: отправлено — {res}.')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
