// Механики игр дня — открытый список (Р632/Р635/Р636, 08.11.2026; пункты 76, 88, 89, 164).
// Игра дня = поле igra карточки: mehanika — имя из этого списка, dannye — тексты, ответы и числа по схеме этой механики;
// общую рамку (заголовок, правило, «Ещё раз», итог) собирает src/lib/igra-ramka.mjs, внутрь встаёт движок механики
// public/assets/igry/<mehanika>.js. Виды игр не сокращаются: у каждой игры своя механика и свой движок, общая только рамка.
// Январь «Изобретений» — 31 механика по игре на день (опись — docs/igry-obrazcy/opis-yanvar.md); сами январские игры
// остаются ручными html (src/data/igry/izobreteniya) и не переделываются. dvizhok: true — движок данными уже есть,
// и механику можно ставить в карточку; без него — сборка красная. Новая игра февраля = новая строка здесь + движок
// + схема dannye + строка в docs/interactive/REGISTRY.md (russian-civilization).
import { z } from 'astro/zod';

const str = z.string().min(1);

export type Mehanika = { den?: string; igra?: string; slovami: string; dvizhok?: boolean; dannye?: z.ZodTypeAny };

// Схемы dannye — по одной на механику (п. 88).
// 01-08 «Пробей лёд как „Ермак“»: льдины разной прочности, по каждой бьёшь, пока не станет водой.
const razbeyLdiny = z.object({
  chislo: z.number().int().min(2).max(30),
  kolonok: z.number().int().min(2).max(8).default(5),
  vidy: z.array(z.object({ udarov: z.number().int().min(1).max(9), podpis: str, cvet: str })).min(1),
  slomano_ru: str.default('Сломано'), udary_ru: str.default('Удары'),
  pobeda_ru: str, ochki: z.number().int().min(0).default(15),
}).strict();

// 01-10 «Нос „Пайлота“»: три условия, каждое неверное — своя причина неудачи и свой кадр; все верные — проход.
const triUsloviyaLdoloma = z.object({
  usloviya: z.array(z.object({
    kod: z.string().regex(/^[a-z]+$/), nazvanie: str,
    varianty: z.array(z.object({ kod: z.string().regex(/^[a-z]+$/), tekst: str })).length(2),
    start: z.string(), verno: z.string(),
    neudacha: z.object({ kadr_ru: str, soobshchenie_ru: str, ochki: z.number().int().min(0).default(5) }),
  }).strict()).length(3),
  pusk_ru: str, start_ru: str, zanovo_ru: str,
  naydeno_ru: str.regex(/\{n\}/, 'naydeno_ru — с {n}'), kadr_start_ru: str,
  pobeda: z.object({ kadr_ru: str, soobshchenie_ru: str, ochki: z.number().int().min(0).default(35) }),
  holst_alt: str, podpis_holsta_ru: str, bez_skripta_ru: str,
}).strict().superRefine((d, ctx) => d.usloviya.forEach((u, i) => ['start', 'verno'].forEach((k) => {
  if (!u.varianty.some((v) => v.kod === u[k as 'start' | 'verno'])) ctx.addIssue({ code: 'custom', path: ['usloviya', i, k], message: `${k}: «${u[k as 'start' | 'verno']}» нет среди variantov` });
})));

