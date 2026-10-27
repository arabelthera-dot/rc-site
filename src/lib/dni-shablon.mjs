// Пилот «страница дня = общий layout + карточка данных» (Р297): карточки src/content/dni-shablon/<музей>/ММ-ДД.yaml —
// только данные дня, вёрстка — src/layouts/DenIzobreteniya.astro, адрес /muzei/<музей>/den-shablon/ММ-ДД/
// (noindex, вне карты сайта); с `adres: den` — живой адрес den/ММ-ДД (Р286). Схема — здесь, а не в src/content.config.ts: файл схемы ядра под замком
// (.github/workflows/skhema-yadra.yml), пилот его не задевает. Карточка не проходит схему — сборка красная.
// Строки с inline-разметкой (<b>, <i>, <a>) допустимы и выводятся как есть. Игра — по имени: разметка
// src/data/igry/<музей>/<имя>.html, скрипт public/muzei/<музей>/igry/<имя>.js; нет файла — сборка красная.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'astro/zod';

export const DIR = 'src/content/dni-shablon';

const str = z.string().min(1);
// У факта дня на обычном адресе (adres: den) — ещё отрывок-цитата, место в источнике, адрес источника и пометка
// достоверности (замок ниже); у пробы den-shablon эти поля необязательны.
export const POMETKI = ['документ', 'два источника', 'легенда'];
const udar = z.object({ summary: str, find: z.boolean().optional(), tag: str.optional(), det: z.array(str).min(1), src: str,
  otryvok: str.optional(), stranica: str.optional(), href: z.string().url().optional(), pometka: z.enum(POMETKI).optional() });
// Норма фактов дня — museum-inventions п.6 (Р101): «4–5 фактов»; меньше — сборка красная (только adres: den).
export const NORMA_FAKTOV = 4;
// Блоки шаблона по порядку; к ним цепляются уникальные разделы дня (razdely.posle), 1:1 из старой страницы.
export const BLOKI = ['daynav', 'dokument', 'video', 'audioguide', 'story', 'fakty', 'igra', 'pervenstvo', 'quiz', 'result', 'figures', 'sources', 'calendar', 'kuda-dalshe'];
const kartinka = z.object({ src: str, alt: str, data_source: str, license: str, podpis: str, credit: str });

