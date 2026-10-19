// Карточка пересылки дня (план переезда п.7, приёмка круга 2, сценарий 4, 18.10): у дня без своей картинки
// og:image был общий (<музей>_index.jpg или og-default.jpg) — в Telegram/ВК все дни музея выглядели одинаково.
// Теперь при сборке рисуется своя карточка 1200×630: знак и «Русская цивилизация», дата, название дня,
// полное имя музея — в палитре сайта (--ink, --gold, --gold-l, --txt из museum.css; фон ровный — PNG в 32 цвета ≈23 КБ), шрифт PT Serif
// (src/assets/og-fonts, OFL). Бесплатно: sharp (уже стоит с Astro), текст — Pango по своему файлу шрифта.
// Заявки ставит страница дня (src/lib/og-den.mjs): только готовый день без своего кадра (images[0]).
// После fullPages: у полной старой страницы своя og:image остаётся; общая (обложка музея, og-default) —
// меняется на карточку; своя og:image есть — карточка не рисуется. Кэш между сборками —
// node_modules/.cache/rc-og-den (ключ — хеш текста карточки и версии рисунка).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ogDenQueue } from '../lib/og-den.mjs';

const W = 1200, H = 630, PAD = 80, TW = W - 2 * PAD;
const C = { ink: '#060d18', gold: '#c9a84c', goldL: '#e2c878', txt: '#c6d8e8' };
const FONTS = 'src/assets/og-fonts';
const REG = `${FONTS}/PTSerif-Regular.ttf`, BOLD = `${FONTS}/PTSerif-Bold.ttf`;
const CACHE = 'node_modules/.cache/rc-og-den';
const VERSION = '1';
// Общие картинки пересылки — их карточка дня заменяет; всё прочее в og:image — своя картинка страницы.
const GENERIC = /\/og\/(?:[a-z0-9-]+_(?:index|calendar)|og-default|index)\.(?:jpe?g|png)(?:[?#][^"']*)?$/i;
// Память (18.10): пробную сборку всех заявок дважды убил лимит 2 ГБ песочницы во время rc-og-den. Сам рендер
// дешёвый (400 карточек: пик 121 МБ по одной, 152 МБ по четыре), но по одной 3909 карточек шли 138 с из 158 —
// всё это время Astro держит ~690 МБ, и любой соседний процесс (ffmpeg) добивал лимит именно здесь.
// Теперь по 4 всегда (×4 быстрее, +30 МБ), кэш libvips выключен, один поток libvips на карточку.
const PAR = Math.max(1, Number(process.env.RC_OG_PAR) || 4);

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function text(str, { file, size, color, width = TW, spacing = 0 }) {
  const markup = `<span foreground="${color}"${spacing ? ` letter_spacing="${spacing * 1024}"` : ''}>${esc(str)}</span>`;
  const { data, info } = await sharp({ text: { text: markup, font: `PT Serif ${size}px`, fontfile: file, width, rgba: true, dpi: 72, wrap: 'word', spacing: Math.round(size * 0.18) } })
    .png().toBuffer({ resolveWithObject: true });
  return { input: data, w: info.width, h: info.height };
}

// Постоянная часть (фон, рамка, знак, «Русская цивилизация») рисуется один раз за сборку.
let plate; // Promise: при PAR>1 общая плашка рисуется ровно один раз
async function platePng() {
  const sign = await sharp('public/icon-192.png').resize(84, 84).png().toBuffer();
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${C.ink}"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${C.gold}" stroke-opacity=".55" stroke-width="2"/>
    <rect x="${PAD}" y="${H - 168}" width="120" height="3" fill="${C.gold}"/>
  </svg>`;
  const brand = await text('РУССКАЯ ЦИВИЛИЗАЦИЯ', { file: BOLD, size: 26, color: C.gold, width: TW - 110, spacing: 3 });
  return sharp(Buffer.from(bg)).composite([
    { input: sign, left: PAD, top: 70 },
    { input: brand.input, left: PAD + 110, top: 116 - Math.round(brand.h / 2) },
  ]).raw().toBuffer();
}
async function render({ date, title, museumTitle }) {
  const base = await (plate ??= platePng());
  const when = await text(date, { file: REG, size: 38, color: C.goldL });
  // Название дня — самым крупным кеглем, при котором влезает над чертой и именем музея.
  let name;
  for (const size of [68, 60, 52, 46, 40, 34]) {
    name = await text(title, { file: BOLD, size, color: '#f4ecd8' });
    if (name.h <= 190) break; // до черты над именем музея (y 462)
  }
  const mus = await text(museumTitle, { file: REG, size: 30, color: C.txt });
  const whenY = 196;
  return sharp(base, { raw: { width: W, height: H, channels: 4 } }).composite([
    { input: when.input, left: PAD, top: whenY },
    { input: name.input, left: PAD, top: whenY + when.h + 22 },
    { input: mus.input, left: PAD, top: H - 140 },
  ]).removeAlpha().png({ palette: true, colours: 32, effort: 1, dither: 0 }).toBuffer();
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) await fn(items[i++]); }));
}

export default function ogDen() {
  let site, base;
  return {
    name: 'rc-og-den',
    hooks: {
      'astro:config:done': ({ config }) => { site = config.site; base = config.base.replace(/\/?$/, '/'); },
      'astro:build:done': async ({ dir, logger }) => {
        if (!site) return;
        const root = fileURLToPath(dir);
        const t0 = Date.now();
        const jobs = [];
        let own = 0;
        for (const [rel, card] of ogDenQueue()) {
          const html = path.join(root, 'muzei', card.museum, 'den', card.key, 'index.html');
          if (!fs.existsSync(html)) continue;
          const src = fs.readFileSync(html, 'utf8');
          const abs = new URL(`${base}${rel}`, site).href;
          // Мета-тег в любом порядке атрибутов (у старых страниц бывает content раньше property).
          const metaRe = (n) => new RegExp(`<meta\\b[^>]*\\b(?:property|name)=["']${n}["'][^>]*>\\s*`, 'gi');
          const og = /content=["']([^"']*)["']/i.exec(src.match(metaRe('og:image'))?.[0] ?? '')?.[1];
          // Своя картинка у полной старой страницы — не трогаем и карточку не рисуем.
          if (og && og !== abs && !GENERIC.test(og)) { own++; continue; }
          // Старые og:image, twitter:image и размеры снимаются, свои четыре тега — перед </head>.
          const out = ['og:image', 'twitter:image', 'og:image:width', 'og:image:height', 'og:image:type']
            .reduce((h, n) => h.replace(metaRe(n), ''), src)
            .replace(/<\/head>/i, `<meta property="og:image" content="${abs}" />\n<meta property="og:image:width" content="${W}" />\n`
              + `<meta property="og:image:height" content="${H}" />\n<meta name="twitter:image" content="${abs}" />\n</head>`);
          if (out !== src) fs.writeFileSync(html, out);
          jobs.push({ rel, card });
        }
        fs.mkdirSync(CACHE, { recursive: true });
        let drawn = 0, bytes = 0;
        const vips = { cache: sharp.cache(), threads: sharp.concurrency() };
        sharp.cache(false); sharp.concurrency(1);
        await pool(jobs, PAR, async ({ rel, card }) => {
          const hash = crypto.createHash('sha1').update(JSON.stringify([VERSION, card.date, card.title, card.museumTitle])).digest('hex');
          const cached = path.join(CACHE, `${hash}.png`);
          if (!fs.existsSync(cached)) { fs.writeFileSync(cached, await render(card)); drawn++; }
          const out = path.join(root, rel);
          fs.mkdirSync(path.dirname(out), { recursive: true });
          fs.copyFileSync(cached, out);
          bytes += fs.statSync(out).size;
        });
        plate = undefined; // плашка не держится после хука
        sharp.cache(vips.cache.memory ? { memory: vips.cache.memory.max, files: vips.cache.files.max, items: vips.cache.items.max } : true);
        sharp.concurrency(vips.threads); // kartinki идёт следом со своими настройками
        // Предупреждение (не роняет сборку, 19.10): страницы музеев, у которых пересылка всё ещё общей
        // картинкой (og-default / og/index) или SVG — Telegram/ВК покажут одно и то же или ничего. По музеям.
        const common = {};
        const muz = path.join(root, 'muzei');
        (function walk(d) {
          for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) { walk(p); continue; }
            if (e.name !== 'index.html') continue;
            const h = fs.readFileSync(p, 'utf8');
            if (/http-equiv=["']refresh|name=["']robots["'][^>]*noindex/i.test(h)) continue;
            const og = /<meta\b[^>]*property=["']og:image["'][^>]*>/i.exec(h)?.[0] ?? '';
            if (/\/og\/(?:og-default|index)\.jpg|\.svg["']/i.test(og)) { const m = path.relative(muz, p).split(path.sep)[0]; common[m] = (common[m] || 0) + 1; }
          }
        })(muz);
        const nCommon = Object.values(common).reduce((a, b) => a + b, 0);
        if (nCommon) logger.warn(`og:image общая или SVG у ${nCommon} стр. музеев: ${Object.entries(common).map(([m, n]) => `${m} ${n}`).join(', ')}`);
        logger.info(`карточки пересылки дня: ${jobs.length} (нарисовано заново ${drawn}, из кэша ${jobs.length - drawn}), своя картинка у старой страницы — ${own}; ${(bytes / 1048576).toFixed(1)} МБ за ${((Date.now() - t0) / 1000).toFixed(1)} с`);
      },
    },
  };
}
