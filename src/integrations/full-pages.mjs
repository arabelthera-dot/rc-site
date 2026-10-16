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
  return {
    name: 'full-pages',
    hooks: {
      'astro:config:done': ({ config }) => { base = config.base.replace(/\/?$/, '/'); },
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