export const skhema = z.object({
  muzei: str,
  // `den` — карточка рисует живой адрес den/ММ-ДД (Р286, den/[key].astro), старый HTML уходит на den/ММ-ДД/staraya/;
  // нет поля — проба на den-shablon/ММ-ДД.
  adres: z.literal('den').optional(),
  key: z.string().regex(/^\d\d-\d\d$/, 'ключ дня — ММ-ДД'),
  // sobytie + god — заголовок вкладки и og:title собирает шаблон: «16 января 1969: <событие> — <музей> — Русская цивилизация»
  // (Р286 п.4; событие — title карточки дня src/content/days, год — со старой страницы); нет их — title/og.title как есть.
  head: z.object({ title: str, description: str, canonical: str, sobytie: str.optional(), god: z.string().regex(/^\d{3,4}$/).optional(),
    og: z.object({ type: str, site_name: str, title: str, description: str, url: str, image: str.optional() }),
    ld: z.record(z.string(), z.unknown()) }),
  // Свой CSS дня (01-17…: public/assets/<имя>.css вместо общего izobreteniya-den.css, как на старой странице); нет — общий.
  css: z.array(z.string().regex(/^[\w-]+$/)).min(1).optional(),
  // Разметка обложки старой страницы (01-17…): style у <figure>, id у сцены, без decoding, подпись без credit — необязательно.
  oblozhka: kartinka.extend({ width: z.number().int().positive(), height: z.number().int().positive(), hint: str,
    fit_full: z.boolean().default(false), celikom: z.boolean().default(false),
    credit: str.optional(), stil_figury: str.optional(), id_sceny: str.optional(), decoding: z.boolean().default(true) }).optional(),
  kroshka: str,
  lead: z.object({ data: str, privyazka: str, kto: str, h1: str, hook: str }),
  stamp: z.array(z.object({ v: str, k: str })),
  daynav: z.array(z.object({ id: str, label: str })),
  // Секции, которых у дня нет, — не пишутся: нет oblozhka/video/fakty — нет блока. Документ первенства — блок после
  // меню дня (verh), пустой блок после подвала (podval, как у части старых страниц) или нет (net).
  dokument: z.enum(['verh', 'podval', 'net']).default('verh'),
  video: z.object({ h2: str, klyuch: str, format: str, pole: str, suffix: str, badge: str, intro: str, poster: str, mp4: str, note: str }).optional(),
  story: z.object({ kicker: str, h2: str, intro: str.optional(), udary: z.array(udar).min(1) }),
  fakty: z.object({ kicker: str, h2: str, udary: z.array(udar).min(1) }).optional(),
  // Уникальные разделы дня (труба, разбор, мировой контекст…): готовая разметка 1:1 после блока posle (из BLOKI);
  // несколько с одним posle — подряд, в порядке карточки. Layout их не знает поимённо — новый день его не правит.
  // Блок шаблона со своей разметкой старой страницы (01-17…: без inline-стилей, классы своего CSS) — 1:1 вместо
  // вёрстки шаблона; тогда поля блока (pervenstvo, result; у quiz — всё, кроме ball/voprosy) не нужны.
  svoi: z.object({ pervenstvo: str.optional(), quiz: str.optional(), result: str.optional(), calendar: str.optional() }).strict().optional(),
  razdely: z.array(z.object({ posle: z.enum(BLOKI), html: str })).default([]),
  // dop — второй скрипт дня (развилка, чат…) public/muzei/<музей>/igry/<имя>-dop.js, после викторины.
  igra: z.object({ imya: z.string().regex(/^[a-z0-9-]+$/), dop: z.boolean().optional(), css: z.array(z.string().regex(/^[\w-]+$/)).default([]) }),
  pervenstvo: z.object({ kicker: str, h2: str, granica: str, net: str, kolonki: z.array(str), stroki: z.array(z.array(str)) }).optional(),
  quiz: z.object({ kicker: str.optional(), h2: str.optional(), intro: str.optional(), noscript: str.optional(), ball: z.number().int().positive().default(10),
    voprosy: z.array(z.object({ q: str, o: z.array(str).min(2), a: z.number().int().min(0), e: str })).min(1) }),
  result: z.object({ h2: str, intro: str, zvanie: str, note: str }).optional(),
  figures: z.array(kartinka).default([]),
  // Строка не по образцу «название: пояснение» — { html } (содержимое <li> как есть).
  sources: z.array(z.union([z.object({ href: z.string().url(), title: str, pometka: str.optional(), note: str }), z.object({ html: str }).strict()])).min(1),
  kuda: z.array(z.object({ lbl: str, href: str, title: str, hook: str, main: z.boolean() })),
  score: z.object({ awards: z.record(z.string(), z.union([z.number(), z.array(z.number())])), ranks: z.array(z.tuple([z.number(), str])) }),
  // Нет chrome — нет window.MUSEUM_CHROME (museum-chrome.js без настроек, как на части старых страниц).
  chrome: z.object({ share: z.object({ title: str, text: str }), prev: z.object({ href: str, title: str }).optional(),
    next: z.object({ href: str, title: str }).optional(), all: z.object({ href: str, label: str }), random: z.array(str) }).optional(),
  return: z.object({ q: str, a: str, src: str }),
  audioguide: z.object({ audioSrc: str, durationLabel: str, lead: str, stops: z.array(z.object({ t: z.number(), mark: str, title: str })),
    transcript: z.array(str), note: str }),
  proof: z.record(z.string(), z.unknown()),
}).superRefine((d, ctx) => {
  if (!fs.existsSync(`src/data/igry/${d.muzei}/${d.igra.imya}.html`) || !fs.existsSync(`public/muzei/${d.muzei}/igry/${d.igra.imya}.js`))
    ctx.addIssue({ code: 'custom', path: ['igra', 'imya'], message: `игры ${d.muzei}/${d.igra.imya} нет (html в src/data/igry, js в public/muzei/<музей>/igry)` });
  if (d.igra.dop && !fs.existsSync(`public/muzei/${d.muzei}/igry/${d.igra.imya}-dop.js`))
    ctx.addIssue({ code: 'custom', path: ['igra', 'dop'], message: `нет public/muzei/${d.muzei}/igry/${d.igra.imya}-dop.js` });
  (d.css ?? []).forEach((c, i) => { if (!fs.existsSync(`public/assets/${c}.css`)) ctx.addIssue({ code: 'custom', path: ['css', i], message: `нет public/assets/${c}.css` }); });
  d.igra.css.forEach((c, i) => { if (!fs.existsSync(`public/assets/${c}.css`)) ctx.addIssue({ code: 'custom', path: ['igra', 'css', i], message: `нет public/assets/${c}.css` }); });
  // ЗАМОК (Р286): на обычном адресе у дня не меньше NORMA_FAKTOV фактов, у каждого — отрывок, страница, ссылка, пометка.
  if (d.adres === 'den') {
    if (!d.head.sobytie || !d.head.god) ctx.addIssue({ code: 'custom', path: ['head'], message: 'на адресе den нужны head.sobytie и head.god (заголовок вкладки)' });
    const udary = d.fakty?.udary ?? [];
    if (udary.length < NORMA_FAKTOV)
      ctx.addIssue({ code: 'custom', path: ['fakty', 'udary'], message: `ЗАМОК: фактов ${udary.length}, нужно не меньше ${NORMA_FAKTOV} (museum-inventions п.6, Р101: «4–5 фактов»)` });
    udary.forEach((u, i) => { const net = ['otryvok', 'stranica', 'href', 'pometka'].filter((k) => !u[k]);
      if (net.length) ctx.addIssue({ code: 'custom', path: ['fakty', 'udary', i], message: `ЗАМОК: у факта «${u.summary.replace(/<[^>]+>/g, '').slice(0, 60)}» нет: ${net.join(', ')} (отрывок, страница, ссылка, пометка: ${POMETKI.join(' / ')})` }); });
  }
  // Без своей разметки (svoi) блок шаблона должен быть заполнен.
  if (!d.svoi?.pervenstvo && !d.pervenstvo) ctx.addIssue({ code: 'custom', path: ['pervenstvo'], message: 'нет pervenstvo (или svoi.pervenstvo)' });
  if (!d.svoi?.result && !d.result) ctx.addIssue({ code: 'custom', path: ['result'], message: 'нет result (или svoi.result)' });
  if (!d.svoi?.quiz) ['kicker', 'h2', 'intro', 'noscript'].filter((k) => !d.quiz[k]).forEach((k) => ctx.addIssue({ code: 'custom', path: ['quiz', k], message: 'нет поля (или svoi.quiz)' }));
  d.quiz.voprosy.forEach((v, i) => { if (v.a >= v.o.length) ctx.addIssue({ code: 'custom', path: ['quiz', 'voprosy', i, 'a'], message: 'номер ответа вне списка' }); });
});

// Все карточки: [{ muzei, key, ... }]. Имя файла и папки должны совпадать с key и muzei карточки.
export function kartochki() {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).sort().flatMap((muzei) => fs.readdirSync(path.join(DIR, muzei)).filter((f) => f.endsWith('.yaml')).sort().map((f) => {
    const file = path.join(DIR, muzei, f);
    const r = skhema.safeParse(YAML.parse(fs.readFileSync(file, 'utf8')));
    if (!r.success) throw new Error(`${file}: карточка не прошла схему:\n${r.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`);
    if (r.data.muzei !== muzei || r.data.key !== f.slice(0, -5)) throw new Error(`${file}: muzei/key карточки не совпадают с путём`);
    return r.data;
  }));
}
