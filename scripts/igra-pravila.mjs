// «У каждой игры есть инструкция» (Р199, 23.10.2026; стандарт museum-core 04-build §5-бис): страница дня с игрой
// без блока «Как играть» — ошибка. Игра на странице — в src/data/full-pages/<музей>/ММ-ДД.html (карточки дней
// src/content/days игр не выводят): секция/блок с id games, game, game-…, …-game, igra…, атрибут data-game/data-game-section
// или игровой <canvas> (id/aria-label со словом game/«игр»). Инструкция — блок data-igra-pravila (контракт Р199):
// непустой список ol.igra-pravila-shagi и кнопка data-igra-start внутри блока; на странице подключены
// assets/igra-pravila.css и assets/igra-pravila.js.
// Режимы: по всему сайту — отчёт «инструкция есть N из M» по музеям (лог, сводка шага, /tmp/igra-pravila/otchet.md),
// без падения; по страницам, изменённым в заявке (git diff с базой), — код выхода 1 (на main ~82 игры без
// инструкции — чинятся по одной). Запуск: node scripts/igra-pravila.mjs [--proba] [--baza origin/main].
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const FULL = 'src/data/full-pages';
const IGRA_ID = /<(?:section|div)\b[^>]*\bid=["'](?:games?|game-[\w-]+|[\w-]+-game|igra[\w-]*)["']/i;
const IGRA_ATTR = /<[a-z][^>]*\sdata-game(?:-section)?(?=[\s=>])/i;
const IGRA_CANVAS = /<canvas\b[^>]*\b(?:id|aria-label)=["'][^"']*(?:game|[Ии]гр)/;

export function estIgra(html) {
  return IGRA_ID.test(html) || IGRA_ATTR.test(html) || IGRA_CANVAS.test(html);
}

// Элемент с началом в i — до парного закрывающего тега (счёт вложенных одноимённых).
function element(html, i) {
  const tag = /^<([a-z0-9]+)/i.exec(html.slice(i))[1].toLowerCase();
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = i;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(i, re.lastIndex);
  }
  return html.slice(i);
}
const tekst = (t) => t.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|\s+/g, ' ').trim();

