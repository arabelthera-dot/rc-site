// Д2: проверка подписей у кадров. Запуск: npm run proverka-podpisey (из корня rc-site).
// КРАСНОЕ — кадр без подписи (нет ни источника, ни лицензии); ЖЁЛТОЕ — источник есть, лицензии нет.
// Выход с ошибкой — только при красном в карточках дней (src/content/days). Полные страницы
// (src/data/full-pages) — только отчёт: их кадры чинят хозяева страниц. Флаг --spisok — перечень кадров.
import { cardFrames, fullFrames } from '../src/lib/podpisi.mjs';

const full = process.argv.includes('--spisok');
const cards = cardFrames();
const pages = fullFrames();
const cRed = cards.filter((f) => !f.credit);
const cYellow = cards.filter((f) => f.credit && !f.lic);
const pRed = pages.filter((f) => f.state === 'none');
const pYellow = pages.filter((f) => f.state === 'partial');
const byMuseum = (list) => Object.entries(list.reduce((a, f) => ((a[f.museum] = (a[f.museum] || 0) + 1), a), {}))
  .map(([m, n]) => `${m} ${n}`).join(', ') || '—';

console.log(`Карточки дней: ${cards.length} кадров`);
console.log(`  КРАСНОЕ (без подписи): ${cRed.length}${cRed.length ? ' — ' + byMuseum(cRed) : ''}`);
console.log(`  ЖЁЛТОЕ (без лицензии): ${cYellow.length}${cYellow.length ? ' — ' + byMuseum(cYellow) : ''}`);
console.log(`Полные страницы: ${pages.length} кадров (отчёт, сборку не останавливает)`);
console.log(`  КРАСНОЕ (без подписи): ${pRed.length}${pRed.length ? ' — ' + byMuseum(pRed) : ''}`);
console.log(`  ЖЁЛТОЕ (подпись неполная): ${pYellow.length}${pYellow.length ? ' — ' + byMuseum(pYellow) : ''}`);
console.log(`  Подписаны только таблицей прав страницы: ${pages.filter((f) => f.state === 'rights').length}`);
const show = (title, list, fmt) => { if (!list.length) return; console.log(`\n${title}:`); list.forEach((f) => console.log('  ' + fmt(f))); };
if (full || cRed.length) show('Карточки без подписи', cRed, (f) => `${f.museum}/${f.key} ${f.src}`);
if (full) {
  show('Полные страницы без подписи', pRed, (f) => `${f.museum}/${f.key} ${f.src}${f.alt ? ` (alt: «${f.alt.slice(0, 60)}»)` : ''}`);
  show('Карточки без лицензии', cYellow, (f) => `${f.museum}/${f.key} ${f.src} — «${f.credit.slice(0, 80)}»`);
}
if (cRed.length) { console.error(`\nОШИБКА: ${cRed.length} кадров карточек без подписи.`); process.exit(1); }
