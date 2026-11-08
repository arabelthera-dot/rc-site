// Р649 п.15 шаг 2: проба цели таблицы на одном дне. Каждое значение dizayn/tablica.json → ближайшее из
// dizayn/proba/cel.json; выход — public/assets/rc-dizayn-proba.css: те же переменные, но под html[data-dizayn="proba"]
// (режим темы, как «modes» DTCG), так что меняется только страница с этим признаком, остальные дни — как были.
// Запуск: node dizayn/proba/proba.mjs (из корня rc-site). Наклоны (углы поворотов и градиентов) не переназначаются.
import fs from 'node:fs';
const T = JSON.parse(fs.readFileSync('dizayn/tablica.json', 'utf8'));
const C = JSON.parse(fs.readFileSync('dizayn/proba/cel.json', 'utf8'));
const MUZEY = 'izobreteniya';
const vals = (g) => Object.entries(g).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, v.$value]);

// размеры: px/rem → ближайший из 8 (поровну — больший); clamp(мин, vw, макс) → телефон мин, десктоп макс
const RAZ = vals(C.razmer).map(([k, v]) => [k, parseFloat(v)]);
const px = (s) => (/rem$/.test(s) ? parseFloat(s) * 16 : /px$/.test(s) ? parseFloat(s) : null);
const blizh = (n) => RAZ.reduce((b, x) => (Math.abs(x[1] - n) < Math.abs(b[1] - n) || (Math.abs(x[1] - n) === Math.abs(b[1] - n) && x[1] > b[1]) ? x : b))[0];
const raz = (v) => {
  const m = v.match(/^clamp\(([^,]+),[^,]+,([^)]+)\)$/);
  if (m && px(m[1].trim()) != null && px(m[2].trim()) != null) return [`var(--cel-razmer-${blizh(px(m[2].trim()))})`, `var(--cel-razmer-${blizh(px(m[1].trim()))})`];
  const n = px(v); return n ? [`var(--cel-razmer-${blizh(n)})`] : null; // 0, em, %, max() — относительные, остаются
};

// скругления: каждый угол отдельно
const ugol = (s) => { if (/%$/.test(s)) return 'krug'; const n = s === '0' ? 0 : px(s); if (n == null) return null; return n === 0 ? '0' : n <= 8 ? 'malo' : n <= 30 ? 'srednee' : 'krug'; };
const skr = (v) => { const u = v.replace(/\/.*/, '').trim().split(/\s+/).map(ugol); return u.includes(null) ? null : u.map((x) => (x === '0' ? '0' : `var(--cel-skruglenie-${x})`)).join(' '); };

// шрифты: с засечками → заголовок, моноширинные → цифры, остальное → текст
const shr = (v) => (/mono|menlo|consolas/i.test(v) ? 'cifry' : /georgia|serif(?!-)|playfair|lora|pt serif|old standard|times/i.test(v.replace(/sans-serif/g, '')) ? 'zagolovok' : 'tekst');

// цвета: ближайший по OKLab из 12 + 3 оттенков музея; прозрачность остаётся своя
const hex2 = (h) => { h = h.replace('#', ''); if (h.length <= 4) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(h.length === 8 ? [parseInt(h.slice(6), 16) / 255] : [1]); };
const rgba = (s) => { if (s.startsWith('#')) return hex2(s); const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p[3] ?? 1]; };
const lab = ([r, g, b]) => { const l = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; const [R, G, B] = [l(r), l(g), l(b)];
  const L = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B), M = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B), S = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S, 1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S, 0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S]; };
const PAL = [...vals(C.cvet).map(([k, v]) => [`cvet-${k}`, hex2(v)]), ...vals(C.muzei[MUZEY]).map(([k, v]) => [`muzey-${k}`, hex2(v)])].map(([k, c]) => [k, c, lab(c)]);
const cv = (v) => { const c = rgba(v); if (!c) return null; const L = lab(c); const [k, t] = PAL.reduce((b, x) => (Math.hypot(...x[2].map((q, i) => q - L[i])) < Math.hypot(...b[2].map((q, i) => q - L[i])) ? x : b));
  return c[3] >= 1 ? `var(--cel-${k})` : `rgba(${t.slice(0, 3).join(',')},${+c[3].toFixed(3)})`; };

const des = [], tel = [];
for (const [k, v] of Object.entries(C.shrift).filter(([k]) => !k.startsWith('$'))) des.push(`--cel-shrift-${k}: ${v.$value};`);
for (const [k, v] of vals(C.razmer)) des.push(`--cel-razmer-${k}: ${v};`);
for (const [k, v] of vals(C.skruglenie)) des.push(`--cel-skruglenie-${k}: ${v};`);
for (const [k, v] of vals(C.cvet)) des.push(`--cel-cvet-${k}: ${v};`);
for (const [k, v] of vals(C.muzei[MUZEY])) des.push(`--cel-muzey-${k}: ${v};`);
for (const [k, v] of vals(C.naklon)) des.push(`--cel-naklon-${k}: ${v};`);
const imya = (k) => k.replace(/\./g, '-');
for (const [k, v] of vals(T.shrift)) des.push(`--shrift-${imya(k)}: var(--cel-shrift-${shr(v)});`);
for (const [k, v] of vals(T.razmer)) { const r = raz(v); if (!r) continue; des.push(`--razmer-${imya(k)}: ${r[0]};`); if (r[1]) tel.push(`--razmer-${imya(k)}: ${r[1]};`); }
for (const [k, v] of vals(T.skruglenie)) { const r = skr(v); if (r) des.push(`--skruglenie-${imya(k)}: ${r};`); }
for (const [k, v] of vals(T.cvet)) { const r = cv(v); if (r) des.push(`--cvet-${imya(k)}: ${r};`); }
const S = 'html[data-dizayn="proba"]';

