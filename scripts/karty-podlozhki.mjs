// Сторож подложек карт (закон РФ о картах/границах, Сергей «да» 20.10.2026).
// Внешний сервер тайлов, кроме разрешённых, — красная. На main 20.10.2026 таких 0 (карты сайта — свои SVG/JS),
// режим отчёта не нужен; --otchet печатает список и не падает.
// Запуск: node scripts/karty-podlozhki.mjs [--otchet]
import fs from 'node:fs';
import path from 'node:path';

const RAZRESHENO = []; // свой сервер тайлов или российский с правильной границей — вписать сюда по решению
const MESTA = ['public/assets', 'src'];
const RE = /https?:\/\/[^\s"'`)]*?(\{[xyz]\}|\/tiles?\/|tile\.openstreetmap|basemaps\.cartocdn|api\.mapbox|tiles\.stadiamaps|stamen-tiles|mt\d?\.google|maps\.googleapis|tile\.thunderforest|maps\.wikimedia)[^\s"'`)]*/gi;
const otchet = process.argv.includes('--otchet');
const nashli = [];
const obhod = d => {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== 'vendor') obhod(p); }
    else if (/\.(js|mjs|ts|astro|html)$/.test(e.name))
      for (const m of fs.readFileSync(p, 'utf8').matchAll(RE)) {
        const host = new URL(m[0].replace(/\{[^}]*\}/g, 'a')).host;
        if (!RAZRESHENO.includes(host)) nashli.push(`${p}: ${m[0]}`);
      }
  }
};
MESTA.forEach(obhod);
if (!nashli.length) { console.log('karty-podlozhki: внешних подложек тайлов 0'); process.exit(0); }
console.error(`karty-podlozhki: ${nashli.length} внешних подложек тайлов (не из разрешённых):`);
nashli.forEach(s => console.error('  ' + s));
process.exit(otchet ? 0 : 1);
