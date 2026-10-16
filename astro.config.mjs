import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// Превью на GitHub Pages: https://arabelthera-dot.github.io/rc-site/
// К запуску адрес меняется на свой домен в РФ-хостинге (план, шаг 9) — правится только site/base.
export default defineConfig({
  site: 'https://arabelthera-dot.github.io',
  base: '/rc-site',
  trailingSlash: 'always',
  integrations: [sitemap()],
});