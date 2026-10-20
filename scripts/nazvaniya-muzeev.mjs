// Названия музеев только полностью (правило Сергея 09.10, AI_Projects#804, 20.10.2026): в готовой сборке — текст,
// <title>, meta description, og/twitter, JSON-LD, alt, подписи кнопок в скриптах страницы — любое «Музей …» /
// «Детский музей …», которое выдаёт себя за имя музея из src/data/museums.json, но не равно его title_ru, — брак.
// Почему сборка это пропускала: прежняя проверка (checkMuseumName) ловила только обрывы с конца title_ru
// («Музей русской кухни» от «…и кулинарии»), а «Музей «Русские не сдаются»» выпадает из середины, «Музей русских побед»
// и «Музей русских писателей» — прежние имена со старого сайта. Теперь и сборка полных страниц, и этот обход dist
// зовут одну функцию korotkieImena (src/lib/imya-muzeya.mjs): обрезок = слова фразы по порядку входят в title_ru
// и есть отличительное слово; прежние имена — список STARYE_IMENA там же.
// Запуск: node scripts/nazvaniya-muzeev.mjs [--dist dist]   ·   --proba — только самопроверка на заведомых строках.
// Выход 1 — брак (или проба не сошлась). В CI строгая; выключатель — переменная репозитория NAZVANIYA_STROGO=0.
import fs from 'node:fs';
import path from 'node:path';
import { korotkieImena, MUSEUMS } from '../src/lib/imya-muzeya.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

// Проба: заведомый брак находится, полные имена и чужие музеи — нет.
const BRAK = [
  '<a href="index.html">Музей «Русские не сдаются»</a>',
  '<meta name="description" content="Бой у Сольцов. Музей «Русские не сдаются».">',
  '<script>window.MUSEUM_CHROME={museum:{homeLabel:\'← Музей карикатуры\'}}</script>',
  '{"name":"Музей русских побед — календарь на каждый день"}',
  '<img alt="Музей спорта: зал">',
  '<p>Музей русской кухни</p>',
];
const NORMA = [
  ...Object.values(MUSEUMS).map((t) => `<title>День — ${t}</title><a>${t}</a>`),
  '<p>Музей Победы пишет, что Музей Арктики и Антарктики и Музей радио открыты; Музей бесплатный.</p>',
  '<p>Музей русского спорта «Сильнее обстоятельств». Музей русских. Музей народов России</p>',
];
const proba = [...BRAK.filter((s) => !korotkieImena(s).length).map((s) => `брак не пойман: ${s}`),
  ...NORMA.flatMap((s) => korotkieImena(s).map((x) => `ложное «${x.imya}» в: ${s.slice(0, 120)}`))];
if (proba.length) { console.error(`nazvaniya-muzeev: проба не сошлась\n${proba.join('\n')}`); process.exit(1); }
if (process.argv.includes('--proba')) { console.log(`nazvaniya-muzeev: проба — ${BRAK.length} брака пойманы, ${NORMA.length} нормы чисты`); process.exit(0); }

const dist = arg('--dist', 'dist');
if (!fs.existsSync(dist)) { console.error(`nazvaniya-muzeev: нет папки ${dist} — сначала npm run build`); process.exit(1); }
function* obhod(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== 'pagefind') yield* obhod(p); } else if (/\.(?:html|xml|json|webmanifest)$/.test(e.name)) yield p;
  }
}
let n = 0;
const brak = new Map(); // «имя» → { slug, title, files[] }
for (const f of obhod(dist)) {
  n++;
  for (const x of korotkieImena(fs.readFileSync(f, 'utf8'))) {
    if (!brak.has(x.imya)) brak.set(x.imya, { ...x, files: [] });
    brak.get(x.imya).files.push(path.relative(dist, f));
  }
}
if (!brak.size) { console.log(`nazvaniya-muzeev: ${n} файлов, обрезанных и прежних имён музеев 0`); process.exit(0); }
const strok = [...brak.values()].sort((a, b) => a.slug.localeCompare(b.slug));
const otchet = [`nazvaniya-muzeev: брак — ${strok.reduce((s, x) => s + x.files.length, 0)} страниц, ${strok.length} имён (нужен title_ru полностью):`,
  ...strok.map((x) => `  ${x.slug}: «${x.imya}» вместо «${x.title}» — ${x.files.length}: ${x.files.slice(0, 5).join(', ')}${x.files.length > 5 ? ' …' : ''}`)];
console.error(otchet.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\`\`\`\n${otchet.join('\n')}\n\`\`\`\n`);
process.exit(1);
