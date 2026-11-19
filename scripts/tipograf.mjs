// Типограф дня (пункт 79 очереди 1, Р718, 10.11.2026): «ёлочки», тире, неразрывные пробелы, ё по словарю,
// ударения — только в тексте для озвучки. Ручной инструмент: в сборку и CI не входит (Р627), зависимостей нет.
// Правила — по образцу Типографа Лебедева и typograf (npm, github.com/typograf/typograf): ru/punctuation/quote,
// ru/dash/main, ru/nbsp/afterShortWord, common/nbsp/beforeShortLastWord и т. п.; ё — по образцу eyo (github.com/e2yo/eyo):
// только «безопасные» слова, где е→ё однозначно (все/всё, небо/нёбо — не трогаем).
// Запуск:
//   node scripts/tipograf.mjs <файл.json|.md|.txt> …         — отчёт: что поменял бы (файлы не трогаются)
//   node scripts/tipograf.mjs --pravit <файл> …               — правит черновик; утверждённый день (есть
//        src/data/utverzhdeno/<музей>/ММ-ДД.json) не правится никогда, по нему — только отчёт «кавычки и тире»
//   node scripts/tipograf.mjs --ozvuchka <файл>               — текст для озвучки со знаками ударения (U+0301)
//        из udareniya.json (rolik-remotion), в stdout; на страницу не идёт
//   --muzey X ММ-ДД …  — вместо путей: src/content/days/X/ММ-ДД.json
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const KOREN = new URL('..', import.meta.url).pathname;
const NBSP = ' ';

// Поля, где не текст, а адреса и служебное: их не трогаем.
const NE_TEKST = new Set(['src', 'museum', 'key', 'source', 'url', 'href', 'id', 'n', 'metka', 'poryadok', 'credit']);

// Ё: однозначные слова (нижний регистр, без ё → с ё). Новое — строкой сюда; спорные (все, небо, узнаем) — нельзя.
const YO = Object.fromEntries(`ещё её зелёный зелёная лётчик лётчики лётчика полёт полёта полёты полёте самолёт самолёта
самолёты самолёте вертолёт вертолёта звездолёт ракетоплан учёный учёного учёные учёных учёным учёными учёному
партнёр отчёт отчёта расчёт расчёта расчёты счёт счёта подъём подъёма объём объёма приём приёма приёмник
четвёртый четвёртая четвёртого четвёртом трёх трёхсот четырёх ребёнок ребёнка тёмный тёмная тёплый тёплая
пришёл нашёл ушёл вошёл прошёл зашёл перешёл изобрёл произошёл шёл лёд льдом мёд жёлтый жёлтая чёрный чёрная
чёрного чёрное лёгкий лёгкая лёгкого твёрдый твёрдая берёза берёзы ёлка ёлки королёв королёва королёву
лётный лётная лётного взлёт взлёта взлётная перелёт перелёта вперёд налёт налёта шёлк шёлка сёла озёра
пулемёт пулемёта миномёт миномёта огнемёт отъезд`.split(/\s+/).filter((w) => w.includes('ё'))
  .map((w) => [w.replace(/ё/g, 'е'), w]));

const KOROTKIE = 'а|в|во|и|к|ко|о|об|с|со|у|на|не|ни|но|по|за|от|до|из|из-за|для|без|при|про|под|над|что|как|или|же|ли|бы|его|её|их|мы|он|она|оно|они|я|ты|то|это|тот|там|где|чем';

const pravila = [
  // кавычки: "…" → «…», внутри — „…“ (ru/punctuation/quote)
  ['кавычки', (t) => kavychki(t)],
  // тире: дефис или -- между пробелами → неразрывный пробел + «—» (ru/dash/main)
  ['тире', (t) => t.replace(/(\S)[  ]+(?:--?|–)[  ]+/g, `$1${NBSP}— `)],
  // тире в начале строки — прямая речь
  ['тире', (t) => t.replace(/^(?:--?|–) /gm, '— ')],
  // перед уже стоящим тире — неразрывный пробел (тире не уходит в начало строки)
  ['тире', (t) => t.replace(/(\S) —/g, `$1${NBSP}—`)],
  // диапазон годов 1941-1945 → 1941–1945 (ru/dash/years)
  ['тире', (t) => t.replace(/\b(1\d{3}|20\d\d)-(1\d{3}|20\d\d)\b/g, '$1–$2')],
  // после короткого слова — неразрывный пробел (ru/nbsp/afterShortWord)
  ['пробелы', (t) => t.replace(new RegExp(`(^|[\\s«„(])(${KOROTKIE}) (?=[^\\s—])`, 'gimu'), `$1$2${NBSP}`)],
  // число и сокращение/единица: 1939 г., 30 км, 5 т, № 7, § 3 (ru/nbsp/afterNumberSign, ru/nbsp/year)
  ['пробелы', (t) => t.replace(/(\d) (г\.|гг\.|в\.|вв\.|км|м|см|мм|кг|т|л|ч|мин|с|тыс\.|млн|млрд|руб\.|%)(?=[\s.,;:!?)»]|$)/g, `$1${NBSP}$2`)],
  ['пробелы', (t) => t.replace(/(№|§) (?=\d)/g, `$1${NBSP}`)],
  // инициалы: В. П. Борисов (ru/nbsp/initials)
  ['пробелы', (t) => t.replace(/(^|[^А-ЯЁа-яё])([А-ЯЁ]\.) ([А-ЯЁ]\.) ([А-ЯЁ][а-яё]+)/g, `$1$2${NBSP}$3${NBSP}$4`)],
  // двойные пробелы
  ['пробелы', (t) => t.replace(/ {2,}/g, ' ')],
  ['ё', (t) => t.replace(/[А-Яа-яЁё]+/g, (w) => {
    const v = YO[w.toLowerCase()];
    if (!v) return w;
    return w[0] === w[0].toUpperCase() ? v[0].toUpperCase() + v.slice(1) : v;
  })],
];

