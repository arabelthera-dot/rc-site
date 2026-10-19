// Языки сайта — каркас (план сайта, Г18–Г21, «да» Сергея 19.10.2026). Данные — src/data/yazyki.json.
// Русский — без приставки адреса, прочие — /<code>/… . Язык с ready:false нигде не виден: ни пометок hreflang,
// ни флага в переключателе — чтобы не было ссылок на несуществующие страницы.
import data from '../data/yazyki.json' with { type: 'json' };

export const yazyki = data.yazyki;
export const poUmolchaniyu = data.poUmolchaniyu;
export const gotovye = yazyki.filter((y) => y.ready);
const kody = new Set(yazyki.filter((y) => y.code !== poUmolchaniyu).map((y) => y.code));

const sBase = (base) => (base.endsWith('/') ? base : base + '/');

/** Язык и «русский» путь страницы: /en/muzei/x/ → { code: 'en', rest: 'muzei/x/' } (пути без base). */
export function razobratPut(pathname, base = '/') {
  const b = sBase(base);
  const rest = pathname.startsWith(b) ? pathname.slice(b.length) : pathname.replace(/^\//, '');
  const first = rest.split('/')[0];
  if (kody.has(first)) return { code: first, rest: rest.slice(first.length).replace(/^\//, '') };
  return { code: poUmolchaniyu, rest };
}

/** Адрес той же страницы на языке code (русский — без приставки). */
export function putNaYazyke(rest, code, base = '/') {
  const b = sBase(base);
  return code === poUmolchaniyu ? b + rest : `${b}${code}/${rest}`;
}

export function yazyk(code) {
  return yazyki.find((y) => y.code === code) ?? yazyki.find((y) => y.code === poUmolchaniyu);
}

/** Пометки hreflang: только готовые языки + x-default (русский). */
export function hreflangi(pathname, base, site) {
  const { rest } = razobratPut(pathname, base);
  const links = gotovye.map((y) => ({ hreflang: y.code, href: new URL(putNaYazyke(rest, y.code, base), site).href }));
  links.push({ hreflang: 'x-default', href: new URL(putNaYazyke(rest, poUmolchaniyu, base), site).href });
  return links;
}
