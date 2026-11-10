#!/usr/bin/env node
// Типограф дня (п. 79 очереди 1): «ёлочки», тире, неразрывные пробелы, ё по словарю.
// Образец правил — Типограф Лебедева и typograf (https://github.com/typograf/typograf), ё — eyo-kernel (data/slovari/).
// Ручной инструмент, в CI не входит (Р627).
//
//   node scripts/tipograf.mjs <музей> <ММ-ДД> [ММ-ДД…]            — отчёт: что поменялось бы, файлы не трогаются
//   node scripts/tipograf.mjs <музей> <ММ-ДД> … --pravit          — правит черновик src/content/dni-shablon/<музей>/ММ-ДД.yaml
//   node scripts/tipograf.mjs … --otchet <файл.md>                — отчёт ещё и в файл
//
// Утверждённый день (есть src/data/utverzhdeno/<музей>/ММ-ДД.json) не правится и с --pravit: только отчёт-предложение
// «кавычки и тире» (остальные правила к нему не применяются).
// Правятся только текстовые значения: ссылки, пути, ключи и служебные поля пропускаются.
// Меняется только строка самого значения (через range узла yaml), соседние строки файла остаются байт в байт.
// Ударения сюда не входят: они только в тексте озвучки — src/data/spravochniki/udareniya.json, udar() в rc-rolik scripts/tts.py.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { parseDocument, visit, isScalar, isPair, Scalar } from 'yaml';

const NBSP = ' ';
const KOREN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PROPUSK_KLYUCHI = new Set(['muzei', 'key', 'adres', 'src', 'url', 'canonical', 'data_source', 'audioSrc', 'href',
  'width', 'height', 'type', '@type', '@context', 'god', 'mark', 'id', 'slug', 'license', 'file', 'poster', 'img']);

function zagruzitYo() {
  const tekst = zlib.gunzipSync(fs.readFileSync(path.join(KOREN, 'data/slovari/yo-safe.txt.gz'))).toString('utf8');
  const sl = new Map();
  const dobavit = (w) => {
    const tolkoMalaya = w.startsWith('_');
    w = w.replace(/^_/, '');
    const e = w.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
    sl.set(e, w);
    if (!tolkoMalaya && /^[а-яё]/.test(w)) sl.set(e[0].toUpperCase() + e.slice(1), w[0].toUpperCase() + w.slice(1));
  };
  for (let s of tekst.split(/\r?\n/)) {
    s = s.split('#')[0].trim();
    if (!s) continue;
    if (s.includes('(')) {
      const ch = s.split(/[(|)]/);
      for (let i = 1; i < ch.length - 1; i++) dobavit(ch[0] + ch[i]);
    } else dobavit(s);
  }
  return sl;
}

const KOROTKIE = 'в|во|с|со|к|ко|у|о|об|обо|и|а|но|на|по|за|от|до|из|не|ни|же|ли|бы|под|над|при|без|для|про|что|как';

