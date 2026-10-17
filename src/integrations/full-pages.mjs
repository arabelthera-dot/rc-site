// Адрес дня = полная страница: у дня с готовой страницей старого сайта (src/data/full-pages, scripts/full-pages.mjs)
// muzei/<музей>/den/<ключ>/index.html — эта страница 1:1 вместо карточки. <base> на папку музея — относительные
// пути (картинки, ../../assets/, соседние day-*.html → переадресации) работают при любом base.
// Якоря href="#…" при <base> вели бы на папку музея — переписываются на собственный адрес страницы.
// Относительные href/src/poster/srcset/url() — в абсолютные от папки музея: <base> видит браузер, но не проверка
// ссылок (lychee резолвит от адреса файла — 757 ложных «нет файла», rc-site#16); <base> остаётся для скриптов.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { sitebarHtml, sitebarAssets, whenOfKey, podpiskaHtml } from '../lib/sitebar.mjs';
import { fontFiles, pageFamilies, preloadTag } from '../lib/shrifty.mjs';

const SRC = 'src/data/full-pages';
const MUSEUMS = Object.fromEntries(JSON.parse(fs.readFileSync('src/data/museums.json', 'utf8')).museums
  .map((m) => [m.slug, m.title_ru]));
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&');

// Стандарт полосы (Сергей 17.10): у каждой страницы дня, календаря и главной музея — ссылка на главную сайта
// и на главную своего музея с подписью ровно title_ru (у главной музея — само название, без ссылки).
// Нарушил — сайт не собирается.
function checkSitebars(root, base) {
  const bad = [];
  const dir = path.join(root, 'muzei');
  for (const slug of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) {
    const title = MUSEUMS[slug];
    if (!title) continue;
    const pages = [['', false], ['calendar', true]];
    const den = path.join(dir, slug, 'den');
    for (const k of fs.existsSync(den) ? fs.readdirSync(den).sort() : []) pages.push([`den/${k}`, true]);
    for (const [rel, linked] of pages) {
      const f = path.join(dir, slug, rel, 'index.html');
      if (!fs.existsSync(f)) continue;
      const bar = /<nav class="rc-sitebar"[^>]*>([\s\S]*?)<\/nav>/.exec(fs.readFileSync(f, 'utf8'))?.[1];
      const name = `muzei/${slug}/${rel ? rel + '/' : ''}`;
      if (!bar) { bad.push(`${name} — нет верхней полосы`); continue; }
      if (!new RegExp(`<a class="rc-sb-link rc-sb-home" href="${base}">Русская цивилизация</a>`).test(bar))
        bad.push(`${name} — нет ссылки на главную сайта`);
      const m = linked
        ? new RegExp(`<a class="rc-sb-link rc-sb-museum" href="${base}muzei/${slug}/"[^>]*>([^<]*)</a>`).exec(bar)
        : /<span class="rc-sb-link rc-sb-museum"[^>]*>([^<]*)<\/span>/.exec(bar);
      if (!m) bad.push(`${name} — нет ${linked ? 'ссылки на главную музея' : 'названия музея'}`);
      else if (decode(m[1]) !== title) bad.push(`${name} — название музея «${decode(m[1])}» вместо «${title}»`);
    }
  }
  if (bad.length) throw new Error(`верхняя полоса навигации (${bad.length}):\n${bad.join('\n')}`);
  return bad.length;
}

// Шрифты только свои (AI_Projects#175): fonts.googleapis / fonts.gstatic в src/ и public/ — сайт не собирается.
// Комментарии (/* */, <!-- -->, //) не считаются; node_modules и scripts/import-legacy.mjs вне проверки.
const TEXT = /\.(?:html?|css|js|mjs|cjs|ts|astro|json|md|svg|xml|txt)$/i;
function checkNoGoogleFonts() {
  const bad = [];
  const walk = (d) => {
    for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []) {
      const f = path.join(d, e.name);
      if (e.name === 'node_modules' || f === path.join('scripts', 'import-legacy.mjs')) continue;
      if (e.isDirectory()) { walk(f); continue; }
      if (!TEXT.test(e.name)) continue;
      const code = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '')
        .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
      if (/fonts\.(?:googleapis|gstatic)\.com/.test(code)) bad.push(f);
    }
  };
  walk('src');
  walk('public');
  if (bad.length) throw new Error(`Google-шрифты вместо /assets/fonts.css (${bad.length}):\n${bad.join('\n')}`);
}