function kavychki(t) {
  // прямые и «лапки» “” → ёлочки; вложенные (внутри ёлочек) → „лапки“
  let s = t.replace(/[“”]/g, '"');
  s = s.replace(/(^|[\s(\[«„—-])"/g, '$1«').replace(/"/g, '»');
  let glub = 0, out = '';
  for (const ch of s) {
    if (ch === '«') { out += glub > 0 ? '„' : '«'; glub++; }
    else if (ch === '»') { glub = Math.max(0, glub - 1); out += glub > 0 ? '“' : '»'; }
    else out += ch;
  }
  return out;
}

export function tipograf(t, vidy = null) {
  let s = t;
  const sdelano = [];
  for (const [vid, f] of pravila) {
    if (vidy && !vidy.has(vid)) continue;
    const n = f(s);
    if (n !== s) sdelano.push(vid);
    s = n;
  }
  return { tekst: s, vidy: [...new Set(sdelano)] };
}

// Обход JSON дня: правит только текстовые поля, адреса не трогает.
function obhod(v, f, put = '') {
  if (typeof v === 'string') return /^https?:\/\//.test(v) ? v : f(v, put);
  if (Array.isArray(v)) return v.map((x, i) => obhod(x, f, `${put}[${i}]`));
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = NE_TEKST.has(k) ? x : obhod(x, f, put ? `${put}.${k}` : k);
    return o;
  }
  return v;
}

function utverzhdyon(fail) {
  const p = path.resolve(fail);
  if (p.includes('/src/data/utverzhdeno/')) return true; // сама копия утверждённого
  const m = p.match(/days\/([^/]+)\/(\d\d-\d\d)\.json$/);
  return m && fs.existsSync(path.join(KOREN, 'src/data/utverzhdeno', m[1], `${m[2]}.json`));
}

const pokaz = (s) => s.replace(/ /g, '⍽');

function udareniya() {
  const p = [path.join(os.homedir(), 'projects/russian-civilization/lab/rolik-remotion/udareniya.json'),
    path.join(KOREN, 'data/udareniya.json')].find((x) => fs.existsSync(x));
  if (!p) return {};
  return Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(p, 'utf8'))).filter(([k]) => k !== '_'));
}

function ozvuchka(fail) {
  const UD = udareniya();
  const tekst = fail.endsWith('.json')
    ? (() => { const out = []; obhod(JSON.parse(fs.readFileSync(fail, 'utf8')), (s) => (out.push(s), s)); return out.join('\n'); })()
    : fs.readFileSync(fail, 'utf8');
  return tipograf(tekst).tekst.replace(/ /g, ' ').replace(/[А-Яа-яЁё]+/g, (w) => {
    const v = UD[w.toLowerCase()];
    if (!v) return w;
    return w[0] === w[0].toUpperCase() ? v[0].toUpperCase() + v.slice(1) : v;
  });
}

function main() {
  const argv = process.argv.slice(2);
  const pravit = argv.includes('--pravit');
  const ozv = argv.includes('--ozvuchka');
  const mi = argv.indexOf('--muzey');
  const muzey = mi >= 0 ? argv[mi + 1] : null;
  let faily = argv.filter((a, i) => !a.startsWith('--') && !(mi >= 0 && i === mi + 1));
  if (muzey) faily = faily.map((k) => path.join(KOREN, 'src/content/days', muzey, `${k}.json`));
  if (!faily.length) { console.error('Запуск: node scripts/tipograf.mjs [--pravit|--ozvuchka] [--muzey X] файл|ММ-ДД …'); process.exit(2); }

  if (ozv) { for (const f of faily) process.stdout.write(ozvuchka(f) + '\n'); return; }

  let vsego = 0;
  for (const f of faily) {
    const utv = utverzhdyon(f);
    // по утверждённому — только «кавычки и тире», и только отчёт
    const vidy = utv ? new Set(['кавычки', 'тире']) : null;
    const izm = [];
    const fix = (s, put) => {
      const r = tipograf(s, vidy);
      if (r.tekst !== s) izm.push({ put, vidy: r.vidy, bylo: s, stalo: r.tekst });
      return r.tekst;
    };
    let novoe;
    if (f.endsWith('.json')) novoe = JSON.stringify(obhod(JSON.parse(fs.readFileSync(f, 'utf8')), fix), null, 2) + '\n';
    else novoe = fix(fs.readFileSync(f, 'utf8'), '');
    vsego += izm.length;
    const imya = path.relative(KOREN, path.resolve(f));
    console.log(`\n## ${imya} — ${utv ? 'утверждён: только предложение «кавычки и тире», файл не меняется' : 'черновик'} — правок: ${izm.length}`);
    for (const z of izm) console.log(`- ${z.put || '(текст)'} [${z.vidy.join(', ')}]\n  было:  ${pokaz(z.bylo).slice(0, 300)}\n  стало: ${pokaz(z.stalo).slice(0, 300)}`);
    if (pravit && !utv && izm.length) { fs.writeFileSync(f, novoe); console.log('  → файл поправлен'); }
  }
  console.log(`\nВсего правок: ${vsego} (⍽ — неразрывный пробел)`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
