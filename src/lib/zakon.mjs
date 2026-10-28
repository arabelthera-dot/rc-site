// Е1/Е2 (Сергей 20.10.2026, Р47): закон о содержании и права на кадры XX века — общий разбор для сборки
// (src/integrations/zakon.mjs) и отчёта scripts/prava.mjs. Только чтение, из зависимостей — yaml (уже есть у Astro).
//
// Е1 — сверка с реестрами Минюста: снимки data/reestry/*.json (иноагенты, нежелательные организации,
// экстремистские организации, экстремистские материалы; обновляет `node scripts/prava.mjs --reestry`).
// Ищем в карточках дней (название, хук, источник, суть, механика, подписи и источники кадров, доп. карточки,
// анкета страницы), в карточках шаблона дня src/content/dni-shablon/**.yaml (все строки) и в полных страницах
// src/data/full-pages. Совпадение — сборка красная.
// Два уровня (замер 20.10: 242 совпадения, почти все — однофамильцы «Иван Павлов» и короткие слова «Гроза»):
//   сильное — сборка красная: полное ФИО (три слова целиком), название организации из 3+ слов в кавычках,
//   адрес экстремистского материала; с r405 (28.10, r380 нашёл иноагента «имя фамилия» и короткое название мимо сверки) ещё
//   иноагент-человек «имя фамилия» / «фамилия имя», его фамилия, если имя из реестра стоит в той же карточке,
//   и короткие названия запрещённых организаций из data/reestry/korotkie-nazvaniya.json;
//   слабое — только отчёт для человека: инициалы с фамилией, название из 1–2 слов,
//   название экстремистского материала (в описаниях Минюста в кавычках и цитаты — «Отцы и дети», «Победа будет за нами»).
// Пометка рядом (±300 знаков: «иностранный агент», у организаций — «запрещена», «экстремистская», «нежелательная»)
// снимает совпадение с человеком или организацией: упоминание с пометкой закон разрешает.
// Ложное совпадение (однофамилец, слово из названия книги) снимается строкой в data/reestry/isklyucheniya.json:
// «<музей>/<ключ>|<вариант>»: «кто решил и дата» — как passport-waivers.json. Раздел «ждёт решения Сергея, r380» —
// найденное, но не исправленное (содержание решает Сергей): сборку не роняет, выводится предупреждением.
// Стоп-лист (Р316, Сергей 28.10.2026: «убирай полностью … вообще все упоминания … и не ставить на странице») — STOP
// ниже: ни исключение, ни пометка, ни раздел «ждёт решения» его не снимают; сборка красная при любом упоминании.
//
// Е2 — основание у кадров XX века (год дня ≥ 1900 или год ≥ 1900 в подписи): общественное достояние
// (ст. 1281–1282 ГК), свободная лицензия, цитирование (ст. 1274 ГК) со ссылкой, разрешение, своя генерация.
// Основание — из ведомости data/reestry/osnovaniya.json, если кадр там есть (Е2, 20.10: проверенное решение
// по ГК важнее пометки в подписи); иначе — из credit/подписи или data-license кадра полной страницы, если оно
// названо однозначно. Ключ ведомости — путь кадра от public/ («muzei/<музей>/…»), запись:
// { "osnovanie", "avtor", "gody", "pravilo", "ssylka" }; запись без основания или без ссылки на источник
// (страница файла, музейная карточка) основанием не считается. Сборка строгая: кадр XX века без основания —
// красная (src/integrations/zakon.mjs).
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { cardFrames, fullFrames } from './podpisi.mjs';

const REESTRY = 'data/reestry';
const DAYS = 'src/content/days';
const SHABLON = 'src/content/dni-shablon';
const ZHDUT = 'ждёт решения Сергея, r380';
const FULL = 'src/data/full-pages';
const ls = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []);
const readJson = (f, def) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : def);

