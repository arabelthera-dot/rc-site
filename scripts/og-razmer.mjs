// Размер картинки пересылки (Б9, 20.10.2026): Telegram и ВК картинку меньше 600×315 показывают крошечной
// миниатюрой или не показывают совсем. Считает страницы dist, у которых og:image (файл своего сайта)
// меньше 600×315, и страницы, где og:image:width/height не совпадают с настоящим размером файла.
// Страница дня (/muzei/<музей>/den/ММ-ДД/) без og:image или без twitter:card summary_large_image — тоже ошибка
// (задача E, 20.10.2026: у каждой страницы дня рабочая карточка пересылки); превью дня — ровно 1200×630 с размерами (Б15, 21.10).
// Переадресации и noindex не считаются. Выход 1, если есть хоть одна такая страница.
// Запуск: node scripts/og-razmer.mjs [dist]   (npm run og-razmer)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIST = process.argv[2] || 'dist';
const MIN_W = 600, MIN_H = 315;
const meta = (h, n) => /content=["']([^"']*)["']/i.exec(
  new RegExp(`<meta\\b[^>]*\\b(?:property|name)=["']${n}["'][^>]*>`, 'i').exec(h)?.[0] ?? '')?.[1];
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) files.push(p);
} })(DIST);
const size = new Map();
async function dims(file) {
  if (!size.has(file)) size.set(file, fs.existsSync(file) ? sharp(file).metadata().then((m) => [m.width, m.height], () => null) : Promise.resolve(null));
  return size.get(file);
}
let total = 0, foreign = 0; const small = [], wrong = [], missing = [], noOg = [];
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  if (/http-equiv=["']refresh/i.test(h) || /name=["']robots["']\s+content=["'][^"']*noindex/i.test(h)) continue;
  const og = meta(h, 'og:image');
  const rel0 = path.relative(DIST, f);
  if (/(^|\/)den\/\d\d-\d\d\/index\.html$/.test(rel0.split(path.sep).join('/'))
    && (!og || !/^summary_large_image$/.test(meta(h, 'twitter:card') ?? ''))) noOg.push(`${rel0}: ${og ? 'нет twitter:card' : 'нет og:image'}`);
  if (!og) continue;
  total++;
  let u; try { u = new URL(og); } catch { continue; }
  // Файл своего сайта: путь адреса = путь в dist (base сайта — корень домена).
  const local = path.join(DIST, decodeURIComponent(u.pathname));
  const d = /russian-civilization\.ru$/i.test(u.hostname) ? await dims(local) : (foreign++, undefined);
  if (d === undefined) continue;
  const rel = path.relative(DIST, f);
  if (!d) { missing.push(`${rel}: ${og}`); continue; }
  const [w, hh] = d;
  if (w < MIN_W || hh < MIN_H) small.push(`${rel}: ${w}×${hh} ${u.pathname}`);
  const mw = meta(h, 'og:image:width'), mh = meta(h, 'og:image:height');
  if ((mw && +mw !== w) || (mh && +mh !== hh)) wrong.push(`${rel}: в теге ${mw}×${mh}, файл ${w}×${hh}`);
  // Б15 (опись Р84, 21.10): у страницы дня превью ровно 1200×630 и размеры в разметке (og-den, cropDays).
  if (/(^|\/)den\/\d\d-\d\d\/index\.html$/.test(rel.split(path.sep).join('/')) && (w !== 1200 || hh !== 630 || !mw || !mh))
    noOg.push(`${rel}: превью ${w}×${hh}${mw ? '' : ', нет og:image:width/height'} — нужно 1200×630`);
}
console.log(`og-razmer: страниц с og:image ${total}, картинка меньше ${MIN_W}×${MIN_H} — ${small.length}, `
  + `неверные og:image:width/height — ${wrong.length}, файла нет в dist — ${missing.length}, чужой адрес — ${foreign}, `
  + `день без карточки пересылки — ${noOg.length}`);
for (const [name, list] of [['мелкие', small], ['размер в теге', wrong], ['нет файла', missing], ['день без карточки', noOg]])
  if (list.length) console.log(`${name}:\n  ${list.slice(0, 30).join('\n  ')}`);
if (small.length || wrong.length || missing.length || noOg.length) process.exit(1);
