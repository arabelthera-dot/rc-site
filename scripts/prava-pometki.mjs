#!/usr/bin/env node
// Р764 п.2 (Сергей 13.11.2026): права кадра машиной по таблице «база → пометка».
// Образец — rightsstatements.org (https://rightsstatements.org/page/1.0/) и закрытый список прав Европеаны
// (https://pro.europeana.eu/page/available-rights-statements): у каждого кадра одна пометка из короткого списка.
// Список и таблица — src/data/spravochniki/pometki-prav.json. Порядок: generated → своя работа;
// основание прямо названо в подписи («Права: …») — оно, это права именно этого кадра;
// иначе база кадра по адресу источника → таблица; базы нет в таблице — кадр называется, права решает человек.
// Утверждённое не меняется: дописывается только пустое поле pometka_prav, остальное в дне не трогается.
//   node scripts/prava-pometki.mjs                       — проверка дней, изменённых в ветке (origin/main...HEAD)
//   node scripts/prava-pometki.mjs --vse [музей] [ММ]    — проверка и счёт по всем дням (или музею, месяцу)
//   node scripts/prava-pometki.mjs --zapisat <музей> <ММ> — проставить пустые pometka_prav и показать счёт
// strogo=false в справочнике — кадры называются предупреждением; true — ошибка, выход 1.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { osnovanieIz } from '../src/lib/zakon.mjs';

const DNI = 'src/content/days';
const sprav = JSON.parse(fs.readFileSync('src/data/spravochniki/pometki-prav.json', 'utf8'));
const bazy = JSON.parse(fs.readFileSync('src/data/spravochniki/bazy.json', 'utf8')).razresheny;
const ID = new Set(bazy.map((b) => b.id));
const HOSTY = bazy
  .filter((b) => b.url)
  .map((b) => [new URL(b.url).hostname.replace(/^www\./, ''), b.id])
  .sort((a, b) => b[0].length - a[0].length);

// Основание из подписи → пометка; «свободная лицензия» уточняется по виду CC.
const IZ_OSNOVANIYA = {
  'общественное достояние': 'obshchestvennoe-dostoyanie',
  'цитирование (ст. 1274 ГК)': 'citirovanie-1274',
  'разрешение правообладателя': 'razreshenie-vladelca',
  'своя генерация проекта': 'svoya-rabota',
  'не объект авторского права (ст. 1259 ГК)': 'ne-obekt-1259',
};
const svobodnaya = (t) =>
  /\bCC[ -]?0\b/i.test(t) ? 'cc0' : /\bBY[ -]?SA\b/i.test(t) ? 'cc-by-sa' : /\bCC[ -]?BY\b/i.test(t) ? 'cc-by' : '';
const pravaIzPodpisi = (t) => {
  const m = /Права:\s*([^\n]*)/.exec(t || '');
  return m ? m[1] : '';
};

