// Утверждённые факты → карточка дня «Русские не сдаются» (Р489, Р514). Модуль музея к общей машине scripts/kartochka-v-stranicu.mjs (Р516).
// Вход: ~/workspace/knowledge/ns-utverzhdeno/ns-ММ-ДД.md (10–15 фактов, утверждены Сергеем) и материал дня
// ~/workspace/knowledge/ns-material/ММ-ДД.md (цитаты, пометки, кадры с привязкой «к факту: N / обложка / галерея»).
// Выход: src/content/dni-shablon/ne-sdayutsya/ММ-ДД.yaml — разделы fakty, figures, oblozhka и adres: den; остальное
// (ролик, аудио, викторина, рассказ) побайтно как было.
// Запуск: node scripts/ns-iz-utverzhdennyh.mjs 01-01 | 01-01..01-31 [--utverzhden ГГГГ-ММ-ДД] [--bez-adresa] [--iz-staroy] [--proverka]
//   --iz-staroy — карточки нет: собрать её из старой страницы src/data/full-pages/ne-sdayutsya/ММ-ДД.html и записи дня
//                 src/content/days/ne-sdayutsya/ММ-ДД.json (образец — 01-01…01-05, r602), затем перенести факты как обычно.
//                 Каркас — scripts/karkas-iz-staroy.mjs (Р493); перезаписывает только пробу без утверждённых фактов (нет utverzhden). Как переводить день на yaml — scripts/ns-iz-utverzhdennyh.README.md.
//   --proverka — только разобрать утверждённые файлы (источники, дата), ничего не писать.
//   --utverzhden — дата, если в файле нет строки «Утверждено Сергеем ДД.ММ.ГГГГ» (01-02: Р467, 03.11.2026); без даты — останов.
//   --bez-adresa — adres не ставить и не трогать (пересборка без смены адреса); СТОП-правило действует и так.
// Чего нет — машина не выдумывает и не угадывает по смыслу: строка, «Подробнее», источник — карточки дословно;
// отрывок, адрес, пометка — из материала; кадр к факту — только по строке «к факту». Нет цитаты, пометки из списка,
// привязки кадра, ролика — останов с днём и номером, yaml не пишется. Повторный запуск даёт тот же файл.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import YAML from 'yaml';
import { skhemaNeSdayutsya } from '../src/lib/dni-ne-sdayutsya.mjs';
import { karkas } from './karkas-iz-staroy.mjs';
import { material, kadrKartochki } from './karkas/ne-sdayutsya.mjs';
import { POMETKI } from '../src/lib/den-obshchee.mjs';
import { proverit, rasstavit, razdel, kadrId } from './kartochka-v-stranicu.mjs';
import { razobratKartochku } from './utverzhdeno-kopiya.mjs';

const VHOD = path.join(os.homedir(), 'workspace/knowledge/ns-utverzhdeno');
const VYHOD = 'src/content/dni-shablon/ne-sdayutsya';
const UTV = 'src/data/utverzhdeno/ne-sdayutsya';

const args = process.argv.slice(2);
const flag = (k) => { const i = args.indexOf(k); return i < 0 ? null : args.splice(i, 2)[1] ?? ''; };
const datFlag = flag('--utverzhden'), bezAdresaI = args.indexOf('--bez-adresa');
const bezAdresa = bezAdresaI >= 0; if (bezAdresa) args.splice(bezAdresaI, 1);
const odin = (k) => { const i = args.indexOf(k); if (i >= 0) args.splice(i, 1); return i >= 0; };
const izStaroy = odin('--iz-staroy'), proverka = odin('--proverka');
if (datFlag !== null && !/^\d{4}-\d\d-\d\d$/.test(datFlag)) stop(`--utverzhden ${datFlag}: нужна дата ГГГГ-ММ-ДД`);
if (args.length !== 1) stop('нужен день ММ-ДД или диапазон ММ-ДД..ММ-ДД');

function stop(msg) { console.error(`ОСТАНОВ: ${msg}`); process.exit(1); }