// 01-02 «Запусти „Луну-1“ к Луне»: ползунком угол запуска, полёт под притяжением к точке tyaga; в коридоре у цели — победа,
// ближе udar — столкновение, дальше koridor — промах. Координаты x, y — доли поля, радиусы и расстояния — единицы поля.
// Подписи start и cel идут вёрсткой под шарами, на холсте текста нет (Р18). В текстах исходов {km} — расстояние до цели.
const dolya = z.number().min(0).max(1);
const telo = z.object({ x: dolya, y: dolya, r: z.number().positive(), podpis: str, cvet: z.tuple([str, str]) }).strict();
const ugolVKoridorLuny = z.object({
  pole: z.object({ shirina: z.number().int().min(200), vysota: z.number().int().min(100) }).strict().default({ shirina: 680, vysota: 340 }),
  start: telo, cel: telo,
  tyaga: z.object({ x: dolya, y: dolya, sila: z.number().positive() }).strict(),
  skorost: z.number().positive(),
  ugol: z.object({ min: z.number().int(), max: z.number().int(), start: z.number().int(), podpis_ru: str }).strict(),
  koridor: z.number().positive(), udar: z.number().positive(),
  km_na_edinicu: z.number().positive(), prevyu_dlina: z.number().positive().default(180),
  teksty: z.object({ popal_ru: str, udar_ru: str, mimo_ru: str }).strict(),
  pusk_ru: str, start_ru: str, zanovo_ru: str, holst_alt: str, bez_skripta_ru: str,
  ochki: z.number().int().min(0).default(12),
}).strict().superRefine((d, ctx) => {
  if (!(d.ugol.min <= d.ugol.start && d.ugol.start <= d.ugol.max)) ctx.addIssue({ code: 'custom', path: ['ugol', 'start'], message: 'ugol.start — между min и max' });
  if (!(d.udar < d.koridor)) ctx.addIssue({ code: 'custom', path: ['udar'], message: 'udar меньше koridor' });
});
// «Три условия булата» (первый день — 01-03 «Тигель Аносова»): три условия по два варианта, первое неверное —
// своя неудача и свой вид поверхности (ton — серый тон, uzor — сила узора 0–1), все верные — узор; blizhe — по желанию «под микроскопом».
const vidPoverhnosti = z.object({ ton: z.number().int().min(0).max(255).default(112), uzor: z.number().min(0).max(1) }).strict();
const triUsloviyaBulata = z.object({
  usloviya: z.array(z.object({
    kod: z.string().regex(/^[a-z]+$/), nazvanie: str,
    varianty: z.array(z.object({ kod: z.string().regex(/^[a-z]+$/), tekst: str })).length(2),
    start: z.string(), verno: z.string(),
    neudacha: z.object({ kadr_ru: str, soobshchenie_ru: str, vid: vidPoverhnosti, ochki: z.number().int().min(0).default(5) }).strict(),
  }).strict()).length(3),
  pusk_ru: str, start_ru: str, zanovo_ru: str,
  naydeno_ru: str.regex(/\{n\}/, 'naydeno_ru — с {n}'), kadr_start_ru: str,
  pobeda: z.object({ kadr_ru: str, soobshchenie_ru: str, vid: vidPoverhnosti, ochki: z.number().int().min(0).default(30) }).strict(),
  blizhe: z.object({ knopka_ru: str, holst_alt: str, podpis_ru: str, ochki: z.number().int().min(0).default(5) }).strict().optional(),
  holst_alt: str, podpis_holsta_ru: str, bez_skripta_ru: str,
}).strict().superRefine((d, ctx) => d.usloviya.forEach((u, i) => ['start', 'verno'].forEach((k) => {
  if (!u.varianty.some((v) => v.kod === u[k as 'start' | 'verno'])) ctx.addIssue({ code: 'custom', path: ['usloviya', i, k], message: `${k}: «${u[k as 'start' | 'verno']}» нет среди variantov` });
})));
// «Подложи звенья под колёса» (первый день — 01-09 «Проведи воз по грязи», Блинов): воз вязнет на колёсах,
// посетитель кладёт под колёса zvenev звеньев, цепь замыкается, тот же воз идёт; финал — сравнение и лента лет.
// Сцена — рисунок холста без надписей (Р18): все слова — вёрсткой из dannye.
const zvenyaShag = z.object({ zadanie_ru: str, poyasnenie_ru: str, status_ru: str, do_ru: str, hod_ru: str, smotri_ru: str, posle_ru: str }).strict();
const zvenyaPodKolesom = z.object({
  zvenev: z.number().int().min(3).max(12),
  scena: z.object({ alt: str, mesto_ru: str.optional() }).strict(),
  knopka_ehat_ru: str.default('Поехали'), knopka_zveno_ru: str.default('Звено'), iz_ru: str.default('из'),
  uvyaz: zvenyaShag.extend({ soobshchenie_ru: str }).strict(),
  zvenya: z.object({ zadanie_ru: str, poyasnenie_ru: str, status_ru: str, zveno_ru: str, zamknulos_ru: str }).strict(),
  edet: zvenyaShag.extend({ soobshchenie_ru: str }).strict(),
  final: z.object({
    zadanie_ru: str, poyasnenie_ru: str, glavnoe_ru: str,
    sravnenie: z.array(z.object({ chislo: str, tekst: str }).strict()).max(3).default([]),
    lenta: z.array(z.object({ god: str, tekst: str }).strict()).max(8).default([]),
    ochki: z.number().int().min(0).default(15),
  }).strict(),
  bez_skripta_ru: str,
}).strict();

// «Поставь каждому своё место» (первые дни — 02-01 «подпиши участки на карте мозга», 02-02 «один ствол — четыре снаряда»):
// выбираешь подпись и ставишь её на место схемы или к цели; верная загорается, все на месте — победа.
// kartinka — фон-схема без надписей (Р18), места на ней по x/y в процентах; без kartinka места идут плитками.
const kod = z.string().regex(/^[a-z0-9-]+$/);
// smeta-truboprovoda (01-05): выход = koef × множители уровней ползунков (множитель 0 — «стоит»), смета = сумма стоимостей.
const urovenSmety = z.object({ podpis: str, mnozhitel: z.number().min(0), stoimost: z.number().min(0) }).strict();
const smetaTruboprovoda = z.object({
  vvod_ru: str.optional(),
  plashki: z.array(z.object({ podpis: str, znachenie: str }).strict()).max(4).default([]),
  koef: z.number().positive(), cel: z.number().positive(), smeta: z.number().positive(),
  polzunki: z.array(z.object({
    kod: z.string().regex(/^[a-z]+$/), nazvanie: str, podskazka: str.optional(),
    start: z.number().int().min(0), urovni: z.array(urovenSmety).min(2).max(8),
  }).strict()).min(1).max(4),
  vyhod: z.object({ nazvanie: str, edinica: str, okruglenie: z.number().positive().default(1), nol_ru: str }).strict(),
  stoimost: z.object({ nazvanie: str, edinica: str }).strict(),
  cena: z.object({ nazvanie: str, edinica: str, mnozhitel: z.number().positive(), znakov: z.number().int().min(0).max(4).default(2) }).strict().optional(),
  // Сцена — знаки (эмодзи) концов, станции и обхода; tolshchina и stancii — номера ползунков, без надписей (Р18).
  scena: z.object({ nachalo: z.string().optional(), konec: z.string().optional(), stanciya: z.string().optional(), obhod: z.string().optional(),
    tolshchina: z.number().int().min(0).optional(), stancii: z.number().int().min(0).optional() }).strict().default({}),
  pusk_ru: str, start_ru: str,
  popytki_ru: str.regex(/\{n\}/, 'popytki_ru — с {n}'), luchshaya_ru: str.regex(/\{c\}/, 'luchshaya_ru — с {c}'),
  ishody: z.object({ nehvat_delitel: z.number().positive().default(1), nol_ru: str, malo_ru: str, dorogo_ru: str, pobeda_ru: str }).strict(),
  ochki: z.array(z.object({ do_popytki: z.number().int().min(1), ochki: z.number().int().min(0) }).strict()).default([]),
  ochki_potom: z.number().int().min(0).default(10),
  primechanie_ru: str.optional(), bez_skripta_ru: str,
}).strict().superRefine((d, ctx) => {
  d.polzunki.forEach((p, i) => { if (p.start >= p.urovni.length) ctx.addIssue({ code: 'custom', path: ['polzunki', i, 'start'], message: `start ${p.start} — нет такого уровня` }); });
  (['tolshchina', 'stancii'] as const).forEach((k) => { const v = d.scena[k]; if (v != null && v >= d.polzunki.length) ctx.addIssue({ code: 'custom', path: ['scena', k], message: `ползунка №${v} нет` }); });
});

