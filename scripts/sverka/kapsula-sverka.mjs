// Капсула механики живой сверки (Р835, Сергей 20.11.2026: «капсула механики сверки по образцу
// kapsula.py Джарвиса 2, проба на п.6 — повторное живое чтение 118 дней»).
// Один скрипт: по дате + музею делает механическую часть сверки БЕЗ модели — читает страницу дня
// (dni-shablon YAML или full-pages HTML), сверивает поля карточки с утверждённым json и выписывает
// расхождения строкой TSV. Модель подключается только на выписанных расхождениях — судить, брак ли это.
// Само сравнение — scripts/sverka-utverzhdeno.mjs (sverit: состав и порядок фактов Р510, кадры к фактам
// Р514, повторы кадров, повторы фактов «на пробе» Р520). Здесь только вход/выход капсулы.
//
// Запуск: node scripts/sverka/kapsula-sverka.mjs <музей> [ММ-ДД …]
//   без дат — все дни музея с утверждённой карточкой; музей — slug из src/data/museums.json.
//   Выход — TSV на stdout (заголовок + по строке на расхождение), сводка — на stderr.
//   Код выхода: 1, если есть расхождение-ошибка (предупреждения «на пробе» не роняют).
import { proveritMuzey } from '../sverka-utverzhdeno.mjs';

const [muzey, ...dni] = process.argv.slice(2);
if (!muzey) {
  console.error('капсула сверки: музей не указан. Запуск: node scripts/sverka/kapsula-sverka.mjs <музей> [ММ-ДД …]');
  process.exit(2);
}

const itog = proveritMuzey(muzey, dni.length ? dni : null);
console.log(['музей', 'день', 'уровень', 'расхождение'].join('\t'));
let oshibok = 0;
let preduprezhdenij = 0;

if (itog.net) {
  console.error(`${muzey}: ${itog.net}`);
} else for (const d of itog.itog) {
  if (d.net) { console.error(`${d.key}: ${d.net}`); continue; }
  for (const s of d.o || []) { console.log([muzey, d.key, 'ошибка', s].join('\t')); oshibok++; }
  for (const s of d.naProbe || []) { console.log([muzey, d.key, 'предупреждение', s].join('\t')); preduprezhdenij++; }
}

console.error(`капсула: ${muzey} — дней ${itog.itog?.length ?? 0}, ошибок ${oshibok}, предупреждений ${preduprezhdenij}`);
process.exit(oshibok ? 1 : 0);
