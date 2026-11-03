// Утверждённые факты → карточка дня «Русские не сдаются» (Р489).
// Вход: ~/workspace/knowledge/ns-utverzhdeno/ns-ММ-ДД.md (15 фактов, утверждены Сергеем).
// Выход: src/content/dni-shablon/ne-sdayutsya/ММ-ДД.yaml — факты (fakty, fakty-dnya) заменяются утверждёнными дословно,
// каждому ставится utverzhden, карточке — adres: den; остальное в карточке (обложка, кадры, ролик, аудио, викторина) сохраняется.
// Запуск: node scripts/ns-iz-utverzhdennyh.mjs 01-01 | 01-01..01-31 [--utverzhden ГГГГ-ММ-ДД] [--bez-adresa] [--iz-staroy] [--proverka]
//   --iz-staroy — карточки нет: собрать её из старой страницы src/data/full-pages/ne-sdayutsya/ММ-ДД.html и записи дня
//                 src/content/days/ne-sdayutsya/ММ-ДД.json (образец — 01-01…01-05, r602), затем перенести факты как обычно.
//                 Готовую карточку не перезаписывает. Как переводить день на yaml — scripts/ns-iz-utverzhdennyh.README.md.
//   --proverka — только разобрать утверждённые файлы (источники, дата), ничего не писать.
//   --utverzhden — дата, если в файле нет строки «Утверждено Сергеем ДД.ММ.ГГГГ» (без неё и без флага — ошибка).
//   --bez-adresa — если замки адреса den не проходят, записать карточку без adres (с перечнем, чего не хватает).
// Чего нет в утверждённом — машина не выдумывает: отрывок только дословной цитатой из «Подробнее», пометка — из карточки
// или «документ», если у факта есть дословная цитата источника. Карточка до записи проходит схему музея (замки den-obshchee).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import YAML from 'yaml';
import { skhemaNeSdayutsya } from '../src/lib/dni-ne-sdayutsya.mjs';

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
    for (const k of ['podrobnee', 'istochnik']) if (!f[k]) stop(`${file}: у факта ${f.n} нет ${k === 'podrobnee' ? '«Подробнее»' : '«Источник»'}`);
    f.ssylki = ssylki(f.istochnik, `${file}: факт ${f.n}`);
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

