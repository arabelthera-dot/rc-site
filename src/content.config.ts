// Схема ядра заморожена 19.10.2026 — менять только по слову Сергея (метка skhema:da-sergeya).
// Файлы схемы записи дня (src/content/days/<музей>/ММ-ДД.json — поля, правила хука, картинки):
//   src/content.config.ts
// Замок — .github/workflows/skhema-yadra.yml (список SKHEMA там же). Идея «улучшить ядро» — в open-questions, не сюда.
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { existsSync } from 'node:fs';
import { kartochkaUtv } from './lib/skhema-utverzhdeno.mjs';
import { igraDannymi } from './lib/igry-mehaniki';

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
import slovar from './data/slovar.json'; // slovar — словарь связей дня (Р37, Сергей 20.10)
import { BAZY, VIDY, wiki, nomer, polyaKartinki, polyaDnya as polyaDnyaFormy, status, poluhuk, vizualDannymi } from './lib/forma-dnya.mjs';

const outsideQuotes = (t: string) => t.replace(/«[^«»]*»/g, '«»');
// Инициалы («А. К. Толстой») — не конец предложения: точка после одиночной заглавной буквы не считается.
const secondSentence = /(?<!(?:^|[^А-Яа-яЁёA-Za-z])[А-ЯЁA-Z])[.!?…]\s+[А-ЯЁA-Z]/;

// Р635 (Сергей 08.11: Р631 — очередь 0, Р635 — пп. 86, 115, 187): форма карточки дня — добавкой, поля плоские.
// Поля нет — день как раньше; что поле значит и идёт ли оно на страницу — src/data/forma-dnya.json.
// status: 'zagotovka' — обязательны название и хук; 'gotov' — обязательна вся форма (formaDnya ниже).
// Типы полей формы — общие с карточкой страницы dni-shablon: src/lib/forma-dnya.mjs (Р660).
export { BAZY, VIDY };
// Факт — запись с постоянным id (не порядковым) и источником; уровней подтверждения нет (Р504, Р621).
const fakt = z.object({
  id: nomer,
  tekst: z.string().min(1, 'у факта нет текста'),
  istochnik: nomer,
  dlya_voprosa: z.boolean().optional(),
  otvet: z.string().min(1).optional(),
  otvet_edinstvennyj: z.literal(true).optional(),
  // Р676: poluhuk — заголовок-крючок факта; eshche — факт блока «Ещё 5» (нет — один из 10 основных).
  poluhuk: poluhuk.optional(),
  eshche: z.literal(true).optional(),
}).refine((f) => !f.dlya_voprosa || (f.otvet && f.otvet_edinstvennyj), { message: 'факт для вопроса — с ответом, и ответ единственный (otvet, otvet_edinstvennyj)' });

const image = z.object({
  src: z.string().min(1),
  caption: z.string().min(1, 'у картинки нет подписи'),
  credit: z.string().min(1, 'у картинки нет источника'),
  generated: z.boolean().default(false),
  text_on_image: z.literal(false, { message: 'текст на картинке запрещён' }).default(false),
  // Р635 — поля формы картинки (смысл, страница или служебное — src/data/forma-dnya.json); нет поля — как раньше.
  ...polyaKartinki,
});

// Доп. карточки дня (Сергей 17.10, museum-core §5-кватер п.5): внутри каждого дня 3–5 других открытий, дел,
// фактов ТОГО ЖЕ героя или темы дня — карточкой §5-тер «картинка → 1–3 строки → Узнать подробнее».
// Не другие события той же даты: день нефтепровода Шухова → крекинг, башня, перекрытия Шухова.
// Заголовок блока (more_title) называет героя — «Что ещё изобрёл Шухов»; «Ещё в этот день» — брак.
// Карточки против портянки, не вместо дня: день из одной короткой карточки — брак.
// Поля нет — блока нет (перенос старых дней идёт как есть, 16.10); есть — от 3 до 5, у каждой картинка и источник.
// Тема карточек может идти сквозь века (медведь в карикатуре: XVI → XVII → XVIII → XX век, Сергей 17.10):
// посетитель видит масштаб темы. Раскрытие — картинки с пояснением (detail) и/или ссылка на день
// этого же музея, где тема разобрана подробно (day, ММ-ДД); дня нет в календаре — сборка красная.
const more = z.object({
  title: z.string().min(1, 'у доп. события нет названия'),
  year: z.union([z.string(), z.number()]).optional(),
  short: z.string().min(1).max(240, 'коротко — 1–3 строки, до 240 знаков'),
  images: z.array(image).min(1, 'у доп. события нет картинки (§5-тер: основа карточки — изображение)'),
  detail: z.array(z.string().min(1)).default([]),
  detail_images: z.array(image).default([]),
  day: z.string().regex(/^\d\d-\d\d$/, 'day — ключ дня этого музея, ММ-ДД').optional(),
  source: z.string().min(1, 'у доп. события нет источника'),
}).refine((e) => e.detail.length > 0 || e.day, { message: 'у доп. события нет раскрытия «Узнать подробнее» (detail или day)' });