/** Нормализация для сверки: строчные, ё→е, всё, кроме букв и цифр, — пробел. */
export const norm = (s) => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// Слово с окончанием: «Елизаров» ловит «Елизарова», «Елизаровым»; «Раиса» — «Раисы», «Раисой».
const stem = (w) => (w.length > 4 ? w.replace(/[аяоеыиуюйь]$/, '') : w);
// Беглая гласная: «Павел» — «Павла», «Лев» — «Льва»; вторая основа без «е» перед последней согласной
// (в односложном — «ь»), иначе родительный и творительный падежи имени проходили мимо сверки.
const beglaya = (w) => { const m = /^(.*[^аеиоуыэюя])е([вклмнр])$/.exec(w); return m ? m[1] + (m[1].length === 1 ? 'ь' : '') + m[2] : null; };
export const osnovy = (w) => [stem(w), beglaya(w)].filter(Boolean);
// Слова варианта уже нормализованы (только буквы и цифры) — экранировать нечего.
export const wordRe = (w, flex) => (flex && w.length > 1 ? `(?:${osnovy(w).join('|')})\\p{L}{0,3}` : w);

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
  return ls(path.join(root, REESTRY)).filter((f) => f.endsWith('.json') && !['isklyucheniya.json', 'osnovaniya.json', 'korotkie-nazvaniya.json'].includes(f))
    .map((f) => ({ fayl: f, ...readJson(path.join(root, REESTRY, f), {}) }));
}

