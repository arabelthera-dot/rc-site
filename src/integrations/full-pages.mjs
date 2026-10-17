// Адрес дня = полная страница: у дня с готовой страницей старого сайта (src/data/full-pages, scripts/full-pages.mjs)
// muzei/<музей>/den/<ключ>/index.html — эта страница 1:1 вместо карточки. <base> на папку музея — относительные
// пути (картинки, ../../assets/, соседние day-*.html → переадресации) работают при любом base.
// Якоря href="#…" при <base> вели бы на папку музея — переписываются на собственный адрес страницы.
// Относительные href/src/poster/srcset/url() — в абсолютные от папки музея: <base> видит браузер, но не проверка
// ссылок (lychee резолвит от адреса файла — 757 ложных «нет файла», rc-site#16); <base> остаётся для скриптов.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = 'src/data/full-pages';
const SKIP = /^(?:[a-z][a-z0-9+.-]*:|\/|#|\$|\{)/i; // схема, корень, якорь, шаблон

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
      'astro:build:done': ({ dir }) => {
        if (!fs.existsSync(SRC)) return;
        const root = fileURLToPath(dir);
        const bad = [];
        let n = 0;
        for (const museum of fs.readdirSync(SRC).sort()) {
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
            fs.writeFileSync(out, html);
            n++;
          }
        }
        if (bad.length) throw new Error(`полные страницы дней:\n${bad.join('\n')}`);
        console.log(`full-pages: ${n} дней — полная страница`);
      },
    },
  };
}
