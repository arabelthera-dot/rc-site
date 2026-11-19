// Московская дата — одна функция на весь сайт (Р531, аудит 04.11 п.3 и п.34). Как в мире:
// Intl.DateTimeFormat с timeZone (MDN). Сборка (страницы, og, json) и браузер зовут одно и то же:
// в браузер функция уходит текстом MSK_V_BRAUZERE (компонент MskData.astro) и вызывается как window.rcMsk().
// Пояс одним именем — для форматов с часами и словами (доска, редакция); mskChasti держит его буквально,
// её текст уходит в браузер.
export const MSK_TZ = 'Europe/Moscow';
// mskChasti пишется без внешних имён и на ES5 — её текст исполняется во встроенных скриптах как есть.
export function mskChasti(d) {
  var p = {};
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(d || new Date()).forEach(function (x) { p[x.type] = x.value; });
  return { year: p.year, month: p.month, day: p.day };
}
// «ММ-ДД» — ключ дня (segodnya/<ММ-ДД>.json, MUSEUM_CALENDAR)
export const mskKlyuch = (d) => { const p = mskChasti(d); return `${p.month}-${p.day}`; };
// «ГГГГ-ММ-ДД»
export const mskIso = (d) => { const p = mskChasti(d); return `${p.year}-${p.month}-${p.day}`; };
export const mskGod = (d) => +mskChasti(d).year;
// Текст для встроенного скрипта: window.rcMsk(d?) → { year, month, day } по Москве
export const MSK_V_BRAUZERE = `window.rcMsk=window.rcMsk||${mskChasti.toString()};`;
