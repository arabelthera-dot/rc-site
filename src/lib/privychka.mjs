// Ежедневная привычка возвращаться (Р289 п.1, 27.10.2026): «Завтра в музеях», «Поделиться итогом игры»,
// «Ты с нами N дней подряд». Вёрстка блока «Завтра» — здесь (чистый node: полные страницы full-pages.mjs, шаблон дня,
// узел /segodnya/<ММ-ДД>/); кнопка итога и серия — public/assets/rc-privychka.js; вид — public/assets/rc-privychka.css.
// ВЫКЛЮЧЕН: VKLYUCHENO = false — страницы те же байт в байт. Включение — заявкой VKLYUCHENO = true после снимков
// 390/1440 на трёх днях; проба у себя — PUBLIC_PRIVYCHKA=1 npm run build. Откат — VKLYUCHENO = false.
import { gotovyeDni, kogda } from './etot-den.mjs';

const VKLYUCHENO = false;
export const privychkaOn = () => VKLYUCHENO || process.env.PUBLIC_PRIVYCHKA === '1';
export const privychkaJs = (base) => `<script defer src="${base}assets/rc-privychka.js"></script>`;

const DIM = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const pad = (n) => (n < 10 ? '0' : '') + n;
const plusOne = (k) => {
  let m = +k.slice(0, 2), d = +k.slice(3) + 1;
  if (d > DIM[m - 1]) { d = 1; m = m === 12 ? 1 : m + 1; }
  return `${pad(m)}-${pad(d)}`;
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Следующая дата после key, где готов хотя бы один день (до недели вперёд). Нет такой — блока «Завтра» нет:
// выдуманный анонс — брак (museum-return.js, правило 06.09). Ссылок на завтрашние дни нет — «откроется завтра».
export function zavtra(key) {
  let k = key;
  for (let i = 1; i <= 7; i++) {
    k = plusOne(k);
    const dni = gotovyeDni().get(k);
    if (dni?.length) return { key: k, zavtra: i === 1, dni };
  }
  return undefined;
}

// Блок в конце дня и на узле даты. Строка серии (rc-pv-seriya) пустая и скрыта: её заполняет rc-privychka.js
// из localStorage посетителя; без JS блок — только анонс завтрашнего дня.
export function blokZavtra(base, key) {
  const z = zavtra(key);
  const seriya = '<p class="rc-pv-seriya" hidden></p>';
  if (!z) return `<section class="rc-privychka rc-pv-tolko-seriya" data-rc-den="${key}" hidden>${seriya}</section>`;
  const kogdaTxt = z.zavtra ? `Откроется завтра, ${kogda(z.key)}` : `Следующий день откроется ${kogda(z.key)}`;
  const li = z.dni.map((d) => `<li class="rc-pv-item"><span class="rc-pv-muzey">${esc(d.museumTitle)}</span>`
    + (d.hook ? `<span class="rc-pv-hook">${esc(d.hook)}</span>` : `<span class="rc-pv-hook">${esc(d.title)}</span>`) + '</li>').join('');
  return `<section class="rc-privychka" data-rc-den="${key}" aria-labelledby="rc-pv-h">`
    + `<h2 class="rc-pv-h" id="rc-pv-h">${z.zavtra ? 'Завтра в музеях' : 'Дальше в музеях'}</h2>`
    + `<p class="rc-pv-kogda">${kogdaTxt}</p><ul class="rc-pv-list">${li}</ul>${seriya}</section>`;
}
