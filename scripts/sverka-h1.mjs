// Сверка «карточка дня ↔ полная страница» (19.10.2026). Коммит 81b9dff прикрепил к дням «Не сдаются» страницы
// соседнего дня — машина не поймала. Для каждого дня с legacy_page берётся <h1> (нет — <title> до первого « — »)
// полной страницы src/data/full-pages/<музей>/<ключ>.html и сверяется с title карточки по логике pageMatches
// из scripts/import-legacy.mjs: дата дня в заголовке (у датированного музея) или общее значимое слово от 4 букв
// с совпадением по основе (регистр, ё/е, кавычки не мешают). Своя большая страница нового сайта (файл full-pages
// у дня без legacy_page — так её и показывает src/integrations/full-pages.mjs) сверяется так же.
// Ошибки также: файл full-pages без карточки дня; legacy_page без файла full-pages.
// Запуск: node scripts/sverka-h1.mjs. Расхождения печатаются всегда; код выхода 1 — только при SVERKA_H1_STROGO=1;
// в .github/workflows/proverka.yml шаг ставит её сам, а роняет заявку лишь при переменной репозитория SVERKA_H1_STROGO=1
// (новое — выключенным, правило 28.09).
import fs from 'node:fs';
import path from 'node:path';

const DAYS = 'src/content/days', FULL = 'src/data/full-pages';
const MONR = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября',
  'ноября', 'декабря'];
const decode = (t) => t.replace(/&nbsp;/g, ' ').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
const strip = (t) => decode(t.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const lowWords = (t) => t.toLowerCase().replace(/ё/g, 'е').match(/[a-zа-я0-9]+/g) ?? [];
const sameStem = (a, b) => { const n = Math.max(4, Math.min(a.length, b.length) - 2);
  return a.length >= n && b.length >= n && a.slice(0, n) === b.slice(0, n); };

// Заголовок страницы — <title> (без хвоста «— Музей … — Русская цивилизация») и <h1>, как в pageHead импорта:
// у части страниц h1 — вопрос-хук, а имя дня стоит только в <title>.
function pageHead(html) {
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  return [t && strip(t).replace(/\s+—\s+(Музей|Русская цивилизация)[\s\S]*$/, ''), h1 && strip(h1)]
    .filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(' · ');
}
function matches(head, key, title, dated) {
  const date = `${parseInt(key.slice(3))} ${MONR[parseInt(key.slice(0, 2)) - 1]}`;
  if (dated && new RegExp(`(^|[^0-9])${date}`).test(head.toLowerCase().replace(/ё/g, 'е'))) return true;
  const name = title.match(/^«([^»]+)»\s+—\s/)?.[1] ?? title;
  const words = lowWords(head);
  // Значимое слово — от 4 букв или число от 3 цифр («872 дня»); в названии без таких слов («Мы») —
  // всё название целиком должно стоять в заголовке.
  const sig = lowWords(name).filter((w) => w.length >= 4 || /^\d{3,}$/.test(w));
  if (!sig.length) return words.join(' ').includes(lowWords(name).join(' '));
  return sig.some((w) => words.some((x) => (/^\d+$/.test(w) ? x === w : sameStem(x, w))));
}

const bad = [], orphans = [], missing = [];
let n = 0, own = 0;
for (const museum of fs.readdirSync(DAYS).sort()) {
  let dated = true;
  try { dated = JSON.parse(fs.readFileSync(`src/data/calendar-meta-${museum}.json`, 'utf8')).dated !== false; } catch {}
  const dir = path.join(FULL, museum);
  const files = new Set(fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^\d\d-\d\d\.html$/.test(f)).map((f) => f.slice(0, 5)) : []);
  for (const f of fs.readdirSync(path.join(DAYS, museum)).filter((f) => f.endsWith('.json')).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(DAYS, museum, f), 'utf8'));
    const key = d.key ?? f.replace(/\.json$/, '');
    const has = files.delete(key);
    if (d.legacy_page) n++; else if (has) own++; else continue;
    if (!has) { missing.push(`${museum}/${key}`); continue; }
    const head = pageHead(fs.readFileSync(path.join(dir, `${key}.html`), 'utf8'));
    if (!matches(head, key, d.title ?? '', dated)) bad.push([museum, key, d.title ?? '', head]);
  }
  for (const k of files) orphans.push(`${museum}/${k}.html`);
}

for (const [m, k, t, h] of bad) console.log(`РАСХОЖДЕНИЕ ${m} ${k}: карточка «${t}» ≠ страница «${h}»`);
for (const o of orphans) console.log(`БЕЗ ДНЯ ${o}: файл full-pages есть, карточки дня нет`);
for (const o of missing) console.log(`НЕТ ФАЙЛА ${o}: legacy_page есть, файла full-pages нет`);
const errs = bad.length + orphans.length + missing.length;
console.log(`sverka-h1: дней с legacy_page ${n}, своих страниц без legacy_page ${own}, расхождений ${bad.length}, без дня ${orphans.length}, без файла ${missing.length}`);
if (errs && process.env.SVERKA_H1_STROGO === '1') process.exit(1);
if (errs) console.log('sverka-h1: режим предупреждения (строго — SVERKA_H1_STROGO=1)');
