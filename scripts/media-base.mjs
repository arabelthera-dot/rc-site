// Ролики — из хранилища media.russian-civilization.ru (#2364, Михаил «да» 04.11.2026): 108 mp4 (~1 ГБ) ехали в dist
// и на msk-new с каждой выкладкой. Шаг после astro build: при заданном MEDIA_BASE каждый src="….mp4" страниц dist
// (<source>, <video>; src, data-src ленивой загрузки, <a href> на вертикальный ролик), если файл лежит в dist, становится MEDIA_BASE + путь от корня (?v= и #t= сохраняются);
// в video/registry.json пишется hosting.media — по нему public/assets/museum-video.js строит адрес ролика из реестра.
// Один шаг на все страницы: 41 карточку дня (два макета) и 21 старую full-pages — без правки каждой.
// MEDIA_BASE пустой — шаг спит, dist как был (откат = пустой MEDIA_BASE). Файлы mp4 в dist не удаляются (шаг 5 — отдельно).
// Файлы на хранилище кладёт и сверяет .github/workflows/media.yml; ссылка ставится только на то, что там уже лежит.
// Запуск: node scripts/media-base.mjs --proba && node scripts/media-base.mjs --dist dist
import fs from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
const DIST = args.includes('--dist') ? args[args.indexOf('--dist') + 1] : 'dist';
const BASE = (process.env.MEDIA_BASE || '').replace(/\/+$/, '');

// Путь ролика от корня dist для src со страницы rel (null — не наш mp4: чужой адрес, data:, не .mp4).
export function putOtKornya(src, rel) {
  if (/^(?:[a-z]+:|\/\/)/i.test(src)) return null;
  const chist = src.split(/[?#]/)[0];
  if (!/\.mp4$/i.test(chist)) return null;
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
  console.log(`media-base --proba: ${sluchai.length} случаев верно (относительный, ../, от корня, чужой, не mp4, не тег, нет файла, data-src, a href, не ролик)`);
  process.exit(0);
}

if (!BASE) { console.log('media-base: MEDIA_BASE пустой — спит, ролики с сайта как раньше'); process.exit(0); }
let stranic = 0, zamen = 0; const netFaila = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p);
  else if (e.name.endsWith('.html')) {
    const rel = path.relative(DIST, p), html = fs.readFileSync(p, 'utf8');
    const [out, n, net] = zamenit(html, rel, BASE, (x) => fs.existsSync(path.join(DIST, x)));
    if (n) { fs.writeFileSync(p, out); stranic++; zamen += n; }
    for (const s of net) netFaila.push(`${rel}: ${s}`);
  }
} })(DIST);
const REG = path.join(DIST, 'video/registry.json');
if (fs.existsSync(REG)) {
  const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));
  reg.hosting = { ...(reg.hosting || {}), media: BASE };
  fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + '\n');
}
for (const s of netFaila) console.log(`::warning::media-base: ролика нет в dist — ссылка оставлена: ${s}`);
console.log(`media-base: ${zamen} ссылок на ${BASE} в ${stranic} страницах; реестр ${fs.existsSync(REG) ? 'с hosting.media' : 'не найден'}; без файла — ${netFaila.length}`);
