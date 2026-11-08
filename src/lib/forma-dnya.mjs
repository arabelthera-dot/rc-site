// Поля формы карточки дня (Р635) — одни на обе карточки: запись дня src/content/days (src/content.config.ts) и
// карточку страницы src/content/dni-shablon (src/lib/den-obshchee.mjs). Имена и смысл полей — src/data/forma-dnya.json,
// что обязательно с февраля — docs/standart-dnya.md (Р660). Здесь — только типы; полнота — src/lib/standart-dnya.mjs.
// База источника и картинки — закрытый список: российские и белорусские да (Р469, Р136);
// Википедии, Викисклада, Викитеки в нём нет и не будет (Р90).
import { z } from 'astro/zod';

export const BAZY = ['goskatalog', 'shm_catalog', 'rusmuseum', 'tretyakov', 'ar_culture', 'pastvu', 'rusneb', 'prlib',
  'rsl', 'nlr', 'shpl', 'pamyat-naroda', 'podvig-naroda', 'fips', 'muzej-rf', 'muzej-by', 'arhiv-rf', 'arhiv-by',
  'biblioteka-rf', 'biblioteka-by', 'kniga', 'periodika', 'gosorgan-rf', 'gosorgan-by', 'nauka', 'sajt-organizacii'];
export const VIDY = ['foto', 'chertezh', 'karta', 'kartina', 'risunok', 'plakat', 'dokument', 'predmet', 'skhema',
  'kadr-filma'];
export const TYAZHELYE = ['vojna', 'kazn', 'golod', 'repressii', 'katastrofa', 'gibel'];
// «Нет» в полях, где ответ «нет» — тоже ответ (пп. 9, 20, 21, 29): поле есть, значение 'net'.
export const NET = 'net';
export const wiki = /wiki|википеди|викитек/i;

const str = z.string().min(1);
export const baza = z.enum(BAZY, { message: 'база — из закрытого списка BAZY (Википедия, Викисклад, Викитека запрещены, Р90)' });
export const nomer = z.string().regex(/^[a-z0-9-]+$/, 'номер — латиница, цифры, дефис');
export const god = z.union([z.number().int(), z.string().min(1)]);
export const data = z.string().regex(/^\d{1,4}-\d\d-\d\d$/, 'дата — ГГГГ-ММ-ДД');
const chisloIliNet = z.union([z.number().int(), z.literal(NET)]);

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
export const citata = z.object({
  kto: z.string().min(1, 'у цитаты нет автора'),
  gde: z.string().min(1, 'у цитаты нет места публикации'),
  tekst: z.string().min(1, 'у цитаты нет текста'),
  istochnik: nomer.optional(),
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
// Поля формы у картинки (vid … svyashchennoe); нет поля — как раньше.
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
};
// Поля формы у факта (fakty.id … fakty.otvet_edinstvennyj): у карточки страницы факт — удар блока fakty.
export const polyaFakta = {
  id: nomer.optional(),
  istochnik: nomer.optional(),
  dlya_voprosa: z.boolean().optional(),
  otvet: str.optional(),
  otvet_edinstvennyj: z.literal(true).optional(),
};
// Поля формы у дня (nomer_dnya … slovar) — без fakty и images: у карточки страницы они свои (удары, кадры).
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
  etiketka_oblozhki: z.array(str).min(1).max(3, 'этикетка обложки — 1–3 строки').optional(),
  slovar: z.array(z.string().regex(/^(lyudi|mesto|narod|tema):[a-z0-9-]+$/, 'slovar — «tip:id», tip: lyudi|mesto|narod|tema')
    .superRefine((id, ctx) => { if (!(id in slovar)) ctx.addIssue({ code: 'custom', message: `slovar: «${id}» нет в src/data/slovar.json` }); })).optional(),
});
