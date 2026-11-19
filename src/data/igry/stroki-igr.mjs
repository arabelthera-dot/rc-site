// Тексты игр в файле переводов (п. 164 стандарта, Р661, Р662; переводы — только машиной, на все языки, Р603).
// Игра дня — поле igra карточки (src/lib/igry-mehaniki.ts). Текст для посетителя — любая строка с буквой
// (заголовок, правило, «Как играть», подписи и сообщения в dannye); технические строки (mehanika, kod, cvet, числа)
// букв кириллицы не содержат и в перевод не идут. Ключ строки — <muzey>.<ММ-ДД>.igra.<путь в igra через точку>,
// номер в списке — тоже часть пути: izobreteniya.01-08.igra.kak_igrat.shagi.0.
// Файл переводов игры — src/data/igry/stroki/<muzey>-<ММ-ДД>.json, устроен как src/data/stroki.json:
// { "_": пояснение, "ru": { ключ: текст }, "<код языка>": { ключ: текст } }. Нет строки у языка — берётся русская.
const BUKVA = /[А-Яа-яЁё]/;

/** Все тексты игры для перевода: { ключ: русский текст }. */
export function vynutStroki(igra, muzey, den) {
  const out = {};
  const obhod = (v, put) => {
    if (typeof v === 'string') { if (BUKVA.test(v)) out[`${muzey}.${den}.igra.${put}`] = v; return; }
    if (Array.isArray(v)) return v.forEach((x, i) => obhod(x, `${put}.${i}`));
    if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) obhod(x, put ? `${put}.${k}` : k);
  };
  obhod(igra, '');
  return out;
}

/** Игра на языке code: каждый текст заменён строкой из файла переводов; нет перевода — остаётся русский. */
export function igraNaYazyke(igra, muzey, den, fayl, code) {
  const yaz = fayl[code] ?? {};
  const zamena = (v, put) => {
    if (typeof v === 'string') return yaz[`${muzey}.${den}.igra.${put}`] ?? v;
    if (Array.isArray(v)) return v.map((x, i) => zamena(x, `${put}.${i}`));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, zamena(x, put ? `${put}.${k}` : k)]));
    return v;
  };
  return zamena(igra, '');
}

/** Файл переводов игры: русские строки; прочие языки дописывает машина перевода. */
export const faylPerevodov = (igra, muzey, den) => ({
  _: `Тексты игры ${muzey} ${den} для перевода (п. 164). Ключи — src/data/igry/stroki-igr.mjs. Языки, кроме ru, пишет только машина перевода (Р603).`,
  ru: vynutStroki(igra, muzey, den),
});
