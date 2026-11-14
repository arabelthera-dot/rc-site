// Словарь связей дня (Р37, Сергей 20.10): src/data/slovar/ — id «tip:slug» → { tip, nazvanie, pol (у людей: m | zh), kratko }.
// Поле slovar карточки дня ссылается на эти id (проверка — схема src/content.config.ts). Страницы — /slovar/,
// /slovar/<tip>/<slug>/; на странице дня — строка связей (src/components/den/DenSlovar.astro).
import slovar from './slovar-dannye.mjs';

// Разделы — в этом порядке на /slovar/ и в строке дня.
export const TIPY = [
  { tip: 'lyudi', nazvanie: 'Люди' },
  { tip: 'mesto', nazvanie: 'Места' },
  { tip: 'narod', nazvanie: 'Народы' },
  { tip: 'tema', nazvanie: 'Темы' },
];

// Роли связи дня со словарём (п. 31, Р664): закрытый список в ключе _roli; поле дня slovar_roli —
// docs/spravochniki-standart.md. Ключи с «_» — не записи словаря.
export const ROLI = slovar._roli;

// Запись словаря с адресом; tip в записи и приставка id расходятся — сборка падает.
export const zapisi = Object.entries(slovar).filter(([id]) => !id.startsWith('_')).map(([id, z]) => {
  const [tip, slug] = id.split(':');
  if (tip !== z.tip) throw new Error(`src/data/slovar/: у «${id}» tip «${z.tip}», а приставка «${tip}»`);
  if (!TIPY.some((t) => t.tip === tip)) throw new Error(`src/data/slovar/: «${id}» — неизвестный раздел ${tip}`);
  return { id, tip, slug, ...z };
});

export const zapis = (id) => zapisi.find((z) => z.id === id);
export const adres = (base, id) => { const [tip, slug] = id.split(':'); return `${base}slovar/${tip}/${slug}/`; };

// Название места на дату (пункты 32, 33): одно обозначение mesto:slug на все годы, имя — из nazvaniya по дате.
// data — «ГГГГ» или «ГГГГ-ММ-ДД»; s входит, po нет (Петроград s 1914-08-31 po 1924-01-26). Нет nazvaniya — nazvanie.
export const nazvanieNa = (id, data) => {
  const z = zapis(id);
  if (!z) return undefined;
  const d = String(data);
  const n = (z.nazvaniya ?? []).find((x) => (!x.s || x.s.slice(0, d.length) <= d) && (!x.po || d < x.po.slice(0, d.length)));
  return n?.nazvanie ?? z.nazvanie;
};
