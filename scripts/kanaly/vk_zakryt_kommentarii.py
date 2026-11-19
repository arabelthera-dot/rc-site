#!/usr/bin/env python3
"""Разовый: закрыть комментарии у уже опубликованных постов сообщества VK (20.10.2026).

Модерации нет — комментарии под постами закрыты; правила комментариев сайта — /pravila-kommentariev/.
Новые посты закрывает сам scripts/kanaly/post.py (close_comments=1). Этот скрипт — для постов, вышедших раньше.

По умолчанию — проба (dry-run): читает стену (wall.get) и печатает, какие посты закрыл бы. Действие
(wall.closeComments owner_id, post_id) — только с --primenit.

Секреты — переменные окружения VK_TOKEN, VK_GROUP_ID (как у post.py); токен не печатается.

  python scripts/kanaly/vk_zakryt_kommentarii.py                 проба: список постов с открытыми комментариями
  python scripts/kanaly/vk_zakryt_kommentarii.py --primenit      закрыть
"""
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from post import vk  # noqa: E402

STEP = 100  # wall.get отдаёт не больше 100 за раз


def wall_posts(token, owner, limit):
    offset = 0
    while True:
        r = vk('wall.get', token, owner_id=owner, count=STEP, offset=offset)
        items = r.get('items', [])
        for it in items:
            yield it
        offset += len(items)
        if not items or offset >= r.get('count', 0) or (limit and offset >= limit):
            return


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--primenit', action='store_true', help='закрыть комментарии (без флага — только проба)')
    ap.add_argument('--limit', type=int, default=0, help='смотреть не больше N последних постов (0 — все)')
    a = ap.parse_args()

    token, gid = os.environ.get('VK_TOKEN'), (os.environ.get('VK_GROUP_ID') or '').lstrip('-')
    if not token or not gid:
        print('Нет VK_TOKEN/VK_GROUP_ID в окружении — нечего делать.')
        return 0
    owner = f'-{gid}'
    rezhim = 'ПРИМЕНЯЮ' if a.primenit else 'ПРОБА (dry-run), ничего не меняю'
    print(f'Сообщество {owner}: {rezhim}')

    otkryty = zakryty = oshibki = 0
    for it in wall_posts(token, owner, a.limit):
        c = it.get('comments') or {}
        # can_open=1 — уже закрыты; can_close=1 или can_post=1 — открыты
        if c.get('can_open') or (not c.get('can_close') and not c.get('can_post')):
            zakryty += 1
            continue
        otkryty += 1
        pid = it['id']
        tekst = (it.get('text') or '').split('\n', 1)[0][:70]
        if not a.primenit:
            print(f'  закрыл бы пост {pid}: {tekst}')
            continue
        try:
            vk('wall.closeComments', token, owner_id=owner, post_id=pid)
            print(f'  закрыт пост {pid}: {tekst}')
        except RuntimeError as e:
            oshibki += 1
            print(f'  ОШИБКА пост {pid}: {e}')
    print(f'Итого: с открытыми комментариями {otkryty}, уже закрыто {zakryty}, ошибок {oshibki}.')
    return 1 if oshibki else 0


if __name__ == '__main__':
    sys.exit(main())
