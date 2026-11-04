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
//   --bez-adresa — adres не ставить и не трогать: записать карточку, даже если замки адреса den не проходят (с перечнем, чего не хватает).
// Чего нет в утверждённом — машина не выдумывает: отрывок только дословной цитатой из «Подробнее», пометка — из карточки
// или «документ», если у факта есть дословная цитата источника. Карточка до записи проходит схему музея (замки den-obshchee).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import YAML from 'yaml';
import { skhemaNeSdayutsya } from '../src/lib/dni-ne-sdayutsya.mjs';
import { karkas } from './karkas-iz-staroy.mjs';
import { material, kadrKartochki } from './karkas/ne-sdayutsya.mjs';
import { chistka, slova } from './sverka-utverzhdeno.mjs';
import { razobratKartochku } from './utverzhdeno-kopiya.mjs';

const VHOD = path.join(os.homedir(), 'workspace/knowledge/ns-utverzhdeno');
const VYHOD = 'src/content/dni-shablon/ne-sdayutsya';
const UTV = 'src/data/utverzhdeno/ne-sdayutsya';
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

// Первая дословная цитата источника из «Подробнее» (не название сочинения, не одно слово).
function otryvok(podrobnee) {
  for (const m of podrobnee.matchAll(/«((?:[^«»]|«[^«»]*»)+)»/g)) {
    const q = m[1];
    if (q.split(/\s+/).length < 3 || NAZVANIE.test(q)) continue;
    return `«${q}»`;
  }
  return null;
}

