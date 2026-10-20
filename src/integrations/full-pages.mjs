// Адрес дня = полная страница: у дня с готовой страницей старого сайта (src/data/full-pages, scripts/full-pages.mjs)
// muzei/<музей>/den/<ключ>/index.html — эта страница 1:1 вместо карточки. <base> на папку музея — относительные
// пути (картинки, ../../assets/, соседние day-*.html → переадресации) работают при любом base.
// Якоря href="#…" при <base> вели бы на папку музея — переписываются на собственный адрес страницы.
// Относительные href/src/poster/srcset/url() — в абсолютные от папки музея: <base> видит браузер, но не проверка
// ссылок (lychee резолвит от адреса файла — 757 ложных «нет файла», rc-site#16); <base> остаётся для скриптов.
// data-src/data-poster (ленивые аудио, видео, картинки) — так же (20.10): обход сайта резолвил их от адреса
// /den/MM-DD/ и нашёл 18 «битых» файлов; проверка — scripts/data-src.mjs в proverka.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { metrikaHtml } from '../lib/metrika.mjs';
import { hreflangi, stroka, poUmolchaniyu } from '../lib/yazyki.mjs';
import { sitebarHtml, sitebarAssets, whenOfKey, podpiskaHtml } from '../lib/sitebar.mjs';
import { slabovidHeadJs, slabovidButtonHtml } from '../lib/slabovid.mjs';
import { failKalendarya } from '../lib/kalendar-dannye.mjs';
import { znak, znakHtml, roditelyu, roditelyuHtml, bezOchkov, typicalAgeRange } from '../lib/vozrast.mjs';
import { fontFiles, pageFamilies, preloadTag, usedFamilies, faceCss } from '../lib/shrifty.mjs';
import { REDAKCIYA, LICENZIYA, redakciyaLd, licenziyaHtml, zhurnal, zhurnalHtml } from '../lib/redakciya.mjs';

// Подпись и лицензия в JSON-LD старой страницы (Р34, Р35): author/publisher-организация — сам сайт или его музей
// («Русская цивилизация», «Музей русской карикатуры») → Редакция; чужие (издатель гравюры, Person) не трогаются.
// У произведений (есть headline или тип *Page/Article/CreativeWork) — license и, если нет, author; дата правки — из git.
const WORK = /(?:Article|Page|CreativeWork|LearningResource|Course)$/;
function ldRedakciya(html, red, modified) {
  const OUR_NAMES = new Set(['Русская цивилизация', ...Object.values(MUSEUMS)]);
  return html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (m, a, json, z) => {
    let data;
    try { data = JSON.parse(json); } catch { return m; }
    const ours = (v) => v && typeof v === 'object' && !Array.isArray(v) && v['@type'] === 'Organization' && OUR_NAMES.has(v.name);
    const walk = (o) => {
      if (Array.isArray(o)) return o.forEach(walk);
      if (!o || typeof o !== 'object') return;
      for (const k of ['author', 'publisher']) if (ours(o[k])) o[k] = red;
      for (const v of Object.values(o)) walk(v);
    };
    walk(data);
    const top = Array.isArray(data) ? data : data['@graph'] ?? [data];
    for (const n of top) {
      const t = [].concat(n?.['@type'] ?? []);
      if (!n || !(n.headline || t.some((x) => WORK.test(x)))) continue;
      n.author ??= red;
      n.license ??= LICENZIYA;
      if (modified && /Article/.test(t.join())) n.dateModified ??= modified;
    }
    return a + JSON.stringify(data).replace(/</g, '\\u003c') + z;
  });
}

