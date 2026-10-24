# media-dnya — замок аудиогида и ролика дня (Р232)

Сергей 24.10.2026: «аудиогид обязателен, ролик обязателен». Шаг `media-dnya` в `.github/workflows/proverka.yml`.

## Что проверяет

Каждую страницу дня, изменённую в заявке (`src/data/full-pages/<музей>/ММ-ДД.html` или карточку
`src/content/days/<музей>/ММ-ДД.json`, если у дня есть полная страница), — по исходнику, без сборки и браузера.
Пути считаются как у браузера: страница стоит с `<base href="/muzei/<музей>/">`, файлы — в `public/`.

| что | когда зелёный | строгость |
|---|---|---|
| аудиогид | есть блок (`section#audioguide`, `window.MUSEUM_AUDIOGUIDE` или `<audio data-guide-audio>`), mp3 из `audioSrc` / `data-src` есть, не пустой, звучит ≥ 30 с | **строго** — красный роняет заявку |
| ролик | есть `<video>` вне игры; mp4 есть и не пустой (`data-rc-video` — файл `local` из `public/video/registry.json`, иначе `src` / `<source>`) | отчёт — жёлтая строка (`::warning::`) |

Не считаются: звук фильма (`data-film-audio`), звук и видео внутри игры, секция `#video` с надписью «Видео создаётся» без `<video>` (заглушка).
Длительность mp3 — из самого файла (Xing/Info/VBRI или размер/битрейт), mp4 — из коробки `mvhd`; сверено с ffprobe на всех 141 файле `public/` 24.10.2026, расхождений 0.

## Переключатель ролика

`MEDIA_ROLIK_STROGO=1` — ролик тоже строгий (красный роняет заявку). В CI — переменная репозитория:

```
gh variable set MEDIA_ROLIK_STROGO --body 1 -R arabelthera-dot/rc-site   # включить
gh variable delete MEDIA_ROLIK_STROGO -R arabelthera-dot/rc-site         # снова отчёт
```

Включает Джарвис после прогона роликов по новому шаблону (Р233). Выключателя аудиогида нет.

## Запуск

```
node scripts/media-dnya.mjs --proba          # заведомые страницы: хорошая проходит, каждый брак ловится
node scripts/media-dnya.mjs                  # изменённые дни против origin/main (--baza другая)
node scripts/media-dnya.mjs --vse            # таблица по всем полным страницам, без падения (замер)
MEDIA_ROLIK_STROGO=1 node scripts/media-dnya.mjs
```

## Откат

Удалить шаг `media-dnya` из `.github/workflows/proverka.yml` (скрипт можно оставить — сам он ничего не трогает).
