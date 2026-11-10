// Тексты ручных январских игр в файле переводов (п. 164; переводы — только машиной, Р603).
// Январские игры (01-01…01-31) — ручные: разметка src/data/igry/<muzey>/<imya>.html и скрипты
// public/muzei/<muzey>/igry/<imya>.js (+ <imya>-dop.js), см. src/lib/igry-mehaniki.ts. Сами файлы не меняются:
// отсюда берутся только места, где стоит русский текст, и на другом языке он подставляется на то же место.
// Текст — кусок с кириллицей: в html — между тегами и в aria-label / alt / title / placeholder; в js — внутри строк
// и шаблонов (`…`), разметка внутри строки режется по тегам. Механика (имена, числа, data-*, классы) кириллицы
// не содержит и не трогается. Ключ — <muzey>.<ММ-ДД>.igra.<html|js|dop>.<номер по порядку>; текст на кнопке
// (<button>) — с хвостом .knopka, для потолка длины (п. 162, src/lib/potolok-dliny.mjs).
// Файл — src/data/igry/stroki/<muzey>-<ММ-ДД>.json, устроен как у игр-данными (stroki-igr.mjs).
// Подстановка ru даёт те же байты, что исходник (проверка: node scripts/stroki-ruchnyh-igr.mjs --proverit).
import fs from 'node:fs';

const BUKVA = /[А-Яа-яЁё]/;
const ATRIBUTY = /^(aria-label|alt|title|placeholder)$/i;
const TEG = /<[^>]*>/g;

// Куски с кириллицей внутри [from, to) строки src, разрезанные по тегам; пробелы по краям в кусок не входят.
function kuski(src, from, to, extra = {}) {
  const out = [];
  const add = (a, b) => {
    const t = src.slice(a, b);
    if (!BUKVA.test(t)) return;
    const l = t.length - t.trimStart().length, r = t.length - t.trimEnd().length;
    out.push({ a: a + l, b: b - r, ...extra });
  };
  let pos = from;
  const body = src.slice(from, to);
  for (const m of body.matchAll(TEG)) { add(pos, from + m.index); pos = from + m.index + m[0].length; }
  add(pos, to);
  return out;
}

