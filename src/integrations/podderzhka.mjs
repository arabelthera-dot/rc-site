// «Поддержать проект» — выключатель на этапе сборки (Р31, 20.10.2026; src/lib/podderzhka.mjs).
// При выключенном PUBLIC_PODDERZHKA вырезает блоки, сердечко, ссылки «Поддержать» и движок museum-support.js
// из готовых html (в первую очередь — полных страниц full-pages, шаблоны Astro их уже не выводят)
// и убирает сам файл assets/museum-support.js. PUBLIC_PODDERZHKA=1 — ничего не трогает (откат).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { podderzhkaVkl, vyrezatPodderzhku } from '../lib/podderzhka.mjs';

export default function podderzhka() {
  return {
    name: 'rc-podderzhka',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (podderzhkaVkl()) { logger.info('поддержка включена (PUBLIC_PODDERZHKA=1) — не трогаю'); return; }
        const root = fileURLToPath(dir);
        let stranic = 0, blokov = 0;
        const walk = (d) => {
          for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const f = path.join(d, e.name);
            if (e.isDirectory()) { walk(f); continue; }
            if (!e.name.endsWith('.html')) continue;
            const html = fs.readFileSync(f, 'utf8');
            if (!/Поддержать|support|id="heart"/.test(html)) continue;
            const r = vyrezatPodderzhku(html);
            if (r.html === html) continue;
            fs.writeFileSync(f, r.html);
            stranic++; blokov += r.blokov;
          }
        };
        walk(root);
        const js = path.join(root, 'assets', 'museum-support.js');
        if (fs.existsSync(js)) fs.rmSync(js);
        logger.info(`поддержка выключена: ${stranic} страниц, вырезано ${blokov} блоков/кнопок, museum-support.js убран`);
      },
    },
  };
}
