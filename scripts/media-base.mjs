// Ролики — из хранилища media.russian-civilization.ru (#2364, Михаил «да» 04.11.2026): 108 mp4 (~1 ГБ) ехали в dist
// и на msk-new с каждой выкладкой. Шаг после astro build: при заданном MEDIA_BASE каждый src="….mp4" страниц dist
// (<source>, <video>; src, data-src ленивой загрузки, <a href> на вертикальный ролик), если файл лежит в dist или в хранилище
// (манифест src/data/hranilishche-rolikov.sha256, Р825 — mp4 в public/ нет), становится MEDIA_BASE + путь от корня (?v= и #t= сохраняются);
// в video/registry.json пишется hosting.media — по нему public/assets/museum-video.js строит адрес ролика из реестра.
// Один шаг на все страницы: 41 карточку дня (два макета) и 21 старую full-pages — без правки каждой.
// MEDIA_BASE не задан — хранилище media.russian-civilization.ru (Р825 шаг 5: mp4 в public/ нет, другого места у роликов нет,
// и пустой MEDIA_BASE больше не откат). Новые ролики кладёт в хранилище rolik-na-sait.yml; ссылка — только на то, что в манифесте.
// Картинки (Р825 задача F): остаются в git и в dist; выпуск (deploy.yml, шаг «картинки в хранилище») докладывает картинки
// public/ в хранилище и только при удаче ставит MEDIA_KARTINKI — тогда <img src|data-src|srcset> и <source srcset> страниц,
// чей файл лежит в public/ (значит, уже в хранилище), ведут на MEDIA_BASE. MEDIA_KARTINKI: пусто — выключено (откат),
// '*' — все страницы, иначе пути страниц от корня dist через запятую (порядок «одна страница → проверка → все»).
// Картинки шаблона rc-kartinki (dist/_k/, их нет в public/) — только при MEDIA_K_DOLOZHENY=1: его ставит
// scripts/kartinki-k-v-hranilishche.sh, когда dist/_k/ доложен в хранилище под тем же адресом /_k/… (Р825 задача G).
// Без него /_k/ не трогаются. Второй проход по готовому dist безопасен: адреса хранилища уже не относительные.
// Запуск: node scripts/media-base.mjs --proba && node scripts/media-base.mjs --dist dist
import fs from 'node:fs';
import path from 'node:path';
import { vHranilishche } from './hranilishche-rolikov.mjs';
const args = process.argv.slice(2);
const DIST = args.includes('--dist') ? args[args.indexOf('--dist') + 1] : 'dist';
const BASE = (process.env.MEDIA_BASE || 'https://media.russian-civilization.ru').replace(/\/+$/, '');
const K_DOLOZHENY = process.env.MEDIA_K_DOLOZHENY === '1';
const KARTINKI = (process.env.MEDIA_KARTINKI || '').split(',').map((x) => x.trim().replace(/^\/+/, '')).filter(Boolean);
export const KARTINKA = /\.(?:jpe?g|png|webp|avif|gif|svg)$/i;

