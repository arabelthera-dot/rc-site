// Общий слой страницы дня для всех музеев (r602, Р400/Р440): поля карточки, общие замки живого адреса (adres: den),
// подсчёт кадров и загрузчик карточек src/content/dni-shablon/<музей>/ММ-ДД.yaml. Своё у музея — в его модуле:
// изобретения — src/lib/dni-shablon.mjs (igra, pervenstvo), «Русские не сдаются» — src/lib/dni-ne-sdayutsya.mjs (vizual).
// Карточка не проходит схему — сборка красная.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'astro/zod';
import { mp3Sek } from './mp3-sek.mjs';
import { polyaKartinki, polyaFakta, polyaDnya, status } from './forma-dnya.mjs';
import { standartDnya, nomeraDnej } from './standart-dnya.mjs';
import { stroka } from './yazyki.mjs';

// Служебные подписи страницы (пункты меню, викторина, итог, аудиогид, ролик) — шаблоном из src/data/stroki.json (п. 54):
// нет поля в карточке — берётся строка оттуда; есть — карточка как раньше. Своё имя пункта (игра, «Развилка») — в карточке.
const S = (k) => stroka('ru', k);
const NAV = S('denNav');
const SLOVAR = JSON.parse(fs.readFileSync('src/data/slovar.json', 'utf8'));

export const str = z.string().min(1);
// У факта дня на обычном адресе (adres: den) — ещё отрывок-цитата, место в источнике, адрес источника и пометка
// достоверности (замок ниже); у пробы den-shablon эти поля необязательны.
export const POMETKI = ['документ', 'два источника', 'легенда'];
// Служебные пометки (Р504, r514h): замок их принимает, на страницу они не идут — оговорок в тексте страницы нет.
export const POMETKI_SLUZHEBNYE = ['один источник', 'мнение', 'воспоминание'];
// Поля формы Р635 у картинки (vid, prava … svyashchennoe) — src/lib/forma-dnya.mjs; с 02-01 обязательны (docs/standart-dnya.md, Р660).
export const kartinka = z.object({ src: str, alt: str, data_source: str, license: str, podpis: str, credit: str.optional(), ...polyaKartinki });
// Кадр дня (блок #kadry, как у 13 янв.): размеры — со старой страницы; klass: portret — портретный кадр уже (общее правило izobreteniya-den.css).
export const kadr = kartinka.extend({ width: z.number().int().positive().optional(), height: z.number().int().positive().optional(), klass: z.literal('portret').optional() });
// kadr у факта (Р17, «очень много картинок»: каждая — у своего факта) — виден под строкой факта, вне «Подробнее».
// utverzhden — дата «да» Сергея по факту (ГГГГ-ММ-ДД, Р166/Р176); шаблон его не выводит, замок музея решает, обязателен ли.
export const udar = z.object({ summary: str, find: z.boolean().optional(), tag: str.optional(), podrobnee: str.optional(), det: z.array(str).min(1), src: str,
  otryvok: str.optional(), stranica: str.optional(), href: z.string().url().optional(), pometka: z.enum([...POMETKI, ...POMETKI_SLUZHEBNYE]).optional(), kadr: kadr.optional(),
  utverzhden: z.string().regex(/^\d{4}-\d\d-\d\d$/, 'utverzhden — дата ГГГГ-ММ-ДД').optional(),
  // Поля формы Р635 у факта (id, istochnik, dlya_voprosa, otvet, otvet_edinstvennyj); с 02-01 обязательны (Р660).
  ...polyaFakta });
