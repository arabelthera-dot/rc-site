#!/usr/bin/env node
// Машина перевода января на образец февраля (Р656, Р440): node scripts/yanvar-v-obrazec.mjs <музей> <ММ-ДД> [--polya <файл.json>] [--zapisat]
// Текст, факты и состав дня не меняются (утверждённое — src/data/utverzhdeno): машина дописывает поля формы февраля
// (docs/standart-dnya.md) и снимает разметку из текстовых полей. Без --zapisat печатает, что изменит, и пробелы стандарта.
//   1. Разметка: <a>текст</a> → текст (ссылка, если текст — сам адрес), остальные теги снять, <br> и </p> — пробел, сущности
//      раскрыть. Не трогает: skripty, head.ld, razdely и story.abzacy (своя разметка января, Р627).
//      summary и det фактов тоже без разметки — как в утверждённом (src/data/utverzhdeno) и в феврале.
//   2. sources с html и ссылками — по пункту на ссылку: title — текст ссылки, note — текст пункта без ссылок (пусто — хост).
//   3. Механически: nomer_dnya, god_pokaza, citaty [], id/sravnenie/dlya_voprosa/istochnik фактов, istochniki из ссылок
//      дня (baza — по хосту src/data/spravochniki/bazy.json), podlinnik и hranitel картинки из credit «Хранится: …»,
//      pokazan_sergeyu — дата «Утверждено Сергеем» из карточки утверждённого (поле iz), 'net' у полей Р733 без данных.
//   4. Поля суждения (дата и год события, вес, словарь, место, права и подписи картинок…) — из --polya:
//      {"den": {поле: значение}, "kartinki": {"<имя файла картинки>": {поле: значение}}}; поле из polya главнее машинного.
// Уже заполненное поле не переписывается. Файл меняется строками на месте по range узлов yaml (весь файл через
// stringify не пересохраняется). После записи — scripts/zapolnit-dnya.mjs (data_staryj_stil, размеры) и tools/proverka-dnya.mjs.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import YAML, { isMap, isSeq, isScalar } from 'yaml';
import { faktyIzUtverzhdeno } from '../src/lib/fakty-iz-utverzhdeno.mjs';
import { standartDnya } from '../src/lib/standart-dnya.mjs';

const [muzei, key] = process.argv.slice(2);
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const zapisat = process.argv.includes('--zapisat');
if (!muzei || !/^01-\d\d$/.test(key ?? '')) {
  console.error('node scripts/yanvar-v-obrazec.mjs <музей> <01-ДД> [--polya <файл.json>] [--zapisat]');
  process.exit(2);
}
const f = `src/content/dni-shablon/${muzei}/${key}.yaml`;
const s = fs.readFileSync(f, 'utf8');
const doc = YAML.parseDocument(s);
const d = doc.toJS();
const polya = arg('--polya') ? JSON.parse(fs.readFileSync(arg('--polya'), 'utf8')) : {};
const NET = 'net';
const izob = muzei === 'izobreteniya', ns = muzei === 'ne-sdayutsya';
const pravki = []; // [начало, конец, текст]
const zametki = [];

