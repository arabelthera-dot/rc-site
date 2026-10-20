# Старый путь к календарю — архив (21.10.2026)

**Почему.** План ядра, шаг 4: у календаря один путь — `data/tablicy/<музей>/` → `node scripts/tablicy/razbor.mjs --zapis`
→ запись `src/content/days/<музей>/ММ-ДД.json` → сборка. Второго пути быть не должно.

**Что здесь.** `import-legacy.mjs` — перенос календарей из `calendar-*.js` старого сайта `rc-museum-preview` в карточки
(`npm run import`). С 17.10.2026 был заперт флагом `IMPORT_POSLE_PEREKLYUCHENIYA`, вызовов в сборке и проверках нет.
Перенесён сюда `git mv` 21.10.2026; из `npm run import` вызов снят (остались `redirects.mjs` и `full-pages.mjs`).
Старый репозиторий `arabelthera-dot/rc-museum-preview` на GitHub — в архиве (только чтение).

**Чем заменено.** `data/tablicy/` + `scripts/tablicy/razbor.mjs` (адаптеры — `scripts/tablicy/adaptery.json`);
разбор блоков «## День N» — `scripts/tablicy/bloki.mjs`.

**Как вернуть.** `git mv archive/kalendar-staryy-put-2110/import-legacy.mjs scripts/` и вернуть вызов в `package.json`
(«import»), либо `git revert` коммита переноса. Метка состояния до переноса — `arhiv-generatory-2110`.
Генераторы старого пути в AI_Projects — `russian-civilization/archive/kalendar-staryy-put-2110/README.md` там же.