// правила страницы (слепок pravila.mjs), где значение записано числом, а не переменной: то же правило под признаком пробы
const PR = fs.existsSync('dizayn/proba/pravila-0113.json') ? JSON.parse(fs.readFileSync('dizayn/proba/pravila-0113.json', 'utf8')) : [];
const CV = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|\b(white|black)\b/gi;
const zn = (p, v) => {
  if (!v || /^(inherit|initial|unset|revert)$/.test(v)) return [null];
  if (p === 'font-family') return /var\(/.test(v) ? [null] : [`var(--cel-shrift-${shr(v)})`];
  if (p === 'font-size') { if (/var\(/.test(v)) return [null]; if (/^max\(/.test(v)) return [v.replace(/[\d.]+(px|rem)/g, (x) => `var(--cel-razmer-${blizh(px(x))})`)]; const r = raz(v.replace(/\s+/g, '')); return r || [null]; }
  if (/-radius$/.test(p)) { const f = v.match(/^var\((--[\w-]+),\s*([^)]+)\)$/); if (f) { const r = skr(f[2]); return [r && `var(${f[1]}, ${r})`]; } if (/var\(/.test(v)) return [null]; const r = skr(v); return [r]; }
  if (p === 'background-image' && /\d+deg/.test(v)) { const NK = vals(C.naklon).map(([k, x]) => [k, parseFloat(x)]); v = v.replace(/(-?[\d.]+)deg/g, (_, n) => `var(--cel-naklon-${NK.reduce((b, x) => (Math.abs(x[1] - n) < Math.abs(b[1] - n) ? x : b))[0]})`); CV.lastIndex = 0; if (!CV.test(v)) return [v]; }
  if (/color$|shadow$|^background-image$|^fill$|^stroke$/.test(p) && CV.test(v)) { CV.lastIndex = 0; return [v.replace(CV, (c) => cv(/^white$/i.test(c) ? '#fff' : /^black$/i.test(c) ? '#000' : c) || c)]; }
  return [null];
};
const pref = (sel) => sel.split(/,(?![^(]*\))/).map((x) => x.trim()).map((x) => (/^(html|:root)\b/.test(x) ? x.replace(/^(html|:root)/, S) : `${S} ${x}`)).join(', ');
const bloki = new Map(); const dob = (m, t) => { if (!bloki.has(m)) bloki.set(m, []); bloki.get(m).push(t); };
for (const r of PR) {
  const d = [], dt = [];
  for (const [p, [v, imp]] of Object.entries(r.d)) { CV.lastIndex = 0; const [a, t] = zn(p, v); if (!a || a === v) continue; const i = imp ? ' !important' : ''; d.push(`${p}: ${a}${i}`); if (t) dt.push(`${p}: ${t}${i}`); }
  const m = r.media.join(' and ');
  if (d.length) dob(m, `${pref(r.sel)} { ${d.join('; ')} }`);
  if (dt.length) dob(m ? `${m} and (max-width: 680px)` : '(max-width: 680px)', `${pref(r.sel)} { ${dt.join('; ')} }`);
}
// единственный размер в атрибуте style макета (примечание к видео, 13px)
dob('', `${S} #video p[style*="font-size:13px"] { font-size: var(--cel-razmer-s) !important }`);
// скругление, записанное сокращённо через var() с запасным числом (в слепке его не видно): .igra-pravila var(--radius,14px)
dob('', `${S} .igra-pravila { border-radius: var(--radius, var(--cel-skruglenie-srednee)) }`);
// кнопки и поля без своего шрифта берут его у страницы, а не у браузера (Arial 13.33px)
dob('', `:where(${S}) :where(button, input, select, textarea) { font-family: inherit; font-size: var(--cel-razmer-s) }`);
const pravila = [...bloki].map(([m, l]) => (m ? `@media ${m} {\n  ${l.join('\n  ')}\n}` : l.join('\n'))).join('\n\n');
const out = `/**\n * Создано dizayn/proba/proba.mjs из dizayn/tablica.json и dizayn/proba/cel.json — руками не править\n * Проба цели таблицы (Р649 п.15 шаг 2): действует только на странице с <html data-dizayn="proba">\n */\n\n${S} {\n  ${des.join('\n  ')}\n}\n\n@media (max-width: 680px) {\n  ${S} {\n    ${tel.join('\n    ')}\n  }\n}\n\n/* правила страницы с числами вместо переменных (слепок dizayn/proba/pravila-0113.json) */\n${pravila}\n`;
fs.writeFileSync('public/assets/rc-dizayn-proba.css', out);
console.log(`rc-dizayn-proba.css: ${des.length} переменных, ${tel.length} для телефона, ${PR.length} правил страницы просмотрено`);