function udar(f, staryy, data) {
  const [pervyy] = f.ssylki;
  const u = { summary: `<b>${f.summary}</b>`, det: [f.podrobnee], src: `Источник: ${f.istochnik}`, stranica: pervyy.imya, href: pervyy.href };
  const o = otryvok(f.podrobnee);
  if (o) u.otryvok = o;
  const pometka = staryy?.pometka ?? (o ? 'документ' : null);
  if (pometka) u.pometka = pometka;
  if (staryy?.kadr) u.kadr = staryy.kadr;
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
  const novye = fakty.map((f, i) => udar(f, pary[i], data));
  glavnyy.udary = novye.slice(0, 10);
  eshche.udary = novye.slice(10);

  const otchet = [];
  fakty.forEach((f, i) => {
    const s = pary[i];
    if (BEZ_TEGOV(s.summary) !== f.summary) otchet.push(`факт ${f.n}: строка заменена утверждённой («${BEZ_TEGOV(s.summary).slice(0, 50)}…» → «${f.summary.slice(0, 50)}…»)`);
    if (s.det.join(' ') !== f.podrobnee) otchet.push(`факт ${f.n}: «Подробнее» заменено утверждённым`);
    if (f.proverka) otchet.push(`факт ${f.n}: пометка проверки (на страницу не идёт): ${f.proverka}`);
    if (!novye[i].otryvok) otchet.push(`факт ${f.n}: в утверждённом «Подробнее» нет дословной цитаты источника — отрывка нет`);
    if (!novye[i].pometka) otchet.push(`факт ${f.n}: пометки достоверности нет ни в утверждённом, ни в карточке`);
  });

  karta.adres = 'den';
  const r = skhemaNeSdayutsya.safeParse(karta);
  const zamki = r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
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

// ── Режим --iz-staroy (Р491): карточки нет — собрать из старой страницы и записи дня. ──
// Образец — карточки 01-01…01-05 (r602). Переносится только то, что есть на старой странице; чего нет — блока нет.
// Чего старая страница не знает (privyazka, звания) — пишется по шаблону из известного (номер дня, плашка даты),
// отбрасываются разделы, которых нет в шаблоне (чат, разбор, «выбор», путь, «трудно поверить»), как у r602.
const STARYE = 'src/data/full-pages/ne-sdayutsya', ZAPISI = 'src/content/days/ne-sdayutsya';
const SAYT = 'https://russian-civilization.ru';
const MES = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MES_R = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const LITSENZIYA = 'цитирование в информационных и учебных целях с указанием автора и источника (ст. 1274 ГК РФ)';
const ENT = { nbsp: ' ', gt: '>', lt: '<', amp: '&', quot: '"', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…' };
const ent = (s) => s.replace(/&(#\d+|[a-z]+);/g, (x, k) => (k[0] === '#' ? String.fromCodePoint(+k.slice(1)) : ENT[k] ?? x));
const tekst = (s) => ent(BEZ_TEGOV(s ?? '')).replace(/\s+/g, ' ').trim();
const vnutri = (s) => ent((s ?? '').replace(/\s+/g, ' ').trim());
const atr = (teg, k) => teg?.match(new RegExp(`\\s${k}="([^"]*)"`))?.[1];

function izStaroyStranicy(key) {
  const vyhod = path.join(VYHOD, `${key}.yaml`), html = path.join(STARYE, `${key}.html`), zapis = path.join(ZAPISI, `${key}.json`);
  if (fs.existsSync(vyhod)) stop(`${vyhod}: карточка уже есть — --iz-staroy готовую не перезаписывает (факты обновляет запуск без флага)`);
  if (!fs.existsSync(html)) stop(`${html}: старой страницы нет — собирать не из чего`);
  if (!fs.existsSync(zapis)) stop(`${zapis}: записи дня нет`);
  const h = fs.readFileSync(html, 'utf8'), j = JSON.parse(fs.readFileSync(zapis, 'utf8'));
  const { vhod, fakty, data } = utverzhdennoe(key);
  const zametki = [];
  const sekciya = (id) => h.match(new RegExp(`<section[^>]*\\sid="${id}"[^>]*>([\\s\\S]*?)</section>`))?.[1];
  const klass = (s, k, teg = 'div') => s?.match(new RegExp(`<${teg}[^>]*class="${k}"[^>]*>([\\s\\S]*?)</${teg}>`))?.[1];
  const h2 = (s) => s?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1];
  const abzacy = (s) => [...(s ?? '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => vnutri(m[1])).filter(Boolean);

  // window.MUSEUM_* — JS-литералы старой страницы: исполняются в пустой песочнице, без document.
  const okno = {};
  for (const [, kod] of h.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    if (!/window\.MUSEUM_/.test(kod)) continue;
    try { vm.runInNewContext(kod, { window: okno }); } catch { /* скрипт с document — не литерал, пропуск */ }
  }
  const quizKod = h.match(/const quiz=\[([\s\S]*?)\n\];/)?.[1];
  const voprosy = quizKod ? vm.runInNewContext(`[${quizKod}]`) : [];

  const [, mm, dd] = key.match(/^(\d\d)-(\d\d)$/), d = +dd, mes = +mm - 1;
  const h1 = tekst(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]);
  const chip = tekst(klass(h, 'date-chip'));
  const god = chip.match(/\b(\d{3,4})\b/)?.[1];
  const opisanie = ent(h.match(/<meta property="og:description" content="([^"]*)"/)?.[1] ?? '');
  if (!h1 || !opisanie) stop(`${html}: нет h1 или og:description — шапку не из чего собрать`);
  const url = `${SAYT}/muzei/ne-sdayutsya/den/${key}/`, title = `${h1} — «Русские не сдаются» — Русская цивилизация`;
  const og = `${SAYT}/og/og-default.jpg`;

  const karta = { muzei: 'ne-sdayutsya', key };
  karta.head = {
    title, description: opisanie, canonical: url, sobytie: j.title ?? h1, ...(god ? { god } : {}),
    og: { type: 'article', site_name: 'Русская цивилизация', title, description: opisanie, url, image: og },
    ld: { '@context': 'https://schema.org', '@type': 'Article', headline: `${h1} — «Русские не сдаются»`, description: opisanie, url, image: og,
      inLanguage: 'ru-RU', isAccessibleForFree: true, publisher: { '@type': 'Organization', name: 'Русская цивилизация', url: `${SAYT}/` } },
  };

  // Обложка — кадр героя; права и адрес — из подписи кадра в записи дня (Госкаталог).
  const geroy = h.match(/<img[^>]*class="st-scene[^"]*"[^>]*>/)?.[0];
  const kartinka = (src, alt, sh, vy, zap) => {
    const credit = zap?.credit ?? '';
    const data_source = credit.match(/https?:\/\/\S+?(?=[.,;]?(?:\s|$))/)?.[0];
    if (!data_source) { zametki.push(`кадр ${src}: в записи дня нет адреса источника — кадр не перенесён`); return null; }
    const k = { src, alt, data_source, license: credit.match(/Права:\s*(.+?)\.?$/)?.[1] ?? LITSENZIYA,
      podpis: `${(zap.caption ?? alt).replace(/\.$/, '')}.`, credit: credit.split(/\s*Источник:/)[0].trim() };
    if (sh && vy) Object.assign(k, { width: +sh, height: +vy });
    return k;
  };
  const zapKadra = (src) => j.images?.find((i) => `/${i.src.replace(/^\//, '')}` === src);
  if (geroy) {
    const src = atr(geroy, 'src'), k = kartinka(src, ent(atr(geroy, 'alt') ?? ''), atr(geroy, 'width'), atr(geroy, 'height'), zapKadra(src));
    if (k) karta.oblozhka = { ...k, hint: tekst(klass(h, 'st-src', 'span')) || chip, celikom: true };
  } else zametki.push('на старой странице нет кадра героя — обложки нет');

  karta.kroshka = `День ${d} · ${h1}`;
  karta.lead = { data: `День ${d} · ${MES[mes]} · ${chip}`, privyazka: `Дата условная: ${d} ${MES_R[mes]} — ${d}-й день музея; событие — ${chip}.`,
    kto: vnutri(klass(h, 'who')), h1, hook: tekst(h.match(/<p class="hook">([\s\S]*?)<\/p>/)?.[1]) };
  karta.stamp = [...(klass(h, 'stamp') ? h.matchAll(/<div class="v">([\s\S]*?)<\/div><div class="k">([\s\S]*?)<\/div>/g) : [])]
    .map((m) => ({ v: tekst(m[1]), k: tekst(m[2]) }));

  const vid = sekciya('video');
  const video = vid && h.match(/<video[^>]*>/)?.[0];
  const ist = sekciya('istoriya');
  if (!ist) stop(`${html}: нет раздела #istoriya — истории дня не из чего собрать`);
  const ag = okno.MUSEUM_AUDIOGUIDE, kal = sekciya('calendar');
  karta.daynav = [video && { id: 'video', label: 'Видео' }, { id: 'story', label: 'Читать' }, ag && { id: 'audioguide', label: 'Слушать' },
    { id: 'fakty', label: 'Факты' }, voprosy.length && { id: 'quiz', label: 'Викторина' }, kal && { id: 'calendar', label: 'Календарь' }].filter(Boolean);
  // Пути ролика на старой странице — от папки музея; на адресе /den/ММ-ДД/ относительные сломаются.
  const ot = (u) => (u && !/^(\/|https?:)/.test(u) ? `/muzei/ne-sdayutsya/${u}` : u);
  if (video) {
    const klyuch = atr(video, 'data-rc-video'), format = atr(video, 'data-rc-format') ?? 'horizontal', p = abzacy(vid);
    karta.video = { h2: tekst(h2(vid)), klyuch, format, pole: `${klyuch}:${format}.sec`, suffix: 'сек',
      badge: tekst(vid.match(/<\/h2>\s*<span[^>]*>([\s\S]*?)<\/span>/)?.[1]) || 'ролик', intro: tekst(p[0]),
      poster: ot(atr(video, 'poster')), mp4: ot(atr(vid.match(/<source[^>]*>/)?.[0], 'src')), note: tekst(p.at(-1)) };
  } else zametki.push('ролика на старой странице нет — блока video нет (адрес den его требует)');

  karta.story = { kicker: tekst(klass(ist, 'kicker')) || 'Подвиг', h2: tekst(h2(ist)), abzacy: abzacy(ist) };
  const udary = fakty.map((f) => udar(f, null, data));
  karta.fakty = [{ id: 'fakty', kicker: 'Десять фактов', h2: h1, udary: udary.slice(0, 10) },
    { id: 'fakty-dnya', kicker: 'Ещё пять фактов', h2: 'Ещё о подвиге', udary: udary.slice(10) }];
  if (ag) karta.audioguide = Object.fromEntries(['audioSrc', 'durationLabel', 'lead', 'stops', 'transcript', 'note'].map((k) => [k, ag[k]]));
  else zametki.push('аудиогида на старой странице нет — блока audioguide нет (адрес den его требует)');
  karta.razdely = [];

  if (!voprosy.length) stop(`${html}: викторины (const quiz=[…]) нет`);
  karta.quiz = { kicker: `Проверь себя · ${voprosy.length} вопросов`, h2: 'Викторина', intro: 'На каждый вопрос — одна попытка. После ответа покажем объяснение.',
    noscript: `Для викторины нужен JavaScript. Ответы: ${voprosy.map((v, i) => `${i + 1} — ${v.o[v.c]}`).join('; ')}.`, ball: 10,
    voprosy: voprosy.map((v) => ({ q: v.q, o: v.o, a: v.c, e: v.e })) };
  karta.result = { h2: 'Итог дня', intro: 'Викторина даёт баллы. Прогресс не сохраняется: перезагрузка страницы начинает день заново.',
    zvanie: `0 / ${voprosy.length * 10} · звание: Гость дня`, note: 'Ответь на вопросы викторины.' };
  if (kal) karta.kalendar = { kicker: tekst(klass(kal, 'kicker')) || 'Календарь подвига', h2: tekst(h2(kal)), intro: tekst(abzacy(kal)[0]) };

  karta.figures = (j.images ?? []).map((i) => `/${i.src.replace(/^\//, '')}`).filter((src) => src !== karta.oblozhka?.src)
    .map((src) => kartinka(src, zapKadra(src).caption ?? '', null, null, zapKadra(src))).filter(Boolean);
  if (!karta.figures.length) zametki.push('кадров, кроме обложки, нет — figures пусто (адрес den требует не меньше 6 разных)');

  karta.sources = [...(sekciya('sources-rights') ?? '').matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => ({ html: vnutri(m[1]) }));
  if (!karta.sources.length) stop(`${html}: в #sources-rights нет ни одного <li> — источников нет`);
  karta.kuda = [...h.matchAll(/<div class="ncard( main)?"><span class="lbl">([\s\S]*?)<\/span><a href="([^"]+)">([\s\S]*?)<\/a><br>([\s\S]*?)<\/div>/g)]
    .filter((m) => !m[3].startsWith('../')) // «Город-музей» — у r602 тоже не переносится
    .map((m) => ({ lbl: tekst(m[2]), href: m[3], title: tekst(m[4]).replace(/\s*→$/, ''), hook: tekst(m[5]), main: !!m[1] }));
  karta.score = { awards: { q: [voprosy.length, 10] }, ranks: [[0, 'Гость дня']] };
  zametki.push('звания (score.ranks) старая страница не знает — оставлено одно «Гость дня»');
  const ch = okno.MUSEUM_CHROME;
  if (ch) { const { museum, city, ...ost } = ch; karta.chrome = { ...ost, random: ost.random ?? [] }; }
  const vozvrat = okno.MUSEUM_RETURN;
  karta.return = vozvrat ? { q: vozvrat.q, a: vozvrat.a, ...(vozvrat.src ? { src: vozvrat.src } : {}) } : { q: voprosy[0].q, a: voprosy[0].o[voprosy[0].c] };
  if (!vozvrat) zametki.push('MUSEUM_RETURN на старой странице нет — вопрос возврата взят из первого вопроса викторины');
  karta.proof = { status: 'ne_utverzhdeno', note: 'Карточка собрана машиной из старой страницы; факты — утверждённые Сергеем, остальное перенесено со старой страницы без правки.' };

  const r = skhemaNeSdayutsya.safeParse(karta);
  if (!r.success) stop(`${key}: собранная карточка не проходит схему музея:\n  ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ')}`);
  const doc = new YAML.Document(karta);
  doc.commentBefore = ` Собрана из старой страницы ${html} и ${zapis} (scripts/ns-iz-utverzhdennyh.mjs --iz-staroy, Р491).`;
  fs.writeFileSync(vyhod, doc.toString({ lineWidth: 0 }));
  console.log(`${key}: собрана из старой страницы, утверждено ${data}, из ${path.basename(vhod)}`);
  for (const s of zametki) console.log(`  · ${s}`);
}

if (proverka) {
  for (const key of dni(args[0])) { const { fakty, data } = utverzhdennoe(key); console.log(`${key}: фактов ${fakty.length}, источников ${fakty.reduce((n, f) => n + f.ssylki.length, 0)}, утверждено ${data}`); }
  process.exit(0);
}
const itog = dni(args[0]).map((key) => { if (izStaroy) izStaroyStranicy(key); return den(key); });
process.exit(itog.every(Boolean) ? 0 : 2);
