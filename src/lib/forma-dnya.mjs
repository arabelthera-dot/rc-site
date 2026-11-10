// Поля формы карточки дня (Р635) — одни на обе карточки: запись дня src/content/days (src/content.config.ts) и
// карточку страницы src/content/dni-shablon (src/lib/den-obshchee.mjs). Имена и смысл полей — src/data/forma-dnya.json,
// что обязательно с февраля — docs/standart-dnya.md (Р660). Здесь — только типы; полнота — src/lib/standart-dnya.mjs.
// База источника и картинки — закрытый список: российские и белорусские да (Р469, Р136);
// Википедии, Викисклада, Викитеки в нём нет и не будет (Р90).
import fs from 'node:fs';
import { z } from 'astro/zod';
import bazy from '../data/spravochniki/bazy.json' with { type: 'json' };

// Р676: список баз один — src/data/spravochniki/bazy.json (собирает tools/spravochniki.py bazy), здесь не перечислять.
export const BAZY = bazy.razresheny.map((b) => b.id);
export const VIDY = ['foto', 'chertezh', 'karta', 'kartina', 'risunok', 'plakat', 'dokument', 'predmet', 'skhema',
  'kadr-filma'];
export const TYAZHELYE = ['vojna', 'kazn', 'golod', 'repressii', 'katastrofa', 'gibel'];
// «Нет» в полях, где ответ «нет» — тоже ответ (пп. 9, 20, 21, 29): поле есть, значение 'net'.
export const NET = 'net';
export const wiki = /wiki|википеди|викитек/i;

const str = z.string().min(1);
export const baza = z.enum(BAZY, { message: 'база — из закрытого списка src/data/spravochniki/bazy.json (Википедия, Викисклад, Викитека запрещены, Р90)' });
export const nomer = z.string().regex(/^[a-z0-9-]+$/, 'номер — латиница, цифры, дефис');
export const god = z.union([z.number().int(), z.string().min(1)]);
export const data = z.string().regex(/^\d{1,4}-\d\d-\d\d$/, 'дата — ГГГГ-ММ-ДД');
const chisloIliNet = z.union([z.number().int(), z.literal(NET)]);
const chitaj = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
// Школьный предмет и класс (п. 10) — закрытый список ФГОС: src/data/spravochniki/shkolnye-predmety.json.
export const PREDMETY = chitaj('src/data/spravochniki/shkolnye-predmety.json').predmety;
export const shkola = z.array(z.object({
  predmet: z.enum(Object.keys(PREDMETY), { message: 'shkola.predmet — из src/data/spravochniki/shkolnye-predmety.json' }),
  klass: z.number().int().min(1).max(11, 'shkola.klass — 1–11'),
}).superRefine((s, ctx) => {
  if (PREDMETY[s.predmet] && !PREDMETY[s.predmet].klassy.includes(s.klass))
    ctx.addIssue({ code: 'custom', message: `shkola: «${PREDMETY[s.predmet].nazvanie}» в ${s.klass} классе нет (ФГОС: ${PREDMETY[s.predmet].klassy.join(', ')})` });
})).min(1);
// Кто и что на картинке (п. 22) — номера записей словаря src/data/slovar.json и карточек src/data/spravochniki/kartochki.json.
export const ZAPISI = new Set([...Object.keys(chitaj('src/data/slovar.json')), ...Object.keys(chitaj('src/data/spravochniki/kartochki.json'))]);
export const izobrazheno = z.array(z.string()
  .regex(/^(lyudi|predmet|mesto|narod|sobytie):[a-z0-9-]+$/, 'izobrazheno — «tip:id», tip: lyudi|predmet|mesto|narod|sobytie')
  .superRefine((id, ctx) => { if (!ZAPISI.has(id)) ctx.addIssue({ code: 'custom', message: `izobrazheno: «${id}» нет ни в slovar.json, ни в spravochniki/kartochki.json` }); })).min(1);