/** Тексты для сверки: { gde, syroy, norm } — по полям карточек и полным страницам. */
export function teksty(root = '.') {
  const out = [];
  const add = (gde, raw) => { if (raw) out.push(tekst(gde, raw)); };
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
  // Шаблон дня: все строки карточки, путь поля — «karty[3].det[1]».
  for (const museum of ls(path.join(root, SHABLON))) {
    for (const f of ls(path.join(root, SHABLON, museum)).filter((x) => x.endsWith('.yaml'))) {
      const obhod = (v, p) => {
        if (typeof v === 'string') add(`${museum}/${f.slice(0, -5)} ${p}`, v);
        else if (Array.isArray(v)) v.forEach((x, i) => obhod(x, `${p}[${i}]`));
        else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) obhod(x, p ? `${p}.${k}` : k);
      };
      obhod(YAML.parse(fs.readFileSync(path.join(root, SHABLON, museum, f), 'utf8')), '');
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

// Иноагент-человек: запись снимка иноагентов вида «Фамилия Имя [Отчество]» (организации и СМИ — в кавычках, со скобками).
const chelovek = (z, s) => s.fayl === 'inoagenty.json' && /^[А-ЯЁ][а-яё-]+( [А-ЯЁ][а-яё-]+){1,3}$/.test(z.imya.trim());
// Имя и фамилия человека целиком (два слова без инициалов) — сильное с r405.
const imyaFamiliya = (v) => { const w = v.tekst.split(' '); return w.length === 2 && w.every((x) => x.length > 1); };
const silnoe = (v, s, z) => v.adres || v.korotkoe || (s.vid !== 'materialy' && v.tekst.split(' ').filter((w) => w.length > 1).length >= 3)
  || (z && chelovek(z, s) && imyaFamiliya(v));
// Пометка рядом с совпадением (±300 знаков нормализованного текста).
const POMETKA_CHEL = /иностранн\p{L}* агент|иноагент/u;
const POMETKA_ORG = /запрещен|экстремистск|террористическ|нежелательн/u;
const OTCHESTVO = /(?:ович|евич|ич|овн|евн|ичн|инич)\p{L}{0,3}$/u;
const sPometkoy = (t, idx, len, re) => idx >= 0 && re.test(t.norm.slice(Math.max(0, idx - 300), idx + len + 300));

/** Короткие названия запрещённых организаций (data/reestry/korotkie-nazvaniya.json) — псевдоснимок для сверки. */
export function korotkie(root = '.') {
  const k = readJson(path.join(root, REESTRY, 'korotkie-nazvaniya.json'), { zapisi: [] });
  const sn = Object.fromEntries(snimki(root).map((s) => [s.fayl, s]));
  return {
    fayl: 'korotkie-nazvaniya.json', vid: 'korotkie', data_snimka: null,
    zapisi: k.zapisi.map((z) => ({ ...z, reestr: sn[z.fayl]?.reestr || z.fayl,
      vPerechne: !!sn[z.fayl]?.zapisi?.some((x) => x.imya.startsWith(z.zapis)),
      varianty: z.varianty.map((t) => ({ tekst: norm(t), korotkoe: true })) })),
  };
}

/** Исключения: { isk: {ключ: причина}, zhdut: {ключ: причина} } — раздел ZHDUT отдельно. */
export function isklyucheniya(root = '.') {
  const all = readJson(path.join(root, REESTRY, 'isklyucheniya.json'), {});
  const isk = {};
  for (const [k, v] of Object.entries(all)) if (typeof v === 'string') isk[k] = v;
  return { isk, zhdut: all[ZHDUT] || {} };
}

/** Текст для сверки: { gde, syroy, norm }. gde начинается с «<музей>/<ключ>» — по нему снимаются исключения. */
export const tekst = (gde, raw) => ({ gde, syroy: raw, norm: norm(String(raw).replace(/<[^>]+>/g, ' ')) });

/** Е1: совпадения с реестрами. { snimkov, zapisey, sovpadeniya, vozmozhnye: [{ gde, reestr, imya, variant }], starye } */
export function sverkaReestrov(root = '.', opts = {}) {
  return sverkaTekstov(teksty(root), root, opts);
}

/** Е1 по любым текстам (сборка — все карточки и страницы, пост в каналы — его хуки): тот же разбор и те же исключения. */
export function sverkaTekstov(tx, root = '.', { segodnya = new Date(), bezZhdut = false } = {}) {
  const { isk, zhdut: zh } = isklyucheniya(root);
  const zhdutIsk = bezZhdut ? {} : zh;
  const sn = snimki(root);
  const sovpadeniya = [];
  const vozmozhnye = [];
  const starye = [];
  const zhdut = [];
  // Одна находка — один раз на поле (у человека несколько вариантов: «имя фамилия», «фамилия имя»…).
  const bylo = new Set();
  // Исключение снимает запись по своему варианту, у человека — и «фамилию + имя» по любому его варианту в той же карточке.
  const naydeno = (t, s, z, v, sil, drugie = []) => {
    const id = t.gde.split(' ')[0];
    const klyuchi = [v.tekst, ...drugie.map((x) => x.tekst)].map((x) => `${id}|${x}`);
    if (klyuchi.some((k) => k in isk)) return;
    const zap = { gde: t.gde, reestr: z.reestr || s.reestr || s.fayl, imya: z.imya, variant: v.tekst };
    const kz = klyuchi.find((k) => k in zhdutIsk);
    if (kz) { if (sil) zhdut.push({ ...zap, prichina: zhdutIsk[kz] }); return; }
    if (sil && bylo.has(`${t.gde}|${z.imya}`)) return;
    if (sil) bylo.add(`${t.gde}|${z.imya}`);
    (sil ? sovpadeniya : vozmozhnye).push(zap);
  };
  let zapisey = 0;
  // Предотбор: сорт. словарь слов корпуса и слова каждого текста — регэксп только там, где есть все слова варианта.
  const prefiks = (arr, p) => { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] < p) lo = m + 1; else hi = m; } return !!arr[lo]?.startsWith(p); };
  for (const t of tx) { t.slova = [...new Set(t.norm.split(' '))].sort(); t.niz = t.syroy.toLowerCase(); }
  const slovar = [...new Set(tx.flatMap((t) => t.slova))].sort();
  const estPrefiks = (p) => prefiks(slovar, p);
  const vTekste = (t, w, flex) => (flex ? osnovy(w).some((o) => prefiks(t.slova, o)) : prefiks(t.slova, w) && t.slova.includes(w));
  for (const s of [...sn, korotkie(root)]) {
    const dney = s.data_snimka ? Math.floor((segodnya - new Date(s.data_snimka)) / 864e5) : Infinity;
    if (s.data_snimka !== null && dney > 14) starye.push(`${s.fayl}: снимок ${s.data_snimka || 'без даты'} — старше 14 дней`);
    for (const z of s.zapisi || []) {
      zapisey++;
      for (const v of z.varianty || []) {
        const words = v.adres ? [] : v.tekst.split(' ');
        const flex = (w) => v.slovoforma && w.length > 1;
        if (!words.every((w) => (flex(w) ? osnovy(w).some(estPrefiks) : estPrefiks(w)))) continue;
        const { re, syroy } = matcher(v);
        for (const t of tx) {
          if (v.adres ? !t.niz.includes(v.tekst) : !words.every((w) => vTekste(t, w, flex(w)))) continue;
          const m = (syroy ? t.syroy : t.norm).match(re);
          if (!m) continue;
          let sil = silnoe(v, s, z);
          // Пометка рядом снимает человека и организацию (не материал и не адрес).
          if (sil && !v.adres && s.vid !== 'materialy') {
            const re2 = chelovek(z, s) ? POMETKA_CHEL : POMETKA_ORG;
            const idx = syroy ? t.norm.indexOf(norm(m[0])) : m.index;
            if (sPometkoy(t, idx, m[0].length, re2)) continue;
          }
          naydeno(t, s, z, v, sil);
        }
      }
      // Фамилия иноагента-человека и его имя из реестра рядом (в двух словах от неё, то же поле): «Имя Отчество Фамилия»,
      // «Фамилия, Имя», «Александр Андреевич Иванов» — отчество не важно. Отчество («Уварович») — не имя и не фамилия.
      if (chelovek(z, s)) {
        const [fam, im] = norm(z.imya).split(' ');
        if (!fam || !im || fam.length < 3 || im.length < 2) continue;
        if (!osnovy(fam).some(estPrefiks) || !osnovy(im).some(estPrefiks)) continue;
        const slovo = (w) => new RegExp(`^${wordRe(w, true)}$`, 'u');
        const reF = slovo(fam);
        const reI = slovo(im);
        const v = { tekst: `${fam} + ${im}` };
        for (const t of tx) {
          if (!vTekste(t, fam, true) || !vTekste(t, im, true) || bylo.has(`${t.gde}|${z.imya}`)) continue;
          const sl = t.norm.split(' ');
          const i = sl.findIndex((w, j) => reF.test(w) && !OTCHESTVO.test(w)
            && sl.slice(Math.max(0, j - 2), j + 3).some((x, k) => k !== Math.min(j, 2) && reI.test(x) && !OTCHESTVO.test(x)));
          if (i < 0) continue;
          const idx = sl.slice(0, i).join(' ').length + (i ? 1 : 0);
          if (sPometkoy(t, idx, sl[i].length, POMETKA_CHEL)) continue;
          naydeno(t, s, z, v, true, z.varianty);
        }
      }
    }
  }
  return { snimkov: sn.length, zapisey, sovpadeniya, vozmozhnye, starye, zhdut };
}