// Имя музея в шапке — ровно title_ru (AGENTS.md §6, 17.10): блок шапки (<header class="top">, .museum, .museum-label)
// с обрезком своего title_ru (например, «Что изобрели русские первыми в мире» без «Музей») и в любом месте страницы
// «Музей …», обрывающийся раньше полного title_ru любого музея, — сайт не собирается.
const ALL_TITLES = Object.values(MUSEUMS);
function checkMuseumName(html, museum) {
  const bad = [];
  const title = MUSEUMS[museum];
  if (!title) return bad;
  const norm = (x) => decode(x).replace(/\s+/g, ' ').trim();
  const head = /<header class="top"[^>]*>([\s\S]*?)<\/header>/i.exec(html)?.[1] || '';
  const blocks = [...head.matchAll(/<div class="b\d"[^>]*>([^<]*)<\/div>/g), ...head.matchAll(/<div class="museum"[^>]*>([^<]*)<\/div>/g),
    ...html.matchAll(/<div class="museum-label"[^>]*>([^<]*)<\/div>/g)].map((m) => norm(m[1]));
  const core = title.replace(/^.*?«(.*)»[^»]*$/, '$1');
  for (const b of blocks) if (b && b !== title && (title.includes(b) && b.length > 8 || b === core)) bad.push(`шапка «${b}» вместо «${title}»`);
  for (const m of decode(html).matchAll(/[Мм]узей[ \u00a0][^<>"'\n·|—,.:;(){}\[\]]{3,80}/g)) {
    const s = m[0].replace(/\s+/g, ' ').trim();
    const t = ALL_TITLES.find((x) => x !== s && s.length > 8 && x.toLowerCase().startsWith(s.toLowerCase()));
    if (t && !ALL_TITLES.includes(s)) bad.push(`обрезанное имя «${s}» вместо «${t}»`);
  }
  return [...new Set(bad)];
}

const SKIP = /^(?:[a-z][a-z0-9+.-]*:|\/|#|\$|\{)/i; // схема, корень, якорь, шаблон

// Мировой стандарт против сдвига вёрстки (замер glazami «картинки с размерами», 17.10): у каждого <img> старой
// страницы — width/height по самому файлу из сборки; есть одно из двух — второе по пропорции файла.
// Внешний адрес или файла нет — картинка остаётся как была. Метка data-rc-razmer: в старых стилях бывает
// img{width:100%} без height:auto — rc-sitebar.css даёт таким height:auto с нулевой силой (:where), свой height автора выигрывает.
const sizes = new Map();
async function sizeOf(file) {
  if (!sizes.has(file)) sizes.set(file, await sharp(file).metadata().then((m) => m.width && m.height ? m : null).catch(() => null));
  return sizes.get(file);
}
async function imgSizes(html, root, base) {
  const tags = [...new Set(html.match(/<img\b[^>]*>/gi) || [])];
  let n = 0;
  for (const tag of tags) {
    const w = /\swidth\s*=/i.test(tag), h = /\sheight\s*=/i.test(tag);
    if (w && h) continue;
    const src = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!src || !src.startsWith(base) || src.startsWith('//')) continue;
    const file = path.join(root, decodeURIComponent(src.slice(base.length).split(/[?#]/)[0]));
    const m = fs.existsSync(file) && await sizeOf(file);
    if (!m) continue;
    let add = '';
    if (!w && !h) add = ` width="${m.width}" height="${m.height}"`;
    else if (!w) { const hv = parseFloat(/\sheight\s*=\s*["']?([\d.]+)/i.exec(tag)?.[1]); if (hv) add = ` width="${Math.round(hv * m.width / m.height)}"`; }
    else { const wv = parseFloat(/\swidth\s*=\s*["']?([\d.]+)/i.exec(tag)?.[1]); if (wv) add = ` height="${Math.round(wv * m.height / m.width)}"`; }
    if (!add) continue;
    html = html.split(tag).join(tag.replace(/^<img\b/i, `<img${add} data-rc-razmer`));
    n++;
  }
  return html;
}

// Сдвиг вёрстки от вставок скриптами над обложкой (CLS 01-03 = 0,112 после шрифтов, виновник div#hero, 17.10):
// museum-chrome.js ставил строку «Поделиться» после .hero / nav.crumbs / header, rc-sitebar.js по load — подписку
// .rc-sub под первым блоком «Поделиться»; обе сдвигали обложку вниз на 48 + 66 px. Теперь обе — в HTML при сборке,
// в тех же местах: museum-chrome вешает обработчик на строку с data-chrome-share, rc-sitebar видит .rc-sub и молчит.
// Стили строки — в rc-podpiska.css (в <head>), чтобы не было второго сдвига до museum-chrome.js в конце страницы.
function elementEnd(html, start) {
  const tag = /^<([a-z][a-z0-9]*)/i.exec(html.slice(start))?.[1];
  if (!tag) return -1;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    if (m[1]) depth--; else if (!/\/>$/.test(m[0])) depth++;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}
const cls = (c) => `class=["'](?:[^"']*\\s)?${c}(?:\\s[^"']*)?["']`;
function firstEl(html, from, re) {
  const m = new RegExp(re, 'i').exec(html.slice(from));
  if (!m) return -1;
  const at = from + m.index;
  return html.lastIndexOf('<', at);
}
// Свои стили страницы (inline <style> + локальные .css из public/assets) прячут «Поделиться»? Тогда скрипты видят
// строку невидимой (offsetParent === null) и ставят подписку в конец статьи — угадать при сборке нельзя, оставляем им.
// Так было на arhitektura/01-04 (vyatskoe-page.css) и 01-01: статичная подписка уезжала под обложку (17.10).
const cssCache = new Map();
function pageCss(html) {
  let css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  for (const m of html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)) {
    const href = /href=["']([^"'?#]+)/i.exec(m[0])?.[1];
    if (!href || /^(?:https?:)?\/\//i.test(href)) continue;
    const f = path.join('public/assets', path.basename(href));
    if (!cssCache.has(f)) cssCache.set(f, fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
    css += '\n' + cssCache.get(f);
  }
  return css;
}
function staticChrome(html) {
  const body = html.search(/<body\b/i);
  if (body < 0) return html;
  if (/\.sharerow\b|\.share\b|#sharefinal\b/.test(pageCss(html))) return html;
  const scripts = html.indexOf('<script', body);
  // те же блоки, что у rc-sitebar.js oneShare(): .sharerow, .wrap.share, div.share, #sharefinal — первый видимый
  const shareRe = new RegExp(`<[a-z][a-z0-9]*\\b[^>]*${cls('sharerow')}[^>]*>|<div\\b[^>]*${cls('share')}[^>]*>|<[a-z][a-z0-9]*\\b[^>]*id=["']sharefinal["'][^>]*>`, 'gi');
  const shares = [...html.slice(body).matchAll(shareRe)].map((m) => ({ at: body + m.index, tag: m[0] }));
  const insertAt = (at, piece) => html.slice(0, at) + piece + html.slice(at);
  let after = -1;
  const chrome = /museum-chrome\.js/i.test(html) && !/shareRow\s*:\s*false/.test(html);
  if (!shares.length && chrome) {
    // тот же якорь, что у museum-chrome.js: .hero → nav.crumbs → первый header
    let el = firstEl(html, body, cls('hero'));
    if (el < 0) el = firstEl(html, body, `<nav\\b[^>]*${cls('crumbs')}`);
    if (el < 0) { const h = html.slice(body).search(/<header\b/i); el = h < 0 ? -1 : body + h; }
    const end = el < 0 || (scripts > 0 && el > scripts) ? -1 : elementEnd(html, el);
    if (end > 0) {
      const row = '\n<div class="sharerow" data-chrome-share><button class="sharebtn" type="button" id="sharebtn"><span>⤴</span>Поделиться страницей</button>'
        + '<span class="sharehint" id="sharehint"></span></div>';
      html = insertAt(end, row);
      after = end + row.length;
    }
  } else if (shares.length) {
    // скрытый атрибутом блок скрипт пропускает; первый видимый — под ним подписка. Все скрыты — подписка у footer.
    const vis = shares.find((s) => !/\shidden\b|aria-hidden=["']true["']/i.test(s.tag));
    if (vis) {
      // вложенность в скрытого предка при сборке не видна — тогда не угадываем, оставляем скрипту
      const before = html.slice(body, vis.at);
      if (/<[a-z][a-z0-9]*\b[^>]*\shidden\b/i.test(before)) return html;
      after = elementEnd(html, vis.at);
    }
  }
  if (!/class=["']rc-sub\b/.test(html)) {
    if (after > 0) html = insertAt(after, `\n${podpiskaHtml()}`);
    else {
      const f = html.search(/<footer\b/i);
      html = f > 0 ? insertAt(f, `${podpiskaHtml()}\n`) : html.replace(/<\/body>/i, `${podpiskaHtml()}\n</body>`);
    }
  }
  return html;
}

// Соседние дни (замер glazami «вчера/завтра», 17.10): старая страница дня заменяет карточку целиком, и ссылки
// «← предыдущий / следующий →» карточки (den/[key].astro) пропадали. Соседи — ближайшие дни музея в сборке.
function sosediHtml(base, museum, keys, key) {
  const i = keys.indexOf(key);
  if (!keys[i - 1] && !keys[i + 1]) return ''; // единственный день музея — соседей нет
  const link = (k, rel, text) => k ? `<a class="rc-sosed rc-sosed-${rel}" rel="${rel}" href="${base}muzei/${museum}/den/${k}/">${text}</a>` : '<span></span>';
  return `<nav class="rc-sosedi" aria-label="Соседние дни">${link(keys[i - 1], 'prev', `← предыдущий день, ${whenOfKey(keys[i - 1] || '01-01')}`)}`
    + `${link(keys[i + 1], 'next', `следующий день, ${whenOfKey(keys[i + 1] || '01-01')} →`)}</nav>`;
}

function absolute(url, dirUrl) {
  const u = url.trim();
  if (!u || SKIP.test(u)) return url;
  return new URL(u, `http://x${dirUrl}`).href.slice('http://x'.length);
}

export default function fullPages() {
  let base = '/';
  let site = '';
  return {
    name: 'full-pages',
    hooks: {
      'astro:config:done': ({ config }) => { base = config.base.replace(/\/?$/, '/'); site = config.site ?? ''; },
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir);
        if (!fs.existsSync(SRC)) { checkSitebars(root, base); checkNoGoogleFonts(); return; }
        const bad = [];
        let n = 0;
        for (const museum of fs.readdirSync(SRC).sort()) {
          const denDir = path.join(root, 'muzei', museum, 'den');
          const keys = fs.existsSync(denDir) ? fs.readdirSync(denDir).filter((k) => fs.existsSync(path.join(denDir, k, 'index.html'))).sort() : [];
          for (const f of fs.readdirSync(path.join(SRC, museum)).sort()) {
            const key = f.replace(/\.html$/, '');
            const self = `${base}muzei/${museum}/den/${key}/`;
            const out = path.join(root, 'muzei', museum, 'den', key, 'index.html');
            if (!fs.existsSync(out)) { bad.push(`${museum}/${key} — нет карточки дня`); continue; }
            let html = fs.readFileSync(path.join(SRC, museum, f), 'utf8');
            if (!/<head[^>]*>/i.test(html)) { bad.push(`${museum}/${key} — нет <head>`); continue; }
            for (const e of checkMuseumName(html, museum)) bad.push(`${museum}/${key} — ${e}`);
            // Превью-сборка (PUBLIC_NOINDEX=1, как в Base.astro): свой robots страницы заменяется на noindex.
            if (process.env.PUBLIC_NOINDEX === '1') html = html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '')
              .replace(/<head([^>]*)>/i, '<head$1>\n<meta name="robots" content="noindex">');
            // Шрифты (CLS 0,16–0,29 у дней, #2004): полная страница идёт мимо Base.astro и не получала ни одного
            // preload — Playfair/Inter приходили после первой отрисовки и сдвигали шапку дня. Теперь файлы тех
            // семейств, которыми набрана сама страница, — заранее, сразу после <head>. Google-шрифты старой
            // страницы (чужой CDN, приходят ещё позже) — на свой assets/fonts.css, preconnect к ним — долой.
            html = html
              .replace(/<link\b[^>]*\brel=["']?(?:preconnect|dns-prefetch)["']?[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*/gi, '')
              .replace(/<link\b[^>]*fonts\.googleapis\.com\/css[^>]*>/gi, `<link rel="stylesheet" href="${base}assets/fonts.css">`)
              .replace(/@import\s+url\(\s*['"]?https?:\/\/fonts\.googleapis\.com\/css[^)]*\)\s*;?/gi, `@import url('${base}assets/fonts.css');`);
            // Сразу за <meta charset>: кодировка должна остаться в первых 1024 байтах.
            const preloads = fontFiles(pageFamilies(html)).map((f) => preloadTag(base, f)).join('\n');
            if (preloads) html = /<meta\s+charset[^>]*>/i.test(html) ? html.replace(/<meta\s+charset[^>]*>/i, (m) => `${m}\n${preloads}`)
              : html.replace(/<head([^>]*)>/i, `<head$1>\n${preloads}`);
            html = html
              .replace(/<head([^>]*)>/i, `<head$1>\n<base href="${base}muzei/${museum}/">`)
              .replace(/(\bhref\s*=\s*["'])#/gi, `$1${self}#`)
              .replace(/(\s(?:href|src|poster)\s*=\s*)(["'])([^"']*)\2/gi,
                (m, a, q, u) => `${a}${q}${absolute(u, `${base}muzei/${museum}/`)}${q}`)
              .replace(/(\ssrcset\s*=\s*)(["'])([^"']*)\2/gi, (m, a, q, v) => `${a}${q}${v.split(',')
                .map((part) => part.replace(/^(\s*)(\S+)/, (x, sp, u) => sp + absolute(u, `${base}muzei/${museum}/`)))
                .join(',')}${q}`)
              .replace(/(\burl\(\s*)(['"]?)([^'")]+)\2(\s*\))/gi,
                (m, a, q, u, z) => `${a}${q}${absolute(u, `${base}muzei/${museum}/`)}${q}${z}`);
            // Нет своей карточки пересылки у старой страницы — кадр дня из карточки (images[0]), п.2 очереди 1, 17.10.
            const card = path.join('src/content/days', museum, `${key}.json`);
            const img = fs.existsSync(card) && JSON.parse(fs.readFileSync(card, 'utf8')).images?.[0];
            if (img && site && !/property=["']og:image["']/i.test(html)) {
              const abs = new URL(/^https?:/.test(img.src) ? img.src : `${base}${img.src.replace(/^\//, '')}`, site).href;
              html = html.replace(/<\/head>/i, `<meta property="og:image" content="${abs}" />\n<meta name="twitter:image" content="${abs}" />\n</head>`);
            }
            // Паспорт пересылки и поиска (17.10, scripts/check-og.mjs): чего нет у старой страницы — доливается
            // по карточке дня; карточка в Telegram/ВК — всегда крупная (summary_large_image), адрес — новый.
            if (site) {
              const url = new URL(self, site).href;
              const d = fs.existsSync(card) ? JSON.parse(fs.readFileSync(card, 'utf8')) : {};
              const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
              const add = [];
              html = html.replace(/<meta\s+name=["']twitter:card["'][^>]*>\s*/gi, '');
              add.push('<meta name="twitter:card" content="summary_large_image" />');
              html = html.replace(/<meta\s+property=["']og:url["'][^>]*>\s*/gi, '').replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');
              add.push(`<meta property="og:url" content="${url}" />`, `<link rel="canonical" href="${url}" />`);
              if (!/property=["']og:type["']/i.test(html)) add.push('<meta property="og:type" content="article" />');
              if (!/property=["']og:title["']/i.test(html) && d.title) add.push(`<meta property="og:title" content="${esc(d.title)}" />`);
              if (!/name=["']description["']/i.test(html) && d.hook) add.push(`<meta name="description" content="${esc(d.hook)}" />`);
              if (!/property=["']og:description["']/i.test(html) && d.hook) add.push(`<meta property="og:description" content="${esc(d.hook)}" />`);
              // Разметка schema.org (пункт «schema» замера glazami): своей ld+json нет — Article дня внутри музея.
              if (!/type=["']application\/ld\+json["']/i.test(html) && MUSEUMS[museum]) {
                const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
                const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: d.title ?? (h1 && decode(h1)) ?? key,
                  url, inLanguage: 'ru', ...(d.hook ? { description: d.hook } : {}),
                  isPartOf: { '@type': 'Museum', name: MUSEUMS[museum], url: new URL(`${base}muzei/${museum}/`, site).href },
                  publisher: { '@type': 'Organization', name: 'Русская цивилизация', url: new URL(base, site).href } };
                add.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
              }
              html = html.replace(/<\/head>/i, `${add.join('\n')}\n</head>`);
            }
            // «Поделиться» — один раз (glazami п.16): у страницы свой блок — строку museum-chrome не ставим,
            // а museum-support.js не добавляет кнопку, если на странице уже есть блок «Поделиться».
            if (/class=["'](?:sharerow|wrap share|share)\b|id=["']sharefinal["']/i.test(html))
              html = html.replace(/(<script[^>]*src=["'][^"']*museum-chrome\.js)/i,
                '<script>window.MUSEUM_CHROME=Object.assign(window.MUSEUM_CHROME||{},{shareRow:false})</script>\n$1');
            html = staticChrome(html);
            // Единая верхняя полоса (Сергей 17.10) — сразу после <body…>; старые крошки страницы не трогаем.
            html = html.replace(/<\/head>/i, `${sitebarAssets(base)}\n</head>`)
              .replace(/<body([^>]*)>/i, (b) => `${b}\n${sitebarHtml({ base, slug: museum, title: MUSEUMS[museum], here: whenOfKey(key) })}`);
            if (!/\srel=["'](?:prev|next)["']/i.test(html)) html = html.replace(/<\/body>/i, `${sosediHtml(base, museum, keys, key)}\n</body>`);
            html = await imgSizes(html, root, base);
            if (!MUSEUMS[museum]) { bad.push(`${museum}/${key} — музея нет в museums.json`); continue; }
            fs.writeFileSync(out, html);
            n++;
          }
        }
        if (bad.length) throw new Error(`полные страницы дней:\n${bad.join('\n')}`);
        checkSitebars(root, base);
        checkNoGoogleFonts();
        console.log(`full-pages: ${n} дней — полная страница; верхняя полоса и имя музея в шапке проверены; Google-шрифтов нет`);
      },
    },
  };
}
