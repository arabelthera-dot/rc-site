// Замок Р31 (20.10.2026): при выключенном PUBLIC_PODDERZHKA в сборке нет «Поддержать проект» и движка
// museum-support.js — иначе ошибка. При PUBLIC_PODDERZHKA=1 проверка пропускается.
// node scripts/podderzhka.mjs [dist]
import fs from 'node:fs';
import path from 'node:path';
import { podderzhkaVkl } from '../src/lib/podderzhka.mjs';

if (podderzhkaVkl()) { console.log('podderzhka: включена (PUBLIC_PODDERZHKA=1) — пропуск'); process.exit(0); }
const dist = process.argv[2] || 'dist';
const bad = [];
let files = 0;
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) { walk(f); continue; }
    if (!/\.(html|js)$/.test(e.name)) continue;
    files++;
    const s = fs.readFileSync(f, 'utf8');
    const n = (s.match(/Поддержать проект/g) || []).length + (s.match(/museum-support\.js/g) || []).length;
    if (n) bad.push(`${path.relative(dist, f)}: ${n}`);
  }
};
walk(dist);
if (bad.length) {
  console.error(`podderzhka: поддержка выключена, но в сборке ${bad.length} файлов с «Поддержать проект» / museum-support.js:`);
  console.error(bad.slice(0, 30).join('\n'));
  process.exit(1);
}
console.log(`podderzhka: 0 вхождений в ${files} файлах html/js`);