/** Места текста в разметке игры (или в куске [from, to) — разметка внутри строки js): [{ a, b, knopka }]. */
export function mestaHtml(src, from = 0, to = src.length, extra = {}) {
  const out = [];
  const html = src.slice(0, to);
  let knopka = 0;
  let pos = from;
  const TEGI = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
  TEGI.lastIndex = from;
  for (const m of html.matchAll(TEGI)) {
    out.push(...kuski(html, pos, m.index, { knopka: knopka > 0, ...extra }));
    const [, zakr, imya, atr] = m;
    for (const a of atr.matchAll(/([\w-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      if (!ATRIBUTY.test(a[1])) continue;
      const start = m.index + 1 + zakr.length + imya.length + a.index + a[0].indexOf(a[2]) + 1;
      out.push(...kuski(html, start, start + a[2].length - 2, { knopka: imya.toLowerCase() === 'button', ...extra }));
    }
    if (imya.toLowerCase() === 'button') knopka += zakr ? -1 : 1;
    pos = m.index + m[0].length;
  }
  out.push(...kuski(html, pos, to, { knopka: false, ...extra }));
  return out;
}

// Строки и шаблоны js: [{ a, b, kavychka }] — границы содержимого без кавычек. Комментарии и /регулярки/ пропускаются.
function strokiJs(js) {
  const out = [];
  let i = 0, prev = '';
  const n = js.length;
  const regexMozhno = () => !prev || /[(,=:[!&|?{};+\-*%<>~^]$/.test(prev) || /\b(return|typeof|case|do|else|in|of|void|yield|await)$/.test(prev);
  const stroka = (q) => {
    const a = ++i;
    while (i < n && js[i] !== q) i += js[i] === '\\' ? 2 : 1;
    out.push({ a, b: i, kavychka: q });
    i++;
  };
  const shablon = () => {
    let a = ++i;
    while (i < n && js[i] !== '`') {
      if (js[i] === '\\') { i += 2; continue; }
      if (js[i] === '$' && js[i + 1] === '{') {
        out.push({ a, b: i, kavychka: '`' });
        i += 2; kod(1); a = i; continue;
      }
      i++;
    }
    out.push({ a, b: i, kavychka: '`' });
    i++;
  };
  const kod = (glubina) => {
    while (i < n) {
      const c = js[i];
      if (c === '/' && js[i + 1] === '/') { while (i < n && js[i] !== '\n') i++; continue; }
      if (c === '/' && js[i + 1] === '*') { i = js.indexOf('*/', i + 2) + 2; if (i < 2) i = n; continue; }
      if (c === '"' || c === "'") { stroka(c); prev = 'x'; continue; }
      if (c === '`') { shablon(); prev = 'x'; continue; }
      if (c === '/' && regexMozhno()) {
        i++; let klass = false;
        while (i < n && (klass || js[i] !== '/')) { if (js[i] === '\\') i++; else if (js[i] === '[') klass = true; else if (js[i] === ']') klass = false; i++; }
        i++; while (/[a-z]/i.test(js[i] ?? '')) i++;
        prev = 'x'; continue;
      }
      if (c === '{' && glubina) glubina++;
      if (c === '}' && glubina && --glubina === 0) { i++; return; }
      if (!/\s/.test(c)) prev = /[\w$]/.test(c) ? (/[\w$]/.test(prev.slice(-1)) ? prev + c : c) : c;
      i++;
    }
  };
  kod(0);
  return out;
}

/** Места текста в скрипте игры: [{ a, b, kavychka }]. */
export const mestaJs = (js) => strokiJs(js).flatMap((s) => mestaHtml(js, s.a, s.b, { kavychka: s.kavychka }));

// Русский текст места — как в исходнике (экранирование js снимается, чтобы машина видела обычный текст).
const RAZ = { n: '\n', t: '\t', r: '\r', '\\': '\\', "'": "'", '"': '"', '`': '`', $: '$' };
const razekranirovat = (t) => t.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)/g, (_, e) =>
  e[0] === 'u' || e[0] === 'x' ? (e.length > 1 ? String.fromCodePoint(parseInt(e.replace(/[ux{}]/g, ''), 16)) : e) : (RAZ[e] ?? e));
const ekranirovat = (t, q) => t.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(new RegExp(q === '`' ? '`|\\$\\{' : q, 'g'), (m) => '\\' + m);
const ekranHtml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Части игры дня: [{ chast: 'html'|'js'|'dop', put, mesta }]. */
export function chastiIgry(muzey, igra) {
  if (!igra?.imya) return [];
  return [
    ['html', `src/data/igry/${muzey}/${igra.imya}.html`],
    ['js', `public/muzei/${muzey}/igry/${igra.imya}.js`],
    ['dop', igra.dop && `public/muzei/${muzey}/igry/${igra.imya}-dop.js`],
  ].filter(([, put]) => put && fs.existsSync(put)).map(([chast, put]) => {
    const tekst = fs.readFileSync(put, 'utf8');
    return { chast, put, tekst, mesta: chast === 'html' ? mestaHtml(tekst) : mestaJs(tekst) };
  });
}

const klyuch = (muzey, den, chast, nomer, m) => `${muzey}.${den}.igra.${chast}.${nomer}${m.knopka ? '.knopka' : ''}`;

/** Все тексты ручной игры: { ключ: русский текст }. */
export function vynutRuchnye(muzey, den, igra) {
  const out = {};
  for (const c of chastiIgry(muzey, igra))
    c.mesta.forEach((m, k) => {
      const t = c.tekst.slice(m.a, m.b);
      out[klyuch(muzey, den, c.chast, k, m)] = c.chast === 'html' ? t : razekranirovat(t);
    });
  return out;
}

/** Часть игры на языке code: { put: текст файла }. Нет перевода — остаётся русский, байт в байт. */
export function ruchnayaNaYazyke(muzey, den, igra, fayl, code) {
  const ru = fayl.ru ?? {}, yaz = fayl[code] ?? {};
  const out = {};
  for (const c of chastiIgry(muzey, igra)) {
    let t = c.tekst;
    c.mesta.map((m, k) => [m, klyuch(muzey, den, c.chast, k, m)]).reverse().forEach(([m, kl]) => {
      const v = yaz[kl];
      if (v == null || v === ru[kl]) return;
      t = t.slice(0, m.a) + (c.chast === 'html' ? ekranHtml(v) : ekranirovat(v, m.kavychka)) + t.slice(m.b);
    });
    out[c.put] = t;
  }
  return out;
}

export const faylRuchnoy = (muzey, den, igra) => ({
  _: `Тексты ручной игры ${muzey} ${den} (${igra.imya}) для перевода (п. 164). Ключи — src/data/igry/stroki-ruchnyh.mjs; html и js игры не меняются. Языки, кроме ru, пишет только машина перевода (Р603).`,
  ru: vynutRuchnye(muzey, den, igra),
});
