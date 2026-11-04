// Сверщик страницы дня с утверждённым (Р506, Сергей 04.11.2026: «делай всё, что нужно для автоматизации»).
// Корень Р503/Р505: страница «Не сдаются» собиралась из старой, а не из утверждённой карточки, — отчёт одно, страница другое.
// Правда — копия карточки src/data/utverzhdeno/ne-sdayutsya/ММ-ДД.json (scripts/utverzhdeno-kopiya.mjs из workspace).
// По каждому дню, где есть и страница src/content/dni-shablon/ne-sdayutsya/ММ-ДД.yaml, и копия карточки:
//  а) факты страницы (все блоки fakty[].udary[] подряд) — те же 15 и в порядке «poryadok» карточки;
//     заголовок сравнивается после чистки тегов, ё=е, кавычек и тире; правка слов допустима, другой факт — нет;
//  б) кадр у факта — тот, что привязан к нему в «Факт к кадру» (ns-material), если кадр в привязке есть;
//  в) ни один кадр (номер Госкаталога или файл) не повторяется: обложка, кадры фактов, галерея figures;
//  г) нет двух фактов про одно и то же — ни в карточке, ни на странице: общие редкие слова и сочетания
//     (основы от 5 букв, имена, числа, названия в кавычках), вес — по редкости среди всех карточек музея.
//     Пара, которую человек проверил и признал разными фактами, пишется в копию карточки:
//     "ne_povtory": [{ "para": "5-11", "pochemu": "…" }] — тогда она не повтор ни в карточке, ни на странице.
// Обычный режим — дни, изменённые в заявке (git diff с базой): красное — код 1 и ::error:: по-русски.
// --vse — таблица по всем дням и полный список повторов фактов, без падения (долг). --proba — заведомые случаи.
// Откат — удалить шаг sverka-utverzhdeno из .github/workflows/proverka.yml.
// Запуск: node scripts/sverka-utverzhdeno.mjs [--proba] [--vse] [--baza origin/main] [ММ-ДД …]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';

const KOREN = new URL('..', import.meta.url).pathname;
const STR = 'src/content/dni-shablon/ne-sdayutsya';
const UTV = 'src/data/utverzhdeno/ne-sdayutsya';
const est = (k) => process.argv.includes(k);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