// Анкета большой страницы дня (ADR docs/adr/0001-anketa-dnya.md, вариант А Сергея 18.10.2026): содержимое — поля,
// вёрстка — один шаблон src/components/den/DenAnketa.astro. Есть body — страницу собирает шаблон, нет — старый HTML
// src/data/full-pages. Типы блоков выведены по частоте во всех больших страницах (scripts/full-page-to-anketa.mjs --stats).
// Интерактив — имя движка из public/assets/*.js и его настройки JSON полями; движка нет в public/assets — сборка красная.
export const BLOCK_TYPES = ['shapka', 'kroshki', 'oblozhka', 'navigaciya', 'dokument', 'video', 'audiogid', 'istoriya',
  'istochniki', 'citata', 'more', 'podderzhat', 'interaktiv', 'kalendar', 'kuda-dalshe', 'podval', 'dvizhok', 'nastroyki',
  'kod', 'stil', 'sluzhebnoe', 'razdel'] as const;
const blok = z.object({
  type: z.enum(BLOCK_TYPES),
  id: z.string().optional(),
  nav: z.string().optional(),
  html: z.string().optional(),
  lead: z.string().optional(),
  engine: z.string().regex(/^[\w-]+$/).optional(),
  src: z.string().optional(),
  attrs: z.string().optional(),
  config: z.unknown().optional(),
  raw: z.string().optional(),
}).superRefine((b, ctx) => {
  if (b.type === 'dvizhok' && (!b.engine || !b.src))
    ctx.addIssue({ code: 'custom', path: ['engine'], message: 'у движка нет имени или адреса' });
  if (b.engine && !existsSync(`public/assets/${b.engine}.js`))
    ctx.addIssue({ code: 'custom', path: ['engine'], message: `движка public/assets/${b.engine}.js нет` });
  if (b.type === 'nastroyki' && b.config === undefined && b.html === undefined)
    ctx.addIssue({ code: 'custom', path: ['config'], message: 'у настроек движка нет JSON' });
  if (!['dvizhok', 'nastroyki'].includes(b.type) && b.html === undefined)
    ctx.addIssue({ code: 'custom', path: ['html'], message: `у блока ${b.type} нет содержимого` });
});
const doc = z.object({ prolog: z.string(), head_attrs: z.string(), head: z.string(), between: z.string(),
  body_attrs: z.string(), epilog: z.string() });

// Игра дня данными (Р635, 08.11.2026): механика из src/lib/igry-mehaniki.ts + её данные; нет поля — дня не касается.
const igra = igraDannymi;

