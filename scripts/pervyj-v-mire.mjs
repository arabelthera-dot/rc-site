// Замок «Первый в мире» (Р365, Сергей 28.10.2026: «Почему на странице не написано «Первый в мире»? … Нарушена
// самая главная основа музея»). Каждый готовый день музея изобретений в собранном dist обязан нести «в мире»
// («первый/первая/первое в мире …», «первым в мире») и в <h1>, и в хуке — по границе первенства этого дня
// (блок pervenstvo.granica карточки / «Что именно здесь первое в мире» на странице). Новое первенство не выдумывается:
// если граница дня его не даёт — день в долг scripts/pervyj-v-mire-dolg.json с причиной и вопрос Сергею.
// Долг — снимок h1 и хука на 28.10.2026: день переделали (h1 или хук другой), а «в мире» нет — красный, как новый.
// Страницы «День готовится» (noindex) не проверяются. День из долга, который уже проходит, печатается: снять из долга.
// Пополнить долг нельзя руками без «да» Сергея; снимок всех текущих — node scripts/pervyj-v-mire.mjs --snimok.
// Нарушение — код 1 и ::error:: по-русски: день, что не так. Откат — удалить шаг из .github/workflows/proverka.yml.
// Запуск: node scripts/pervyj-v-mire.mjs [--dist dist] [--proba]
import fs from 'node:fs';
import path from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const MUZEI = 'izobreteniya';
const VMIRE = /в\s+мире/i;
const decode = (t) => t.replace(/&nbsp;|&#160;/g, ' ').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
const strip = (t) => decode((t ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// h1 и хук страницы: хук — первый элемент с классом, где есть «hook» (hero-hook, lead-hook, hook).
export function razbor(html) {
  const h1 = strip(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]);
  const hook = strip(html.match(/<(\w+)[^>]*class="[^"]*\bhook\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/)?.[2]
    ?? html.match(/<(\w+)[^>]*class="[^"]*hook[^"]*"[^>]*>([\s\S]*?)<\/\1>/)?.[2]);
  const gotovitsya = /<meta[^>]+name="robots"[^>]+noindex/i.test(html);
  return { h1, hook, gotovitsya };
}
export function oshibki({ h1, hook }) {
  const e = [];
  if (!h1) e.push('нет <h1>');
  else if (!VMIRE.test(h1)) e.push(`в заголовке нет «в мире»: «${h1}»`);
  if (!hook) e.push('нет хука');
  else if (!VMIRE.test(hook)) e.push(`в хуке нет «в мире»: «${hook}»`);
  return e;
}

if (process.argv.includes('--proba')) {
  const proba = [
    ['<h1>Первая в мире АЭС</h1><p class="hero-hook">Обнинск первым в мире дал ток.</p>', 0],
    ['<h1>Многокомандная архитектура «Эльбрус»</h1><p class="hook">«Эльбрус» брал несколько команд.</p>', 2],
    ['<h1>Первый в&nbsp;мире ледокол</h1><p class="lead-hook">Бритнев <b>первым</b> в мире срезал нос.</p>', 0],
    ['<h1>Первый в мире ледокол</h1>', 1],
  ];
  let bad = 0;
  for (const [html, n] of proba) { const e = oshibki(razbor(html)); if (e.length !== n) { bad++; console.log(`проба ✗ ждали ${n}, вышло ${e.length}: ${html}`); } }
  if (!razbor('<meta name="robots" content="noindex"><h1>x</h1>').gotovitsya) bad++;
  console.log(`pervyj-v-mire --proba: ${proba.length + 1 - bad} из ${proba.length + 1}`);
  process.exit(bad ? 1 : 0);
}

const DIST = path.resolve(arg('--dist', 'dist'));
const dolg = JSON.parse(fs.readFileSync(new URL('./pervyj-v-mire-dolg.json', import.meta.url), 'utf8'));
const dir = path.join(DIST, 'muzei', MUZEI, 'den');
if (!fs.existsSync(dir)) { console.log(`::error::pervyj-v-mire: нет ${dir} — сборки нет`); process.exit(1); }
const snimok = process.argv.includes('--snimok');
let n = 0, krasnyh = 0;
const snyat = [];
for (const key of fs.readdirSync(dir).filter((k) => /^\d\d-\d\d$/.test(k)).sort()) {
  const f = path.join(dir, key, 'index.html');
  if (!fs.existsSync(f)) continue;
  const r = razbor(fs.readFileSync(f, 'utf8'));
  if (r.gotovitsya) continue;
  n++;
  const e = oshibki(r);
  if (snimok) { if (e.length) dolg[key] = { pochemu: dolg[key]?.pochemu ?? 'старый день: поправить по Р365 при пересборке', h1: r.h1, hook: r.hook }; continue; }
  const z = dolg[key];
  if (z && z.h1 === r.h1 && z.hook === r.hook) { if (!e.length) snyat.push(key); continue; }
  if (z && !e.length) { snyat.push(key); continue; }
  if (e.length) { krasnyh++; console.log(`::error::${MUZEI} ${key}: ${e.join('; ')} — закон Р365: «первый в мире …» по границе первенства дня`); }
}
if (snimok) { fs.writeFileSync(new URL('./pervyj-v-mire-dolg.json', import.meta.url), `${JSON.stringify(dolg, null, 1)}\n`); console.log('pervyj-v-mire: снимок долга записан'); process.exit(0); }
for (const k of snyat) console.log(`pervyj-v-mire: ${k} уже проходит — снять из scripts/pervyj-v-mire-dolg.json`);
console.log(`pervyj-v-mire: готовых дней ${n}, в долге ${Object.keys(dolg).filter((k) => !k.startsWith('_')).length}, красных ${krasnyh}`);
process.exit(krasnyh ? 1 : 0);
