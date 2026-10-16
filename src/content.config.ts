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
// Утверждённый хук, который правилу не отвечает, не правится машиной — ждёт ответа Сергея
// в src/data/passport-waivers.json («музей/ключ»: «вопрос и дата»); ответ получен — строку удалить.
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

const days = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/days' }),
  schema: z.object({
    museum: z.string(),
    key: z.string().regex(/^\d\d-\d\d$/, 'ключ дня — ММ-ДД'),
    title: z.string().min(1),
    year: z.union([z.string(), z.number()]).optional(),
    hook: z.string().min(1).max(200, 'хук длиннее 200 знаков'),
    mechanic: z.string().optional(),
    source: z.string().optional(),
    gist: z.string().optional(),
    legacy_page: z.string().optional(),
    images: z.array(image).default([]),
  }).superRefine((d, ctx) => {
    const waived = `${d.museum}/${d.key}` in waivers;
    const hook = outsideQuotes(d.hook);
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
    if (d.legacy_page && !d.source)
      ctx.addIssue({ code: 'custom', path: ['source'], message: 'у дня со страницей нет источника' });
  }),
});

export const collections = { museums, days };
