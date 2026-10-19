// Проверка подгрузок из движков (18.10.2026): lychee читает только html и не видит,
// что движок тянет другой файл из js — `import … from './x.js'`, `import('./x.js')`,
// `new URL('x.js', HERE)`. Так при переезде пропали kizhi-house-3d.js и assets/vendor/
// (3D Кижей и увеличение картины молча не грузились). Скрипт ищет такие относительные
// пути во всех .js и проверяет, что файл лежит рядом.
// Запуск: node scripts/js-import.mjs [папка]   (по умолчанию dist/, без сборки — public/)
// Выход 1 — есть пропавшие файлы.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const koren = process.argv[2] || (existsSync('dist') ? 'dist' : 'public');
const SHABLONY = [
  /\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]/g,
  /\bimport\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g,
  /\bnew URL\(\s*['"]([^'":]+\.(?:m?js|json|wasm))['"]\s*,/g,
];

function* obhod(papka) {
  for (const imya of readdirSync(papka)) {
    const put = join(papka, imya);
    if (statSync(put).isDirectory()) yield* obhod(put);
    else if (/\.m?js$/.test(imya)) yield put;
  }
}

let fajlov = 0;
const propali = [];
for (const fajl of obhod(koren)) {
  fajlov++;
  const tekst = readFileSync(fajl, 'utf8');
  for (const sh of SHABLONY) {
    for (const m of tekst.matchAll(sh)) {
      const cel = resolve(dirname(fajl), m[1].split(/[?#]/)[0]);
      if (!existsSync(cel)) propali.push(`${relative(koren, fajl)} → ${m[1]}`);
    }
  }
}

console.log(`js-import: файлов ${fajlov}, пропавших подгрузок ${propali.length}`);
for (const p of propali) console.log('  ✗ ' + p);
process.exit(propali.length ? 1 : 0);
