// Проверка №3 (Р84, 21.10.2026): дата события ≠ дата дня. Карточка дня с ключом ММ-ДД, а в её названии/хуке
// или в заголовке полной страницы (<title>/<h1>, src/data/full-pages) явно стоит другая дата («4 января» у дня 01-01).
// Узко — чтобы не ловить «за неделю до…» и упоминания других дат в тексте: смотрим только название, хук и заголовок
// страницы, и только ПЕРВУЮ дату «Д месяца» в каждом поле; перед ней не должно быть «до/после/с/по/к/от/на…» —
// такие даты относительные. Недатированные музеи (calendar-meta-<музей>.json dated:false) пропускаются.
// Дата в скобках и дата со «ст. ст.» сразу за ней — пояснение, не дата события.
// Дата в скобках и дата со «ст. ст.» сразу за ней — пояснение, не дата события.
// Диапазон «1–4 января» / «1 и 4 января», где есть день карточки, — не расхождение.
// Запуск: node scripts/data-dnya.mjs [--proba]. Находки печатаются всегда; код выхода 1 — только при DATA_DNYA_STROGO=1.
// Пока режим отчёта (21.10.2026: настоящие расхождения чинит пункт А3 описи). Выключатель шага — переменная DATA_DNYA_STROGO=0.
import fs from 'node:fs';
import path from 'node:path';

const DAYS = 'src/content/days', FULL = 'src/data/full-pages';
const MON = ['январ', 'феврал', 'март', 'апрел', 'ма', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];
const MONR = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const decode = (t) => t.replace(/&nbsp;/g, ' ').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
const strip = (t) => decode(t.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
// «4 января», «1–4 января», «1 и 4 января», «4-го января»; перед датой — до 2 слов контекста.
const RE = new RegExp(`(?:^|[^0-9а-яё])((?:[а-яё]+\\s+){0,1})((?:\\d{1,2}\\s*(?:[–—-]|и|,)\\s*)*)(\\d{1,2})(?:-?го)?\\s+(${MONR.join('|')})(?![а-яё])`, 'i');
const OTNOS = /^(до|после|с|со|по|к|ко|от|на|накануне|кануне|через|между|прежде)$/i;

// Первая дата поля → { d, m, txt } или null; относительная («до 4 января») → null.
export function pervayaData(text) {
  const t = (text ?? '').replace(/\u00a0/g, ' ');
  const m = t.match(RE);
  if (!m) return null;
  // Дата в скобках — пояснение («(14 мая ст. ст.)», «(не путать с … 3 января)»), не дата события.
  const pered = t.slice(0, m.index + m[0].length);
  if ((pered.match(/\(/g) ?? []).length > (pered.match(/\)/g) ?? []).length) return null;
  // Старый стиль: «10 марта 1942 (ст. ст.)», «по старому стилю» сразу за датой.
  if (/^[^.;]{0,12}(ст\.\s*ст\.|по\s+старому\s+стилю)/i.test(t.slice(m.index + m[0].length))) return null;
  const pre = m[1].trim();
  if (pre && OTNOS.test(pre)) return null;
  const dni = [...m[2].matchAll(/\d{1,2}/g)].map((x) => +x[0]).concat(+m[3]);
  return { dni, m: MONR.indexOf(m[4].toLowerCase()) + 1, txt: m[0].trim() };
}
export function rashozhdenie(text, key) {
  const p = pervayaData(text);
  if (!p) return null;
  const mm = +key.slice(0, 2), dd = +key.slice(3);
  if (p.m === mm && p.dni.includes(dd)) return null;
  return p.txt;
}

if (process.argv.includes('--proba')) {
  const proba = [
    ['01-01', 'Пильчиков 4 января взорвал заряд', true],
    ['01-01', '1 января 1700 года Пётр ввёл новый год', false],
    ['01-01', 'За неделю до 4 января всё решилось', false],
    ['01-04', 'Штурм 1–4 января 1943 года', false],
    ['01-01', 'Спустя год, после 9 мая, он вернулся', false],
    ['05-09', 'Победа', false],
    ['03-12', 'В ночь на 13 марта', false],
    ['03-12', 'Утром 13 марта корабль вышел', true],
    ['12-31', 'Ровно в полночь 1\u00a0января', true],
    ['02-01', 'Сражение при Ла-Ротьере, 1814 (20 января ст. ст.)', false],
    ['03-22', 'Умер художник — 10 марта 1942 (ст. ст.)', false],
    ['03-08', 'Сказка (не путать с «Снегурушкой» 3 января)', false],
  ];
  let bad = 0;
  for (const [k, t, zhd] of proba) {
    const got = !!rashozhdenie(t, k);
    if (got !== zhd) { bad++; console.log(`проба НЕ прошла: ${k} «${t}» — ждали ${zhd ? 'находку' : 'чисто'}`); }
  }
  console.log(`data-dnya --proba: ${proba.length - bad} из ${proba.length}`);
  process.exit(bad ? 1 : 0);
}

const pageHead = (html) => {
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  return [t && strip(t).replace(/\s+—\s+(Музей|Русская цивилизация)[\s\S]*$/, ''), h1 && strip(h1)].filter(Boolean);
};
const nahodki = [];
let vsego = 0;
for (const museum of fs.readdirSync(DAYS).sort()) {
  let dated = true;
  try { dated = JSON.parse(fs.readFileSync(`src/data/calendar-meta-${museum}.json`, 'utf8')).dated !== false; } catch {}
  if (!dated) continue;
  for (const f of fs.readdirSync(path.join(DAYS, museum)).filter((x) => /^\d\d-\d\d\.json$/.test(x)).sort()) {
    const key = f.slice(0, 5);
    const d = JSON.parse(fs.readFileSync(path.join(DAYS, museum, f), 'utf8'));
    vsego++;
    const polya = [['название', d.title], ['хук', d.hook]];
    const fp = path.join(FULL, museum, `${key}.html`);
    if (fs.existsSync(fp)) for (const h of pageHead(fs.readFileSync(fp, 'utf8'))) polya.push(['заголовок страницы', h]);
    for (const [pole, t] of polya) {
      const r = rashozhdenie(t, key);
      if (r) nahodki.push(`${museum}/${key} — ${pole}: «${r}» — ${String(t).slice(0, 120)}`);
    }
  }
}
const strogo = process.env.DATA_DNYA_STROGO === '1';
console.log(`data-dnya: дней ${vsego}, находок «дата события ≠ дата дня» ${nahodki.length}${strogo ? '' : ' (режим отчёта)'}`);
for (const n of nahodki) console.log('  ' + n);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
  `### data-dnya — дата события ≠ дата дня: ${nahodki.length}\n\n${nahodki.map((n) => '- ' + n).join('\n')}\n`);
process.exit(strogo && nahodki.length ? 1 : 0);
