// Капсула рендера живой страницы дня — доводка капсулы сверки до полного аналога ручной ночи r832
// (Сергей 24.11.2026: «доводи до ума, потом приступим дальше»; план logs/kapsula-render-progress.md).
// Капсула данных (scripts/sverka/kapsula-sverka.mjs) сверяет состав/порядок фактов и кадры; чего она не
// видит — рендер и карточку вне фактов. Эти признаки и ловит эта капсула БЕЗ модели, детерминированно:
//   A  игра заявлена (igra.imya/vtoraya), а рендер-условия нет (ни rc3d, ни model3d, ни mehanika+dannye) —
//      блок игры не выведется вовсе (DenIzobreteniya.astro: «Нет 3D — нет блока игры»). По yaml — точный;
//   B  в живом HTML лишний раздел вне образца: sendChat (чат «Спроси»), quiz-igry, hero-canvas — точный;
//   C  в живом HTML «— http…» голым текстом (не <a href>): макрос обязан оборачивать адрес в ссылку —
//      точный по живому (в yaml «— http…» — норма, его рендерит макрос);
//   D  pervenstvo.stroki пустой [] — таблица «Где/Что/Когда» без строк (yaml) — точный;
//   E  score.awards.q длиной не 2 — не пара [раз, по сколько] (yaml) — точный.
// A/D/E — по yaml, B/C — по живому HTML зеркала (fetch). Все — ошибкой (код выхода 1). Сверх того у дня с
// рендер-условием игры (3D/механика) проверяется, что в живом HTML есть id="games" (все пути рендера игры
// дают именно этот id) — ловит поломку самого рендера. Модель судит только выписанные строки.
//
// Запуск: node scripts/sverka/kapsula-render.mjs <музей> [ММ-ДД …]
//   музей — slug с yaml-шаблоном (izobreteniya | ne-sdayutsya). Без дат — все дни музея с шаблоном.
//   Выход — TSV на stdout (заголовок + строка на расхождение), сводка — на stderr. Код 1 при ошибках.
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

// ——— признаки по yaml: { ошибки, на пробе } ———
function priznakiYaml(y) {
  const oshibki = [];
  const naProbe = [];
  const g = y.igra;
  // A — игра заявлена (imya/vtoraya), а выводить её нечем: нет ни 3D, ни механики на данных.
  if (g && (g.imya || g.vtoraya) && !est3d(g) && !dannymi(g)) {
    oshibki.push(`игра «${g.imya || g.vtoraya}» заявлена, но не выведется (нет 3D и нет механики на данных)`);
  }
  // E — награда за вопросы должна быть парой [раз, по сколько].
  const q = y.score?.awards?.q;
  if (Array.isArray(q) && q.length !== 2) oshibki.push(`score.awards.q длиной ${q.length} (не пара [раз, по сколько]): ${JSON.stringify(q)}`);
  // D — таблица первенства «Где/Что/Когда» есть (kolonki), а строк нет.
  const stroki = y.pervenstvo?.stroki;
  if (Array.isArray(stroki) && stroki.length === 0) oshibki.push('таблица «Где/Что/Когда» пустая (pervenstvo.stroki = [])');
  return { oshibki, naProbe };
}

// ——— признаки по живому HTML зеркала: { ошибки, на пробе } ———
function priznakiRendera(html, y) {
  const oshibki = [];
  const naProbe = [];
  const g = y.igra;
  // A-сверх — рендер-условие игры есть, но блока с id="games" в живом HTML нет: поломка рендера.
  if (g && (est3d(g) || dannymi(g)) && !/id="games"/.test(html)) {
    oshibki.push(`игра «${g.imya || g.mehanika}» должна выводиться, но в живом HTML нет id="games"`);
  }
  // C — «— http…» голым текстом, а не ссылкой <a href> (макрос обязан оборачивать адрес).
  if (/—\s*https?:\/\//i.test(html)) {
    oshibki.push('адрес источника голым текстом («— http…», не <a href>)');
  }
  // B — лишний раздел вне образца.
  for (const m of ['sendChat', 'quiz-igry', 'hero-canvas']) {
    if (html.includes(m)) oshibki.push(`лишний раздел вне образца: ${m}`);
  }
  return { oshibki, naProbe };
}

console.log(['музей', 'день', 'уровень', 'расхождение'].join('\t'));
let oshibok = 0;
let preduprezhdenij = 0;
let net = 0;

for (const d of spisok) {
  const f = `${dir}/${d}.yaml`;
  if (!fs.existsSync(f)) {
    console.log([muzey, d, 'ошибка', 'нет yaml-шаблона'].join('\t'));
    oshibok++;
    continue;
  }
  let y;
  try {
    y = YAML.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    console.log([muzey, d, 'ошибка', `yaml не читается: ${e.message}`].join('\t'));
    oshibok++;
    continue;
  }
  const py = priznakiYaml(y);
  for (const s of py.oshibki) { console.log([muzey, d, 'ошибка', s].join('\t')); oshibok++; }
  for (const s of py.naProbe) { console.log([muzey, d, 'предупреждение', s].join('\t')); preduprezhdenij++; }
  let pr = { oshibki: [], naProbe: [] };
  try {
    const r = await fetch(`${ZERKALO}/muzei/${muzey}/den/${d}/`, { redirect: 'follow' });
    pr = r.ok ? priznakiRendera(await r.text(), y) : { oshibki: [`зеркало вернуло ${r.status}`], naProbe: [] };
  } catch (e) {
    pr = { oshibki: [`зеркало недоступно: ${e.message}`], naProbe: [] };
    net++;
  }
  for (const s of pr.oshibki) { console.log([muzey, d, 'ошибка', s].join('\t')); oshibok++; }
  for (const s of pr.naProbe) { console.log([muzey, d, 'предупреждение', s].join('\t')); preduprezhdenij++; }
}

console.error(`капсула-рендер: ${muzey} — дней ${spisok.length}, ошибок ${oshibok}, предупреждений ${preduprezhdenij}${net ? `, зеркало недоступно у ${net}` : ''}`);
process.exit(oshibok ? 1 : 0);