// Путь ролика от корня dist для src со страницы rel (null — не наш mp4: чужой адрес, data:, не .mp4).
// vid — какие файлы берём: по умолчанию mp4, для картинок — KARTINKA.
export function putOtKornya(src, rel, vid = /\.mp4$/i) {
  if (/^(?:[a-z]+:|\/\/)/i.test(src)) return null;
  const chist = src.split(/[?#]/)[0];
  if (!vid.test(chist)) return null;
  const papka = path.posix.dirname(rel.split(path.sep).join('/'));
  const p = path.posix.normalize(chist.startsWith('/') ? chist.slice(1) : path.posix.join(papka, decodeURI(chist)));
  return p.startsWith('..') ? null : p;
}
// Замена в одной странице: est(p) — лежит ли файл в dist. Возвращает [html, заменено, не найдено[]].
export function zamenit(html, rel, base, est) {
  let n = 0; const net = [];
  const out = html.replace(/(<(?:source|video|a)\b[^>]*?\s(?:src|data-src|href)=)(["'])([^"']+)\2/gi, (all, pre, q, src) => {
    const p = putOtKornya(src, rel);
    if (!p) return all;
    if (!est(p)) { net.push(src); return all; }
    n++;
    return `${pre}${q}${base}/${encodeURI(p)}${src.slice(src.split(/[?#]/)[0].length)}${q}`;
  });
  return [out, n, net];
}
// Картинки одной страницы: est(p) — файл в public/ (доложен в хранилище). srcset — каждый адрес списка отдельно.
// Возвращает [html, заменено].
export function zamenitKartinki(html, rel, base, est) {
  let n = 0;
  const odin = (src) => {
    const p = putOtKornya(src, rel, KARTINKA);
    if (!p || !est(p)) return src;
    n++;
    return `${base}/${encodeURI(p)}${src.slice(src.split(/[?#]/)[0].length)}`;
  };
  const out = html.replace(/<(img|source)\b[^>]*>/gi, (teg, imya) => teg.replace(/(\s(src|data-src|srcset|data-srcset)=)(["'])([^"']*)\3/gi, (all, pre, attr, q, v) => {
    if (/^source$/i.test(imya) && !/srcset$/i.test(attr)) return all;   // <source src> — ролики, их правит zamenit
    if (/srcset$/i.test(attr)) return `${pre}${q}${v.split(',').map((c) => c.replace(/^(\s*)(\S+)/, (m, sp, u) => sp + odin(u))).join(',')}${q}`;
    return `${pre}${q}${odin(v)}${q}`;
  }));
  return [out, n];
}

if (args.includes('--proba')) {
  const B = 'https://media.russian-civilization.ru', est = (p) => !p.includes('net');
  const sluchai = [
    ['<video controls><source src="video/day-01jan-cabletv.mp4?v=2" type="video/mp4"></video>', 'muzei/izobreteniya/day-01jan-cabletv.html',
      `<video controls><source src="${B}/muzei/izobreteniya/video/day-01jan-cabletv.mp4?v=2" type="video/mp4"></video>`],
    ['<source src="../video/a.mp4">', 'muzei/ne-sdayutsya/den/01-01/index.html', `<source src="${B}/muzei/ne-sdayutsya/den/video/a.mp4">`],
    ["<video src='/muzei/arh/media/intro-film.mp4#t=1'>", 'muzei/arh/x.html', `<video src='${B}/muzei/arh/media/intro-film.mp4#t=1'>`],
    ['<source src="https://example.com/a.mp4">', 'x.html', '<source src="https://example.com/a.mp4">'],
    ['<source src="audio/gid.mp3">', 'x.html', '<source src="audio/gid.mp3">'],
    ['<img src="video/a.mp4">', 'x.html', '<img src="video/a.mp4">'],
    ['<source src="video/net.mp4">', 'x.html', '<source src="video/net.mp4">'],
    ['<source data-src="media/t/intro-film.mp4">', 'muzei/arh/01-09.html', `<source data-src="${B}/muzei/arh/media/t/intro-film.mp4">`],
    ['<a class="v" href="media/b-9x16.mp4">', 'muzei/kar/01-01.html', `<a class="v" href="${B}/muzei/kar/media/b-9x16.mp4">`],
    ['<a href="den/01-01/">', 'x.html', '<a href="den/01-01/">'],
  ];
  const ne = sluchai.filter(([h, r, nado]) => zamenit(h, r, B, est)[0] !== nado);
  if (ne.length) { console.error('media-base --proba: ошибка на', ne.map(([h, r]) => [h, zamenit(h, r, B, est)[0]])); process.exit(1); }
  const kartinki = [
    ['<img src="img/a.jpg" alt="">', 'muzei/kar/den/01-01/index.html', `<img src="${B}/muzei/kar/den/01-01/img/a.jpg" alt="">`],
    ['<img loading="lazy" srcset="/k/a-480.webp 480w, /k/a-960.webp 960w" src="/k/a.png">', 'x.html',
      `<img loading="lazy" srcset="${B}/k/a-480.webp 480w, ${B}/k/a-960.webp 960w" src="${B}/k/a.png">`],
    ['<picture><source srcset="../i/a.avif" type="image/avif"><img src="../i/a.jpg?v=3"></picture>', 'muzei/arh/den/x.html',
      `<picture><source srcset="${B}/muzei/arh/i/a.avif" type="image/avif"><img src="${B}/muzei/arh/i/a.jpg?v=3"></picture>`],
    ['<img src="/_astro/net.jpg">', 'x.html', '<img src="/_astro/net.jpg">'],
    ['<img src="/muzei/a/b.jpg" srcset="/_k/0a1b-480.webp 480w, /_k/0a1b-960.webp 960w">', 'muzei/a/den/02-02/index.html',
      `<img src="${B}/muzei/a/b.jpg" srcset="${B}/_k/0a1b-480.webp 480w, ${B}/_k/0a1b-960.webp 960w">`],
    ['<img src="https://example.com/a.jpg">', 'x.html', '<img src="https://example.com/a.jpg">'],
    ['<img src="data:image/png;base64,AAA">', 'x.html', '<img src="data:image/png;base64,AAA">'],
    ['<source src="video/a.mp4">', 'x.html', '<source src="video/a.mp4">'],
    ['<a href="img/a.jpg">', 'x.html', '<a href="img/a.jpg">'],
  ];
  const neK = kartinki.filter(([h, r, nado]) => zamenitKartinki(h, r, B, est)[0] !== nado);
  if (neK.length) { console.error('media-base --proba: ошибка в картинках на', neK.map(([h, r]) => [h, zamenitKartinki(h, r, B, est)[0]])); process.exit(1); }
  console.log(`media-base --proba: ${sluchai.length} случаев верно (относительный, ../, от корня, чужой, не mp4, не тег, нет файла, data-src, a href, не ролик)`);
  console.log(`media-base --proba: картинки — ${kartinki.length} случаев верно (относительный, srcset, picture и ?v=, нет в public/, srcset /_k/, чужой, data:, ролик, a href)`);
  process.exit(0);
}

let stranic = 0, zamen = 0, kStranic = 0, kZamen = 0; const netFaila = [];
const kartinkiNa = (rel) => KARTINKI.includes('*') || KARTINKI.some((x) => rel === x || rel.startsWith(x.replace(/\/?$/, '/')) || rel === `${x}.html`);
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p);
  else if (e.name.endsWith('.html')) {
    const rel = path.relative(DIST, p), html = fs.readFileSync(p, 'utf8');
    let [out, n, net] = zamenit(html, rel, BASE, (x) => fs.existsSync(path.join(DIST, x)) || vHranilishche(x));
    if (n) { stranic++; zamen += n; }
    let k = 0;
    if (kartinkiNa(rel.split(path.sep).join('/'))) [out, k] = zamenitKartinki(out, rel, BASE, (x) => fs.existsSync(path.join('public', x))
      || (K_DOLOZHENY && x.startsWith('_k/') && fs.existsSync(path.join(DIST, x))));
    if (k) { kStranic++; kZamen += k; }
    if (n || k) fs.writeFileSync(p, out);
    for (const s of net) netFaila.push(`${rel}: ${s}`);
  }
} })(DIST);
const REG = path.join(DIST, 'video/registry.json');
if (fs.existsSync(REG)) {
  const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));
  reg.hosting = { ...(reg.hosting || {}), media: BASE };
  fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + '\n');
}
for (const s of netFaila) console.log(`::warning::media-base: ролика нет ни в dist, ни в хранилище — ссылка оставлена: ${s}`);
console.log(`media-base: картинки ${KARTINKI.length ? `(${KARTINKI.join(',')})` : 'выключены'} — ${kZamen} ссылок на ${BASE} в ${kStranic} страницах`);
console.log(`media-base: ${zamen} ссылок на ${BASE} в ${stranic} страницах; реестр ${fs.existsSync(REG) ? 'с hosting.media' : 'не найден'}; без файла — ${netFaila.length}`);