// st — старый факт страницы с тем же смыслом, m — факт материала ~/workspace/knowledge/ns-material/ММ-ДД.md.
// Источник — строка карточки дословно; страница и адрес — старого факта, если его адрес в этой строке, иначе первый адрес.
// Отрывок — старый, если он дословно в «Подробнее», иначе первая цитата «Подробнее»; пометка — старая, иначе
// «документ» при цитате, иначе «два источника» при двух сайтах, иначе пометки нет (её дописывает человек).
function udar(f, st, data, m) {
  const [pervyy] = f.ssylki;
  if (!pervyy) stop(`факт ${f.n}: в утверждённом нет «Источник» с адресом`);
  const svoj = st && f.ssylki.find((s) => s.href === st.href);
  const u = { summary: `<b>${f.summary}</b>`, det: [f.podrobnee], src: `Источник: ${f.istochnik}`,
    stranica: svoj ? st.stranica : pervyy.imya || new URL(pervyy.href).host, href: svoj ? st.href : pervyy.href };
  const izKart = otryvok(f.podrobnee);
  const o = st?.otryvok && f.podrobnee.includes(st.otryvok.replace(/^«|»$/g, '')) ? st.otryvok : izKart ?? st?.otryvok;
  if (o) u.otryvok = o;
  const pometka = st?.pometka ?? (izKart ? 'документ' : new Set(f.ssylki.map((s) => new URL(s.href).host)).size >= 2 ? 'два источника' : null);
  if (pometka) u.pometka = pometka;
  return u;
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

// Сходство слов (как у сверщика): доля общих слов от меньшего набора.
const zh = (a, b) => { let o = 0; for (const x of a) if (b.has(x)) o++; return o / Math.max(1, Math.min(a.size, b.size)); };
// Один кадр — один объект: номер Госкаталога, иначе путь файла.
const gkNomer = (k) => String(k?.data_source ?? '').match(/collections\?id=(\d+)/)?.[1] || String(k?.src ?? '').match(/(?:gk|goskatalog)-(\d{5,})/)?.[1] || '';
const kadrId = (k) => gkNomer(k) || k.src;
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

// В старый текст — только разделы fakty и figures, остальное побайтно как было (кавычки, скобки, комментарии).
const razdel = (t, k) => t.match(new RegExp(`^${k}:[^\\n]*\\n(?:(?![\\w#])[^\\n]*\\n|\\n)*`, 'm'));

function den(key) {
  const vyhod = path.join(VYHOD, `${key}.yaml`);
  if (!fs.existsSync(vyhod)) stop(`${vyhod}: карточки нет — новую карточку строит запуск с --iz-staroy`);
  const { vhod, fakty, data } = utverzhdennoe(key);
  const { poryadok, kopiya } = poryadokDnya(key, vhod, fakty);

  const tekst = fs.readFileSync(vyhod, 'utf8'), doc = YAML.parseDocument(tekst);
  const indentSeq = !/^\w+:\n- /m.test(tekst); // 01-02 записан списками без отступа
  const karta = doc.toJS({ maxAliasCount: -1 });
  const bloki = karta.fakty, glavnyy = bloki?.find((b) => b.id === 'fakty'), eshche = bloki?.find((b) => b.id === 'fakty-dnya');
  if (!glavnyy || !eshche) stop(`${vyhod}: нет блоков fakty и fakty-dnya`);
  const starye = [...glavnyy.udary, ...eshche.udary];
  const otchet = [];

  // Старый факт → утверждённый: жадно по сходству строки и «Подробнее», порог 0,5 (кадр, отрывок, пометка переходят только так).
  const pary = [];
  starye.forEach((u, i) => fakty.forEach((f) => {
    const zag = u.summary.match(/<b>([\s\S]*?)<\/b>/)?.[1] ?? u.summary;
    const s = chistka(zag) === chistka(f.summary) ? 1 : Math.max(zh(slova(zag), slova(f.summary)), 0.9 * zh(slova(u.det.join(' ')), slova(f.podrobnee)));
    if (s >= 0.5) pary.push({ i, n: f.n, s });
  }));
  pary.sort((a, b) => b.s - a.s);
  const staryj = new Map(), zanyat = new Set();
  for (const p of pary) if (!staryj.has(p.n) && !zanyat.has(p.i)) { staryj.set(p.n, starye[p.i]); zanyat.add(p.i); }

  // Кадры: со страницы (факты, галерея), потом из материала; привязка к фактам — копия карточки, иначе материал «к факту: N».
  const mat = material(key), obekty = new Map();
  const dobavit = (k) => { if (k?.src && !obekty.has(kadrId(k))) obekty.set(kadrId(k), k); };
  starye.forEach((u) => dobavit(u.kadr)); (karta.figures || []).forEach(dobavit);
  for (const m of mat.kadry) dobavit(kadrKartochki(m));
  const obekt = (x) => obekty.get(x.gk || '') || [...obekty.values()].find((k) => k.src === x.fajl) || null;
  const privyazki = kopiya?.kadry?.length
    ? kopiya.kadry.map((x) => ({ k: obekt(x), fakty: [x.fakt, ...(x.takzhe || [])], x }))
    : mat.kadry.filter((m) => m.kFaktu?.length && !m.oblozhka).map((m) => ({ k: kadrKartochki(m), fakty: m.kFaktu, x: { fajl: m.src } }));
  for (const p of privyazki) if (!p.k) otchet.push(`кадр ${p.x.gk || p.x.fajl}: объекта нет ни на странице, ни в материале (или нет файла, подписи, адреса)`);
  const svyazannye = new Set(privyazki.filter((p) => p.k).map((p) => kadrId(p.k)));
  const ispolzovan = new Set(karta.oblozhka?.src ? [kadrId(karta.oblozhka)] : []);

  const novye = poryadok.map((n) => {
    const f = fakty.find((x) => x.n === n), st = staryj.get(n);
    const u = udar(f, st, data, mat.fakty.get(f.n));
    // кадр: привязанный к факту первым номером, потом «также», потом кадр старого факта, если он ни к чему не привязан
    const kand = [...privyazki.filter((p) => p.fakty[0] === n), ...privyazki.filter((p) => p.fakty.slice(1).includes(n))];
    let k = kand.find((p) => p.k && !ispolzovan.has(kadrId(p.k)))?.k;
    if (!k && st?.kadr && !svyazannye.has(kadrId(st.kadr)) && !ispolzovan.has(kadrId(st.kadr))) k = st.kadr;
    if (k) { u.kadr = k; ispolzovan.add(kadrId(k)); }
    if (st?.utverzhden) u.utverzhden = st.utverzhden; // как в образце 01-03: дата утверждения — в шапке и копии, не у каждого факта
    return u;
  });
  // Галерея: без обложки и кадров фактов; лишние привязанные и снятые со старых фактов — сюда же.
  const figures = [];
  const vGaleryu = (k) => { if (k?.src && !ispolzovan.has(kadrId(k))) { figures.push(k); ispolzovan.add(kadrId(k)); } };
  (karta.figures || []).forEach(vGaleryu);
  privyazki.forEach((p) => vGaleryu(p.k));
  starye.forEach((u) => vGaleryu(u.kadr));
  for (const m of mat.kadry) if (!m.oblozhka) vGaleryu(kadrKartochki(m));

  const ostatok = novye.length - 10, [nav, kicker] = CHISLO[ostatok];
  const b1 = { ...glavnyy, udary: novye.slice(0, 10) }, b2 = { ...eshche, udary: novye.slice(10) };
  if ('nav' in b2) b2.nav = `Ещё ${nav}`;
  b2.kicker = `Ещё ${kicker}`;
  karta.fakty = [b1, b2]; karta.figures = figures;

  fakty.forEach((f) => {
    const s = staryj.get(f.n), u = novye[poryadok.indexOf(f.n)];
    if (!s) otchet.push(`факт ${f.n}: старого факта с тем же смыслом нет — отрывок и пометка из утверждённого`);
    if (f.proverka) otchet.push(`факт ${f.n}: пометка проверки (на страницу не идёт): ${f.proverka}`);
    if (!u.otryvok) otchet.push(`факт ${f.n}: в утверждённом «Подробнее» нет дословной цитаты источника — отрывка нет`);
    if (!u.pometka) otchet.push(`факт ${f.n}: пометки достоверности нет ни в утверждённом, ни в карточке`);
    if (!u.kadr) otchet.push(`факт ${f.n}: без кадра`);
  });

  const r = skhemaNeSdayutsya.safeParse({ ...karta, adres: 'den' });
  const zamki = r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  // Карточка без adres тоже идёт в сборку: не проходит схему и без adres — не записывать, иначе сборка красная (01-30, r496).
  const bezA = skhemaNeSdayutsya.safeParse({ ...karta, adres: undefined });
  if (!bezA.success) {
    console.error(`${key}: схема не проходит и без adres — карточка не записана (сборка упала бы):\n  ${bezA.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ')}`);
    return false;
  }
  if (zamki.length && !bezAdresa) {
    console.error(`${key}: замки адреса den не проходят — карточка не записана:\n  ${zamki.join('\n  ')}\n${otchet.map((s) => `  · ${s}`).join('\n')}`);
    return false;
  }

  doc.set('fakty', doc.createNode(karta.fakty, { aliasDuplicateObjects: false }));
  doc.set('figures', doc.createNode(figures, { aliasDuplicateObjects: false }));
  const stavimAdres = !zamki.length && !bezAdresa; // --bez-adresa: adres не трогаем вовсе (пересборка готовых дней без смены адреса)
  if (stavimAdres && !doc.has('adres')) doc.contents.items.splice(doc.contents.items.findIndex((p) => p.key.value === 'key') + 1, 0, doc.createPair('adres', 'den'));
  else if (stavimAdres) doc.set('adres', 'den');
  const svezhij = doc.toString({ lineWidth: 0, indentSeq, flowCollectionPadding: false });
  let vyh = tekst;
  for (const kl of ['fakty', 'figures', ...(stavimAdres ? ['adres'] : [])]) {
    const st = razdel(vyh, kl), nv = razdel(svezhij, kl);
    if (!nv) stop(`${key}: раздела ${kl} нет в новом документе`);
    vyh = st ? vyh.replace(st[0], () => nv[0]) : vyh.replace(/^key:[^\n]*\n/m, (s) => s + nv[0]);
  }
  if (JSON.stringify(YAML.parse(vyh, { maxAliasCount: -1 })) !== JSON.stringify(YAML.parse(svezhij, { maxAliasCount: -1 }))) stop(`${key}: вставка разделов разошлась с документом`);
  fs.writeFileSync(vyhod, vyh);
  console.log(`${key}: ${stavimAdres ? 'adres: den' : zamki.length ? 'записана БЕЗ adres (замки не проходят)' : 'adres не тронут (--bez-adresa)'}, фактов ${novye.length} (${b1.udary.length}+${b2.udary.length}), кадров у фактов ${novye.filter((u) => u.kadr).length}, галерея ${figures.length}, старых совпало ${staryj.size}, утверждено ${data}`);
  for (const s of otchet) console.log(`  · ${s}`);
  for (const s of zamki) console.log(`  ✗ ${s}`);
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
