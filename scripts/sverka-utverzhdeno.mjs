// Сверщик страницы дня с утверждённым (Р506, Сергей 04.11.2026: «делай всё, что нужно для автоматизации»).
// Корень Р503/Р505: страница «Не сдаются» собиралась из старой, а не из утверждённой карточки, — отчёт одно, страница другое.
// Р511: любой музей. Правда — копия карточки src/data/utverzhdeno/<музей>/ММ-ДД.json (scripts/utverzhdeno-kopiya.mjs
// из workspace). Сверяются музеи, у которых есть копии; остальные — строка «карточек нет», не падение.
// Страница — YAML шаблона src/content/dni-shablon/<музей>/ММ-ДД.yaml или старая src/data/full-pages/<музей>/ММ-ДД.html,
// читает их scripts/sverka/chitat-stranicu.mjs (Р511, часть «чтение страниц»). По каждому дню со страницей и копией:
//  а) факты страницы — те же, что в карточке (сколько утверждено, Р510), и в порядке «poryadok»;
//     заголовок сравнивается после чистки тегов, ё=е, кавычек и тире; правка слов допустима, другой факт — нет;
//  б) у каждого кадра карточки кадров (ns-material / ММ-ДД.kadry.md) есть привязка «к факту: N | обложка | галерея»
//     (Р514; прочерк, пусто, голое «нет» — ошибка), номер N есть в карточке; кадр у факта страницы — привязанный к нему,
//     а не к другому факту, не к обложке/галерее и не кадр, которого в карточке кадров нет;
//  в) ни один кадр (номер Госкаталога или файл) не повторяется: обложка, кадры фактов, галерея figures;
//  г) нет двух фактов про одно и то же — ни в карточке, ни на странице: общие редкие слова и сочетания
//     (основы от 5 букв, имена, числа, названия в кавычках), вес — по редкости среди всех карточек этого музея;
//     тема дня не в счёт: заголовок дня, герой, слова из 3+ фактов дня. Проверка (г) — «на пробе» (Р520): пока по
//     scripts/sverka/povtory-proba.json ложных больше 1, её находки — ::warning::, не падение (scripts/sverka/README.md).
//     Пара, которую человек проверил и признал разными фактами, пишется в копию карточки:
//     "ne_povtory": [{ "para": "5-11", "pochemu": "…" }] — тогда она не повтор ни в карточке, ни на странице.
// Обычный режим — дни, изменённые в заявке (git diff с базой): красное — код 1 и ::error:: по-русски.
// День из src/data/utverzhdeno/v-rabote.json (пересборка идёт) в обычном режиме — строка долга, не падение.
// --vse — таблица по всем дням и полный список повторов фактов, без падения (долг). --proba — заведомые случаи.
// Откат — удалить шаги sverka-utverzhdeno из .github/workflows/proverka.yml.
// Запуск: node scripts/sverka-utverzhdeno.mjs [--muzey X] [--proba] [--vse] [--baza origin/main] [ММ-ДД …]
//   без --muzey — все 12 музеев (src/data/calendar-meta-*.json); дни ММ-ДД — только вместе с --muzey.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { chitatStranicu, izYaml, izHtml, idKadra, muzei } from './sverka/chitat-stranicu.mjs';
import { razobratMaterial } from './utverzhdeno-kopiya.mjs';

const KOREN = new URL('..', import.meta.url).pathname;
const STR = (m) => `src/content/dni-shablon/${m}`;
const FULL = (m) => `src/data/full-pages/${m}`;
const UTV = (m) => `src/data/utverzhdeno/${m}`;
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
const KORPUS = new Map(); // музей → { df, df2, N }
const klyuch = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const nePovtory = (utv) => new Set((utv.ne_povtory || []).map((x) => klyuch(...x.para.split('-').map(Number))));
export function korpus(muzey) {
  if (KORPUS.has(muzey)) return KORPUS.get(muzey);
  const dir = path.join(KOREN, UTV(muzey));
  const df = new Map(); const df2 = new Map(); let N = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    for (const fk of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).fakty) {
      N++;
      for (const x of slova(`${fk.zagolovok} ${fk.podrobnee}`)) df.set(x, (df.get(x) || 0) + 1);
      for (const x of pary2(`${fk.zagolovok} ${fk.podrobnee}`)) df2.set(x, (df2.get(x) || 0) + 1);
    }
  }
  KORPUS.set(muzey, { df, df2, N }); return KORPUS.get(muzey);
}
// Герой дня (Р514): слова заголовка дня и имена людей («Виктор Слюсаренко», «мичман Слюсаренко» — имя из списка
// ИМЕНА_ЛЮДЕЙ, за ним фамилия с заглавной) признаком повтора не считаются: у изобретений все факты — про одного
// человека или одну машину, и общий герой говорит о герое, а не о той же детали. Остальные совпадения считаются.
const IMENA_LYUDEJ = new Set(('александр алексей анатолий андрей антон аркадий борис вадим валентин валерий василий '
  + 'виктор виталий владимир владислав всеволод вячеслав геннадий георгий герман глеб григорий даниил денис дмитрий '
  + 'евгений евпатий егор иван игнатий игорь илья иосиф кирилл константин лев леонид максим марк матвей михаил '
  + 'никита николай олег павел петр роман семен сергей станислав степан тимофей федор филипп эдуард юрий яков '
  + 'александра алла анна валентина вера галина екатерина елена зинаида зоя ирина клавдия людмила мария надежда '
  + 'мстислав ярослав святослав лаврентий ефим захар кузьма макар назар прохор савва фома арсений афанасий '
  + 'наталья нина ольга светлана софья тамара татьяна').split(' '));