const SRC = 'src/data/full-pages';
const VOZRAST_CSS = fs.readFileSync('public/assets/rc-vozrast.css', 'utf8');
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
// Наушники аудиогида — встроенный SVG цветом текста кнопки (вместо «🎧»: на ПК/Linux без эмодзи-шрифта — квадрат).
const AUDIO_ICON = '<svg class="rc-ico-audio" aria-hidden="true" focusable="false" width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-.18em;flex:none"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>';

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
// Не всякое правило про «Поделиться» мешает: arhitektura 01-05…01-09 (nevjanskaya-page.css — max-width/overflow),
// izobreteniya 01-05 (padding !important), iskusstvo 05-02 (свой .sharerow, стили как у museum-chrome) — вид и место
// те же, что у скрипта (18.10). Оставляем скриптам только там, где правило прячет, выносит из потока или двигает блок.
// Правило только для узких экранов (@media max-width) — не «прячет всегда»: arhitektura 01-04 (vyatskoe-page.css
// прячет .hero-scene>.sharerow лишь при ≤820 px), а скрипт на ПК дописывал строку под обложку после отрисовки — CLS 0,076
// (18.10). Тогда строку ставит сборка (на телефоне её спрячет тот же CSS), а подписку — скрипт: её место на ПК и телефоне разное.
function cssBlocks(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let base = '', narrow = '';
  for (let i = 0; i < css.length;) {
    const at = css.indexOf('@media', i);
    if (at < 0) { base += css.slice(i); break; }
    base += css.slice(i, at);
    const open = css.indexOf('{', at);
    if (open < 0) break;
    let depth = 1, j = open + 1;
    while (j < css.length && depth) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
    const query = css.slice(at, open);
    if (/max-width/i.test(query) && !/min-width/i.test(query)) narrow += css.slice(open + 1, j - 1);
    else base += css.slice(open + 1, j - 1);
    i = j;
  }
  return { base, narrow };
}
function shareRule(css) {
  const rules = css.match(/[^{}]*\{[^{}]*\}/g) || [];
  return rules.some((r) => {
    const [sel, decl] = r.split('{');
    return /\.sharerow(?![\w-])|\.share(?![\w-])|#sharefinal(?![\w-])/.test(sel)
      && /\b(?:display\s*:\s*none|visibility\s*:\s*hidden|position\s*:|float\s*:|order\s*:|transform\s*:|content-visibility)/i.test(decl);
  });
}
// 'always' — прячет/двигает на любом экране; 'narrow' — только на узких; false — не мешает
function hidesShare(css) {
  const { base, narrow } = cssBlocks(css);
  return shareRule(base) ? 'always' : shareRule(narrow) ? 'narrow' : false;
}
function staticChrome(html) {
  const body = html.search(/<body\b/i);
  if (body < 0) return html;
  const hides = hidesShare(pageCss(html));
  if (hides === 'always') return html;
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
    } else return html; // все скрыты (arhitektura 01-01) — куда поставит скрипт, при сборке не видно
  }
  if (hides === 'narrow') return html; // подписку ставит скрипт: на телефоне строка скрыта — конец статьи
  if (!/class=["']rc-sub\b/.test(html)) {
    if (after > 0) html = insertAt(after, `\n${podpiskaHtml()}`);
    else {
      const f = html.search(/<footer\b/i);
      html = f > 0 ? insertAt(f, `${podpiskaHtml()}\n`) : html.replace(/<\/body>/i, `${podpiskaHtml()}\n</body>`);
    }
  }
  return html;
}

