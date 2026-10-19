# ADR 0001. Анкета большой страницы дня

Статус: принято (вариант А, Сергей 18.10.2026). Этап 1 — пилот izobreteniya 01-01 и 01-05.

## Контекст
Большая страница дня была цельным HTML `src/data/full-pages/<музей>/ММ-ДД.html`, вставляемым 1:1 интеграцией
`src/integrations/full-pages.mjs`. Мировой стандарт (Рейксмузеум, Смитсониан): содержимое — поля, вёрстка — один шаблон.

## Решение
1. Карточка дня `src/content/days/<музей>/ММ-ДД.json` получает два поля:
   - `doc` — оболочка документа: `prolog`, `head_attrs`, `head`, `between`, `body_attrs`, `epilog`;
   - `body` — блоки верхнего уровня `<body>` по порядку: `{type, id?, nav?, html?, lead?, engine?, src?, attrs?, config?, raw?}`.
2. Типы блоков (`BLOCK_TYPES` в `src/content.config.ts`, правила — `TYPES` в `src/lib/anketa.mjs`) выведены машиной:
   `node scripts/full-page-to-anketa.mjs --stats` по частоте блоков во всех больших страницах (кроме skazki/sport):
   shapka, kroshki, oblozhka (hero), navigaciya, dokument, video, audiogid, istoriya, istochniki, citata, more,
   podderzhat, interaktiv, kalendar, kuda-dalshe, podval, dvizhok, nastroyki, kod, stil, sluzhebnoe, razdel.
3. Интерактив = разметка блока `interaktiv` + блок `dvizhok` (`engine` — имя файла `public/assets/<engine>.js`)
   + блок `nastroyki` (`config` — JSON настроек движка). Нет файла движка — сборка красная.
4. Шаблон: `src/components/den/DenAnketa.astro` (оболочка) + `DenBlok.astro` (блок по типу).
5. **Правило переключения**: у дня есть `body` (и `doc`) — страницу собирает шаблон; нет — работает старый HTML.
   Обе ветки идут через один конвейер `full-pages.mjs`, поэтому полоса, шрифты, метрика, CLS, «текст не поверх
   картинки», имя музея проверяются одинаково. Старый HTML пилотного дня выкладывается на `den/ММ-ДД/staraya/`
   (noindex) — для сверки и отката.

## Как переносить остальное
1. `node scripts/full-page-to-anketa.mjs --check <музей> <ММ-ДД>` — сборка блоков совпадает с исходником байт в байт.
2. `node scripts/full-page-to-anketa.mjs <музей> <ММ-ДД> ...` — записать `doc`/`body` в карточку дня.
3. Сборка, скриншоты старой (`/staraya/`) и новой страницы на 390 и 1440 px, попиксельная разница (numpy);
   кликнуть интерактивы. Не совпало — чинить шаблон/конвертер, не страницу.
4. По 5–10 страниц на заявку. skazki и sport — только по согласованию с их помощниками.
5. После переноса всех дней музея HTML в `src/data/full-pages/<музей>/` удаляется отдельной заявкой.

## Следующие шаги
- Свой `<style>` страниц пока лежит в `doc.head` как есть; вынос в `public/assets/*.css` — отдельный шаг со сверкой.
- «Поддержать проект» в izobreteniya ставит движок `museum-support`, в анкете он — блок `dvizhok`.
- Этап 2: i18n Astro (`ru` без префикса, `en` — `/en/…`), переводы в `src/content/days-en/<музей>/ММ-ДД.json`.
