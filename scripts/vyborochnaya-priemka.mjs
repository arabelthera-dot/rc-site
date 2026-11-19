// Выборочная приёмка месяца (п. 50 очереди 0, Р348, «да» — Р681): машина проверяет все дни (форма дня в
// src/content.config.ts и src/lib/dni-shablon.mjs, сборка), человек читает случайную выборку.
// Размер выборки — по ISO 2859-1 (одиночный план, нормальный контроль, общий уровень II), подробно — docs/vyborochnaya-priemka.md.
// НЕ проверка: сборка и CI это не вызывают, запуск только руками.
//   node scripts/vyborochnaya-priemka.mjs <музей> <ММ> [--aql 2.5] [--data ГГГГ-ММ-ДД]
// Готовый день — карточка src/content/dni-shablon/<музей>/ММ-ДД.yaml с `adres: den` (живая страница)
// или src/content/days/<музей>/ММ-ДД.json со `status: gotov`. Зерно жребия — дата (по умолчанию сегодня по Москве):
// тот же музей, месяц и дата дают ту же выборку.
import fs from 'node:fs';
import path from 'node:path';

const SAJT = 'https://russian-civilization.ru';

// ISO 2859-1, таблица 1: объём партии → буква кода, общий уровень контроля II.
const BUKVY = [[8, 'A'], [15, 'B'], [25, 'C'], [50, 'D'], [90, 'E'], [150, 'F'], [280, 'G'], [500, 'H'], [1200, 'J'], [3200, 'K']];
// Таблица 2-A: объём выборки по букве.
const OBEM = { A: 2, B: 3, C: 5, D: 8, E: 13, F: 20, G: 32, H: 50, J: 80, K: 125 };
// Таблица 2-A, столбцы AQL по буквам A…K: [Ac, Re]; 'v' — взять первый план ниже стрелки, '^' — первый выше.
const AQL = {
  '1.0': ['v', 'v', 'v', 'v', [0, 1], '^', 'v', [1, 2], [2, 3], [3, 4]],
  '1.5': ['v', 'v', 'v', [0, 1], '^', 'v', [1, 2], [2, 3], [3, 4], [5, 6]],
  '2.5': ['v', 'v', [0, 1], '^', 'v', [1, 2], [2, 3], [3, 4], [5, 6], [7, 8]],
  '4.0': ['v', [0, 1], '^', 'v', [1, 2], [2, 3], [3, 4], [5, 6], [7, 8], [10, 11]],
  '6.5': [[0, 1], '^', 'v', [1, 2], [2, 3], [3, 4], [5, 6], [7, 8], [10, 11], [14, 15]],
};
const LITERY = Object.keys(OBEM);

// План по объёму партии: { bukva, n, ac, re }; стрелка меняет и объём выборки, выборка больше партии — партия целиком.
export function plan(partiya, aql = '2.5') {
  const stolbec = AQL[aql];
  if (!stolbec) throw new Error(`AQL ${aql} нет в таблице; есть: ${Object.keys(AQL).join(', ')}`);
  const nashla = BUKVY.find(([do_]) => partiya <= do_);
  if (!nashla) throw new Error(`партия ${partiya} больше 3200 — вне таблицы`);
  let i = LITERY.indexOf(nashla[1]);
  while (!Array.isArray(stolbec[i])) i += stolbec[i] === 'v' ? 1 : -1;
  const [ac, re] = stolbec[i];
  return { bukva: nashla[1], bukvaPlana: LITERY[i], n: Math.min(OBEM[LITERY[i]], partiya), ac, re };
}

// Повторяемый жребий: зерно — строка (дата, музей, месяц) → FNV-1a → mulberry32.
function zhrebiy(stroka) {
  let a = 0x811c9dc5;
  for (const c of stroka) a = Math.imul(a ^ c.codePointAt(0), 0x01000193) >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function vybrat(dni, n, zerno) {
  const rnd = zhrebiy(zerno), v = [...dni].sort();
  for (let i = v.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [v[i], v[j]] = [v[j], v[i]]; }
  return v.slice(0, n).sort();
}

export function gotovyeDni(muzei, mesyac) {
  const dni = new Set(), ok = (f) => f.startsWith(`${mesyac}-`) && /^\d\d-\d\d\.(yaml|json)$/.test(f);
  const shablon = path.join('src/content/dni-shablon', muzei), days = path.join('src/content/days', muzei);
  if (fs.existsSync(shablon)) for (const f of fs.readdirSync(shablon).filter(ok))
    if (/^adres:\s*den\s*$/m.test(fs.readFileSync(path.join(shablon, f), 'utf8'))) dni.add(f.slice(0, 5));
  if (fs.existsSync(days)) for (const f of fs.readdirSync(days).filter(ok))
    if (JSON.parse(fs.readFileSync(path.join(days, f), 'utf8')).status === 'gotov') dni.add(f.slice(0, 5));
  return [...dni].sort();
}

const MESYACY = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MESYAC_IM = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const denRu = (k) => `${Number(k.slice(3))} ${MESYACY[Number(k.slice(0, 2)) - 1]}`;

function main(argv) {
  const opt = { aql: '2.5', data: new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' }) }, poz = [];
  for (let i = 0; i < argv.length; i++) argv[i].startsWith('--') ? (opt[argv[i].slice(2)] = argv[++i]) : poz.push(argv[i]);
  const [muzei, mesyac] = poz;
  if (!muzei || !/^(0[1-9]|1[0-2])$/.test(mesyac ?? '') || !/^\d{4}-\d\d-\d\d$/.test(opt.data)) {
    console.error('запуск: node scripts/vyborochnaya-priemka.mjs <музей> <ММ> [--aql 2.5] [--data ГГГГ-ММ-ДД]');
    return 2;
  }
  const m = JSON.parse(fs.readFileSync('src/data/museums.json', 'utf8')).museums.find((x) => x.slug === muzei);
  if (!m) { console.error(`музея ${muzei} нет в src/data/museums.json`); return 2; }
  const dni = gotovyeDni(muzei, mesyac);
  const mes = MESYAC_IM[Number(mesyac) - 1];
  console.log(`${m.title_ru}, ${mes}: готовых дней ${dni.length}.`);
  if (!dni.length) { console.log('Читать нечего.'); return 0; }
  const p = plan(dni.length, opt.aql), vyb = vybrat(dni, p.n, `${opt.data}|${muzei}|${mesyac}`);
  const strelka = p.bukvaPlana !== p.bukva ? `, по стрелке — план ${p.bukvaPlana}` : '';
  console.log(`ISO 2859-1, уровень II, нормальный контроль, AQL ${opt.aql}: буква ${p.bukva}${strelka}; читать ${p.n}, принять при ошибках не больше ${p.ac}, вернуть месяц при ${p.re} и больше.`);
  console.log(`Жребий: ${opt.data} (повтор — тот же --data).`);
  console.log('');
  for (const k of vyb) console.log(`${denRu(k)} — ${SAJT}/muzei/${muzei}/den/${k}/`);
  console.log('');
  const prinyat = p.ac ? `Ошибок ${p.ac} или меньше` : 'Ни одной ошибки';
  console.log(`${prinyat} — месяц принят. Ошибок ${p.re} и больше — месяц не принят: читать целиком, все готовые дни (${dni.length}).`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = main(process.argv.slice(2));
