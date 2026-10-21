// Служебный текст на странице (опись Р84, А1 → машинная проверка №1, 21.10.2026).
// Посетитель не должен видеть внутренние пометки: рекламные «слоты», «появится после приёмки»,
// «реквизиты появятся», TODO/FIXME, lorem ipsum. Ищем в видимом тексте и в строках встроенных скриптов
// (тексты календаря подставляются из window.MUSEUM_CALENDAR_*). Код 1 — есть находки.
// Запуск: node scripts/sluzhebnyy-tekst.mjs --dist dist  |  --proba (проба на заведомых строках).
import fs from 'node:fs';
import path from 'node:path';

export const PRAVILA = [
  ['рекламный слот', /class="[^"]*\bad-slot\b|рекламн\S* (?:слот|сет)|продаётся напрямую|Такой слот/i],
  ['«после приёмки»', /(?:появ\S+|будет|откроется)[^<>"]{0,80}после[^<>"]{0,60}приёмк|после отдельной приёмки/i],
  ['«реквизиты появятся»', /реквизиты появятся/i],
  ['служебная метка', /\b(?:TODO|FIXME|TBD|XXX)\b|lorem ipsum|ЗАГЛУШКА|\[вставить|\{\{\s*\w+\s*\}\}/],
];

export function nayti(html) {
  const bezKommentariev = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  // JSON-LD и внешние скрипты без текста посетителю не показываются, но встроенные строки календаря — да.
  const tekst = bezKommentariev.replace(/<script[^>]*type="application\/ld\+json"[\s\S]*?<\/script>/gi, '');
  const out = [];
  for (const [imya, re] of PRAVILA) {
    const m = tekst.match(re);
    if (m) {
      const i = m.index;
      out.push(`${imya}: …${tekst.slice(Math.max(0, i - 40), i + 80).replace(/\s+/g, ' ')}…`);
    }
  }
  return out;
}

function* obhod(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* obhod(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

const args = process.argv.slice(2);
if (args.includes('--proba')) {
  const plohie = [
    '<div class="ad-slot billboard"><span>Реклама</span></div>',
    "window.MUSEUM_CALENDAR_EMPTY='Тема утверждена; страница появится после исследования, прав и музейной приёмки.'",
    '<p>Реквизиты появятся позже</p>',
    '<p>TODO: текст</p>',
  ];
  const horoshie = ['<p>Музей принял коллекцию после приёмки комиссией в 1925 году.</p>', '<!-- TODO внутри комментария -->'];
  let ok = true;
  for (const s of plohie) if (!nayti(s).length) { console.error('проба: не поймано:', s); ok = false; }
  for (const s of horoshie) if (nayti(s).length) { console.error('проба: ложная тревога:', s, nayti(s)); ok = false; }
  console.log(ok ? 'sluzhebnyy-tekst: проба зелёная' : 'sluzhebnyy-tekst: проба КРАСНАЯ');
  process.exit(ok ? 0 : 1);
}
const di = args.indexOf('--dist');
const dist = di >= 0 ? args[di + 1] : 'dist';
let n = 0, vsego = 0;
for (const f of obhod(dist)) {
  vsego++;
  const nahodki = nayti(fs.readFileSync(f, 'utf8'));
  if (nahodki.length) { n++; if (n <= 50) console.log(path.relative(dist, f) + '\n  ' + nahodki.join('\n  ')); }
}
console.log(`sluzhebnyy-tekst: страниц ${vsego}, со служебным текстом ${n}`);
process.exit(n ? 1 : 0);
