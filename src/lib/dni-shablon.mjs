// Пилот «страница дня = общий layout + карточка данных» (Р297): карточки src/content/dni-shablon/<музей>/ММ-ДД.yaml —
// только данные дня, вёрстка — src/layouts/DenIzobreteniya.astro, адрес /muzei/<музей>/den-shablon/ММ-ДД/
// (noindex, вне карты сайта). Схема — здесь, а не в src/content.config.ts: файл схемы ядра под замком
// (.github/workflows/skhema-yadra.yml), пилот его не задевает. Карточка не проходит схему — сборка красная.
// Строки с inline-разметкой (<b>, <i>, <a>) допустимы и выводятся как есть. Игра — по имени: разметка
// src/data/igry/<музей>/<имя>.html, скрипт public/muzei/<музей>/igry/<имя>.js; нет файла — сборка красная.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'astro/zod';

export const DIR = 'src/content/dni-shablon';

const str = z.string().min(1);
const udar = z.object({ summary: str, find: z.boolean().optional(), tag: str.optional(), det: z.array(str).min(1), src: str });
const kartinka = z.object({ src: str, alt: str, data_source: str, license: str, podpis: str, credit: str });

export const skhema = z.object({
  muzei: str,
  key: z.string().regex(/^\d\d-\d\d$/, 'ключ дня — ММ-ДД'),
  head: z.object({ title: str, description: str, canonical: str,
    og: z.object({ type: str, site_name: str, title: str, description: str, url: str }),
    ld: z.record(z.string(), z.unknown()) }),
  oblozhka: kartinka.extend({ width: z.number().int().positive(), height: z.number().int().positive(), hint: str,
    fit_full: z.boolean().default(false), celikom: z.boolean().default(false) }),
  kroshka: str,
  lead: z.object({ data: str, privyazka: str, kto: str, h1: str, hook: str }),
  stamp: z.array(z.object({ v: str, k: str })),
  daynav: z.array(z.object({ id: str, label: str })),
  video: z.object({ h2: str, klyuch: str, format: str, pole: str, suffix: str, badge: str, intro: str, poster: str, mp4: str, note: str }),
  story: z.object({ kicker: str, h2: str, intro: str, udary: z.array(udar).min(1) }),
  fakty: z.object({ kicker: str, h2: str, udary: z.array(udar).min(1) }),
  igra: z.object({ imya: z.string().regex(/^[a-z0-9-]+$/), css: z.array(z.string().regex(/^[\w-]+$/)).default([]) }),
  pervenstvo: z.object({ kicker: str, h2: str, granica: str, net: str, kolonki: z.array(str), stroki: z.array(z.array(str)) }),
  quiz: z.object({ kicker: str, h2: str, intro: str, noscript: str,
    voprosy: z.array(z.object({ q: str, o: z.array(str).min(2), a: z.number().int().min(0), e: str })).min(1) }),
  result: z.object({ h2: str, intro: str, zvanie: str, note: str }),
  figures: z.array(kartinka).default([]),
  sources: z.array(z.object({ href: z.string().url(), title: str, pometka: str.optional(), note: str })).min(1),
  kuda: z.array(z.object({ lbl: str, href: str, title: str, hook: str, main: z.boolean() })),
  score: z.object({ awards: z.record(z.string(), z.union([z.number(), z.array(z.number())])), ranks: z.array(z.tuple([z.number(), str])) }),
  chrome: z.object({ share: z.object({ title: str, text: str }), prev: z.object({ href: str, title: str }).optional(),
    next: z.object({ href: str, title: str }).optional(), all: z.object({ href: str, label: str }), random: z.array(str) }),
  return: z.object({ q: str, a: str, src: str }),
  audioguide: z.object({ audioSrc: str, durationLabel: str, lead: str, stops: z.array(z.object({ t: z.number(), mark: str, title: str })),
    transcript: z.array(str), note: str }),
  proof: z.record(z.string(), z.unknown()),
}).superRefine((d, ctx) => {
  if (!fs.existsSync(`src/data/igry/${d.muzei}/${d.igra.imya}.html`) || !fs.existsSync(`public/muzei/${d.muzei}/igry/${d.igra.imya}.js`))
    ctx.addIssue({ code: 'custom', path: ['igra', 'imya'], message: `игры ${d.muzei}/${d.igra.imya} нет (html в src/data/igry, js в public/muzei/<музей>/igry)` });
  d.igra.css.forEach((c, i) => { if (!fs.existsSync(`public/assets/${c}.css`)) ctx.addIssue({ code: 'custom', path: ['igra', 'css', i], message: `нет public/assets/${c}.css` }); });
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
