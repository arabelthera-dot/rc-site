// Метрика файлом, не инлайном (вес сборки, 20.10): код плашки согласия и счётчика 113664375 (src/lib/metrika.mjs)
// повторялся инлайном на ~4400 страницах (~7 МБ). Теперь на странице <script defer src="/assets/rc-metrika-<md5>.js">,
// сам файл пишет эта интеграция: в dist при сборке и отдаёт с dev-сервера. Код тот же, буква в букву.
// Идёт ДО minify — та сожмёт файл как обычный скрипт (верхние имена не трогает).
// Откат без правки кода: RC_METRIKA_INLAYN=1 — инлайн как прежде (тогда эта интеграция ничего не делает).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { metrikaJs, metrikaFile, metrikaInlayn } from '../lib/metrika.mjs';

export default function metrikaFajlom() {
  return {
    name: 'rc-metrika-fajlom',
    hooks: {
      'astro:server:setup': ({ server }) => {
        if (metrikaInlayn) return;
        server.middlewares.use((req, res, next) => {
          if (req.url !== `/assets/${metrikaFile}`) return next();
          res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
          res.end(metrikaJs);
        });
      },
      'astro:build:done': ({ dir, logger }) => {
        if (metrikaInlayn) { logger.info('метрика инлайном (RC_METRIKA_INLAYN=1)'); return; }
        const out = path.join(fileURLToPath(dir), 'assets');
        fs.mkdirSync(out, { recursive: true });
        fs.writeFileSync(path.join(out, metrikaFile), metrikaJs);
        logger.info(`метрика файлом: assets/${metrikaFile}`);
      },
    },
  };
}