function dni(s) {
  const m = s.match(/^(\d\d)-(\d\d)(?:\.\.(\d\d)-(\d\d))?$/);
  if (!m) stop(`«${s}» — не ММ-ДД и не ММ-ДД..ММ-ДД`);
  if (!m[3]) return [s];
  if (m[3] !== m[1]) stop('диапазон — только внутри одного месяца');
  const out = [];
  for (let d = +m[2]; d <= +m[4]; d++) out.push(`${m[1]}-${String(d).padStart(2, '0')}`);
  return out;
}

// Разбор утверждённого файла: [{n, summary, podrobnee, istochnik, proverka}], дата утверждения.
function razobrat(file) {
  const stroki = fs.readFileSync(file, 'utf8').split('\n').map((s) => s.trimEnd());
  const fakty = [];
  let tek = null, data = null, chuzhoy = null;
  const svoy = path.basename(file).match(/(\d\d)-(\d\d)\.md$/);
  for (const s of stroki) {
    // Шапка дня «Д МЕСЯЦА · …»: своя — первая строка; чужая (склейка файлов, 01-06) допустима только последней строкой.
    const sh = s.match(/^(\d{1,2}) [А-ЯЁ]+ · /);
    if (chuzhoy && s) stop(`${file}: после шапки чужого дня «${chuzhoy}» идёт текст «${s.slice(0, 60)}» — в файле два дня`);
    if (sh) { if (svoy && +sh[1] !== +svoy[2]) chuzhoy = s; tek = null; continue; }
    const u = s.match(/Утверждено Сергеем (\d\d)\.(\d\d)\.(\d{4})/);
    if (u) data = `${u[3]}-${u[2]}-${u[1]}`;
    const n = s.match(/^(\d+)\.\s+(?:\((?:нов|стар)\.[^)]*\)\s+)?(.+)$/); // метка «(нов.)», «(стар.+нов.)», «(стар.→замена)» — не текст факта
    if (n && fakty.some((f) => f.n === +n[1])) stop(`${file}: две строки факта ${n[1]} — какая утверждена, решает человек, не машина: «${fakty.find((f) => f.n === +n[1]).summary.slice(0, 50)}…» / «${n[2].slice(0, 50)}…»`);
    if (n) { tek = { n: +n[1], summary: n[2].trim() }; fakty.push(tek); continue; }
    if (!tek) continue;
    let m;
    if ((m = s.match(/^Подробнее:\s*(.+)$/))) { if (tek.podrobnee) stop(`${file}: у факта ${tek.n} два «Подробнее»`); tek.podrobnee = m[1].trim(); }
    else if ((m = s.match(/^Источники?:\s*(.+)$/))) { if (tek.istochnik) stop(`${file}: у факта ${tek.n} два источника`); tek.istochnik = m[1].trim(); }
    else if ((m = s.match(/^Пометка проверки:\s*(.+)$/))) tek.proverka = m[1].trim();
    else if (s === '' || /^(ЕЩЁ \d+|\d+ ФАКТОВ|━+)$/.test(s)) { if (/^━+$/.test(s)) tek = null; }
    else if (/^(Не вошло|Утверждено|Порядок на странице)/.test(s)) tek = null;
    else stop(`${file}: непонятная строка у факта ${tek.n}: «${s.slice(0, 80)}»`);
  }
  if (chuzhoy) console.log(`  · ${path.basename(file)}: последняя строка — шапка чужого дня «${chuzhoy}», пропущена`);
  // От 10 до 15 фактов (Р510: повторы слиты, номера не перенумерованы); порядок на странице — poryadokDnya().
  if (fakty.length < 10 || fakty.length > 15) stop(`${file}: фактов ${fakty.length}, нужно от 10 до 15`);
  fakty.forEach((f) => {
    if (!f.podrobnee) stop(`${file}: у факта ${f.n} нет «Подробнее»`);
    // Нет «Источник» в утверждённом (01-25, факт 1) — слова не трогаем; адрес возьмёт udar() из материала, нет и там — останов.
    f.ssylki = f.istochnik ? ssylki(f.istochnik, `${file}: факт ${f.n}`) : [];
  });
  return { fakty, data };
}

