// Языки сайта — каркас (план сайта, Г18–Г21, «да» Сергея 19.10.2026). Данные — src/data/yazyki.json.
// Русский — без приставки адреса, прочие — /<code>/… . Язык с ready:false нигде не виден: ни пометок hreflang,
// ни флага в переключателе — чтобы не было ссылок на несуществующие страницы.
import fs from 'node:fs';
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

// Перевод дня (пп. 149, 150 очереди 2): у страницы дня язык есть, когда он готов (ready:true) и в файле строк дня
// src/data/perevod/<музей>-<ММ-ДД>.json (scripts/perevod-dnya.mjs) есть его раздел; прочие страницы — по ready:true.
// Пока ни один язык, кроме русского, не готов — пусто: пометок и связей перевода нет, русский вывод прежний.
const DEN_RE = /^muzei\/([^/]+)\/den\/(\d\d-\d\d)\/$/;
const perevody = new Map();
function perevodDnya(museum, key) {
  const id = `${museum}-${key}`;
  if (!perevody.has(id)) {
    const f = `src/data/perevod/${id}.json`;
    perevody.set(id, fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {});
  }
  return perevody.get(id);
}

/** Языки перевода страницы (кроме русского) по её «русскому» пути rest (muzei/x/den/01-02/). */
export function yazykiStranicy(rest) {
  const drugie = gotovye.filter((y) => y.code !== poUmolchaniyu);
  if (!drugie.length) return [];
  const den = DEN_RE.exec(rest);
  if (!den) return drugie;
  const fayl = perevodDnya(den[1], den[2]);
  return drugie.filter((y) => Object.keys(fayl[y.code] ?? {}).length);
}

/** Пометки hreflang: русский, языки перевода страницы и x-default (русский). Код языка — BCP 47 (yazyki.json). */
export function hreflangi(pathname, base, site, est = () => true) {
  const { rest } = razobratPut(pathname, base);
  const ru = yazyk(poUmolchaniyu);
  const links = [ru, ...yazykiStranicy(rest).filter((y) => est(putNaYazyke(rest, y.code, base)))]
    .map((y) => ({ hreflang: y.code, href: new URL(putNaYazyke(rest, y.code, base), site).href }));
  links.push({ hreflang: 'x-default', href: new URL(putNaYazyke(rest, poUmolchaniyu, base), site).href });
  return links;
}

/** Связь перевода с оригиналом для JSON-LD (schema.org translationOfWork / workTranslation): у перевода — ссылка
 *  на русскую страницу, у русской — на её переводы. Перевода нет — пустой объект, разметка прежняя. */
export function svyazPerevoda(pathname, base, site, type) {
  const { code, rest } = razobratPut(pathname, base);
  const langs = yazykiStranicy(rest);
  if (!langs.length) return {};
  const work = (c) => ({ '@type': type, url: new URL(putNaYazyke(rest, c, base), site).href, inLanguage: c });
  return code === poUmolchaniyu ? { workTranslation: langs.map((y) => work(y.code)) } : { translationOfWork: work(poUmolchaniyu) };
}

/** og:locale языка: поле locale из yazyki.json, иначе code_COUNTRY (ru → ru_RU). */
export const ogLocale = (y) => y.locale ?? `${y.code}_${y.country}`;

// Строки общего шаблона по языку (src/data/stroki.json); нет строки — русская (язык по умолчанию).
import stroki from '../data/stroki.json' with { type: 'json' };
export function stroka(code, key) {
  return stroki[code]?.[key] ?? stroki[poUmolchaniyu][key];
}

/** Стрелка «вперёд» по ходу строки: в письме справа налево смотрит влево. */
export const strelkaVpered = (dir) => (dir === 'rtl' ? '←' : '→');

/** Стрелка «назад» по ходу строки: в письме справа налево смотрит вправо. */
export const strelkaNazad = (dir) => (dir === 'rtl' ? '→' : '←');

/** Форма слова при числе n по правилам языка (Intl.PluralRules): формы — объект категорий
 *  { one, few, many, other, … } строки key словаря; нет категории — other. «21 день», «3 дня», «5 дней». */
export function chislo(code, n, key) {
  const formy = stroka(code, key);
  const kat = new Intl.PluralRules(code).select(n);
  return formy[kat] ?? formy.other;
}

/** CSS-строки кавычек всех языков (п.163): :lang(fr){quotes:"« " " »" "“" "”"} … — одно правило из поля kavychki. */
export const kavychkiCss = () =>
  yazyki.filter((y) => y.kavychki).map((y) => `:lang(${y.code}){quotes:${y.kavychki.map((k) => JSON.stringify(k)).join(' ')}}`).join('');

/** Добавка в <head> страницы не на русском (п.148, п.163): свой шрифт письма (поле shrift) и кавычки по языку.
 *  Русской странице — пусто: её вид и разметка не меняются. */
export function golovaYazyka(y, base = '/') {
  if (y.code === poUmolchaniyu) return '';
  const shrift = y.shrift ? `<link rel="stylesheet" href="${sBase(base)}assets/fonts/noto/${y.shrift}.css" data-rc-shrift>` : '';
  return `${shrift}<style data-rc-kavychki>${kavychkiCss()}</style>`;
}
