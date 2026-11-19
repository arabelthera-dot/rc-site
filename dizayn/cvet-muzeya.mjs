// Р713 п.94: цвет музея одной командой. Источник — dizayn/cvet-muzeev.json (одна запись на музей),
// команда раскладывает его по стилям сайта и константам роликов. Запуск из корня rc-site:
//   node dizayn/cvet-muzeya.mjs <slug>|--vse [--rolik <папка rc-rolik>] [--suho]
// --suho — только показать, что поменялось бы. На нынешних значениях команда пишет те же байты.
// Вид записи в файле сохраняется: было var(--cvet-<hex>[-aNN]) — пишется так же (если в dizayn/tablica.json
// есть такая переменная), было #hex или rgba(…) — пишется #hex или rgba(…).
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const suho = flag('--suho');
const rolikDir = opt('--rolik');
const slug = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--rolik');
if (!slug && !flag('--vse')) {
  console.error('нужно: node dizayn/cvet-muzeya.mjs <slug>|--vse [--rolik <папка rc-rolik>] [--suho]');
  process.exit(2);
}

const ist = JSON.parse(fs.readFileSync('dizayn/cvet-muzeev.json', 'utf8'));
const tokeny = JSON.parse(fs.readFileSync('dizayn/tablica.json', 'utf8')).cvet ?? {};
const muzei = flag('--vse') ? Object.keys(ist.muzei) : [slug];
for (const m of muzei) if (!ist.muzei[m]) { console.error(`нет музея «${m}» в dizayn/cvet-muzeev.json`); process.exit(2); }

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const dolya = (nn) => String(nn / 100).replace(/^0/, '');

// «akcent@14» → { hex: '#c9a84c', alfa: 14 }
function cvet(cveta, spec) {
  const [kl, a] = spec.split('@');
  const hex = cveta[kl]?.toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(hex ?? '')) throw new Error(`цвет «${kl}» не задан как #rrggbb`);
  return { hex, alfa: a === undefined ? undefined : Number(a) };
}

// новое значение в том же виде, что было
function zapis(bylo, { hex, alfa }) {
  const syroe = alfa === undefined ? hex : `rgba(${rgb(hex).join(',')},${dolya(alfa)})`;
  if (/^var\(--cvet-/.test(bylo)) {
    const imya = hex.slice(1) + (alfa === undefined ? '' : `-a${alfa}`);
    return tokeny[imya] ? `var(--cvet-${imya})` : syroe;
  }
  return syroe;
}

function zamenit(tekst, re, kak, gde) {
  const vse = [...tekst.matchAll(re)];
  if (vse.length !== 1) throw new Error(`${gde}: найдено ${vse.length} мест, нужно ровно одно`);
  const x = vse[0];
  const novoe = kak(x);
  return tekst.slice(0, x.index) + novoe + tekst.slice(x.index + x[0].length);
}

function css(tekst, mesto, cveta) {
  const nachalo = new RegExp(`(^|\\n)[ \\t]*${esc(mesto.blok)}[ \\t]*\\{`, 'g');
  const n = [...tekst.matchAll(nachalo)];
  if (n.length !== 1) throw new Error(`${mesto.fayl}: блок «${mesto.blok}» найден ${n.length} раз`);
  const ot = n[0].index + n[0][0].length;
  const do_ = tekst.indexOf('}', ot);
  let blok = tekst.slice(ot, do_);
  for (const [per, spec] of Object.entries(mesto.peremennye)) {
    const re = new RegExp(`(^|[;{\\s])(${esc(per)}:)([^;]+);`, 'g');
    blok = zamenit(blok, re, (x) => `${x[1]}${x[2]}${zapis(x[3].trim(), cvet(cveta, spec))};`, `${mesto.fayl} ${mesto.blok} ${per}`);
  }
  return tekst.slice(0, ot) + blok + tekst.slice(do_);
}

function konstanty(tekst, mesto, cveta) {
  for (const [imya, spec] of Object.entries(mesto.konstanty)) {
    const re = new RegExp(`(const ${esc(imya)} = )'([^']*)'`, 'g');
    tekst = zamenit(tekst, re, (x) => `${x[1]}'${cvet(cveta, spec).hex}'`, `${mesto.fayl} ${imya}`);
  }
  return tekst;
}

let izm = 0;
function razlozhit(koren, mesta, cveta, sposob) {
  const po = new Map();
  for (const mesto of mesta) {
    const f = path.join(koren, mesto.fayl);
    const tekst = po.get(f) ?? fs.readFileSync(f, 'utf8');
    po.set(f, sposob(tekst, mesto, cveta));
  }
  for (const [f, novyy] of po) {
    const staryy = fs.readFileSync(f, 'utf8');
    if (novyy === staryy) { console.log(`без изменений  ${f}`); continue; }
    izm++;
    console.log(`${suho ? 'изменился бы' : 'изменён     '}  ${f}`);
    if (!suho) fs.writeFileSync(f, novyy);
  }
}

try {
  for (const m of muzei) razlozhit('.', ist.muzei[m].mesta, ist.muzei[m].cveta, css);
  if (rolikDir) razlozhit(rolikDir, ist.roliki.mesta, ist.roliki.cveta, konstanty);
} catch (e) {
  console.error(`ошибка: ${e.message}`);
  process.exit(1);
}
console.log(`итого файлов с изменениями: ${izm}`);