// Источник — запись: на него ссылаются факты и цитаты по id.
export const istochnik = z.object({
  id: nomer,
  baza,
  nazvanie: z.string().min(1, 'у источника нет названия'),
  avtor: str.optional(),
  god: god.optional(),
  ssylka: z.string().url('ссылка источника — адрес http(s)').optional(),
  mesto: str.optional(),
});
// Язык цитаты — код BCP 47 (п. 43): be — белорусский, cu — церковнославянский; поля нет — цитата русская.
// Нужен, чтобы цитату не отдавали в машину перевода как русскую и чтобы шаблон мог поставить ей lang.
export const YAZYKI_CITAT = ['ru', 'be', 'cu'];
export const citata = z.object({
  kto: z.string().min(1, 'у цитаты нет автора'),
  gde: z.string().min(1, 'у цитаты нет места публикации'),
  tekst: z.string().min(1, 'у цитаты нет текста'),
  istochnik: nomer.optional(),
  yazyk: z.enum(YAZYKI_CITAT, { message: `язык цитаты — ${YAZYKI_CITAT.join(' | ')} (BCP 47)` }).optional(),
});
// Паспорт прав картинки — одна запись; otkuda — откуда взята («Госкаталог, № предмета 4655496»).
// Годы смерти автора и реабилитации — число или 'net' (автор жив, не репрессирован).
export const prava = z.object({
  avtor: z.string().min(1, 'автор картинки — имя или «автор не указан»'),
  god_sozdaniya: god.optional(),
  god_smerti_avtora: chisloIliNet.optional(),
  god_reabilitacii: chisloIliNet.optional(),
  anonim: z.boolean().optional(),
  pervaya_publikaciya: god.optional(),
  sdelano_mashinoj: z.boolean(),
  otkuda: z.string().min(1, 'в паспорте прав нет «откуда»'),
  baza: baza.optional(),
  ssylka: z.string().url('ссылка картинки — адрес http(s)').optional(),
});
// Р733 (очереди 3 и 4): поля дня для игр, ролика, карты и 3D. 'net' — у дня этого нет, тоже ответ.
const dolya = z.number().min(0).max(1);
export const ramka = z.object({ x: dolya, y: dolya, w: dolya.optional(), h: dolya.optional() });
const shirota = z.number().min(-90).max(90), dolgota = z.number().min(-180).max(180);
// Место события (пп. 255, 256): id места словаря с koordinaty или своё место с координатами.
export const mestoSobytiya = z.union([
  z.string().regex(/^mesto:[a-z0-9-]+$/, 'mesto_sobytiya — «mesto:id» из src/data/slovar.json или {nazvanie, shirota, dolgota}'),
  z.object({ nazvanie: str, shirota, dolgota }),
]);
const url = z.string().url('ссылка — адрес http(s)');
// «Мой дед был там» (п. 197): база потомков — Память народа или Подвиг народа.
export const BAZY_DEDA = ['pamyat-naroda', 'podvig-naroda'];
export const polyaR733 = {
  podskazki_igry: z.union([z.literal(NET), z.array(str).length(3, 'podskazki_igry — ровно 3 подсказки')]).optional(),
  togda_sejchas: z.union([z.literal(NET), z.object({ togda: str, sejchas: str, otkuda: str, god: god })]).optional(),
  moj_ded: z.union([z.literal(NET), z.object({ baza: z.enum(BAZY_DEDA, { message: `moj_ded.baza — ${BAZY_DEDA.join(' | ')}` }), ssylka: url })]).optional(),
  skvoznye_linii: z.union([z.literal(NET), z.array(nomer).min(1)]).optional(),
  mesto_sobytiya: mestoSobytiya.optional(),
  predmet_3d: z.union([z.literal(NET), z.object({ chto: str, opory: z.array(str).min(1), razmery: str })]).optional(),
  panorama_360: z.union([z.literal(NET), z.object({ ssylka: url, otkuda: str })]).optional(),
  staraya_karta: z.union([z.literal(NET), z.object({ nazvanie: str, god, otkuda: str, ssylka: url.optional() })]).optional(),
  marshrut: z.union([z.literal(NET), z.array(z.object({ mesto: str, shirota, dolgota, chto: str })).min(2, 'marshrut — не меньше 2 точек')]).optional(),
  kak_rabotaet: z.union([z.literal(NET), z.array(str).min(3).max(5, 'kak_rabotaet — 3–5 шагов')]).optional(),
};
// Поля формы у картинки (vid … izobrazheno); нет поля — как раньше.
export const polyaKartinki = {
  vid: z.enum(VIDY, { message: `vid картинки — ${VIDY.join(' | ')}` }).optional(),
  prava: prava.optional(),
  nomer_predmeta: str.optional(),
  nomer_snimka: str.optional(),
  hranitel: str.optional(),
  podpis_chto: str.optional(),
  podpis_gde: str.optional(),
  podpis_kogda: str.optional(),
  simvolika_proverena: z.boolean().optional(),
  podlinnik: z.object({ gde: str, otkuda: str }).optional(),
  svyashchennoe: z.boolean().optional(),
  izobrazheno: izobrazheno.optional(),
  // 26. Длинное описание схемы, карты, чертежа для незрячих (WAI, complex images): что и где на картинке, связи;
  // выводится под картинкой раскрывающимся «Подробное описание» и связано с ней aria-describedby.
  opisanie_dlinnoe: str.optional(),
  // Р733 п.182: главное на картинке — точка (x, y) или рамка (x, y, w, h) в долях кадра 0–1, туда наезжает камера ролика.
  glavnoe_na_kartinke: z.union([z.literal(NET), ramka]).optional(),
};
// Поля формы у факта (fakty.id … fakty.otvet_edinstvennyj): у карточки страницы факт — удар блока fakty.
export const polyaFakta = {
  id: nomer.optional(),
  istochnik: nomer.optional(),
  dlya_voprosa: z.boolean().optional(),
  otvet: str.optional(),
  otvet_edinstvennyj: z.literal(true).optional(),
  // Р733 п.257: сравнение числа факта с привычным («как 12 этажей»); в факте нет числа — 'net'.
  sravnenie: z.union([z.literal(NET), str]).optional(),
};
// Р676 (Сергей 09.11: «переводи их в автоматизацию»): состав дня — полями формы, а не только словами навыков.
// status: 'zagotovka' — день в работе, состав не обязателен; 'gotov' — вся форма и весь состав (10 + «Ещё» 5, полухуки,
// игра или визуализация). Нет поля — день как раньше.
export const status = z.enum(['zagotovka', 'gotov'], { message: "status — 'zagotovka' или 'gotov'" });
// Полухук факта — заголовок-крючок над «Подробнее» (museum-nesdayutsya: одно предложение).
export const poluhuk = str;
// Визуализация «Русских не сдаются» вместо игры (Р436): вид и данные, по которым её рисует движок.
export const VIZUAL_TIPY = ['dokument', 'karta', 'predmet'];
export const vizualDannymi = z.object({
  tip: z.enum(VIZUAL_TIPY, { message: `vizual.tip — ${VIZUAL_TIPY.join(' | ')}` }),
  dannye: z.record(z.string(), z.unknown()).refine((v) => Object.keys(v).length > 0, 'у визуализации нет данных (vizual.dannye)'),
});
// Показ Сергею до озвучки (museum-page-production, ход 2): аудиогид и ролик — только после «да» на текст.
export const pokazanSergeyu = z.object({ data });
// Поля формы у дня (nomer_dnya … slovar) — без fakty и images: у карточки страницы они свои (удары, кадры).
// п.498: где увидеть подлинник — музей-хранитель, город, запись Госкаталога (если есть) или страница музея.
const neViki = (u) => !wiki.test(u);
export const gdeUvidet = z.object({
  chto: str,
  muzej: str,
  gorod: str,
  goskatalog: z.string().url().regex(/^https:\/\/goskatalog\.ru\//, 'goskatalog — адрес https://goskatalog.ru/…').optional(),
  ssylka: z.string().url('ссылка — адрес http(s)').refine(neViki, 'Википедия запрещена (Р90)').optional(),
});
// п.498: что почитать дальше — бесплатные библиотеки и архивы (НЭБ, Президентская библиотека, Росархив); Википедия запрещена (Р90).
export const chitatDalshe = z.object({
  nazvanie: str.refine(neViki, 'Википедия запрещена (Р90)'),
  gde: str,
  ssylka: z.string().url('ссылка — адрес http(s)').refine(neViki, 'Википедия запрещена (Р90)'),
});
export const polyaDnya = (slovar) => ({
  nomer_dnya: nomer.optional(),
  data_sobytiya: data.optional(),
  data_staryj_stil: data.optional(),
  data_uslovnaya: str.optional(),
  chto_sluchilos: str.optional(),
  god: z.number().int().optional(),
  god_tochnost: z.enum(['tochno', 'okolo', 'desyatiletie', 'vek']).optional(),
  god_pokaza: z.number().int().min(2026).optional(),
  ves: z.enum(['glavnoe', 'vtoroe', 'obychnoe']).optional(),
  tyazhelaya_tema: z.union([z.literal(NET), z.array(z.enum(TYAZHELYE))]).optional(),
  istochniki: z.array(istochnik).optional(),
  citaty: z.array(citata).optional(),
  velichina_chislo: z.number().optional(),
  velichina_edinica: str.optional(),
  velichina_chto: str.optional(),
  voinskaya_chast: str.optional(),
  operaciya: str.optional(),
  front: str.optional(),
  // п.41: шифры, номера, коды дословно как в тексте дня — на странице они в <span translate="no"> (src/lib/perevod.mjs).
  ne_perevodit: z.array(str).optional(),
  shkola: shkola.optional(),
  etiketka_oblozhki: z.array(str).min(1).max(3, 'этикетка обложки — 1–3 строки').optional(),
  pokazan_sergeyu: pokazanSergeyu.optional(),
  // п.498 (Р745): «Где увидеть подлинник» и «Что почитать дальше» — необязательные; нет поля — нет блока.
  gde_uvidet: z.array(gdeUvidet).min(1).optional(),
  chitat_dalshe: z.array(chitatDalshe).min(3, 'что почитать — 3–5 ссылок').max(5, 'что почитать — 3–5 ссылок').optional(),
  ...polyaR733,
  slovar: z.array(z.string().regex(/^(lyudi|mesto|narod|tema):[a-z0-9-]+$/, 'slovar — «tip:id», tip: lyudi|mesto|narod|tema')
    .superRefine((id, ctx) => { if (!(id in slovar)) ctx.addIssue({ code: 'custom', message: `slovar: «${id}» нет в src/data/slovar.json` }); })).optional(),
});