export function geroiDnya(zagolovokDnya, fakty) {
  const out = new Set();
  const syroj = String(zagolovokDnya ?? '').replace(/^[^·]*·/, '');
  for (const m of syroj.matchAll(/«([^«»]{3,40})»/g)) out.add(`«${chistka(m[1])}»`);
  for (const w of chistka(syroj).split(' ')) {
    if (w.length >= 4 && !STOP.has(w)) out.add(osnova(w));
    for (const ch of w.match(/\d{2,}/g) || []) out.add(ch); // «К-278» → 278
  }
  const familii = new Set();
  for (const f of fakty) {
    const t = `${f.zagolovok} ${f.podrobnee}`.replace(/<[^>]+>/g, ' ').replace(/ё/g, 'е').replace(/Ё/g, 'Е');
    for (const m of t.matchAll(/([А-Я][а-яе]+)(?=\s+(?:[А-Я][а-яе]+вич\s+|[А-Я]\.\s*)?([А-Я][а-яе]{3,}))/gu)) {
      if (!IMENA_LYUDEJ.has(chistka(m[1]))) continue;
      out.add(osnova(chistka(m[1]))); familii.add(osnova(chistka(m[2])));
    }
  }
  for (const x of familii) out.add(x);
  return out;
}
export function povtory(muzey, fakty, porog = POROG, ne = new Set(), geroj = new Set()) {
  const K = korpus(muzey);
  const ves1 = (x) => Math.log(K.N / Math.max(1, K.df.get(x) || 1));
  const tekst = (f) => `${f.zagolovok} ${f.podrobnee}`;
  const sl = fakty.map((f) => slova(tekst(f)));
  const zag = fakty.map((f) => slova(f.zagolovok));
  const p2 = fakty.map((f) => pary2(tekst(f)));
  const df = new Map();
  for (const s of sl) for (const x of s) df.set(x, (df.get(x) || 0) + 1);
  const par = [];
  for (let i = 0; i < fakty.length; i++) for (let j = i + 1; j < fakty.length; j++) {
    const obshchie = [...sl[i]].filter((x) => sl[j].has(x) && df.get(x) <= 2 && !geroj.has(x)).sort((a, b) => ves1(b) - ves1(a));
    const vZag = obshchie.filter((x) => zag[i].has(x) || zag[j].has(x));
    const redkie2 = [...p2[i]].filter((x) => p2[j].has(x) && (K.df2.get(x) || 0) <= 2
      && !x.split(' ').some((w) => geroj.has(w) || df.get(w) > 2)); // сочетание с героем или словом из 3+ фактов дня — тема, не в счёт
    const ves = obshchie.reduce((s, x) => s + ves1(x), 0) + vZag.reduce((s, x) => s + ves1(x), 0)
      + redkie2.length * Math.log(K.N / 2);
    if (ves >= porog && !ne.has(klyuch(fakty[i].n, fakty[j].n))) par.push({ a: fakty[i].n, b: fakty[j].n, ves: +ves.toFixed(1), slova: [...new Set([...redkie2, ...obshchie])] });
  }
  return par.sort((x, y) => y.ves - x.ves);
}

