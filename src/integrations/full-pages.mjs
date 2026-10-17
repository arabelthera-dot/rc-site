// Адрес дня = полная страница: у дня с готовой страницей старого сайта (src/data/full-pages, scripts/full-pages.mjs)
// muzei/<музей>/den/<ключ>/index.html — эта страница 1:1 вместо карточки. <base> на папку музея — относительные
// пути (картинки, ../../assets/, соседние day-*.html → переадресации) работают при любом base.
// Якоря href="#…" при <base> вели бы на папку музея — переписываются на собственный адрес страницы.
// Относительные href/src/poster/srcset/url() — в абсолютные от папки музея: <base> видит браузер, но не проверка
// ссылок (lychee резолвит от адреса файла — 757 ложных «нет файла», rc-site#16); <base> остаётся для скриптов.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { sitebarHtml, sitebarAssets, whenOfKey } from '../lib/sitebar.mjs';

const SRC = 'src/data/full-pages';
const MUSEUMS = Object.fromEntries(JSON.parse(fs.readFileSync('src/data/museums.json', 'utf8')).museums
  .map((m) => [m.slug, m.title_ru]));
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&');

// Стандарт полосы (Сергей 17.10): у каждой страницы дня, календаря и главной музея — ссылка на главную сайта
// и на главную своего музея с подписью ровно title_ru (у главной музея — само название, без ссылки).
// Нарушил — сайт не собирается.
function checkSitebars(root, base) {
  const bad = [];
  const dir = path.join(root, 'muzei');
  for (const slug of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) {
    const title = MUSEUMS[slug];
    if (!title) continue;
    const pages = [['', false], ['calendar', true]];
    const den = path.join(dir, slug, 'den');
    for (const k of fs.existsSync(den) ? fs.readdirSync(den).sort() : []) pages.push([`den/${k}`, true]);
    for (const [rel, linked] of pages) {
      const f = path.join(dir, slug, rel, 'index.html');
      if (!fs.existsSync(f)) continue;
      const bar = /<nav class="rc-sitebar"[^>]*>([\s\S]*?)<\/nav>/.exec(fs.readFileSync(f, 'utf8'))?.[1];
      const name = `muzei/${slug}/${rel ? rel + '/' : ''}`;
      if (!bar) { bad.push(`${name} — нет верхней полосы`); continue; }
      if (!new RegExp(`<a class="rc-sb-link rc-sb-home" href="${base}">Русская цивилизация</a>`).test(bar))
        bad.push(`${name} — нет ссылки на главную сайта`);
      const m = linked
        ? new RegExp(`<a class="rc-sb-link rc-sb-museum" href="${base}muzei/${slug}/"[^>]*>([^<]*)</a>`).exec(bar)
        : /<span class="rc-sb-link rc-sb-museum"[^>]*>([^<]*)<\/span>/.exec(bar);
      if (!m) bad.push(`${name} — нет ${linked ? 'ссылки на главную музея' : 'названия музея'}`);
      else if (decode(m[1]) !== title) bad.push(`${name} — название музея «${decode(m[1])}» вместо «${title}»`);
    }
  }
  if (bad.length) throw new Error(`верхняя полоса навигации (${bad.length}):\n${bad.join('\n')}`);
  return bad.length;
}

