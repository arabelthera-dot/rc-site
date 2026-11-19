// Подсчёт «начал игру — доиграл» (Р286 п.3): PUBLIC_IGRY_SCHET='1' — сборка подключает assets/rc-igra-schet.js
// к страницам дней (full-pages.mjs; den-shablon идёт тем же конвейером). Пусто — ВЫКЛЮЧЕН: страницы те же байт в байт.
// Приём на сервере — nginx, deploy/schet-igr/README.md (Михаил). Откат — убрать переменную.
export const igrySchetOn = () => process.env.PUBLIC_IGRY_SCHET === '1';
export const igrySchetHtml = (base) => `<script defer src="${base}assets/rc-igra-schet.js"></script>`;