const kazhdomuSvoyoMesto = z.object({
  kartinka: z.object({ src: str, alt: str, podpis_ru: str.optional() }).strict().optional(),
  mesta: z.array(z.object({
    kod, nazvanie: str.optional(),
    x: z.number().min(0).max(100).optional(), y: z.number().min(0).max(100).optional(),
    verno_ru: str,
  }).strict()).min(2).max(8),
  podpisi: z.array(z.object({ kod, tekst: str, mesto: kod, mimo_ru: str.optional() }).strict()).min(2).max(8),
  vyberi_ru: str.default('Сначала выбери подпись, потом место.'),
  mimo_ru: str.default('Не сюда — попробуй другое место.'),
  ostalos_ru: str.regex(/\{n\}/, 'ostalos_ru — с {n}').default('Осталось поставить: {n}'),
  pobeda: z.object({ soobshchenie_ru: str, ochki: z.number().int().min(0).default(20) }).strict(),
  bez_skripta_ru: str,
}).strict().superRefine((d, ctx) => {
  const mesta = new Set(d.mesta.map((m) => m.kod));
  d.podpisi.forEach((p, i) => { if (!mesta.has(p.mesto)) ctx.addIssue({ code: 'custom', path: ['podpisi', i, 'mesto'], message: `места «${p.mesto}» нет в mesta` }); });
  d.mesta.forEach((m, i) => {
    const n = d.podpisi.filter((p) => p.mesto === m.kod).length;
    if (n !== 1) ctx.addIssue({ code: 'custom', path: ['mesta', i], message: `у места «${m.kod}» подписей ${n}, нужна одна` });
    if (d.kartinka && (m.x === undefined || m.y === undefined)) ctx.addIssue({ code: 'custom', path: ['mesta', i], message: 'есть kartinka — у места нужны x и y' });
    if (!d.kartinka && !m.nazvanie) ctx.addIssue({ code: 'custom', path: ['mesta', i, 'nazvanie'], message: 'без kartinka у места нужно nazvanie' });
  });
});

// ostanovi-vspyshku (02-21 «Гамалея»): развилкой выбираешь, кого привить первым, чтобы остановить вспышку бешенства.
// Сцена — два силуэта с точкой укуса и пунктиром до мозга: у кого укус ближе к голове, у того болезнь дойдёт раньше — того
// и прививаем первым (защита от прививки созревает, пока вирус ползёт к мозгу). Всё из dannye, на холсте без надписей (Р18).
const ostanoviVspyshku = z.object({
  razvilki: z.array(z.object({
    kod,
    situaciya_ru: str,
    vopros_ru: str,
    varianty: z.array(z.object({
      kod,
      tekst: str,
      bite: z.object({ x: dolya, y: dolya }).strict(),
      verno: z.boolean(),
    }).strict()).length(2),
    verno_ru: str,
    net_ru: str,
  }).strict()).min(2).max(4),
  holst_alt: str,
  podpis_holsta_ru: str,
  progress_ru: str.regex(/\{n\}/, 'progress_ru — с {n}').regex(/\{vsego\}/, 'progress_ru — с {vsego}'),
  start_ru: str,
  zanovo_ru: str,
  pobeda: z.object({ soobshchenie_ru: str, ochki: z.number().int().min(0).default(25) }).strict(),
  bez_skripta_ru: str,
}).strict().superRefine((d, ctx) => d.razvilki.forEach((r, i) => {
  const v = r.varianty.filter((x) => x.verno).length;
  if (v !== 1) ctx.addIssue({ code: 'custom', path: ['razvilki', i, 'varianty'], message: `в развилке «${r.kod}» верных вариантов ${v}, нужен один` });
  const kody = r.varianty.map((x) => x.kod);
  if (new Set(kody).size !== kody.length) ctx.addIssue({ code: 'custom', path: ['razvilki', i, 'varianty'], message: `коды вариантов в «${r.kod}» повторяются` });
}));

