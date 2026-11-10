# Поиск за рубежом и открываемость из других стран (п.500 и п.499 плана, Р745, 10.11.2026)

## Что сделано машиной
- `max-image-preview:large` — на каждой открытой странице сборки (`src/integrations/robots-preview.mjs`, после minify):
  без него Google Discover и картинки поиска показывают кадр миниатюрой. Образец — https://developers.google.com/search/docs/appearance/google-discover
  и https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-image-preview . noindex и переадресации не трогаются.
- Карточки пересылки: Satori на сайте нет; карточки рисует sharp — `src/integrations/og-den.mjs` (1200×630 у дня),
  `src/pages/og/segodnya-[key].jpg.ts` (1200×630). Размер ловит `scripts/og-razmer.mjs`: день — ровно 1200×630, прочие — от 600×315.
- Открываемость из Китая, Индии, Ирана, Турции, ЕС, США — `scripts/globalping.mjs` + `.github/workflows/globalping.yml`
  (раз в сутки, 04:41 UTC; API https://globalping.io/docs/api.globalping.io без ключа). Не открылось — карточка «Сайт не открылся из других стран».
  Первый замер 10.11.2026: главная и /muzei/izobreteniya/den/01-01/ — 200 из всех шести (Гуанчжоу 1,6 с, Мумбаи 1,1 с, Тегеран 1,0 с).

## Карта сайта и RSS по языкам
- Карта по языкам уже есть: `src/integrations/karta-volnami.mjs` пишет `sitemap-<код>.xml` и пометки hreflang, язык включается `ready:true` в `src/data/yazyki.json`.
  Сейчас готов только русский — других карт нет, и регистрировать в Baidu/Naver/Seznam пока нечего, кроме русской карты.
- RSS — одна русская лента `/rss.xml` и ленты музеев. Ленту на язык делать вместе с первым готовым переводом (сейчас переводов нет).

## Регистрация (НЕ делалась) — что нужно
- Baidu — https://ziyuan.baidu.com/login/ : аккаунт Baidu ID (вход по паролю или SMS; китайский номер официально не подтверждён — проверить при входе),
  подтверждение сайта файлом или мета-тегом (CNAME приостановлен), затем карта сайта. Справка: https://ziyuan.baidu.com/college/articleinfo?id=1485 . Смысл — после китайского перевода.
- Naver — https://searchadvisor.naver.com/ : аккаунт Naver (по справке — телефон для подтверждения), подтверждение файлом или мета-тегом, отправка карты и RSS. Страница автоматически не открылась — шаги не сверены.
- Seznam — https://reporter.seznam.cz/wm , справка https://o-seznam.cz/napoveda/vyhledavani/seznam-webmaster/ : аккаунт Seznam, подтверждение мета-тегом или файлом;
  карту Seznam берёт из robots.txt, понимает IndexNow (`scripts/indexnow.mjs` у нас уже есть). Ограничений для иностранцев не найдено.

## п.499 — Google Arts & Culture и Europeana (заявки НЕ подавались)
- Google Arts & Culture — участие бесплатно (FAQ https://support.google.com/culturalinstitute/partners/answer/6002688?hl=en );
  берут «non-profit institutions, museums, galleries, archives», по приглашению после запроса в форме https://services.google.com/fb/forms/cisignup/ .
  Права на материалы — на партнёре: только свободные от прав или с урегулированными правами. Юрлицо явно не требуется, решает Google.
- Europeana — поставщик данных входит только через агрегатор и подписывает Data Exchange Agreement (https://pro.europeana.eu/page/the-data-exchange-agreement ,
  https://pro.europeana.eu/page/how-to-contribute-data ); все метаданные — CC0, у каждого объекта — стандартная пометка прав
  (https://pro.europeana.eu/page/europeana-licensing-framework ). Плата для поставщика официально не подтверждена; российского аккредитованного агрегатора нет — путь для проекта из России практически закрыт.
