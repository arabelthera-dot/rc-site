#!/usr/bin/env node
// Нет английской версии сайта. Перенос english_staged() из
// russian-civilization/tools/audit-precommit.py (уходящий старый набор, план 18.10, шаг 3).
// Сергей 09.10.2026: английскую версию не делать и не хранить; перевод — только после его решения.
// Красное: путь с каталогом en/, файл вида *-en.* / *_en.* / *.en.* (html, mp3, mp4, vtt, json, txt, jpg, png),
// разметка lang="en" или hreflang="en" в .html.
// Запуск: node scripts/net-en.mjs [папка ...]   (по умолчанию dist/, нет сборки — src/ и public/)
// Выход: 0 — чисто, 1 — нарушения. В proverka.yml не подключён.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Исключения: законные английские места (префиксы путей от корня проверяемой папки).
// На 18.10.2026 законного раздела /en/ в src/pages нет — список пуст.
// Старый набор пропускал .claude/skills/ (сторонние навыки, Сергей 11.10.2026) — в сайте их нет.
const ISKLYUCHENIYA = [];
// Заглушки переадресации старых английских адресов (src/data/redirects.json: *-en.html → русская страница):
// html без lang="en" с <meta http-equiv="refresh"> — это не английская версия, а её уборка; не красное, считаются отдельно.
const STUB_RE = /http-equiv=["']refresh["']/i;

const PATH_RE = /(^|\/)en\/|[-_.]en\.(html|mp3|mp4|vtt|json|txt|jpg|png)$/;
const MARK_RE = /(hreflang|lang)=["']en["']/;
const SKIP_DIRS = new Set(['node_modules', '.git', '.astro']);

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile()) yield p;
  }
}

let roots = process.argv.slice(2);
if (!roots.length) roots = existsSync('dist') ? ['dist'] : ['src', 'public'];
const hits = [];
let files = 0, stubs = 0;
for (const root of roots) {
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    console.error(`╳ нет папки: ${root}`);
    process.exit(1);
  }
  for (const p of walk(root)) {
    const rel = relative(root, p).split('\\').join('/');
    if (ISKLYUCHENIYA.some((x) => rel.startsWith(x))) continue;
    files++;
    if (PATH_RE.test(rel)) {
      if (rel.endsWith('.html')) {
        const t = readFileSync(p, 'utf8');
        if (STUB_RE.test(t) && !MARK_RE.test(t)) { stubs++; continue; }
      }
      hits.push(`${root}/${rel}`);
    } else if (rel.endsWith('.html') && MARK_RE.test(readFileSync(p, 'utf8'))) hits.push(`${root}/${rel} (lang=en)`);
  }
}
for (const h of hits) console.log('╳ английская версия: ' + h);
console.log(`net-en: папки ${roots.join(', ')}; файлов ${files}; заглушек переадресации ${stubs}; нарушений ${hits.length}`);
if (hits.length) console.log('  Сергей 09.10.2026: английскую версию не делать и не хранить; перевод — только после его решения.');
process.exit(hits.length ? 1 : 0);