// Строка «Источник:» → [{imya, href}] по всем адресам в ней. Варианты из 31 утверждённого дня (Р491):
// «ИМЯ — URL», «ИМЯ (URL)», «ИМЯ, URL», цепочки через «; », «, » или пробел, примечание после адреса «URL (…)»,
// вложенное «донесение … (цитата в РОДИНА (URL))». Имя — текст между хвостом прошлого адреса и этим адресом.
// Нет адреса, пустое имя или текст после последнего адреса без «;»/«,» и не примечанием в скобках — громкий останов.
function ssylki(s, gde) {
  const URL_ = /https?:\/\/[^\s()]+?(?=[.,;]?(?:\s|\)|$))/g;
  const out = [];
  let hvost = 0;
  for (const m of s.matchAll(URL_)) {
    let imya = s.slice(hvost, m.index);
    for (;;) { // хвост прошлого: «)», примечание «(…)», разделители
      const b = imya.replace(/^\s*\)+/, '').replace(/^\s*\([^()]*\)/, '').replace(/^[\s;,]+/, '');
      if (b === imya) break;
      imya = b;
    }
    imya = imya.replace(/(?:\s+—\s*|\s*\(\s*|[\s,:]+)$/, '').trim();
    if ((imya.match(/\(/g) ?? []).length > (imya.match(/\)/g) ?? []).length) imya += ')';
    if (!imya) { if (!out.length) stop(`${gde}: у адреса ${m[0]} нет имени источника: «${s}»`); imya = out.at(-1).imya; }
    out.push({ imya, href: m[0] });
    hvost = m.index + m[0].length;
  }
  if (!out.length) stop(`${gde}: в источнике нет адреса http…: «${s}»`);
  // Хвост: примечание «(…)» или ещё источник без адреса после «; »/«, » (01-22: «Шаг в бессмертие», ЦБС Пскова) — остаётся в src.
  const ostatok = s.slice(hvost).replace(/^\)*/, '').trim();
  if (ostatok && !/^\([^()]*\)\)*\.?(\s*;\s*\S.*)?$/.test(ostatok) && !/^[;,]\s*\S/.test(ostatok)) stop(`${gde}: после последнего адреса непонятный текст «${ostatok}» — у источника нет адреса?`);
  return out;
}

// Утверждённый файл дня → {vhod, fakty, data}; без файла или без даты — останов.
function utverzhdennoe(key) {
  const vhod = path.join(VHOD, `ns-${key}.md`);
  if (!fs.existsSync(vhod)) stop(`${vhod}: утверждённого файла нет`);
  const { fakty, data: dataFayla } = razobrat(vhod);
  const data = dataFayla ?? datFlag;
  // Без даты (01-02) карточка пишется; utverzhden у факта — только со старого факта, новые получают дату файла.
  if (!data) console.log(`  · ${path.basename(vhod)}: нет строки «Утверждено Сергеем ДД.ММ.ГГГГ» и флага --utverzhden — utverzhden только со старых фактов`);
  if (dataFayla && datFlag && dataFayla !== datFlag) stop(`${vhod}: в файле утверждено ${dataFayla}, флаг ${datFlag}`);
  return { vhod, fakty, data };
}

const CHISLO = { 0: ['ноль', 'ноль фактов'], 1: ['один', 'один факт'], 2: ['два', 'два факта'], 3: ['три', 'три факта'], 4: ['четыре', 'четыре факта'], 5: ['пять', 'пять фактов'] };

