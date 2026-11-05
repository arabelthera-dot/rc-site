// Лупа на кадр (Р178): после kartinki размечает кадры страниц (src/lib/lupa.mjs — правило и выключатель LUPA_VKL),
// размеры снимает с файлов (sharp), ставит на такие страницы rc-lupa.css и rc-lupa.js и кладёт PhotoSwipe из
// node_modules/photoswipe в dist/assets/vendor/photoswipe/ — свой адрес, без внешних CDN.
// Отчёт: «лупа: включена на N из M страниц музеев с кадром» и почему не на остальных.
// Глубокий зум (Р449, выключатель GLUBOKIY_ZUM_VKL в src/lib/lupa.mjs): кадрам от MIN_GLUBOKIY px — плитки Deep Zoom
// (sharp .tile = libvips dzsave) в dist/_dz/<хеш содержимого>.dzi, кэш между сборками — node_modules/.cache/rc-dz;
// OpenSeadragon 6.1.1 — тот, что уже лежит у сайта (public/assets/vendor/openseadragon.min.js, его же берёт
// museum-deep-zoom.js). Отчёт: «глубокий зум: N кадров, X МБ».
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { LUPA_VKL, MIN_STORONA, GLUBOKIY_ZUM_VKL, MIN_GLUBOKIY, razmetit, lupaHead } from '../lib/lupa.mjs';

const DZ_CACHE = 'node_modules/.cache/rc-dz';
const ves = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? ves(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);

// Плитки одного кадра: <хеш>.dzi и <хеш>_files/ — в кэше, оттуда копия в dist/_dz/. Возвращает адрес .dzi.
async function plitki(file, root, base) {
  const hash = crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 12);
  const cached = path.join(DZ_CACHE, hash);
  if (!fs.existsSync(`${cached}.dzi`)) {
    fs.mkdirSync(DZ_CACHE, { recursive: true });
    await sharp(file, { limitInputPixels: false }).rotate().flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true })
      .tile({ size: 512, overlap: 1, layout: 'dz' }).toFile(`${cached}.dz`);
  }
  const out = path.join(root, '_dz');
  fs.mkdirSync(out, { recursive: true });
  fs.copyFileSync(`${cached}.dzi`, path.join(out, `${hash}.dzi`));
  fs.cpSync(`${cached}_files`, path.join(out, `${hash}_files`), { recursive: true });
  return `${base}_dz/${hash}.dzi`;
}

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

export default function lupa() {
  let base = '/';
  return {
    name: 'rc-lupa',
    hooks: {
      'astro:config:done': ({ config }) => { base = config.base.replace(/\/?$/, '/'); },
      'astro:build:done': async ({ dir, logger }) => {
        if (!LUPA_VKL) { logger.info('лупа выключена (LUPA_VKL в src/lib/lupa.mjs)'); return; }
        const root = fileURLToPath(dir);
        const pw = path.join('node_modules', 'photoswipe', 'dist');
        const vendor = path.join(root, 'assets', 'vendor', 'photoswipe');
        fs.mkdirSync(vendor, { recursive: true });
        for (const f of ['photoswipe.esm.min.js', 'photoswipe.css']) fs.copyFileSync(path.join(pw, f), path.join(vendor, f));
        fs.copyFileSync(path.join('node_modules', 'photoswipe', 'LICENSE'), path.join(vendor, 'LICENSE.txt'));

        // 1) какие файлы — кадры и их размеры
        const pages = htmlFiles(root).map((f) => [f, fs.readFileSync(f, 'utf8')]).filter(([, h]) => h.includes('<img'));
        const need = new Set();
        for (const [, html] of pages) razmetit(html, { base, razmer: (p) => { need.add(p); return null; } });
        const dims = new Map();
        for (const p of need) {
          const file = path.join(root, p);
          if (!fs.existsSync(file)) continue;
          try {
            const m = await sharp(file).metadata();
            const turned = (m.orientation ?? 1) >= 5; // EXIF-поворот: браузер показывает с переставленными сторонами
            if (m.width && m.height) dims.set(p, turned ? [m.height, m.width] : [m.width, m.height]);
          } catch { /* не картинка — без лупы */ }
        }
        // 1а) глубокий зум: плитки кадрам от MIN_GLUBOKIY px
        const dz = new Map();
        if (GLUBOKIY_ZUM_VKL) {
          for (const [p, [w, h]] of dims) {
            if (Math.max(w, h) < MIN_GLUBOKIY) continue;
            try { dz.set(p, await plitki(path.join(root, p), root, base)); } catch (e) { logger.warn(`глубокий зум: ${p} — ${e.message}`); }
          }
          logger.info(`глубокий зум: ${dz.size} кадров от ${MIN_GLUBOKIY} px, плитки ${(dz.size ? ves(path.join(root, '_dz')) / 1e6 : 0).toFixed(1)} МБ`);
        } else logger.info('глубокий зум выключен (GLUBOKIY_ZUM_VKL в src/lib/lupa.mjs)');
        // 2) разметка
        let sMuz = 0, sVkl = 0;
        const prichiny = {}, bez = [];
        for (const [f, html] of pages) {
          const r = razmetit(html, { base, razmer: (p) => dims.get(p) ?? null, dz: (p) => dz.get(p) ?? null });
          const muz = path.relative(root, f).split(path.sep)[0] === 'muzei';
          if (muz && r.kadrov) {
            sMuz++;
            if (r.vkl) sVkl++;
            else {
              bez.push(path.relative(root, f));
              for (const [k, v] of Object.entries(r.prichiny)) prichiny[k] = (prichiny[k] || 0) + v;
            }
          }
          if (!r.vkl) continue;
          fs.writeFileSync(f, r.html.replace(/<\/head>/i, `${lupaHead(base)}</head>`));
        }
        logger.info(`лупа: включена на ${sVkl} из ${sMuz} страниц музеев с кадром (порог ${MIN_STORONA} px по длинной стороне)`);
        if (bez.length) logger.info(`лупа: без лупы ${bez.length} стр., причины по кадрам: ${Object.entries(prichiny).map(([k, v]) => `${k} — ${v}`).join('; ')}`);
        if (process.env.RC_LUPA_OTCHET === '1') console.log(bez.join('\n'));
      },
    },
  };
}