// nastroy-volnu-priyomnika (01-04): совпасть с волной приёмника komand раз; |ползунок − цель| < dopusk (шкала 1–100).
const nastroyVolnuPriyomnika = z.object({
  komand: z.number().int().min(1).max(10).default(3),
  dopusk: z.number().min(1).max(20).default(4),
  cel_ot: z.number().min(1).max(100).default(20), cel_do: z.number().min(1).max(100).default(80),
  polzunok_start: z.number().min(1).max(100).default(8),
  polzunok_ru: str, knopka_ru: str,
  schet_ru: str.regex(/\{n\}/, 'schet_ru — с {n}'),
  prinyato_ru: str,
  pobeda: z.object({ soobshchenie_ru: str, ochki: z.number().int().min(0).default(15) }).strict(),
  bez_skripta_ru: str,
}).strict().superRefine((d, ctx) => {
  if (d.cel_do <= d.cel_ot) ctx.addIssue({ code: 'custom', path: ['cel_do'], message: 'cel_do должно быть больше cel_ot' });
});

// nakroy-kvadrat (02-23 «Катюша»): тянешь квадрат разрывов залпа по площади и накрываешь им цель; накрыл все цели — победа.
// Сцена — вид сверху: поле, цель (пунктирный квадрат) и квадрат разрывов (сетка точек), подписи целей — вёрсткой,
// на холсте текста нет (Р18). x, y цели — доли поля, storona — единицы поля; цель меньше квадрата залпа.
const nakroyKvadrat = z.object({
  pole: z.object({ shirina: z.number().int().min(200), vysota: z.number().int().min(100) }).strict().default({ shirina: 640, vysota: 480 }),
  zalp: z.object({ storona: z.number().positive(), ryadov: z.number().int().min(2).max(6).default(4) }).strict(),
  celi: z.array(z.object({ x: dolya, y: dolya, storona: z.number().positive(), podpis: str, verno_ru: str }).strict()).min(2).max(5),
  schet_ru: str.regex(/\{n\}/, 'schet_ru — с {n}').regex(/\{vsego\}/, 'schet_ru — с {vsego}'),
  pusk_ru: str, start_ru: str, zanovo_ru: str, ne_nakryto_ru: str,
  holst_alt: str, podpis_holsta_ru: str, bez_skripta_ru: str,
  pobeda: z.object({ soobshchenie_ru: str, ochki: z.number().int().min(0).default(20) }).strict(),
}).strict().superRefine((d, ctx) => {
  d.celi.forEach((c, i) => {
    if (!(c.storona < d.zalp.storona)) ctx.addIssue({ code: 'custom', path: ['celi', i, 'storona'], message: 'цель меньше квадрата залпа' });
    if (c.x * d.pole.shirina - c.storona / 2 < 0 || c.x * d.pole.shirina + c.storona / 2 > d.pole.shirina)
      ctx.addIssue({ code: 'custom', path: ['celi', i, 'x'], message: 'цель целиком в поле' });
    if (c.y * d.pole.vysota - c.storona / 2 < 0 || c.y * d.pole.vysota + c.storona / 2 > d.pole.vysota)
      ctx.addIssue({ code: 'custom', path: ['celi', i, 'y'], message: 'цель целиком в поле' });
  });
});
// kto-ranshe (02-17 «Изобретений», Пироцкий): две линии времени — Петербург и Берлин. Выбираешь, кто сделал первым,
// и ставишь на год (ползунок). Верно и то и другое — раунд засчитан. Кто раньше и год раньше движок считает сам
// по sobytiya (более раннее событие), в данных лишнего нет; на холсте — только линии и отметки, без надписей (Р18).
const ktoRanshe = z.object({
  linii: z.array(z.object({ kod, nazvanie: str, cvet: str }).strict()).length(2),
  pary: z.array(z.object({
    vopros_ru: str,
    sobytiya: z.array(z.object({ linia: kod, nazvanie: str, god: z.number().int() }).strict()).length(2),
    stavka: z.object({
      podpis_ru: str,
      god_ot: z.number().int(), god_do: z.number().int(),
      start: z.number().int(), dopusk: z.number().int().min(0),
      god_ru: str.regex(/\{g\}/, 'god_ru — с {g}'),
    }).strict(),
    kto_net_ru: str, god_net_ru: str, verno_ru: str,
  }).strict()).min(1).max(4),
  holst_alt: str,
  vyberi_ru: str.default('Сначала выбери, кто сделал первым.'),
  proverit_ru: str.default('Проверить'),
  progress_ru: str.regex(/\{n\}/, 'progress_ru — с {n}').regex(/\{vsego\}/, 'progress_ru — с {vsego}'),
  start_ru: str, zanovo_ru: str,
  pobeda: z.object({ soobshchenie_ru: str, ochki: z.number().int().min(0).default(20) }).strict(),
  bez_skripta_ru: str,
}).strict().superRefine((d, ctx) => {
  const liniiKody = d.linii.map((l) => l.kod);
  if (new Set(liniiKody).size !== liniiKody.length) ctx.addIssue({ code: 'custom', path: ['linii'], message: 'коды линий повторяются' });
  const linii = new Set(liniiKody);
  d.pary.forEach((p, i) => {
    if (p.sobytiya[0].linia === p.sobytiya[1].linia) ctx.addIssue({ code: 'custom', path: ['pary', i, 'sobytiya'], message: 'события должны быть на разных линиях' });
    p.sobytiya.forEach((s, j) => { if (!linii.has(s.linia)) ctx.addIssue({ code: 'custom', path: ['pary', i, 'sobytiya', j, 'linia'], message: `линии «${s.linia}» нет в linii` }); });
    if (p.sobytiya[0].god === p.sobytiya[1].god) ctx.addIssue({ code: 'custom', path: ['pary', i, 'sobytiya'], message: 'годы событий должны различаться — иначе нет «кто раньше»' });
    if (p.stavka.god_do <= p.stavka.god_ot) ctx.addIssue({ code: 'custom', path: ['pary', i, 'stavka', 'god_do'], message: 'god_do должно быть больше god_ot' });
    if (!(p.stavka.god_ot <= p.stavka.start && p.stavka.start <= p.stavka.god_do)) ctx.addIssue({ code: 'custom', path: ['pary', i, 'stavka', 'start'], message: 'start — между god_ot и god_do' });
    p.sobytiya.forEach((s, j) => { if (s.god < p.stavka.god_ot || s.god > p.stavka.god_do) ctx.addIssue({ code: 'custom', path: ['pary', i, 'sobytiya', j, 'god'], message: `год ${s.god} вне шкалы ставки (${p.stavka.god_ot}–${p.stavka.god_do})` }); });
  });
});