// --- Стоп-лист Р316 ---------------------------------------------------------------------------------

// Р316 (Сергей 28.10.2026): человек и компания, которых на сайте нет ни в каком виде — ни с пометкой «иноагент»
// или «запрещена», ни строкой в isklyucheniya.json, ни в разделе «ждёт решения». Ловится любая форма слова.
export const STOP = [
  { kto: 'Каспаров (Р316)', re: /каспаров|kasparov/iu },
  { kto: 'Facebook (Р316)', re: /facebook|ф[еэ]йсбук|meta\s+platforms|мета\s+платформ/iu },
  // Компания Meta — слово с заглавной; тег <meta> и metaKey в коде не ловятся.
  { kto: 'Meta (Р316)', re: /(?<![\p{L}\p{N}_<.-])Meta(?![\p{L}\p{N}_-])/u },
];
// Что попадает на страницу: карточки и полные страницы (src/content, src/data), таблицы года (страница «таблица»), страницы и компоненты, public/.
const STOP_PAPKI = ['data/tablicy', 'src/pages', 'src/components', 'src/layouts', 'src/data', 'src/content', 'public'];
const STOP_FAYLY = /\.(md|json|ya?ml|html?|astro|m?js|ts|css|txt|xml|svg|vtt|srt)$/i;
const STOP_MIMO = /(^|\/)(vendor|node_modules)(\/|$)/;
const obhodFaylov = (dir, out = []) => {
  if (!fs.existsSync(dir) || STOP_MIMO.test(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) obhodFaylov(p, out);
    else if (STOP_FAYLY.test(e.name) && !STOP_MIMO.test(p)) out.push(p);
  }
  return out;
};

/** Стоп-лист по текстам: [{ gde, kto, naydeno }] — по строкам, без исключений и пометок. */
export function stopTekstov(tx) {
  const out = [];
  for (const t of tx) {
    const stroki = String(t.syroy).split('\n');
    for (const s of STOP) stroki.forEach((x, i) => {
      for (const m of x.matchAll(new RegExp(s.re.source, s.re.flags + 'g')))
        out.push({ gde: stroki.length > 1 ? `${t.gde}:${i + 1}` : t.gde, kto: s.kto, naydeno: m[0] });
    });
  }
  return out;
}

/** Стоп-лист Р316 по исходникам сайта: все текстовые файлы STOP_PAPKI (карточки дней и шаблона — целиком, кроме vendor). */
export function stopList(root = '.') {
  const fayly = STOP_PAPKI.flatMap((d) => obhodFaylov(path.join(root, d)))
    .map((f) => ({ gde: path.relative(root, f), syroy: fs.readFileSync(f, 'utf8') }));
  return stopTekstov(fayly);
}

/** Стоп-лист Р316 по собранному сайту (dist): то, что на самом деле ушло на страницу. */
export function stopDist(dir) {
  return stopTekstov(obhodFaylov(dir).map((f) => ({ gde: path.relative(dir, f), syroy: fs.readFileSync(f, 'utf8') })));
}

