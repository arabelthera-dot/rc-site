// Потолок длины перевода для узких мест (п. 162): хук и заголовок дня, подписи, кнопки игр. Перевод длиннее русского
// больше допуска — не ошибка и не стоп: машина перевода (scripts/perevod-dnya.mjs) печатает «длинно: …» в своём выводе,
// он попадает в заявку avto/perevod-…; нового сторожа в CI нет. Длина — в знаках (графемах, Intl.Segmenter).
// Допуск +30 %, для языков, которые растут сильнее (de, fr, es, pt, hi), и для коротких строк до 20 знаков — +50 %.
// Как в мире: W3C «Text size in translation» — короткие строки растут сильнее длинных
// (https://www.w3.org/International/articles/article-text-size), ограничение длины строки у Weblate — флаг max-length
// (https://docs.weblate.org/en/latest/admin/checks.html#maximum-length-of-translation).
const UZKIE = [
  /(^|\.)lead\.(hook|h1)$/,
  /(^|\.)igra\.(zagolovok|kicker)$/,
  /(^|\.)podpis(_ru)?$/,
  /(^|\.)daynav\.\d+\.label$/,
  /(^|\.)(varianty|podpisi)\.\d+\.tekst$/,
  /(^|\.)nazvanie$/,
  /(^|\.)knopka(_ru)?$/,
  /\.knopka$/,
];
const SILNO_RASTUT = new Set(['de', 'fr', 'es', 'pt', 'hi']);
const seg = new Intl.Segmenter('und', { granularity: 'grapheme' });
export const znakov = (t) => [...seg.segment(String(t))].length;

/** Узкое ли место у ключа (строки, где длинный перевод ломает вёрстку). */
export const uzkoe = (kluch) => UZKIE.some((r) => r.test(kluch));

/** Потолок в знаках для перевода русской строки ru на язык code. */
export function potolok(ru, code) {
  const n = znakov(ru);
  const dopusk = SILNO_RASTUT.has(code) || n <= 20 ? 0.5 : 0.3;
  return Math.ceil(n * (1 + dopusk));
}

/** Превышения в файле строк: [{ code, kluch, dlina, potolok }] — только узкие места. */
export function dlinnye(fayl) {
  const out = [];
  for (const [code, stroki] of Object.entries(fayl)) {
    if (code === 'ru' || code.startsWith('_') || !stroki || typeof stroki !== 'object') continue;
    for (const [kluch, t] of Object.entries(stroki)) {
      const ru = fayl.ru?.[kluch];
      if (ru == null || !uzkoe(kluch)) continue;
      const p = potolok(ru, code), dlina = znakov(t);
      if (dlina > p) out.push({ code, kluch, dlina, potolok: p });
    }
  }
  return out;
}
