// Проверка ядра данных (#179): у музея пилота ровно 365 записей; день пилота без картины — красно.
// По умолчанию — только отчёт (exit 0); строго — YADRO_STROGO=1 (новое ставится выключенным).
import fs from 'node:fs';
import path from 'node:path';

const strogo = process.env.YADRO_STROGO === '1';
const pilot = JSON.parse(fs.readFileSync('src/data/yadro-pilot.json', 'utf8'));
const bad = [];
for (const [museum, keys] of Object.entries(pilot)) {
  const dir = path.join('src/content/days', museum);
  const n = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^\d{2}-\d{2}\.json$/.test(f)).length : 0;
  console.log(`${museum}: записей ${n} из 365`);
  if (n !== 365) bad.push(`${museum}: записей ${n}, нужно ровно 365`);
  for (const k of keys) {
    const f = path.join(dir, `${k}.json`);
    if (!fs.existsSync(f)) { bad.push(`${museum}/${k}: записи нет`); continue; }
    const imgs = JSON.parse(fs.readFileSync(f, 'utf8')).images ?? [];
    console.log(`${museum}/${k}: картинок ${imgs.length}`);
    if (!imgs.length) bad.push(`${museum}/${k}: день пилота без картины`);
  }
}
for (const b of bad) console.log(`${strogo ? 'КРАСНО' : 'внимание'}: ${b}`);
if (bad.length && strogo) process.exit(1);
console.log(bad.length ? `замечаний ${bad.length}${strogo ? '' : ' (флаг YADRO_STROGO выключен — exit 0)'}` : 'ядро пилота в порядке');
