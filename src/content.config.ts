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

// День музея — одна карточка. Машинные правила страницы (паспорт дня) ужесточаются на шаге 2 плана.
const days = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/days' }),
  schema: z.object({
    museum: z.string(),
    key: z.string().regex(/^\d\d-\d\d$/, 'ключ дня — ММ-ДД'),
    title: z.string().min(1),
    year: z.union([z.string(), z.number()]).optional(),
    hook: z.string().min(1),
    mechanic: z.string().optional(),
    source: z.string().optional(),
    legacy_page: z.string().optional(),
  }),
});

export const collections = { museums, days };
