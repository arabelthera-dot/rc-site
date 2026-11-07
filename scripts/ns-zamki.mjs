#!/usr/bin/env node
// Замки карточка→страница «Русские не сдаются» (r543/r544, пункт 3; Р504, Р507, Р534–Р536).
// Страница дня красная, если:
//   а) хук страницы (lead.hook, подпись ролика) или название (head.sobytie) ≠ карточке календаря
//      src/content/days/ne-sdayutsya/ММ-ДД.json;
//   б) в видимом тексте дня есть оговорка (Р504: «мы победили, мы первые», без оговорок) — слова СЛОВА ниже;
//   в) факт страницы не из утверждённой карточки src/data/utverzhdeno/ne-sdayutsya/ММ-ДД.json
//      или у факта нет отметки utverzhden.
// Запуск:
//   node scripts/ns-zamki.mjs --proba   — заведомо плохой образец обязан упасть по всем трём замкам, хороший — пройти;
//   node scripts/ns-zamki.mjs           — дни музея, изменённые в заявке (git diff с origin/main), строго: ошибка → выход 1;
//   node scripts/ns-zamki.mjs ММ-ДД …   — названные дни, строго (так зовёт scripts/ns-konveyer.mjs);
//   node scripts/ns-zamki.mjs --vse     — все дни, только отчёт (долг).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { izYaml } from './sverka/chitat-stranicu.mjs';
import { sverit } from './sverka-utverzhdeno.mjs';
import { POMETKI_SLUZHEBNYE } from '../src/lib/den-obshchee.mjs';

const KOREN = new URL('..', import.meta.url).pathname;
const MUZEY = 'ne-sdayutsya';
const STR = `src/content/dni-shablon/${MUZEY}`;
const KAL = `src/content/days/${MUZEY}`;
const UTV = `src/data/utverzhdeno/${MUZEY}`;

// б) Оговорки, которых в тексте дня быть не может (Р504). «Легендарный» — не оговорка: (?![а-яё]) после окончаний;
// «стал легендой» — похвала, «под легендой» — прикрытие разведчика, тоже не оговорки (01-18 Кузнецов, r544).
export const SLOVA = [
  ['легенда', /(?<![а-яё])(?<!(?:стал[аио]?|под)\s+)легенд(?:а|ы|е|у|ой|ою|ам|ами|ах)?(?![а-яё])/i],
  ['историки спорят', /историки\s+(?:до\s+сих\s+пор\s+)?спорят/i],
  ['по преданию', /по\s+преданию/i],
  ['считается', /(?<![а-яё])считает?ся(?![а-яё])|(?<![а-яё])считаются(?![а-яё])/i],
  ['Пометка:', /пометка\s*:/i],
  ['один источник', /один\s+источник/i],
  ['мнение', /(?<![а-яё])мнени(?:е|я|ю|ем|и|й|ям|ями|ях)(?![а-яё])/i],
  // 01-03 аудиогид (Р577): «Канонический итог: …», «деталь, которую рассказывают до сих пор»
  ['каноническая версия', /(?<![а-яё])каноническ(?:ий|ая|ое|ие|ого|ой|ому|им|ую|их|ими)(?![а-яё])/i],
  ['рассказывают до сих пор', /рассказывают\s+до\s+сих\s+пор/i],
];
// Поля, где не текст, а адрес или служебное значение.
const NE_TEKST = new Set(['href', 'data_source', 'poster', 'license', 'width', 'height', 'utverzhden', 'id', 'key', 'muzei', 'adres', 'canonical']);
const ADRES = /^(?:\/|https?:\/\/|\.\.?\/)\S*$/;
// Поля описания источника: src и stranica факта, title в sources.
const ISTOCHNIK = /(?:\.src|\.stranica|^sources\[\d+\]\.title)$/;
const tekst = (t) => String(t).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