// Норма фактов дня — museum-inventions п.6 (Р101): «4–5 фактов»; меньше — сборка красная (только adres: den).
export const NORMA_FAKTOV = 4;
// Два блока фактов, как у 18 янв. (Р374, Р386: «вместо двух партий полухуков… она одна»): «Десять фактов о …» (id fakty,
// не меньше 10) и «Ещё пять фактов» (id fakty-dnya, не меньше 5). Один блок или меньше — сборка красная (только adres: den).
export const BLOK_FAKTOV = 10, BLOK_ESHCHE = 5;
// День с утверждённой карточкой (src/data/utverzhdeno/<музей>/ММ-ДД.json): фактов столько, сколько в карточке (10–15, Р510:
// «пусть будет меньше»), во втором блоке — остаток сверх десяти.
const faktovVKartochke = (d) => { const f = path.join('src/data/utverzhdeno', d.muzei ?? '', `${d.key}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).fakty.length : null; };
// Кадров у дня на живом адресе — не меньше KADROV_MIN разных (без обложки), из них хоть один в тексте (r602).
export const KADROV_MIN = 6;

// Блок фактов: id секции (по умолчанию fakty), необязательная разметка после списка (dop, напр. фото экспоната)
// и место — после какого блока шаблона (posle; нет — на своём месте, после story). Блоков может быть несколько (Р302, 18 янв.).
// nav — подпись чипа в полосе разделов (#secnav); без nav чипа нет.
export const faktyBlok = (BLOKI) => z.object({ id: str.default('fakty'), posle: z.enum(BLOKI).optional(), kicker: str, h2: str, udary: z.array(udar).min(1), dop: str.optional(), nav: str.optional() });
// Список источников: обычная строка (ссылка + пометка + пояснение) или готовая разметка пункта (html) — у старых страниц бывает
// «Госкаталог: <a>…</a> и <a>…</a>» (Р302).
export const istochnik = z.union([z.object({ href: z.string().url(), title: str, pometka: str.optional(), note: str }), z.object({ html: str })]);

// Общие поля карточки дня; BLOKI — блоки шаблона музея по порядку (к ним цепляются razdely.posle и fakty.posle).
// Своё у музея (игра, первенство, визуализация) добавляет его модуль.
export const obshchiePolya = (BLOKI) => {
  const blok = faktyBlok(BLOKI);
  return {
    muzei: str,
    // `den` — карточка рисует живой адрес den/ММ-ДД (Р286, den/[key].astro), старый HTML уходит на den/ММ-ДД/staraya/;
    // нет поля — проба на den-shablon/ММ-ДД.
    adres: z.literal('den').optional(),
    // Р676: 'zagotovka' — день в работе, пункты состава (171–173 docs/standart-dnya.md) не обязательны; на адрес den не идёт.
    status: status.optional(),
    key: z.string().regex(/^\d\d-\d\d$/, 'ключ дня — ММ-ДД'),
    // sobytie + god — заголовок вкладки и og:title собирает шаблон: «16 января 1969: <событие> — <музей> — Русская цивилизация»
    // (Р286 п.4; событие — title карточки дня src/content/days, год — со старой страницы); нет их — title/og.title как есть.
    head: z.object({ title: str, description: str, canonical: str, sobytie: str.optional(), god: z.string().regex(/^\d{3,4}$/).optional(),
      og: z.object({ type: str, site_name: str, title: str, description: str, url: str, image: str.optional() }),
      ld: z.record(z.string(), z.unknown()) }),
    // Обложка — разметкой 13 янв. (<figure class="hero-fig" id="hero"><div class="hero-scene fit-full">); на адресе den обязательна.
    // celikom — кадр целиком, без обрезки; klass — доп. класс сцены перед fit-full (portret — портрет без растяжения).
    oblozhka: kartinka.extend({ width: z.number().int().positive(), height: z.number().int().positive(), hint: str,
      celikom: z.boolean().default(false), klass: z.literal('portret').optional() }).optional(),
    kroshka: str,
    lead: z.object({ data: str, privyazka: str, kto: str, h1: str, hook: str }),
    stamp: z.array(z.object({ v: str, k: str })),
    daynav: z.array(z.object({ id: str, label: str.optional() }).transform((n, ctx) => {
      const label = n.label ?? NAV[n.id];
      if (!label) ctx.addIssue({ code: 'custom', path: ['label'], message: `у пункта меню «${n.id}» нет label, и в src/data/stroki.json (denNav) его нет` });
      return { ...n, label };
    })),
    // Секции, которых у дня нет, — не пишутся: нет video — нет блока (на adres: den ролик обязателен — замок ниже).
    video: z.object({ h2: str, klyuch: str, format: str, pole: str, suffix: str.default(S('denVideoSuffix')), badge: str, intro: str, poster: str, mp4: str, note: str }).optional(),
    // История — ударами (udary) или простыми абзацами разметкой 1:1 (abzacy, у старых страниц без ударов); intro необязателен.
    story: z.object({ kicker: str, h2: str, intro: str.optional(), udary: z.array(udar).min(1).optional(), abzacy: z.array(str).min(1).optional() })
      .refine((s) => s.udary || s.abzacy, 'у story нужны udary или abzacy'),
    fakty: z.union([blok, z.array(blok).min(1)]).optional(),
    // Уникальные разделы дня: готовая разметка 1:1 после блока posle (из BLOKI); несколько с одним posle — подряд, в порядке карточки.
    // Layout их не знает поимённо — новый день его не правит.
    razdely: z.array(z.object({ posle: z.enum(BLOKI), html: str })).default([]),
    quiz: z.object({ kicker: str.default(S('denQuizKicker')), h2: str.default(S('denQuizH2')), intro: str.default(S('denQuizIntro')), noscript: str, ball: z.number().int().positive().default(10),
      voprosy: z.array(z.object({ q: str, o: z.array(str).min(2), a: z.number().int().min(0), e: str })).min(1) }),
    result: z.object({ kicker: str.optional(), h2: str.default(S('denResultH2')), intro: str, zvanie: str, note: str }),
    // Подписи календаря; нет — подписи музея по умолчанию (шаблон).
    kalendar: z.object({ kicker: str.optional(), h2: str, intro: str }).optional(),
    figures: z.array(kadr).default([]),
    // Строка не по образцу «название: пояснение» — { html } (содержимое <li> как есть).
    sources: z.array(istochnik).min(1),
    kuda: z.array(z.object({ lbl: str, href: str, title: str, hook: str, main: z.boolean() })),
    score: z.object({ awards: z.record(z.string(), z.union([z.number(), z.array(z.number())])), ranks: z.array(z.tuple([z.number(), str])) }),
    // Нет chrome — нет window.MUSEUM_CHROME (museum-chrome.js без настроек, как на части старых страниц).
    chrome: z.object({ share: z.object({ title: str, text: str }), prev: z.object({ href: str, title: str }).optional(),
      next: z.object({ href: str, title: str }).optional(), all: z.object({ href: str, label: str }), random: z.array(str) }).optional(),
    // Дополнительные скрипты дня как есть — после викторины, по порядку: внешний (src) или inline (js).
    skripty: z.array(z.union([z.object({ src: str }), z.object({ js: str })])).default([]),
    // src загадки необязателен: у старой страницы 20 янв. его нет (MUSEUM_RETURN={riddle:{q,a}}); нет — не пишется.
    return: z.object({ q: str, a: str, src: str.optional() }),
    // Нет — нет блока, кнопки «Слушать» и скриптов гида (недоделка пробы, Р232); на adres: den обязателен — замок ниже.
    audioguide: z.object({ audioSrc: str, durationLabel: str, lead: str, stops: z.array(z.object({ t: z.number(), mark: str, title: str })),
      transcript: z.array(str), note: str.default(S('denAudioNote')) }).optional(),
    proof: z.record(z.string(), z.unknown()),
    // Поля формы Р635 у дня (nomer_dnya … slovar) — src/lib/forma-dnya.mjs; с 02-01 обязательны (docs/standart-dnya.md, Р660).
    ...polyaDnya(SLOVAR),
  };
};

// Кадры дня (r602): vse — все разные src без обложки (figures, kadr у фактов и историй, <img src> в razdely и dop фактов);
// vTekste — те, что стоят в тексте (kadr у факта, razdely, dop).
const IMG = /<img\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/gi;
export function kadryDnya(d) {
  const vse = new Set(), vTekste = new Set();
  const imgi = (html) => [...String(html ?? '').matchAll(IMG)].map((m) => m[1]);
  const bloki = [d.fakty ?? []].flat();
  for (const f of d.figures ?? []) vse.add(f.src);
  for (const u of d.story?.udary ?? []) if (u.kadr) vse.add(u.kadr.src);
  for (const u of bloki.flatMap((b) => b.udary)) if (u.kadr) { vse.add(u.kadr.src); vTekste.add(u.kadr.src); }
  for (const s of [...(d.razdely ?? []).flatMap((r) => imgi(r.html)), ...bloki.flatMap((b) => imgi(b.dop))]) { vse.add(s); vTekste.add(s); }
  if (d.oblozhka) { vse.delete(d.oblozhka.src); vTekste.delete(d.oblozhka.src); }
  return { vse, vTekste };
}

// Портреты среди кадров дня (Р408, Р544, pokaz.md п. 2-тер б): «портрет»/«фотопортрет» в alt целым словом — документ
// «с портретами» (газета, марка) не портрет; klass portret — вёрстка узкого кадра, не признак. Лицо без пометки ловит отчёт tools/kadry-povtory.py (каскад Хаара).
const PORTRET_ALT = /(?<![а-яё])(фото)?портрет(?![а-яё])/;
export function portretyDnya(d) {
  const { vse } = kadryDnya(d), p = new Set();
  const kadry = [...(d.figures ?? []), ...(d.story?.udary ?? []).map((u) => u.kadr), ...[d.fakty ?? []].flat().flatMap((b) => b.udary).map((u) => u.kadr)];
  for (const k of kadry) if (k && vse.has(k.src) && PORTRET_ALT.test(String(k.alt ?? '').toLowerCase())) p.add(k.src);
  return p;
}

// Файл в public по адресу со страницы /muzei/<музей>/…: «/x» — от корня сайта, иначе — от папки музея (<base>).
export function failPublic(muzei, src) {
  const u = String(src).split(/[?#]/)[0];
  return path.posix.join('public', u.startsWith('/') ? path.posix.normalize(u) : path.posix.join(`/muzei/${muzei}/`, u));
}
export const AUDIO_MIN_SEK = 30;

const iss = (ctx, p, message) => ctx.addIssue({ code: 'custom', path: p, message });
// Общий замок дня (r602). На любом адресе: номер ответа викторины — в списке. На живом адресе (adres: den):
// head.sobytie+god, обложка, факты 10 + 5 с отрывком/страницей/ссылкой/пометкой, кадры ≥ KADROV_MIN (долг — dolgKadrov),
// аудиогид (файл есть, ≥30 с), ролик, у каждого источника ссылка (долг — src/data/dyry-dolg.json); portrety — портретов ≤ трети кадров. dolgKadrov / dolgVTekste — { 'ММ-ДД': N }: снимок долга, ниже N нельзя.
export function zamokObshchiy(d, ctx, { dolgKadrov = {}, dolgVTekste = {}, portrety = false } = {}) {
  d.quiz.voprosy.forEach((v, i) => { if (v.a >= v.o.length) iss(ctx, ['quiz', 'voprosy', i, 'a'], 'номер ответа вне списка'); });
  if (d.adres !== 'den') return;
  if (d.status === 'zagotovka') iss(ctx, ['status'], 'заготовка (status: zagotovka) на адрес den не идёт — сначала полный состав (Р676)');
  if (!d.head.sobytie || !d.head.god) iss(ctx, ['head'], 'на адресе den нужны head.sobytie и head.god (заголовок вкладки)');
  // Вид 13 янв. (Р302): обложка и кадры обязательны.
  if (!d.oblozhka) iss(ctx, ['oblozhka'], 'на адресе den нужна обложка (oblozhka), как у 13 янв.');
  if (!d.figures.length) iss(ctx, ['figures'], 'на адресе den нужен хотя бы один кадр (figures → блок #kadry), как у 13 янв.');
  // ЗАМОК (Р286): на обычном адресе у дня не меньше NORMA_FAKTOV фактов, у каждого — отрывок, страница, ссылка, пометка.
  const bloki = [d.fakty ?? []].flat(), udary = bloki.flatMap((b) => b.udary);
  if (udary.length < NORMA_FAKTOV)
    iss(ctx, ['fakty', 'udary'], `ЗАМОК: фактов ${udary.length}, нужно не меньше ${NORMA_FAKTOV} (museum-inventions п.6, Р101: «4–5 фактов»)`);
  const glavnyy = bloki.find((b) => b.id === 'fakty'), eshche = bloki.find((b) => b.id === 'fakty-dnya');
  const vKartochke = faktovVKartochke(d), eshcheMin = vKartochke ? Math.min(BLOK_ESHCHE, Math.max(vKartochke - BLOK_FAKTOV, 1)) : BLOK_ESHCHE;
  if (!glavnyy || glavnyy.udary.length < BLOK_FAKTOV || !eshche || eshche.udary.length < eshcheMin)
    iss(ctx, ['fakty'], `ЗАМОК (Р386): нужны два блока фактов, как у 18 янв. — «Десять фактов» (id fakty, ≥${BLOK_FAKTOV}) и «Ещё N фактов» (id fakty-dnya, ≥${eshcheMin}${vKartochke ? `, в утверждённой карточке ${vKartochke}` : ''}); сейчас ${bloki.length ? bloki.map((b) => `${b.id}: ${b.udary.length}`).join(', ') : 'фактов нет'}`);
  udary.forEach((u, i) => { const net = ['otryvok', 'stranica', 'href', 'pometka'].filter((k) => !u[k]);
    if (net.length) iss(ctx, ['fakty', 'udary', i], `ЗАМОК: у факта «${u.summary.replace(/<[^>]+>/g, '').slice(0, 60)}» нет: ${net.join(', ')} (отрывок, страница, ссылка, пометка: ${[...POMETKI, ...POMETKI_SLUZHEBNYE].join(' / ')})`); });
  // ЗАМОК кадров (r602): ≥ KADROV_MIN разных, хоть один в тексте. Долг — снимок на 02.11.2026: порог дня = числу из долга.
  const { vse, vTekste } = kadryDnya(d), dolg = dolgKadrov[d.key], porog = dolg ?? KADROV_MIN;
  if (vse.size < porog)
    iss(ctx, ['figures'], `ЗАМОК кадров: разных кадров ${vse.size}, нужно не меньше ${porog}${dolg !== undefined ? ` (долг на 02.11.2026 — меньше нельзя)` : ` (KADROV_MIN, без обложки: figures, kadr у фактов, <img> в razdely и dop)`}`);
  else if (dolg !== undefined && vse.size >= KADROV_MIN)
    console.log(`::warning::${d.muzei}/${d.key}: кадров ${vse.size} ≥ ${KADROV_MIN} — снять из долга (src/data/kadry-dolg.json)`);
  // ЗАМОК портретов (Р408, Р544): портретов не больше трети разных кадров (portrety — музеи, где он включён).
  const p = portrety ? portretyDnya(d) : new Set();
  if (p.size * 3 > vse.size)
    iss(ctx, ['figures'], `ЗАМОК портретов (Р408): портретов ${p.size} из ${vse.size} кадров — больше трети (pokaz.md п. 2-тер б): ${[...p].join(', ')}`);
  // Кадр в тексте: порог 1; у дня из долга dolgVTekste — число из долга (снимок на 02.11.2026).
  const dolgT = dolgVTekste[d.key], porogT = dolgT ?? 1;
  if (vTekste.size < porogT) iss(ctx, ['fakty'], 'ЗАМОК кадров: ни одного кадра в тексте (kadr у факта, <img> в razdely или dop)');
  else if (dolgT !== undefined && vTekste.size >= 1)
    console.log(`::warning::${d.muzei}/${d.key}: кадр в тексте есть — снять из долга «в тексте» (src/data/kadry-dolg.json)`);
  // ЗАМОК аудиогида (r602): есть, файл лежит в public и не короче AUDIO_MIN_SEK.
  if (!d.audioguide) iss(ctx, ['audioguide'], 'на адресе den нужен аудиогид (audioguide)');
  else {
    const f = failPublic(d.muzei, d.audioguide.audioSrc);
    if (!fs.existsSync(f)) iss(ctx, ['audioguide', 'audioSrc'], `нет файла аудиогида ${f}`);
    else {
      const sek = mp3Sek(fs.readFileSync(f));
      if (sek === null) iss(ctx, ['audioguide', 'audioSrc'], `файл аудиогида не mp3: ${f}`);
      else if (sek < AUDIO_MIN_SEK) iss(ctx, ['audioguide', 'audioSrc'], `аудиогид ${Math.round(sek)} с — меньше ${AUDIO_MIN_SEK} с (${f})`);
    }
  }
  // ЗАМОК ролика (r602): на живом адресе ролик обязателен.
  if (!d.video) iss(ctx, ['video'], 'на адресе den нужен ролик (video)');
  // ЗАМОК источников (Р550): у каждого пункта sources есть ссылка — href или <a href="http…"> в html. Долг — снимок
  // src/data/dyry-dolg.json на 05.11.2026: пунктов без ссылки не больше, чем в долге; стало меньше — снять строку.
  const bez = d.sources.filter((s) => !istochnikSoSsylkoy(s)), dolgI = DOLG_DYR['istochnik-bez-ssylki']?.[d.muzei]?.[d.key] ?? 0;
  if (bez.length > dolgI)
    iss(ctx, ['sources'], `ЗАМОК источников (Р550): пунктов без ссылки ${bez.length}${dolgI ? `, в долге ${dolgI} — больше нельзя` : ''} — у источника нужен адрес (href или <a href> в html): ${bez.map((s) => (s.title ?? s.html).replace(/<[^>]+>/g, '').slice(0, 50)).join(' | ')}`);
  else if (bez.length < dolgI)
    console.log(`::warning::${d.muzei}/${d.key}: пунктов источников без ссылки ${bez.length} < ${dolgI} — снять/уменьшить строку долга (src/data/dyry-dolg.json)`);
}
// Пункт источника со ссылкой: href или в разметке html есть <a href="http(s)://…">.
export const istochnikSoSsylkoy = (s) => Boolean(s.href) || /href\s*=\s*["']?https?:\/\//i.test(s.html ?? '');
const DOLG_DYR = JSON.parse(fs.readFileSync('src/data/dyry-dolg.json', 'utf8'));

// Все карточки: [{ muzei, key, ... }]. Схема — по папке музея (skhemy[<музей>]); нет схемы у музея — ошибка.
// Имя файла и папки должны совпадать с key и muzei карточки. Дни с 02-01 — ещё и стандарт дня (Р660, src/lib/standart-dnya.mjs).
// Ошибки собираются по всем карточкам и уходят одним списком: исполнитель видит все пробелы сразу, а не по одному.
export function zagruzitKartochki(DIR, skhemy) {
  if (!fs.existsSync(DIR)) return [];
  const oshibki = [];
  const vse = fs.readdirSync(DIR).sort().flatMap((muzei) => {
    const files = fs.readdirSync(path.join(DIR, muzei)).filter((f) => f.endsWith('.yaml')).sort();
    if (files.length && !skhemy[muzei]) throw new Error(`${DIR}/${muzei}: у музея нет схемы карточки дня`);
    return files.flatMap((f) => {
      const file = path.join(DIR, muzei, f);
      const syroe = YAML.parse(fs.readFileSync(file, 'utf8'));
      const r = skhemy[muzei].safeParse(syroe);
      if (!r.success) { oshibki.push(`${file}: карточка не прошла схему:\n${r.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`); return []; }
      if (r.data.muzei !== muzei || r.data.key !== f.slice(0, -5)) { oshibki.push(`${file}: muzei/key карточки не совпадают с путём`); return []; }
      oshibki.push(...standartDnya(r.data, syroe));
      return [r.data];
    });
  });
  oshibki.push(...nomeraDnej(vse));
  if (oshibki.length) throw new Error(`карточки дней (${DIR}) — ошибок ${oshibki.length}:\n${oshibki.join('\n')}`);
  return vse;
}