// tri-negativa (02-19 «Изобретений», цветная фотография Прокудина-Горского): камера снимает один вид трижды — через
// красное, зелёное и синее стекло; три чёрно-белых кадра, каждый хранит свой цвет. При показе кадры совмещают, и цвета
// складываются в цветной кадр. Здесь три цветных канала-негатива сдвинуты — посетитель тянет их на место (мышь/палец)
// или выбирает кнопкой и двигает стрелками; канал защёлкивается, все три на месте — цветная фотография.
// Сцена — рисунок холста без надписей и эмодзи (Р18), все слова — вёрсткой из dannye.
const triNegativa = z.object({
  kanaly: z.array(z.object({
    kod: z.string().regex(/^[a-z]+$/),
    cvet: z.tuple([z.number().int().min(0).max(255), z.number().int().min(0).max(255), z.number().int().min(0).max(255)]),
    imya_ru: str,
  }).strict()).length(3),
  dopusk: z.number().positive().default(16),
  sdvig: z.number().positive().default(70),
  shag: z.number().positive().default(4),
  scena: z.object({ alt: str, podpis_ru: str }).strict(),
  vyberi_ru: str.default('Тяни цветную метку канала или выбери канал кнопкой и двигай стрелками.'),
  status_ru: str.regex(/\{n\}/, 'status_ru — с {n}'),
  sovpalo_ru: str.regex(/\{k\}/, 'sovpalo_ru — с {k}'),
  pobeda: z.object({ soobshchenie_ru: str, ochki: z.number().int().min(0).default(20) }).strict(),
  bez_skripta_ru: str,
}).strict();

// uderzhi-plazmu (02-25 «Изобретений», первый в мире токамак Т-1): держишь раскалённую плазму в магнитной бутылке,
// не давая ей коснуться стенок. Плазма сама стремится к стенкам и её толкают завихрения; магнитный держатель (мышь,
// палец или стрелки) тянет её обратно к центру. Продержись cel_sekund секунд — победа. Сцена — круг бутылки, плазма
// и держатель на холсте без надписей и эмодзи (Р18); все слова — вёрсткой из dannye. Размеры — доли, физика — на кадр.
const uderzhiPlazmu = z.object({
  cel_sekund: z.number().int().min(5).max(120).default(25),
  butylka: z.number().min(0.3).max(0.95).default(0.8),        // радиус стенки бутылки — доля половины меньшей стороны холста
  plazma: z.number().min(0.03).max(0.5).default(0.15),        // радиус плазмы — доля радиуса бутылки
  derzhatel: z.number().min(0.08).max(0.9).default(0.3),      // радиус зоны захвата держателя — доля радиуса бутылки
  sila: z.number().min(0.0005).max(0.2).default(0.01),        // ускорение, с которым держатель тянет плазму к центру (доли бутылки за кадр)
  rastalkivanie: z.number().min(0).max(0.02).default(0.0008), // ускорение, с которым плазма сама стремится к стенкам (на кадр)
  turbulentnost: z.number().min(0).max(0.05).default(0.004),  // сила случайных завихрений (доли бутылки за кадр)
  schet_ru: str.regex(/\{s\}/, 'schet_ru — с {s}'),
  derzhatel_ru: str,
  kosnulos_ru: str,
  pobeda: z.object({ soobshchenie_ru: str, ochki: z.number().int().min(0).default(20) }).strict(),
  bez_skripta_ru: str,
}).strict();

