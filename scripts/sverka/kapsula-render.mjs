// Капсула рендера живой страницы дня — доводка капсулы сверки до полного аналога ручной ночи r832
// (Сергей 24.11.2026: «доводи до ума, потом приступим дальше»; план logs/kapsula-render-progress.md).
// Капсула данных (scripts/sverka/kapsula-sverka.mjs) сверяет состав/порядок фактов и кадры; чего она не
// видит — рендер и карточку вне фактов. Эти признаки и ловит эта капсула БЕЗ модели, детерминированно:
//   B  в живом HTML лишний раздел вне образца: sendChat (чат «Спроси»), quiz-igry, hero-canvas — точный;
//   D  pervenstvo.stroki пустой [] — таблица «Где/Что/Когда» без строк (yaml) — точный;
//   E  score.awards.q длиной не 2 — не пара [раз, по сколько] (yaml) — точный;
//   A  igra.imya задан, а в живом HTML нет id="games"/id="game" — игра может не выводиться (на пробе:
//      игры-2D выводятся без этого id, маркер надо уточнить на известном браке);
//   C  в факте «Источник:» — «— http…» без <a href> (на пробе: это нормальный формат yaml, рендер сам
//      делает ссылку; на живых страницах голых URL не осталось).
// B — по живому HTML зеркала (fetch), D/E — по yaml. A/C печатаются предупреждением и не роняют (Р520,
// «на пробе»), B/D/E — ошибкой. Модель судит только выписанные строки, не читая страницу целиком.
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

// ——— признаки по yaml: { ошибки, на пробе } ———
function priznakiYaml(y) {
  const oshibki = [];
  const naProbe = [];
  // E — награда за вопросы должна быть парой [раз, по сколько].
  const q = y.score?.awards?.q;
  if (Array.isArray(q) && q.length !== 2) oshibki.push(`score.awards.q длиной ${q.length} (не пара [раз, по сколько]): ${JSON.stringify(q)}`);
  // D — таблица первенства «Где/Что/Когда» есть (kolonki), а строк нет.
  const stroki = y.pervenstvo?.stroki;
  if (Array.isArray(stroki) && stroki.length === 0) oshibki.push('таблица «Где/Что/Когда» пустая (pervenstvo.stroki = [])');
  // C — «Источник:» в факте кончается голым адресом, а не ссылкой <a href> (на пробе, см. шапку).
  for (const blok of y.fakty || []) for (const u of blok.udary || []) {
    const tekst = [u.src, u.det, u.summary].flat().filter(Boolean).join('\n');
    if (/источник/i.test(tekst) && /—\s+https?:\/\//i.test(tekst) && !/<a\s+href/i.test(tekst)) {
      naProbe.push('источник факта голым адресом («— http…» без <a href>)');
      break;
    }
  }
  return { oshibki, naProbe };
}

// ——— признаки по живому HTML зеркала: { ошибки, на пробе } ———
function priznakiRendera(html, y) {
  const oshibki = [];
  const naProbe = [];
  // A — игра заявлена, но id="games"/id="game" нет (на пробе, см. шапку).
  if (y.igra?.imya && !/id="games"/.test(html) && !/id="game"/.test(html)) {
    naProbe.push(`игра «${y.igra.imya}» может не выводиться (нет id="games"/id="game")`);
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