// ——— страница ———
// Страница читается scripts/sverka/chitat-stranicu.mjs: { fakty: [{ zagolovok, podrobnee, kadry: [id] }], vse_kadry: [{ gde, kadr, src }] }.
// Кадр карточки узнаётся по тому же id (номер Госкаталога / camo:N / имя файла) или по имени своего файла.
const imyaFajla = (s) => String(s || '').split(/[?#]/)[0].split('/').pop();
const idyKadraKartochki = (x) => [x.gk, idKadra(x.fajl, x.gk ? `https://goskatalog.ru/portal/#/collections?id=${x.gk}` : ''), imyaFajla(x.fajl)].filter(Boolean);
const PROVERYAEM = /^(обложка|факт \d+|галерея)$/; // прочие картинки записи (викторина, ролик) повтором кадра дня не считаются

// Какому факту карточки соответствует факт страницы: заголовок, а если заголовок переписан — подробности.
function shodstvo(u, f) {
  if (chistka(u.zagolovok) === chistka(f.zagolovok)) return 1;
  const z = zhakkar(slova(u.zagolovok), slova(f.zagolovok));
  const d = zhakkar(slova(u.podrobnee), slova(f.podrobnee));
  return Math.max(z, 0.9 * d);
}
const ODIN = 0.5; // ниже — это уже не тот же факт

// Привязка кадров в самой карточке (Р514): у каждого кадра «к факту: N | обложка | галерея» (или «нет (пояснение)»),
// прочерк, пусто, голое «нет» и непонятное — ошибка; номер — только из фактов карточки.
const MESTO = { oblozhka: 'обложке', galereya: 'галерее', net: 'никакому факту («нет»)' };
export function oshibkiPrivyazki(utv) {
  const o = []; const est = new Set(utv.fakty.map((f) => f.n));
  for (const x of utv.kadry) {
    const kto = `кадр ${x.n} (${x.gk ? `Госкаталог ${x.gk}` : imyaFajla(x.fajl)})`;
    const p = x.privyazka ?? '';
    if (!x.mesto) o.push(/^(?:[—–-]*|нет\.?)$/i.test(p.trim()) ? `${kto} — нет привязки к факту («к факту: ${p.trim() || 'пусто'}»)` : `${kto} — непонятная привязка «${p}»: нужно «к факту: N», «обложка» или «галерея»`);
    else if (x.mesto === 'fakt') {
      const vne = [x.fakt, ...x.takzhe].filter((n) => !est.has(n));
      if (vne.length) o.push(`${kto} — номер факта вне карточки: ${vne.join(', ')} (в карточке ${[...est].sort((a, b) => a - b).join(', ')})`);
    }
  }
  return o;
}

// Проба глазами проверки повторов (Р520). Проверка допущена в строгий шаг, только если на всех днях музеев пробы
// все её находки размечены человеком, находок не меньше 10 и ложных не больше 1. Иначе её находки — «на пробе»:
// печатаются предупреждением и заявку не роняют. Пара непроверенная, если её нет в пробе или заголовок факта сменился.
const PROBA_PUT = path.join(KOREN, 'scripts/sverka/povtory-proba.json');
let probaKesh = null;
export function probaPovtorov() {
  if (probaKesh) return probaKesh;
  const proba = JSON.parse(fs.readFileSync(PROBA_PUT, 'utf8'));
  const metki = new Map(proba.pary.map((x) => [`${x.muzey} ${x.den} ${x.para}`, x]));
  const nahodki = [];
  for (const muzey of proba.muzei) for (const key of kartyMuzeya(muzey)) {
    const utv = chitatUtv(muzey, key);
    const zag = (n) => utv.fakty.find((f) => f.n === n)?.zagolovok;
    for (const p of povtory(muzey, utv.fakty, POROG, nePovtory(utv), geroiDnya(utv.zagolovok, utv.fakty))) {
      const m = metki.get(`${muzey} ${key} ${p.a}-${p.b}`);
      const svezhaya = m && m.a === zag(p.a) && m.b === zag(p.b);
      nahodki.push({ muzey, key, ...p, metka: svezhaya ? (m.povtor ? 'верно' : 'ложно') : 'не проверено', pochemu: svezhaya ? m.pochemu : '' });
    }
  }
  const schet = (t) => nahodki.filter((x) => x.metka === t).length;
  const [vernyh, lozhnyh, neProvereno] = [schet('верно'), schet('ложно'), schet('не проверено')];
  probaKesh = { nahodki, vernyh, lozhnyh, neProvereno, dopushchena: !neProvereno && nahodki.length >= 10 && lozhnyh <= 1 };
  return probaKesh;
}
const strokaProby = (p) => `проверка повторов фактов на пробе: находок ${p.nahodki.length}, верных ${p.vernyh}, ложных ${p.lozhnyh}, не проверено ${p.neProvereno}`
  + (p.dopushchena ? ' — допущена в строгий шаг' : ' — в строгий шаг не допущена (нужно: все проверены, находок от 10, ложных не больше 1)');

export function sverit(muzey, utv, str) {
  const o = [];
  str = { udary: str.fakty, kadry: str.vse_kadry.filter((k) => PROVERYAEM.test(k.gde)) };
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
  // б) привязка кадров в карточке и кадр к факту на странице
  o.push(...oshibkiPrivyazki(utv));
  const kadrK = (id) => utv.kadry.find((x) => idyKadraKartochki(x).includes(id));
  str.udary.forEach((u, i) => {
    const n = nomer[i]; if (!n) return;
    for (const k of u.kadry) {
      const m = kadrK(k);
      if (!m) o.push(`у факта ${i + 1} (факт ${n} карточки) кадр ${k}, которого нет в кадрах карточки, — привязки к факту нет`);
      else if (m.mesto && m.mesto !== 'fakt') o.push(`у факта ${i + 1} (факт ${n} карточки) кадр ${m.gk || m.fajl}, а он к ${MESTO[m.mesto]}`);
      else if (m.mesto && m.fakt !== n && !m.takzhe.includes(n)) o.push(`у факта ${i + 1} (факт ${n} карточки) чужой кадр ${m.gk || m.fajl} — он к факту ${[m.fakt, ...m.takzhe].join(' или ')}`);
    }
  });
  // в) повтор кадров
  const vid = new Map();
  for (const { gde, kadr, src } of str.kadry) {
    const ids = [...new Set([/^\d+$/.test(kadr) ? `Госкаталог ${kadr}` : kadr, imyaFajla(src)].filter(Boolean))];
    const id = ids.find((x) => vid.has(x)); // номер и файл одного кадра — одна ошибка
    if (id && vid.get(id) !== gde) o.push(`кадр повторяется (${id}): ${vid.get(id)} и ${gde}`);
    else if (id) o.push(`кадр повторяется (${id}) дважды: ${gde}`);
    for (const x of ids) vid.set(x, gde);
  }
  // г) повторы фактов — в карточке и на странице
  const ne = nePovtory(utv);
  const geroj = geroiDnya(utv.zagolovok, utv.fakty);
  const pk = povtory(muzey, utv.fakty, POROG, ne, geroj);
  // находки (г), пока проверка не прошла пробу глазами (scripts/sverka/povtory-proba.json, Р520), — в naProbe, не в o
  const g = [];
  for (const p of pk) g.push(`в карточке два факта про одно: ${p.a} и ${p.b} (${p.slova.slice(0, 4).join(', ')})`);
  const pStr = povtory(muzey, str.udary.map((u, i) => ({ n: i + 1, zagolovok: u.zagolovok, podrobnee: u.podrobnee })), POROG, new Set(), geroj);
  const izKart = new Set(pk.map((p) => `${p.a}-${p.b}`));
  for (const p of pStr) {
    const a = nomer[p.a - 1]; const b = nomer[p.b - 1];
    if (a && b && (izKart.has(klyuch(a, b)) || ne.has(klyuch(a, b)))) continue; // уже сказано про карточку или проверено человеком
    g.push(`на странице два факта про одно: ${p.a} и ${p.b} (${p.slova.slice(0, 4).join(', ')})`);
  }
  const strogo = probaPovtorov().dopushchena;
  return { o: [...new Set(strogo ? [...o, ...g] : o)], naProbe: strogo ? [] : [...new Set(g)], povtoryKart: pk };
}

// Дни в работе (Р514): { "<музей>": { "dni": ["ММ-ДД", …], "kto": "…", "pochemu": "…" } } — пересборка идёт,
// строгий шаг печатает их ошибки долгом и не падает. Сдал день — убери его из списка в той же заявке.
const V_RABOTE_PUT = path.join(KOREN, 'src/data/utverzhdeno/v-rabote.json');
const V_RABOTE = fs.existsSync(V_RABOTE_PUT) ? JSON.parse(fs.readFileSync(V_RABOTE_PUT, 'utf8')) : {};
const chitatUtv = (muzey, key) => JSON.parse(fs.readFileSync(path.join(KOREN, UTV(muzey), `${key}.json`), 'utf8'));
// Полное имя музея — title_ru из museums.json (сокращать нельзя).
const IMENA = new Map(JSON.parse(fs.readFileSync(path.join(KOREN, 'src/data/museums.json'), 'utf8')).museums.map((m) => [m.slug, m.title_ru]));
const imya = (m) => IMENA.get(m) || m;
export const kartyMuzeya = (muzey) => { const d = path.join(KOREN, UTV(muzey)); return fs.existsSync(d) ? fs.readdirSync(d).map((f) => f.match(/^(\d\d-\d\d)\.json$/)?.[1]).filter(Boolean).sort() : []; };

if (import.meta.url === `file://${process.argv[1]}`) glavnoe();

// Один музей: { muzey, net } — карточек нет; иначе { muzey, itog: [{ key, o | net, povtoryKart }] }.
export function proveritMuzey(muzey, dni = null) {
  const karty = kartyMuzeya(muzey);
  if (!karty.length) return { muzey, net: 'карточек нет' };
  const itog = [];
  for (const key of dni || karty) {
    if (!karty.includes(key)) { itog.push({ key, net: 'нет утверждённой карточки' }); continue; }
    const utv = chitatUtv(muzey, key);
    const str = chitatStranicu(muzey, key, KOREN);
    if (!str) { itog.push({ key, net: 'страницы ещё нет', privyazka: oshibkiPrivyazki(utv), povtoryKart: povtory(muzey, utv.fakty, POROG, nePovtory(utv), geroiDnya(utv.zagolovok, utv.fakty)) }); continue; }
    itog.push({ key, ...sverit(muzey, utv, str) });
  }
  return { muzey, itog };
}

function glavnoe() {
// ——— проба ———
if (est('--proba')) {
  // Образец — карточка 01-02 до слияния повторов Р510 (15 фактов, повторы 2–7, 6–11, 3–10 в ней есть);
  // живая карточка 01-02 после Р510 — 12 фактов, на ней случай «карточка на 12 фактов».
  const NS = 'ne-sdayutsya'; const IZ = 'izobreteniya';
  const utv = JSON.parse(fs.readFileSync(path.join(KOREN, 'tests/obrazcy/sverka-utverzhdeno/01-02-do-r510.json'), 'utf8'));
  const zhivaya = chitatUtv(NS, '01-02');
  const po = (n) => utv.fakty.find((f) => f.n === n);
  const udar = (f, kadr) => ({ summary: `<b>${f.zagolovok}</b>`, det: [f.podrobnee], ...(kadr ? { kadr } : {}) });
  const kd = (gk, u = utv) => { const m = u.kadry.find((x) => x.gk === gk); return { src: m.fajl, data_source: `https://goskatalog.ru/portal/#/collections?id=${gk}` }; };
  // хороший день: порядок карточки, кадры по привязке, без повторов; карточка — без найденных повторов фактов
  // кадры убранных фактов (10 — повтор 3–10) уходят вместе с ними, иначе привязка вела бы вне карточки
  const ubrany = [7, 10, 11];
  const chistaya = { ...utv, fakty: utv.fakty.filter((f) => !ubrany.includes(f.n)), kadry: utv.kadry.filter((x) => !ubrany.includes(x.fakt)) };
  chistaya.poryadok = chistaya.fakty.map((f) => f.n);
  const horoshij = () => ({ oblozhka: { src: '/muzei/ne-sdayutsya/merkuriy-aivazovsky-1892.jpg', data_source: 'https://goskatalog.ru/portal/#/collections?id=54675768' },
    fakty: [{ udary: chistaya.poryadok.map((n) => udar(
      // правка слов допустима: ё→е, другие кавычки и тире, слово заменено
      n === 1 ? { ...po(1), zagolovok: po(1).zagolovok.replace(/«/g, '"').replace(/»/g, '"').replace('бился', 'сражался') } : po(n),
      n === 13 ? kd('16117881') : n === 5 ? kd('24083009') : null)) }],
    figures: [{ src: '/muzei/ne-sdayutsya/merkuriy-aivazovsky-1848.jpg', data_source: 'https://goskatalog.ru/portal/#/collections?id=20764039' }] });
  // Тот же хороший день старой готовой страницей full-pages (формат «удары»): шапка, факты с кадрами, галерея.
  const img = (k) => (k ? `<img src="${k.src}" data-source="${k.data_source}" alt="">` : '');
  const html = (y, dop = '') => `<html><body><section class="hero">${img(y.oblozhka)}</section><section id="fakty"><ol class="udary">${
    y.fakty[0].udary.map((u) => `<li><details><summary>${u.summary}</summary><p>${u.det.join(' ')}</p></details>${img(u.kadr)}</li>`).join('')
  }</ol></section><section id="galereya">${y.figures.map((k) => `<figure>${img(k)}</figure>`).join('')}${dop}</section></body></html>`;
  // Живые страницы изобретений и «Не сдаются» (шаблон) — по их карточкам должны быть зелёными.
  const zhivoj = (m, key) => [chitatUtv(m, key), chitatStranicu(m, key, KOREN)];
  const [izU, izS] = zhivoj(IZ, '01-03');
  // 01-13: 16 фактов про одного героя (Слюсаренко) — имя героя дня повтором не считается (Р514), ne_povtory не нужны
  const [iz13U, iz13S] = zhivoj(IZ, '01-13');
  // Р514: привязка кадров. Копия карточки с правкой одного кадра; кадр, что стоит у факта страницы 01-03.
  const sKadrom = (u, gk, pravka) => ({ ...u, kadry: u.kadry.map((x) => (x.gk === gk ? { ...x, ...pravka } : x)) });
  const iz3 = izS.fakty.map((f) => f.kadry[0]).find((k) => izU.kadry.some((x) => x.gk === k));
  const iz3gal = izS.vse_kadry.find((k) => k.gde === 'галерея');
  const material = (t) => razobratMaterial(t).map(({ n, mesto, fakt, takzhe, gk }) => `${n}:${mesto}:${fakt}:${takzhe.join('+')}:${gk}`).join(' ');
  const strogij = (...dni) => { try { execFileSync('node', [process.argv[1], '--muzey', NS, ...dni], { cwd: KOREN, encoding: 'utf8' }); return 0; } catch (e) { return e.status; } };
  const tolkoPrivyazka = (o) => o.length > 0 && o.every((x) => /привязк/.test(x)); // факты сверены без регрессии, долг — только кадры
  const sluchai = [
    ['хороший день', chistaya, izYaml(horoshij()), null],
    ['переставлен факт', chistaya, izYaml((() => { const y = horoshij(); const u = y.fakty[0].udary; [u[0], u[2]] = [u[2], u[0]]; return y; })()), /а по порядку здесь факт/],
    ['подменён факт', chistaya, izYaml((() => { const y = horoshij(); y.fakty[0].udary[3] = udar({ zagolovok: 'Экипаж не кричал «Русские не сдаются!» — это поздняя легенда', podrobnee: 'Знаменитый возглас придумали позднее, в рапортах его нет.' }); return y; })()), /не из карточки/],
    ['чужой кадр', chistaya, izYaml((() => { const y = horoshij(); y.fakty[0].udary[0].kadr = kd('16117881'); return y; })()), /чужой кадр/],
    ['повтор кадра', chistaya, izYaml((() => { const y = horoshij(); y.figures.push(kd('16117881')); return y; })()), /кадр повторяется/],
    ['повтор кадра на обложке', chistaya, izYaml((() => { const y = horoshij(); y.oblozhka = kd('24083009'); return y; })()), /кадр повторяется/],
    ['повтор факта на странице', chistaya, izYaml((() => { const y = horoshij(); y.fakty[0].udary.push(udar(po(7))); return y; })()), /на странице два факта про одно/],
    ['повтор факта 2–7 в карточке', utv, izYaml(horoshij()), /в карточке два факта про одно: 2 и 7/],
    ['повтор факта 6–11 в карточке', utv, izYaml(horoshij()), /в карточке два факта про одно: 6 и 11/],
    // 3–10 (Р510) — тот же факт другими словами; общее у них — слова из 3+ фактов дня (тема), словесная проверка его
    // не видит (Р520). Случай держит пропуск на виду: научится видеть — случай краснеет, его надо вернуть в «ловит».
    ['повтор факта 3–10 в карточке — известный пропуск', utv, izYaml(horoshij()), (o) => !o.some((x) => /два факта про одно: 3 и 10/.test(x))],
    ['карточка на 12 фактов', zhivaya, izYaml((() => {
      // по «Порядку» карточки, у каждого факта — его первый кадр из привязки, лишние кадры факта не ставятся
      const bylo = new Set();
      const kadrK = (n) => zhivaya.kadry.find((x) => x.fakt === n && !bylo.has(x.gk) && bylo.add(x.gk));
      return { fakty: [{ udary: zhivaya.poryadok.slice(0, 10).map((n) => { const k = kadrK(n); return udar(zhivaya.fakty.find((f) => f.n === n), k && kd(k.gk, zhivaya)); }) },
        { udary: zhivaya.poryadok.slice(10).map((n) => udar(zhivaya.fakty.find((f) => f.n === n))) }] };
    })()), null],
    // Р511: старые страницы full-pages и другие музеи
    ['full-pages: хороший день', chistaya, izHtml(html(horoshij())), null],
    ['full-pages: повтор кадра в галерее', chistaya, izHtml(html(horoshij(), img(kd('16117881')))), /кадр повторяется \(Госкаталог 16117881\): факт \d+ и галерея/],
    ['full-pages: подменён факт', chistaya, izHtml(html((() => { const y = horoshij(); y.fakty[0].udary[3] = udar({ zagolovok: 'Экипаж не кричал «Русские не сдаются!» — это поздняя легенда', podrobnee: 'Знаменитый возглас придумали позднее, в рапортах его нет.' }); return y; })())), /не из карточки/],
    ['изобретения 01-03: живая страница по карточке', izU, izS, null, IZ],
    ['изобретения 01-13: 16 фактов, герой дня — не повтор, без ne_povtory', iz13U, iz13S, null, IZ],
    ['изобретения 01-13: факт 12 дважды на странице — повтор', iz13U, { ...iz13S, fakty: [...iz13S.fakty, iz13S.fakty[iz13U.poryadok.indexOf(12)]] }, /на странице два факта про одно/, IZ],
    ['изобретения 01-03: переставлен факт', izU, { ...izS, fakty: [izS.fakty[1], izS.fakty[0], ...izS.fakty.slice(2)] }, /а по порядку здесь факт/, IZ],
    ['изобретения 01-03: повтор кадра обложкой', izU, { ...izS, vse_kadry: [{ gde: 'обложка', kadr: izS.fakty.find((f) => f.kadr).kadr, src: '' }, ...izS.vse_kadry.filter((k) => k.gde !== 'обложка')] }, /кадр повторяется/, IZ],
    ...['01-01', '01-02', '01-03'].map((key) => [`«Не сдаются» ${key}: шаблон без регрессии`, ...zhivoj(NS, key), null]),
    // 01-04, 01-05: факты сходятся, красные только кадры — «к факту: —» и кадры страницы, которых нет в материале (долг Р514)
    ...['01-04', '01-05'].map((key) => [`«Не сдаются» ${key}: факты без регрессии, долг — привязка кадров`, ...zhivoj(NS, key), tolkoPrivyazka]),
    // Р514: привязка кадров в карточке кадров / материале
    ['кадр с прочерком «к факту: —»', sKadrom(izU, iz3, { mesto: null, fakt: null, takzhe: [], privyazka: '—' }), izS, /нет привязки к факту \(«к факту: —»\)/, IZ],
    ['кадр без строки привязки', sKadrom(izU, iz3, { mesto: null, fakt: null, takzhe: [], privyazka: null }), izS, /нет привязки к факту \(«к факту: пусто»\)/, IZ],
    ['кадр с голым «нет»', sKadrom(izU, iz3, { mesto: null, fakt: null, takzhe: [], privyazka: 'нет' }), izS, /нет привязки к факту/, IZ],
    ['кадр «к факту: общий» — непонятная привязка', sKadrom(izU, iz3, { mesto: null, fakt: null, takzhe: [], privyazka: 'общий' }), izS, /непонятная привязка «общий»/, IZ],
    ['номер факта вне карточки', sKadrom(izU, iz3, { fakt: 99, takzhe: [], privyazka: '99' }), izS, /номер факта вне карточки: 99/, IZ],
    ['второй номер вне карточки', sKadrom(izU, iz3, { takzhe: [40], privyazka: '1, 40' }), izS, /номер факта вне карточки: 40/, IZ],
    ['кадр обложки стоит у факта', sKadrom(izU, iz3, { mesto: 'oblozhka', fakt: null, takzhe: [], privyazka: 'обложка' }), izS, /а он к обложке/, IZ],
    ['кадр галереи стоит у факта', sKadrom(izU, iz3, { mesto: 'galereya', fakt: null, takzhe: [], privyazka: 'галерея' }), izS, /а он к галерее/, IZ],
    ['кадр «нет (пояснение)» стоит у факта', sKadrom(izU, iz3, { mesto: 'net', fakt: null, takzhe: [], privyazka: 'нет (снимок другого года)' }), izS, /а он к никакому факту/, IZ],
    ['у факта кадр, которого нет в карточке кадров', { ...izU, kadry: izU.kadry.filter((x) => x.gk !== iz3) }, izS, /которого нет в кадрах карточки/, IZ],
    ['кадр привязан к другому факту', (() => { const m = izU.kadry.find((x) => x.gk === iz3); const drug = izU.fakty.map((f) => f.n).find((n) => n !== m.fakt && !m.takzhe.includes(n)); return sKadrom(izU, iz3, { fakt: drug, takzhe: [], privyazka: String(drug) }); })(), izS, /чужой кадр/, IZ],
    ['изобретения 01-03: кадр факта повторён в галерее', izU, { ...izS, vse_kadry: [...izS.vse_kadry, { ...izS.vse_kadry.find((k) => k.kadr === iz3), gde: 'галерея' }] }, /кадр повторяется .*галерея/, IZ],
    ['изобретения 01-03: кадр галереи дважды', izU, { ...izS, vse_kadry: [...izS.vse_kadry, iz3gal] }, /кадр повторяется .* дважды: галерея/, IZ],
    ['разбор: оба написания привязки', izU, izS, () => material('### Кадр 1 (запас)\nфайл: /a.jpg\nисточник: https://goskatalog.ru/portal/#/collections?id=5\nк факту: галерея\n\n'
      + 'Кадр 2\nФайл: /b.jpg (800×600)\nИсточник: https://goskatalog.ru/portal/#/collections?id=6\nФакт к кадру: нет (обложка дня)\n\n'
      + '### Кадр 3\nфайл: /c.jpg\nк факту: 6 (экипаж 52 человека), также 8\n\n### Кадр 4\nфайл: /d.jpg\nк факту: —\n\nКадр 5\nФайл: /e.jpg\nФакт к кадру: 5 (и 1)')
      === '1:galereya:null::5 2:oblozhka:null::6 3:fakt:6:8: 4:null:null:: 5:fakt:5:1:', IZ],
    ['день в работе (v-rabote.json) строгий шаг не роняет', izU, izS, () => !V_RABOTE[NS]?.dni?.includes('01-04') && strogij('01-04') === 1
      && V_RABOTE[NS]?.dni?.length > 0 && strogij(V_RABOTE[NS].dni[0]) === 0, IZ],
  ];
  if (zhivaya.fakty.length !== 12) { console.log(`::error::sverka-utverzhdeno: проба ждёт живую карточку 01-02 на 12 фактов, в ней ${zhivaya.fakty.length}`); process.exit(1); }
  let mimo = 0;
  for (const [nazv, u, str, zhdu, muzey = NS] of sluchai) {
    const { o: oStrogo, naProbe } = sverit(muzey, u, str);
    const o = [...oStrogo, ...naProbe]; // случай проверяет, что сверщик находит; строгость — отдельной строкой ниже
    const ok = typeof zhdu === 'function' ? zhdu(o) : zhdu ? o.some((x) => zhdu.test(x)) : o.length === 0;
    if (!ok) { mimo++; console.log(`проба ✗ ${nazv}: ${o.join('; ') || 'ничего не найдено'}`); }
  }
  // музей без карточек — пропуск с отчётом, не падение
  const bez = muzei(KOREN).filter((m) => !kartyMuzeya(m).length);
  const pustoj = bez.length ? proveritMuzey(bez[0]) : { net: 'карточек нет' };
  const vsego = sluchai.length + 1;
  if (pustoj.net !== 'карточек нет') { mimo++; console.log(`проба ✗ музей без карточек (${bez[0]}): ждали «карточек нет»`); }
  console.log(`sverka-utverzhdeno: ${strokaProby(probaPovtorov())}`);
  if (mimo) { console.log(`::error::sverka-utverzhdeno: проба мимо — ${mimo} из ${vsego}`); process.exit(1); }
  console.log(`sverka-utverzhdeno: проба ${vsego} из ${vsego}`);
  process.exit(0);
}

// ——— какие музеи и дни ———
const MUZEY = arg('--muzey', null);
const vseMuzei = muzei(KOREN);
if (MUZEY && !vseMuzei.includes(MUZEY)) { console.log(`::error::sverka-utverzhdeno: музея «${MUZEY}» нет (src/data/calendar-meta-${MUZEY}.json)`); process.exit(1); }
const spisok = MUZEY ? [MUZEY] : vseMuzei;
const dniArg = process.argv.slice(2).filter((x) => /^\d\d-\d\d$/.test(x));
if (dniArg.length && !MUZEY) { console.log('::error::sverka-utverzhdeno: дни ММ-ДД — только вместе с --muzey'); process.exit(1); }
let izm = null; // изменённые в заявке файлы, если не --vse и не названы дни
if (!dniArg.length && !est('--vse')) {
  const baza = arg('--baza', process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main');
  // Страница — новая или изменённая; копия карточки — только изменённая: первая копия музея (заявка с новыми копиями)
  // не роняет дни, чьи страницы собраны раньше, — их долг печатает --vse.
  try {
    const diff = (filtr, ...puti) => execFileSync('git', ['diff', '--name-only', `--diff-filter=${filtr}`, `${baza}...HEAD`, '--', ...puti], { cwd: KOREN, encoding: 'utf8' });
    izm = (diff('AMR', 'src/content/dni-shablon', 'src/data/full-pages') + diff('MR', 'src/data/utverzhdeno')).split('\n').filter(Boolean);
  } catch {
    console.log(`::error::sverka-utverzhdeno: нет базы ${baza} — изменённые дни не определить`);
    process.exit(1);
  }
}

const muzeiItog = [];
for (const muzey of spisok) {
  let dni = dniArg.length ? dniArg : null;
  if (izm) {
    const svoi = [STR(muzey), FULL(muzey), UTV(muzey)].map((d) => `${d}/`);
    dni = [...new Set(izm.filter((f) => svoi.some((d) => f.startsWith(d))).map((f) => f.match(/(\d\d-\d\d)\.(?:yaml|html|json)$/)?.[1]).filter(Boolean))].sort();
    if (!dni.length) { muzeiItog.push({ muzey, net: kartyMuzeya(muzey).length ? 'в заявке не менялся' : 'карточек нет' }); continue; }
  }
  muzeiItog.push(proveritMuzey(muzey, dni));
}
const vseDni = muzeiItog.flatMap((m) => (m.itog || []).map((r) => ({ muzey: m.muzey, ...r })));
const oshibki = (r) => [...(r.o || []), ...(r.privyazka || [])];
const vRabote = (r) => V_RABOTE[r.muzey]?.dni?.includes(r.key);
const proshli = vseDni.filter((r) => r.o && !oshibki(r).length);
const krasnye = vseDni.filter((r) => oshibki(r).length);
const sKartami = vseMuzei.filter((m) => kartyMuzeya(m).length);
const shapka = `sverka-utverzhdeno: музеев с карточками ${sKartami.length} из ${vseMuzei.length} (${sKartami.join(', ') || '—'})`;
if (est('--vse')) {
  console.log(shapka);
  for (const m of muzeiItog) {
    if (m.net) { console.log(`\n${imya(m.muzey)} (${m.muzey}): ${m.net} — пропуск`); continue; }
    console.log(`\n${imya(m.muzey)} (${m.muzey})\nдень  | итог      | что не так`);
    for (const r of m.itog) {
      const ito = oshibki(r).length ? 'КРАСНЫЙ  ' : r.net ? 'не сверяли' : 'зелёный  ';
      const rab = vRabote({ muzey: m.muzey, ...r }) ? `[в работе: ${V_RABOTE[m.muzey].kto}] ` : '';
      const np = (r.naProbe || []).map((x) => `на пробе: ${x}`);
      console.log(`${r.key} | ${ito} | ${rab}${[r.net, ...oshibki(r), ...np].filter(Boolean).join('; ') || '—'}`);
    }
    const pk = m.itog.flatMap((r) => (r.povtoryKart || []).map((p) => `${r.key}  ${p.a}–${p.b}  вес ${p.ves}: ${p.slova.join(', ')}`));
    if (pk.length) console.log(`Повторы фактов в утверждённых карточках:\n${pk.join('\n')}`);
    const z = m.itog.filter((r) => r.o && !oshibki(r).length).length; const k = m.itog.filter((r) => r.o && oshibki(r).length).length;
    const bp = m.itog.filter((r) => r.net); const bpk = bp.filter((r) => oshibki(r).length).length;
    console.log(`итог ${m.muzey}: сверено ${z + k}, зелёных ${z}, красных ${k}; без страницы ${bp.length}${bpk ? ` (из них с ошибками привязки кадров ${bpk})` : ''}`);
  }
  console.log(`\nsverka-utverzhdeno: ${strokaProby(probaPovtorov())}`);
  console.log(`sverka-utverzhdeno: всего сверено ${proshli.length + krasnye.length}, зелёных ${proshli.length}, красных ${krasnye.length}`);
  process.exit(0);
}
console.log(shapka);
for (const m of muzeiItog) {
  if (m.net === 'карточек нет') console.log(`sverka-utverzhdeno: ${imya(m.muzey)} — карточек нет, пропуск`);
  for (const r of (m.itog || []).filter((x) => x.net && x.net !== 'страницы ещё нет')) console.log(`sverka-utverzhdeno: ${imya(m.muzey)} ${r.key} — ${r.net}, сверять не с чем`);
}
// День в работе (src/data/utverzhdeno/v-rabote.json) заявку не роняет: его ошибки — строки долга, не ::error::.
const dolg = krasnye.filter(vRabote); const padayut = krasnye.filter((r) => !vRabote(r));
for (const r of dolg) for (const x of oshibki(r)) console.log(`sverka-utverzhdeno: долг, день в работе у ${V_RABOTE[r.muzey].kto} — ${imya(r.muzey)} ${r.key}: ${x}`);
for (const r of padayut) for (const x of oshibki(r)) console.log(`::error::${imya(r.muzey)} ${r.key}: ${x}`);
// находки проверки повторов, не прошедшей пробу глазами (Р520), — предупреждение, не падение
const naProbe = vseDni.filter((r) => r.naProbe?.length);
for (const r of naProbe) for (const x of r.naProbe) console.log(`::warning::на пробе — ${imya(r.muzey)} ${r.key}: ${x}`);
if (naProbe.length) console.log(`sverka-utverzhdeno: ${strokaProby(probaPovtorov())}`);
console.log(`sverka-utverzhdeno: дней ${proshli.length + krasnye.length}, зелёных ${proshli.length}, красных ${padayut.length}${dolg.length ? `, в работе с долгом ${dolg.length}` : ''}`);
process.exit(padayut.length ? 1 : 0);

}
