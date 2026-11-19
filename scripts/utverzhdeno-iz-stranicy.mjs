// Утверждённая карточка из текущей страницы дня (Р511/Р512, 04.11.2026): у музея, где страницы дней утверждены
// Сергеем, а карточек утверждённого нет (январь «Что изобрели русские первыми в мире»), сверщику не с чем сверять.
// Страница и есть утверждённое — машина переписывает её в карточку того же вида, что knowledge/ns-utverzhdeno/ns-ММ-ДД.md:
//   ММ-ДД.md       — заголовок дня, «Порядок на странице:», блоки «N. (стр.) заголовок» / «Подробнее:» / «Источник:»;
//   ММ-ДД.kadry.md — «Кадр N» / «Файл:» / «Источник:» / «Факт к кадру: N» (вид ns-material, разборщик razobratMaterial).
// Тексты не меняются ни на букву: заголовок — <b>…</b> из summary, «Подробнее» — остаток summary и абзацы det
// через пробел (как их склеивает izYaml сверщика). После записи каждая карточка читается разборщиками
// razobratKartochku / razobratMaterial и сравнивается со страницей; расхождение — код 1.
// --povtory — пары фактов дня про одно (тот же счёт, что «г» в sverka-utverzhdeno.mjs, но редкость слов — по
// карточкам этого музея) и повтор кадров внутри дня и между днями; ничего не сливается, список — человеку.
// Запуск: node scripts/utverzhdeno-iz-stranicy.mjs [--muzei izobreteniya] [--kuda ~/workspace/knowledge/utverzhdeno]
//         [--utverzhdeno "Р512, 04.11.2026"] [--povtory] [ММ-ДД …]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import { razobratKartochku, razobratMaterial } from './utverzhdeno-kopiya.mjs';
import { chistka, slova, POROG } from './sverka-utverzhdeno.mjs';
import { izYaml } from './sverka/chitat-stranicu.mjs';

const argv = process.argv.slice(2);
const vzyat = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv.splice(i, 2)[1] : d; };
const MUZEI = vzyat('--muzei', 'izobreteniya');
const KUDA = path.join(vzyat('--kuda', path.join(os.homedir(), 'workspace/knowledge/utverzhdeno')), MUZEI);
const UTV = vzyat('--utverzhdeno', 'Р512, 04.11.2026');
const POVTORY = argv.includes('--povtory'); if (POVTORY) argv.splice(argv.indexOf('--povtory'), 1);
const STR = new URL(`../src/content/dni-shablon/${MUZEI}/`, import.meta.url).pathname;
const MES = ['ЯНВАРЯ', 'ФЕВРАЛЯ', 'МАРТА', 'АПРЕЛЯ', 'МАЯ', 'ИЮНЯ', 'ИЮЛЯ', 'АВГУСТА', 'СЕНТЯБРЯ', 'ОКТЯБРЯ', 'НОЯБРЯ', 'ДЕКАБРЯ'];

const stroka = (t) => String(t ?? '').replace(/\s*\n\s*/g, ' ').trim(); // в карточке одна строка на поле

// Факты страницы по порядку: заголовок, «Подробнее», источник, кадры.
export function faktyStranicy(y) {
  const out = [];
  for (const blok of y.fakty || []) for (const u of blok.udary || []) {
    const sum = String(u.summary ?? '');
    const b = sum.match(/<b>([\s\S]*?)<\/b>/);
    const zagolovok = stroka(b ? b[1] : sum);
    const ostatok = b ? sum.replace(b[0], '') : '';
    const podrobnee = stroka([ostatok, ...[u.det].flat()].map(stroka).filter(Boolean).join(' '));
    out.push({ blok: blok.kicker || blok.h2 || '', zagolovok, podrobnee,
      istochnik: stroka(u.src).replace(/^Источник:\s*/, ''), kadry: [u.kadr].flat().filter((k) => k?.src) });
  }
  return out;
}