export function bazaKadra(img) {
  if (img.prava?.baza) return img.prava.baza;
  const credit = img.credit || '';
  for (const [, id] of credit.matchAll(/\[([a-z0-9_-]+)\]/g)) if (ID.has(id)) return id;
  for (const u of [...credit.matchAll(/https?:\/\/[^\s,;)»"]+/g)].map((m) => m[0]).concat(img.prava?.ssylka || [])) {
    let host;
    try { host = new URL(u).hostname.replace(/^www\./, ''); } catch { continue; }
    const hit = HOSTY.find(([h]) => host === h || host.endsWith('.' + h));
    if (hit) return hit[1];
  }
  // Адрес без http в подписи («ar.culture.ru»).
  for (const [h, id] of HOSTY) if (new RegExp(`(^|[\\s/(«])(www\\.)?${h.replace(/\./g, '\\.')}\\b`, 'i').test(credit)) return id;
  if (/госкаталог/i.test(credit)) return 'goskatalog';
  return '';
}

/** Пометка по кадру: { pometka, put: 'podpis' | 'tablica' | '', baza }. */
export function pometkaKadra(img) {
  const baza = bazaKadra(img);
  if (img.generated) return { pometka: 'svoya-rabota', put: 'podpis', baza };
  const pr = pravaIzPodpisi(img.credit);
  const osn = pr ? osnovanieIz(pr) : '';
  const izPodpisi = (osn === 'свободная лицензия' ? svobodnaya(pr) : IZ_OSNOVANIYA[osn]) || '';
  if (izPodpisi) return { pometka: izPodpisi, put: 'podpis', baza };
  if (sprav.tablica[baza]) return { pometka: sprav.tablica[baza], put: 'tablica', baza };
  return { pometka: '', put: '', baza };
}

const kadry = (d) => [
  ...(d.images || []).map((img, i) => [`images[${i}]`, img]),
  ...(d.more || []).flatMap((e, j) => [
    ...(e.images || []).map((img, i) => [`more[${j}].images[${i}]`, img]),
    ...(e.detail_images || []).map((img, i) => [`more[${j}].detail_images[${i}]`, img]),
  ]),
];

// Вставка строки "pometka_prav" последним полем объекта картинки без перезаписи остального файла.
function dopisat(text, img, pometka) {
  const metka = `"src": ${JSON.stringify(img.src)}`;
  for (let at = text.indexOf(metka); at >= 0; at = text.indexOf(metka, at + 1)) {
    let depth = 0, inStr = false, i = text.lastIndexOf('{', at);
    const nachalo = i;
    for (; i < text.length; i++) {
      const c = text[i];
      if (inStr) { if (c === '\\') i++; else if (c === '"') inStr = false; continue; }
      if (c === '"') inStr = true;
      else if (c === '{' || c === '[') depth++;
      else if (c === '}' || c === ']') { depth--; if (depth === 0) break; }
    }
    if (text.slice(nachalo, i).includes('"pometka_prav"')) continue;
    const lineStart = text.lastIndexOf('\n', i) + 1;
    const ind = text.slice(lineStart, i);
    const end = text.slice(0, lineStart - 1).replace(/\s+$/, '');
    return `${end},\n${ind}  "pometka_prav": ${JSON.stringify(pometka)}\n${text.slice(lineStart)}`;
  }
  throw new Error(`не найден кадр без пометки ${img.src}`);
}

const args = process.argv.slice(2);
const zapisat = args[0] === '--zapisat';
let fajly;
if (zapisat || args[0] === '--vse') {
  const [muzej, mes] = args.slice(1);
  fajly = fs.readdirSync(DNI).filter((m) => !muzej || m === muzej).flatMap((m) =>
    fs.readdirSync(path.join(DNI, m)).filter((f) => f.endsWith('.json') && (!mes || f.startsWith(mes + '-'))).map((f) => path.join(DNI, m, f)));
} else {
  let out = '';
  try { out = execSync(`git diff --name-only --diff-filter=AM origin/main...HEAD -- ${DNI}`, { encoding: 'utf8' }); } catch { out = ''; }
  fajly = out.split('\n').filter((f) => f.endsWith('.json') && fs.existsSync(f));
}

const schet = { podpis: 0, tablica: 0, chelovek: 0 };
const nazvat = [];
for (const f of fajly.sort()) {
  let text = fs.readFileSync(f, 'utf8');
  const d = JSON.parse(text);
  let izm = false;
  for (const [put, img] of kadry(d)) {
    const kto = `${f} ${put} (${img.src})`;
    if (img.pometka_prav) {
      const p = sprav.pometki[img.pometka_prav];
      if (!p) { nazvat.push(`${kto}: пометка «${img.pometka_prav}» вне списка`); schet.chelovek++; }
      else if (p.chelovek) { nazvat.push(`${kto}: «${p.nazvanie}» — решает человек`); schet.chelovek++; }
      else schet[pometkaKadra(img).put || 'tablica']++;
      continue;
    }
    const r = pometkaKadra(img);
    if (!r.pometka) {
      nazvat.push(`${kto}: база ${r.baza ? `«${r.baza}» не из таблицы` : 'не определена'} — права решает человек`);
      schet.chelovek++;
      continue;
    }
    schet[r.put]++;
    if (zapisat) { text = dopisat(text, img, r.pometka); izm = true; }
  }
  if (izm) {
    JSON.parse(text);
    fs.writeFileSync(f, text);
  }
}

const vsego = schet.podpis + schet.tablica + schet.chelovek;
console.log(`prava-pometki: дней ${fajly.length}, кадров ${vsego}; по подписи ${schet.podpis}, по таблице ${schet.tablica}, человеку ${schet.chelovek}`);
const vid = sprav.strogo ? 'error' : 'warning';
for (const s of nazvat) console.log(process.env.GITHUB_ACTIONS ? `::${vid}::${s}` : `${vid}: ${s}`);
if (sprav.strogo && nazvat.length) process.exit(1);
