// Шрифты дня — файлом, не инлайном (вес сборки, 20.10): <style data-rc-fonts> с @font-face семейств страницы
// (src/lib/shrifty.mjs faceCss; ставят den/[key].astro и full-pages.mjs) повторялся на ~4400 страницах —
// 4,6–48 КБ на страницу, ~32 МБ сборки при лимите хостинга 1 ГБ. Одинаковые наборы — один файл
// assets/fonts/rc-<md5>.css (наборов — единицы), на странице — <link> на том же месте. Вид тот же: те же @font-face,
// font-display как в fonts.css; <link> в <head> блокирует отрисовку так же, как <style>, файл кэшируется между днями.
// Откат без правки кода: RC_SHRIFTY_INLAYN=1 — инлайн как прежде.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const STYLE = /<style data-rc-fonts>([\s\S]*?)<\/style>/g;

export default function shriftyFajlom() {
  let base = '/';
  return {
    name: 'rc-shrifty-fajlom',
    hooks: {
      'astro:config:done': ({ config }) => { base = config.base.replace(/\/?$/, '/'); },
      'astro:build:done': async ({ dir, logger }) => {
        if (process.env.RC_SHRIFTY_INLAYN === '1') return;
        const root = fileURLToPath(dir);
        const out = path.join(root, 'assets', 'fonts');
        const files = new Map();
        let pages = 0, saved = 0;
        const walk = (d) => {
          for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const f = path.join(d, e.name);
            if (e.isDirectory()) { walk(f); continue; }
            if (!e.name.endsWith('.html')) continue;
            const html = fs.readFileSync(f, 'utf8');
            if (!html.includes('<style data-rc-fonts>')) continue;
            const next = html.replace(STYLE, (m, css) => {
              const name = `rc-${crypto.createHash('md5').update(css).digest('hex').slice(0, 10)}.css`;
              if (!files.has(name)) files.set(name, css);
              const link = `<link rel="stylesheet" href="${base}assets/fonts/${name}" data-rc-fonts>`;
              saved += Buffer.byteLength(m) - Buffer.byteLength(link);
              return link;
            });
            fs.writeFileSync(f, next);
            pages++;
          }
        };
        walk(root);
        fs.mkdirSync(out, { recursive: true });
        for (const [name, css] of files) fs.writeFileSync(path.join(out, name), css);
        logger.info(`шрифты файлом: ${pages} страниц, ${files.size} наборов, −${(saved / 1e6).toFixed(1)} МБ`);
      },
    },
  };
}