// Порядок на странице: строка карточки «Порядок на странице», иначе копия src/data/utverzhdeno, иначе по номерам (Р510).
function poryadokDnya(key, vhod, fakty) {
  const nomera = fakty.map((f) => f.n), tot = (p) => p?.length === nomera.length && [...p].sort((a, b) => a - b).join() === [...nomera].sort((a, b) => a - b).join();
  const izKart = razobratKartochku(fs.readFileSync(vhod, 'utf8')).poryadok;
  if (izKart && !tot(izKart)) stop(`${vhod}: «Порядок на странице» (${izKart.join(', ')}) не совпадает с номерами фактов (${nomera.join(', ')})`);
  const kopiya = path.join(UTV, `${key}.json`);
  const izKopii = fs.existsSync(kopiya) ? JSON.parse(fs.readFileSync(kopiya, 'utf8')) : null;
  return { poryadok: izKart ?? (tot(izKopii?.poryadok) ? izKopii.poryadok : nomera), kopiya: izKopii };
}

// Факт страницы из утверждённого f и материала m: строка, «Подробнее» и источник — карточки дословно; отрывок, адрес,
// страница и пометка — материала (дословно, руками не дописываются); utverzhden — дата карточки у каждого факта.
// Страница источника — «страница:» материала, иначе имя этого адреса в строке «Источник» карточки.
function udar(f, m, data) {
  const svoj = f.ssylki.find((s) => s.href === m.href);
  return { summary: `<b>${f.summary}</b>`, det: [f.podrobnee], src: `Источник: ${f.istochnik}`, otryvok: m.otryvok,
    stranica: m.stranica || svoj?.imya || new URL(m.href).host, href: m.href, pometka: m.pometka, utverzhden: data };
}

// Ролик дня — тот, что стоял на старой странице src/data/full-pages/ne-sdayutsya/ММ-ДД.html (video/….mp4),
// файл лежит в public/muzei/ne-sdayutsya/video/, блок video карточки указывает на него. Иначе — строка-ошибка.
function rolik(key, karta) {
  const html = path.join('src/data/full-pages/ne-sdayutsya', `${key}.html`);
  const mp4 = fs.existsSync(html) ? fs.readFileSync(html, 'utf8').match(/video\/[\w.-]+\.mp4/)?.[0] : null;
  if (!mp4) return 'на старой странице ролика нет и в public/muzei/ne-sdayutsya/video/ его нет — ролик делается в облаке rc-rolik';
  if (!fs.existsSync(path.join('public/muzei/ne-sdayutsya', mp4))) return `файла public/muzei/ne-sdayutsya/${mp4} нет`;
  if (!karta.video?.mp4?.split('?')[0].endsWith(mp4)) return `в карточке нет блока video с ${mp4} (на старой странице он есть)`;
  return karta.video;
}

