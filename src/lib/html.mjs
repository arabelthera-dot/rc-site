// Один разборщик HTML для сторожей и сборки (Р531, аудит 04.11 п.10). Как в мире: HTML читают разборщиком
// по стандарту WHATWG (parse5 — тот же, что у jsdom и cheerio), а не регулярками: регулярка не видит
// вложенность, комментарии, атрибуты в другом порядке и кавычках, сущности.
// Узлы — деревья parse5 (nodeName, attrs, childNodes); здесь только обход, атрибут и текст.
import { parse, parseFragment, serialize, serializeOuter } from 'parse5';

// Документ целиком (<html>, <head>, <body> достраиваются, как в браузере)
export const razobrat = (html) => parse(html);
// Кусок разметки без достраивания (шаблон, фрагмент карточки)
export const razobratKusok = (html) => parseFragment(html);

// Все элементы под узлом в порядке документа; usl — имя тега ('h1') или функция (el) => bool.
// Внутрь <template> тоже заходит: его содержимое у parse5 лежит в content.
export function vse(uzel, usl) {
  const est = typeof usl === 'string' ? (el) => el.nodeName === usl : usl || (() => true);
  const out = [];
  const obhod = (n) => {
    for (const c of n.childNodes || []) {
      if (c.tagName) { if (est(c)) out.push(c); obhod(c.content || c); }
    }
  };
  obhod(uzel.content || uzel);
  return out;
}
export const pervyj = (uzel, usl) => vse(uzel, usl)[0];

// Значение атрибута или undefined (имена у parse5 уже в нижнем регистре)
export const atr = (el, imya) => el?.attrs.find((a) => a.name === imya)?.value;
// Есть ли у элемента класс (по словам, как classList.contains)
export const klass = (el, imya) => (atr(el, 'class') || '').split(/\s+/).includes(imya);

// Текст элемента: куски текста через пробел, пробелы схлопнуты — так же, как прежнее
// «теги заменить пробелом» у сторожей; сущности уже раскрыты разборщиком.
export function tekst(el) {
  if (!el) return undefined;
  const kuski = [];
  const obhod = (n) => {
    for (const c of (n.content || n).childNodes || []) {
      if (c.nodeName === '#text') kuski.push(c.value);
      else if (c.childNodes || c.content) obhod(c);
    }
  };
  obhod(el);
  return kuski.join(' ').replace(/\s+/g, ' ').trim();
}

// Внутренняя разметка элемента строкой
export const vnutri = (el) => (el ? serialize(el.content || el) : undefined);
// Элемент вместе со своим тегом строкой (как outerHTML)
export const celikom = (el) => (el ? serializeOuter(el) : undefined);
