import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import legacyRedirects from './src/integrations/legacy-redirects.mjs';
import fullPages from './src/integrations/full-pages.mjs';
import kartinki from './src/integrations/kartinki.mjs';
import ogDen from './src/integrations/og-den.mjs';
import minify from './src/integrations/minify.mjs';
import shriftyFajlom from './src/integrations/shrifty-fajlom.mjs';
import metrikaFajlom from './src/integrations/metrika-fajlom.mjs';
import poisk from './src/integrations/poisk.mjs';
import podderzhka from './src/integrations/podderzhka.mjs';
import zakon from './src/integrations/zakon.mjs';
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

// /sitemap.xml — привычный адрес карты сайта (поисковики и сторожа идут сюда первым): копия sitemap-index.xml
// после сборки, иначе 404 (обход 20.10, план сайта А5). Стоит сразу после sitemap — файл уже есть.
const sitemapXml = () => ({
  name: 'sitemap-xml',
  hooks: { 'astro:build:done': ({ dir }) => {
    const src = new URL('sitemap-index.xml', dir);
    if (fs.existsSync(src)) fs.copyFileSync(src, new URL('sitemap.xml', dir));
  } },
});

// Свой домен https://russian-civilization.ru/ — Pages этого репо (19.10.2026, перенос с rc-museum-preview).
// Старые github.io/rc-site/* GitHub переадресует на домен сам. Смена адреса — правится только site/base.
export default defineConfig({
  site: 'https://russian-civilization.ru',
  base: '/',
  trailingSlash: 'always',
  // Свои стили страниц (бандлы _astro/*.css) — внутрь <head>, а не отдельным блокирующим запросом
  // (render-blocking на главной ~750 мс, Lighthouse 18.10). museum.css подключён ссылкой (?url) и не затронут.
  build: { inlineStylesheets: 'always' },
  // legacyRedirects — старые адреса rc-museum-preview → новые (scripts/redirects.mjs, план шаг 4).
  // fullPages — у дня с готовой страницей старого сайта адрес дня отдаёт её целиком (scripts/full-pages.mjs).
  // ogDen — своя карточка пересылки 1200×630 у готового дня без своей картинки (src/integrations/og-den.mjs).
  // kartinki — WebP-копии 480/960/1600 и srcset/lazy у картинок готовых страниц (после fullPages).
  // shriftyFajlom — <style data-rc-fonts> (@font-face дня) → <link> на общий файл набора (вес сборки, 20.10).
  // metrikaFajlom — код Метрики файлом assets/rc-metrika-<md5>.js вместо инлайна (вес, 20.10; откат RC_METRIKA_INLAYN=1).
  // poisk — после minify: индекс pagefind (dist/pagefind/) по страницам музеев и дней; ВЫКЛЮЧЕН, включает RC_POISK=1.
  // podderzhka — «Поддержать проект» выключен до приёма денег (Р31): вырезает блоки из полных страниц; PUBLIC_PODDERZHKA=1 — не трогает.
  // zakon — до сборки: сверка текстов с реестрами Минюста (красная) и основания кадров XX века (Е1/Е2, src/lib/zakon.mjs).
  // minify — после kartinki: public/assets/*.js|css и встроенный <style> (Lighthouse 19.10, LCP; выкл. RC_NO_MINIFY=1).
  integrations: [zakon(), sitemap({ filter: (page) => !soonDay(page) && !/\/(?:doska|poisk)\/$/.test(page) && !/\/ar\/$/.test(page) }), sitemapXml(), legacyRedirects(), fullPages(), ogDen(), kartinki(), shriftyFajlom(), metrikaFajlom(), podderzhka(), minify(), poisk()],
});