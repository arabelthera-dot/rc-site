// Утверждённые факты → карточка дня «Русские не сдаются» (Р489).
// Вход: ~/workspace/knowledge/ns-utverzhdeno/ns-ММ-ДД.md (15 фактов, утверждены Сергеем).
// Выход: src/content/dni-shablon/ne-sdayutsya/ММ-ДД.yaml — факты (fakty, fakty-dnya) заменяются утверждёнными дословно,
// каждому ставится utverzhden, карточке — adres: den; остальное в карточке (обложка, кадры, ролик, аудио, викторина) сохраняется.
// Запуск: node scripts/ns-iz-utverzhdennyh.mjs 01-01 | 01-01..01-31 [--utverzhden ГГГГ-ММ-ДД] [--bez-adresa] [--iz-staroy] [--proverka]
//   --iz-staroy — карточки нет: собрать её из старой страницы src/data/full-pages/ne-sdayutsya/ММ-ДД.html и записи дня
//                 src/content/days/ne-sdayutsya/ММ-ДД.json (образец — 01-01…01-05, r602), затем перенести факты как обычно.
//                 Каркас — scripts/karkas-iz-staroy.mjs (Р493); перезаписывает только пробу без утверждённых фактов (нет utverzhden). Как переводить день на yaml — scripts/ns-iz-utverzhdennyh.README.md.
//   --proverka — только разобрать утверждённые файлы (источники, дата), ничего не писать.
//   --utverzhden — дата, если в файле нет строки «Утверждено Сергеем ДД.ММ.ГГГГ» (без неё и без флага — ошибка).
//   --bez-adresa — если замки адреса den не проходят, записать карточку без adres (с перечнем, чего не хватает).
// Чего нет в утверждённом — машина не выдумывает: отрывок только дословной цитатой из «Подробнее», пометка — из карточки
// или «документ», если у факта есть дословная цитата источника. Карточка до записи проходит схему музея (замки den-obshchee).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import YAML from 'yaml';
import { skhemaNeSdayutsya } from '../src/lib/dni-ne-sdayutsya.mjs';
import { karkas } from './karkas-iz-staroy.mjs';
import { material, kadrKartochki } from './karkas/ne-sdayutsya.mjs';

const VHOD = path.join(os.homedir(), 'workspace/knowledge/ns-utverzhdeno');
const VYHOD = 'src/content/dni-shablon/ne-sdayutsya';
const BEZ_TEGOV = (s) => s.replace(/<[^>]+>/g, '');
// Названия сочинений в кавычках — не отрывок источника.
const NAZVANIE = /^(Повест|Сказани|Задонщин|Жити|Слов|Летопис|Хожени|Моления)/;

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
    const n = s.match(/^(\d+)\.\s+(?:\((?:нов|стар)\.(?:\+(?:нов|стар)\.)?\)\s+)?(.+)$/);
    if (n && fakty.some((f) => f.n === +n[1])) stop(`${file}: две строки факта ${n[1]} — какая утверждена, решает человек, не машина: «${fakty.find((f) => f.n === +n[1]).summary.slice(0, 50)}…» / «${n[2].slice(0, 50)}…»`);
    if (n) { tek = { n: +n[1], summary: n[2].trim() }; fakty.push(tek); continue; }
    if (!tek) continue;
    let m;
    if ((m = s.match(/^Подробнее:\s*(.+)$/))) { if (tek.podrobnee) stop(`${file}: у факта ${tek.n} два «Подробнее»`); tek.podrobnee = m[1].trim(); }
    else if ((m = s.match(/^Источники?:\s*(.+)$/))) { if (tek.istochnik) stop(`${file}: у факта ${tek.n} два источника`); tek.istochnik = m[1].trim(); }
    else if ((m = s.match(/^Пометка проверки:\s*(.+)$/))) tek.proverka = m[1].trim();
    else if (s === '' || /^(ЕЩЁ 5|\d+ ФАКТОВ|━+)$/.test(s)) { if (/^━+$/.test(s)) tek = null; }
    else if (/^(Не вошло|Утверждено)/.test(s)) tek = null;
    else stop(`${file}: непонятная строка у факта ${tek.n}: «${s.slice(0, 80)}»`);
  }
  if (chuzhoy) console.log(`  · ${path.basename(file)}: последняя строка — шапка чужого дня «${chuzhoy}», пропущена`);
  if (fakty.length !== 15) stop(`${file}: фактов ${fakty.length}, нужно ровно 15`);
  fakty.forEach((f, i) => {
    if (f.n !== i + 1) stop(`${file}: факт №${f.n} стоит ${i + 1}-м — нумерация сбита`);
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
  if (ostatok && !/^\([^()]*\)\)*\.?$/.test(ostatok) && !/^[;,]\s*\S/.test(ostatok)) stop(`${gde}: после последнего адреса непонятный текст «${ostatok}» — у источника нет адреса?`);
  return out;
}

