// Карточка пересылки дня без своей картинки (план переезда п.7, приёмка круга 2, сценарий 4, 18.10):
// страница дня ставит заявку сюда при сборке, интеграция og-den рисует PNG 1200×630 после сборки
// (src/integrations/og-den.mjs). Адрес карточки — один на обе стороны: og/den/<музей>/<ключ>.png.
const q = (globalThis.__rcOgDen ??= new Map());
export const ogDenPath = (museum, key) => `og/den/${museum}/${key}.png`;
export function queueOgDen(card) {
  q.set(ogDenPath(card.museum, card.key), card);
  return ogDenPath(card.museum, card.key);
}
export const ogDenQueue = () => q;
