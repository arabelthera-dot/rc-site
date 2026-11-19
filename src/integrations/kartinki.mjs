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

// 720 — телефон 390–412 px при плотности 1,75–2 (карточки «Сегодня» главной, наряд #2004, 17.10)
const WIDTHS = [480, 720, 960, 1600];
const RASTER = /\.(jpe?g|png|webp)$/i;
const CACHE = 'node_modules/.cache/rc-kartinki';
// Не шире 480 и меньше 24 КиБ — копии не нужны (значки). Порог был 150 КиБ: квадрат 472×472 JPEG 98 КиБ
// (10-18-lodygin-1874.jpg, ведущая карточка «Сегодня») уходил на главную оригиналом — Lighthouse 18.10.
// Теперь такой кадр получает одну WebP-копию в свою ширину.
const MIN_BYTES = 24 * 1024;
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
            res = { hash, file, rel, bytes: fs.statSync(file).size };
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
        // 1б) данные «Сегодня» (segodnya/<ММ-ДД>.json): картинки, которые скрипт главной ставит при смене даты,
        // получают поле srcset — иначе браузер качал бы оригинал (#2004, 17.10)
        const segDir = path.join(root, 'segodnya');
        const segFiles = fs.existsSync(segDir) ? fs.readdirSync(segDir).filter((n) => n.endsWith('.json')).map((n) => path.join(segDir, n)) : [];
        const relOf = (src) => (src?.startsWith(base) ? decodeURI(src.slice(base.length).split(/[?#]/)[0]) : null);
        for (const f of segFiles) {
          for (const c of JSON.parse(fs.readFileSync(f, 'utf8')).cards ?? []) { const r = relOf(c.img); if (r) plan(r); }
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
            // оригинал уже WebP не шире 1600 — в свою ширину идёт он сам, копия была бы дублем (−11 МБ, 76 копий, Р49/T2);
            // адрес с запятой или пробелом в srcset не пишется — тогда копия, как раньше
            const own = /\.webp$/i.test(it.file) && W <= WIDTHS.at(-1) && encodeURI(it.rel);
            const useOwn = own && !/[,\s]/.test(own);
            if (useOwn && widths.length === 1) { it.skip = true; return; } // srcset из одного src не нужен
            it.srcset = widths.map((w) => {
              if (w === W && useOwn) return `${base}${own} ${w}w`;
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
            // «первый кадр» — первая своя картинка: пиксель Метрики (<noscript>, внешний адрес) им не считается,
            // иначе fetchpriority="high" уходил ему, а не ведущей картинке «Сегодня» (18.10)
            const src0 = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] ?? '';
            if (src0.includes('mc.yandex.ru/watch/')) return tag; // пиксель счётчика: ни lazy, ни приоритета
            const own = src0.startsWith(base);
            const isFirst = first && own; if (own) first = false;
            let t = tag;
            const has = (a) => new RegExp(`\\s${a}\\s*=`, 'i').test(t);
            const add = (s) => { t = t.replace(/\s*\/?>$/, (end) => ` ${s}${end}`); };
            const src = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(t)?.[1];
            const scripted = /\sid\s*=|\sdata-[\w-]*(?:src|image)[\w-]*\s*=/i.test(t);
            const it = src?.startsWith(base) && info.get(decodeURI(src.slice(base.length).split(/[?#]/)[0]));
            if (it && it.srcset && !it.skip && !scripted && !has('srcset')) {
              const wa = Number(/\swidth\s*=\s*["']?(\d+)/i.exec(t)?.[1]);
              // свой sizes у тега (вёрстка карточек знает ширину лучше) — сохраняем
              add(has('sizes') ? `srcset="${it.srcset}"` : `srcset="${it.srcset}" sizes="${wa ? `(max-width: ${wa}px) 100vw, ${wa}px` : '100vw'}"`);
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
        let segChanged = 0;
        for (const f of segFiles) {
          const data = JSON.parse(fs.readFileSync(f, 'utf8'));
          let dirty = false;
          for (const c of data.cards ?? []) {
            const r = relOf(c.img); const it = r && info.get(r);
            if (it && it.srcset && !it.skip && c.srcset !== it.srcset) { c.srcset = it.srcset; dirty = true; }
          }
          if (dirty) { fs.writeFileSync(f, JSON.stringify(data)); segChanged++; }
        }
        console.log(`kartinki: segodnya/*.json со srcset — ${segChanged}`);
        console.log(`kartinki: ${items.length} файлов, копий ${jobs.size} (новых ${made}), srcset у ${withSrcset} <img> на ${changed} стр., ${((Date.now() - t0) / 1000).toFixed(1)} с`);
      },
    },
  };
}