// Каждое правило — [имя, функция]; порядок как в typograf: кавычки → тире → пробелы → ё.
function pravila(yo) {
  return [
    ['кавычки', (t) => {
      if (!/["«„]/.test(t)) return t;
      // Сначала прямые кавычки → «»; затем вложенные внутри «» → „“, как в typograf (common/punctuation/quote).
      const s = t.replace(/"/g, (_, i) => (i === 0 || /[\s(\[«„—–-]/.test(t[i - 1]) ? '«' : '»'));
      let glub = 0;
      return s.replace(/[«»„“]/g, (c) => {
        if (c === '«' || c === '„') return ++glub > 1 ? '„' : '«';
        return glub-- > 1 ? '“' : '»';
      });
    }],
    ['тире', (t) => t
      .replace(/(\S) +(?:-|--|–) +/g, `$1${NBSP}— `)
      .replace(/(\S) +— /g, `$1${NBSP}— `)
      .replace(/(^|[\s(])(\d{3,4})-(\d{2,4})(?=$|[\s,.;:)])/g, '$1$2–$3')],
    ['пробелы', (t) => t
      .replace(new RegExp(`(^|[\\s«„(])(${KOROTKIE}) (?=[^\\s—])`, 'giu'), `$1$2${NBSP}`)
      .replace(new RegExp(`(^|[\\s«„(])(${KOROTKIE}) (?=[^\\s—])`, 'giu'), `$1$2${NBSP}`)
      .replace(/(\d) (г\.|гг\.|год[а-я]*|век[а-я]*|км|м|мм|см|кг|т|тыс\.|млн|млрд|%)(?=$|[\s,.;:)»])/g, `$1${NBSP}$2`)
      .replace(/(№|§) (?=\d)/g, `$1${NBSP}`)
      .replace(/(^|[\s«(])([А-ЯЁ]\.) ?([А-ЯЁ]\.) ([А-ЯЁ][а-яё])/g, `$1$2${NBSP}$3${NBSP}$4`)],
    ['ё', (t) => t.replace(/[А-Яа-яЁё]+/g, (w) => (/[её]/i.test(w) && !/ё/i.test(w) ? (yo.get(w) ?? w) : w))],
  ];
}

const tekstovoe = (k, v) => !PROPUSK_KLYUCHI.has(k) && /[А-Яа-яЁё]/.test(v) && !/^(https?:|\/|\.\/)/.test(v);

function obrabotat(muzei, den, pravit, PR) {
  const fail = path.join(KOREN, 'src/content/dni-shablon', muzei, `${den}.yaml`);
  if (!fs.existsSync(fail)) return { den, oshibka: `нет файла ${path.relative(KOREN, fail)}` };
  const utv = fs.existsSync(path.join(KOREN, 'src/data/utverzhdeno', muzei, `${den}.json`));
  const src = fs.readFileSync(fail, 'utf8');
  const doc = parseDocument(src, { keepSourceTokens: true });
  const zameny = [];
  const schet = {};
  if (utv) PR = PR.filter(([imya]) => imya === 'кавычки' || imya === 'тире');
  visit(doc, {
    Pair(_, p) {
      if (!isScalar(p.value) || typeof p.value.value !== 'string') return;
      const k = isScalar(p.key) ? String(p.key.value) : '';
      const v = p.value.value;
      if (!tekstovoe(k, v)) return;
      let t = v;
      for (const [imya, f] of PR) {
        const n = f(t);
        if (n !== t) { schet[imya] = (schet[imya] ?? 0) + 1; t = n; }
      }
      if (t !== v) zameny.push({ k, staroe: v, novoe: t, uzel: p.value });
    },
  });
  // Пишем только single-line значения (plain и в кавычках); блочные (| и >) — только в отчёт.
  const pravki = [];
  for (const z of zameny) {
    const [a, b] = z.uzel.range;
    const blochnoe = z.uzel.type === Scalar.BLOCK_LITERAL || z.uzel.type === Scalar.BLOCK_FOLDED || src.slice(a, b).includes('\n');
    z.pisat = !blochnoe;
    if (!blochnoe) pravki.push([a, b, JSON.stringify(z.novoe)]);
  }
  let zapisano = false;
  if (pravit && !utv && pravki.length) {
    let out = src;
    for (const [a, b, s] of pravki.sort((x, y) => y[0] - x[0])) out = out.slice(0, a) + s + out.slice(b);
    fs.writeFileSync(fail, out);
    zapisano = true;
  }
  return { den, utv, zameny, schet, zapisano };
}

const vidno = (s) => s.replace(/ /g, '⍽');

const args = process.argv.slice(2);
const pravit = args.includes('--pravit');
const iO = args.indexOf('--otchet');
const otchetFail = iO >= 0 ? args[iO + 1] : null;
const svobodnye = args.filter((a, i) => !a.startsWith('--') && !(iO >= 0 && i === iO + 1));
const [muzei, ...dni] = svobodnye;
if (!muzei || !dni.length) {
  console.error('Запуск: node scripts/tipograf.mjs <музей> <ММ-ДД> [ММ-ДД…] [--pravit] [--otchet файл.md]');
  process.exit(2);
}
const PR = pravila(zagruzitYo());
const stroki = [`# Типограф: ${muzei}, ${dni.join(', ')}`, '', 'Знак ⍽ — неразрывный пробел. Утверждённые дни — только предложение, файлы не менялись.', ''];
let itogo = 0;
for (const den of dni) {
  const r = obrabotat(muzei, den, pravit, PR);
  if (r.oshibka) { stroki.push(`## ${den}: ${r.oshibka}`, ''); continue; }
  itogo += r.zameny.length;
  const sch = Object.entries(r.schet).map(([k, v]) => `${k} ${v}`).join(', ') || 'нет';
  const kak = r.utv ? 'утверждён — предложение' : r.zapisano ? 'черновик — исправлен' : 'черновик — отчёт';
  stroki.push(`## ${den} (${kak}): полей ${r.zameny.length}; по правилам: ${sch}`, '');
  for (const z of r.zameny) {
    stroki.push(`- \`${z.k}\`${z.pisat ? '' : ' (блочное поле — только руками)'}`, `  - было: ${z.staroe.replace(/\n/g, ' ')}`, `  - стало: ${vidno(z.novoe).replace(/\n/g, ' ')}`);
  }
  stroki.push('');
}
stroki.push(`Итого полей с правкой: ${itogo}.`);
const out = stroki.join('\n');
if (otchetFail) fs.writeFileSync(otchetFail, out + '\n');
console.log(otchetFail ? stroki.filter((s) => s.startsWith('## ') || s.startsWith('Итого')).join('\n') : out);
