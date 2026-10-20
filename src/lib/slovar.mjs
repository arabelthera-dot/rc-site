// Словарь связей дня (Р37, Сергей 20.10): src/data/slovar.json — id «tip:slug» → { tip, nazvanie, kratko }.
// Поле slovar карточки дня ссылается на эти id (проверка — схема src/content.config.ts). Страницы — /slovar/,
// /slovar/<tip>/<slug>/; на странице дня — строка связей (src/components/den/DenSlovar.astro).
import slovar from '../data/slovar.json' with { type: 'json' };

// Разделы — в этом порядке на /slovar/ и в строке дня.
export const TIPY = [
  { tip: 'lyudi', nazvanie: 'Люди' },
  { tip: 'mesto', nazvanie: 'Места' },
  { tip: 'narod', nazvanie: 'Народы' },
  { tip: 'tema', nazvanie: 'Темы' },
];

// Запись словаря с адресом; tip в записи и приставка id расходятся — сборка падает.
export const zapisi = Object.entries(slovar).map(([id, z]) => {
  const [tip, slug] = id.split(':');
  if (tip !== z.tip) throw new Error(`src/data/slovar.json: у «${id}» tip «${z.tip}», а приставка «${tip}»`);
  if (!TIPY.some((t) => t.tip === tip)) throw new Error(`src/data/slovar.json: «${id}» — неизвестный раздел ${tip}`);
  return { id, tip, slug, ...z };
});

export const zapis = (id) => zapisi.find((z) => z.id === id);
export const adres = (base, id) => { const [tip, slug] = id.split(':'); return `${base}slovar/${tip}/${slug}/`; };