// dokuda-signal (02-24 «Бонч-Бруевич»): ползунком наращиваешь мощность передатчика и смотришь на карте, докуда
// доходит сигнал из Москвы. Без водяного охлаждения анода потолок — 6 кВт (граф Арко: мощнее ламп не бывает); с
// охлаждением — до 12 кВт, и круги сигнала достают до дальних городов Европы. Города, предел, все тексты — из dannye;
// на холсте только карта, мачта, круги и точки городов, без надписей (Р18). Достал ли круг город — движок считает сам,
// по расстоянию точки от мачты (дальний город достижим только на полной мощности, а дальше предела — только с охлаждением).
const dokudaSignal = z.object({
  goroda: z.array(z.object({
    kod,
    nazvanie_ru: str,
    x: dolya,
    y: dolya,
  }).strict()).min(3).max(8),
  moshnost_max: z.number().positive().max(1000).default(12),
  moshnost_start: z.number().min(0).default(0),
  predel_bez_ohlazhdeniya: z.number().positive().max(1000).default(6),
  polzunok_ru: str,
  moshnost_ru: str.regex(/\{n\}/, 'moshnost_ru — с {n}'),
  ohlazhdenie_ru: str,
  ohlazhdenie_on_ru: str,
  peregrel_ru: str,
  dostig_ru: str.regex(/\{gorod\}/, 'dostig_ru — с {gorod}'),
  podpis_holsta_ru: str,
  holst_alt: str,
  start_ru: str,
  pobeda: z.object({ soobshchenie_ru: str, ochki: z.number().int().min(0).default(20) }).strict(),
  bez_skripta_ru: str,
}).strict().superRefine((d, ctx) => {
  const kody = d.goroda.map((g) => g.kod);
  if (new Set(kody).size !== kody.length) ctx.addIssue({ code: 'custom', path: ['goroda'], message: 'коды городов повторяются' });
  if (d.predel_bez_ohlazhdeniya >= d.moshnost_max) ctx.addIssue({ code: 'custom', path: ['predel_bez_ohlazhdeniya'], message: 'предел без охлаждения должен быть меньше максимума' });
  if (d.moshnost_start > d.moshnost_max) ctx.addIssue({ code: 'custom', path: ['moshnost_start'], message: 'стартовая мощность больше максимума' });
});

// poezd-po-ferme (02-28 «Журавский»): ведёшь поезд по ферме моста и видишь, какие раскосы тянутся, а какие сжимаются.
// Сцена — боковой вид фермы: два пояса и зигзаг раскосов, по нижнему поясу ходит поезд (ползунок/стрелки). Подъехал к
// очередному раскосу — движок показывает, что с ним происходит (тянется — зелёный, давит — золотой), и посетитель жмёт
// «Тянет»/«Давит»; верно — раскос защёлкивается и открывается пояснение, все пройдены — победа. На холсте текста нет (Р18).
const poezdPoFerme = z.object({
  raskosy: z.array(z.object({
    kod,
    tyanet: z.boolean(),
    poyasnenie_ru: str,
  }).strict()).min(3).max(9),
  polzunok_ru: str,
  privedi_ru: str.regex(/\{n\}/, 'privedi_ru — с {n}').regex(/\{vsego\}/, 'privedi_ru — с {vsego}'),
  vopros_ru: str,
  knopka_tyanet_ru: str,
  knopka_davit_ru: str,
  verno_ru: str,
  mimo_ru: str,
  status_ru: str.regex(/\{n\}/, 'status_ru — с {n}').regex(/\{vsego\}/, 'status_ru — с {vsego}'),
  holst_alt: str,
  podpis_holsta_ru: str,
  start_ru: str,
  pobeda: z.object({ soobshchenie_ru: str, ochki: z.number().int().min(0).default(20) }).strict(),
  bez_skripta_ru: str,
}).strict().superRefine((d, ctx) => {
  const kody = d.raskosy.map((r) => r.kod);
  if (new Set(kody).size !== kody.length) ctx.addIssue({ code: 'custom', path: ['raskosy'], message: 'коды раскосов повторяются' });
});

