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
// Ключ каждой записи — существующий день года (365, без 29.02), во всех музеях (19.10: 12-32…12-37 у первопроходцев).
const DNEY = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
for (const museum of fs.readdirSync('src/content/days')) {
  const dir = path.join('src/content/days', museum);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const m = /^(\d{2})-(\d{2})\.json$/.exec(f);
    const ok = m && +m[1] >= 1 && +m[1] <= 12 && +m[2] >= 1 && +m[2] <= DNEY[+m[1] - 1];
    if (!ok) bad.push(`${museum}/${f}: ключ не существующий день года`);
  }
}
for (const b of bad) console.log(`${strogo ? 'КРАСНО' : 'внимание'}: ${b}`);
if (bad.length && strogo) process.exit(1);
console.log(bad.length ? `замечаний ${bad.length}${strogo ? '' : ' (флаг YADRO_STROGO выключен — exit 0)'}` : 'ядро пилота в порядке');