// ——— чистка и слова ———
export const chistka = (t) => String(t ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').toLowerCase()
  .replace(/ё/g, 'е').replace(/[«»„“”"'‘’`]/g, '').replace(/[—–‑-]/g, ' ').replace(/[.,:;!?…()[\]/]/g, ' ')
  .replace(/\s+/g, ' ').trim();
const STOP = new Set(('которые который которая которого котором которой когда после перед через потом тогда только чтобы '
  + 'этого этому этот этой этом своей своим своих свою своего самого самой самым более менее очень между также '
  + 'всего всех всеми было были была будет будут может могли стали стало стала став даже ещё еще почти около '
  + 'сразу снова потому поэтому хотя вместе против здесь никто ничего потом пока затем однако всегда нельзя '
  + 'десять фактов источник подробнее').split(' '));
const osnova = (w) => (/^\d+$/.test(w) ? w : w.slice(0, 5));
// Значимые основы: слова от 5 букв (не служебные), числа от двух цифр, имена (заглавная не в начале фразы),
// названия в кавычках — целиком одной основой.
export function slova(t) {
  const syroj = String(t ?? '').replace(/<[^>]+>/g, ' ').replace(/ё/g, 'е').replace(/Ё/g, 'Е');
  const out = new Set();
  for (const m of syroj.matchAll(/«([^«»]{3,40})»/g)) out.add(`«${chistka(m[1])}»`);
  for (const w of chistka(syroj).split(' ')) {
    if (/^\d{2,}$/.test(w)) { out.add(w); continue; }
    if (w.length < 5 || STOP.has(w) || /\d/.test(w)) continue;
    out.add(osnova(w));
  }
  for (const m of syroj.matchAll(/(?<![.!?]\s|^)\b([А-ЯЕ][а-яе]{3,})/gu)) {
    const w = chistka(m[1]); if (w.length >= 4 && !STOP.has(w)) out.add(osnova(w));
  }
  return out;
}
const zhakkar = (a, b) => { let o = 0; for (const x of a) if (b.has(x)) o++; return o / Math.max(1, Math.min(a.size, b.size)); };

// ——— повторы фактов (г) ———
// Повтор — одна и та же деталь рассказана в двух фактах. Признаки (вес — редкость по всем утверждённым карточкам
// музея, log N/df, так что «сказал», «героя», «приказ» почти не весят, а «крюйт-камера», «Стройников» — много):
//  — общие слова пары, которые в этом дне есть не больше чем у трёх фактов (имя героя дня не в счёт);
//  — те же слова ещё раз, если слово стоит в заголовке (повтор утверждения, а не фона);
//  — общие сочетания двух слов подряд, которых нет больше ни в одном факте музея («крюйт-камера», «11 мая 1829»).
export const POROG = +arg('--porog', 29); // подобран на 01-02 (2–7, 6–11, 3–10) и 10 днях, проверенных глазами
const toks = (t) => chistka(t).split(' ').filter((w) => w.length >= 4 || /^\d{2,}$/.test(w)).filter((w) => !STOP.has(w)).map(osnova);
const pary2 = (t) => { const a = toks(t); const s = new Set(); for (let i = 0; i + 1 < a.length; i++) s.add(`${a[i]} ${a[i + 1]}`); return s; };
let KORPUS = null;
const klyuch = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const nePovtory = (utv) => new Set((utv.ne_povtory || []).map((x) => klyuch(...x.para.split('-').map(Number))));
export function korpus() {
  if (KORPUS) return KORPUS;
  const dir = path.join(KOREN, UTV);
  const df = new Map(); const df2 = new Map(); let N = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    for (const fk of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).fakty) {
      N++;
      for (const x of slova(`${fk.zagolovok} ${fk.podrobnee}`)) df.set(x, (df.get(x) || 0) + 1);
      for (const x of pary2(`${fk.zagolovok} ${fk.podrobnee}`)) df2.set(x, (df2.get(x) || 0) + 1);
    }
  }
  KORPUS = { df, df2, N }; return KORPUS;
}
export function povtory(fakty, porog = POROG, ne = new Set()) {
  const K = korpus();
  const ves1 = (x) => Math.log(K.N / Math.max(1, K.df.get(x) || 1));
  const tekst = (f) => `${f.zagolovok} ${f.podrobnee}`;
  const sl = fakty.map((f) => slova(tekst(f)));
  const zag = fakty.map((f) => slova(f.zagolovok));
  const p2 = fakty.map((f) => pary2(tekst(f)));
  const df = new Map();
  for (const s of sl) for (const x of s) df.set(x, (df.get(x) || 0) + 1);
  const par = [];
  for (let i = 0; i < fakty.length; i++) for (let j = i + 1; j < fakty.length; j++) {
    const obshchie = [...sl[i]].filter((x) => sl[j].has(x) && df.get(x) <= 3).sort((a, b) => ves1(b) - ves1(a));
    const vZag = obshchie.filter((x) => zag[i].has(x) || zag[j].has(x));
    const redkie2 = [...p2[i]].filter((x) => p2[j].has(x) && (K.df2.get(x) || 0) <= 2);
    const ves = obshchie.reduce((s, x) => s + ves1(x), 0) + vZag.reduce((s, x) => s + ves1(x), 0)
      + redkie2.length * Math.log(K.N / 2);
    if (ves >= porog && !ne.has(klyuch(fakty[i].n, fakty[j].n))) par.push({ a: fakty[i].n, b: fakty[j].n, ves: +ves.toFixed(1), slova: [...new Set([...redkie2, ...obshchie])] });
  }
  return par.sort((x, y) => y.ves - x.ves);
}

// ——— страница ———
const nomerGk = (k) => String(k?.data_source ?? '').match(/goskatalog\.ru\/portal\/#\/collections\?id=(\d+)/)?.[1]
  || String(k?.src ?? '').match(/(?:gk|goskatalog)-(\d{5,})/)?.[1] || '';
export function razobratStranicu(y) {
  const udary = [];
  for (const blok of y.fakty || []) for (const u of blok.udary || []) {
    const sum = String(u.summary ?? '');
    const zag = sum.match(/<b>([\s\S]*?)<\/b>/)?.[1] ?? sum;
    const kadry = [u.kadr].flat().filter(Boolean);
    udary.push({ zagolovok: zag, podrobnee: [sum.replace(zag, ''), ...[u.det].flat()].filter(Boolean).join(' '), kadry });
  }
  const vse = [];
  if (y.oblozhka?.src) vse.push({ gde: 'обложка', k: y.oblozhka });
  udary.forEach((u, i) => u.kadry.forEach((k) => vse.push({ gde: `факт ${i + 1}`, k })));
  for (const k of [y.figures, y.kadry].flat().filter((x) => x?.src)) vse.push({ gde: 'галерея', k });
  return { udary, kadry: vse };
}

// Какому факту карточки соответствует факт страницы: заголовок, а если заголовок переписан — подробности.
function shodstvo(u, f) {
  if (chistka(u.zagolovok) === chistka(f.zagolovok)) return 1;
  const z = zhakkar(slova(u.zagolovok), slova(f.zagolovok));
  const d = zhakkar(slova(u.podrobnee), slova(f.podrobnee));
  return Math.max(z, 0.9 * d);
}
const ODIN = 0.5; // ниже — это уже не тот же факт

export function sverit(utv, y) {
  const o = [];
  const str = razobratStranicu(y);
  const poK = new Map(utv.fakty.map((f) => [f.n, f]));
  // а) состав и порядок
  if (str.udary.length !== utv.poryadok.length) o.push(`фактов на странице ${str.udary.length}, в карточке ${utv.poryadok.length}`);
  const nomer = str.udary.map((u, i) => {
    let luchshij = null; let s = 0;
    for (const f of utv.fakty) { const t = shodstvo(u, f); if (t > s) { s = t; luchshij = f.n; } }
    const zhdu = utv.poryadok[i];
    const sZhdu = zhdu ? shodstvo(u, poK.get(zhdu)) : 0;
    if (zhdu && sZhdu >= ODIN && sZhdu >= s - 0.05) return zhdu;
    const kratko = chistka(u.zagolovok).slice(0, 70);
    if (s >= ODIN) o.push(`факт ${i + 1} — это факт ${luchshij} карточки, а по порядку здесь факт ${zhdu}: «${kratko}»`);
    else o.push(`факт ${i + 1} не из карточки (по порядку здесь факт ${zhdu}): «${kratko}»`);
    return s >= ODIN ? luchshij : null;
  });
  const nashli = new Set(nomer.filter(Boolean));
  const net = utv.poryadok.filter((n) => !nashli.has(n));
  if (net.length) o.push(`нет на странице фактов карточки: ${net.join(', ')}`);
  // б) кадр к факту
  const kadrK = (k) => utv.kadry.find((x) => (x.gk && x.gk === nomerGk(k)) || x.fajl === k.src);
  str.udary.forEach((u, i) => {
    const n = nomer[i]; if (!n) return;
    for (const k of u.kadry) {
      const m = kadrK(k);
      if (m && m.fakt !== n && !m.takzhe.includes(n)) o.push(`у факта ${i + 1} (факт ${n} карточки) чужой кадр ${m.gk || m.fajl} — он к факту ${[m.fakt, ...m.takzhe].join(' или ')}`);
    }
  });
  // в) повтор кадров
  const vid = new Map();
  for (const { gde, k } of str.kadry) {
    const ids = [...new Set([nomerGk(k) && `Госкаталог ${nomerGk(k)}`, k.src].filter(Boolean))];
    const id = ids.find((x) => vid.has(x)); // номер и файл одного кадра — одна ошибка
    if (id && vid.get(id) !== gde) o.push(`кадр повторяется (${id.replace(/^\/muzei\/ne-sdayutsya\//, '')}): ${vid.get(id)} и ${gde}`);
    else if (id) o.push(`кадр повторяется (${id}) дважды: ${gde}`);
    for (const x of ids) vid.set(x, gde);
  }
  // г) повторы фактов — в карточке и на странице
  const ne = nePovtory(utv);
  const pk = povtory(utv.fakty, POROG, ne);
  for (const p of pk) o.push(`в карточке два факта про одно: ${p.a} и ${p.b} (${p.slova.slice(0, 4).join(', ')})`);
  const pStr = povtory(str.udary.map((u, i) => ({ n: i + 1, zagolovok: u.zagolovok, podrobnee: u.podrobnee })));
  const izKart = new Set(pk.map((p) => `${p.a}-${p.b}`));
  for (const p of pStr) {
    const a = nomer[p.a - 1]; const b = nomer[p.b - 1];
    if (a && b && (izKart.has(klyuch(a, b)) || ne.has(klyuch(a, b)))) continue; // уже сказано про карточку или проверено человеком
    o.push(`на странице два факта про одно: ${p.a} и ${p.b} (${p.slova.slice(0, 4).join(', ')})`);
  }
  return { o: [...new Set(o)], povtoryKart: pk };
}

const chitatUtv = (key) => JSON.parse(fs.readFileSync(path.join(KOREN, UTV, `${key}.json`), 'utf8'));
const chitatStr = (key) => YAML.parse(fs.readFileSync(path.join(KOREN, STR, `${key}.yaml`), 'utf8'), { maxAliasCount: -1 });

if (import.meta.url === `file://${process.argv[1]}`) glavnoe();

function glavnoe() {
// ——— проба ———
if (est('--proba')) {
  const key = '01-02';
  const utv = chitatUtv(key);
  const po = (n) => utv.fakty.find((f) => f.n === n);
  const udar = (f, kadr) => ({ summary: `<b>${f.zagolovok}</b>`, det: [f.podrobnee], ...(kadr ? { kadr } : {}) });
  const kd = (gk) => { const m = utv.kadry.find((x) => x.gk === gk); return { src: m.fajl, data_source: `https://goskatalog.ru/portal/#/collections?id=${gk}` }; };
  // хороший день: порядок карточки, кадры по привязке, без повторов; карточка — без найденных повторов фактов
  const chistaya = { ...utv, fakty: utv.fakty.filter((f) => ![7, 10, 11].includes(f.n)) };
  chistaya.poryadok = chistaya.fakty.map((f) => f.n);
  const horoshij = () => ({ oblozhka: { src: '/muzei/ne-sdayutsya/merkuriy-aivazovsky-1892.jpg', data_source: 'https://goskatalog.ru/portal/#/collections?id=54675768' },
    fakty: [{ udary: chistaya.poryadok.map((n) => udar(
      // правка слов допустима: ё→е, другие кавычки и тире, слово заменено
      n === 1 ? { ...po(1), zagolovok: po(1).zagolovok.replace(/«/g, '"').replace(/»/g, '"').replace('бился', 'сражался') } : po(n),
      n === 13 ? kd('16117881') : n === 5 ? kd('24083009') : null)) }],
    figures: [{ src: '/muzei/ne-sdayutsya/merkuriy-aivazovsky-1848.jpg', data_source: 'https://goskatalog.ru/portal/#/collections?id=20764039' }] });
  const sluchai = [
    ['хороший день', chistaya, horoshij(), null],
    ['переставлен факт', chistaya, (() => { const y = horoshij(); const u = y.fakty[0].udary; [u[0], u[2]] = [u[2], u[0]]; return y; })(), /а по порядку здесь факт/],
    ['подменён факт', chistaya, (() => { const y = horoshij(); y.fakty[0].udary[3] = udar({ zagolovok: 'Экипаж не кричал «Русские не сдаются!» — это поздняя легенда', podrobnee: 'Знаменитый возглас придумали позднее, в рапортах его нет.' }); return y; })(), /не из карточки/],
    ['чужой кадр', chistaya, (() => { const y = horoshij(); y.fakty[0].udary[0].kadr = kd('16117881'); return y; })(), /чужой кадр/],
    ['повтор кадра', chistaya, (() => { const y = horoshij(); y.figures.push(kd('16117881')); return y; })(), /кадр повторяется/],
    ['повтор кадра на обложке', chistaya, (() => { const y = horoshij(); y.oblozhka = kd('24083009'); return y; })(), /кадр повторяется/],
    ['повтор факта на странице', chistaya, (() => { const y = horoshij(); y.fakty[0].udary.push(udar(po(7))); return y; })(), /на странице два факта про одно/],
    ['повтор факта 2–7 в карточке', utv, null, /в карточке два факта про одно: 2 и 7/],
    ['повтор факта 6–11 в карточке', utv, null, /в карточке два факта про одно: 6 и 11/],
    ['повтор факта 3–10 в карточке', utv, null, /в карточке два факта про одно: 3 и 10/],
  ];
  let mimo = 0;
  for (const [imya, u, y, zhdu] of sluchai) {
    const { o } = sverit(u, y || horoshij());
    const ok = zhdu ? o.some((x) => zhdu.test(x)) : o.length === 0;
    if (!ok) { mimo++; console.log(`проба ✗ ${imya}: ${o.join('; ') || 'ничего не найдено'}`); }
  }
  if (mimo) { console.log(`::error::sverka-utverzhdeno: проба мимо — ${mimo} из ${sluchai.length}`); process.exit(1); }
  console.log(`sverka-utverzhdeno: проба ${sluchai.length} из ${sluchai.length}`);
  process.exit(0);
}

// ——— какие дни ———
const vseKarty = fs.readdirSync(path.join(KOREN, UTV)).map((f) => f.match(/^(\d\d-\d\d)\.json$/)?.[1]).filter(Boolean).sort();
const estStr = (k) => fs.existsSync(path.join(KOREN, STR, `${k}.yaml`));
let dni = process.argv.slice(2).filter((x) => /^\d\d-\d\d$/.test(x));
if (!dni.length && !est('--vse')) {
  const baza = arg('--baza', process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main');
  // Страница — новая или изменённая; копия карточки — только изменённая: первая копия всех 31 дня (эта заявка)
  // не роняет дни, чьи страницы собраны раньше, — их долг печатает --vse.
  let izm;
  try {
    const diff = (filtr, put) => execFileSync('git', ['diff', '--name-only', `--diff-filter=${filtr}`, `${baza}...HEAD`, '--', put], { cwd: KOREN, encoding: 'utf8' });
    izm = diff('AMR', STR) + diff('MR', UTV);
  } catch {
    console.log(`::error::sverka-utverzhdeno: нет базы ${baza} — изменённые дни не определить`);
    process.exit(1);
  }
  dni = [...new Set(izm.split('\n').map((f) => f.match(/(\d\d-\d\d)\.(?:yaml|json)$/)?.[1]).filter(Boolean))].sort();
  if (!dni.length) { console.log('sverka-utverzhdeno: в заявке нет изменённых страниц и карточек «Не сдаются» — проверять нечего'); process.exit(0); }
}
if (!dni.length) dni = vseKarty;

const itog = [];
for (const key of dni) {
  if (!vseKarty.includes(key)) { itog.push({ key, net: 'нет утверждённой карточки' }); continue; }
  const utv = chitatUtv(key);
  if (!estStr(key)) { itog.push({ key, net: 'страницы ещё нет', povtoryKart: povtory(utv.fakty, POROG, nePovtory(utv)) }); continue; }
  itog.push({ key, ...sverit(utv, chitatStr(key)) });
}
const proshli = itog.filter((r) => r.o && !r.o.length);
const krasnye = itog.filter((r) => r.o?.length);
if (est('--vse')) {
  console.log('день  | итог      | что не так');
  for (const r of itog) console.log(`${r.key} | ${r.net ? 'не сверяли' : r.o.length ? 'КРАСНЫЙ  ' : 'зелёный  '} | ${r.net || r.o.join('; ') || '—'}`);
  console.log('\nПовторы фактов в утверждённых карточках:');
  for (const r of itog) for (const p of r.povtoryKart || []) console.log(`${r.key}  ${p.a}–${p.b}  вес ${p.ves}: ${p.slova.join(', ')}`);
  console.log(`\nsverka-utverzhdeno: сверено ${proshli.length + krasnye.length}, зелёных ${proshli.length}, красных ${krasnye.length}; без страницы ${itog.filter((r) => r.net).length}`);
  process.exit(0);
}
for (const r of itog.filter((x) => x.net && x.net !== 'страницы ещё нет')) console.log(`sverka-utverzhdeno: ${r.key} — ${r.net}, сверять не с чем`);
for (const r of krasnye) for (const x of r.o) console.log(`::error::«Не сдаются» ${r.key}: ${x}`);
console.log(`sverka-utverzhdeno: дней ${proshli.length + krasnye.length}, зелёных ${proshli.length}, красных ${krasnye.length}`);
process.exit(krasnye.length ? 1 : 0);

}