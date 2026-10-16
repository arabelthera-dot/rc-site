// Переадресация старых адресов: плоский файл ровно по старому пути (…/day-01jan-x.html),
// meta refresh + canonical + ссылка — как jekyll-redirect-from у GitHub Pages.
// Встроенный redirects Astro кладёт папку «x.html/index.html» — лишний скачок на Pages.
// Опись — src/data/redirects.json (scripts/redirects.mjs). Цель, которой нет в сборке, — ошибка.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default function legacyRedirects() {
  let base = '/';
  return {
    name: 'legacy-redirects',
    hooks: {
      'astro:config:done': ({ config }) => { base = config.base.replace(/\/?$/, '/'); },
      'astro:build:done': ({ dir }) => {
        const root = fileURLToPath(dir);
        const map = JSON.parse(fs.readFileSync('src/data/redirects.json', 'utf8'));
        const bad = [];
        for (const [from, to] of Object.entries(map)) {
          if (!fs.existsSync(path.join(root, to, 'index.html'))) { bad.push(`${from} → ${to}`); continue; }
          const file = path.join(root, from);
          if (fs.existsSync(file)) { bad.push(`${from} — занят страницей нового сайта`); continue; }
          const href = base + to.replace(/^\//, '');
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Страница переехала</title>`
            + `<link rel="canonical" href="${href}"><meta name="robots" content="noindex">`
            + `<meta http-equiv="refresh" content="0; url=${href}"><p><a href="${href}">Страница переехала — перейти</a></p></html>\n`);
        }
        if (bad.length) throw new Error(`переадресация старых адресов, цели нет:\n${bad.join('\n')}`);
        console.log(`legacy-redirects: ${Object.keys(map).length} старых адресов`);
      },
    },
  };
}