function den(key) {
  const vyhod = path.join(VYHOD, `${key}.yaml`);
  if (!fs.existsSync(vyhod)) stop(`${vyhod}: карточки нет — новую карточку строит запуск с --iz-staroy`);
  const { vhod, fakty, data } = utverzhdennoe(key);
  const { poryadok } = poryadokDnya(key, vhod, fakty);

  const tekst = fs.readFileSync(vyhod, 'utf8'), doc = YAML.parseDocument(tekst);
  const indentSeq = !/^\w+:\n- /m.test(tekst); // 01-02 записан списками без отступа
  const karta = doc.toJS({ maxAliasCount: -1 });
  const bloki = karta.fakty, glavnyy = bloki?.find((b) => b.id === 'fakty'), eshche = bloki?.find((b) => b.id === 'fakty-dnya');
  if (!glavnyy || !eshche) stop(`${vyhod}: нет блоков fakty и fakty-dnya`);
  const starye = [...glavnyy.udary, ...eshche.udary];

  // СТОП-правило (scripts/kartochka-v-stranicu.mjs): сначала все ошибки дня, при любой — yaml не пишется.
  const mat = material(key);
  const video = rolik(key, karta);
  const { oshibki, kadry } = proverit({ nomera: fakty.map((f) => f.n), fakty: mat.fakty, pometki: POMETKI, utverzhden: data, video,
    kadry: mat.kadry.map((m) => ({ n: m.n, privyazka: m.privyazka, obekt: kadrKartochki(m) })) });
  if (oshibki.length) {
    console.error(`${key}: ОСТАНОВ — карточка не записана (${path.basename(mat.file)}, ${path.basename(vhod)}):\n${oshibki.map((s) => `  ✗ ${key}: ${s}`).join('\n')}`);
    return false;
  }

  const { oblozhka, kadrFakta, figures } = rasstavit(poryadok, kadry,
    { oblozhka: karta.oblozhka, figures: karta.figures, kadryFaktov: starye.map((u) => u.kadr).filter(Boolean) });
  const novye = poryadok.map((n) => {
    const u = udar(fakty.find((x) => x.n === n), mat.fakty.get(n), data);
    if (kadrFakta.has(n)) u.kadr = kadrFakta.get(n);
    return u;
  });
  const ostatok = novye.length - 10, [nav, kicker] = CHISLO[ostatok];
  const b1 = { ...glavnyy, udary: novye.slice(0, 10) }, b2 = { ...eshche, udary: novye.slice(10) };
  if ('nav' in b2) b2.nav = `Ещё ${nav}`;
  b2.kicker = `Ещё ${kicker}`;
  Object.assign(karta, { fakty: [b1, b2], figures, oblozhka });

  const r = skhemaNeSdayutsya.safeParse({ ...karta, adres: bezAdresa ? karta.adres : 'den' });
  if (!r.success) {
    console.error(`${key}: ОСТАНОВ — схема и замки адреса den не проходят, карточка не записана:\n  ${r.error.issues.map((i) => `✗ ${key}: ${i.path.join('.')}: ${i.message}`).join('\n  ')}`);
    return false;
  }

  doc.set('fakty', doc.createNode(karta.fakty, { aliasDuplicateObjects: false }));
  doc.set('figures', doc.createNode(figures, { aliasDuplicateObjects: false }));
  if (oblozhka) doc.set('oblozhka', doc.createNode(oblozhka, { aliasDuplicateObjects: false }));
  const stavimAdres = !bezAdresa; // --bez-adresa: adres не трогаем вовсе (пересборка без смены адреса)
  if (stavimAdres && !doc.has('adres')) doc.contents.items.splice(doc.contents.items.findIndex((p) => p.key.value === 'key') + 1, 0, doc.createPair('adres', 'den'));
  else if (stavimAdres) doc.set('adres', 'den');
  const svezhij = doc.toString({ lineWidth: 0, indentSeq, flowCollectionPadding: false });
  let vyh = tekst;
  for (const kl of ['fakty', 'figures', ...(oblozhka ? ['oblozhka'] : []), ...(stavimAdres ? ['adres'] : [])]) {
    const st = razdel(vyh, kl), nv = razdel(svezhij, kl);
    if (!nv) stop(`${key}: раздела ${kl} нет в новом документе`);
    vyh = st ? vyh.replace(st[0], () => nv[0]) : vyh.replace(/^key:[^\n]*\n/m, (s) => s + nv[0]);
  }
  if (JSON.stringify(YAML.parse(vyh, { maxAliasCount: -1 })) !== JSON.stringify(YAML.parse(svezhij, { maxAliasCount: -1 }))) stop(`${key}: вставка разделов разошлась с документом`);
  fs.writeFileSync(vyhod, vyh);
  console.log(`${key}: ${stavimAdres ? 'adres: den' : 'adres не тронут (--bez-adresa)'}, фактов ${novye.length} (${b1.udary.length}+${b2.udary.length}), кадров у фактов ${kadrFakta.size}, галерея ${figures.length}, утверждено ${data}`);
  console.log(`  кадры: обложка ${oblozhka?.src ?? '—'}${kadry.filter((k) => k.p.vid === 'obl').length ? ' (кадр «обложка» материала)' : ' (прежняя)'}`);
  for (const k of kadry) {
    const n = [...kadrFakta].find(([, o]) => kadrId(o) === kadrId(k.obekt))?.[0];
    console.log(`  · кадр ${k.n} (к факту: ${k.privyazka}) → ${kadrId(k.obekt) === kadrId(oblozhka ?? {}) ? 'обложка' : n ? `факт ${n}` : 'галерея'} ${k.obekt.src}`);
  }
  return true;
}