export function kartochka(key, y) {
  const fakty = faktyStranicy(y);
  const [mm, dd] = key.split('-').map(Number);
  const h1 = stroka(String(y.lead?.h1 ?? y.head?.sobytie ?? '').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, ''));
  const s = [`${dd} ${MES[mm - 1]} · ${h1.toUpperCase()}`, '',
    `Утверждено Сергеем (${UTV}): день сделан и утверждён на сайте; карточка снята машиной со страницы `
    + `src/content/dni-shablon/${MUZEI}/${key}.yaml (scripts/utverzhdeno-iz-stranicy.mjs), тексты — как на странице, слово в слово.`, '',
    `Порядок на странице: ${fakty.length > 1 ? `1–${fakty.length}` : '1'}`];
  let blok = null;
  fakty.forEach((f, i) => {
    if (f.blok !== blok) { blok = f.blok; s.push('', `БЛОК: ${blok.toUpperCase()}`); }
    s.push('', `${i + 1}. (стр.) ${f.zagolovok}`, `Подробнее: ${f.podrobnee}`);
    if (f.istochnik) s.push(`Источник: ${f.istochnik}`);
  });
  const kadry = [];
  if (y.oblozhka?.src) kadry.push({ k: y.oblozhka, fakt: 'нет (обложка дня)' });
  fakty.forEach((f, i) => f.kadry.forEach((k) => kadry.push({ k, fakt: String(i + 1) })));
  for (const k of [y.figures, y.kadry].flat().filter((x) => x?.src)) kadry.push({ k, fakt: 'нет (галерея)' });
  const m = [`# ${key} — кадры страницы по фактам (${MUZEI})`, '',
    'Снято машиной со страницы (scripts/utverzhdeno-iz-stranicy.mjs): какой кадр стоит у какого факта карточки.'];
  kadry.forEach(({ k, fakt }, i) => {
    m.push('', `Кадр ${i + 1}`, `Файл: ${k.src}`, `Источник: ${stroka(k.data_source) || '—'}`, `Факт к кадру: ${fakt}`);
    if (k.alt) m.push(`Что на кадре: ${stroka(k.alt)}`);
  });
  return { fakty, kadry, md: `${s.join('\n')}\n`, kadryMd: `${m.join('\n')}\n` };
}

// Разборщики сверщика читают ровно то, что на странице.
function proverka(key, k) {
  const o = [];
  const r = razobratKartochku(k.md);
  if (r.fakty.length !== k.fakty.length) o.push(`разборщик видит ${r.fakty.length} фактов, на странице ${k.fakty.length}`);
  if (String(r.poryadok) !== String(k.fakty.map((_, i) => i + 1))) o.push(`порядок ${r.poryadok}`);
  k.fakty.forEach((f, i) => {
    const p = r.fakty[i];
    if (!p || p.n !== i + 1) o.push(`факт ${i + 1}: номер не прочитан`);
    else if (p.zagolovok !== f.zagolovok) o.push(`факт ${i + 1}: заголовок прочитан иначе`);
    else if (p.podrobnee !== f.podrobnee) o.push(`факт ${i + 1}: «Подробнее» прочитано иначе`);
  });
  const mk = razobratMaterial(k.kadryMd);
  if (mk.length !== k.kadry.length) o.push(`разборщик видит ${mk.length} кадров, на странице ${k.kadry.length}`);
  mk.forEach((x, i) => {
    const z = k.kadry[i]; if (!z) return;
    if (x.fajl !== z.k.src) o.push(`кадр ${i + 1}: файл прочитан иначе`);
    if (String(x.fakt ?? 'нет') !== (/^\d+$/.test(z.fakt) ? z.fakt : 'нет')) o.push(`кадр ${i + 1}: факт прочитан иначе`);
  });
  return o.map((x) => `${key}: ${x}`);
}

// ——— повторы: счёт «г» из sverka-utverzhdeno.mjs (korpus там прибит к «Не сдаются»), редкость — по этому музею ———
// служебные слова — копия STOP сверщика (там не экспортирован)
const STOP = new Set(('которые который которая которого котором которой когда после перед через потом тогда только чтобы '
  + 'этого этому этот этой этом своей своим своих свою своего самого самой самым более менее очень между также '
  + 'всего всех всеми было были была будет будут может могли стали стало стала став даже ещё еще почти около '
  + 'сразу снова потому поэтому хотя вместе против здесь никто ничего потом пока затем однако всегда нельзя '
  + 'десять фактов источник подробнее').split(' '));
const toks = (t) => chistka(t).split(' ').filter((w) => w.length >= 4 || /^\d{2,}$/.test(w)).filter((w) => !STOP.has(w))
  .map((w) => (/^\d+$/.test(w) ? w : w.slice(0, 5)));