const SKIP = /^(?:[a-z][a-z0-9+.-]*:|\/|#|\$|\{)/i; // схема, корень, якорь, шаблон

// Мировой стандарт против сдвига вёрстки (замер glazami «картинки с размерами», 17.10): у каждого <img> старой
// страницы — width/height по самому файлу из сборки; есть одно из двух — второе по пропорции файла.
// Внешний адрес или файла нет — картинка остаётся как была. Метка data-rc-razmer: в старых стилях бывает
// img{width:100%} без height:auto — rc-sitebar.css даёт таким height:auto с нулевой силой (:where), свой height автора выигрывает.
const sizes = new Map();
async function sizeOf(file) {
  if (!sizes.has(file)) sizes.set(file, await sharp(file).metadata().then((m) => m.width && m.height ? m : null).catch(() => null));
  return sizes.get(file);
}
async function imgSizes(html, root, base) {
  const tags = [...new Set(html.match(/<img\b[^>]*>/gi) || [])];
  let n = 0;
  for (const tag of tags) {
    const w = /\swidth\s*=/i.test(tag), h = /\sheight\s*=/i.test(tag);
    if (w && h) continue;
    const src = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!src || !src.startsWith(base) || src.startsWith('//')) continue;
    const file = path.join(root, decodeURIComponent(src.slice(base.length).split(/[?#]/)[0]));
    const m = fs.existsSync(file) && await sizeOf(file);
    if (!m) continue;
    let add = '';
    if (!w && !h) add = ` width="${m.width}" height="${m.height}"`;
    else if (!w) { const hv = parseFloat(/\sheight\s*=\s*["']?([\d.]+)/i.exec(tag)?.[1]); if (hv) add = ` width="${Math.round(hv * m.width / m.height)}"`; }
    else { const wv = parseFloat(/\swidth\s*=\s*["']?([\d.]+)/i.exec(tag)?.[1]); if (wv) add = ` height="${Math.round(wv * m.height / m.width)}"`; }
    if (!add) continue;
    html = html.split(tag).join(tag.replace(/^<img\b/i, `<img${add} data-rc-razmer`));
    n++;
  }
  return html;
}

// Соседние дни (замер glazami «вчера/завтра», 17.10): старая страница дня заменяет карточку целиком, и ссылки
// «← предыдущий / следующий →» карточки (den/[key].astro) пропадали. Соседи — ближайшие дни музея в сборке.
function sosediHtml(base, museum, keys, key) {
  const i = keys.indexOf(key);
  if (!keys[i - 1] && !keys[i + 1]) return ''; // единственный день музея — соседей нет
  const link = (k, rel, text) => k ? `<a class="rc-sosed rc-sosed-${rel}" rel="${rel}" href="${base}muzei/${museum}/den/${k}/">${text}</a>` : '<span></span>';
  return `<nav class="rc-sosedi" aria-label="Соседние дни">${link(keys[i - 1], 'prev', `← предыдущий день, ${whenOfKey(keys[i - 1] || '01-01')}`)}`
    + `${link(keys[i + 1], 'next', `следующий день, ${whenOfKey(keys[i + 1] || '01-01')} →`)}</nav>`;
}

function absolute(url, dirUrl) {
  const u = url.trim();
  if (!u || SKIP.test(u)) return url;
  return new URL(u, `http://x${dirUrl}`).href.slice('http://x'.length);
}

export default function fullPages() {
  let base = '/';
  let site = '';
  return {
    name: 'full-pages',
    hooks: {
      'astro:config:done': ({ config }) => { base = config.base.replace(/\/?$/, '/'); site = config.site ?? ''; },
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir);
        if (!fs.existsSync(SRC)) { checkSitebars(root, base); return; }
        const bad = [];
        let n = 0;
        for (const museum of fs.readdirSync(SRC).sort()) {
          const denDir = path.join(root, 'muzei', museum, 'den');
          const keys = fs.existsSync(denDir) ? fs.readdirSync(denDir).filter((k) => fs.existsSync(path.join(denDir, k, 'index.html'))).sort() : [];
          for (const f of fs.readdirSync(path.join(SRC, museum)).sort()) {
            const key = f.replace(/\.html$/, '');
            const self = `${base}muzei/${museum}/den/${key}/`;
            const out = path.join(root, 'muzei', museum, 'den', key, 'index.html');
            if (!fs.existsSync(out)) { bad.push(`${museum}/${key} — нет карточки дня`); continue; }
            let html = fs.readFileSync(path.join(SRC, museum, f), 'utf8');
            if (!/<head[^>]*>/i.test(html)) { bad.push(`${museum}/${key} — нет <head>`); continue; }
            // Превью-сборка (PUBLIC_NOINDEX=1, как в Base.astro): свой robots страницы заменяется на noindex.
            if (process.env.PUBLIC_NOINDEX === '1') html = html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '')
              .replace(/<head([^>]*)>/i, '<head$1>\n<meta name="robots" content="noindex">');
            html = html
              .replace(/<head([^>]*)>/i, `<head$1>\n<base href="${base}muzei/${museum}/">`)
              .replace(/(\bhref\s*=\s*["'])#/gi, `$1${self}#`)
              .replace(/(\s(?:href|src|poster)\s*=\s*)(["'])([^"']*)\2/gi,
                (m, a, q, u) => `${a}${q}${absolute(u, `${base}muzei/${museum}/`)}${q}`)
              .replace(/(\ssrcset\s*=\s*)(["'])([^"']*)\2/gi, (m, a, q, v) => `${a}${q}${v.split(',')
                .map((part) => part.replace(/^(\s*)(\S+)/, (x, sp, u) => sp + absolute(u, `${base}muzei/${museum}/`)))
                .join(',')}${q}`)
              .replace(/(\burl\(\s*)(['"]?)([^'")]+)\2(\s*\))/gi,
                (m, a, q, u, z) => `${a}${q}${absolute(u, `${base}muzei/${museum}/`)}${q}${z}`);
            // Нет своей карточки пересылки у старой страницы — кадр дня из карточки (images[0]), п.2 очереди 1, 17.10.
            const card = path.join('src/content/days', museum, `${key}.json`);
            const img = fs.existsSync(card) && JSON.parse(fs.readFileSync(card, 'utf8')).images?.[0];
            if (img && site && !/property=["']og:image["']/i.test(html)) {
              const abs = new URL(/^https?:/.test(img.src) ? img.src : `${base}${img.src.replace(/^\//, '')}`, site).href;
              html = html.replace(/<\/head>/i, `<meta property="og:image" content="${abs}" />\n<meta name="twitter:image" content="${abs}" />\n</head>`);
            }
            // Паспорт пересылки и поиска (17.10, scripts/check-og.mjs): чего нет у старой страницы — доливается
            // по карточке дня; карточка в Telegram/ВК — всегда крупная (summary_large_image), адрес — новый.
            if (site) {
              const url = new URL(self, site).href;
              const d = fs.existsSync(card) ? JSON.parse(fs.readFileSync(card, 'utf8')) : {};
              const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
              const add = [];
              html = html.replace(/<meta\s+name=["']twitter:card["'][^>]*>\s*/gi, '');
              add.push('<meta name="twitter:card" content="summary_large_image" />');
              html = html.replace(/<meta\s+property=["']og:url["'][^>]*>\s*/gi, '').replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');
              add.push(`<meta property="og:url" content="${url}" />`, `<link rel="canonical" href="${url}" />`);
              if (!/property=["']og:type["']/i.test(html)) add.push('<meta property="og:type" content="article" />');
              if (!/property=["']og:title["']/i.test(html) && d.title) add.push(`<meta property="og:title" content="${esc(d.title)}" />`);
              if (!/name=["']description["']/i.test(html) && d.hook) add.push(`<meta name="description" content="${esc(d.hook)}" />`);
              if (!/property=["']og:description["']/i.test(html) && d.hook) add.push(`<meta property="og:description" content="${esc(d.hook)}" />`);
              html = html.replace(/<\/head>/i, `${add.join('\n')}\n</head>`);
            }
            // Единая верхняя полоса (Сергей 17.10) — сразу после <body…>; старые крошки страницы не трогаем.
            html = html.replace(/<\/head>/i, `${sitebarAssets(base)}\n</head>`)
              .replace(/<body([^>]*)>/i, (b) => `${b}\n${sitebarHtml({ base, slug: museum, title: MUSEUMS[museum], here: whenOfKey(key) })}`);
            if (!/\srel=["'](?:prev|next)["']/i.test(html)) html = html.replace(/<\/body>/i, `${sosediHtml(base, museum, keys, key)}\n</body>`);
            html = await imgSizes(html, root, base);
            if (!MUSEUMS[museum]) { bad.push(`${museum}/${key} — музея нет в museums.json`); continue; }
            fs.writeFileSync(out, html);
            n++;
          }
        }
        if (bad.length) throw new Error(`полные страницы дней:\n${bad.join('\n')}`);
        checkSitebars(root, base);
        console.log(`full-pages: ${n} дней — полная страница; верхняя полоса проверена у всех страниц музеев`);
      },
    },
  };
}
