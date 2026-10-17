// Единая верхняя полоса навигации (Сергей 17.10): «Русская цивилизация» › полное название музея › где ты.
// Одна разметка на всех внутренних страницах: шаблоны (src/components/SiteBar.astro) и полные страницы дней
// (src/integrations/full-pages.mjs вставляет её при сборке). Вид — public/assets/rc-sitebar.css,
// прячется/появляется — public/assets/rc-sitebar.js. Проверку в сборке делает full-pages.mjs (checkSitebars).
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const whenOfKey = (key) => `${parseInt(key.slice(3), 10)} ${MONTHS[parseInt(key.slice(0, 2), 10) - 1]}`;

// here — «где ты» (дата, «Календарь»); нет here — страница музея: второй уровень без ссылки.
export function sitebarHtml({ base, slug, title, here }) {
  const t = esc(title);
  const museum = here
    ? `<a class="rc-sb-link rc-sb-museum" href="${base}muzei/${slug}/" title="${t}">${t}</a>`
    : `<span class="rc-sb-link rc-sb-museum" aria-current="page" title="${t}">${t}</span>`;
  return `<nav class="rc-sitebar" aria-label="Где вы на сайте"><ol>`
    + `<li><a class="rc-sb-link rc-sb-home" href="${base}">Русская цивилизация</a></li>`
    + `<li class="rc-sb-m">${museum}</li>`
    + (here ? `<li class="rc-sb-here" aria-current="page"><span class="rc-sb-link">${esc(here)}</span></li>` : '')
    + `</ol></nav>`;
}

export const TG_CHANNEL = 'https://t.me/russian_civilization_ru';

// Подписка на канал — одна разметка: подвал всех шаблонных страниц (Base.astro) и полные страницы дней (rc-sitebar.js).
export const podpiskaHtml = () =>
  `<div class="rc-sub"><a href="${TG_CHANNEL}" target="_blank" rel="noopener"><span aria-hidden="true">✈</span>Подписаться в Telegram</a></div>`;

export const sitebarAssets = (base) =>
  `<link rel="stylesheet" href="${base}assets/rc-sitebar.css" />\n<link rel="stylesheet" href="${base}assets/rc-podpiska.css" />\n<script defer src="${base}assets/rc-sitebar.js"></script>`;
