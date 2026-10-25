// «У каждой игры есть инструкция» (Р199, Р201, 23.10.2026; стандарт museum-core 04-build §5-бис): страница дня с игрой
// без блока «Как играть» — ошибка. Игра на странице — в src/data/full-pages/<музей>/ММ-ДД.html (карточки дней
// src/content/days игр не выводят): секция/блок с id games, game, game-…, …-game, igra…, атрибут data-game/data-game-section
// или игровой <canvas> (id/aria-label со словом game/«игр»). Инструкция — блок data-igra-pravila (контракт Р201):
// непустой список ol.igra-pravila-shagi, блок стоит ПОСЛЕ сцены игры (первая картинка игры — canvas, svg, img
// или data-igra-scena — от начала игры), подключён assets/igra-pravila.css. Картинка видна сразу (Р201): кнопка
// «Начать» (data-igra-start), «Правила» (data-igra-pravila-open), замок data-igra-ozhidaet и
// assets/igra-pravila.js (удалён) — ошибка.
// Несколько игр на странице (r278, 25.10.2026): если игры подписаны «Игра 1 ·», «Игра 2 ·»… (заголовок h2/h3, кроме
// викторины #quiz и «Как поступил бы ты» #fork), инструкция нужна КАЖДОЙ — внутри своей игры (от её заголовка до
// следующей игры или конца её секции), под её картинкой. Без подписанных игр — одна игра на страницу, как раньше.
// День, который сайт собирает из анкеты (src/content/days/<музей>/ММ-ДД.json с body), проверяется по анкете, не по html.
// Режимы: по всему сайту — отчёт «инструкция есть N из M» по музеям (лог, сводка шага, /tmp/igra-pravila/otchet.md),
// без падения; по страницам, изменённым в заявке (git diff с базой), — код выхода 1 (на main ~82 игры без
// инструкции — чинятся по одной). Запуск: node scripts/igra-pravila.mjs [--proba] [--baza origin/main].
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { assemble } from '../src/lib/anketa.mjs';

