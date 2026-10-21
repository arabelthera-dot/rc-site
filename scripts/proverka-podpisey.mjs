// Д2: проверка подписей у кадров. Запуск: npm run proverka-podpisey (из корня rc-site).
// КРАСНОЕ — кадр без подписи (нет ни источника, ни лицензии); ЖЁЛТОЕ — источник есть, лицензии нет;
// ДОЛГ — кадр полной страницы подписан только общей таблицей прав страницы (своей лицензии нет).
// Ошибка (21.10.2026, корень: полные страницы были «только отчёт» — у новых музеев набралось 293 кадра
// без своей лицензии, и машина молчала):
//   1) красное или жёлтое — в карточках дней (src/content/days) И в полных страницах (src/data/full-pages);
//   2) ДОЛГ музея больше потолка из scripts/podpisi-dolg.json или долг в музее, которого там нет.
// Потолки — числа на main 21.10.2026: старые музеи защищены сразу, новые не могут ухудшиться.
// ДОЧИСТИЛИ МУЗЕЙ — СТРОКУ ИЗ podpisi-dolg.json УДАЛИТЬ; убавили долг — потолок снизить до нового числа.
// Флаг --spisok — перечень кадров. --root DIR — другой корень (для самотеста proverka-podpisey.test.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { cardFrames, fullFrames } from '../src/lib/podpisi.mjs';

const argv = process.argv.slice(2);
const full = argv.includes('--spisok');
const ri = argv.indexOf('--root');
const root = ri >= 0 ? argv[ri + 1] : '.';
const dolgFile = path.join(root, 'scripts/podpisi-dolg.json');
const dolg = fs.existsSync(dolgFile) ? JSON.parse(fs.readFileSync(dolgFile, 'utf8')) : {};
const cards = cardFrames(root);
const pages = fullFrames(root);
const cRed = cards.filter((f) => !f.credit);
const cYellow = cards.filter((f) => f.credit && !f.lic);
const pRed = pages.filter((f) => f.state === 'none');
const pYellow = pages.filter((f) => f.state === 'partial');
const pRights = pages.filter((f) => f.state === 'rights');
const count = (list) => list.reduce((a, f) => ((a[f.museum] = (a[f.museum] || 0) + 1), a), {});
const byMuseum = (list) => Object.entries(count(list)).map(([m, n]) => `${m} ${n}`).join(', ') || '—';

console.log(`Карточки дней: ${cards.length} кадров`);
console.log(`  КРАСНОЕ (без подписи): ${cRed.length}${cRed.length ? ' — ' + byMuseum(cRed) : ''}`);
console.log(`  ЖЁЛТОЕ (без лицензии): ${cYellow.length}${cYellow.length ? ' — ' + byMuseum(cYellow) : ''}`);
console.log(`Полные страницы: ${pages.length} кадров`);
console.log(`  КРАСНОЕ (без подписи): ${pRed.length}${pRed.length ? ' — ' + byMuseum(pRed) : ''}`);
console.log(`  ЖЁЛТОЕ (подпись неполная): ${pYellow.length}${pYellow.length ? ' — ' + byMuseum(pYellow) : ''}`);
console.log(`  ДОЛГ (только таблица прав страницы): ${pRights.length}${pRights.length ? ' — ' + byMuseum(pRights) : ''}`);

const errors = [];
const have = count(pRights);
for (const [m, n] of Object.entries(have)) {
  if (!(m in dolg)) errors.push(`${m}: ${n} кадров без своей лицензии, а музея нет в podpisi-dolg.json (новый долг запрещён)`);
  else if (n > dolg[m]) errors.push(`${m}: долг ${n} больше потолка ${dolg[m]}`);
}
for (const [m, cap] of Object.entries(dolg)) {
  const n = have[m] || 0;
  if (n < cap) console.log(`  Заметка: ${m} — долг ${n}, потолок ${cap}: ${n ? `снизить потолок до ${n}` : 'строку удалить'} в podpisi-dolg.json`);
}

const show = (title, list, fmt) => { if (!list.length) return; console.log(`\n${title}:`); list.forEach((f) => console.log('  ' + fmt(f))); };
const pfmt = (f) => `${f.museum}/${f.key} ${f.src}${f.alt ? ` (alt: «${f.alt.slice(0, 60)}»)` : ''}`;
if (full || cRed.length) show('Карточки без подписи', cRed, (f) => `${f.museum}/${f.key} ${f.src}`);
if (full || cYellow.length) show('Карточки без лицензии', cYellow, (f) => `${f.museum}/${f.key} ${f.src} — «${f.credit.slice(0, 80)}»`);
if (full || pRed.length) show('Полные страницы без подписи', pRed, pfmt);
if (full || pYellow.length) show('Полные страницы, подпись неполная', pYellow, pfmt);
if (full || errors.length) show('Полные страницы, только таблица прав', pRights.filter((f) => full || errors.some((e) => e.startsWith(f.museum + ':'))), pfmt);

if (cRed.length) errors.push(`${cRed.length} кадров карточек без подписи`);
if (cYellow.length) errors.push(`(Р84, Б16) ${cYellow.length} кадров карточек без лицензии в подписи`);
if (pRed.length) errors.push(`${pRed.length} кадров полных страниц без подписи`);
if (pYellow.length) errors.push(`${pYellow.length} кадров полных страниц с неполной подписью (нет лицензии или источника)`);
if (errors.length) { console.error('\nОШИБКА:\n  ' + errors.join('\n  ')); process.exit(1); }
console.log('\nПодписи в порядке.');