export const MEHANIKI: Record<string, Mehanika> = {
  'lovi-signal-v-okno': { den: '01-01', igra: 'signal-po-kabelyu', slovami: 'Ловишь падающий с антенны сигнал и пальцем или стрелками ведёшь его к мигающему окну с поправкой на ветер, затем собираешь тракт по порядку' },
  'ugol-v-koridor-luny': { den: '01-02', igra: 'luna1-trayektoriya', slovami: 'Ползунком задаёшь угол запуска и пускаешь ракету, чтобы она прошла в коридоре возле Луны', dvizhok: true, dannye: ugolVKoridorLuny },
  'tri-usloviya-bulata': { den: '01-03', igra: 'tigel-anosova', slovami: 'Перебираешь три условия плавки (добавка, охлаждение, ковка), пока не получится булат; неудачи показывают причины', dvizhok: true, dannye: triUsloviyaBulata },
  'nastroy-volnu-priyomnika': { den: '01-04', igra: 'svoya-volna', slovami: 'Ползунком подгоняешь волну передатчика к волне приёмника и передаёшь команду; во второй игре шлёшь сигнал, когда волна в зоне', dvizhok: true, dannye: nastroyVolnuPriyomnika },
  'smeta-truboprovoda': { den: '01-05', igra: 'truba-shukhova', slovami: 'Тремя ползунками (диаметр, насосы, подогрев) подбираешь трубопровод, чтобы прокачать 80 000 пудов в сутки и уложиться в смету', dvizhok: true, dannye: smetaTruboprovoda },
  'odin-progon-orlova': { den: '01-06', igra: 'stanok-orlova', slovami: 'Печатаешь розетку старым способом в три прогона и станком Орлова в один, а потом отличаешь настоящий билет от подделки' },
  'stezhki-v-takt-serdca': { den: '01-07', igra: 'sshey-shunt', slovami: 'Пережимаешь сосуд и 8 секунд смотришь ЭКГ, затем тапаешь по золотым точкам, которые движутся в такт сердцу (8 стежков)' },
  'razbey-ldiny-po-prochnosti': { den: '01-08', igra: 'probey-led', slovami: 'Тапаешь по 10 льдинам, у каждой своя прочность (1–3 удара), пока путь не будет открыт; потом быстрая викторина', dvizhok: true, dannye: razbeyLdiny },
  'zvenya-pod-koleso': { den: '01-09', igra: 'blinov-gusenica', slovami: 'Телега вязнет; кладёшь под колёса 8 звеньев гусеницы и снова трогаешься, после чего открывается лента лет', dvizhok: true, dannye: zvenyaPodKolesom },
  'tri-usloviya-ldoloma': { den: '01-10', igra: 'nos-paylota', slovami: 'Выбираешь форму носа, способ идти на лёд и время выхода и проверяешь, пройдёт ли буксир; неудачи показывают причины', dvizhok: true, dannye: triUsloviyaLdoloma },
  'tri-usloviya-motora': { den: '01-11', igra: 'podnyat-motor', slovami: 'Выбираешь топливо и конструкцию двигателя и смотришь, поднимет ли он аппарат' },
  'paket-stupeney': { den: '01-12', igra: 'soberi-r7', slovami: 'Выбираешь схему ракеты (тандем или пакет) и сброс блоков и смотришь анимацию полёта' },
  'pogruzhenie-s-remontom': { den: '01-13', igra: 'k278-kilometr', slovami: 'Опускаешь лодку ступенями, по пути чинишь течи в отсеках и следишь за запасом времени, а на 800 м пускаешь торпеду' },
  'khvost-za-protivnikom': { den: '01-14', igra: 'perehvat', slovami: 'Держишь «Полный ход» и вовремя жмёшь «Разворот», чтобы 22 часа идти в хвосте у противника и не дать себя услышать' },
  'tri-volchka-runge': { den: '01-15', igra: 'volchok', slovami: 'Выбираешь массу и положение центра тяжести волчка, модель считает вращение, и ты видишь следы трёх типов волчков' },
  'ruchnaya-stykovka': { den: '01-16', igra: 'soyuz-prichal', slovami: 'Пальцем держишь корабль в круге, тормозом и тягой меняешь скорость сближения, на 30 м выбираешь, ждать ли телесвязь, и стыкуешься' },
  'koleso-zadvizhki': { den: '01-17', igra: 'gidroudar', slovami: 'Пальцем крутишь колесо задвижки два оборота так, чтобы волна гидроудара не порвала трубу, и укладываешься во время каждого вызова' },
  'koren-arifmometrom': { den: '01-18', igra: 'koren-za-ruchku', slovami: 'На арифмометре вычитаешь нечётные числа оборотами ручки, пока не получатся нули; число оборотов и есть корень (√25, затем √196 наперегонки)' },
  'kolonna-po-ldu': { den: '01-19', igra: 'ladoga-led', slovami: 'Решаешь, кто едет первым, и пускаешь 10 танков по льду с такими промежутками, чтобы чаши прогиба не сливались, и колонна успела к рассвету' },
  'korm-dlya-myshey': { den: '01-20', igra: 'chto-v-moloke', slovami: 'Собираешь корм для клеток с мышами, кормишь 30 дней и опытами опровергаешь руководителя (нужны три доказательства)' },
  'sterzhni-v-zelyonoy': { den: '01-21', igra: 'obninsk-tok', slovami: 'Поднимаешь и опускаешь стержни, держишь мощность в зелёной полосе при внезапных скачках и открываешь пар на турбину, чтобы зажечь 60 окон' },
  'poymay-vtoroy-zvuk': { den: '01-22', igra: 'vtoroy-zvuk', slovami: 'Охлаждаешь гелий ниже 2,17 К, угадываешь скорость тепла и жмёшь «Поймал!», когда тепловая волна коснётся датчика' },
  'ryvok-po-verevke': { den: '01-23', igra: 'verevka-umova', slovami: 'По шагам дёргаешь верёвку с колокольчиком, смотришь рывок «глазами Умова» в замедлении и прижимаешь верёвку пальцем, чтобы колокольчик промолчал' },
  'glubina-na-polnom-khodu': { den: '01-24', igra: 'rekord-anchar', slovami: 'Набираешь скорость до 44,7 узла и рулями «Вверх»/«Вниз» или пальцем держишь лодку на глубине, а на большой скорости вода бьёт сильнее' },
  'perfokarty-shtyryami': { den: '01-25', igra: 'obgoni-akademikov', slovami: 'Ставишь штыри планки над нужными признаками и протягиваешь её, чтобы выпали нужные карточки быстрее академика; три раунда («да», «нет», вес)' },
  'vysota-dlya-kadra': { den: '01-26', igra: 'kronshtadt-kadr', slovami: 'Балластом и газом ловишь высоту аэростата 1000–1200 м и снимаешь, когда весь остров попал в зелёную рамку (4 пластинки)' },
  'tochka-vstrechi': { den: '01-27', igra: 'sbej-raketu', slovami: 'Ставишь на радаре точку встречи впереди цели и пускаешь противоракету, чтобы они пришли туда вместе; горит блок — меняешь и перезапускаешь' },
  'stena-privivok': { den: '01-28', igra: 'zelenaya-stena', slovami: 'Пальцем прививаешь домики и строишь сплошную стену поперёк чумной волны, пополняя флакон на 5 доз; решаешь, спасать ли порт и рынок' },
  'dirizhabl-mezhdu-shpilyami': { den: '01-29', igra: 'kilometr-nad-peterburgom', slovami: 'Пальцем ведёшь дирижабль вверх-вниз между шпилями и тучами, по стрелке угадываешь порыв ветра и решаешь, когда давать полный ход' },
  'kolco-parashyuta': { den: '01-30', igra: 'spasis-aerostat', slovami: 'Застёгиваешь лямки, прыгаешь из горящей корзины, дёргаешь кольцо как можно ниже (но не ниже 25 м) и уходишь к своим окопам' },
  'rezonans-i-gody': { den: '01-31', igra: 'razgoni-girotron', slovami: 'Кнопками «Поле ±» ловишь резонанс, угадываешь срок и год за годом доводишь гиротрон от 6 ватт до мегаватта' },  // ── новые механики (февраль и дальше) — ниже, по строке на игру ──
  // Февраль — новые механики, общие для нескольких дней.
  'kazhdomu-svoyo-mesto': { slovami: 'Выбираешь подпись и ставишь её на своё место схемы или к своей цели; верная загорается, неверная говорит почему, все на месте — победа', dvizhok: true, dannye: kazhdomuSvoyoMesto },
  'ostanovi-vspyshku': { slovami: 'Развилкой выбираешь, кого привить первым, чтобы остановить вспышку бешенства', dvizhok: true, dannye: ostanoviVspyshku },
  'nakroy-kvadrat': { slovami: 'Тянешь квадрат разрывов залпа по площади и накрываешь им цель; все цели накрыты — победа', dvizhok: true, dannye: nakroyKvadrat },
  'kto-ranshe': { slovami: 'Две линии времени — Петербург и Берлин: выбираешь, кто сделал первым, и ставишь на год', dvizhok: true, dannye: ktoRanshe },
  'tri-negativa': { slovami: 'Совмещаешь красный, зелёный и синий кадры-негативы, пока не соберётся цветная фотография', dvizhok: true, dannye: triNegativa },
  'uderzhi-plazmu': { slovami: 'Удерживаешь плазму в магнитной бутылке, не давая ей коснуться стенок', dvizhok: true, dannye: uderzhiPlazmu },
  'dokuda-signal': { slovami: 'Ползунком наращиваешь мощность передатчика и смотришь на карте, докуда доходит сигнал; без водяного охлаждения потолок — 6 кВт, с ним достаёшь до дальних городов Европы', dvizhok: true, dannye: dokudaSignal },
  'poezd-po-ferme': { slovami: 'Ведёшь поезд по ферме моста и видишь, какие раскосы тянутся, а какие сжимаются', dvizhok: true, dannye: poezdPoFerme },
};

