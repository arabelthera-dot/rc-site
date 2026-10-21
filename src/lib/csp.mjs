// Content-Security-Policy в <meta> (решение Сергея Р64, 21.10.2026). ВЫКЛЮЧЕНО: ставится только при
// PUBLIC_CSP=1 (переменная сборки, как PUBLIC_PODDERZHKA); откат — убрать переменную.
// Внешние хосты — только из RAZRESHENO (scripts/vneshnie-hosty.mjs): Метрика, VK Видео, Rutube; не шире.
// 'unsafe-inline' в script-src/style-src — вынужденно: инлайн-скрипты (slabovidHeadJs, обработчик a.oshibka
// в Base.astro, инлайн полных страниц src/data/full-pages) и инлайн-стили. frame-ancestors в meta не работает —
// его ставит nginx.
export const cspVkl = (env = process.env) => env.PUBLIC_CSP === '1';

const w = (hs) => hs.flatMap((h) => [`https://${h}`, `https://*.${h}`]);
const METRIKA = w(['yandex.ru', 'yandex.com', 'yandex.net', 'yastatic.net']);
const VIDEO = w(['vk.com', 'vk.ru', 'vkvideo.ru', 'userapi.com', 'vkuser.net', 'mycdn.me', 'okcdn.ru', 'rutube.ru', 'rtbcdn.ru']);

export const CSP = [
  "default-src 'self'",
  ["script-src 'self' 'unsafe-inline'", ...METRIKA].join(' '),
  "style-src 'self' 'unsafe-inline'",
  ["img-src 'self' data: blob:", ...METRIKA, ...VIDEO].join(' '),
  ["media-src 'self' data: blob:", ...VIDEO].join(' '),
  ["frame-src 'self'", ...METRIKA, ...VIDEO].join(' '),
  ["connect-src 'self'", ...METRIKA].join(' '),
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

export const cspMeta = () => `<meta http-equiv="Content-Security-Policy" content="${CSP}">`;