/**
 * Проба Е1 («имя из реестра роняет сборку»): из каждого снимка берётся первая запись с сильным вариантом
 * и вставляется в пробный текст; сверка обязана её поймать. Возвращает список сбоев —
 * снимков, где сильная запись есть, а сверка её не нашла, или где сильных записей нет вовсе.
 */
export function probaReestrov(root = '.') {
  const sboi = [];
  for (const s of snimki(root)) {
    const z = (s.zapisi || []).find((x) => (x.varianty || []).some((v) => silnoe(v, s)));
    if (!z) { if (s.vid !== 'materialy') sboi.push(`${s.fayl}: нет ни одной записи, которую сверка считает сильной`); continue; }
    const v = z.varianty.find((x) => silnoe(x, s));
    const r = sverkaTekstov([tekst(`проба ${s.fayl}`, `Пробный текст сборки: упомянуто ${v.kavychki ? `«${v.tekst}»` : v.tekst}.`)], root,
      { segodnya: new Date(s.data_snimka || Date.now()) });
    if (!r.sovpadeniya.some((x) => x.imya === z.imya)) sboi.push(`${s.fayl}: «${z.imya}» в пробном тексте не пойман`);
  }
  return sboi;
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

export const vedomostOsnovaniy = (root = '.') => readJson(path.join(root, REESTRY, 'osnovaniya.json'), {});

/**
 * Е2 для одного кадра (сборка — все кадры, пост в каналы — его картинка). fr — кадр карточки (cardFrames: caption,
 * credit, generated) или полной страницы (pageFrames: sign, alt, state). Не XX век — null; иначе
 * { museum, key, src, podpis, gde, osnovanie, otkuda, ssylka } — osnovanie пусто, если основания нет.
 */
export function kadrXX(fr, gde, godDnya, vedomost) {
  const karta = gde === 'карточка';
  const podpis = karta ? fr.caption : fr.sign || fr.alt;
  if (!vekXX(godDnya, podpis)) return null;
  // Полная страница: подпись у кадра или таблица прав страницы (state rights — основание в списке прав страницы).
  const gotovo = karta ? (fr.generated ? 'своя генерация проекта' : '') : fr.state === 'rights' ? 'в таблице прав страницы' : '';
  const put = putKadra(fr.museum, fr.src);
  // Строка ведомости засчитывается только с основанием и ссылкой на страницу файла.
  const ved = vedomost[put]?.osnovanie && vedomost[put]?.ssylka ? vedomost[put] : null;
  const iz = ved ? '' : gotovo || osnovanieIz(karta ? `${fr.credit} ${fr.caption}` : `${fr.sign} ${fr.alt} ${fr.data || ''}`);
  return { museum: fr.museum, key: fr.key, src: fr.src, put, podpis: String(podpis || '').slice(0, 160), gde,
    osnovanie: ved?.osnovanie || iz, otkuda: ved ? 'ведомость' : iz ? 'подпись' : '', ssylka: ved?.ssylka || '' };
}

/** Е2: кадры XX века и их основания. { vsego, bez: [...], kadry: [{ museum, key, src, podpis, osnovanie, otkuda, gde }] } */
/** Путь кадра от public/: «../../muzei/x/a.jpg», «media/a.jpg» на странице музея x → «muzei/x/…». */
export const putKadra = (museum, src) => {
  const p = String(src || '').split(/[?#]/)[0].replace(/^(\.\.\/|\.\/|\/)+/, '');
  return p.startsWith('muzei/') ? p : `muzei/${museum}/${p}`;
};

export function kadryXX(root = '.') {
  const vedomost = vedomostOsnovaniy(root);
  const gody = {};
  for (const museum of ls(path.join(root, DAYS)))
    for (const f of ls(path.join(root, DAYS, museum)).filter((x) => x.endsWith('.json')))
      gody[`${museum}/${f.slice(0, -5)}`] = readJson(path.join(root, DAYS, museum, f), {}).year;
  const kadry = [];
  const add = (k) => { if (k) kadry.push(k); };
  for (const fr of cardFrames(root)) add(kadrXX(fr, 'карточка', gody[`${fr.museum}/${fr.key}`], vedomost));
  for (const fr of fullFrames(root)) add(kadrXX(fr, 'полная страница', gody[`${fr.museum}/${fr.key}`], vedomost));
  const bez = kadry.filter((k) => !k.osnovanie);
  return { vsego: kadry.length, bez, kadry };
}
