// Е1/Е2 (Сергей 20.10.2026, Р47): закон о содержании и права на кадры XX века — общий разбор для сборки
// (src/integrations/zakon.mjs) и отчёта scripts/prava.mjs. Только чтение, без зависимостей.
//
// Е1 — сверка с реестрами Минюста: снимки data/reestry/*.json (иноагенты, нежелательные организации,
// экстремистские организации, экстремистские материалы; обновляет `node scripts/prava.mjs --reestry`).
// Ищем в карточках дней (название, хук, источник, суть, механика, подписи и источники кадров, доп. карточки,
// анкета страницы) и в полных страницах src/data/full-pages. Совпадение — сборка красная.
// Два уровня (замер 20.10: 242 совпадения, почти все — однофамильцы «Иван Павлов» и короткие слова «Гроза»):
//   сильное — сборка красная: полное ФИО (три слова целиком), название организации из 3+ слов в кавычках,
//   адрес экстремистского материала;
//   слабое — только отчёт для человека: имя и фамилия без отчества, инициалы с фамилией, название из 1–2 слов,
//   название экстремистского материала (в описаниях Минюста в кавычках и цитаты — «Отцы и дети», «Победа будет за нами»).
// Ложное совпадение (однофамилец, слово из названия книги) снимается строкой в data/reestry/isklyucheniya.json:
// «<музей>/<ключ>|<вариант>»: «кто решил и дата» — как passport-waivers.json.
//
// Е2 — основание у кадров XX века (год дня ≥ 1900 или год ≥ 1900 в подписи): общественное достояние
// (ст. 1281–1282 ГК), свободная лицензия, цитирование (ст. 1274 ГК) со ссылкой, разрешение, своя генерация.
// Основание берётся из credit/подписи, если оно там названо однозначно; иначе — из ведомости
// data/reestry/osnovaniya.json («<адрес кадра>»: { "osnovanie": "…", "ssylka": "…" }).
import fs from 'node:fs';
import path from 'node:path';
import { cardFrames, fullFrames } from './podpisi.mjs';

const REESTRY = 'data/reestry';
const DAYS = 'src/content/days';
const FULL = 'src/data/full-pages';
const ls = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []);
const readJson = (f, def) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : def);

/** Нормализация для сверки: строчные, ё→е, всё, кроме букв и цифр, — пробел. */
export const norm = (s) => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// Слово с окончанием: «Елизаров» ловит «Елизарова», «Елизаровым»; «Раиса» — «Раисы», «Раисой».
const stem = (w) => (w.length > 4 ? w.replace(/[аяоеыиуюйь]$/, '') : w);
// Слова варианта уже нормализованы (только буквы и цифры) — экранировать нечего.
const wordRe = (w, flex) => (flex && w.length > 1 ? `${stem(w)}\\p{L}{0,3}` : w);

