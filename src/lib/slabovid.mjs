// Версия для слабовидящих (Д7 плана сайта, 19.10): одна кнопка «глаз» на всех страницах — шаблоны (Base.astro)
// и полные страницы дней (src/integrations/full-pages.mjs). По нажатию — класс rc-slabovid на <html>:
// крупный шрифт, чёрное на белом, без фоновых картинок, подчёркнутые ссылки, видимый фокус
// (по сути ГОСТ Р 52872-2019 и требований к сайтам госорганов). Вид — public/assets/rc-slabovid.css.
// Состояние — sessionStorage 'rc-slabovid' (до закрытия вкладки; Сергей 28.10, Р317: случайное нажатие не должно
// залипать белым навсегда); старая запись localStorage стирается. Применяется в <head> до отрисовки, без мигания.
export const SLABOVID_KEY = 'rc-slabovid';

// Адрес с ?slabovid=0 / ?slabovid=1 выключает/включает режим на эту вкладку.
// Режим включён — rc-slabovid.css пишется в <head> обычной (блокирующей) ссылкой: первая отрисовка уже в режиме.
export const slabovidHeadJs = (base = '/') =>
  `try{var h=document.documentElement,q=/[?&]slabovid=([01])/.exec(location.search);`
  + `localStorage.removeItem('${SLABOVID_KEY}');if(q)sessionStorage.setItem('${SLABOVID_KEY}',q[1]);`
  + `var z=localStorage.getItem('rc-sv-size'),c=localStorage.getItem('rc-sv-color');`
  + `if(z)h.setAttribute('data-rc-sv-size',z);if(c)h.setAttribute('data-rc-sv-color',c);`
  + `if(sessionStorage.getItem('${SLABOVID_KEY}')==='1'){h.classList.add('rc-slabovid');`
  + `document.write('<link rel="stylesheet" href="${base}assets/rc-slabovid.css">')}}catch(e){}`;

// Скорость (Б10, 20.10): режим — 21 КБ, все правила под html.rc-slabovid; обычному посетителю он не нужен до нажатия
// кнопки — файл грузится без блокировки отрисовки (media=print → all, web.dev «Defer non-critical CSS»).
// Вид кнопки (1 КБ) — внутрь <head>: Base.astro — <InlineCss file="rc-slabovid-knopka.css">, полные страницы — knopkaCss.
export const slabovidCssHtml = (base = '/') =>
  `<link rel="stylesheet" href="${base}assets/rc-slabovid.css" media="print" onload="this.media='all'">`
  + `<noscript><link rel="stylesheet" href="${base}assets/rc-slabovid.css"></noscript>`;

const EYE = '<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';

const CLICK = `var h=document.documentElement,on=h.classList.toggle('rc-slabovid');`
  + `this.setAttribute('aria-pressed',on);try{sessionStorage.setItem('${SLABOVID_KEY}',on?'1':'0')}catch(e){}`;

// aria-pressed правится скриптом сразу за кнопкой — состояние уже известно из <head>.
export const slabovidButtonHtml = () =>
  `<button type="button" id="rc-slabovid-btn" aria-pressed="false" title="Версия для слабовидящих" onclick="${CLICK}">`
  + `${EYE}<span class="rc-sv-txt">Версия для слабовидящих</span></button>`
  + `<script>document.getElementById('rc-slabovid-btn').setAttribute('aria-pressed',document.documentElement.classList.contains('rc-slabovid'))</script>`
  + slabovidPanelHtml();

// Б11 (опись Р84, 21.10): панель выбора размера букв (А / А+ / А++) и цвета (ГОСТ Р 52872) — видна только в режиме,
// выбор запоминается (localStorage rc-sv-size / rc-sv-color) и применяется в <head> до отрисовки (slabovidHeadJs).
const pick = (attr, key, val) => `var h=document.documentElement;h.setAttribute('${attr}','${val}');`
  + `try{localStorage.setItem('${key}','${val}')}catch(e){}`
  + `var b=this.parentNode.querySelectorAll('[data-a=${attr}]');for(var i=0;i<b.length;i++)b[i].setAttribute('aria-pressed',b[i]===this)`;
const btn = (attr, key, val, label, title) =>
  `<button type="button" data-a="${attr}" data-v="${val}" aria-pressed="false" title="${title}" onclick="${pick(attr, key, val)}">${label}</button>`;
export const slabovidPanelHtml = () =>
  '<div id="rc-sv-panel" role="group" aria-label="Настройки версии для слабовидящих">'
  + '<span>Размер:</span>'
  + btn('data-rc-sv-size', 'rc-sv-size', '1', 'А', 'Крупный шрифт')
  + btn('data-rc-sv-size', 'rc-sv-size', '2', 'А+', 'Очень крупный шрифт')
  + btn('data-rc-sv-size', 'rc-sv-size', '3', 'А++', 'Самый крупный шрифт')
  + '<span>Цвет:</span>'
  + btn('data-rc-sv-color', 'rc-sv-color', 'w', 'Ч/Б', 'Чёрное на белом')
  + btn('data-rc-sv-color', 'rc-sv-color', 'b', 'Б/Ч', 'Белое на чёрном')
  + btn('data-rc-sv-color', 'rc-sv-color', 'g', 'Синий', 'Тёмно-синее на голубом')
  + '</div>'
  + `<script>(function(){var h=document.documentElement,z=h.getAttribute('data-rc-sv-size')||'1',c=h.getAttribute('data-rc-sv-color')||'w',`
  + `b=document.querySelectorAll('#rc-sv-panel button');for(var i=0;i<b.length;i++){var v=b[i].getAttribute('data-v');`
  + `b[i].setAttribute('aria-pressed',b[i].getAttribute('data-a')==='data-rc-sv-size'?v===z:v===c)}})()</script>`;
