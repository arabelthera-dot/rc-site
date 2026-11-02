// Схема карточки дня музея «Русские не сдаются» (r602): src/content/dni-shablon/ne-sdayutsya/ММ-ДД.yaml →
// src/layouts/DenNeSdayutsya.astro. Общие поля и замки — src/lib/den-obshchee.mjs. Вместо игры — визуализация (Р436/Р437):
// полей igra и pervenstvo нет (strict), музей не про первенство. vizual — по имени: разметка src/data/vizual/ne-sdayutsya/<imya>.html,
// скрипт public/muzei/ne-sdayutsya/vizual/<imya>.js; нет файла — сборка красная; нет vizual — нет блока (заглушек нет).
import fs from 'node:fs';
import { z } from 'astro/zod';
import { str, obshchiePolya, zamokObshchiy } from './den-obshchee.mjs';

export const BLOKI_NS = ['daynav', 'video', 'audioguide', 'story', 'fakty', 'vizual', 'kadry', 'quiz', 'result', 'sources', 'calendar', 'kuda-dalshe'];
const IGRA = /(?<![а-яё])игр[аеуоыиам]/i;
const PERVYY_V_MIRE = /(?<![а-яё])перв[а-яё]*(?:\s|&nbsp;|&#160;)+в(?:\s|&nbsp;|&#160;)+мире/i;

export const skhemaNeSdayutsya = z.object({
  ...obshchiePolya(BLOKI_NS),
  vizual: z.object({ imya: z.string().regex(/^[a-z0-9-]+$/), vid: z.enum(['predmet', 'karta', 'dokument']), kicker: str, h2: str, lead: str }).optional(),
}).strict().superRefine((d, ctx) => {
  zamokObshchiy(d, ctx, {});
  if (d.vizual) {
    const html = `src/data/vizual/ne-sdayutsya/${d.vizual.imya}.html`, js = `public/muzei/ne-sdayutsya/vizual/${d.vizual.imya}.js`;
    for (const f of [html, js]) if (!fs.existsSync(f)) ctx.addIssue({ code: 'custom', path: ['vizual', 'imya'], message: `визуализации ${d.vizual.imya} нет: ${f}` });
  }
  // ЗАМОК (Р166/Р176): на живой адрес идут только утверждённые Сергеем факты.
  if (d.adres === 'den') [d.fakty ?? []].flat().flatMap((b) => b.udary).forEach((u, i) => {
    if (!u.utverzhden) ctx.addIssue({ code: 'custom', path: ['fakty', 'udary', i, 'utverzhden'], message: `ЗАМОК (Р166/Р176): факт «${u.summary.replace(/<[^>]+>/g, '').slice(0, 60)}» не утверждён Сергеем (utverzhden) — неутверждённые факты на живой адрес не идут` });
  });
  // ЗАМОК (Р436): вместо игры — визуализация; слова «игра» в карточке нет.
  const igra = JSON.stringify(d).match(IGRA);
  if (igra) ctx.addIssue({ code: 'custom', path: [], message: `ЗАМОК (Р436): в карточке «не сдаются» слово «${igra[0]}…» — игры в музее нет (вместо игры визуализация)` });
  // ЗАМОК: музей не про первенство — «первый в мире» в заголовке и хуке нет.
  for (const k of ['h1', 'hook']) {
    const m = String(d.lead[k]).match(PERVYY_V_MIRE);
    if (m) ctx.addIssue({ code: 'custom', path: ['lead', k], message: `ЗАМОК: «${m[0]}» в lead.${k} — музей «Русские не сдаются» не про первенство` });
  }
});