const days = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/days' }),
  schema: z.object({
    museum: z.string(),
    key: z.string().regex(/^\d\d-\d\d$/, 'ключ дня — ММ-ДД')
      // Ключ — существующий день года (365, без 29.02): 12-32…12-37 пришли из старого календаря первопроходцев (19.10).
      .refine((k) => { const [m, d] = k.split('-').map(Number); return m >= 1 && m <= 12 && d >= 1 && d <= [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; }, 'ключ дня — несуществующая дата'),
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
    more_title: z.string().optional(),
    igra: igra.optional(),
    doc: doc.optional(),
    body: z.array(blok).min(1).optional(),
    // slovar — связи дня со словарём src/data/slovar.json (Р37, Сергей 20.10: одно поле-ссылка, снимает заморозку только для него):
    // slovar — «tip:id», tip — lyudi | mesto | narod | tema; id нет в словаре — сборка красная (страницы /slovar/)
    // Р635 — форма карточки дня (src/data/forma-dnya.json); поля без значения по умолчанию — старые дни не меняются.
    status: status.optional(),
    ...polyaDnyaFormy(slovar),
    // Р676: визуализация «Русских не сдаются» вместо игры — tip (dokument | karta | predmet) и данные.
    vizual: vizualDannymi.optional(),
    fakty: z.array(fakt).optional(),
  }).superRefine((d, ctx) => {
    if (!!d.body !== !!d.doc)
      ctx.addIssue({ code: 'custom', path: ['body'], message: 'анкета страницы — body и doc вместе' });
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
      ctx.addIssue({ code: 'custom', path: ['more'], message: `доп. карточек героя дня — 3–5, а не ${d.more.length}` });
    if (d.more && !d.more_title)
      ctx.addIssue({ code: 'custom', path: ['more_title'], message: 'у доп. карточек нет заголовка с героем дня («Что ещё изобрёл Шухов»)' });
    if (d.more_title && /в этот день|этой даты/i.test(d.more_title))
      ctx.addIssue({ code: 'custom', path: ['more_title'], message: 'доп. карточки — про героя дня, не про дату (Сергей 17.10)' });
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
    formaDnya(d, ctx);
  // Дня без названия в старом календаре (Календарь побед, 5 дней) — на месте названия его хук: другого текста нет.
  }).transform((d) => ({ ...d, title: d.title || d.hook || '' })),
});

