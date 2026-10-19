#!/usr/bin/env node
// Права на кадры по ведомостям public/**/rights.json. Перенос режима проверки
// russian-civilization/tools/audit-prava.py (не `vzyat`; план 18.10, шаг 3).
// У каждой записи-картинки ведомости должны быть непустые источник и лицензия (основание).
//   источник — одно из: source, source_url, url, holder (адрес карточки кадра или держатель);
//   лицензия — одно из: license, osnovanie, basis.
// Красное — пустое/отсутствующее поле, запись без имени файла, нечитаемый JSON.
// Предупреждение (не красное) — файл кадра, на который ссылается запись, не найден рядом с ведомостью.
// Запуск: node scripts/prava.mjs [папка]   (по умолчанию public/)
// Выход: 0 — чисто, 1 — нарушения. В proverka.yml не подключён.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const SOURCE_KEYS = ['source', 'source_url', 'url', 'holder'];
const LICENSE_KEYS = ['license', 'osnovanie', 'basis'];
const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile() && e.name === 'rights.json') yield p;
  }
}

const filled = (o, keys) => keys.some((k) => typeof o[k] === 'string' ? o[k].trim() : o[k] != null && o[k] !== '');

const root = process.argv[2] || 'public';
const red = [];
const warn = [];
let ledgers = 0, kadrov = 0;
for (const f of walk(root)) {
  ledgers++;
  const name = relative('.', f);
  let data;
  try { data = JSON.parse(readFileSync(f, 'utf8')); } catch (e) { red.push(`${name}: не JSON (${e.message})`); continue; }
  const items = Array.isArray(data) ? data : Array.isArray(data?.files) ? data.files : null;
  if (!items) { red.push(`${name}: нет списка записей (массив или files[])`); continue; }
  items.forEach((it, i) => {
    const file = it?.file || it?.local_path;
    const id = file || it?.id || `#${i}`;
    if (!file || !IMG_RE.test(file)) { red.push(`${name} [${id}]: нет имени файла картинки (file)`); return; }
    kadrov++;
    if (!filled(it, SOURCE_KEYS)) red.push(`${name} [${id}]: нет источника (${SOURCE_KEYS.join('/')})`);
    if (!filled(it, LICENSE_KEYS)) red.push(`${name} [${id}]: нет лицензии (${LICENSE_KEYS.join('/')})`);
    if (!existsSync(join(dirname(f), file))) warn.push(`${name} [${id}]: файл не найден рядом с ведомостью`);
  });
}
for (const r of red) console.log('✗ ' + r);
for (const w of warn) console.log('? ' + w);
console.log(`prava: ведомостей ${ledgers}, кадров ${kadrov}, красных ${red.length}, предупреждений ${warn.length}`);
process.exit(red.length ? 1 : 0);
