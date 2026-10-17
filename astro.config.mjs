import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import legacyRedirects from './src/integrations/legacy-redirects.mjs';
import fullPages from './src/integrations/full-pages.mjs';
import kartinki from './src/integrations/kartinki.mjs';

// Превью на GitHub Pages: https://arabelthera-dot.github.io/rc-site/
// К запуску адрес меняется на свой домен в РФ-хостинге (план, шаг 9) — правится только site/base.
export default defineConfig({
  site: 'https://arabelthera-dot.github.io',
  base: '/rc-site',
  trailingSlash: 'always',
  // legacyRedirects — старые адреса rc-museum-preview → новые (scripts/redirects.mjs, план шаг 4).
  // fullPages — у дня с готовой страницей старого сайта адрес дня отдаёт её целиком (scripts/full-pages.mjs).
  // kartinki — WebP-копии 480/960/1600 и srcset/lazy у картинок готовых страниц (после fullPages).
  integrations: [sitemap(), legacyRedirects(), fullPages(), kartinki()],
});