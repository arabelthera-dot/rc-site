# Подсчёт «начал игру — доиграл» (Р286 п.3) — карточка Михаилу

**Что.** На msk-new (nginx сайта russian-civilization.ru):
1. `nginx-schet-igr.conf` рядом: `log_format rc_igry` и `map $rc_igry_bot` — в `http { }`; два `location` (`= /s/igra` и `/schet/`) — в `server { }` сайта на 443. Затем `nginx -t && nginx -s reload`.
2. `mkdir -p /srv/rc-site/schet` (вне `/srv/rc-site/www`: выкладка rsync `--delete` её не сотрёт); `svod.py` → `/srv/rc-site/svod-igr.py`.
3. Крон раз в час: `17 * * * * www-data /usr/bin/python3 /srv/rc-site/svod-igr.py` (пользователь — тот, кто читает `/var/log/nginx` и пишет в `/srv/rc-site/schet`).
4. logrotate для `/var/log/nginx/rc-igry.log`: `weekly`, `rotate 60`, `compress` (журнал маленький: ~100 байт на событие).

**Зачем.** Р286 п.3 Сергея: видеть по каждой игре дня, сколько начали и сколько доиграли (выиграли/проиграли). Без имён, без cookie, данные на нашем сервере в России; иностранные счётчики нельзя. Яндекс Метрика (113664375) этого не даёт: грузится только после «Принять» и хранит данные у Яндекса.
В журнале — только время, признак «бот» (по User-Agent, сам User-Agent не пишется) и строка `m=музей&d=ММ-ДД&g=игра&e=событие`. Адреса посетителя в этом журнале нет.

**Как проверить.**
- `curl -s -o /dev/null -w '%{http_code}\n' 'https://russian-civilization.ru/s/igra?m=test&d=01-01&g=test&e=nachal'` → `204`; `tail -1 /var/log/nginx/rc-igry.log` — строка без IP.
- `python3 /srv/rc-site/svod-igr.py` → `https://russian-civilization.ru/schet/igry.json` отдаёт 200 и строку `test 01-01`.
- Джарвис: `node scripts/igry-otchet.mjs` в rc-site печатает таблицу «день, начали, доиграли, доля».
- Включение на сайте — после этого: переменная репозитория `PUBLIC_IGRY_SCHET=1` (GitHub → Settings → Variables), строка `PUBLIC_IGRY_SCHET: ${{ vars.PUBLIC_IGRY_SCHET }}` в env сборки deploy.yml (заявка Джарвиса), следующая сборка.

**Откат.** Сайт: убрать переменную `PUBLIC_IGRY_SCHET` → следующая сборка без модуля. Сервер: убрать два `location`, `log_format`/`map` и строку крона, `nginx -t && nginx -s reload`; `rm -r /srv/rc-site/schet /var/log/nginx/rc-igry.log*`.
