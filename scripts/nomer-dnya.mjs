// Версия формы и постоянный номер дня (Р648, Р649, очередь 249 и 250; 08.11.2026).
// Образцы: версия формы в самой записи — JSON Schema «$schema» и эволюционная база данных Фаулера (миграция машиной,
// по номеру версии); постоянный номер — W3C «Cool URIs don't change» и ARK/NOID: короткий непрозрачный номер,
// без даты, музея и смысла внутри, выдаётся один раз и больше не меняется.
// Номер — «d» и 6 знаков алфавита NOID без гласных (0-9 bcdfghjkmnpqrstvwxz): 29⁶ ≈ 594 млн, слов не складывает.
// Реестр — один файл src/data/nomera-dnej.json: номер → «музей/ММ-ДД», где день лежит сейчас. День переехал — правится
// только адрес в реестре (и файл дня), номер тот же. Сборка сверяет каждый файл дня с реестром (src/content.config.ts).
// Файл дня правится вставкой двух строк после "key" — остальной текст файла не трогается ни на букву.
//   node scripts/nomer-dnya.mjs [музей/ММ-ДД …]   — выдать номера и проставить поля (без списка — все дни)
//   node scripts/nomer-dnya.mjs --proverka         — у каждого дня поля есть и совпадают с реестром, реестр без повторов
import fs from 'node:fs';
import path from 'node:path';
import { randomInt } from 'node:crypto';

export const VERSIYA_FORMY = 1;
export const ALFAVIT = '0123456789bcdfghjkmnpqrstvwxz';
export const NOMER = new RegExp(`^d[${ALFAVIT}]{6}$`);
const DNI = 'src/content/days';
const REESTR = 'src/data/nomera-dnej.json';
const SHAPKA = 'Постоянные номера дней (Р649): номер → «музей/ММ-ДД», где день сейчас. Номер выдаёт только scripts/nomer-dnya.mjs, '
  + 'руками не придумывать; день переехал — меняется адрес, номер остаётся; номер не переиспользуется.';

const chitatReestr = () => (fs.existsSync(REESTR) ? JSON.parse(fs.readFileSync(REESTR, 'utf8')).nomera : {});
const vseDni = () => fs.readdirSync(DNI).sort().flatMap((m) => fs.readdirSync(path.join(DNI, m))
  .filter((f) => /^\d\d-\d\d\.json$/.test(f)).sort().map((f) => `${m}/${f.slice(0, 5)}`));

function proverka() {
  const nomera = chitatReestr();
  const oshibki = [];
  const poAdresu = new Map();
  for (const [n, a] of Object.entries(nomera)) {
    if (!NOMER.test(n)) oshibki.push(`реестр: номер ${n} не по форме`);
    if (poAdresu.has(a)) oshibki.push(`реестр: у ${a} два номера — ${poAdresu.get(a)} и ${n}`);
    poAdresu.set(a, n);
  }
  for (const a of vseDni()) {
    const d = JSON.parse(fs.readFileSync(path.join(DNI, `${a}.json`), 'utf8'));
    if (d.versiya_formy !== VERSIYA_FORMY) oshibki.push(`${a}: versiya_formy ${d.versiya_formy} вместо ${VERSIYA_FORMY}`);
    if (poAdresu.get(a) !== d.nomer_dnya) oshibki.push(`${a}: nomer_dnya ${d.nomer_dnya}, в реестре ${poAdresu.get(a)}`);
  }
  for (const a of poAdresu.keys()) if (!fs.existsSync(path.join(DNI, `${a}.json`))) oshibki.push(`реестр: файла дня ${a} нет`);
  oshibki.slice(0, 30).forEach((o) => console.error(o));
  console.log(`дней ${vseDni().length}, номеров ${Object.keys(nomera).length}, ошибок ${oshibki.length}`);
  process.exit(oshibki.length ? 1 : 0);
}

function prostavit(spisok) {
  const nomera = chitatReestr();
  const poAdresu = new Map(Object.entries(nomera).map(([n, a]) => [a, n]));
  let novyh = 0;
  let pravok = 0;
  for (const a of spisok) {
    const f = path.join(DNI, `${a}.json`);
    const s = fs.readFileSync(f, 'utf8');
    const d = JSON.parse(s);
    if (`${d.museum}/${d.key}` !== a) throw new Error(`${f}: museum/key внутри — ${d.museum}/${d.key}`);
    let n = poAdresu.get(a);
    if (!n) {
      do n = 'd' + Array.from({ length: 6 }, () => ALFAVIT[randomInt(ALFAVIT.length)]).join(''); while (n in nomera);
      nomera[n] = a;
      poAdresu.set(a, n);
      novyh++;
    }
    if (d.versiya_formy === VERSIYA_FORMY && d.nomer_dnya === n) continue;
    if ('versiya_formy' in d || 'nomer_dnya' in d) throw new Error(`${f}: поля уже есть и не совпадают с реестром — разобрать человеку`);
    const t = s.replace(/^( *)("key": "\d\d-\d\d",\n)/m,
      (_, o, k) => `${o}${k}${o}"versiya_formy": ${VERSIYA_FORMY},\n${o}"nomer_dnya": "${n}",\n`);
    if (t === s) throw new Error(`${f}: нет строки "key"`);
    const proba = JSON.parse(t);
    delete proba.versiya_formy;
    delete proba.nomer_dnya;
    if (JSON.stringify(proba) !== JSON.stringify(d)) throw new Error(`${f}: вставка задела другие поля`);
    fs.writeFileSync(f, t);
    pravok++;
  }
  const sort = Object.fromEntries(Object.entries(nomera).sort(([, a], [, b]) => a.localeCompare(b)));
  fs.writeFileSync(REESTR, JSON.stringify({ _shapka: SHAPKA, versiya_formy: VERSIYA_FORMY, nomera: sort }, null, 2) + '\n');
  console.log(`новых номеров ${novyh}, файлов дня поправлено ${pravok}, всего в реестре ${Object.keys(nomera).length}`);
}

const args = process.argv.slice(2);
if (args.includes('--proverka')) proverka();
else prostavit(args.length ? args : vseDni());
