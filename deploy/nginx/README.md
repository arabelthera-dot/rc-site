# 301 для старых адресов (nginx, сервер msk-new)

Карта `rc-redirects.map` строится из `src/data/redirects.json`: `node scripts/nginx-redirects.mjs` (`--check` — сверка). Заглушки meta refresh в сборке остаются запасным путём.
Файл не входит в выкладку rsync (она пишет только в `/srv/rc-site/www`) — кладётся на сервер руками: `curl -so /srv/rc-site/rc-redirects.map https://raw.githubusercontent.com/arabelthera-dot/rc-site/main/deploy/nginx/rc-redirects.map`.

Подключение — две строки и `nginx -t && nginx -s reload`:
- в `http { }`: `map $uri $rc_redirect { include /srv/rc-site/rc-redirects.map; }` (если `nginx -t` попросит — там же `map_hash_bucket_size 128;`);
- в `server { }` сайта: `if ($rc_redirect) { return 301 $rc_redirect; }`.

Проверка: `curl -sI https://russian-civilization.ru/calendar.html` → `301` и `Location: https://russian-civilization.ru/muzei/izobreteniya/calendar/`.
Откат: убрать эти две строки, `nginx -t && nginx -s reload` — снова работают заглушки meta refresh.
