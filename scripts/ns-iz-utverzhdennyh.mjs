// Утверждённые факты → карточка дня «Русские не сдаются» (Р489).
// Вход: ~/workspace/knowledge/ns-utverzhdeno/ns-ММ-ДД.md (15 фактов, утверждены Сергеем).
// Выход: src/content/dni-shablon/ne-sdayutsya/ММ-ДД.yaml — факты (fakty, fakty-dnya) заменяются утверждёнными дословно,
// каждому ставится utverzhden, карточке — adres: den; остальное в карточке (обложка, кадры, ролик, аудио, викторина) сохраняется.
// Запуск: node scripts/ns-iz-utverzhdennyh.mjs 01-01 | 01-01..01-31 [--utverzhden ГГГГ-ММ-ДД] [--bez-adresa]
//   --utverzhden — дата, если в файле нет строки «Утверждено Сергеем ДД.ММ.ГГГГ» (без неё и без флага — ошибка).
//   --bez-adresa — если замки адреса den не проходят, записать карточку без adres (с перечнем, чего не хватает).
// Чего нет в утверждённом — машина не выдумывает: отрывок только дословной цитатой из «Подробнее», пометка — из карточки
// или «документ», если у факта есть дословная цитата источника. Карточка до записи проходит схему музея (замки den-obshchee).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
  let tek = null, data = null;
  for (const s of stroki) {
    const u = s.match(/Утверждено Сергеем (\d\d)\.(\d\d)\.(\d{4})/);
    if (u) data = `${u[3]}-${u[2]}-${u[1]}`;
    const n = s.match(/^(\d+)\.\s+(?:\((?:нов|стар)\.(?:\+(?:нов|стар)\.)?\)\s+)?(.+)$/);
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
  if (fakty.length !== 15) stop(`${file}: фактов ${fakty.length}, нужно ровно 15`);
  fakty.forEach((f, i) => {
    if (f.n !== i + 1) stop(`${file}: факт №${f.n} стоит ${i + 1}-м — нумерация сбита`);
    for (const k of ['podrobnee', 'istochnik']) if (!f[k]) stop(`${file}: у факта ${f.n} нет ${k === 'podrobnee' ? '«Подробнее»' : '«Источник»'}`);
    if (!/ — https?:\/\/\S+$/.test(f.istochnik)) stop(`${file}: у факта ${f.n} источник без адреса « — http…»: «${f.istochnik}»`);
  });
  return { fakty, data };
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
  const m = f.istochnik.match(/^(.+?) — (https?:\/\/\S+)$/);
  const u = { summary: `<b>${f.summary}</b>`, det: [f.podrobnee], src: `Источник: ${f.istochnik}`, stranica: m[1], href: m[2] };
  const o = otryvok(f.podrobnee);
  if (o) u.otryvok = o;
  const pometka = staryy?.pometka ?? (o ? 'документ' : null);
  if (pometka) u.pometka = pometka;
  if (staryy?.kadr) u.kadr = staryy.kadr;
  u.utverzhden = data;
  return u;
}

function den(key) {
  const vhod = path.join(VHOD, `ns-${key}.md`), vyhod = path.join(VYHOD, `${key}.yaml`);
  if (!fs.existsSync(vhod)) stop(`${vhod}: утверждённого файла нет`);
  if (!fs.existsSync(vyhod)) stop(`${vyhod}: карточки нет — машина переносит факты в готовую карточку, новую не строит`);
  const { fakty, data: dataFayla } = razobrat(vhod);
  const data = dataFayla ?? datFlag;
  if (!data) stop(`${vhod}: нет строки «Утверждено Сергеем ДД.ММ.ГГГГ» — дату дайте флагом --utverzhden`);
  if (dataFayla && datFlag && dataFayla !== datFlag) stop(`${vhod}: в файле утверждено ${dataFayla}, флаг ${datFlag}`);

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
  doc.setIn(['fakty'], doc.createNode(bloki));
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

const itog = dni(args[0]).map(den);
process.exit(itog.every(Boolean) ? 0 : 2);