// Первая дословная цитата источника из «Подробнее» (не название сочинения, не одно слово).
function otryvok(podrobnee) {
  for (const m of podrobnee.matchAll(/«((?:[^«»]|«[^«»]*»)+)»/g)) {
    const q = m[1];
    if (q.split(/\s+/).length < 3 || NAZVANIE.test(q)) continue;
    return `«${q}»`;
  }
  return null;
}

// m — факт материала ~/workspace/knowledge/ns-material/ММ-ДД.md (цитата, адрес, страница, пометка), kadr — кадр материала к факту.
function udar(f, staryy, data, m, kadr) {
  const [pervyy] = f.ssylki;
  if (!pervyy && !m?.href) stop(`факт ${f.n}: «Источник» нет ни в утверждённом, ни адреса в материале`);
  const href = m?.href ?? pervyy.href;
  const stranica = m?.stranica ?? f.ssylki.find((s) => s.href === href)?.imya ?? (m?.href ? new URL(href).host : pervyy.imya);
  if (!pervyy) console.log(`  · факт ${f.n}: в утверждённом нет «Источник» — адрес из материала ${href}`);
  const src = `Источник: ${f.istochnik ?? `${stranica} — ${href}`}`;
  const u = { summary: `<b>${f.summary}</b>`, det: [f.podrobnee], src, stranica, href };
  const o = m?.otryvok ?? staryy?.otryvok ?? otryvok(f.podrobnee);
  if (o) u.otryvok = o;
  // Пометка материала «один источник», «расхождение» — не из списка: пометки нет, «документ» не подставляется.
  const pometka = m?.pometka ?? (m?.pometkaTekst ? null : staryy?.pometka ?? (o ? 'документ' : null));
  if (pometka) u.pometka = pometka;
  if (kadr ?? staryy?.kadr) u.kadr = kadr ?? staryy.kadr;
  u.utverzhden = data;
  return u;
}

// Утверждённый файл дня → {vhod, fakty, data}; без файла или без даты — останов.
function utverzhdennoe(key) {
  const vhod = path.join(VHOD, `ns-${key}.md`);
  if (!fs.existsSync(vhod)) stop(`${vhod}: утверждённого файла нет`);
  const { fakty, data: dataFayla } = razobrat(vhod);
  const data = dataFayla ?? datFlag;
  if (!data) stop(`${vhod}: нет строки «Утверждено Сергеем ДД.ММ.ГГГГ» — дату дайте флагом --utverzhden`);
  if (dataFayla && datFlag && dataFayla !== datFlag) stop(`${vhod}: в файле утверждено ${dataFayla}, флаг ${datFlag}`);
  return { vhod, fakty, data };
}

