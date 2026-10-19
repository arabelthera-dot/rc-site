import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import legacyRedirects from './src/integrations/legacy-redirects.mjs';
import fullPages from './src/integrations/full-pages.mjs';
import kartinki from './src/integrations/kartinki.mjs';
import ogDen from './src/integrations/og-den.mjs';
import minify from './src/integrations/minify.mjs';
import fs from 'node:fs';

// Доска музеев (/doska/) — служебная, noindex, в карту сайта не идёт.
// «День готовится» (дата без карточки или карточка без хука и текста) — noindex, в карту сайта не идёт.
const soonDay = (page) => {
  const m = /\/muzei\/([^/]+)\/den\/(\d\d-\d\d)\/$/.exec(page);
  if (!m) return false;
  const f = `src/content/days/${m[1]}/${m[2]}.json`;
  if (!fs.existsSync(f)) return true;
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  return !(d.hook || d.gist);
};

// Превью на GitHub Pages: https://arabelthera-dot.github.io/rc-site/
// К запуску адрес меняется на свой домен в РФ-хостинге (план, шаг 9) — правится только site/base.
export default defineConfig({
  site: 'https://arabelthera-dot.github.io',
  base: '/rc-site',
  trailingSlash: 'always',
  // Свои стили страниц (бандлы _astro/*.css) — внутрь <head>, а не отдельным блокирующим запросом
  // (render-blocking на главной ~750 мс, Lighthouse 18.10). museum.css подключён ссылкой (?url) и не затронут.
  build: { inlineStylesheets: 'always' },
  // legacyRedirects — старые адреса rc-museum-preview → новые (scripts/redirects.mjs, план шаг 4).
  // fullPages — у дня с готовой страницей старого сайта адрес дня отдаёт её целиком (scripts/full-pages.mjs).
  // ogDen — своя карточка пересылки 1200×630 у готового дня без своей картинки (src/integrations/og-den.mjs).
  // kartinki — WebP-копии 480/960/1600 и srcset/lazy у картинок готовых страниц (после fullPages).
  // minify — последней: public/assets/*.js|css и встроенный <style> (Lighthouse 19.10, LCP; выкл. RC_NO_MINIFY=1).
  integrations: [sitemap({ filter: (page) => !soonDay(page) && !/\/doska\/$/.test(page) }), legacyRedirects(), fullPages(), ogDen(), kartinki(), minify()],
});