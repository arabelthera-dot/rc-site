// Адрес дня = полная страница: у дня с готовой страницей старого сайта (src/data/full-pages, scripts/full-pages.mjs)
// muzei/<музей>/den/<ключ>/index.html — эта страница 1:1 вместо карточки. <base> на папку музея — относительные
// пути (картинки, ../../assets/, соседние day-*.html → переадресации) работают при любом base.
// Якоря href="#…" при <base> вели бы на папку музея — переписываются на собственный адрес страницы.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = 'src/data/full-pages';

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
              .replace(/(\bhref\s*=\s*["'])#/gi, `$1${self}#`);
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
