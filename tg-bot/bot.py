"""Бот подписки «Русской цивилизации» (@RussianCivilizationBot), М29, «да» Сергея 17.10.2026.

Каждое утро (RC_TG_HOUR, по Москве):
  1) в канал RC_TG_CHANNEL — один пост «Сегодня в Русской цивилизации» по всем музеям;
  2) каждому подписчику — дни только выбранных им музеев.
Данные — с живого сайта: <RC_SITE_URL>/segodnya/<ММ-ДД>.json и /segodnya/muzei.json.
Подписки — SQLite в RC_TG_DB (том /data). Выключить всё — RC_TG_OFF=1 или остановить контейнер.
"""
import html
import json
import logging
import os
import sqlite3
import threading
from contextlib import contextmanager
import urllib.request
from datetime import datetime, time
from urllib.parse import urljoin
from zoneinfo import ZoneInfo

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, LinkPreviewOptions, Update
from telegram.constants import ParseMode
from telegram.error import Forbidden
from telegram.ext import AIORateLimiter, Application, CallbackQueryHandler, CommandHandler, ContextTypes

MSK = ZoneInfo("Europe/Moscow")
TOKEN = os.environ.get("RC_TG_BOT_TOKEN", "")
CHANNEL = os.environ.get("RC_TG_CHANNEL", "@russian_civilization_ru")
SITE = os.environ.get("RC_SITE_URL", "https://arabelthera-dot.github.io/rc-site").rstrip("/") + "/"
HOUR = int(os.environ.get("RC_TG_HOUR", "7"))
POST_CHANNEL = os.environ.get("RC_TG_POST_CHANNEL", "1") == "1"
DB = os.environ.get("RC_TG_DB", "/data/subs.sqlite")
LIMIT = 4096

log = logging.getLogger("rc-tg-bot")


# ---------- данные сайта ----------