const FULL = 'src/data/full-pages';
const DAYS = 'src/content/days';
const IGRA_ID = /<(?:section|div)\b[^>]*\bid=["'](?:games?|game-[\w-]+|[\w-]+-game|igra[\w-]*)["']/i;
const IGRA_ATTR = /<[a-z][^>]*\sdata-game(?:-section)?(?=[\s=>])/i;
const IGRA_CANVAS = /<canvas\b[^>]*\b(?:id|aria-label)=["'][^"']*(?:game|[Ии]гр)/;

// Заголовок подписанной игры: «Игра 2 · …», «⏱ Игра 3 · …».
const IGRA_H = /<h[23]\b[^>]*>[^<\p{L}]{0,6}Игра\s+\d+\b/giu;

export function estIgra(html) {
  return IGRA_ID.test(html) || IGRA_ATTR.test(html) || IGRA_CANVAS.test(html) || podpisannye(html).length > 0;
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

// Секция, внутри которой стоит позиция i: [начало, конец] или null.
function sekciya(html, i) {
  for (const m of [...html.slice(0, i).matchAll(/<section\b[^>]*>/gi)].reverse()) {
    const kon = m.index + element(html, m.index).length;
    if (kon > i) return { i: m.index, kon, open: m[0] };
  }
  return null;
}
// Подписанные игры: [{ nazv, i, kon }] — от заголовка до следующей игры или конца её секции; викторина и развилка — не игры.
function podpisannye(html) {
  const h = [...html.matchAll(IGRA_H)].map((m) => ({ i: m.index, s: sekciya(html, m.index) }))
    .filter((x) => !(x.s && /\bid=["'](?:quiz|fork)["']/i.test(x.s.open)));
  return h.map((x, k) => ({
    nazv: tekst(element(html, x.i)).slice(0, 60),
    i: x.i,
    kon: Math.min(h[k + 1]?.i ?? html.length, x.s?.kon ?? html.length),
  }));
}

const IGRA_NACHALO = new RegExp([IGRA_ID, IGRA_ATTR, IGRA_CANVAS].map((r) => r.source).join('|'), 'i');
const SCENA = /<(?:canvas|svg|img)\b|<[a-z][^>]*\sdata-igra-scena(?=[\s=>])/i;

// Инструкция одной игры в [ot, do_) html: [] — на месте. n — начало игры (от него ищется сцена), pre — приставка ошибки.
function pravilaIgry(bez, n, ot, do_, pre) {
  const starts = [...bez.slice(ot, do_).matchAll(/<[a-z][^>]*\sdata-igra-pravila(?=[\s=>])[^>]*>/gi)];
  if (!starts.length) return [pre + 'нет блока data-igra-pravila'];
  const shagiEst = (b) => [...b.matchAll(/<ol\b[^>]*class=["'][^"']*\bigra-pravila-shagi\b[^>]*>/gi)]
    .some((m) => [...element(b, m.index).matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].some((li) => tekst(li[1])));
  const bloki = starts.map((m) => ({ i: ot + m.index, html: element(bez, ot + m.index) })).filter((b) => shagiEst(b.html));
  if (!bloki.length) return [pre + 'пустой или нет ol.igra-pravila-shagi'];
  // Сцена — первая картинка игры от начала игры; правила — под ней, не над ней (Р201).
  const s = n < 0 ? -1 : bez.slice(n, do_).search(SCENA);
  const scena = s < 0 ? -1 : n + s;
  if (scena >= 0 && !bloki.some((b) => b.i > scena)) return [pre + 'блок «Как играть» стоит над картинкой игры — нужен под ней'];
  return [];
}

// Сколько игр на странице: подписанные «Игра N» или одна.
export function chisloIgr(html) {
  return podpisannye(html.replace(/<!--[\s\S]*?-->/g, '')).length || 1;
}

// Что не так с инструкциями страницы: [] — всё на месте.
export function oshibkiPravil(html) {
  const bez = html.replace(/<!--[\s\S]*?-->/g, '');
  const igry = podpisannye(bez);
  const o = igry.length
    ? igry.flatMap((g) => pravilaIgry(bez, g.i, g.i, g.kon, `«${g.nazv}»: `))
    : pravilaIgry(bez, bez.search(IGRA_NACHALO), 0, bez.length, '');
  if (/<[a-z][^>]*\sdata-igra-start(?=[\s=>])/i.test(bez)) o.push('есть кнопка «Начать» (data-igra-start) — картинка игры должна работать сразу');
  if (/<[a-z][^>]*\sdata-igra-pravila-open(?=[\s=>])/i.test(bez)) o.push('есть кнопка «Правила» (data-igra-pravila-open) — правила и так видны под картинкой');
  if (/\sdata-igra-ozhidaet(?=[\s=>])/i.test(bez)) o.push('игра спрятана до старта (data-igra-ozhidaet)');
  if (!/<link\b[^>]*href=["'][^"']*assets\/igra-pravila\.css["']/i.test(bez)) o.push('не подключён assets/igra-pravila.css');
  if (/<script\b[^>]*src=["'][^"']*assets\/igra-pravila\.js["']/i.test(bez)) o.push('подключён удалённый assets/igra-pravila.js');
  return o;
}

if (process.argv.includes('--proba')) {
  const ok = '<link rel="stylesheet" href="../../assets/igra-pravila.css">';
  const pravila = (shagi) => `<div class="igra-pravila" data-igra-pravila><h2>Как играть</h2><ol class="igra-pravila-shagi">${shagi}</ol></div>`;
  const igra = (do_, posle) => `<section id="games"><h2>Игра</h2>${do_}<button>Жми</button><canvas></canvas>${posle}</section>`;
  const blok = (shagi) => igra('', pravila(shagi));
  const proba = [
    ['игра по id games', '<section class="block" id="games"><h2>x</h2></section>', true],
    ['игра game-trajectory', '<section id="game-trajectory">', true],
    ['игра data-game-section', '<section class="s" data-game-section>', true],
    ['игровой холст', '<canvas id="geomCanvas" aria-label="Игра на различение">', true],
    ['декоративный холст — не игра', '<canvas id="heroCvs" class="hero-particles">', false],
    ['викторина — не игра', '<section id="quiz">', false],
    ['data-game-slot — не игра', '<section data-game-slot hidden>', false],
    ['подписанная игра без id', '<section id="assemble"><h2>Игра 2 · Собери тракт</h2></section>', true],
    ['«Игра 1» в викторине — не игра', '<section id="quiz"><h3>Игра 1 · Вопрос</h3></section>', false],
  ];
  const pravilaProba = [
    ['всё на месте: правила под картинкой', ok + blok('<li><b>Нажми</b> — увидишь.</li>'), 0],
    ['нет блока', ok + '<section id="games"></section>', 1],
    ['пустые шаги', ok + blok('<li> </li>'), 1],
    ['правила над картинкой', ok + igra(pravila('<li>шаг</li>'), ''), 1],
    ['декоративная картинка до игры не в счёт', ok + '<img src="hero.jpg">' + pravila('<li>шаг</li>') + igra('', ''), 1],
    ['холст-игра, правила под ним', ok + '<canvas id="game1"></canvas>' + pravila('<li>шаг</li>'), 0],
    ['есть «Начать»', ok + blok('<li>шаг</li>') + '<button data-igra-start>Начать</button>', 1],
    ['есть «Правила»', ok + igra('<button data-igra-pravila-open>Правила</button>', pravila('<li>шаг</li>')), 1],
    ['игра спрятана до старта', ok + blok('<li>шаг</li>').replace('id="games"', 'id="games" data-igra-ozhidaet'), 1],
    ['не подключён css', blok('<li>шаг</li>'), 1],
    ['подключён удалённый js', ok + '<script src="../../assets/igra-pravila.js" defer></script>' + blok('<li>шаг</li>'), 1],
    ['блок в комментарии не в счёт', ok + '<!--' + blok('<li>шаг</li>') + '-->', 1],
    ['две игры, правила у обеих', ok + igra('<h2>Игра 1 · А</h2>', pravila('<li>шаг</li>'))
      + '<section id="b"><h2>Игра 2 · Б</h2><div></div>' + pravila('<li>шаг</li>') + '</section>', 0],
    ['две игры, у второй нет правил (r278)', ok + igra('<h2>Игра 1 · А</h2>', pravila('<li>шаг</li>'))
      + '<section id="b"><h2>Игра 2 · Б</h2><div></div></section>', 1],
    ['три игры в одной секции, правила только у первой', ok + '<section id="games"><div class="gm"><h3>🎛 Игра 1 · А</h3><canvas></canvas>'
      + pravila('<li>шаг</li>') + '</div><div class="gm"><h3>📡 Игра 2 · Б</h3><canvas></canvas></div><div class="gm"><h3>⏱ Игра 3 · В</h3></div></section>', 2],
    ['правила второй игры над её картинкой', ok + igra('<h2>Игра 1 · А</h2>', pravila('<li>шаг</li>'))
      + '<section id="b"><h2>Игра 2 · Б</h2>' + pravila('<li>шаг</li>') + '<canvas></canvas></section>', 1],
    ['правила после секции игры — не её', ok + '<section id="b"><h2>Игра 1 · Б</h2><canvas></canvas></section>' + pravila('<li>шаг</li>'), 1],
  ];
  let bad = 0;
  for (const [n, h, zhdu] of proba) if (estIgra(h) !== zhdu) { bad++; console.error(`проба «${n}»: игра=${!zhdu}, ждали ${zhdu}`); }
  for (const [n, h, zhdu] of pravilaProba) {
    const o = oshibkiPravil(h);
    if (o.length !== zhdu) { bad++; console.error(`проба «${n}»: ошибок ${o.length} (${o.join('; ')}), ждали ${zhdu}`); }
  }
  if (bad) process.exit(1);
  console.log(`igra-pravila: пробы ${proba.length + pravilaProba.length} из ${proba.length + pravilaProba.length}`);
  process.exit(0);
}

// Что сайт показывает за день: анкета с body (src/content/days) — её сборка, иначе html из full-pages.
function stranica(m, key) {
  const j = path.join(DAYS, m, `${key}.json`);
  if (fs.existsSync(j)) {
    const d = JSON.parse(fs.readFileSync(j, 'utf8'));
    if (d.body && d.doc) return { html: assemble(d), ist: j };
  }
  const f = path.join(FULL, m, `${key}.html`);
  return fs.existsSync(f) ? { html: fs.readFileSync(f, 'utf8'), ist: f } : null;
}

// Все страницы: отчёт по музеям (счёт — по играм).
const muzei = fs.readdirSync(FULL).filter((m) => fs.statSync(path.join(FULL, m)).isDirectory()).sort();
const schet = {}, bez = [];
for (const m of muzei) {
  for (const f of fs.readdirSync(path.join(FULL, m)).filter((x) => x.endsWith('.html')).sort()) {
    const { html } = stranica(m, f.slice(0, -5));
    if (!estIgra(html)) continue;
    const s = (schet[m] ??= { est: 0, vsego: 0 });
    const vsego = chisloIgr(html), o = oshibkiPravil(html);
    const plohih = Math.min(vsego, new Set(o.map((x) => x.split(': ')[0])).size);
    s.vsego += vsego;
    s.est += vsego - plohih;
    if (o.length) bez.push(`${m}/${f}`);
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
  izm.push(...execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', `${baza}...HEAD`, '--', DAYS], { encoding: 'utf8' })
    .split('\n').filter((f) => f.endsWith('.json')).map((f) => path.join(FULL, path.basename(path.dirname(f)), path.basename(f, '.json') + '.html')));
  izm = [...new Set(izm)];
} catch (e) {
  console.log(`::warning::igra-pravila: нет базы ${baza} — изменённые страницы не проверены`);
  process.exit(0);
}
const krasnye = [];
for (const f of izm) {
  const st = stranica(path.basename(path.dirname(f)), path.basename(f, '.html'));
  if (!st || !estIgra(st.html)) continue;
  const o = oshibkiPravil(st.html);
  if (o.length) krasnye.push(`${st.ist}: ${o.join('; ')}`);
}
console.log(`igra-pravila: изменено в заявке страниц ${izm.length}, с игрой без инструкции ${krasnye.length}`);
if (krasnye.length) {
  for (const k of krasnye) console.log(`::error::${k} — у игры нет инструкции «Как играть» (Р199, Р201, 04-build §5-бис; разметка — в шапке public/assets/igra-pravila.css)`);
  process.exit(1);
}
