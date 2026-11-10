// Content-Security-Policy в <meta> (решение Сергея Р64, 21.10.2026). ВЫКЛЮЧЕНО: ставится только при
// PUBLIC_CSP=1 (переменная сборки, как PUBLIC_PODDERZHKA); откат — убрать переменную.
// Внешние хосты — только из RAZRESHENO (scripts/vneshnie-hosty.mjs): Метрика, VK Видео, Rutube; не шире.
// 'unsafe-inline' в script-src/style-src — вынужденно: инлайн-скрипты (slabovidHeadJs, обработчик a.oshibka
// в Base.astro, инлайн полных страниц src/data/full-pages) и инлайн-стили. frame-ancestors в meta не работает —
// его ставит nginx.
import { createHash } from 'node:crypto';

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

// Строгая политика (п.501, Р745) — без 'unsafe-inline' в script-src и style-src, пока только наблюдение:
// заголовок Content-Security-Policy-Report-Only ставит nginx (deploy/bezopasnost/nginx-csp-limit.conf — строка
// оттуда сверяется с этой тестом tests/csp-strogiy.mjs). В <meta> Report-Only не работает (спецификация CSP3),
// поэтому только заголовок. Нарушения — в /s/csp (204, журнал nginx). Неделя без нарушений — тогда настоящий запрет.
// Разрешён по хешу один инлайн — RAMKA_JS (scripts/ramka-zerkala.mjs), остальные инлайны шаблонов покажет журнал.
export const RAMKA_JS = "if(top!==self&&/\\.github\\.io$/.test(location.hostname)){document.documentElement.style.display='none';try{top.location=self.location.href}catch(e){}}";
export const ramkaHash = () => `'sha256-${createHash('sha256').update(RAMKA_JS).digest('base64')}'`;
export const CSP_STROGIY = () => [
  ["script-src 'self'", ramkaHash(), ...METRIKA].join(' '),
  "style-src 'self'",
  ...CSP.split('; ').filter((d) => !/^(script-src|style-src|upgrade-insecure-requests)\b/.test(d)),
  'report-uri /s/csp',
].join('; ');

export const cspMeta = () => `<meta http-equiv="Content-Security-Policy" content="${CSP}">`;
