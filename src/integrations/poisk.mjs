// Поиск по сайту (pagefind, 19.10). ВЫКЛЮЧЕН по умолчанию: включает RC_POISK=1 (индекс dist/pagefind/,
// страница /poisk/ с полем и ссылка «Поиск» в верхней полосе — src/lib/sitebar.mjs, src/pages/poisk.astro).
// Индексируются только страницы музеев (muzei/<музей>/) и дней (muzei/<музей>/den/<ключ>/), кроме заглушек
// «День готовится» (своя noindex). Разметка в dist не меняется: метка data-pagefind-body ставится на <main>
// (нет <main> — на <body>) в копии HTML в памяти, файлы на диске те же. Идёт ПОСЛЕДНЕЙ, после minify.
// Адрес в индексе — без base (/rc-site/): pagefind сам добавляет путь, где лежит его бандл (иначе /rc-site/rc-site/).
// Ошибка pagefind — предупреждение, сборка не падает (поиск просто не появится).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const poiskOn = () => process.env.RC_POISK === '1';

const WANT = /^muzei\/[^/]+\/(?:den\/\d\d-\d\d\/)?index\.html$/;

export default function poisk() {
  return {
    name: 'rc-poisk',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (!poiskOn()) { logger.info('выключено (включить: RC_POISK=1)'); return; }
        const root = fileURLToPath(dir);
        const t0 = Date.now();
        try {
          const pagefind = await import('pagefind');
          const { index, errors } = await pagefind.createIndex({ forceLanguage: 'ru' });
          if (!index) throw new Error(errors.join('; '));
          const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
            e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
          const ownNoindex = process.env.PUBLIC_NOINDEX !== '1';
          let n = 0, skip = 0;
          for (const fp of walk(path.join(root, 'muzei'))) {
            const rel = path.relative(root, fp).split(path.sep).join('/');
            if (!WANT.test(rel)) continue;
            let html = fs.readFileSync(fp, 'utf8');
            // Заглушка дня — noindex; в превью-сборке (PUBLIC_NOINDEX=1) noindex у всех, там отличаем по тексту.
            if ((ownNoindex && /<meta name="robots" content="noindex"/.test(html)) || /День готовится/.test(html)) { skip++; continue; }
            html = /<main\b/.test(html) ? html.replace(/<main\b/, '<main data-pagefind-body') : html.replace(/<body\b/, '<body data-pagefind-body');
            const r = await index.addHTMLFile({ url: '/' + rel.replace(/index\.html$/, ''), content: html });
            if (r.errors?.length) logger.warn(`${rel}: ${r.errors.join('; ')}`); else n++;
          }
          const w = await index.writeFiles({ outputPath: path.join(root, 'pagefind') });
          if (w.errors?.length) throw new Error(w.errors.join('; '));
          await pagefind.close();
          logger.info(`индекс: ${n} страниц (пропущено заглушек ${skip}), ${((Date.now() - t0) / 1000).toFixed(1)} с`);
        } catch (e) { logger.warn(`pagefind не отработал (${e.message}) — поиска в сборке нет`); }
      },
    },
  };
}
