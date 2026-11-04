// Схема копии утверждённой карточки src/data/utverzhdeno/<музей>/ММ-ДД.json (аудит 04.11, п. 5; Р532 «да» Сергея).
// Правило «кадр без факта» (Р514) — в схеме коллекции utverzhdeno (src/content.config.ts), а не сторожем после
// сборки: у каждого кадра привязка «к факту: N | обложка | галерея» или «нет (пояснение)»; прочерк, пусто, голое
// «нет» и непонятное («общий») — ошибка; номер факта — только из фактов этой карточки. Брак виден при astro sync.
// «Факт без кадра» правилом карточки не бывает: кадров у дня меньше, чем фактов (5 из 15), — так задумано.
// Раньше то же проверял scripts/sverka-utverzhdeno.mjs (oshibkiPrivyazki), там убрано. Пробы — tests/skhema/*.test.mjs.
import { z } from 'astro/zod';

const imyaFajla = (s) => String(s || '').split(/[?#]/)[0].split('/').pop();

export function oshibkiPrivyazki(utv) {
  const o = []; const est = new Set(utv.fakty.map((f) => f.n));
  utv.kadry.forEach((x, i) => {
    const kto = `кадр ${x.n} (${x.gk ? `Госкаталог ${x.gk}` : imyaFajla(x.fajl)})`;
    const p = (x.privyazka ?? '').trim();
    if (!x.mesto) o.push([i, /^(?:[—–-]*|нет\.?)$/i.test(p) ? `${kto} — нет привязки к факту («к факту: ${p || 'пусто'}»)`
      : `${kto} — непонятная привязка «${p}»: нужно «к факту: N», «обложка» или «галерея»`]);
    else if (x.mesto === 'fakt') {
      const vne = [x.fakt, ...x.takzhe].filter((n) => !est.has(n));
      if (vne.length) o.push([i, `${kto} — номер факта вне карточки: ${vne.join(', ')} (в карточке ${[...est].sort((a, b) => a - b).join(', ')})`]);
    }
  });
  return o;
}

const fakt = z.object({ n: z.number().int().positive(), zagolovok: z.string().min(1) }).passthrough();
const kadr = z.object({
  n: z.number().int(),
  fajl: z.string().nullish(),
  gk: z.string().nullish(),
  fakt: z.number().int().nullable(),
  takzhe: z.array(z.number().int()).default([]),
  mesto: z.enum(['fakt', 'oblozhka', 'galereya', 'net']).nullable(),
  privyazka: z.string().nullable(),
}).passthrough();

export const kartochkaUtv = z.object({
  key: z.string().regex(/^\d\d-\d\d$/, 'ключ карточки — ММ-ДД'),
  zagolovok: z.string().min(1),
  poryadok: z.array(z.number().int()),
  fakty: z.array(fakt).min(1, 'в карточке нет фактов'),
  kadry: z.array(kadr),
}).passthrough().superRefine((d, ctx) => {
  for (const [i, message] of oshibkiPrivyazki(d)) ctx.addIssue({ code: 'custom', path: ['kadry', i, 'privyazka'], message });
});
