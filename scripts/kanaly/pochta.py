#!/usr/bin/env python3
"""Утреннее письмо «Сегодня в Русской цивилизации» (Р32, Сергей 20.10.2026; сервис и секрет — Михаил, М48).

Запуск — .github/workflows/pochta.yml, каждый день в 9:00 МСК, вместе с постом в каналы. Описание — docs/kanaly.md.
Текст дня — тот же, что у поста в каналы: build() и проверка (Е8) из scripts/kanaly/post.py, без копии правил.
Брак проверки — письмо не уходит, работа красная.

Сервис — Unisender (российский, API https://api.unisender.com/ru/api/): письмо createEmailMessage
в список подписчиков, рассылка createCampaign. Подписка — формой на сайте с двойным подтверждением
(стандарт сервиса: адрес попадает в список только после письма-подтверждения).

ВЫКЛЮЧЕНО, пока нет секрета: без MAIL_API_KEY — строка «спит: нет MAIL_API_KEY (М48)», выход 0.
Переменные: MAIL_API_KEY (секрет), MAIL_LIST_ID, MAIL_SENDER_EMAIL, MAIL_SENDER_NAME (переменные репозитория).

  python scripts/kanaly/pochta.py --dry-run [--date ММ-ДД] [--bez-seti]   собрать письмо и напечатать
  python scripts/kanaly/pochta.py --state .kanaly                          отправить на сегодня
"""
import argparse
import datetime as dt
import html
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import post as kanaly  # noqa: E402 — тот же день, та же проверка, что у каналов

API = 'https://api.unisender.com/ru/api/'
TEMA = 'Сегодня в Русской цивилизации'


def log(msg):
    print(msg, flush=True)


def pismo(p, date):
    """Тема и HTML письма из поста дня: «дата · title_ru», хук дословно, ссылка на день, «Сегодня также»."""
    e = html.escape
    main = p['main']
    when = f'{date.day} {kanaly.MONTHS[date.month - 1]}'
    tema = f"{TEMA} · {when}"
    znak = f" · {e(main['znak'])}" if int(main['znak'].rstrip('+')) >= 12 else ''
    also = ''.join(f'<li><a href="{e(u)}">{e(m["title"])}</a></li>' for m, u in zip(p['also'], [kanaly.utm(x, 'email', p['key']) for x in p['urls'][1:]]))
    body = (f'<h2>{e(when)}{znak} · {e(main["title"])}</h2>'
            f'<p>{e(main["hook"])}</p>'
            f'<p><a href="{e(kanaly.utm(p["url"], "email", p["key"]))}">Открыть день в музее</a></p>'
            + (f'<p>Сегодня также:</p><ul>{also}</ul>' if also else '')
            # Ссылка отписки — обязательная метка сервиса, он подставляет её сам.
            + '<p style="font-size:12px;color:#777">Вы подписались на сайте russian-civilization.ru. '
              '<a href="{{UnsubscribeUrl}}">Отписаться</a></p>')
    return tema, body


def api(method, key, **params):
    data = urllib.parse.urlencode({'format': 'json', 'api_key': key, **params}).encode()
    with urllib.request.urlopen(urllib.request.Request(API + method, data=data), timeout=60) as r:
        res = json.load(r)
    if res.get('error'):
        raise RuntimeError(f"{method}: {res.get('code', '')} {res['error']}")
    return res['result']


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry-run', action='store_true', help='собрать письмо и напечатать, ничего не отправлять')
    ap.add_argument('--date', help='ММ-ДД вместо сегодняшней даты (год — текущий)')
    ap.add_argument('--state', default='.kanaly', help='папка отметок «уже отправлено»')
    ap.add_argument('--bez-seti', action='store_true', help='в --dry-run не открывать ссылки')
    a = ap.parse_args()

    env = os.environ.get
    if not env('MAIL_API_KEY') and not a.dry_run:
        log('спит: нет MAIL_API_KEY (М48)')
        return 0

    today = dt.datetime.now(kanaly.MSK).date()
    date = dt.date(today.year, *map(int, a.date.split('-'))) if a.date else today
    p, key = kanaly.build(date)
    if not p:
        log(f'Сегодня ({key}) нет музея с хуком, большой страницей и картинкой — письма нет.')
        return 0
    tema, body = pismo(p, date)
    log(f'Почта: день {key}, тема «{tema}»\n--- письмо (HTML) ---\n{body}\n---')

    code, lines = kanaly.check(p, offline=a.dry_run and a.bez_seti)
    if code:
        kanaly.alarm(lines + [f'брак: письмо {key} не отправлено; день-замена не подставляется'])
        return 1
    for s in lines:
        log(s)
    if a.dry_run:
        log('Пробный запуск (--dry-run): ничего не отправлено.')
        return 0

    missing = [k for k in ('MAIL_LIST_ID', 'MAIL_SENDER_EMAIL') if not env(k)]
    if missing:
        log(f"спит: нет переменной {', '.join(missing)} (М48)")
        return 0
    mark = Path(a.state) / 'pochta' / 'sent'
    if mark.is_file() and mark.read_text(encoding='utf-8').startswith(date.isoformat()):
        log(f'Почта: пропуск — сегодня уже отправлено ({mark.read_text(encoding="utf-8").strip()}).')
        return 0
    msg = api('createEmailMessage', env('MAIL_API_KEY'), sender_name=env('MAIL_SENDER_NAME') or 'Русская цивилизация',
              sender_email=env('MAIL_SENDER_EMAIL'), subject=tema, body=body, list_id=env('MAIL_LIST_ID'), lang='ru')
    camp = api('createCampaign', env('MAIL_API_KEY'), message_id=msg['message_id'])
    mark.parent.mkdir(parents=True, exist_ok=True)
    mark.write_text(f"{date.isoformat()} {p['main']['slug']} campaign {camp.get('campaign_id')}\n", encoding='utf-8')
    log(f"Почта: отправлено — рассылка {camp.get('campaign_id')}, статус {camp.get('status')}.")
    return 0


if __name__ == '__main__':
    sys.exit(main())
