// Д5 (20.10.2026): разметка schema.org каждой страницы сборки — синтаксис JSON-LD, обязательные поля по типу и url = canonical
// (правила — src/lib/razmetka.mjs). Стоит последней перед поиском: проверяет уже дописанные полные страницы и сжатый HTML.
// Только предупреждение (сводка по видам и три примера); красной — при RAZMETKA_STROGO=1. Откат — убрать из astro.config.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proverkaRazmetki, canonicalIz } from '../lib/razmetka.mjs';

function* stranicy(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* stranicy(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

export default function razmetka() {
  return {
    name: 'rc-razmetka',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const vidy = new Map();
        let vsego = 0, plohih = 0;
        for (const f of stranicy(root)) {
          const html = fs.readFileSync(f, 'utf8');
          // переадресации старых адресов (meta refresh) — не страницы
          if (/http-equiv=["']?refresh/i.test(html)) continue;
          vsego++;
          const bedy = proverkaRazmetki(html, canonicalIz(html));
          if (bedy.length) plohih++;
          for (const b of bedy) {
            const vid = b.replace(/«[^»]*»|https?:\/\/\S+|\(\d+\)/g, '…');
            const v = vidy.get(vid) ?? { n: 0, gde: [] };
            v.n++; if (v.gde.length < 3) v.gde.push(path.relative(root, f));
            vidy.set(vid, v);
          }
        }
        if (!plohih) return logger.info(`разметка schema.org: ${vsego} страниц, ошибок 0`);
        const msg = `разметка schema.org: ${plohih} из ${vsego} страниц с замечаниями`;
        logger.warn(msg);
        for (const [vid, v] of [...vidy].sort((a, b) => b[1].n - a[1].n)) logger.warn(`  ${v.n} × ${vid} — напр. ${v.gde.join(', ')}`);
        if (process.env.RAZMETKA_STROGO === '1') throw new Error(msg);
      },
    },
  };
}
