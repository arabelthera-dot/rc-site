// Капсула рендера живой страницы дня — доводка капсулы сверки до полного аналога ручной ночи r832
// (Сергей 24.11.2026: «доводи до ума, потом приступим дальше»).
// Признаки рендера A–E считаются детерминированно, БЕЗ модели. Но (Сергей 25.11.2026, Р627) это не
// вердикт машины, а «ПОДОЗРЕНИЕ — смотри глазами»: печатаются читаемым листом по дням и код выхода не
// меняют. Машина роняет только на базе: шаблон дня есть и читается, страница зеркала открывается.
//   A  игра заявлена (igra.imya/vtoraya), а выводить её нечем (ни rc3d, ни model3d, ни mehanika+dannye) —
//      блок игры не выведется вовсе;
//   B  в живом HTML лишний раздел вне образца: sendChat, quiz-igry, hero-canvas;
//   C  в живом HTML «— http…» голым текстом (не <a href>);
//   D  pervenstvo.stroki пустой [] — таблица «Где/Что/Когда» без строк;
//   E  score.awards.q длиной не 2 — не пара [раз, по сколько].
// Сверх того у дня с рендер-условием игры (3D/механика) проверяется, что в живом HTML есть id="games".
//
// Запуск: node scripts/sverka/kapsula-render.mjs <музей> [ММ-ДД …]
//   Выход — читаемый лист по дням (stdout), сводка — на stderr. Код 1 — только базовые ошибки.
import fs from 'node:fs';
import YAML from 'yaml';

const KOREN = new URL('../..', import.meta.url).pathname;
const SHABLON = (m) => `${KOREN}src/content/dni-shablon/${m}`;
const ZERKALO = 'https://arabelthera-dot.github.io/rc-site';

const [muzey, ...dni] = process.argv.slice(2);
if (!muzey) {
  console.error('капсула-рендер: музей не указан. Запуск: node scripts/sverka/kapsula-render.mjs <музей> [ММ-ДД …]');
  process.exit(2);
}

// Дни музея: переданные даты или все yaml-шаблоны музея.
const dir = SHABLON(muzey);
let spisok = dni;
if (!spisok.length) {
  spisok = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith('.yaml')).map((f) => f.slice(0, 5)).sort()
    : [];
  if (!spisok.length) {
    console.error(`капсула-рендер: у музея ${muzey} нет yaml-шаблонов (${dir})`);
    process.exit(2);
  }
}

// Условие рендера блока игры: 3D-сцена (rc3d), 3D-модель (model3d) или игра на данных (mehanika+dannye).
// Все три пути в DenIzobreteniya.astro / IgraRamka дают в живом HTML id="games".
const est3d = (g) => !!(g?.rc3d || g?.model3d);
const dannymi = (g) => !!(g?.mehanika && g?.dannye);

// ——— признаки A/D/E по yaml → подозрения (смотри глазами, не роняют) ———
function priznakiYaml(y) {
  const pod = [];
  const g = y.igra;
  // A — игра заявлена (imya/vtoraya), а выводить её нечем: нет ни 3D, ни механики на данных.
  if (g && (g.imya || g.vtoraya) && !est3d(g) && !dannymi(g)) {
    pod.push(`игра «${g.imya || g.vtoraya}» заявлена, но не выведется (нет 3D и нет механики на данных)`);
  }
  // E — награда за вопросы должна быть парой [раз, по сколько].
  const q = y.score?.awards?.q;
  if (Array.isArray(q) && q.length !== 2) pod.push(`score.awards.q длиной ${q.length} (не пара [раз, по сколько]): ${JSON.stringify(q)}`);
  // D — таблица первенства «Где/Что/Когда» есть (kolonki), а строк нет.
  const stroki = y.pervenstvo?.stroki;
  if (Array.isArray(stroki) && stroki.length === 0) pod.push('таблица «Где/Что/Когда» пустая (pervenstvo.stroki = [])');
  return pod;
}

// ——— признаки A-сверх/B/C по живому HTML зеркала → подозрения ———
function priznakiRendera(html, y) {
  const pod = [];
  const g = y.igra;
  // A-сверх — рендер-условие игры есть, но блока с id="games" в живом HTML нет: поломка рендера.
  if (g && (est3d(g) || dannymi(g)) && !/id="games"/.test(html)) {
    pod.push(`игра «${g.imya || g.mehanika}» должна выводиться, но в живом HTML нет id="games"`);
  }
  // C — «— http…» голым текстом, а не ссылкой <a href> (макрос обязан оборачивать адрес).
  if (/—\s*https?:\/\//i.test(html)) {
    pod.push('адрес источника голым текстом («— http…», не <a href>)');
  }
  // B — лишний раздел вне образца.
  for (const m of ['sendChat', 'quiz-igry', 'hero-canvas']) {
    if (html.includes(m)) pod.push(`лишний раздел вне образца: ${m}`);
  }
  return pod;
}

let oshibok = 0;      // база: шаблон/страница
let podozrenij = 0;   // A–E — смотри глазами
let net = 0;

for (const d of spisok) {
  const f = `${dir}/${d}.yaml`;
  if (!fs.existsSync(f)) {
    console.log(`${d}: ошибка — нет yaml-шаблона`);
    oshibok++;
    continue;
  }
  let y;
  try {
    y = YAML.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    console.log(`${d}: ошибка — yaml не читается: ${e.message}`);
    oshibok++;
    continue;
  }
  const pod = [...priznakiYaml(y)];
  let estBase = false;
  try {
    const r = await fetch(`${ZERKALO}/muzei/${muzey}/den/${d}/`, { redirect: 'follow' });
    if (r.ok) {
      pod.push(...priznakiRendera(await r.text(), y));
    } else {
      console.log(`${d}: ошибка — зеркало вернуло ${r.status}`);
      oshibok++;
      estBase = true;
    }
  } catch (e) {
    console.log(`${d}: ошибка — зеркало недоступно: ${e.message}`);
    oshibok++;
    net++;
    estBase = true;
  }
  if (pod.length) {
    console.log(`${d}:`);
    for (const s of pod) { console.log(`  подозрение: ${s}`); podozrenij++; }
  } else if (!estBase) {
    console.log(`${d}: рендер — чисто`);
  }
}

console.error(`капсула-рендер: ${muzey} — дней ${spisok.length}, подозрений ${podozrenij} (смотри глазами), базовых ошибок ${oshibok}${net ? `, зеркало недоступно у ${net}` : ''}`);
process.exit(oshibok ? 1 : 0);
