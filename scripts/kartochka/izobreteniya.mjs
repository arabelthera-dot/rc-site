// Р516: проба общей машины (scripts/kartochka-v-stranicu.mjs) на «Что изобрели русские первыми в мире».
// Из утверждённого knowledge/utverzhdeno/izobreteniya/ММ-ДД.md и ММ-ДД.kadry.md собирает день заново
// (факты по порядку карточки, кадры только по «Факт к кадру») и сравнивает со страницей в main. Ничего не пишет.
// Объект кадра берётся со страницы по файлу: в карточке кадра нет подписи и credit, сравниваются места кадров.
// Запуск: node scripts/kartochka/izobreteniya.mjs [--vetka main] [ММ-ДД …]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { razobratKartochku } from '../utverzhdeno-kopiya.mjs';
import { faktyStranicy } from '../utverzhdeno-iz-stranicy.mjs';
import { proverit, rasstavit } from '../kartochka-v-stranicu.mjs';

const argv = process.argv.slice(2);
const i = argv.indexOf('--vetka'); const VETKA = i >= 0 ? argv.splice(i, 2)[1] : 'main';
const UTV = path.join(os.homedir(), 'workspace/knowledge/utverzhdeno/izobreteniya');
const dni = argv.length ? argv : fs.readdirSync(UTV).filter((f) => /^\d\d-\d\d\.md$/.test(f)).map((f) => f.slice(0, 5)).sort();

const kadryKartochki = (t) => t.split(/\n(?=Кадр \d+)/).slice(1).map((b) => ({
  n: +b.match(/^Кадр (\d+)/)[1], fajl: b.match(/^Файл:\s*(.+)$/m)?.[1].trim(), privyazka: b.match(/^Факт к кадру:\s*(.+)$/m)?.[1] }));

let sovpali = 0;
for (const key of dni) {
  const y = YAML.parse(execFileSync('git', ['show', `${VETKA}:src/content/dni-shablon/izobreteniya/${key}.yaml`], { encoding: 'utf8' }));
  const kart = razobratKartochku(fs.readFileSync(path.join(UTV, `${key}.md`), 'utf8'));
  const str = faktyStranicy(y);
  const vse = [y.oblozhka, ...str.flatMap((f) => f.kadry), ...[y.figures, y.kadry].flat()].filter((k) => k?.src);
  const kadry = kadryKartochki(fs.readFileSync(path.join(UTV, `${key}.kadry.md`), 'utf8'))
    .map((k) => ({ ...k, obekt: vse.find((x) => x.src === k.fajl) ?? null }));
  const nomera = kart.fakty.map((f) => f.n);
  const fakty = new Map(nomera.map((n) => [n, { otryvok: '—', href: '—', pometka: 'документ' }])); // цитат у музея нет — сверяются места
  const { oshibki, kadry: razobr } = proverit({ nomera, fakty, kadry, video: {}, pometki: [], utverzhden: true });
  const r = [];
  oshibki.forEach((o) => r.push(`СТОП ${o}`));
  kart.fakty.forEach((f, j) => {
    const s = str[j];
    if (!s) return r.push(`факт ${f.n}: на странице нет`);
    if (s.zagolovok !== f.zagolovok) r.push(`факт ${f.n}: заголовок не слово в слово`);
    if (s.podrobnee !== f.podrobnee) r.push(`факт ${f.n}: «Подробнее» не слово в слово`);
  });
  if (str.length !== kart.fakty.length) r.push(`фактов: карточка ${kart.fakty.length}, страница ${str.length}`);
  const { oblozhka, kadrFakta, figures } = rasstavit(nomera, razobr, {});
  if (oblozhka?.src !== y.oblozhka?.src) r.push(`обложка: машина ${oblozhka?.src ?? 'нет'}, страница ${y.oblozhka?.src ?? 'нет'}`);
  nomera.forEach((n, j) => { const a = kadrFakta.get(n)?.src, b = str[j]?.kadry.map((k) => k.src) ?? [];
    if (a !== b[0]) r.push(`факт ${n}: кадр машины ${a ?? 'нет'}, страницы ${b[0] ?? 'нет'}`);
    b.slice(1).forEach((s) => r.push(`факт ${n}: на странице второй кадр ${s} — у машины он в галерее`)); });
  const g1 = figures.map((k) => k.src).join(' '), g2 = [y.figures, y.kadry].flat().filter((k) => k?.src).map((k) => k.src).join(' ');
  if (g1 !== g2) r.push(`галерея: машина [${g1}], страница [${g2}]`);
  if (!r.length) sovpali++;
  console.log(r.length ? `${key}: ${r.length} расхождений\n  ${r.join('\n  ')}` : `${key}: один в один`);
}
console.log(`изобретения: ${sovpali} из ${dni.length} совпали один в один`);