// Поле igra карточки дня (п. 76, 89): механика из списка, рамка — общие строки, dannye — по схеме механики.
// Рамка: kicker над заголовком, zagolovok, pravilo_ru — одна строка «что делает посетитель»; kak_igrat — блок «Как играть»
// (как в январских играх, проверка igra-pravila), istochnik_ru — строка-источник правил модели под игрой.
export const igraDannymi = z.object({
  mehanika: str,
  kicker: str.default('Главное действие'),
  zagolovok: str,
  pravilo_ru: str.refine((s) => !/\n/.test(s), 'pravilo_ru — одна строка'),
  kak_igrat: z.object({ zachem: str, shagi: z.array(str).min(1), nyuans: str.optional(), final: str.optional() }).optional(),
  istochnik_ru: str.optional(),
  dannye: z.record(z.string(), z.unknown()),
}).strict().superRefine((g, ctx) => {
  const m = MEHANIKI[g.mehanika];
  if (!m) { ctx.addIssue({ code: 'custom', path: ['mehanika'], message: `механики «${g.mehanika}» нет в src/lib/igry-mehaniki.ts` }); return; }
  if (!m.dvizhok || !m.dannye) { ctx.addIssue({ code: 'custom', path: ['mehanika'], message: `у механики «${g.mehanika}» ещё нет движка данными (public/assets/igry/${g.mehanika}.js)` }); return; }
  const r = m.dannye.safeParse(g.dannye);
  if (!r.success) r.error.issues.forEach((i) => ctx.addIssue({ ...i, path: ['dannye', ...i.path] } as z.ZodIssue));
// В движок идут dannye уже по схеме механики — с подставленными значениями по умолчанию.
}).transform((g) => ({ ...g, dannye: MEHANIKI[g.mehanika].dannye!.parse(g.dannye) as Record<string, unknown> }));
export type IgraDannymi = z.infer<typeof igraDannymi>;
