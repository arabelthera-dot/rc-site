// Капсула сверки — ОДИН вход (данные + рендер). Сергей 24.11.2026, п.4 плана
// logs/kapsula-render-progress.md: полный аналог ручной ночи r832 без модели.
// Раньше сверщик гонял две капсулы по отдельности (kapsula-sverka.mjs — состав/порядок фактов и кадры;
// kapsula-render.mjs — признаки рендера A–E). Этот скрипт запускает обе одной командой, собирает их
// строки в один TSV, помечая капсулу-источник, и сводит ошибки в один код выхода.
//
// Запуск: node scripts/sverka/kapsula.mjs <музей> [ММ-ДД …]
//   музей — slug (izobreteniya | ne-sdayutsya | …). Без дат — все дни музея с карточкой/шаблоном.
//   Выход — TSV на stdout: музей, день, капсула (данные|рендер), уровень, расхождение.
//   Сводка и замер — на stderr. Код 1 при ошибках любой капсулы.
import { spawnSync } from 'node:child_process';

const [muzey, ...dni] = process.argv.slice(2);
if (!muzey) {
  console.error('капсула: музей не указан. Запуск: node scripts/sverka/kapsula.mjs <музей> [ММ-ДД …]');
  process.exit(2);
}

const KOREN = new URL('../..', import.meta.url).pathname;
// Порядок = порядок в итоговом TSV. Данные — состав/порядок фактов, рендер — признаки A–E.
const KAPSULY = [
  { imya: 'данные', skript: 'kapsula-sverka.mjs' },
  { imya: 'рендер', skript: 'kapsula-render.mjs' },
];

console.log(['музей', 'день', 'капсула', 'уровень', 'расхождение'].join('\t'));
let oshibok = 0;
let preduprezhdenij = 0;
let nedostupno = 0;

for (const k of KAPSULY) {
  const r = spawnSync('node', [`${KOREN}scripts/sverka/${k.skript}`, muzey, ...dni], { encoding: 'utf8' });
  if (r.error) {
    console.error(`капсула ${k.imya}: не запустилась — ${r.error.message}`);
    oshibok++;
    continue;
  }
  process.stderr.write(r.stderr); // сводка капсулы — как есть
  // stdout: заголовок + строки расхождений; заголовок капсулы пропускаем (у сводного TSV свой).
  for (const s of r.stdout.split(/\r?\n/).slice(1)) {
    if (!s.trim()) continue;
    const [m, d, urov, ...ost] = s.split('\t');
    if (!m || !urov) continue;
    if (urov === 'ошибка') oshibok++;
    else if (urov === 'предупреждение') preduprezhdenij++;
    console.log([m, d, k.imya, urov, ost.join('\t')].join('\t'));
  }
  if (r.status !== 0 && r.status !== 1) nedostupno++;
}

console.error(`капсула: ${muzey}${dni.length ? ' ' + dni.join(',') : ' (все дни)'} — ошибок ${oshibok}, предупреждений ${preduprezhdenij}`);
console.error('замер против ночи r832: один ход (node), 0 токенов модели — данные и рендер считаются детерминированно.');
process.exit(oshibok ? 1 : 0);