// Что не так с инструкцией страницы: [] — всё на месте.
export function oshibkiPravil(html) {
  const bez = html.replace(/<!--[\s\S]*?-->/g, '');
  const o = [];
  const starts = [...bez.matchAll(/<[a-z][^>]*\sdata-igra-pravila(?=[\s=>])[^>]*>/gi)];
  if (!starts.length) return ['нет блока data-igra-pravila'];
  const bloki = starts.map((m) => element(bez, m.index));
  const shagi = bloki.some((b) => [...b.matchAll(/<ol\b[^>]*class=["'][^"']*\bigra-pravila-shagi\b[^>]*>/gi)]
    .some((m) => [...element(b, m.index).matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].some((li) => tekst(li[1]))));
  if (!shagi) o.push('пустой или нет ol.igra-pravila-shagi');
  if (!bloki.some((b) => /<button\b[^>]*\sdata-igra-start(?=[\s=>])/i.test(b))) o.push('нет кнопки data-igra-start в блоке');
  if (!/<link\b[^>]*href=["'][^"']*assets\/igra-pravila\.css["']/i.test(bez)) o.push('не подключён assets/igra-pravila.css');
  if (!/<script\b[^>]*src=["'][^"']*assets\/igra-pravila\.js["']/i.test(bez)) o.push('не подключён assets/igra-pravila.js');
  return o;
}

if (process.argv.includes('--proba')) {
  const ok = '<link rel="stylesheet" href="../../assets/igra-pravila.css"><script src="../../assets/igra-pravila.js" defer></script>';
  const blok = (shagi, knopka = '<button type="button" class="igra-start" data-igra-start>Начать</button>') =>
    `<section id="games"><div class="igra-pravila" data-igra-pravila><h2>Как играть</h2><ol class="igra-pravila-shagi">${shagi}</ol>${knopka}</div><canvas></canvas></section>`;
  const proba = [
    ['игра по id games', '<section class="block" id="games"><h2>x</h2></section>', true],
    ['игра game-trajectory', '<section id="game-trajectory">', true],
    ['игра data-game-section', '<section class="s" data-game-section>', true],
    ['игровой холст', '<canvas id="geomCanvas" aria-label="Игра на различение">', true],
    ['декоративный холст — не игра', '<canvas id="heroCvs" class="hero-particles">', false],
    ['викторина — не игра', '<section id="quiz">', false],
    ['data-game-slot — не игра', '<section data-game-slot hidden>', false],
  ];
  const pravila = [
    ['всё на месте', ok + blok('<li><b>Нажми</b> — увидишь.</li>'), 0],
    ['нет блока', ok + '<section id="games"></section>', 1],
    ['пустые шаги', ok + blok('<li> </li>'), 1],
    ['нет «Начать»', ok + blok('<li>шаг</li>', ''), 1],
    ['кнопка вне блока не в счёт', ok + blok('<li>шаг</li>', '') + '<button data-igra-start>Начать</button>', 1],
    ['не подключены css и js', blok('<li>шаг</li>'), 2],
    ['блок в комментарии не в счёт', ok + '<!--' + blok('<li>шаг</li>') + '-->', 1],
  ];
  let bad = 0;
  for (const [n, h, zhdu] of proba) if (estIgra(h) !== zhdu) { bad++; console.error(`проба «${n}»: игра=${!zhdu}, ждали ${zhdu}`); }
  for (const [n, h, zhdu] of pravila) {
    const o = oshibkiPravil(h);
    if (o.length !== zhdu) { bad++; console.error(`проба «${n}»: ошибок ${o.length} (${o.join('; ')}), ждали ${zhdu}`); }
  }
  if (bad) process.exit(1);
  console.log(`igra-pravila: пробы ${proba.length + pravila.length} из ${proba.length + pravila.length}`);
  process.exit(0);
}

// Все страницы: отчёт по музеям.
const muzei = fs.readdirSync(FULL).filter((m) => fs.statSync(path.join(FULL, m)).isDirectory()).sort();
const schet = {}, bez = [];
for (const m of muzei) {
  for (const f of fs.readdirSync(path.join(FULL, m)).filter((x) => x.endsWith('.html')).sort()) {
    const html = fs.readFileSync(path.join(FULL, m, f), 'utf8');
    if (!estIgra(html)) continue;
    const s = (schet[m] ??= { est: 0, vsego: 0 });
    s.vsego++;
    if (oshibkiPravil(html).length) bez.push(`${m}/${f}`); else s.est++;
  }
}
const N = Object.values(schet).reduce((a, s) => a + s.est, 0), M = Object.values(schet).reduce((a, s) => a + s.vsego, 0);
const otchet = [`## igra-pravila — инструкция есть ${N} из ${M} игр`, '', '| музей | инструкция есть |', '|---|---|',
  ...Object.entries(schet).map(([m, s]) => `| ${m} | ${s.est} из ${s.vsego} |`), '',
  `Без инструкции (${bez.length}): ${bez.join(', ') || '—'}`, ''].join('\n');
console.log(otchet);
fs.mkdirSync('/tmp/igra-pravila', { recursive: true });
fs.writeFileSync('/tmp/igra-pravila/otchet.md', otchet);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, otchet + '\n');

// Страницы, изменённые в заявке, — строго.
const i = process.argv.indexOf('--baza');
const baza = i > 0 ? process.argv[i + 1] : process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main';
let izm;
try {
  izm = execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', `${baza}...HEAD`, '--', FULL], { encoding: 'utf8' })
    .split('\n').filter((f) => f.endsWith('.html'));
} catch (e) {
  console.log(`::warning::igra-pravila: нет базы ${baza} — изменённые страницы не проверены`);
  process.exit(0);
}
const krasnye = [];
for (const f of izm) {
  if (!fs.existsSync(f)) continue;
  const html = fs.readFileSync(f, 'utf8');
  if (!estIgra(html)) continue;
  const o = oshibkiPravil(html);
  if (o.length) krasnye.push(`${f}: ${o.join('; ')}`);
}
console.log(`igra-pravila: изменено в заявке страниц ${izm.length}, с игрой без инструкции ${krasnye.length}`);
if (krasnye.length) {
  for (const k of krasnye) console.log(`::error::${k} — у игры нет инструкции «Как играть» (Р199, 04-build §5-бис; разметка — в шапке public/assets/igra-pravila.css)`);
  process.exit(1);
}
