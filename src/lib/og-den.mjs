// Карточка пересылки дня без своей картинки (план переезда п.7, приёмка круга 2, сценарий 4, 18.10):
// страница дня ставит заявку сюда при сборке, интеграция og-den рисует PNG 1200×630 после сборки
// (src/integrations/og-den.mjs). Адрес карточки — один на обе стороны: og/den/<музей>/<ключ>.png.
import fs from 'node:fs';
const q = (globalThis.__rcOgDen ??= new Map());
export const ogDenPath = (museum, key) => `og/den/${museum}/${key}.png`;
export function queueOgDen(card) {
  q.set(ogDenPath(card.museum, card.key), card);
  return ogDenPath(card.museum, card.key);
}
export const ogDenQueue = () => q;

// Картинка пересылки — только JPG/PNG/GIF (19.10, Б9): WebP ВКонтакте в превью ссылки не показывает
// (принимает JPG, PNG, GIF), Telegram — через раз. WebP подменяется двойником .jpg/.png из public/
// (у кадров музеев он обычно есть: pogost-1280.webp → pogost-1280.jpg); двойника нет — undefined,
// страница берёт следующий вариант (обложку музея, карточку дня, og-default). SVG — тоже undefined.
export function ogRaster(src) {
  if (!src) return undefined;
  const [p, tail = ''] = src.split(/(?=[?#])/);
  if (/\.(?:jpe?g|png|gif)$/i.test(p)) return src;
  if (!/\.webp$/i.test(p) || /^https?:/i.test(p)) return undefined;
  for (const e of ['jpg', 'jpeg', 'png']) {
    const alt = p.replace(/\.webp$/i, `.${e}`);
    if (fs.existsSync(`public/${decodeURIComponent(alt.replace(/^\/(?:rc-site\/)?/, ''))}`)) return alt + tail;
  }
  return undefined;
}