// ── Режим --iz-staroy (Р491, Р493): карточки нет (или проба без adres) — каркас из старой страницы через диспетчер ──
// scripts/karkas-iz-staroy.mjs → адаптер scripts/karkas/ne-sdayutsya.mjs (договор — scripts/karkas/README.md).
// Адаптер даёт поля без фактов и nety — чего на старой странице нет; nety идёт в шапку-комментарий, не в карточку.
// Пустые блоки fakty/fakty-dnya ставит эта машина, факты в них переносит den() из утверждённого.
const PORYADOK = ['muzei', 'key', 'adres', 'head', 'oblozhka', 'kroshka', 'lead', 'stamp', 'daynav', 'video', 'story', 'fakty', 'audioguide',
  'razdely', 'quiz', 'result', 'kalendar', 'figures', 'sources', 'kuda', 'score', 'chrome', 'return', 'proof'];

async function izStaroyStranicy(key) {
  const vyhod = path.join(VYHOD, `${key}.yaml`);
  if (fs.existsSync(vyhod)) {
    const byla = fs.readFileSync(vyhod, 'utf8');
    if (/^adres:/m.test(byla) || /utverzhden:/.test(byla)) return; // готовую не перезаписывает — только пробу без утверждённых фактов
  }
  const { nety, ...polya } = await karkas('ne-sdayutsya', key);
  const { fakty } = utverzhdennoe(key);
  const h1 = polya.head?.h1 ?? polya.head?.title ?? key;
  const karta = { muzei: 'ne-sdayutsya', key, ...polya,
    fakty: [{ id: 'fakty', kicker: 'Десять фактов', h2: h1, udary: [] }, { id: 'fakty-dnya', kicker: 'Ещё пять фактов', h2: 'Ещё о подвиге', udary: [] }] };
  if (!karta.sources?.length) {
    const vse = new Map();
    for (const f of fakty) for (const s of f.ssylki) if (!vse.has(s.href)) vse.set(s.href, { href: s.href, title: s.imya, note: `к факту ${f.n}` });
    karta.sources = [...vse.values()];
  }
  const uporyad = Object.fromEntries([...PORYADOK, ...Object.keys(karta).filter((k) => !PORYADOK.includes(k))]
    .filter((k) => karta[k] !== undefined && karta[k] !== null).map((k) => [k, karta[k]]));
  const doc = new YAML.Document(uporyad, { aliasDuplicateObjects: false });
  doc.commentBefore = [` Каркас — scripts/karkas-iz-staroy.mjs (адаптер scripts/karkas/ne-sdayutsya.mjs) из старой страницы и записи дня ${key}.`,
    ...nety.map((s) => ` НЕТ: ${s}`)].join('\n');
  fs.writeFileSync(vyhod, doc.toString({ lineWidth: 0 }));
  console.log(`${key}: каркас из старой страницы записан, нет — ${nety.length}`);
}

if (proverka) {
  for (const key of dni(args[0])) { const { fakty, data } = utverzhdennoe(key); console.log(`${key}: фактов ${fakty.length}, источников ${fakty.reduce((n, f) => n + f.ssylki.length, 0)}, утверждено ${data}`); }
  process.exit(0);
}
const itog = [];
// Карточка не записана — каркас не оставлять: вернуть прежний файл или убрать новый (иначе сборка красная, 01-30, r496).
for (const key of dni(args[0])) {
  const f = path.join(VYHOD, `${key}.yaml`), bylo = fs.existsSync(f) ? fs.readFileSync(f) : null;
  if (izStaroy) await izStaroyStranicy(key);
  const ok = den(key);
  if (!ok && izStaroy) { if (bylo) fs.writeFileSync(f, bylo); else fs.rmSync(f, { force: true }); console.error(`${key}: каркас ${bylo ? 'откачен к прежнему' : 'убран'}`); }
  itog.push(ok);
}
process.exit(itog.every(Boolean) ? 0 : 2);
