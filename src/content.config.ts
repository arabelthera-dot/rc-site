import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Музеи — каталог platform/catalog/museums.json как есть; title_ru — единственное имя музея.
const museums = defineCollection({
  loader: file('src/data/museums.json', {
    parser: (text) => JSON.parse(text).museums.map((m: { slug: string }) => ({ id: m.slug, ...m })),
  }),
  schema: z.object({
    slug: z.string(),
    number: z.number(),
    title_ru: z.string().min(1),
    promise_ru: z.string().optional(),
    slogan_ru: z.string().optional(),
    status: z.string(),
    category_id: z.string().optional(),
  }),
});

// День музея — одна карточка, паспорт дня. Правила Сергея проверяются при сборке: нарушение = красная сборка.
// Хук (PREFERENCES «Хук — закон»): одно предложение (10.09), до 200 знаков (05.09), без вопроса в хвосте.
// Источник: русский (описан по-русски), без Википедии в тексте (12.08); обязателен, как только у дня есть страница.
// Картинки: у каждой подпись и источник; текста на картинке нет; сгенерированное помечено и в подписи
// не выдаётся за архивный кадр (CLAUDE.md, Genosai 30.08); реальное есть — генерацию не ставить.
// Утверждённый текст, который правилу не отвечает, не правится машиной: исключение — строкой в
// src/data/passport-waivers.json («музей» на весь музей или «музей/ключ»: «слово Сергея и дата»).
// 16.10 Сергей: «переноси как есть, дальше будем менять, улучшать» — переписанный день строку снимает.
import waivers from './data/passport-waivers.json';

const outsideQuotes = (t: string) => t.replace(/«[^«»]*»/g, '«»');
const secondSentence = /[.!?…]\s+[А-ЯЁA-Z]/;
const wiki = /wiki|википеди|викитек/i;

const image = z.object({
  src: z.string().min(1),
  caption: z.string().min(1, 'у картинки нет подписи'),
  credit: z.string().min(1, 'у картинки нет источника'),
  generated: z.boolean().default(false),
  text_on_image: z.literal(false, { message: 'текст на картинке запрещён' }).default(false),
});

// «Ещё в этот день» (Сергей 17.10, museum-core §5-кватер п.5): внутри каждого дня 3–5 дополнительных событий,
// открытий, необычных фактов этой даты — карточкой §5-тер «картинка → 1–3 строки → Узнать подробнее».
// Карточки против портянки, не вместо дня: день из одной короткой карточки — брак.
// Поля нет — блока нет (перенос старых дней идёт как есть, 16.10); есть — от 3 до 5, у каждой картинка и источник.
const more = z.object({
  title: z.string().min(1, 'у доп. события нет названия'),
  year: z.union([z.string(), z.number()]).optional(),
  short: z.string().min(1).max(240, 'коротко — 1–3 строки, до 240 знаков'),
  images: z.array(image).min(1, 'у доп. события нет картинки (§5-тер: основа карточки — изображение)'),
  detail: z.array(z.string().min(1)).min(1, 'у доп. события нет раскрытия «Узнать подробнее»'),
  detail_images: z.array(image).default([]),
  source: z.string().min(1, 'у доп. события нет источника'),
});

const days = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/days' }),
  schema: z.object({
    museum: z.string(),
    key: z.string().regex(/^\d\d-\d\d$/, 'ключ дня — ММ-ДД'),
    title: z.string(),
    year: z.union([z.string(), z.number()]).optional(),
    // Хука нет только там, где его не было в старом календаре (изобретения: 146 дней без подписи, 16.10).
    hook: z.string().min(1).optional(),
    mechanic: z.string().optional(),
    source: z.string().optional(),
    gist: z.string().optional(),
    legacy_page: z.string().optional(),
    images: z.array(image).default([]),
    // Ролик дня — ключ выпуска в public/video/registry.json (движок museum-video.js); озвучка — mp3 в public/
    // (движок museum-audioguide.js). Нет ключа в реестре или файла — сборка падает (src/components/DenMedia.astro).
    video: z.string().optional(),
    audio: z.object({ src: z.string().min(1), heading: z.string().optional(), lead: z.string().optional(),
      note: z.string().optional() }).optional(),
    more: z.array(more).optional(),
  }).superRefine((d, ctx) => {
    const waived = d.museum in waivers || `${d.museum}/${d.key}` in waivers;
    if (!waived && !d.title)
      ctx.addIssue({ code: 'custom', path: ['title'], message: 'у дня нет названия' });
    if (!waived && (d.hook ?? '').length > 200)
      ctx.addIssue({ code: 'custom', path: ['hook'], message: 'хук длиннее 200 знаков' });
    const hook = outsideQuotes(d.hook ?? '');
    if (!waived && secondSentence.test(hook))
      ctx.addIssue({ code: 'custom', path: ['hook'], message: 'хук — одно предложение' });
    if (!waived && /\?\s*$/.test(hook))
      ctx.addIssue({ code: 'custom', path: ['hook'], message: 'хук без вопроса в хвосте' });
    if (d.source && wiki.test(d.source))
      ctx.addIssue({ code: 'custom', path: ['source'], message: 'Википедия как источник текста запрещена' });
    if (d.source && !/[А-Яа-яЁё]/.test(d.source))
      ctx.addIssue({ code: 'custom', path: ['source'], message: 'источник описывается по-русски' });
    d.images.forEach((im, i) => {
      if (im.credit && wiki.test(im.credit) && !/commons/i.test(im.credit))
        ctx.addIssue({ code: 'custom', path: ['images', i, 'credit'], message: 'Википедия как источник картинки — только Викисклад с автором' });
      if (im.generated && !/сгенерир|реконструкц/i.test(im.caption))
        ctx.addIssue({ code: 'custom', path: ['images', i, 'caption'], message: 'сгенерированная картинка без пометки в подписи' });
    });
    if (d.more && (d.more.length < 3 || d.more.length > 5))
      ctx.addIssue({ code: 'custom', path: ['more'], message: `«Ещё в этот день» — 3–5 карточек, а не ${d.more.length}` });
    d.more?.forEach((e, i) => {
      if (wiki.test(e.source))
        ctx.addIssue({ code: 'custom', path: ['more', i, 'source'], message: 'Википедия как источник текста запрещена' });
      if (!/[А-Яа-яЁё]/.test(e.source))
        ctx.addIssue({ code: 'custom', path: ['more', i, 'source'], message: 'источник описывается по-русски' });
      [...e.images, ...e.detail_images].forEach((im, j) => {
        if (im.credit && wiki.test(im.credit) && !/commons/i.test(im.credit))
          ctx.addIssue({ code: 'custom', path: ['more', i, 'images', j, 'credit'], message: 'Википедия как источник картинки — только Викисклад с автором' });
        if (im.generated && !/сгенерир|реконструкц/i.test(im.caption))
          ctx.addIssue({ code: 'custom', path: ['more', i, 'images', j, 'caption'], message: 'сгенерированная картинка без пометки в подписи' });
      });
    });
    if (d.legacy_page && !d.hook)
      ctx.addIssue({ code: 'custom', path: ['hook'], message: 'у дня со страницей нет хука' });
    if (!waived && d.legacy_page && !d.source)
      ctx.addIssue({ code: 'custom', path: ['source'], message: 'у дня со страницей нет источника' });
  // Дня без названия в старом календаре (Календарь побед, 5 дней) — на месте названия его хук: другого текста нет.
  }).transform((d) => ({ ...d, title: d.title || d.hook || '' })),
});

export const collections = { museums, days };
