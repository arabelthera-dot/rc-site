// Картинки для телефона (п. 7 очереди 1, «да» Сергея 17.10): после сборки у каждой <img> с локальным растровым
// файлом появляется srcset из WebP-копий шириной 480/960/1600 (не шире оригинала) — телефон качает 960 вместо
// мегабайтного оригинала. Оригиналы не трогаются: src и ссылки «открыть целиком» ведут на них, как раньше.
// Копии — в dist/_k/<хеш содержимого>-<ширина>.webp (одинаковые файлы двух папок — одна копия), кэш между
// сборками — node_modules/.cache/rc-kartinki. Разметка: первый кадр страницы — fetchpriority="high" без lazy
// (если автор страницы не выбрал его сам), остальные — loading="lazy"; всем — decoding="async".
// Не трогаем: <picture>, готовый srcset, картинки, которые меняет скрипт (id, data-*src*/data-*image*),
// внешние адреса, svg/gif. width/height не дописываем — в старых стилях есть img{width:100%} без height:auto,
// атрибут высоты растянул бы кадр; у обложек музеев они уже есть (Cover.astro).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WIDTHS = [480, 960, 1600];
const RASTER = /\.(jpe?g|png|webp)$/i;
const CACHE = 'node_modules/.cache/rc-kartinki';
const MIN_BYTES = 150 * 1024; // меньше и не шире 480 — копии не нужны
// Параллельных перекодировок: на сборщике GitHub (CI) — 4; на общем сервере агентов потолок памяти 2 ГБ — по одной.
const PAR = process.env.CI ? 4 : 1;
sharp.cache(false);
if (!process.env.CI) sharp.concurrency(1);

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

export default function kartinki() {
  let base = '/';
  return {
    name: 'kartinki',
    hooks: {
      'astro:config:done': ({ config }) => { base = config.base.replace(/\/?$/, '/'); },
      'astro:build:done': async ({ dir }) => {
        const t0 = Date.now();
        const root = fileURLToPath(dir);
        const outDir = path.join(root, '_k');
        fs.mkdirSync(outDir, { recursive: true });
        fs.mkdirSync(CACHE, { recursive: true });
        const info = new Map(); // файл dist → { srcset } | null
        const jobs = new Map(); // имя копии → задача
        const plan = (rel) => {
          if (info.has(rel)) return info.get(rel);
          let res = null;
          const file = path.join(root, rel);
          if (RASTER.test(rel) && fs.existsSync(file)) {
            const hash = crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 12);
            res = { hash, file, bytes: fs.statSync(file).size };
          }
          info.set(rel, res);
          return res;
        };
        // 1) разбор страниц: какие картинки на каких страницах
        const pages = [];
        const IMG = /<img\b[^>]*>/gi;
        for (const f of htmlFiles(root)) {
          const html = fs.readFileSync(f, 'utf8');
          if (!html.includes('<img')) continue;
          pages.push(f);
          for (const tag of html.match(IMG) ?? []) {
            const src = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
            if (src?.startsWith(base)) plan(decodeURI(src.slice(base.length).split(/[?#]/)[0]));
          }
        }
        // 2) размеры и копии (параллельно, с кэшем)
        const items = [...info.values()].filter(Boolean);
        for (let i = 0; i < items.length; i += 8) {
          await Promise.all(items.slice(i, i + 8).map(async (it) => {
            const meta = await sharp(it.file).metadata();
            const W = meta.width ?? 0;
            if (!W || (W <= WIDTHS[0] && it.bytes < MIN_BYTES)) { it.skip = true; return; }
            const widths = WIDTHS.filter((w) => w * 1.15 < W); // 480 рядом с 486 — лишняя копия
            if (W <= WIDTHS.at(-1)) widths.push(W);
            it.srcset = widths.map((w) => {
              const name = `${it.hash}-${w}.webp`;
              if (!jobs.has(name)) jobs.set(name, { it, w, name });
              return `${base}_k/${name} ${w}w`;
            }).join(', ');
          }));
        }
        const todo = [...jobs.values()];
        let made = 0;
        for (let i = 0; i < todo.length; i += PAR) {
          await Promise.all(todo.slice(i, i + PAR).map(async ({ it, w, name }) => {
            const cached = path.join(CACHE, name);
            if (!fs.existsSync(cached)) {
              await sharp(it.file, { limitInputPixels: false, sequentialRead: true }).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(cached);
              made++;
            }
            fs.copyFileSync(cached, path.join(outDir, name));
          }));
        }
        // 3) разметка
        let changed = 0, withSrcset = 0;
        for (const f of pages) {
          const html = fs.readFileSync(f, 'utf8');
          const hasPriority = /<img\b[^>]*fetchpriority\s*=\s*["']high/i.test(html);
          let first = true;
          const out = html.replace(IMG, (tag) => {
            const isFirst = first; first = false;
            let t = tag;
            const has = (a) => new RegExp(`\\s${a}\\s*=`, 'i').test(t);
            const add = (s) => { t = t.replace(/\s*\/?>$/, (end) => ` ${s}${end}`); };
            const src = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(t)?.[1];
            const scripted = /\sid\s*=|\sdata-[\w-]*(?:src|image)[\w-]*\s*=/i.test(t);
            const it = src?.startsWith(base) && info.get(decodeURI(src.slice(base.length).split(/[?#]/)[0]));
            if (it && it.srcset && !it.skip && !scripted && !has('srcset')) {
              const wa = Number(/\swidth\s*=\s*["']?(\d+)/i.exec(t)?.[1]);
              add(`srcset="${it.srcset}" sizes="${wa ? `(max-width: ${wa}px) 100vw, ${wa}px` : '100vw'}"`);
              withSrcset++;
            }
            if (isFirst && !hasPriority && !/loading\s*=\s*["']lazy/i.test(t)) {
              t = t.replace(/\sloading\s*=\s*["']eager["']/i, '');
              add('fetchpriority="high"');
            } else if (!has('loading') && !has('fetchpriority')) add('loading="lazy"');
            if (!has('decoding')) add('decoding="async"');
            return t;
          });
          // внутри <picture> srcset у <img> не нужен: браузер берёт <source>; возвращаем исходный тег кроме атрибутов загрузки
          const fixed = out.replace(/<picture\b[\s\S]*?<\/picture>/gi, (m) => m.replace(/\ssrcset="[^"]*\/_k\/[^"]*" sizes="[^"]*"/g, ''));
          if (fixed !== html) { fs.writeFileSync(f, fixed); changed++; }
        }
        console.log(`kartinki: ${items.length} файлов, копий ${jobs.size} (новых ${made}), srcset у ${withSrcset} <img> на ${changed} стр., ${((Date.now() - t0) / 1000).toFixed(1)} с`);
      },
    },
  };
}
