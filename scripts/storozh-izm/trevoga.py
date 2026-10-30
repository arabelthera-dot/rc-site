#!/usr/bin/env python3
"""Тревога сторожа изменений: trevogi.json → issue с меткой storozh-izm (+ Telegram, если есть секрет).

Одна открытая карточка на вид тревоги: та же находка — молчим (ключ <!-- kluch:… --> уже в карточке),
новая — комментарий. Telegram — только вместе с новой карточкой или комментарием; секретов
TG_BOT_TOKEN / TG_STOROZH_CHAT нет — «спит», работа зелёная. PROBA=true — ничего не создаёт,
шлёт пробное сообщение в Telegram (если есть секрет).
"""
import hashlib
import json
import os
import subprocess
import urllib.parse
import urllib.request

METKA = 'storozh-izm'
ZAPUSK = f"{os.environ.get('GITHUB_SERVER_URL', '')}/{os.environ.get('GITHUB_REPOSITORY', '')}/actions/runs/{os.environ.get('GITHUB_RUN_ID', '')}"


def gh(*a):
    return subprocess.run(['gh', *a], capture_output=True, text=True, check=True).stdout


def telegram(tekst):
    tok, chat = os.environ.get('TG_BOT_TOKEN'), os.environ.get('TG_STOROZH_CHAT')
    if not tok or not chat:
        print(f'спит: нет секрета (TG_BOT_TOKEN / TG_STOROZH_CHAT) — не отправлено: {tekst.splitlines()[0]}')
        return
    dannye = urllib.parse.urlencode({'chat_id': chat, 'text': tekst[:3900], 'disable_web_page_preview': 'true'}).encode()
    try:
        with urllib.request.urlopen(f'https://api.telegram.org/bot{tok}/sendMessage', dannye, timeout=20) as r:
            print(f'отправлено в Telegram ({r.status})')
    except Exception as e:  # noqa: BLE001 — ключ в тексте ошибки не печатаем
        print(f'::warning::Telegram не принял сообщение ({type(e).__name__})')


def telo(t, kluch):
    # Шесть разделов — чтобы проверка kartochka.yml (пять вопросов) не краснила карточку тревоги.
    return f"""Тревога сторожа изменений (storozh-izm.yml, Р309). Запуск: {ZAPUSK}

### Готово значит
Причина найдена: изменение законное (эталон в `scripts/storozh-izm/` поправлен заявкой) или инцидент разобран по `docs/security/incident-response.md` в AI_Projects.

### Что нашёл сторож
{t['tekst']}

### Что задевает
Публичный сайт https://russian-civilization.ru — домен, сертификат или страницы.

### Что нужно
Михаил (сервер msk-new, DNS reg.ru) — подтвердить, его ли это изменение.

### Что будет без нужного
Подмена может висеть незамеченной; тревога повторится только при новой находке.

### Проверка до слияния
Ручной запуск storozh-izm (Actions → storozh-izm → Run workflow) зелёный и без этой тревоги.

### Как откатить
Ложная тревога — поправить эталон и закрыть карточку; сторож мешает — переменная STOROZH_IZM ≠ '1'.

<!-- kluch:{kluch} -->
"""


def main():
    if os.environ.get('PROBA') == 'true':
        telegram(f'🟡 ПРОБА сторожа изменений: тревог не создаю, это проверка связи. Запуск: {ZAPUSK}')
        return
    with open(os.environ.get('TREVOGI', 'trevogi.json'), encoding='utf-8') as f:
        trevogi = json.load(f)
    if not trevogi:
        print('тревог нет')
        return
    gh('label', 'create', METKA, '--color', 'B60205', '--description', 'Тревога сторожа изменений (Р309)', '--force')
    otkrytye = json.loads(gh('issue', 'list', '--label', METKA, '--state', 'open', '--limit', '100',
                             '--json', 'number,title,body,comments'))
    for t in trevogi:
        zagolovok = f"Сторож изменений: {t['zagolovok']}"
        kluch = hashlib.sha256(t['tekst'].encode()).hexdigest()[:16]
        est = next((i for i in otkrytye if i['title'] == zagolovok), None)
        if est:
            vse = est['body'] + ''.join(c['body'] for c in est['comments'])
            if f'kluch:{kluch}' in vse:
                print(f'«{zagolovok}» — та же находка уже в #{est["number"]}, молчу')
                continue
            gh('issue', 'comment', str(est['number']), '--body',
               f"Новая находка ({ZAPUSK}):\n\n{t['tekst']}\n\n<!-- kluch:{kluch} -->")
            adres = f"{os.environ.get('GITHUB_SERVER_URL', '')}/{os.environ.get('GITHUB_REPOSITORY', '')}/issues/{est['number']}"
        else:
            adres = gh('issue', 'create', '--title', zagolovok, '--label', METKA, '--body', telo(t, kluch)).strip()
        print(f'тревога: {adres}')
        telegram(f"🔴 {zagolovok}\n{t['tekst'][:3000]}\n{adres}")


if __name__ == '__main__':
    main()