export function ogovorki(y) {
  const o = [];
  const projti = (v, gde) => {
    if (v == null) return;
    if (Array.isArray(v)) return v.forEach((x, i) => projti(x, `${gde}[${i}]`));
    if (typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        // служебная пометка («один источник», «мнение»…) на страницу не идёт (den-razmetka.mjs) — не текст; «легенда» идёт — текст
        if (NE_TEKST.has(k) || (k === 'pometka' && POMETKI_SLUZHEBNYE.includes(x))) continue;
        projti(x, gde ? `${gde}.${k}` : k);
      }
      return;
    }
    if (typeof v !== 'string' || ADRES.test(v.trim())) return;
    // в источнике «ёлочки» — название статьи («Дом Павлова без легенд и мифов»), не оговорка (01-11)
    const t = ISTOCHNIK.test(gde) ? tekst(v).replace(/«[^«»]*»/g, '«»') : tekst(v);
    for (const [slovo, re] of SLOVA) {
      const m = t.match(re);
      if (m) o.push(`оговорка «${slovo}» в ${gde}: «…${t.slice(Math.max(0, m.index - 40), m.index + m[0].length + 30).trim()}…»`);
    }
  };
  projti(y, '');
  return o;
}

export function zamki(y, kal, utv) {
  const o = [];
  // а) хук и название — из карточки календаря
  if (!kal?.title || !kal?.hook) o.push('карточка календаря: нет title или hook');
  else {
    if (y.lead?.hook !== kal.hook) o.push(`хук: на странице «${y.lead?.hook}», в карточке календаря «${kal.hook}»`);
    if (y.head?.sobytie !== kal.title) o.push(`название: на странице «${y.head?.sobytie}», в карточке календаря «${kal.title}»`);
    if (y.video && y.video.intro !== kal.hook) o.push(`ролик: подпись «${y.video.intro}», в карточке календаря «${kal.hook}»`);
  }
  // б) оговорки
  o.push(...ogovorki(y));
  // в) факты — только утверждённые
  const udary = (y.fakty || []).flatMap((b) => b.udary || []);
  udary.forEach((u, i) => { if (!u.utverzhden) o.push(`факт ${i + 1} без отметки utverzhden`); });
  if (!utv) { if (udary.length) o.push('утверждённой карточки нет — факты страницы не утверждены'); }
  else for (const s of sverit(MUZEY, utv, izYaml(y)).o) if (/не из карточки/.test(s)) o.push(`неутверждённый факт: ${s}`);
  return o;
}

const chitat = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null);
export function proveritDen(key) {
  const y = chitat(path.join(KOREN, STR, `${key}.yaml`));
  if (y == null) return [`нет страницы ${STR}/${key}.yaml`];
  const kal = chitat(path.join(KOREN, KAL, `${key}.json`));
  const utv = chitat(path.join(KOREN, UTV, `${key}.json`));
  return zamki(YAML.parse(y), kal && JSON.parse(kal), utv && JSON.parse(utv));
}