/** Сверщик одной записи реестра: вариант → RegExp по нормализованному тексту (или по сырому — для кавычек). */
function matcher(v) {
  const words = v.tekst.split(' ');
  const body = words.map((w) => wordRe(w, v.slovoforma)).join(' ');
  if (v.kavychki) return { re: new RegExp(`[«"„“]\\s*${words.join('[\\s-]+').replace(/е/g, '[её]')}\\s*[»"“”]`, 'iu'), syroy: true };
  if (v.adres) return { re: new RegExp(v.tekst.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'), 'i'), syroy: true };
  return { re: new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, 'u'), syroy: false };
}

/** Снимки реестров: [{ fayl, reestr, istochnik, data_snimka, zapisi }] */
export function snimki(root = '.') {
  return ls(path.join(root, REESTRY)).filter((f) => f.endsWith('.json') && !['isklyucheniya.json', 'osnovaniya.json'].includes(f))
    .map((f) => ({ fayl: f, ...readJson(path.join(root, REESTRY, f), {}) }));
}

/** Тексты для сверки: { gde, syroy, norm } — по полям карточек и полным страницам. */
export function teksty(root = '.') {
  const out = [];
  const add = (gde, raw) => { if (raw) out.push({ gde, syroy: raw, norm: norm(raw.replace(/<[^>]+>/g, ' ')) }); };
  for (const museum of ls(path.join(root, DAYS))) {
    for (const f of ls(path.join(root, DAYS, museum)).filter((x) => x.endsWith('.json'))) {
      const d = readJson(path.join(root, DAYS, museum, f), {});
      const id = `${museum}/${d.key || f.slice(0, -5)}`;
      const ims = (list, p) => (list || []).forEach((im, i) => { add(`${id} ${p}[${i}].caption`, im.caption); add(`${id} ${p}[${i}].credit`, im.credit); });
      for (const k of ['title', 'hook', 'source', 'gist', 'mechanic', 'more_title']) add(`${id} ${k}`, d[k]);
      ims(d.images, 'images');
      (d.more || []).forEach((e, i) => {
        for (const k of ['title', 'short', 'source']) add(`${id} more[${i}].${k}`, e[k]);
        (e.detail || []).forEach((t, j) => add(`${id} more[${i}].detail[${j}]`, t));
        ims(e.images, `more[${i}].images`); ims(e.detail_images, `more[${i}].detail_images`);
      });
      (d.body || []).forEach((b, i) => add(`${id} body[${i}]`, [b.html, b.lead, typeof b.config === 'string' ? b.config : JSON.stringify(b.config ?? '')].join(' ')));
    }
  }
  for (const museum of ls(path.join(root, FULL))) {
    for (const f of ls(path.join(root, FULL, museum)).filter((x) => x.endsWith('.html'))) {
      const html = fs.readFileSync(path.join(root, FULL, museum, f), 'utf8').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ');
      add(`${museum}/${f.slice(0, -5)} полная страница`, html);
    }
  }
  return out;
}

const silnoe = (v, s) => v.adres || (s.vid !== 'materialy' && v.tekst.split(' ').filter((w) => w.length > 1).length >= 3);

/** Е1: совпадения с реестрами. { snimkov, zapisey, sovpadeniya, vozmozhnye: [{ gde, reestr, imya, variant }], starye } */
export function sverkaReestrov(root = '.', { segodnya = new Date() } = {}) {
  const isk = readJson(path.join(root, REESTRY, 'isklyucheniya.json'), {});
  const sn = snimki(root);
  const tx = teksty(root);
  const sovpadeniya = [];
  const vozmozhnye = [];
  const starye = [];
  let zapisey = 0;
  // Предотбор: сорт. словарь слов корпуса и слова каждого текста — регэксп только там, где есть все слова варианта.
  const prefiks = (arr, p) => { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] < p) lo = m + 1; else hi = m; } return !!arr[lo]?.startsWith(p); };
  for (const t of tx) { t.slova = [...new Set(t.norm.split(' '))].sort(); t.niz = t.syroy.toLowerCase(); }
  const slovar = [...new Set(tx.flatMap((t) => t.slova))].sort();
  const estPrefiks = (p) => prefiks(slovar, p);
  const vTekste = (t, w, flex) => prefiks(t.slova, flex ? stem(w) : w) && (flex || t.slova.includes(w));
  for (const s of sn) {
    const dney = s.data_snimka ? Math.floor((segodnya - new Date(s.data_snimka)) / 864e5) : Infinity;
    if (dney > 14) starye.push(`${s.fayl}: снимок ${s.data_snimka || 'без даты'} — старше 14 дней`);
    for (const z of s.zapisi || []) {
      zapisey++;
      for (const v of z.varianty || []) {
        const words = v.adres ? [] : v.tekst.split(' ');
        const flex = (w) => v.slovoforma && w.length > 1;
        if (!words.every((w) => (flex(w) ? estPrefiks(stem(w)) : estPrefiks(w)))) continue;
        const { re, syroy } = matcher(v);
        for (const t of tx) {
          if (v.adres ? !t.niz.includes(v.tekst) : !words.every((w) => vTekste(t, w, flex(w)))) continue;
          if (!re.test(syroy ? t.syroy : t.norm)) continue;
          if (`${t.gde.split(' ')[0]}|${v.tekst}` in isk) continue;
          (silnoe(v, s) ? sovpadeniya : vozmozhnye).push({ gde: t.gde, reestr: s.reestr || s.fayl, imya: z.imya, variant: v.tekst });
        }
      }
    }
  }
  return { snimkov: sn.length, zapisey, sovpadeniya, vozmozhnye, starye };
}

