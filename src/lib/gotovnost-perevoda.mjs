// Готовность перевода дня (п. 147): машина перевода (scripts/perevod-dnya.mjs) пишет в файл дня
// src/data/perevod/<музей>-<ММ-ДД>.json раздел _gotovo: { "<код>": "ГГГГ-ММ-ДД" } — языки, на которые день
// переведён целиком и без устаревших строк, и дата перевода (docs/perevod-standart.md, п. 147).
// Страница дня без перевода на другом языке не показывается: ни пометки hreflang, ни адреса в getStaticPaths
// будущих языковых страниц дня — их отбирать через estPerevod(). Русский — всегда (язык оригинала).
import { poUmolchaniyu } from './yazyki.mjs';

const fayly = import.meta.glob('../data/perevod/*.json', { eager: true, import: 'default' });
const gotovo = Object.fromEntries(Object.entries(fayly).map(([put, f]) => [put.split('/').pop().replace(/\.json$/, ''), f?._gotovo ?? {}]));

/** Языки дня с датой перевода: { en: '2026-11-10', … }; русского в списке нет — он оригинал. */
export const yazykiDnya = (muzei, key) => gotovo[`${muzei}-${key}`] ?? {};

/** Есть ли день на языке code: русский — всегда, прочие — только с готовым переводом. */
export const estPerevod = (muzei, key, code) => code === poUmolchaniyu || code === 'x-default' || code in yazykiDnya(muzei, key);
