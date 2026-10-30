// Замок «хук = одно предложение» (закон хука №5; standards/museum-core/06-acceptance.md: ноль совпадений
// `[.!?]\s+[А-ЯЁ]`). Хук — одна фраза, 80–130 знаков, потолок 200. Брак 29.10.2026 (Р492): хук 31 янв. (гиротрон)
// из двух предложений дошёл до живого сайта — проверки не было.
// Проверяются все дни всех музеев: src/content/days/*/*.json (поле hook), src/content/dni-shablon/*/*.yaml
// (lead.hook), src/data/full-pages/*/*.html (элемент class="hook").
// Не вторая фраза: точка/знак внутри «…» (цитата), инициалы («А. К. Толстой»), сокращения («1812 г. Наполеон»).
// Нарушение — код 1 и ::error:: по-русски: файл, хук. Откат — удалить вызов из package.json (build).
// Запуск: node scripts/hook-odno.mjs [--proba]
import fs from 'node:fs';
import path from 'node:path';

const SOKR = /^(г|гг|в|вв|ст|им|св|т|тыс|млн|млрд|руб|н|э|пр|ул|см|др|акад|проф)$/i;
const decode = (t) => t.replace(/&nbsp;|&#160;/g, ' ').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
const strip = (t) => decode(t.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// Вторая фраза: [.!?…] + пробел + заглавная, вне кавычек «…», не после инициала и не после сокращения.
export function vtorayaFraza(hook) {
  let t = hook;
  for (let prev; prev !== t;) { prev = t; t = t.replace(/«[^«»]*»/g, '«»'); }
  const re = /(\S*)[.!?…]\s+(?=[А-ЯЁ])/g;
  for (let m; (m = re.exec(t));) {
    const w = m[1].replace(/^[(«"„]+/, '');
    if (/^[А-ЯЁA-Z]$/.test(w) || /^([А-ЯЁ]\.)+[А-ЯЁ]$/.test(w) || SOKR.test(w)) continue;
    return t.slice(m.index, m.index + m[0].length + 1);
  }
  return null;
}

if (process.argv.includes('--proba')) {
  const proba = [
    ['Горьковские физики первыми в мире построили гиротрон: 6 ватт, а через девять лет — мегаватт.', false],
    ['Гиротрон построили в Горьком. Его лучом греют плазму.', true],
    ['Он воскресил Ивана Грозного — А. К. Толстой вернул Руси её живую историю.', false],
    ['«Буря! Скоро грянет буря!» — Горький написал песню о птице.', false],
    ['«Вы стоите? Я один пойду!» — повёл полк и не вернулся', false],
    ['Шарик стал Шариковым! Булгаков написал гротеск.', true],
    ['В 1812 г. Наполеон вошёл в Москву.', false],
  ];
  let bad = 0;
  for (const [h, zhdem] of proba) if (!!vtorayaFraza(h) !== zhdem) { bad++; console.log(`проба ✗ ждали ${zhdem}: ${h}`); }
  console.log(`hook-odno --proba: ${proba.length - bad} из ${proba.length}`);
  process.exit(bad ? 1 : 0);
}

const root = process.cwd();
const hooks = [];
const papki = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((m) => fs.statSync(path.join(d, m)).isDirectory()) : []);
const days = path.join(root, 'src/content/days');
for (const m of papki(days)) for (const f of fs.readdirSync(path.join(days, m)).filter((f) => f.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(path.join(days, m, f), 'utf8'));
  if (j.hook) hooks.push([`src/content/days/${m}/${f}`, j.hook]);
}
const shablon = path.join(root, 'src/content/dni-shablon');
for (const m of papki(shablon)) for (const f of fs.readdirSync(path.join(shablon, m)).filter((f) => f.endsWith('.yaml'))) {
  const s = fs.readFileSync(path.join(shablon, m, f), 'utf8');
  const lead = s.match(/^lead:\n((?:[ \t]+.*\n?)*)/m)?.[1] ?? '';
  const v = lead.match(/^  hook: (.*)$/m)?.[1]?.trim();
  if (!v) continue;
  const hook = /^'.*'$/.test(v) ? v.slice(1, -1).replace(/''/g, "'") : /^".*"$/.test(v) ? JSON.parse(v) : v;
  hooks.push([`src/content/dni-shablon/${m}/${f}`, hook]);
}
const full = path.join(root, 'src/data/full-pages');
for (const m of papki(full)) for (const f of fs.readdirSync(path.join(full, m)).filter((f) => f.endsWith('.html'))) {
  const h = fs.readFileSync(path.join(full, m, f), 'utf8').match(/<(\w+)[^>]*class="hook"[^>]*>([\s\S]*?)<\/\1>/)?.[2];
  if (h) hooks.push([`src/data/full-pages/${m}/${f}`, strip(h)]);
}

let krasnyh = 0;
for (const [f, h] of hooks) {
  const v = vtorayaFraza(h);
  if (v) { krasnyh++; console.log(`::error file=${f}::хук из двух предложений (закон хука №5: одно предложение), стык «${v}»: «${h}»`); }
}
console.log(`hook-odno: хуков ${hooks.length}, двухфразовых ${krasnyh}`);
process.exit(krasnyh ? 1 : 0);
