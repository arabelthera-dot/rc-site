// Адрес дня = полная страница (решение Сергея 16.10, план — knowledge/plan-varianta-2-1510.md).
// У дня с legacy_page готовая страница старого сайта копируется 1:1 в src/data/full-pages/<музей>/<ключ>.html,
// её файлы (картинки, видео, звук, движки) — в public/ по старым путям. Ссылаться на старый сайт нельзя:
// после переключения по его адресу встаёт новая сборка. Ставит страницу на место карточки
// src/integrations/full-pages.mjs. Файл, который в public/ уже есть и отличается, — ошибка.
// Запуск: npm run full-pages  (LEGACY — путь к rc-museum-preview, по умолчанию ~/rc-museum-preview)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const LEGACY = process.env.LEGACY || path.join(os.homedir(), 'rc-museum-preview');
const DAYS = 'src/content/days';
const OUT = 'src/data/full-pages';
const EXT = 'jpe?g|png|webp|gif|svg|avif|mp4|webm|mp3|ogg|m4a|wav|js|mjs|css|json|glb|gltf|bin|woff2?|ttf|vtt|pdf';
// Атрибуты, url(…) в стилях и строки в коде страницы, похожие на путь к файлу.
const ATTR = /\b(?:src|href|poster|data-src|data-poster|data-audio|data-video)\s*=\s*["']([^"']+)["']/gi;
const SRCSET = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
const URL_CSS = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
const QUOTED = new RegExp(`["'\`]([^"'\`\\s<>()]+\\.(?:${EXT}))(?:[?#][^"'\`]*)?["'\`]`, 'gi');

const local = (ref) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\$\{)/i.test(ref);
const fileOf = (pageDir, ref) => {
  const clean = decodeURI(ref.split(/[?#]/)[0]).replace(/^\/rc-museum-preview\//, '/');
  if (!clean || clean.endsWith('/')) return;
  const rel = clean.startsWith('/') ? clean.slice(1) : path.posix.normalize(path.posix.join(pageDir, clean));
  if (rel.startsWith('..')) return;
  return rel;
};

const pages = [];
for (const museum of fs.readdirSync(DAYS).sort()) {
  for (const f of fs.readdirSync(path.join(DAYS, museum)).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(DAYS, museum, f), 'utf8'));
    if (d.legacy_page) pages.push({ museum, key: f.replace(/\.json$/, ''), rel: d.legacy_page });
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
const files = new Map(); // путь → кто ссылается
const missing = [];
for (const p of pages) {
  const html = fs.readFileSync(path.join(LEGACY, p.rel), 'utf8');
  fs.mkdirSync(path.join(OUT, p.museum), { recursive: true });
  fs.writeFileSync(path.join(OUT, p.museum, `${p.key}.html`), html);
  const dir = path.posix.dirname(p.rel);
  const refs = [];
  for (const m of html.matchAll(ATTR)) refs.push(m[1]);
  for (const m of html.matchAll(SRCSET)) refs.push(...m[1].split(',').map((s) => s.trim().split(/\s+/)[0]));
  for (const m of html.matchAll(URL_CSS)) refs.push(m[1]);
  for (const m of html.matchAll(QUOTED)) refs.push(m[1]);
  for (const ref of refs.filter(local)) {
    const rel = fileOf(dir, ref);
    if (!rel || /\.html?$/.test(rel)) continue;
    const src = path.join(LEGACY, rel);
    if (!fs.existsSync(src) || !fs.statSync(src).isFile()) {
      // Строка из кода может оказаться не путём — в отчёт, не в ошибку; атрибут без файла — битый уже на старом сайте.
      missing.push(`${p.museum}/${p.key}: ${ref}`);
      continue;
    }
    if (!files.has(rel)) files.set(rel, `${p.museum}/${p.key}`);
  }
}

const conflicts = [];
let copied = 0, same = 0, bytes = 0;
for (const [rel, who] of files) {
  const src = path.join(LEGACY, rel);
  const dst = path.join('public', rel);
  const buf = fs.readFileSync(src);
  if (fs.existsSync(dst)) {
    if (fs.readFileSync(dst).equals(buf)) { same++; continue; }
    conflicts.push(`${rel} (${who}) — в public/ другой файл`);
    continue;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  copied++; bytes += buf.length;
}

console.log(`full-pages: ${pages.length} страниц, файлов ${files.size} (скопировано ${copied}, ${(bytes / 2 ** 20).toFixed(0)} МБ; уже были ${same})`);
if (missing.length) console.log(`нет на старом сайте (${missing.length}):\n  ${missing.join('\n  ')}`);
if (conflicts.length) { console.error(`конфликт с public/:\n  ${conflicts.join('\n  ')}`); process.exit(1); }