const pary2 = (t) => { const a = toks(t); const s = new Set(); for (let i = 0; i + 1 < a.length; i++) s.add(`${a[i]} ${a[i + 1]}`); return s; };
function povtoryMuzeya(dni) {
  const df = new Map(); const df2 = new Map(); let N = 0;
  for (const { fakty } of dni) for (const f of fakty) {
    N++; const t = `${f.zagolovok} ${f.podrobnee}`;
    for (const x of slova(t)) df.set(x, (df.get(x) || 0) + 1);
    for (const x of pary2(t)) df2.set(x, (df2.get(x) || 0) + 1);
  }
  const ves1 = (x) => Math.log(N / Math.max(1, df.get(x) || 1));
  const vse = [];
  for (const { key, fakty } of dni) {
    const sl = fakty.map((f) => slova(`${f.zagolovok} ${f.podrobnee}`));
    const zag = fakty.map((f) => slova(f.zagolovok));
    const p2 = fakty.map((f) => pary2(`${f.zagolovok} ${f.podrobnee}`));
    const dfDen = new Map(); for (const s of sl) for (const x of s) dfDen.set(x, (dfDen.get(x) || 0) + 1);
    for (let i = 0; i < fakty.length; i++) for (let j = i + 1; j < fakty.length; j++) {
      const obshchie = [...sl[i]].filter((x) => sl[j].has(x) && dfDen.get(x) <= 3).sort((a, b) => ves1(b) - ves1(a));
      const vZag = obshchie.filter((x) => zag[i].has(x) || zag[j].has(x));
      const redkie2 = [...p2[i]].filter((x) => p2[j].has(x) && (df2.get(x) || 0) <= 2);
      const ves = obshchie.reduce((s, x) => s + ves1(x), 0) + vZag.reduce((s, x) => s + ves1(x), 0) + redkie2.length * Math.log(N / 2);
      if (ves >= POROG) vse.push({ key, a: i + 1, b: j + 1, ves: +ves.toFixed(1), slova: [...new Set([...redkie2, ...obshchie])].slice(0, 5),
        za: fakty[i].zagolovok, zb: fakty[j].zagolovok });
    }
  }
  return vse.sort((x, y) => y.ves - x.ves);
}
function povtoryKadrov(dni) {
  const o = []; const gde = new Map();
  for (const { key, y } of dni) {
    const vid = new Map();
    for (const { gde: g, kadr, src } of izYaml(y).vse_kadry.filter((x) => /^(обложка|факт \d+|галерея)$/.test(x.gde))) {
      const ids = [...new Set([/^\d+$/.test(kadr) ? `Госкаталог ${kadr}` : kadr, src].filter(Boolean))];
      const id = ids.find((x) => vid.has(x));
      if (id) o.push(`${key}: кадр ${id} — ${vid.get(id)} и ${g}`);
      for (const x of ids) {
        vid.set(x, g);
        const byl = gde.get(x); if (byl && byl.key !== key) o.push(`${byl.key} (${byl.g}) и ${key} (${g}): один кадр ${x}`);
        if (!byl) gde.set(x, { key, g });
      }
    }
  }
  return [...new Set(o)];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dni = (argv.length ? argv : fs.readdirSync(STR).map((f) => f.match(/^(\d\d-\d\d)\.yaml$/)?.[1]).filter(Boolean)).sort();
  fs.mkdirSync(KUDA, { recursive: true });
  const gotovo = []; const oshibki = [];
  for (const key of dni) {
    const y = YAML.parse(fs.readFileSync(path.join(STR, `${key}.yaml`), 'utf8'), { maxAliasCount: -1 });
    const k = kartochka(key, y);
    fs.writeFileSync(path.join(KUDA, `${key}.md`), k.md);
    fs.writeFileSync(path.join(KUDA, `${key}.kadry.md`), k.kadryMd);
    const o = proverka(key, { ...k, md: fs.readFileSync(path.join(KUDA, `${key}.md`), 'utf8'), kadryMd: fs.readFileSync(path.join(KUDA, `${key}.kadry.md`), 'utf8') });
    oshibki.push(...o);
    gotovo.push({ key, y, fakty: k.fakty, chisto: !o.length });
  }
  for (const x of oshibki) console.log(`::error::utverzhdeno-iz-stranicy: ${x}`);
  console.log(`utverzhdeno-iz-stranicy: ${MUZEI} — записано ${gotovo.length}, разборщик прочитал без ошибок ${gotovo.filter((x) => x.chisto).length} из ${gotovo.length} → ${KUDA}`);
  for (const d of gotovo) console.log(`  ${d.key}: фактов ${d.fakty.length}${d.chisto ? '' : ' — ОШИБКА'}`);
  if (POVTORY) {
    const pf = povtoryMuzeya(gotovo);
    console.log(`\nПовторы фактов (порог ${POROG}): ${pf.length}`);
    for (const p of pf) console.log(`  ${p.key}: ${p.a} и ${p.b} (вес ${p.ves}; ${p.slova.join(', ')}) — «${p.za}» / «${p.zb}»`);
    const pk = povtoryKadrov(gotovo);
    console.log(`\nПовторы кадров: ${pk.length}`);
    for (const x of pk) console.log(`  ${x}`);
  }
  if (oshibki.length) process.exitCode = 1;
}
