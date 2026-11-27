// Схема карточки дня Музея искусств (Р863): src/content/dni-shablon/iskusstvo/ММ-ДД.yaml →
// src/layouts/DenIskusstvo.astro. Общие поля и замки — src/lib/den-obshchee.mjs. Игра — «найди деталь» (2D, по имени):
// разметка src/data/igry/iskusstvo/<imya>.html (самодостаточный <section id="games">), скрипт public/muzei/iskusstvo/igry/<imya>.js;
// нет файла — сборка красная; нет igra/imya — нет блока (игры «найди деталь» ещё нет, imya необязателен). 3D и «первенства» нет
// (это галерея, не музей первенства): поля model3d/rc3d/pervenstvo в карточку не пишутся (strict). Разбор/сравнение/чат — razdely.
import fs from 'node:fs';
import { z } from 'astro/zod';
import { str, obshchiePolya, zamokObshchiy } from './den-obshchee.mjs';

export const BLOKI_ISKUSSTVO = ['daynav', 'video', 'audioguide', 'story', 'fakty', 'igra', 'kadry', 'quiz', 'result', 'sources', 'calendar', 'kuda-dalshe'];

export const skhemaIskusstvo = z.object({
  ...obshchiePolya(BLOKI_ISKUSSTVO),
  igra: z.object({ imya: z.string().regex(/^[a-z0-9-]+$/).optional(), kicker: str.optional(), h2: str.optional(), lead: str.optional() }).optional(),
  zum: z.object({ src: z.string(), width: z.number(), height: z.number(), kicker: str.optional(), h2: str.optional(), intro: str.optional(), sparks: z.array(z.object({ x: z.number(), y: z.number(), t: z.string(), d: z.string() })).optional() }).optional(),
}).strict().superRefine((d, ctx) => {
  zamokObshchiy(d, ctx, {});
  if (d.igra?.imya) {
    const html = `src/data/igry/${d.muzei}/${d.igra.imya}.html`, js = `public/muzei/${d.muzei}/igry/${d.igra.imya}.js`;
    for (const f of [html, js]) if (!fs.existsSync(f)) ctx.addIssue({ code: 'custom', path: ['igra', 'imya'], message: `игры ${d.muzei}/${d.igra.imya} нет: ${f}` });
  }
});