def fetch(path: str) -> dict:
    req = urllib.request.Request(urljoin(SITE, path), headers={"User-Agent": "rc-tg-bot"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def today_key(now: datetime | None = None) -> str:
    return (now or datetime.now(MSK)).strftime("%m-%d")


def day(key: str) -> dict | None:
    """Карточки даты. Сайт при пустой дате отдаёт ближайшую следующую — такую не шлём."""
    d = fetch(f"segodnya/{key}.json")
    return d if d.get("shown") == key and d.get("cards") else None


def museums() -> list[dict]:
    return fetch("segodnya/muzei.json")["museums"]


def absolute(href: str) -> str:
    return urljoin(SITE, href)


# ---------- текст ----------

def render(d: dict, cards: list[dict], title: str) -> tuple[str, str | None]:
    """HTML-текст поста и картинка-превью (первая карточка с картинкой). Текст не на картинке:
    картинка — превью ссылки над текстом, подписи и хуки — текстом."""
    head = f"<b>{html.escape(d['when'].capitalize())} — {html.escape(title)}</b>"
    parts, size = [head], len(head)
    for c in cards:
        hook = f"\n{html.escape(c['hook'])}" if c.get("hook") else ""
        block = (f"\n\n<i>{html.escape(c['museumTitle'])}</i>\n"
                 f"<a href=\"{html.escape(absolute(c['href']))}\">{html.escape(c['title'])}</a>{hook}")
        if size + len(block) > LIMIT - 200:
            break
        parts.append(block)
        size += len(block)
    tail = f"\n\n<a href=\"{html.escape(SITE)}\">Все музеи</a>"
    img = next((absolute(c["img"]) for c in cards if c.get("img")), None)
    return "".join(parts) + tail, img


async def send(bot, chat, text: str, img: str | None):
    preview = (LinkPreviewOptions(url=img, show_above_text=True, prefer_large_media=True)
               if img else LinkPreviewOptions(is_disabled=True))
    await bot.send_message(chat, text, parse_mode=ParseMode.HTML, link_preview_options=preview)


# ---------- подписки ----------

def db() -> sqlite3.Connection:
    con = sqlite3.connect(DB)
    con.execute("CREATE TABLE IF NOT EXISTS subs (chat INTEGER, museum TEXT, PRIMARY KEY (chat, museum))")
    con.execute("CREATE TABLE IF NOT EXISTS sent (what TEXT PRIMARY KEY, key TEXT)")
    return con


@contextmanager
def conn():
    """Соединение с подписками: коммит и закрытие на выходе."""
    con = db()
    try:
        with con:
            yield con
    finally:
        con.close()


def chosen(con, chat: int) -> set[str]:
    return {r[0] for r in con.execute("SELECT museum FROM subs WHERE chat=?", (chat,))}


def toggle(con, chat: int, slug: str):
    if slug in chosen(con, chat):
        con.execute("DELETE FROM subs WHERE chat=? AND museum=?", (chat, slug))
    else:
        con.execute("INSERT INTO subs VALUES (?, ?)", (chat, slug))
    con.commit()


def keyboard(con, chat: int) -> InlineKeyboardMarkup:
    mine = chosen(con, chat)
    rows = [[InlineKeyboardButton(("✅ " if m["slug"] in mine else "▫️ ") + m["title"], callback_data=f"m:{m['slug']}")]
            for m in museums()]
    rows.append([InlineKeyboardButton("Готово", callback_data="done")])
    return InlineKeyboardMarkup(rows)


HELLO = ("Это «Русская цивилизация» — виртуальный город музеев России.\n\n"
         "Отметь музеи, и каждое утро я пришлю их день: что случилось в этот день и почему это важно. "
         "Все музеи сразу — в канале {ch}.\n\nПоменять выбор — /muzei, отписаться от всего — /stop.")


async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    with conn() as con:
        await update.message.reply_text(HELLO.format(ch=CHANNEL), reply_markup=keyboard(con, update.effective_chat.id))


async def muzei(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    with conn() as con:
        await update.message.reply_text("Твои музеи:", reply_markup=keyboard(con, update.effective_chat.id))


async def stop(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    with conn() as con:
        con.execute("DELETE FROM subs WHERE chat=?", (update.effective_chat.id,))
    await update.message.reply_text("Подписка снята. Вернуться — /start.")


async def button(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    chat = q.message.chat.id
    with conn() as con:
        if q.data == "done":
            n = len(chosen(con, chat))
            await q.answer()
            await q.edit_message_text(f"Готово: музеев в подписке — {n}. Первый день придёт утром в {HOUR:02d}:00 по Москве."
                                      if n else "Ни одного музея не выбрано. Выбрать — /muzei.")
            return
        toggle(con, chat, q.data[2:])
        await q.answer()
        await q.edit_message_reply_markup(keyboard(con, chat))


# ---------- утренняя рассылка ----------

async def morning(ctx: ContextTypes.DEFAULT_TYPE):
    key = today_key()
    d = day(key)
    if not d:
        log.info("%s: карточек нет, рассылки нет", key)
        return
    with conn() as con:
        await _morning(ctx, key, d, con)


async def _morning(ctx, key: str, d: dict, con: sqlite3.Connection):
    done = dict(con.execute("SELECT what, key FROM sent"))
    if POST_CHANNEL and done.get("channel") != key:
        text, img = render(d, d["cards"], "Сегодня в Русской цивилизации")
        await send(ctx.bot, CHANNEL, text, img)
        con.execute("INSERT OR REPLACE INTO sent VALUES ('channel', ?)", (key,))
        con.commit()
        log.info("%s: пост в канал", key)
    if done.get("subs") != key:
        by_chat: dict[int, set[str]] = {}
        for chat, slug in con.execute("SELECT chat, museum FROM subs"):
            by_chat.setdefault(chat, set()).add(slug)
        ok = 0
        for chat, slugs in by_chat.items():
            cards = [c for c in d["cards"] if c["museum"] in slugs]
            if not cards:
                continue
            text, img = render(d, cards, "сегодня в твоих музеях")
            try:
                await send(ctx.bot, chat, text, img)
                ok += 1
            except Forbidden:  # человек заблокировал бота — подписку снимаем
                con.execute("DELETE FROM subs WHERE chat=?", (chat,))
        con.execute("INSERT OR REPLACE INTO sent VALUES ('subs', ?)", (key,))
        con.commit()
        log.info("%s: подписчикам %d", key, ok)


def main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    logging.getLogger("httpx").setLevel(logging.WARNING)
    if os.environ.get("RC_TG_OFF") == "1" or not TOKEN:
        # Спим, а не выходим: при restart: unless-stopped выход = цикл перезапусков (Михаил, #1932).
        log.warning("бот выключен (RC_TG_OFF=1 или нет RC_TG_BOT_TOKEN), сплю")
        threading.Event().wait()
    db().close()
    app = Application.builder().token(TOKEN).rate_limiter(AIORateLimiter()).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("muzei", muzei))
    app.add_handler(CommandHandler("stop", stop))
    app.add_handler(CallbackQueryHandler(button))
    app.job_queue.run_daily(morning, time(HOUR, 0, tzinfo=MSK))
    # Перезапуск после часа рассылки, но до полудня — догоняем утро (повторно не шлёт: таблица sent).
    now = datetime.now(MSK)
    if HOUR <= now.hour < 12:
        app.job_queue.run_once(morning, 10)
    app.run_polling()


if __name__ == "__main__":
    main()
