// Замок «новые дни — только yaml» (r602, как Р383): у музея из снимка scripts/dni-tolko-yaml.json старые полные страницы
// src/data/full-pages/<музей>/ММ-ДД.html заморожены. Красный (код 1, ::error::), если:
//   1) в src/data/full-pages/<музей>/ появился файл не из снимка — новый день делается только карточкой
//      src/content/dni-shablon/<музей>/ММ-ДД.yaml (общий шаблон), не старым HTML;
//   2) у дня, для которого есть yaml-карточка, старый HTML изменён (sha256 не совпал) — правится yaml, а не HTML.
// Снимок пополнять руками нельзя (сказано в его шапке): он снят один раз 02.11.2026 и только сужается.
// Запуск: node scripts/dni-tolko-yaml.mjs [--proba]. Стоит в npm run build сразу после hook-odno. Откат — убрать вызов из package.json.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const SNIMOK = 'scripts/dni-tolko-yaml.json';
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

export function proverit(root, snimok) {
  const oshibki = [];
  for (const [muzei, dni] of Object.entries(snimok)) {
    if (muzei.startsWith('_')) continue;
    const full = path.join(root, 'src/data/full-pages', muzei), yamly = path.join(root, 'src/content/dni-shablon', muzei);
    const faily = fs.existsSync(full) ? fs.readdirSync(full).sort() : [];
    for (const f of faily) {
      const key = f.replace(/\.html$/, '');
      if (!(key in dni) || !f.endsWith('.html')) {
        oshibki.push({ file: `src/data/full-pages/${muzei}/${f}`, msg: `новый файл старой страницы — новый день «${muzei}» делается только карточкой src/content/dni-shablon/${muzei}/${key}.yaml (r602)` });
        continue;
      }
      if (fs.existsSync(path.join(yamly, `${key}.yaml`)) && sha(path.join(full, f)) !== dni[key])
        oshibki.push({ file: `src/data/full-pages/${muzei}/${f}`, msg: `у дня есть карточка src/content/dni-shablon/${muzei}/${key}.yaml, а старый HTML изменён — правится yaml, не HTML (r602)` });
    }
  }
  return oshibki;
}

if (process.argv.includes('--proba')) {
  // Временная копия: музей с двумя днями в снимке; день 01-01 с карточкой, 01-02 — без.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dni-tolko-yaml-proba-'));
  const full = path.join(tmp, 'src/data/full-pages/proba'), yamly = path.join(tmp, 'src/content/dni-shablon/proba');
  fs.mkdirSync(full, { recursive: true }); fs.mkdirSync(yamly, { recursive: true });
  fs.writeFileSync(path.join(full, '01-01.html'), '<p>1</p>'); fs.writeFileSync(path.join(full, '01-02.html'), '<p>2</p>');
  fs.writeFileSync(path.join(yamly, '01-01.yaml'), 'key: 01-01\n');
  const snimok = { proba: { '01-01': sha(path.join(full, '01-01.html')), '01-02': sha(path.join(full, '01-02.html')) } };
  let bad = 0;
  const shag = (imya, zhdem) => { const n = proverit(tmp, snimok).length; const ok = n === zhdem; if (!ok) bad++; console.log(`проба ${ok ? '✓' : '✗'} ${imya}: красных ${n}, ждали ${zhdem}`); };
  shag('как в снимке', 0);
  fs.writeFileSync(path.join(full, '01-02.html'), '<p>2 правка</p>'); shag('правка HTML дня без карточки', 0);
  fs.writeFileSync(path.join(full, '01-01.html'), '<p>1 правка</p>'); shag('правка HTML дня с карточкой', 1);
  fs.writeFileSync(path.join(full, '01-01.html'), '<p>1</p>');
  fs.writeFileSync(path.join(full, '01-03.html'), '<p>3</p>'); shag('новый день старым HTML', 1);
  fs.writeFileSync(path.join(full, '01-01.html'), '<p>1 правка</p>'); shag('оба случая', 2);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`dni-tolko-yaml --proba: ${5 - bad} из 5`);
  process.exit(bad ? 1 : 0);
}

const snimok = JSON.parse(fs.readFileSync(SNIMOK, 'utf8'));
const oshibki = proverit(process.cwd(), snimok);
for (const o of oshibki) console.log(`::error file=${o.file}::${o.msg}`);
const vsego = Object.entries(snimok).filter(([m]) => !m.startsWith('_')).map(([m, d]) => `${m}: ${Object.keys(d).length}`).join(', ');
console.log(`dni-tolko-yaml: снимок (${vsego}), красных ${oshibki.length}`);
process.exit(oshibki.length ? 1 : 0);
