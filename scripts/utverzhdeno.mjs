#!/usr/bin/env node
// Список утверждений Сергея для фактов дня (Р304, r419): scripts/utverzhdeno.json — { "Р294": { "reshenie": "28.10", "dni": ["01-16"] } }.
// Пишет его Джарвис из своего реестра решений (вне репо, в репо реестр не кладём — там живая речь Сергея, а сайт публичный):
//   node scripts/utverzhdeno.mjs ~/workspace/context/resheniya-sergeya.md
// «dni» — какие дни (ММ-ДД) называет строка решения: «16 янв.», «19 января», «16–20 янв.» (диапазон — все дни подряд).
// Сторож tests/vid-dnya.mjs: у факта карточки дня (adres: den) utverzhdeno: "Р<номер>", и этот Р в списке называет дату дня.
import fs from 'node:fs';

export const FAYL = 'scripts/utverzhdeno.json';
const MES = ['янв', 'фев', 'мар', 'апр', 'ма[йя]', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const DATA = new RegExp(`(\\d{1,2})(?:\\s*[–—-]\\s*(\\d{1,2}))?\\s+(${MES.join('|')})[а-яё]*\\.?`, 'giu');
const dd = (n) => String(n).padStart(2, '0');

/** Дни (ММ-ДД), которые называет текст. */
export function dniStroki(t) {
  const out = new Set();
  for (const m of t.matchAll(DATA)) {
    const mes = MES.findIndex((x) => new RegExp(`^${x}`, 'iu').test(m[3])) + 1;
    const ot = +m[1], doo = m[2] ? +m[2] : ot;
    if (!mes || ot < 1 || doo > 31 || doo < ot || doo - ot > 31) continue;
    for (let d = ot; d <= doo; d++) out.add(`${dd(mes)}-${dd(d)}`);
  }
  return [...out].sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const reestr = process.argv[2];
  if (!reestr || !fs.existsSync(reestr)) { console.error('utverzhdeno: укажи файл реестра решений: node scripts/utverzhdeno.mjs <resheniya-sergeya.md>'); process.exit(1); }
  const out = {};
  for (const s of fs.readFileSync(reestr, 'utf8').split('\n')) {
    const m = /^(Р\d+)\s+(\d\d\.\d\d)\s/.exec(s);
    if (!m) continue;
    const dni = dniStroki(s.slice(m[0].length));
    if (dni.length) out[m[1]] = { reshenie: m[2], dni };
  }
  // Одно решение — одна строка: правка Джарвиса видна в диффе построчно.
  fs.writeFileSync(FAYL, `{\n${Object.entries(out).map(([r, v]) => `  ${JSON.stringify(r)}: ${JSON.stringify(v)}`).join(',\n')}\n}\n`);
  console.log(`utverzhdeno: ${Object.keys(out).length} решений с датами дней → ${FAYL}`);
}
