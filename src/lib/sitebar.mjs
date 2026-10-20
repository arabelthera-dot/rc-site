// Единая верхняя полоса навигации (Сергей 17.10): «Русская цивилизация» › полное название музея › где ты.
// Одна разметка на всех внутренних страницах: шаблоны (src/components/SiteBar.astro) и полные страницы дней
// (src/integrations/full-pages.mjs вставляет её при сборке). Вид — public/assets/rc-sitebar.css,
// прячется/появляется — public/assets/rc-sitebar.js. Проверку в сборке делает full-pages.mjs (checkSitebars).
import { stroka, poUmolchaniyu } from './yazyki.mjs';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Дата «17 октября» по языку: месяцы в родительном падеже — из словаря (Г20, src/data/stroki.json).
export const whenOfKey = (key, code = poUmolchaniyu) => `${parseInt(key.slice(3), 10)} ${stroka(code, 'mesyacyR')[parseInt(key.slice(0, 2), 10) - 1]}`;

// Ссылка «Поиск» — только при RC_POISK=1 (выключатель поиска, src/integrations/poisk.mjs); иначе пусто.
const poiskLink = (base) => (globalThis.process?.env?.RC_POISK === '1'
  ? `<li class="rc-sb-poisk"><a class="rc-sb-link" href="${base}poisk/">Поиск</a></li>` : '');

// here — «где ты» (дата, «Календарь»); нет here — страница музея: второй уровень без ссылки.
// vozrast — готовый знак 436-ФЗ (src/lib/vozrast.mjs znakHtml), последним пунктом справа.
export function sitebarHtml({ base, slug, title, here, vozrast = '' }) {
  const t = esc(title);
  const museum = here
    ? `<a class="rc-sb-link rc-sb-museum" href="${base}muzei/${slug}/" title="${t}">${t}</a>`
    : `<span class="rc-sb-link rc-sb-museum" aria-current="page" title="${t}">${t}</span>`;
  return `<nav class="rc-sitebar" aria-label="Где вы на сайте"><ol>`
    + `<li><a class="rc-sb-link rc-sb-home" href="${base}">Русская цивилизация</a></li>`
    + `<li class="rc-sb-m">${museum}</li>`
    + (here ? `<li class="rc-sb-here" aria-current="page"><span class="rc-sb-link">${esc(here)}</span></li>` : '')
    + `${poiskLink(base)}${vozrast ? `<li class="rc-sb-vozrast">${vozrast}</li>` : ''}</ol></nav>`;
}

export const TG_CHANNEL = 'https://t.me/russian_civilization_ru';

// Подписка на канал — одна разметка: подвал всех шаблонных страниц (Base.astro) и полные страницы дней (rc-sitebar.js).
// label — подпись кнопки на языке страницы (Base.astro, src/data/stroki.json); по умолчанию русская.
export const podpiskaHtml = (label = 'Подписаться в Telegram') =>
  `<div class="rc-sub"><a href="${TG_CHANNEL}" target="_blank" rel="noopener"><span aria-hidden="true">✈</span>${esc(label)}</a></div>`;

export const sitebarAssets = (base) =>
  `<link rel="stylesheet" href="${base}assets/rc-sitebar.css" />\n<link rel="stylesheet" href="${base}assets/rc-podpiska.css" />\n<script defer src="${base}assets/rc-sitebar.js"></script>`;