// Проба (Р507): хороший образец — собран из карточек 01-03, плохой — тот же день с поломкой по каждому замку,
// оговорки — дословно те, что машина оставила в 01-01 («досказала легенда, историки спорят»).
function proba() {
  const key = '01-03';
  const kal = JSON.parse(fs.readFileSync(path.join(KOREN, KAL, `${key}.json`), 'utf8'));
  const utv = JSON.parse(fs.readFileSync(path.join(KOREN, UTV, `${key}.json`), 'utf8'));
  const udary = utv.poryadok.map((n) => {
    const f = utv.fakty.find((x) => x.n === n);
    return { summary: `<b>${f.zagolovok}</b> ${f.podrobnee}`, utverzhden: '2026-11-03' };
  });
  const horoshij = { head: { sobytie: kal.title }, lead: { hook: kal.hook }, fakty: [{ id: 'fakty', udary }] };
  const plohoj = structuredClone(horoshij);
  plohoj.lead.hook = `${kal.hook} — так говорят`;
  plohoj.story = { abzacy: ['Остальное досказала легенда, историки спорят до сих пор.'] };
  plohoj.fakty[0].udary[0] = { summary: '<b>Под Полтавой стояла самая большая пушка мира</b> её отлили в Туле за одну ночь', utverzhden: '2026-11-03' };
  plohoj.fakty[0].udary[1].pometka = 'легенда';
  plohoj.fakty[0].udary[1].src = 'Источник: «Звезда»; Пометка: один источник';
  plohoj.fakty[0].udary[3].pometka = 'один источник'; // служебная, на страницу не идёт — не ошибка
  delete plohoj.fakty[0].udary[2].utverzhden;
  plohoj.audioguide = { transcript: ['<p>Канонический итог: одиннадцать танков. И деталь, которую рассказывают до сих пор: …</p>'] };
  const oH = zamki(horoshij, kal, utv);
  const oP = zamki(plohoj, kal, utv);
  const nado = [/^хук:/, /«легенда» в story/, /историки спорят/, /«легенда» в fakty\[0\]\.udary\[1\]\.pometka/, /«Пометка:»/, /«один источник» в fakty\[0\]\.udary\[1\]\.src/, /^неутверждённый факт/, /без отметки utverzhden/, /«каноническая версия» в audioguide/, /«рассказывают до сих пор» в audioguide/];
  const propushcheno = nado.filter((re) => !oP.some((s) => re.test(s)));
  if (oP.some((s) => /udary\[3\]\.pometka/.test(s))) propushcheno.push('служебная пометка «один источник» принята за текст');
  // «легендарный», «стал легендой», «под легендой» — не оговорки
  let lozhnye = ogovorki({ t: 'легендарный полк, легендарная оборона. Инженер, который стал легендой, работал под легендой инженера.' });
  // название статьи в источнике — не оговорка; та же оговорка вне «ёлочек» — ловится
  const nazvanie = ogovorki({ fakty: [{ udary: [{ src: 'Источник: «Дом Павлова без легенд и мифов», НВО, 14.02.2014' }] }], sources: [{ title: '«Дом Павлова без легенд и мифов»' }] });
  const vneNazvaniya = ogovorki({ fakty: [{ udary: [{ src: 'Источник: «НВО»; это легенда' }] }] });
  if (nazvanie.length || !vneNazvaniya.length) lozhnye.push('название статьи в «ёлочках»');
  let ok = true;
  if (oH.length) { ok = false; console.log(`::error::ns-zamki --proba: хороший образец (${key}) упал:\n  ${oH.join('\n  ')}`); }
  if (propushcheno.length) { ok = false; console.log(`::error::ns-zamki --proba: плохой образец не пойман замками: ${propushcheno.join(', ')}`); }
  if (lozhnye.length) { ok = false; console.log(`::error::ns-zamki --proba: «легендарный», «стал легендой» или «под легендой» принят за оговорку (${lozhnye.join('; ')})`); }
  if (!ok) process.exit(1);
  console.log(`ns-zamki --proba: хороший образец ${key} прошёл, плохой упал (${oP.length} ошибок по трём замкам)`);
}

function glavnoe() {
  const argi = process.argv.slice(2);
  if (argi.includes('--proba')) return proba();
  const vse = argi.includes('--vse');
  let dni = argi.filter((x) => /^\d\d-\d\d$/.test(x));
  if (vse) dni = fs.readdirSync(path.join(KOREN, STR)).map((f) => f.match(/^(\d\d-\d\d)\.yaml$/)?.[1]).filter(Boolean).sort();
  else if (!dni.length) {
    const baza = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main';
    let izm;
    try {
      izm = execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', `${baza}...HEAD`, '--', STR, KAL, UTV], { cwd: KOREN, encoding: 'utf8' });
    } catch {
      console.log(`ns-zamki: базы ${baza} нет (сборка не в заявке) — изменённых дней не определить, проверяет шаг заявки`);
      return;
    }
    dni = [...new Set(izm.split('\n').map((f) => f.match(/(\d\d-\d\d)\.(?:yaml|json)$/)?.[1]).filter(Boolean))].sort();
    dni = dni.filter((k) => fs.existsSync(path.join(KOREN, STR, `${k}.yaml`)));
    if (!dni.length) { console.log('ns-zamki: дни «Русские не сдаются» в заявке не менялись'); return; }
  }
  let plohih = 0;
  for (const key of dni) {
    const o = proveritDen(key);
    if (!o.length) { console.log(`ns-zamki ${key}: замки пройдены`); continue; }
    plohih++;
    console.log(`${vse ? '' : '::error::'}ns-zamki ${key}: ${o.length}\n  ${o.join('\n  ')}`);
  }
  console.log(`ns-zamki: дней ${dni.length}, не прошли ${plohih}${vse ? ' (отчёт, не роняет)' : ''}`);
  if (plohih && !vse) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) glavnoe();
