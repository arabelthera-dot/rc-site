// Лупа на кадр (Р178): после kartinki размечает кадры страниц (src/lib/lupa.mjs — правило и выключатель LUPA_VKL),
// размеры снимает с файлов (sharp), ставит на такие страницы rc-lupa.css и rc-lupa.js и кладёт PhotoSwipe из
// node_modules/photoswipe в dist/assets/vendor/photoswipe/ — свой адрес, без внешних CDN.
// Отчёт: «лупа: включена на N из M страниц музеев с кадром» и почему не на остальных.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { LUPA_VKL, MIN_STORONA, razmetit, lupaHead } from '../lib/lupa.mjs';

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
        // 2) разметка
        let sMuz = 0, sVkl = 0;
        const prichiny = {}, bez = [];
        for (const [f, html] of pages) {
          const r = razmetit(html, { base, razmer: (p) => dims.get(p) ?? null });
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
