// Версия для слабовидящих (Д7 плана сайта, 19.10): одна кнопка «глаз» на всех страницах — шаблоны (Base.astro)
// и полные страницы дней (src/integrations/full-pages.mjs). По нажатию — класс rc-slabovid на <html>:
// крупный шрифт, чёрное на белом, без фоновых картинок, подчёркнутые ссылки, видимый фокус
// (по сути ГОСТ Р 52872-2019 и требований к сайтам госорганов). Вид — public/assets/rc-slabovid.css.
// Состояние — localStorage 'rc-slabovid'; применяется в <head> до отрисовки (headScript), без мигания.
export const SLABOVID_KEY = 'rc-slabovid';

// Режим включён — rc-slabovid.css пишется в <head> обычной (блокирующей) ссылкой: первая отрисовка уже в режиме.
export const slabovidHeadJs = (base = '/') =>
  `try{if(localStorage.getItem('${SLABOVID_KEY}')==='1'){document.documentElement.classList.add('rc-slabovid');`
  + `document.write('<link rel="stylesheet" href="${base}assets/rc-slabovid.css">')}}catch(e){}`;

// Скорость (Б10, 20.10): режим — 21 КБ, все правила под html.rc-slabovid; обычному посетителю он не нужен до нажатия
// кнопки — файл грузится без блокировки отрисовки (media=print → all, web.dev «Defer non-critical CSS»).
// Вид кнопки (1 КБ) — внутрь <head>: Base.astro — <InlineCss file="rc-slabovid-knopka.css">, полные страницы — knopkaCss.
export const slabovidCssHtml = (base = '/') =>
  `<link rel="stylesheet" href="${base}assets/rc-slabovid.css" media="print" onload="this.media='all'">`
  + `<noscript><link rel="stylesheet" href="${base}assets/rc-slabovid.css"></noscript>`;

const EYE = '<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';

const CLICK = `var h=document.documentElement,on=h.classList.toggle('rc-slabovid');`
  + `this.setAttribute('aria-pressed',on);try{localStorage.setItem('${SLABOVID_KEY}',on?'1':'0')}catch(e){}`;

// aria-pressed правится скриптом сразу за кнопкой — состояние уже известно из <head>.
export const slabovidButtonHtml = () =>
  `<button type="button" id="rc-slabovid-btn" aria-pressed="false" title="Версия для слабовидящих" onclick="${CLICK}">`
  + `${EYE}<span class="rc-sv-txt">Версия для слабовидящих</span></button>`
  + `<script>document.getElementById('rc-slabovid-btn').setAttribute('aria-pressed',document.documentElement.classList.contains('rc-slabovid'))</script>`;
