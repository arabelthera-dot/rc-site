// Ленивые адреса data-src/data-poster в собранном dist/ (20.10.2026): lychee их не видит, а обход сайта
// нашёл 18 «битых» на полных страницах дней (относительный путь от /den/MM-DD/ вместо папки музея).
// Каждый data-src/data-poster, ведущий на свой сайт, должен быть файлом в dist/. Иначе — список и код 1.
// 23.10.2026 (обход Р162, пакет 2): обычные src/poster/srcset тоже — 2 кадра снятые в #382/#384 остались
// в <img src> полных страниц и ушли на сайт битыми, lychee их пропустил. Их — только «файл есть», от <base>.
// Запуск: node scripts/data-src.mjs [--dist dist]
import fs from 'node:fs';
import path from 'node:path';

const i = process.argv.indexOf('--dist');
const DIST = i > 0 ? process.argv[i + 1] : 'dist';
const SKIP = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\$|\{|data:)/i;
const bad = [];
let vsego = 0;

function* html(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* html(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

for (const file of html(DIST)) {
  const s = fs.readFileSync(file, 'utf8');
  const pageUrl = '/' + path.relative(DIST, file).split(path.sep).join('/');
  const baseHref = /<base\s[^>]*href=["']([^"']+)["']/i.exec(s)?.[1];
  const from = new URL(baseHref || pageUrl, new URL(pageUrl, 'http://x')).href;
  for (const m of s.matchAll(/\sdata-(?:src|poster)\s*=\s*(["'])([^"']*)\1/gi)) {
    const u = m[2].trim();
    if (!u || SKIP.test(u)) continue;
    vsego++;
    // Относительный адрес проверяется дважды: от <base> (как видит браузер) и от адреса файла (как видят
    // проверки ссылок и обходчики) — сборка обязана отдавать их абсолютными.
    const rel = !u.startsWith('/');
    const abs = decodeURIComponent(new URL(u, from).pathname);
    let f = path.join(DIST, abs);
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) bad.push(`${pageUrl} → ${u} (нет файла ${abs})`);
    else if (rel) bad.push(`${pageUrl} → ${u} (относительный — от адреса страницы не найдётся)`);
  }
  const plain = [...s.matchAll(/\s(?:src|poster)\s*=\s*(["'])([^"']*)\1/gi)].map((m) => m[2]);
  for (const m of s.matchAll(/\ssrcset\s*=\s*(["'])([^"']*)\1/gi))
    for (const part of m[2].split(',')) plain.push(part.trim().split(/\s+/)[0]);
  for (const raw of plain) {
    const u = raw.trim();
    if (!u || SKIP.test(u)) continue;
    vsego++;
    const abs = decodeURIComponent(new URL(u, from).pathname);
    let f = path.join(DIST, abs);
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) bad.push(`${pageUrl} → ${u} (нет файла ${abs})`);
  }
}

console.log(`data-src: проверено ${vsego}, битых ${bad.length}`);
for (const b of bad) console.log('  ' + b);
if (process.env.GITHUB_STEP_SUMMARY && bad.length)
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### data-src: битых ${bad.length}\n\n${bad.map((b) => '- ' + b).join('\n')}\n`);
process.exit(bad.length ? 1 : 0);
