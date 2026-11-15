// Заготовка дня (Р783, 15.11.2026): node scripts/zagotovka-dnya.mjs <музей> <ММ-ДД>
// Форма — с двух последних готовых дней того же музея: что у них совпадает (подписи, заголовки разделов, служебные
// поля) — остаётся, что различается (текст, факты, кадры, источники, даты) — пусто. Число фактов и кадров — как у
// последнего дня. Пишет src/content/dni-shablon/<музей>/<ММ-ДД>.yaml и src/data/utverzhdeno/<музей>/<ММ-ДД>.json,
// существующие не трогает. Новых проверок нет: пустое ловит обычная сборка и tools/proverka-dnya.mjs.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const [muzei, den] = process.argv.slice(2);
if (!muzei || !/^\d\d-\d\d$/.test(den || '')) {
  console.error('node scripts/zagotovka-dnya.mjs <музей> <ММ-ДД>');
  process.exit(2);
}
const SH = `src/content/dni-shablon/${muzei}`;
const UT = `src/data/utverzhdeno/${muzei}`;
const gotovye = (fs.existsSync(SH) ? fs.readdirSync(SH) : [])
  .filter((f) => /^\d\d-\d\d\.yaml$/.test(f) && fs.existsSync(`${UT}/${f.replace('.yaml', '.json')}`))
  .map((f) => f.slice(0, 5)).filter((k) => k !== den).sort();
if (gotovye.length < 2) {
  console.error(`${muzei}: нужно два готовых дня (yaml + утверждённое), есть ${gotovye.length}`);
  process.exit(1);
}
const [a, b] = gotovye.slice(-2); // b — последний, a — предпоследний
const pustyh = [];
// Ключ дня в строке (02-28, 0228) → метка, чтобы «/den/02-28/» и «/den/02-26/» считались одним и тем же.
const metka = (s, k) => s.replaceAll(k, '\u0000').replaceAll(k.replace('-', ''), '\u0001');
const vernut = (s) => s.replaceAll('\u0000', den).replaceAll('\u0001', den.replace('-', ''));

function zagotovka(x, y, kA, kB, put) {
  if (Array.isArray(x)) return x.map((el, i) => zagotovka(el, Array.isArray(y) ? y[i] : undefined, kA, kB, `${put}[${i}]`));
  if (x && typeof x === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(x)) out[k] = zagotovka(v, y && typeof y === 'object' ? y[k] : undefined, kA, kB, put ? `${put}.${k}` : k);
    return out;
  }
  if (typeof x === 'string' && typeof y === 'string' && metka(x, kB) === metka(y, kA)) return vernut(metka(x, kB));
  if (x === y && typeof x !== 'string') return x;
  pustyh.push(put);
  return typeof x === 'string' ? '' : typeof x === 'number' ? null : x;
}

const osobye = (o) => {
  o.muzei = muzei;
  o.key = den;
  if ('pokazan_sergeyu' in o) o.pokazan_sergeyu = { data: '' }; // показ Сергею ставится только после показа
  return o;
};
const zapisat = (f, tekst) => {
  if (fs.existsSync(f)) return console.log(`есть, не трогаю: ${f}`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, tekst);
  console.log(`заготовка: ${f}`);
};

const yA = YAML.parse(fs.readFileSync(`${SH}/${a}.yaml`, 'utf8'));
const yB = YAML.parse(fs.readFileSync(`${SH}/${b}.yaml`, 'utf8'));
const y = osobye(zagotovka(yB, yA, a, b, ''));
const nYaml = pustyh.length;
zapisat(`${SH}/${den}.yaml`, `# Заготовка дня ${den} (Р783): форма с ${b} и ${a}; пустое — заполнить.\n\n` + YAML.stringify(y, { lineWidth: 0 }));

const uA = JSON.parse(fs.readFileSync(`${UT}/${a}.json`, 'utf8'));
const uB = JSON.parse(fs.readFileSync(`${UT}/${b}.json`, 'utf8'));
const u = zagotovka(uB, uA, a, b, 'utverzhdeno');
u.key = den;
zapisat(`${UT}/${den}.json`, JSON.stringify(u, null, 2) + '\n');

console.log(`образец: ${b} (сверено с ${a}); пустых полей: yaml ${nYaml}, утверждённое ${pustyh.length - nYaml}`);
for (const p of pustyh.slice(0, 30)) console.log(`  пусто: ${p}`);
if (pustyh.length > 30) console.log(`  … и ещё ${pustyh.length - 30}`);
