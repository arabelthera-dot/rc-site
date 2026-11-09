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

export const MEHANIKI: Record<string, Mehanika> = {
  'lovi-signal-v-okno': { den: '01-01', igra: 'signal-po-kabelyu', slovami: 'Ловишь падающий с антенны сигнал и пальцем или стрелками ведёшь его к мигающему окну с поправкой на ветер, затем собираешь тракт по порядку' },
  'ugol-v-koridor-luny': { den: '01-02', igra: 'luna1-trayektoriya', slovami: 'Ползунком задаёшь угол запуска и пускаешь ракету, чтобы она прошла в коридоре возле Луны' },
  'tri-usloviya-bulata': { den: '01-03', igra: 'tigel-anosova', slovami: 'Перебираешь три условия плавки (добавка, охлаждение, ковка), пока не получится булат; неудачи показывают причины' },
  'nastroy-volnu-priyomnika': { den: '01-04', igra: 'svoya-volna', slovami: 'Ползунком подгоняешь волну передатчика к волне приёмника и передаёшь команду; во второй игре шлёшь сигнал, когда волна в зоне' },
  'smeta-truboprovoda': { den: '01-05', igra: 'truba-shukhova', slovami: 'Тремя ползунками (диаметр, насосы, подогрев) подбираешь трубопровод, чтобы прокачать 80 000 пудов в сутки и уложиться в смету' },
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
