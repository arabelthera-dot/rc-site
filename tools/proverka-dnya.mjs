#!/usr/bin/env node
// Проверка одного дня до push (Р776): node tools/proverka-dnya.mjs <музей> <ММ-ДД>.
// Те же функции, что у сборки, — на одном дне, без полной сборки и без public/ целиком:
//   карточка src/content/dni-shablon/<музей>/ММ-ДД.yaml — proveritKartochku (схема музея, стандарт дня, медиа — Р776);
//   запись src/content/days/<музей>/ММ-ДД.json — схема days из src/content.config.ts (shemaDnya);
//   копия src/data/utverzhdeno/<музей>/ММ-ДД.json — kartochkaUtv;
//   кадры XX века — kadryXX с фильтром по дню (закон показа, src/lib/zakon.mjs).
// Ошибки — теми же строками, что в сборке; есть ошибка — выход 1. Нет файла медиа — предупреждение, не ошибка.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const [muzei, key] = process.argv.slice(2);
if (!muzei || !/^\d\d-\d\d$/.test(key ?? '')) {
  console.error('запуск: node tools/proverka-dnya.mjs <музей> <ММ-ДД>');
  process.exit(1);
}
const oshibki = [];
const ok = (s) => console.log(`✓ ${s}`);

// Карточка шаблона дня — есть не у каждого дня.
const kartochka = path.join('src/content/dni-shablon', muzei, `${key}.yaml`);
if (fs.existsSync(kartochka)) {
  const { SKHEMY } = await import('../src/lib/dni-shablon.mjs');
  const { proveritKartochku } = await import('../src/lib/den-obshchee.mjs');
  if (!SKHEMY[muzei]) oshibki.push(`src/content/dni-shablon/${muzei}: у музея нет схемы карточки дня`);
  else {
    const k = proveritKartochku(kartochka, muzei, SKHEMY[muzei]);
    for (const s of k.preduprezhdeniya) console.warn(`[kartinki-fajly] ${s}`);
    if (k.oshibki.length) oshibki.push(...k.oshibki); else ok(`${kartochka}: схема и стандарт дня`);
  }
}

// Запись дня — коллекция days, как у Astro (InvalidContentEntryDataError).
const zapis = path.join('src/content/days', muzei, `${key}.json`);
if (fs.existsSync(zapis)) {
  const { shemaDnya } = await import('../src/lib/proverka-posta.mjs');
  const r = (await shemaDnya()).safeParse(JSON.parse(fs.readFileSync(zapis, 'utf8')));
  if (!r.success) oshibki.push(`InvalidContentEntryDataError: days → ${muzei}/${key} data does not match collection schema.\n`
    + r.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n'));
  else ok(`${zapis}: схема days`);
} else if (!fs.existsSync(kartochka)) oshibki.push(`нет дня ${muzei}/${key}: ни ${zapis}, ни ${kartochka}`);

// Копия утверждённой карточки — коллекция utverzhdeno.
const utv = path.join('src/data/utverzhdeno', muzei, `${key}.json`);
if (fs.existsSync(utv)) {
  const { kartochkaUtv } = await import('../src/lib/skhema-utverzhdeno.mjs');
  const r = kartochkaUtv.safeParse(JSON.parse(fs.readFileSync(utv, 'utf8')));
  if (!r.success) oshibki.push(`InvalidContentEntryDataError: utverzhdeno → ${muzei}/${key} data does not match collection schema.\n`
    + r.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n'));
  else ok(`${utv}: схема utverzhdeno`);
}

// Закон показа картинок — та же функция, что в хуке сборки src/integrations/zakon.mjs.
const { kadryXX, bezOsnovaniya } = await import('../src/lib/zakon.mjs');
const xx = kadryXX('.', { museum: muzei, key });
if (xx.bez.length) oshibki.push(...xx.bez.map(bezOsnovaniya));
else ok(`кадры XX века: ${xx.vsego}, без основания 0`);

if (oshibki.length) {
  console.error(`\n✗ ${muzei}/${key} — ошибок ${oshibki.length}:\n${oshibki.join('\n')}`);
  // Лёгкая копия: файл есть в main, но не выписан sparse-checkout — подсказка, как его добавить; ошибка остаётся.
  const nuzhny = [...new Set(oshibki.join('\n').match(/public\/[^\s,)]+/g) ?? [])].filter((f) => !fs.existsSync(f));
  const vGit = nuzhny.length ? spawnSync('git', ['ls-files', '--', ...nuzhny], { encoding: 'utf8' }).stdout.split('\n').filter(Boolean) : [];
  if (vGit.length) console.error(`\nв копии не выписаны файлы из main — добавить и проверить снова:\n  git sparse-checkout add ${vGit.map((f) => `/${f}`).join(' ')}`);
  process.exit(1);
}
console.log(`\n✓ ${muzei}/${key} — чисто`);