// Липкие чипсы разделов (CLS +63 px на arhitektura 01-05/01-07, 18.10): museum-chrome.js собирал #secnav в конце
// страницы и вставлял после «Поделиться» — обложка уезжала вниз. Теперь панель — в HTML при сборке, тем же правилом
// (подписи LABEL/SKIP из museum-chrome.js, navIds/labels/showMuseumHome из window.MUSEUM_CHROME страницы, data-nav),
// стиль — rc-secnav.css в <head>; скрипт видит готовый #secnav и только навешивает подсветку и прогресс.
const chromeSrc = fs.readFileSync('public/assets/museum-chrome.js', 'utf8');
const chromeMap = (name) => vm.runInNewContext(`(${new RegExp(`var\\s+${name}\\s*=\\s*(\\{[\\s\\S]*?\\});`).exec(chromeSrc)[1]})`);
const NAV_LABEL = chromeMap('LABEL');
const NAV_SKIP = chromeMap('SKIP');
const escHtml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function chromeConfig(html) {
  const win = {};
  for (const m of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (!/MUSEUM_CHROME/.test(m[1])) continue;
    try { vm.runInNewContext(m[1], { window: win }, { timeout: 200 }); } catch { return null; }
  }
  return win.MUSEUM_CHROME || {};
}
// Меню вставляется после перевода ссылок в абсолютные (выше): «← Музей» — от папки музея, якоря — на адрес
// самой страницы, иначе при <base> чипсы уводят в папку музея, а lychee видит битый файл (rc-site#91, 34 ошибки).
function staticSecnav(html, base, dir, self) {
  if (!/museum-chrome\.js/i.test(html) || /\bid=["']secnav["']/i.test(html)) return html;
  const body = html.search(/<body\b/i);
  if (body < 0) return html;
  const C = chromeConfig(html);
  if (!C) return html;
  const M = C.museum || {};
  const chips = [];
  const re = /<section\b[^>]*\bid=["']([^"']*)["'][^>]*>|<div\b[^>]*\bid=["'](routewrap|zoomwrap)["'][^>]*>/gi;
  for (const m of html.slice(body).matchAll(re)) {
    const id = m[1] ?? m[2];
    if (!id || NAV_SKIP[id]) continue;
    if (Array.isArray(C.navIds) && !C.navIds.includes(id)) continue;
    const dn = /\sdata-nav=["']([^"']*)["']/i.exec(m[0])?.[1];
    const lab = (dn && decode(dn)) || (C.labels && C.labels[id]) || NAV_LABEL[id];
    if (!lab || chips.some((c) => c.lab === lab)) continue;
    chips.push({ id, lab });
  }
  if (chips.length <= 2) return html;
  const home = M.href && C.showMuseumHome !== false ? `<a class="home" href="${escHtml(absolute(M.href, dir))}">${escHtml(M.homeLabel || '← Музей')}</a>` : '';
  const nav = `<nav id="secnav" aria-label="Разделы страницы" data-chrome-nav><div class="row">${home}`
    + chips.map((c) => `<a href="${self}#${escHtml(c.id)}">${escHtml(c.lab)}</a>`).join('') + '</div><div class="prog" id="secprog"></div></nav>';
  const insertAt = (at, piece) => html.slice(0, at) + piece + html.slice(at);
  // как у скрипта: место .daynav, иначе после первой .sharerow, иначе после .hero → nav.crumbs → header, иначе начало body
  const dn = firstEl(html, body, cls('daynav'));
  if (dn > 0) { const e = elementEnd(html, dn); if (e > 0) return html.slice(0, dn) + nav + html.slice(e); }
  let el = firstEl(html, body, cls('sharerow'));
  if (el < 0) el = firstEl(html, body, cls('hero'));
  if (el < 0) el = firstEl(html, body, `<nav\\b[^>]*${cls('crumbs')}`);
  if (el < 0) { const h = html.slice(body).search(/<header\b/i); el = h < 0 ? -1 : body + h; }
  const end = el < 0 ? -1 : elementEnd(html, el);
  html = end > 0 ? insertAt(end, `\n${nav}`) : html.replace(/<body([^>]*)>/i, (b) => `${b}\n${nav}`);
  return html.replace(/<\/head>/i, `<link rel="stylesheet" href="${base}assets/rc-secnav.css" />\n</head>`);
}

// Первый экран = итоговый вид (CLS izobreteniya 01-05: тел 0,089 / ПК 0,036, 18.10). museum-chrome.js стоит в конце
// страницы и только там (1) вставлял свой CSS: max-height:var(--hero-fit) у обложки, мобильные кегли h1/подводки/кнопок,
// (2) давал класс .hero-btns безымянному блоку кнопок (15 страниц), (3) считал --hero-fit (fitHero). Всё это — после
// первого кадра: обложка сжималась на 19–92 px, подводка с кнопками ехала вверх. Теперь при сборке: тот же CSS в <head>
// (последним, как его ставит движок), тот же класс в разметке и тот же fitHero сразу за подводкой — до первой
// отрисовки. Код и CSS берутся из самого museum-chrome.js: правка движка доезжает сюда сама; его повторный проход
// ничего не меняет (стиль тот же, .hero-btns уже есть, --hero-fit то же). Шрифты (museum-support.js, #99) не трогаем.
const CHROME_CSS = vm.runInNewContext(`(${/var\s+css\s*=\s*([\s\S]*?);\s*\n\s*var\s+st\s*=/.exec(chromeSrc)[1]})`);
const FIT_HERO = /function fitHero\(\)\{[\s\S]*?\n {2}\}\n/.exec(chromeSrc)[0];
function staticHero(html) {
  if (!/museum-chrome\.js/i.test(html)) return html;
  html = html.replace(/<\/head>/i, `<style data-chrome-css>${CHROME_CSS}</style>\n</head>`);
  const body = html.search(/<body\b/i);
  const lead = body < 0 ? -1 : firstEl(html, body, cls('hero-(?:lead|text)'));
  if (lead < 0) return html;
  let end = elementEnd(html, lead);
  if (end < 0) return html;
  // усыновление, как в движке (раздел 0-тер): первый div/p подводки с двумя и более кнопками прямо внутри
  if (!new RegExp(cls('hero-btns'), 'i').test(html)) {
    const re = /<(div|p)\b([^>]*)>/gi;
    re.lastIndex = lead + 1;
    let m;
    while ((m = re.exec(html)) && m.index < end) {
      const e = elementEnd(html, m.index);
      const inner = e > 0 ? html.slice(m.index + m[0].length, e) : '';
      if (/<(?:div|p)\b/i.test(inner) || (inner.match(/<button\b|<a\b[^>]*\bclass=["'][^"']*\bbtn\b/gi) || []).length < 2) continue;
      const tag = /\sclass=(["'])/i.test(m[0]) ? m[0].replace(/\sclass=(["'])/i, ' class=$1hero-btns ') : m[0].replace(/^<(div|p)\b/i, '<$1 class="hero-btns"');
      html = html.slice(0, m.index) + tag + html.slice(m.index + m[0].length);
      end += tag.length - m[0].length;
      break;
    }
  }
  const fit = `\n<script data-chrome-fit>(function(){var doc=document;${FIT_HERO}fitHero();})();</script>`;
  return html.slice(0, end) + fit + html.slice(end);
}

// Соседние дни (замер glazami «вчера/завтра», 17.10): старая страница дня заменяет карточку целиком, и ссылки
// «← предыдущий / следующий →» карточки (den/[key].astro) пропадали. Соседи — ближайшие дни музея в сборке.
function sosediHtml(base, museum, keys, key, code = poUmolchaniyu) {
  const i = keys.indexOf(key);
  if (!keys[i - 1] && !keys[i + 1]) return ''; // единственный день музея — соседей нет
  const s = (k) => stroka(code, k); // подписи — из словаря языка (Г20, src/data/stroki.json)
  const link = (k, rel, text) => k ? `<a class="rc-sosed rc-sosed-${rel}" rel="${rel}" href="${base}muzei/${museum}/den/${k}/">${text}</a>` : '<span></span>';
  return `<nav class="rc-sosedi" aria-label="${s('sosediDni')}">${link(keys[i - 1], 'prev', `← ${s('predDen')}, ${whenOfKey(keys[i - 1] || '01-01', code)}`)}`
    + `${link(keys[i + 1], 'next', `${s('sledDen')}, ${whenOfKey(keys[i + 1] || '01-01', code)} →`)}</nav>`;
}

function absolute(url, dirUrl) {
  const u = url.trim();
  if (!u || SKIP.test(u)) return url;
  return new URL(u, `http://x${dirUrl}`).href.slice('http://x'.length);
}

// Тег старого файла данных календаря музея: <script src="[…/]calendar-<x>.js">; museum-calendar-*.js и nikitin/calendar.js не задевает.
const OLD_KAL = /(<script\b[^>]*?\ssrc\s*=\s*)(["'])(?:[^"']*\/)?calendar-[\w-]+\.js(?:\?[^"']*)?\2/gi;

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
        let nKal = 0;
        const kalFaily = [];
        for (const museum of fs.readdirSync(SRC).sort()) {
          // Календарь страницы (museum-calendar-month.js) — из записей дней (шаг 4Б ядра, 19.10): один файл на музей
          // dist/muzei/<музей>/kalendar-dney.<хеш>.js вместо старого public/muzei/<музей>/calendar-<x>.js.
          // Старые calendar-<x>.js удалены (19.10): нет записей, а тег остался — ошибка сборки. nikitin/calendar.js (путь Никитина) — не календарь музея.
          const kal = failKalendarya(museum, base);
          let kalSrc = null;
          if (kal) kalSrc = `${base}muzei/${museum}/${kal.name}`;
          const kalDo = nKal;
          const denDir = path.join(root, 'muzei', museum, 'den');
          const keys = fs.existsSync(denDir) ? fs.readdirSync(denDir).filter((k) => fs.existsSync(path.join(denDir, k, 'index.html'))).sort() : [];
          // Анкета (ADR docs/adr/0001-anketa-dnya.md): у дня есть body — страницу уже собрал шаблон DenAnketa.astro,
          // конвейер ниже ведёт её так же, как старый HTML; старый HTML того же дня (пока лежит) — на den/<ключ>/staraya/
          // с noindex, для сверки 1:1 и отката. Нет body — как раньше, старый HTML 1:1.
          const cardsDir = path.join('src/content/days', museum);
          const anketa = new Set((fs.existsSync(cardsDir) ? fs.readdirSync(cardsDir) : []).filter((f) => f.endsWith('.json'))
            .filter((f) => JSON.parse(fs.readFileSync(path.join(cardsDir, f), 'utf8')).body).map((f) => f.slice(0, -5)));
          const htmlKeys = fs.existsSync(path.join(SRC, museum)) ? fs.readdirSync(path.join(SRC, museum)).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5)) : [];
          const jobs = [...new Set([...htmlKeys, ...anketa])].sort().flatMap((key) => {
            const dayOut = path.join(root, 'muzei', museum, 'den', key, 'index.html');
            const day = `${base}muzei/${museum}/den/${key}/`;
            const old = { key, self: day, out: dayOut, from: path.join(SRC, museum, `${key}.html`) };
            if (!anketa.has(key)) return [old];
            const jobsKey = [{ key, self: day, out: dayOut, from: dayOut }];
            if (htmlKeys.includes(key)) jobsKey.push({ ...old, self: `${day}staraya/`, out: path.join(root, 'muzei', museum, 'den', key, 'staraya', 'index.html'), staraya: true });
            return jobsKey;
          });
          for (const { key, self, out, from, staraya } of jobs) {
            if (!fs.existsSync(path.join(root, 'muzei', museum, 'den', key, 'index.html'))) { bad.push(`${museum}/${key} — нет карточки дня`); continue; }
            let html = fs.readFileSync(from, 'utf8');
            if (kalSrc) html = html.replace(OLD_KAL, (m, a, q) => { nKal++; return `${a}${q}${kalSrc}${q}`; });
            else if (OLD_KAL.test(html)) { OLD_KAL.lastIndex = 0; bad.push(`${museum}/${key} — тег старого calendar-*.js, а записей дней нет`); continue; }
            if (staraya) { fs.mkdirSync(path.dirname(out), { recursive: true }); html = html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '').replace(/<head([^>]*)>/i, '<head$1>\n<meta name="robots" content="noindex">'); }
            if (!/<head[^>]*>/i.test(html)) { bad.push(`${museum}/${key} — нет <head>`); continue; }
            for (const e of checkMuseumName(html, museum)) bad.push(`${museum}/${key} — ${e}`);
            // Превью-сборка (PUBLIC_NOINDEX=1, как в Base.astro): свой robots страницы заменяется на noindex.
            if (process.env.PUBLIC_NOINDEX === '1') html = html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '')
              .replace(/<head([^>]*)>/i, '<head$1>\n<meta name="robots" content="noindex">');
            // Пометки языков (hreflang, как в Base.astro; план сайта Г19): только готовые языки + x-default.
            // Старые пометки страницы — долой; у копии «staraya» (noindex) их нет.
            html = html.replace(/<link\b[^>]*\bhreflang=[^>]*>\s*/gi, '');
            if (!staraya) html = html.replace(/<head([^>]*)>/i, (h) => `${h}\n${hreflangi(self, base, site).map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}">`).join('\n')}`);
            // Шрифты (CLS 0,16–0,29 у дней, #2004): полная страница идёт мимо Base.astro и не получала ни одного
            // preload — Playfair/Inter приходили после первой отрисовки и сдвигали шапку дня. Теперь файлы тех
            // семейств, которыми набрана сама страница, — заранее, сразу после <head>. Google-шрифты старой
            // страницы (чужой CDN, приходят ещё позже) — на свой assets/fonts.css, preconnect к ним — долой.
            // до замены Google-ссылки: в её адресе — имена семейств. Плюс свои подключённые CSS страницы (sport:
            // имена шрифтов только в museum-den.css — без них инлайн пуст и шрифты падали в системные, 18.10).
            const ownCssFiles = [...html.matchAll(/<link\b[^>]*\brel=["']?stylesheet["']?[^>]*>/gi)]
              .map((l) => /\bhref=["']([^"'?#]+\.css)/i.exec(l[0])?.[1]).filter((h) => h && !/^(?:https?:)?\/\//.test(h) && !/fonts\.css$/.test(h))
              .map((h) => path.join('public', h.startsWith('/') ? h.replace(/^\/(?:rc-site\/)?/, '') : path.posix.join('muzei', museum, h)))
              .filter((fp) => fp.startsWith('public' + path.sep) && fs.existsSync(fp)).map((fp) => [fp, fs.readFileSync(fp, 'utf8')]);
            const ownCss = ownCssFiles.map(([, css]) => css).join('\n');
            // Шрифт блока «Поддержать» (museum-support.js: Inter или Playfair Display) — тоже инлайном, иначе
            // движок докачивает весь fonts.css (48 КБ) после загрузки.
            const fams = [...new Set([...usedFamilies(html + '\n' + ownCss), ...(/museum-support\.js/.test(html) ? ['Inter', 'Playfair Display'] : [])])];
            html = html
              .replace(/<link\b[^>]*\brel=["']?(?:preconnect|dns-prefetch)["']?[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*/gi, '')
              .replace(/<link\b[^>]*fonts\.googleapis\.com\/css[^>]*>/gi, `<link rel="stylesheet" href="${base}assets/fonts.css">`)
              .replace(/@import\s+url\(\s*['"]?https?:\/\/fonts\.googleapis\.com\/css[^)]*\)\s*;?/gi, `@import url('${base}assets/fonts.css');`);
            // Весь fonts.css (48 КБ, 113 @font-face) блокировал отрисовку (FCP −600…750 мс, замер 18.10) → инлайн
            // только семейств страницы (src/lib/shrifty.mjs faceCss). Ссылка и @import на fonts.css — долой.
            // Семейства для preload — из самой страницы ДО инлайна @font-face: иначе pageFamilies видел вписанные
            // блоки всех музеев (museum-theme.css в ownCss) и ставил 16 preload (~400 КБ) вместо 4; они забирали канал у
            // блокирующего museum-theme.css, и LCP (h1 дня) ждал CSS до 2,3 с (трасса 19.10, день 01-09).
            // museum-theme.css (темы всех музеев) — не в счёт; свой CSS музея и адрес Google Fonts (имена через «+») — в счёт.
            const preloadFams = usedFamilies(html + '\n' + ownCssFiles.filter(([fp]) => !/museum-theme\.css$/.test(fp)).map(([, css]) => css).join('\n'));
            const FONTS_LINK = /<link\b[^>]*\bhref=["'][^"']*assets\/fonts\.css(?:\?[^"']*)?["'][^>]*>\s*/gi;
            const FONTS_IMPORT = /@import\s+url\(\s*['"]?[^'")]*assets\/fonts\.css(?:\?[^'")]*)?['"]?\s*\)\s*;?/gi;
            if (FONTS_LINK.test(html) || FONTS_IMPORT.test(html)) {
              html = html.replace(FONTS_LINK, '').replace(FONTS_IMPORT, '');
              const css = faceCss(fams, base);
              if (css) html = html.replace(/<\/head>/i, `<style data-rc-fonts>${css}</style>\n</head>`);
            }
            // Сразу за <meta charset>: кодировка должна остаться в первых 1024 байтах.
            const preloads = fontFiles(preloadFams).map((f) => preloadTag(base, f)).join('\n');
            if (preloads) html = /<meta\s+charset[^>]*>/i.test(html) ? html.replace(/<meta\s+charset[^>]*>/i, (m) => `${m}\n${preloads}`)
              : html.replace(/<head([^>]*)>/i, `<head$1>\n${preloads}`);
            // Адреса, вписанные в страницу от корня превью (/rc-site/…) или старого сайта (/rc-museum-preview/…), —
            // в атрибутах и в строках скриптов, — на свой base: на домене russian-civilization.ru (18.10) приставки нет.
            html = html
              .replace(/(["'])\/(?:rc-site|rc-museum-preview)\//gi, `$1${base}`)
              .replace(/<head([^>]*)>/i, `<head$1>\n<base href="${base}muzei/${museum}/">`)
              .replace(/(\bhref\s*=\s*["'])#/gi, `$1${self}#`)
              .replace(/(\s(?:href|src|poster|data-src|data-poster)\s*=\s*)(["'])([^"']*)\2/gi,
                (m, a, q, u) => `${a}${q}${absolute(u, `${base}muzei/${museum}/`)}${q}`)
              .replace(/(\ssrcset\s*=\s*)(["'])([^"']*)\2/gi, (m, a, q, v) => `${a}${q}${v.split(',')
                .map((part) => part.replace(/^(\s*)(\S+)/, (x, sp, u) => sp + absolute(u, `${base}muzei/${museum}/`)))
                .join(',')}${q}`)
              .replace(/(\burl\(\s*)(['"]?)([^'")]+)\2(\s*\))/gi,
                (m, a, q, u, z) => `${a}${q}${absolute(u, `${base}muzei/${museum}/`)}${q}${z}`);
            // Карточка пересылки старой страницы смотрит на старый сайт (rc-museum-preview) — тот же файл есть у нас
            // в public/ → адрес на свой сайт (17.10, круг 1 приёмки, п.«в»): старый сайт переадресуется и уйдёт.
            if (site) html = html.replace(/(<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["'])https:\/\/arabelthera-dot\.github\.io\/rc-museum-preview\/([^"'?#]+)/gi,
              (m, a, rel) => fs.existsSync(path.join('public', decodeURIComponent(rel))) ? a + new URL(`${base}${rel}`, site).href : m);
            // Прочие абсолютные адреса старого сайта (JSON-LD url/logo/image, ссылки, feed.xml) — на свой адрес
            // (18.10, домен russian-civilization.ru): старые страницы на новом сайте есть по тем же путям (legacyRedirects).
            if (site) html = html.replace(/https?:\/\/arabelthera-dot\.github\.io\/rc-museum-preview\//gi, new URL(base, site).href);
            // Нет своей карточки пересылки у старой страницы — кадр дня из карточки (images[0]), п.2 очереди 1, 17.10.
            const card = path.join('src/content/days', museum, `${key}.json`);
            const img = fs.existsSync(card) && JSON.parse(fs.readFileSync(card, 'utf8')).images?.[0];
            if (img && site && !/property=["']og:image["']/i.test(html)) {
              const abs = new URL(/^https?:/.test(img.src) ? img.src : `${base}${img.src.replace(/^\//, '')}`, site).href;
              html = html.replace(/<\/head>/i, `<meta property="og:image" content="${abs}" />\n<meta name="twitter:image" content="${abs}" />\n</head>`);
            }
            // Карточка пересылки в WebP (9 старых страниц: 7 своих и 2 из кадра карточки, Б9 19.10): ВК WebP в превью не показывает — рядом в dist
            // кладётся JPG-копия (sharp, качество 85) и og:image/twitter:image смотрят на неё. Текст страницы не трогается.
            if (site) {
              const own = new URL(base, site).href;
              for (const [tag, a, u] of [...html.matchAll(/(<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["'])([^"'?#]+\.webp)/gi)]) {
                if (!u.startsWith(own)) continue;
                const rel = decodeURIComponent(u.slice(own.length));
                const src = path.join(root, rel), jpg = src.replace(/\.webp$/i, '.jpg');
                if (!fs.existsSync(jpg) && fs.existsSync(src)) await sharp(src).flatten({ background: '#ffffff' }).jpeg({ quality: 85 }).toFile(jpg);
                if (fs.existsSync(jpg)) html = html.split(tag).join(a + u.replace(/\.webp$/i, '.jpg'));
              }
            }
            // Значок аудиогида (сценарий 5 приёмки, круг 2, 18.10): «🎧» в кнопках старых страниц на машинах без
            // цветного эмодзи-шрифта рисуется квадратом — при сборке заменяется встроенным SVG, текст кнопки как есть.
            html = html.replace(/(>\s*)🎧️?\s*/g, `$1${AUDIO_ICON} `);
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
                  typicalAgeRange: typicalAgeRange(znak(museum, key)),
                  author: redakciyaLd(new URL(base, site).href), publisher: redakciyaLd(new URL(base, site).href), license: LICENZIYA };
                add.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
              }
              // Своя ld+json у старой страницы — возраст (436-ФЗ, Р41) отдельной WebPage этого адреса.
              if (!add.some((x) => x.includes('typicalAgeRange'))) add.push(`<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org',
                '@type': 'WebPage', url, inLanguage: 'ru', typicalAgeRange: typicalAgeRange(znak(museum, key)) })}</script>`);
              html = html.replace(/<\/head>/i, `${add.join('\n')}\n</head>`);
            }
            // Подпись «Редакция», лицензия CC BY 4.0 (Р34, Р35), «Проверено» и журнал исправлений (Е5) — как у шаблонов
            // (Base.astro, страница дня): журнал — перед подвалом страницы, строка лицензии — в конце подвала.
            const zh = staraya ? undefined : zhurnal(museum, key);
            if (site) html = ldRedakciya(html, redakciyaLd(new URL(base, site).href), zh?.modified);
            html = html.replace(/<meta\s+name=["']author["'][^>]*>\s*/gi, '').replace(/<link\s+rel=["']license["'][^>]*>\s*/gi, '')
              .replace(/<\/head>/i, `<meta name="author" content="${REDAKCIYA}" />\n<link rel="license" href="${LICENZIYA}" />\n<link rel="stylesheet" href="${base}assets/rc-podval.css" />\n</head>`);
            {
              const lic = licenziyaHtml(base, { links: true });
              const fOpen = html.search(/<footer\b(?![\s\S]*<footer\b)/i), fClose = html.lastIndexOf('</footer>');
              if (fOpen > 0 && fClose > fOpen) html = html.slice(0, fOpen) + zhurnalHtml(zh) + html.slice(fOpen, fClose) + lic + html.slice(fClose);
              else html = html.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${zhurnalHtml(zh)}${lic}\n</body>`);
            }
            // «Поделиться» — один раз (glazami п.16): у страницы свой блок — строку museum-chrome не ставим,
            // а museum-support.js не добавляет кнопку, если на странице уже есть блок «Поделиться».
            if (/class=["'](?:sharerow|wrap share|share)\b|id=["']sharefinal["']/i.test(html))
              html = html.replace(/(<script[^>]*src=["'][^"']*museum-chrome\.js)/i,
                '<script>window.MUSEUM_CHROME=Object.assign(window.MUSEUM_CHROME||{},{shareRow:false})</script>\n$1');
            html = staticChrome(html);
            html = staticSecnav(html, base, `${base}muzei/${museum}/`, self);
            // Единая верхняя полоса (Сергей 17.10) — сразу после <body…>; старые крошки страницы не трогаем.
            // Яндекс Метрика (тот же код, что Metrika.astro в Base.astro) — один раз; уже есть в исходнике — не дублируем.
            if (!/mc\.yandex\.ru\/metrika\/tag\.js/.test(html)) html = html.replace(/<\/head>/i, `${metrikaHtml}\n</head>`);
            // Знак 436-ФЗ (Р41, Е3, 20.10) — в полосе; на 12+/16+ под ней строка «Родителю», на <html> — data-rc-bez-ochkov:
            // museum-score.js / museum-quiz.js и rc-vozrast.css не показывают очки и звания; фраза про очки в тексте — долой.
            const vz = znak(museum, key);
            const bez = bezOchkov(vz);
            html = html.replace(/<html\b/i, `<html data-rc-vozrast="${vz}"${bez ? ' data-rc-bez-ochkov' : ''}`);
            if (bez) html = html.replace(/\s*За (?:каждый )?верный ответ — \d+ очк\w* из 100\./g, '')
              .replace(/Для викторины и счёта нужен JavaScript; без него очки не начисляются\./g, 'Для викторины нужен JavaScript.');
            html = html.replace(/<\/head>/i, `<style data-rc-vozrast>${VOZRAST_CSS}</style>\n${sitebarAssets(base)}\n</head>`)
              .replace(/<body([^>]*)>/i, (b) => `${b}\n${sitebarHtml({ base, slug: museum, title: MUSEUMS[museum], here: whenOfKey(key), vozrast: znakHtml(vz) })}${roditelyuHtml(roditelyu(museum, key))}`);
            // Версия для слабовидящих (Д7): класс — первым скриптом <head> (до стилей, без мигания), кнопка — в начале <body>.
            html = html.replace(/<head(?:\s[^>]*)?>/i, (h) => `${h}\n<script>${slabovidHeadJs}</script>`)
              .replace(/<\/head>/i, `<link rel="stylesheet" href="${base}assets/rc-slabovid.css" />\n</head>`)
              .replace(/<body([^>]*)>/i, (b) => `${b}\n${slabovidButtonHtml()}`);
            html = staticHero(html);
            if (!/\srel=["'](?:prev|next)["']/i.test(html)) html = html.replace(/<\/body>/i, `${sosediHtml(base, museum, keys, key)}\n</body>`);
            html = await imgSizes(html, root, base);
            if (!MUSEUMS[museum]) { bad.push(`${museum}/${key} — музея нет в museums.json`); continue; }
            fs.writeFileSync(out, html);
            n++;
          }
          // файл пишется, только если его кто-то грузит (у arhitektura, skazki календарь внутри страницы или нет)
          if (kal && nKal > kalDo) {
            fs.writeFileSync(path.join(root, 'muzei', museum, kal.name), kal.js);
            kalFaily.push(`${museum}/${kal.name} (${kal.keys} дн., ${nKal - kalDo} стр.)`);
          }
        }
        if (bad.length) throw new Error(`полные страницы дней:\n${bad.join('\n')}`);
        checkSitebars(root, base);
        checkNoGoogleFonts();
        console.log(`full-pages: календарь из записей дней — ${kalFaily.join(', ')}; подменено тегов: ${nKal}`);
        console.log(`full-pages: ${n} дней — полная страница; верхняя полоса и имя музея в шапке проверены; Google-шрифтов нет`);
      },
    },
  };
}
