# rc-site — новый сайт «Русской цивилизации» (Astro)

План переезда — вариант 2, «да» Сергея 15.10.2026 (`~/workspace/knowledge/plan-varianta-2-1510.md`).
Превью: https://arabelthera-dot.github.io/rc-site/ · карта стандарта: https://arabelthera-dot.github.io/rc-site/karta/

- `src/data/museums.json` — каталог музеев (копия `platform/catalog/museums.json`).
- `src/content/days/<музей>/<ММ-ДД>.json` — карточка дня; схема — `src/content.config.ts`.
- `src/pages/` — шаблоны: главная, музей, календарь, день, карта.
- `public/assets/` — движки старого сайта как есть.
- `npm run import` — перенос данных из старого превью-репо.
