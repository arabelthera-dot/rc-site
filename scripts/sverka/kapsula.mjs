// Капсула сверки — ОДИН вход (данные + рендер). Сергей 24.11.2026, п.4 плана.
// Раньше сверщик гонял две капсулы по отдельности (kapsula-sverka.mjs — состав/порядок фактов и кадры;
// kapsula-render.mjs — признаки рендера A–E). Этот скрипт запускает обе одной командой.
// Данные — состав/порядок фактов и кадры (TSV, ошибка/предупреждение «на пробе»). Рендер — признаки A–E,
// которые (Сергей 25.11.2026, Р627) печатаются читаемым листом как «подозрение — смотри глазами» и код
// выхода не меняют; машина роняет только на базе (шаблон/страница). Обе — детерминированно, 0 токенов.
//
// Запуск: node scripts/sverka/kapsula.mjs <музей> [ММ-ДД …]
//   музей — slug (izobreteniya | ne-sdayutsya | …). Без дат — все дни музея с карточкой/шаблоном.
//   Выход — данные TSV + читаемый лист рендера; сводка и замер — на stderr. Код 1 — базовая ошибка.
import { spawnSync } from 'node:child_process';

const [muzey, ...dni] = process.argv.slice(2);
if (!muzey) {
  console.error('капсула: музей не указан. Запуск: node scripts/sverka/kapsula.mjs <музей> [ММ-ДД …]');
  process.exit(2);
}

const KOREN = new URL('../..', import.meta.url).pathname;

console.log(['музей', 'день', 'капсула', 'уровень', 'расхождение'].join('\t'));
let oshibok = 0;          // база: данные-ошибки + рендер-база (шаблон/страница)
let preduprezhdenij = 0;  // данные «на пробе»
let nedostupno = 0;

// данные — TSV (состав/порядок фактов и кадры).
{
  const r = spawnSync('node', [`${KOREN}scripts/sverka/kapsula-sverka.mjs`, muzey, ...dni], { encoding: 'utf8' });
  if (r.error) {
    console.error(`капсула данные: не запустилась — ${r.error.message}`);
    oshibok++;
  } else {
    process.stderr.write(r.stderr); // сводка капсулы данных
    for (const s of r.stdout.split(/\r?\n/).slice(1)) {
      if (!s.trim()) continue;
      const [m, d, urov, ...ost] = s.split('\t');
      if (!m || !urov) continue;
      if (urov === 'ошибка') oshibok++;
      else if (urov === 'предупреждение') preduprezhdenij++;
      console.log([m, d, 'данные', urov, ost.join('\t')].join('\t'));
    }
    if (r.status !== 0 && r.status !== 1) nedostupno++;
  }
}

// рендер — читаемый лист по дням; подозрения не роняют, база роняет кодом выхода.
{
  const r = spawnSync('node', [`${KOREN}scripts/sverka/kapsula-render.mjs`, muzey, ...dni], { encoding: 'utf8' });
  if (r.error) {
    console.error(`капсула рендер: не запустилась — ${r.error.message}`);
    oshibok++;
  } else {
    process.stderr.write(r.stderr); // сводка рендера: подозрений N, базовых ошибок M
    if (r.stdout.trim()) {
      console.log('');
      process.stdout.write(r.stdout);
    }
    if (r.status === 1) oshibok++; // базовые ошибки рендера (шаблон/страница)
    else if (r.status !== 0) nedostupno++;
  }
}

console.error(`капсула: ${muzey}${dni.length ? ' ' + dni.join(',') : ' (все дни)'} — базовых ошибок ${oshibok}, предупреждений ${preduprezhdenij}${nedostupno ? `, не запустилось ${nedostupno}` : ''}`);
console.error('замер против ночи r832: один ход (node), 0 токенов модели — данные и рендер считаются детерминированно.');
process.exit(oshibok ? 1 : 0);
