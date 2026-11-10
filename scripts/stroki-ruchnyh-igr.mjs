// Файлы переводов ручных январских игр (п. 164): node scripts/stroki-ruchnyh-igr.mjs [--proverit]
// Для каждой карточки с igra.imya до 02-01 пишет русские строки в src/data/igry/stroki/<muzey>-<ММ-ДД>.json
// (src/data/igry/stroki-ruchnyh.mjs); прочие ключи и языки файла не трогает — их пишет машина перевода.
// --proverit — ничего не пишет: ru-подстановка байт в байт равна исходнику, у каждой игры есть тексты.
import fs from 'node:fs';
import YAML from 'yaml';
import { vynutRuchnye, ruchnayaNaYazyke, chastiIgry } from '../src/data/igry/stroki-ruchnyh.mjs';

const proverit = process.argv.includes('--proverit');
const DIR = 'src/content/dni-shablon';
const RUCHNYE = /\.igra\.(html|js|dop)\./;
let oshibki = 0;
for (const muzey of fs.readdirSync(DIR)) for (const f of fs.readdirSync(`${DIR}/${muzey}`).filter((x) => /^\d\d-\d\d\.yaml$/.test(x))) {
  const d = YAML.parse(fs.readFileSync(`${DIR}/${muzey}/${f}`, 'utf8'));
  if (!d.igra?.imya || d.key >= '02-01') continue;
  const ru = vynutRuchnye(muzey, d.key, d.igra);
  const kuda = `src/data/igry/stroki/${muzey}-${d.key}.json`;
  if (proverit) {
    const fayl = { ru, xx: {} };
    const ravno = chastiIgry(muzey, d.igra).every((c) => ruchnayaNaYazyke(muzey, d.key, d.igra, fayl, 'ru')[c.put] === c.tekst);
    const n = Object.keys(ru).length;
    if (!ravno || !n) oshibki++;
    console.log(`${ravno && n ? 'верно' : 'НЕВЕРНО'} — ${muzey}/${d.key} ${d.igra.imya}: строк ${n}, ru байт в байт ${ravno ? 'да' : 'нет'}`);
    continue;
  }
  const fayl = fs.existsSync(kuda) ? JSON.parse(fs.readFileSync(kuda, 'utf8')) : {};
  const prochie = Object.fromEntries(Object.entries(fayl.ru ?? {}).filter(([k]) => !RUCHNYE.test(k)));
  const novyy = { _: fayl._ ?? `Тексты ручной игры ${muzey} ${d.key} (${d.igra.imya}) для перевода (п. 164). Ключи — src/data/igry/stroki-ruchnyh.mjs; html и js игры не меняются. Языки, кроме ru, пишет только машина перевода (Р603).`,
    ...fayl, ru: { ...prochie, ...ru } };
  fs.mkdirSync('src/data/igry/stroki', { recursive: true });
  fs.writeFileSync(kuda, JSON.stringify(novyy, null, 2) + '\n');
  console.log(`${kuda}: строк игры ${Object.keys(ru).length}`);
}
process.exit(oshibki ? 1 : 0);
