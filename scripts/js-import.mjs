// Проверка подгрузок из движков (18.10.2026): lychee читает только html и не видит,
// что движок тянет другой файл из js — `import … from './x.js'`, `import('./x.js')`,
// `new URL('x.js', HERE)`. Так при переезде пропали kizhi-house-3d.js и assets/vendor/
// (3D Кижей и увеличение картины молча не грузились). Скрипт ищет такие относительные
// пути во всех .js и проверяет, что файл лежит рядом.
// 19.10: то же с плитками увеличения картин — OpenSeadragon строит их адреса из info.json
// (IIIF level0), в html их нет, и при переезде у «Чёрного моря» пропали 65 из 68 файлов.
// Для каждого info.json считаем все плитки по формуле IIIF и проверяем, что они лежат рядом.
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

function* obhod(papka, maska = /\.m?js$/) {
  for (const imya of readdirSync(papka)) {
    const put = join(papka, imya);
    if (statSync(put).isDirectory()) yield* obhod(put, maska);
    else if (maska.test(imya)) yield put;
  }
}

// Все плитки статического IIIF level0: регион x,y,w,h и размер w,h при каждом масштабе.
function plitki(info) {
  const { width: W, height: H } = info;
  const out = [];
  for (const t of info.tiles || []) {
    const tw = t.width, th = t.height || t.width;
    for (const s of t.scaleFactors || []) {
      for (let y = 0; y < H; y += th * s) {
        for (let x = 0; x < W; x += tw * s) {
          const rw = Math.min(tw * s, W - x), rh = Math.min(th * s, H - y);
          const region = rw === W && rh === H ? 'full' : `${x},${y},${rw},${rh}`; // целиком — папка full
          out.push(`${region}/${Math.ceil(rw / s)},${Math.ceil(rh / s)}/0/default.jpg`);
        }
      }
    }
  }
  return out;
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

let zumov = 0;
for (const fajl of obhod(koren, /^info\.json$/)) {
  let info;
  try { info = JSON.parse(readFileSync(fajl, 'utf8')); } catch { continue; }
  if (info.profile !== 'level0' || !info.tiles) continue;
  zumov++;
  const papka = dirname(fajl);
  const net = plitki(info).filter((p) => !existsSync(join(papka, p)));
  if (net.length) propali.push(`${relative(koren, fajl)} → нет ${net.length} плиток, например ${net[0]}`);
}

console.log(`js-import: файлов ${fajlov}, увеличений ${zumov}, пропавших подгрузок ${propali.length}`);
for (const p of propali) console.log('  ✗ ' + p);
process.exit(propali.length ? 1 : 0);