// --- текст без разметки
const HTML = /<\/?[a-z][^>]*>|\*\*|&[a-z]+;/i;
const SUSHCHNOSTI = { nbsp: ' ', laquo: '«', raquo: '»', mdash: '—', ndash: '–', quot: '"', hellip: '…', amp: '&' };
const raskryt = (t) => t.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&([a-z]+);/gi, (m, n) => SUSHCHNOSTI[n.toLowerCase()] ?? m);
const adres = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
const SSYLKA = /<a\b[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
const snyat = (t) => raskryt(t
  .replace(/<br\s*\/?>|<\/p>/gi, ' ')
  .replace(SSYLKA, (_, h, x) => (adres(x.trim()) === adres(h) ? h : x))
  .replace(/<\/?[a-z][^>]*>/gi, '').replace(/\*\*/g, ''))
  .replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

// --- правка по range
const konecStroki = (i) => { let j = i; while (j > 0 && /\s/.test(s[j - 1])) j--; const n = s.indexOf('\n', j); return n < 0 ? s.length : n; };
const stolbec = (i) => i - (s.lastIndexOf('\n', i - 1) + 1);
const zn = (v) => JSON.stringify(v);
// range блочного скаляра (|-, >) захватывает хвостовой перевод строки — его оставляем, иначе следующий ключ склеится.
const zamenit = (uzel, tekst) => pravki.push([uzel.range[0], uzel.range[1], tekst + s.slice(uzel.range[0], uzel.range[1]).match(/\s*$/)[0]]);
// Новая пара в блочную карту: после её последней строки, с отступом первого ключа.
const dobavit = (karta, k, v) => {
  if (karta.flow) throw new Error(`карта в строку — не дописать ${k}`);
  const otstup = ' '.repeat(stolbec(karta.items[0].key.range[0]));
  pravki.push([konecStroki(karta.range[1]), konecStroki(karta.range[1]), `\n${otstup}${k}: ${zn(v)}`]);
};
// Верх карточки: сразу после строки adres (или key), чтобы новое стояло рядом с паспортом дня.
const verh = doc.contents;
const posle = verh.items.find((p) => p.key.value === 'adres') ?? verh.items.find((p) => p.key.value === 'key');
const novoeVverhu = [];
const vVerh = (k, v) => { if (d[k] === undefined && !novoeVverhu.some(([x]) => x === k)) novoeVverhu.push([k, v]); };

// 1. Разметка в строках.
const NE_TROGAT = (put) => put[0] === 'skripty' || (put[0] === 'head' && put[1] === 'ld') || put[0] === 'razdely'
  || (put[0] === 'story' && put[1] === 'abzacy')
  || (put[0] === 'sources' && isMap(doc.getIn(put.slice(0, 2), true)) && doc.getIn([...put.slice(0, 2), 'html']) !== undefined);
const obojti = (uzel, put) => {
  if (isScalar(uzel)) {
    if (typeof uzel.value === 'string' && HTML.test(uzel.value) && !NE_TROGAT(put)) zamenit(uzel, zn(snyat(uzel.value)));
  } else if (isSeq(uzel)) uzel.items.forEach((x, i) => obojti(x, [...put, i]));
  else if (isMap(uzel)) for (const p of uzel.items) obojti(p.value, [...put, p.key.value]);
};
obojti(verh, []);

// 2. Источники страницы.
const istSsylki = []; // [url, название]
const sources = doc.get('sources', true);
(sources?.items ?? []).forEach((uzel) => {
  const h = uzel.get?.('html');
  if (typeof h !== 'string') { if (uzel.get?.('href')) istSsylki.push([uzel.get('href'), snyat(uzel.get('title') ?? '')]); return; }
  const ssylki = [...h.matchAll(SSYLKA)];
  if (!ssylki.length) { if (HTML.test(h)) zamenit(uzel.get('html', true), zn(snyat(h))); return; }
  // «A и B: …», «… — A.» — связка и тире при ссылке уходят вместе с ней (изоб 01-07, НС 01-06).
  const ostatok = snyat(h.replace(SSYLKA, '\u0000')).replace(/\u0000(?:\s*(?:и|,|;)\s*\u0000)+/g, '\u0000')
    .replace(/\s*[,;—–]?\s*\u0000\s*/g, ' ').replace(/[:,;]\s*\./g, '.').replace(/\s+([.,:;])/g, '$1')
    .replace(/\s{2,}/g, ' ').replace(/^[\s,;:—.]+|[\s,;:—]+$/g, '').trim();
  const punkty = ssylki.map(([, href, x]) => {
    istSsylki.push([href, snyat(x)]);
    return { href, title: snyat(x), note: ostatok || host(href) };
  });
  const otstup = ' '.repeat(stolbec(uzel.range[0]) - 2);
  pravki.push([uzel.range[0], konecStroki(uzel.range[1]), punkty.map(zn).join(`\n${otstup}- `)]);
});

// 3. Факты и источники дня.
const bazy = JSON.parse(fs.readFileSync('src/data/spravochniki/bazy.json', 'utf8')).razresheny;
const bazaPoHostu = (u) => bazy.find((b) => host(b.url || '') && (host(u) === host(b.url) || host(u).endsWith(`.${host(b.url)}`)))?.id;
const udary = [d.fakty ?? []].flat().flatMap((b, bi) => b.udary.map((u, ui) => [u, ['fakty', bi, 'udary', ui]]));
for (const [u] of udary) {
  const url = u.href ?? snyat(u.src ?? '').match(/https?:\/\/\S+?(?=[\s;,]|\.?$)/)?.[0];
  if (url) istSsylki.push([url, u.stranica ?? snyat(u.src ?? '').replace(/^Источник:\s*/, '').split(' — ')[0]]);
}
const istochniki = [], idPoUrl = new Map();
for (const [url, nazvanie] of istSsylki) {
  if (idPoUrl.has(url) || !host(url)) continue;
  const osnova = host(url).replace(/\.(ru|su|com|org|net|рф)$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let id = osnova, n = 2;
  while (istochniki.some((x) => x.id === id)) id = `${osnova}-${n++}`;
  idPoUrl.set(url, id);
  istochniki.push({ id, baza: bazaPoHostu(url) ?? 'sajt-organizacii', nazvanie: nazvanie || host(url), ssylka: url });
}
if (!d.istochniki) vVerh('istochniki', istochniki);
udary.forEach(([u, put], i) => {
  const uzel = doc.getIn(put, true);
  const url = u.href ?? [...idPoUrl.keys()].find((x) => (u.src ?? '').includes(x));
  if (u.id === undefined) dobavit(uzel, 'id', `f${String(i + 1).padStart(2, '0')}`);
  if (u.sravnenie === undefined) dobavit(uzel, 'sravnenie', NET);
  if (u.dlya_voprosa === undefined) dobavit(uzel, 'dlya_voprosa', false);
  if (u.istochnik === undefined) {
    if (idPoUrl.has(url)) dobavit(uzel, 'istochnik', idPoUrl.get(url));
    else zametki.push(`факт ${put.join('.')}: нет ссылки — istochnik не поставлен`);
  }
});

// 4. Картинки.
const kartinki = [
  ...(d.oblozhka ? [['oblozhka']] : []),
  ...(d.figures ?? []).map((_, i) => ['figures', i]),
  ...udary.filter(([u]) => u.kadr).map(([, put]) => [...put, 'kadr']),
  ...(d.story?.udary ?? []).flatMap((u, i) => (u.kadr ? [['story', 'udary', i, 'kadr']] : [])), // как standart-dnya.mjs (изоб 01-06, 01-07)
];
for (const put of kartinki) {
  const k = doc.getIn(put).toJSON?.() ?? doc.getIn(put);
  const uzel = doc.getIn(put, true);
  const imya = path.basename(k.src ?? '');
  const iz = polya.kartinki?.[imya] ?? {};
  if (!polya.kartinki?.[imya]) zametki.push(`картинка ${imya}: нет в polya.kartinki`);
  // credit января: «… Хранится: <хранитель>[, инв. X | , КП-X][; |. ]Госкаталог музейного фонда РФ, [рег. ]№ N. …»
  const credit = snyat(k.credit ?? '');
  const hranitsya = credit.match(/Хранится:\s*(.+?)(?:;\s|\.\s+(?:Госкаталог|Права)|\.?$)/)?.[1];
  const inv = hranitsya?.match(/,\s*((?:инв\.|КП|ГИК)[\s-].*)$/)?.[1];
  const hranitel = inv ? hranitsya.slice(0, hranitsya.lastIndexOf(inv)).replace(/,\s*$/, '') : hranitsya;
  const reg = credit.match(/Госкаталог[^;№]*№\s*(\d+)/)?.[1];
  const mash = {
    ...(hranitel ? { hranitel } : {}),
    ...(reg ? { nomer_snimka: reg, nomer_predmeta: `${inv ?? 'инв. в Госкаталоге не указан'}; Госкаталог рег. № ${reg}` } : {}),
    ...(hranitel || k.data_source ? { podlinnik: { gde: hranitel ?? NET, otkuda: k.data_source ?? NET } } : {}),
  };
  // Паспорт прав — по образцу февраля: Госкаталог из credit, остальное (автор, год, anonim) из polya.
  if (iz.prava) mash.prava = {
    god_smerti_avtora: NET, god_reabilitacii: NET, sdelano_mashinoj: false,
    ...(reg ? { otkuda: 'Госкаталог музейного фонда РФ', baza: 'goskatalog', pervaya_publikaciya: `Госкаталог музейного фонда РФ, рег. № ${reg}` } : {}),
    // ssylka — только адрес: у архивных листов data_source — шифр («ЦАМО, ф. 58, …»), он уходит в podlinnik.otkuda.
    ...(/^https?:\/\//.test(k.data_source ?? '') ? { ssylka: k.data_source } : {}),
    ...iz.prava,
  };
  for (const [pole, v] of Object.entries({ ...mash, ...iz, ...(mash.prava ? { prava: mash.prava } : {}) })) if (k[pole] === undefined) dobavit(uzel, pole, v);
}

// 5. Верх дня.
const kodMuzeya = izob ? 'izob' : ns ? 'ns' : muzei;
const utv = `src/data/utverzhdeno/${muzei}/${key}.json`;
const kartochka = fs.existsSync(utv) && JSON.parse(fs.readFileSync(utv, 'utf8')).iz?.kartochka;
const putKartochki = kartochka && path.join(os.homedir(), 'workspace', kartochka);
const utverzhdeno = putKartochki && fs.existsSync(putKartochki)
  && fs.readFileSync(putKartochki, 'utf8').match(/Утверждено Сергеем[^\n]*?(\d\d)\.(\d\d)\.(\d{4})/);
const mashinnoe = {
  ...(polya.den?.slag ? { nomer_dnya: `${kodMuzeya}-${key.replace('-', '')}-${polya.den.slag}` } : {}),
  god_pokaza: 2027,
  ...(utverzhdeno ? { pokazan_sergeyu: { data: `${utverzhdeno[3]}-${utverzhdeno[2]}-${utverzhdeno[1]}` } } : {}),
  citaty: [],
  podskazki_igry: NET,
  togda_sejchas: NET, skvoznye_linii: NET, predmet_3d: NET, panorama_360: NET, staraya_karta: NET, marshrut: NET,
  ...(izob ? { kak_rabotaet: NET } : {}),
  ...(ns ? { moj_ded: NET } : {}),
};
if (!polya.den?.slag) zametki.push('нет polya.den.slag — nomer_dnya не поставлен, день стандартом не проверяется');
if (!utverzhdeno && !polya.den?.pokazan_sergeyu) zametki.push(`нет даты «Утверждено Сергеем» в ${putKartochki ?? utv} — pokazan_sergeyu из polya`);
const { slag, ...denPolya } = polya.den ?? {};
for (const [k, v] of Object.entries({ ...mashinnoe, ...denPolya })) vVerh(k, v);
if (novoeVverhu.length) {
  const i = konecStroki(posle.value.range[1]);
  pravki.push([i, i, novoeVverhu.map(([k, v]) => `\n${k}: ${zn(v)}`).join('')]);
}

// Сборка текста: правки с конца, без пересечений.
pravki.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
let t = s;
for (let i = 0; i < pravki.length; i++) {
  if (i && pravki[i][1] > pravki[i - 1][0]) throw new Error(`правки пересекаются у символа ${pravki[i][0]}`);
  t = t.slice(0, pravki[i][0]) + pravki[i][2] + t.slice(pravki[i][1]);
}
const novyj = YAML.parse(t);
const r = faktyIzUtverzhdeno(novyj, muzei, key);
const probely = [...r.oshibki, ...standartDnya({ ...r.syroe, key, muzei }, r.syroe)];
console.log(`${muzei}/${key}: правок ${pravki.length}, новых полей вверху ${novoeVverhu.length}, источников ${istochniki.length}`);
for (const z of zametki) console.log(`  ! ${z}`);
console.log(probely.length ? `пробелы стандарта (${probely.length}):\n${probely.map((x) => `  ${x}`).join('\n')}` : 'пробелов стандарта нет');
if (zapisat) { fs.writeFileSync(f, t); console.log(`записано: ${f}; дальше — node scripts/zapolnit-dnya.mjs ${muzei} ${key}`); }
