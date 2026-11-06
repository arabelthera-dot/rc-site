#!/usr/bin/env node
// Проверка заявки одним днём — одной командой, в узкой копии без public/ и без сборки (Р536, пункт 2).
// Список шагов не свой: команда читает задание bez-sborki из .github/workflows/proverka.yml и выполняет его
// шаги run: по порядку, как облако. Добавил шаг в облако — он сам появился здесь; расхождения нет.
// С днём ММ-ДД музея ne-sdayutsya вдобавок — сверка комплекта дня: node scripts/ns-konveyer.mjs ДЕНЬ --sverka.
// Запуск: node scripts/proverka-dnya.mjs [ММ-ДД] [--muzei ne-sdayutsya]
//   В узкой копии сверке дня нужны файлы музея: git sparse-checkout add /public/muzei/ne-sdayutsya/
// Шаги, которым нужна вся public/ (NUZHNA_PUBLIC), в узкой копии пропускаются строкой «пропущен» — их делает облако.
// Выключатели облака (vars.*_STROGO) здесь не действуют: локально всё строго.
// --proba — заведомо красный шаг роняет команду, зелёный пропускает (шаг облака bez-sborki).
// Код выхода: 0 — все шаги зелёные; 1 — хотя бы один красный.
// Откат: удалить этот файл.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import YAML from 'yaml';

const KOREN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const argi = process.argv.slice(2);
const MUZEI = argi.includes('--muzei') ? argi[argi.indexOf('--muzei') + 1] : 'ne-sdayutsya';
if (argi.includes('--proba')) {
  const os = await import('node:os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'proverka-dnya-'));
  const proba = (run) => {
    const f = path.join(dir, 'p.yml');
    fs.writeFileSync(f, YAML.stringify({ jobs: { 'bez-sborki': { steps: [{ run: 'npm ci' }, { name: 'proba', run }] } } }));
    return spawnSync(process.execPath, [process.argv[1]], { env: { ...process.env, PROVERKA_DNYA_YML: f }, encoding: 'utf8' }).status;
  };
  const plohoj = proba('exit 3'), horoshij = proba('true');
  fs.rmSync(dir, { recursive: true, force: true });
  if (plohoj !== 1 || horoshij !== 0) { console.error(`proverka-dnya --proba: брак ${plohoj} (нужно 1), норма ${horoshij} (нужно 0)`); process.exit(1); }
  console.log('proverka-dnya --proba: заведомо красный шаг пойман, зелёный пропущен');
  process.exit(0);
}
const den = argi.find((a, i) => !a.startsWith('--') && argi[i - 1] !== '--muzei');
if (den && !/^\d\d-\d\d$/.test(den)) { console.error(`ОСТАНОВ: день — ММ-ДД, а не ${den}`); process.exit(1); }

// Шаги, которые читают файлы всех музеев из public/: kanaly собирает пост с первой картинкой дня 01-05.
const NUZHNA_PUBLIC = [/^kanaly /];
const uzkaya = (() => {
  try { return execFileSync('git', ['config', '--bool', 'core.sparseCheckout'], { cwd: KOREN, encoding: 'utf8' }).trim() === 'true'; }
  catch { return false; }
})();

const wf = YAML.parse(fs.readFileSync(process.env.PROVERKA_DNYA_YML || path.join(KOREN, '.github/workflows/proverka.yml'), 'utf8'));
const shagi = (wf.jobs?.['bez-sborki']?.steps ?? []).filter((s) => s.run && !/^npm ci\b/.test(s.run));
if (!shagi.length) { console.error('ОСТАНОВ: в proverka.yml нет задания bez-sborki с шагами run'); process.exit(1); }
if (den && MUZEI === 'ne-sdayutsya') shagi.push({ name: `ns-konveyer ${den} --sverka — комплект дня`, run: `node scripts/ns-konveyer.mjs ${den} --sverka` });

const nachalo = Date.now();
const krasnye = [];
let propushcheno = 0;
for (const s of shagi) {
  const imya = s.name ?? s.run.split('\n')[0];
  if (uzkaya && NUZHNA_PUBLIC.some((re) => re.test(imya))) { console.log(`– пропущен (нужна вся public/, делает облако): ${imya}`); propushcheno++; continue; }
  const t = Date.now();
  // env шага — как в облаке, кроме выражений ${{ }}: их локально нет, переменная не задаётся.
  const env = { ...process.env };
  for (const [k, v] of Object.entries(s.env ?? {})) if (!String(v).includes('${{')) env[k] = String(v);
  const r = spawnSync('bash', ['-e', '-c', s.run], { cwd: KOREN, env, encoding: 'utf8' });
  const sek = ((Date.now() - t) / 1000).toFixed(1);
  if (r.status === 0) console.log(`✓ ${sek} с  ${imya}`);
  else {
    krasnye.push(imya);
    console.log(`✗ ${sek} с  ${imya}\n${`${r.stdout}${r.stderr}`.trim().split('\n').slice(-15).map((x) => `    ${x}`).join('\n')}`);
  }
}
const vsego = ((Date.now() - nachalo) / 1000).toFixed(1);
console.log(`proverka-dnya${den ? ` ${MUZEI}/${den}` : ''}: шагов ${shagi.length}, красных ${krasnye.length}, пропущено ${propushcheno}, ${vsego} с`);
process.exit(krasnye.length ? 1 : 0);
