# Ролик и аудиогид из облака — на сайт заявкой (r538, Р524/Р525/Р529)

- Облако rc-rolik публикует собранное как выпуск GitHub (Releases): `render.yml` с `format=oba` — `vypusk-<день>-<прогон>` (16:9, 9:16, обложки, `vypusk.json`), если в `days/<день>.json` есть поле `sajt: {muzei, reestr, imya}`; `audiogid.yml` — `vypusk-ag-<музей>-<день>-<прогон>` (mp3 и `vypusk.json`), если у дня есть `muzei` и `audioguide.audioSrc`.
- `.github/workflows/rolik-na-sait.yml` в rc-site каждые полчаса (и по ручному пуску) берёт новые выпуски: `node scripts/rolik-na-sait.mjs spisok`.
- На каждый выпуск — ветка `avto/rolik-<тег>`, `node scripts/rolik-na-sait.mjs primenit <тег>`: файлы в `public/muzei/<музей>/video/day-<imya>…` (или `public/muzei/<музей>/<audioSrc>`), запись выпуска через `zapisatVypusk` (`public/video/registry/<реестр>/<imya>.json`, версия `v` растёт — кэш зрителя сбрасывается), заявка с автослиянием.
- Страница дня не меняется: её ключ `video` уже указывает на выпуск.
- Повтор не открывается: ролик — по «прогон N)» в записи реестра, гид — по одинаковому mp3 в main; заявка на тег уже была (даже закрытая) — тег пропускается.
- Перезалить выпуск: `gh workflow run rolik-na-sait.yml -f teg=vypusk-…`.
- Выключить расписание: переменная репозитория `ROLIK_NA_SAIT=0`. Откат — удалить workflow.
- Ключей нет: выпуски rc-rolik открытые, пишет свой `GITHUB_TOKEN` (ждущие проверки заявки бота одобряет сам, как `glazami-hrapovik`).
