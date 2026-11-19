// Карточка пересылки дня без своей картинки (план переезда п.7, приёмка круга 2, сценарий 4, 18.10):
// страница дня ставит заявку сюда при сборке, интеграция og-den рисует PNG 1200×630 после сборки
// (src/integrations/og-den.mjs). Адрес карточки — один на обе стороны: og/den/<музей>/<ключ>.png.
import fs from 'node:fs';
import sharp from 'sharp';
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

// Мелкая картинка пересылки (20.10, Б9): Telegram и ВК кадр меньше 600×315 показывают крошечной миниатюрой
// или не показывают. Размер — по файлу в public/ (sharp читает только заголовок); файла нет — false,
// остаток ловит проход og-den после сборки (запасная картинка музея или сайта, src/integrations/og-den.mjs).
export const OG_MIN_W = 600, OG_MIN_H = 315;
const dimsCache = new Map();
export async function ogSmall(src) {
  if (!src || /^https?:/i.test(src)) return false;
  const file = `public/${decodeURIComponent(src.split(/[?#]/)[0].replace(/^\/(?:rc-site\/)?/, ''))}`;
  if (!dimsCache.has(file)) dimsCache.set(file, fs.existsSync(file) ? sharp(file).metadata().then((m) => [m.width, m.height], () => null) : Promise.resolve(null));
  const d = await dimsCache.get(file);
  return !!d && (d[0] < OG_MIN_W || d[1] < OG_MIN_H);
}