function den(key) {
  const vyhod = path.join(VYHOD, `${key}.yaml`);
  if (!fs.existsSync(vyhod)) stop(`${vyhod}: карточки нет — новую карточку строит запуск с --iz-staroy`);
  const { vhod, fakty, data } = utverzhdennoe(key);

  const doc = YAML.parseDocument(fs.readFileSync(vyhod, 'utf8'));
  const karta = doc.toJS();
  const bloki = karta.fakty, glavnyy = bloki?.find((b) => b.id === 'fakty'), eshche = bloki?.find((b) => b.id === 'fakty-dnya');
  if (!glavnyy || !eshche) stop(`${vyhod}: нет блоков fakty и fakty-dnya`);
  const starye = [...glavnyy.udary, ...eshche.udary];
  // Старый факт — по той же строке, иначе по номеру (кадр и пометка переходят только так).
  const pary = fakty.map((f, i) => starye.find((s) => BEZ_TEGOV(s.summary) === f.summary) ?? starye[i]);
  const mat = material(key);
  const kadrK = (n) => kadrKartochki(mat.kadry.find((k) => !k.oblozhka && k.kFaktu.includes(n)));
  const novye = fakty.map((f, i) => udar(f, pary[i], data, mat.fakty.get(f.n), kadrK(f.n)));
  glavnyy.udary = novye.slice(0, 10);
  eshche.udary = novye.slice(10);

  const otchet = [];
  fakty.forEach((f, i) => {
    const s = pary[i];
    if (s && BEZ_TEGOV(s.summary) !== f.summary) otchet.push(`факт ${f.n}: строка заменена утверждённой («${BEZ_TEGOV(s.summary).slice(0, 50)}…» → «${f.summary.slice(0, 50)}…»)`);
    if (s && s.det.join(' ') !== f.podrobnee) otchet.push(`факт ${f.n}: «Подробнее» заменено утверждённым`);
    if (f.proverka) otchet.push(`факт ${f.n}: пометка проверки (на страницу не идёт): ${f.proverka}`);
    if (!novye[i].otryvok) otchet.push(`факт ${f.n}: в утверждённом «Подробнее» нет дословной цитаты источника — отрывка нет`);
    if (!novye[i].pometka) otchet.push(`факт ${f.n}: пометки достоверности нет ни в утверждённом, ни в карточке`);
  });

  karta.adres = 'den';
  const r = skhemaNeSdayutsya.safeParse(karta);
  const zamki = r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  // Карточка без adres тоже идёт в сборку: не проходит схему и без adres — не записывать, иначе сборка красная (01-30, r496).
  const bezA = r.success ? r : skhemaNeSdayutsya.safeParse({ ...karta, adres: undefined });
  if (!bezA.success) {
    console.error(`${key}: схема не проходит и без adres — карточка не записана (сборка упала бы):\n  ${bezA.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ')}`);
    return false;
  }
  if (zamki.length && !bezAdresa) {
    console.error(`${key}: замки адреса den не проходят — карточка не записана:\n  ${zamki.join('\n  ')}\n${otchet.map((s) => `  · ${s}`).join('\n')}`);
    return false;
  }

  // Запись: факты и adres — в документ, остальное (порядок, кавычки) остаётся как было.
  // Ссылки YAML (*id001 на кадр факта) разворачиваются в копии: метка уходит вместе со старыми фактами.
  YAML.visit(doc, { Alias: (_, n) => doc.createNode(n.resolve(doc).toJSON(), { aliasDuplicateObjects: false }) });
  doc.setIn(['fakty'], doc.createNode(bloki, { aliasDuplicateObjects: false }));
  if (!zamki.length) {
    doc.delete('adres');
    const pos = doc.contents.items.findIndex((p) => p.key.value === 'key');
    doc.contents.items.splice(pos + 1, 0, doc.createPair('adres', 'den'));
  }
  const shapka = [
    `# Карточка «Русские не сдаются», ${key} (Р489). Факты — утверждённые Сергеем ${data}, дословно из ${vhod.replace(os.homedir(), '~')}`,
    `# машиной scripts/ns-iz-utverzhdennyh.mjs; руками факты не править — править утверждённый файл и перезапустить.`,
    ...(zamki.length ? [`# БЕЗ adres: замки адреса den не проходят — ${zamki.length}: ${zamki.map((z) => z.split(':')[0]).join(', ')}`] : []),
  ];
  // Шапка — своя: старые строки «Проба…» и прежняя шапка машины снимаются, остальные комментарии (материал) остаются.
  const pervyy = doc.contents.items[0].key, STARAYA = /^ ?(Проба |Карточка «Русские не сдаются»|машиной scripts|БЕЗ adres)/;
  const ostalnoe = [doc.commentBefore, pervyy.commentBefore].filter(Boolean).join('\n').split('\n').filter((s) => s && !STARAYA.test(s));
  pervyy.commentBefore = null;
  doc.commentBefore = [...shapka.map((s) => s.slice(1)), ...ostalnoe].join('\n');
  fs.writeFileSync(vyhod, doc.toString({ lineWidth: 0 }));
  console.log(`${key}: ${zamki.length ? 'записана БЕЗ adres' : 'adres: den'}, фактов ${novye.length}, утверждено ${data}`);
  for (const s of otchet) console.log(`  · ${s}`);
  for (const s of zamki) console.log(`  ✗ ${s}`);
  return !zamki.length;
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