// --- Е2 ---------------------------------------------------------------------------------------------

// Основание прямо названо в подписи: лицензия, общественное достояние, цитирование, разрешение, своя работа.
const OSNOVANIE = [
  [/\bCC[ -]?0\b|\bCC[ -]?BY\b|creative commons|свободн\S* лиценз|\bGFDL\b|\bFAL\b/i, 'свободная лицензия'],
  [/обществен\S* достоян|public domain|\bPD-|переходн\S* в общ/i, 'общественное достояние'],
  [/ст(\.|атья)? ?1274|цитировани|в порядке цитат/i, 'цитирование (ст. 1274 ГК)'],
  [/с разрешени|по разрешени|разрешени\S* (правообладат|автор|музе|архив)|предоставлен\S* (музеем|архивом|автором|правообладател)/i, 'разрешение правообладателя'],
  [/сгенерир|генераци|Genosai|реконструкц\S* (проекта|«Русской)/i, 'своя генерация проекта'],
  // Почтовая марка — государственный знак почтовой оплаты, не объект авторского права (пп. 2 п. 6 ст. 1259 ГК).
  [/ст(\.|атья)? ?1259|официальн\S* документ|государственн\S* символ|почтов\S* марк|марк\S* «?почта ссср|знак\S* почтовой оплаты/i, 'не объект авторского права (ст. 1259 ГК)'],
];
export const osnovanieIz = (txt) => OSNOVANIE.find(([re]) => re.test(txt || ''))?.[1] || '';

const godIz = (s) => [...String(s ?? '').matchAll(/(?<!\d)(1[0-9]\d\d|20\d\d)(?!\d)/g)].map((m) => +m[1]);
/** Кадр XX века: год дня ≥ 1900 (первый год в поле year) или год ≥ 1900 в подписи. */
export const vekXX = (godDnya, podpis) => (godIz(godDnya)[0] ?? 0) >= 1900 || godIz(podpis).some((g) => g >= 1900);

/** Е2: кадры XX века и их основания. { vsego, bez: [...], kadry: [{ museum, key, src, podpis, osnovanie, otkuda, gde }] } */
export function kadryXX(root = '.') {
  const vedomost = readJson(path.join(root, REESTRY, 'osnovaniya.json'), {});
  const gody = {};
  for (const museum of ls(path.join(root, DAYS)))
    for (const f of ls(path.join(root, DAYS, museum)).filter((x) => x.endsWith('.json')))
      gody[`${museum}/${f.slice(0, -5)}`] = readJson(path.join(root, DAYS, museum, f), {}).year;
  const kadry = [];
  const one = (fr, gde, podpis, txt, gotovo) => {
    if (!vekXX(gody[`${fr.museum}/${fr.key}`], podpis)) return;
    const ved = vedomost[fr.src];
    const iz = gotovo || osnovanieIz(txt);
    kadry.push({ museum: fr.museum, key: fr.key, src: fr.src, podpis: String(podpis || '').slice(0, 160), gde,
      osnovanie: iz || ved?.osnovanie || '', otkuda: iz ? 'подпись' : ved?.osnovanie ? 'ведомость' : '', ssylka: ved?.ssylka || '' });
  };
  for (const fr of cardFrames(root)) one(fr, 'карточка', fr.caption, `${fr.credit} ${fr.caption}`, fr.generated ? 'своя генерация проекта' : '');
  // Полная страница: подпись у кадра или таблица прав страницы (state rights — основание в списке прав страницы).
  for (const fr of fullFrames(root)) one(fr, 'полная страница', fr.sign || fr.alt, `${fr.sign} ${fr.alt}`, fr.state === 'rights' ? 'в таблице прав страницы' : '');
  const bez = kadry.filter((k) => !k.osnovanie);
  return { vsego: kadry.length, bez, kadry };
}
