# Реестр роликов — файл на выпуск (Р524)

- Выпуск `<музей>/<id>` — свой файл `public/video/registry/<музей>/<id>.json` (только запись выпуска: `horizontal`, `vertical`, `poster`…).
- Общие поля (`version`, `hosting`) — `public/video/registry/_obshchee.json`.
- Общий `public/video/registry.json` в git не хранится (`.gitignore`): его собирает `node scripts/reestr-rolikov.mjs` в начале `npm run build` и `npm run dev`. Движок `public/assets/museum-video.js` грузит его по прежнему адресу `video/registry.json`.
- Поле `video` дня в `src/content.config.ts` — ключ выпуска `<музей>/<id>`, то есть имя файла в `public/video/registry/` (схема ядра заморожена, комментарий в ней не правится).
- Новый ролик — новый файл выпуска (писатели: `zapisatVypusk` из `scripts/reestr-rolikov.mjs`). Заявки дней не правят один общий файл и не сталкиваются.
- Перенести строки старого общего реестра (например, из ветки дня) — `node scripts/reestr-rolikov.mjs --razrezat <файл.json>`.
- Проверка — `node scripts/reestr-rolikov.mjs --proba`; битый файл, ключ не по пути или выпуск без `horizontal` останавливают сборку.