// Р635: проверки формы. Ссылки и Википедия — у любого дня с полями формы; полнота — по status.
// Новые дни (есть status) — чистый текст без вёрстки и без «в этом году» (год показа — полем god_pokaza).
const vyorstka = /<\/?[a-z][^>]*>|\*\*|&[a-z]+;/i;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formaDnya(d: any, ctx: z.RefinementCtx) {
  const net = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
  const ist = new Set((d.istochniki ?? []).map((s: { id: string }) => s.id));
  if (ist.size !== (d.istochniki ?? []).length) net(['istochniki'], 'id источников повторяются');
  (d.istochniki ?? []).forEach((s: { ssylka?: string; nazvanie: string }, i: number) => {
    if (wiki.test(`${s.ssylka ?? ''} ${s.nazvanie}`)) net(['istochniki', i], 'Википедия, Викисклад, Викитека как источник запрещены (Р90)');
  });
  const fid = new Set((d.fakty ?? []).map((f: { id: string }) => f.id));
  if (fid.size !== (d.fakty ?? []).length) net(['fakty'], 'id фактов повторяются');
  (d.fakty ?? []).forEach((f: { istochnik: string }, i: number) => {
    if (!ist.has(f.istochnik)) net(['fakty', i, 'istochnik'], `источника «${f.istochnik}» нет в istochniki`);
  });
  (d.citaty ?? []).forEach((c: { istochnik?: string }, i: number) => {
    if (c.istochnik && !ist.has(c.istochnik)) net(['citaty', i, 'istochnik'], `источника «${c.istochnik}» нет в istochniki`);
  });
  if (d.data_sobytiya && !d.data_sobytiya.endsWith(`-${d.key}`) && !d.data_sobytiya.endsWith('-02-29') && !d.data_uslovnaya)
    net(['data_sobytiya'], `дата события не совпадает с днём ${d.key}: исходная 29.02 — можно, иначе объясни в data_uslovnaya`);
  if (d.data_sobytiya && d.god !== undefined && Number(d.data_sobytiya.split('-')[0]) !== d.god)
    net(['god'], 'год не совпадает с датой события');
  d.images.forEach((im: z.infer<typeof image>, i: number) => {
    if (im.prava && wiki.test(`${im.prava.otkuda} ${im.prava.ssylka ?? ''}`))
      net(['images', i, 'prava'], 'Википедия, Викисклад, Викитека как источник картинки запрещены (Р90)');
    if (im.prava && im.prava.sdelano_mashinoj !== im.generated)
      net(['images', i, 'prava', 'sdelano_mashinoj'], 'sdelano_mashinoj не совпадает с generated');
  });
  if (!d.status) return;
  // Р676: аудиогид и ролик — только после показа Сергею (museum-page-production, ход 2).
  for (const k of ['audio', 'video'])
    if (d[k] && !d.pokazan_sergeyu) net([k], `${k} есть, а pokazan_sergeyu нет — озвучка и ролик только после показа текста Сергею`);
  if (d.museum === 'ne-sdayutsya' && d.igra) net(['igra'], 'у «Русских не сдаются» игры нет — вместо неё vizual (Р436)');
  if (!d.title) net(['title'], 'у дня нет названия');
  if (!d.hook) net(['hook'], 'у дня нет хука');
  const teksty: [(string | number)[], string][] = [[['title'], d.title], [['hook'], d.hook ?? ''],
    ...(d.fakty ?? []).map((f: { tekst: string }, i: number) => [['fakty', i, 'tekst'], f.tekst]),
    ...(d.citaty ?? []).map((c: { tekst: string }, i: number) => [['citaty', i, 'tekst'], c.tekst]),
    ...(d.etiketka_oblozhki ?? []).map((t: string, i: number) => [['etiketka_oblozhki', i], t]),
    ...d.images.flatMap((im: z.infer<typeof image>, i: number) => [[['images', i, 'caption'], im.caption]])];
  for (const [path, t] of teksty) {
    if (vyorstka.test(t)) net(path, 'новый день — чистый текст, без вёрстки внутри поля');
    if (/в этом году/i.test(t)) net(path, '«в этом году» не пишется — год показа полем god_pokaza');
  }
  if (d.status !== 'gotov') return;
  for (const k of ['nomer_dnya', 'data_sobytiya', 'chto_sluchilos', 'god', 'god_pokaza', 'ves', 'tyazhelaya_tema', 'etiketka_oblozhki'])
    if (d[k] === undefined) net([k], `у готового дня нет поля ${k}`);
  if (!d.fakty?.length) net(['fakty'], 'у готового дня нет фактов');
  if (!d.istochniki?.length) net(['istochniki'], 'у готового дня нет источников');
  if (!d.images.length) net(['images'], 'у готового дня нет картинки');
  const voennyj = !!(d.voinskaya_chast || d.operaciya || d.front || d.tyazhelaya_tema?.includes('vojna'));
  d.images.forEach((im: z.infer<typeof image>, i: number) => {
    if (!im.vid) net(['images', i, 'vid'], 'у картинки готового дня нет vid');
    if (!im.prava) net(['images', i, 'prava'], 'у картинки готового дня нет паспорта прав');
    if (voennyj && im.simvolika_proverena !== true) net(['images', i, 'simvolika_proverena'], 'военный день — символика картинки проверена человеком');
  });
  // Р676 — состав готового дня: основных фактов 10 и «Ещё» 5, у каждого полухук; игра или визуализация по музею.
  const fakty = d.fakty ?? [], eshche = fakty.filter((f: { eshche?: true }) => f.eshche).length;
  if (fakty.length - eshche !== 10 || eshche !== 5)
    net(['fakty'], `у готового дня основных фактов ${fakty.length - eshche} и «Ещё» ${eshche} — нужно 10 и 5 (eshche: true у пяти)`);
  fakty.forEach((f: { poluhuk?: string }, i: number) => { if (!f.poluhuk) net(['fakty', i, 'poluhuk'], 'у факта готового дня нет полухука (poluhuk)'); });
  if (d.museum === 'izobreteniya' && !d.igra) net(['igra'], 'у готового дня изобретений нет игры данными (igra)');
  if (d.museum === 'ne-sdayutsya' && !d.vizual) net(['vizual'], 'у готового дня «Русских не сдаются» нет визуализации данными (vizual)');
}

// Копии утверждённых карточек (src/data/utverzhdeno/<музей>/ММ-ДД.json): «кадр без факта» — ошибка схемы (аудит 04.11, п. 5).
const utverzhdeno = defineCollection({
  loader: glob({ pattern: '*/[0-9][0-9]-[0-9][0-9].json', base: './src/data/utverzhdeno' }),
  schema: kartochkaUtv,
});

export const collections = { museums, days, utverzhdeno };
