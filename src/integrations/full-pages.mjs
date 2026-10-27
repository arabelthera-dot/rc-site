// Адрес дня = полная страница: у дня с готовой страницей старого сайта (src/data/full-pages, scripts/full-pages.mjs)
// muzei/<музей>/den/<ключ>/index.html — эта страница 1:1 вместо карточки. <base> на папку музея — относительные
// пути (картинки, ../../assets/, соседние day-*.html → переадресации) работают при любом base.
// Якоря href="#…" при <base> вели бы на папку музея — переписываются на собственный адрес страницы.
// Относительные href/src/poster/srcset/url() — в абсолютные от папки музея: <base> видит браузер, но не проверка
// ссылок (lychee резолвит от адреса файла — 757 ложных «нет файла», rc-site#16); <base> остаётся для скриптов.
// data-src/data-poster (ленивые аудио, видео, картинки) — так же (20.10): обход сайта резолвил их от адреса
// /den/MM-DD/ и нашёл 18 «битых» файлов; проверка — scripts/data-src.mjs в proverka.
import { cspVkl, cspMeta } from '../lib/csp.mjs';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { metrikaHtml } from '../lib/metrika.mjs';
import { hreflangi, stroka, poUmolchaniyu, yazyk } from '../lib/yazyki.mjs';
import { sitebarHtml, sitebarAssets, whenOfKey, podpiskaHtml } from '../lib/sitebar.mjs';
import { slabovidHeadJs, slabovidButtonHtml, slabovidCssHtml } from '../lib/slabovid.mjs';
import { failKalendarya } from '../lib/kalendar-dannye.mjs';
import { cardFrames, fullFrames, kadryNeNaStranice } from '../lib/podpisi.mjs';
import { MUSEUMS, decode, checkMuseumName } from '../lib/imya-muzeya.mjs';
import { znak, znakHtml, roditelyu, roditelyuHtml, bezOchkov, typicalAgeRange } from '../lib/vozrast.mjs';
import { fontFiles, pageFamilies, preloadTag, usedFamilies, faceCss } from '../lib/shrifty.mjs';
import { podvalDnyaHtml } from '../lib/podval-dnya.mjs';
import { sobytieLd, proizvedeniyaLd } from '../lib/razmetka.mjs';
import { SOSEDI_POLNYE, polnyeSosedi, perepisatSosedey, zagolovok } from '../lib/sosedi-polnye.mjs';
import { blokDrugieMuzei } from '../lib/etot-den.mjs';
import { REDAKCIYA, LICENZIYA, redakciyaLd, licenziyaHtml, zhurnal, zhurnalHtml } from '../lib/redakciya.mjs';

// Подпись и лицензия в JSON-LD старой страницы (Р34, Р35): author/publisher-организация — сам сайт или его музей
// («Русская цивилизация», «Музей русской карикатуры») → Редакция; чужие (издатель гравюры, Person) не трогаются.
// У произведений (есть headline или тип *Page/Article/CreativeWork) — license и, если нет, author; даты выхода и правки — из git.
// Д5 (20.10.2026): url страницы-произведения — её адрес на сайте (canonical), а не файл старого сайта day-….html.
const WORK = /(?:Article|Page|CreativeWork|LearningResource|Course)$/;
function ldRedakciya(html, red, { modified, published, url } = {}) {
  // Картинка статьи — og:image самой страницы (Google Article: image), если своей в ld+json нет.
  const image = /<meta\b[^>]*\bproperty=["']og:image["'][^>]*\bcontent=["']([^"']+)["']/i.exec(html)?.[1];
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
      n.publisher ??= red;
      n.license ??= LICENZIYA;
      if (/Article/.test(t.join())) {
        if (modified) n.dateModified ??= modified; if (published) n.datePublished ??= published;
        if (image && /^https?:\/\//.test(image)) n.image ??= image;
      }
      if (url && typeof n.url === 'string' && /\.html?$/.test(n.url)) n.url = url;
    }
    return a + JSON.stringify(data).replace(/</g, '\\u003c') + z;
  });
}

const SRC = 'src/data/full-pages';
const VOZRAST_CSS = fs.readFileSync('public/assets/rc-vozrast.css', 'utf8');
// Подвал и кнопка «глаз» — по 1–1,5 КБ, внутрь <head> вместо блокирующих запросов (Б10, скорость, 20.10).
const PODVAL_CSS = fs.readFileSync('public/assets/rc-podval.css', 'utf8');
const SLABOVID_KNOPKA_CSS = fs.readFileSync('public/assets/rc-slabovid-knopka.css', 'utf8');
const POLNYY_DEN_CSS = fs.readFileSync('public/assets/rc-polnyy-den.css', 'utf8'); // контраст подвала (Б10)
// «Этот день в других музеях» (Р286 п.2) — вид блока, тот же файл, что у узла даты /segodnya/<ММ-ДД>/.
const ETOT_DEN_CSS = fs.readFileSync('public/assets/rc-etot-den.css', 'utf8');
// Имя музея и разбор сущностей — общие со сборкой поста в каналы (src/lib/imya-muzeya.mjs, Е8).

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
// Проверка — checkMuseumName из src/lib/imya-muzeya.mjs (та же функция проверяет пост в каналы).

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

// Тег старого файла данных календаря музея: <script src="[…/]calendar-<x>.js"> или «[…/]calendar.js» (nikitin/calendar.js —
// копия января первопроходцев со старого сайта, А4 20.10); движки museum-calendar-*.js и kalendar-dney.<хеш>.js не задевает.
const OLD_KAL = /(<script\b[^>]*?\ssrc\s*=\s*)(["'])(?:[^"']*\/)?calendar(?:-[\w-]+)?\.js(?:\?[^"']*)?\2/gi;

// Д2 (план сайта, 20.10): у каждого кадра — автор/источник и лицензия. Разбор — src/lib/podpisi.mjs (тот же, что у
// /avtory-izobrazheniy/ и npm run proverka-podpisey). В сборке — предупреждение со счётом; строгий режим
// RC_PODPISI_STROGO=1 (выключен до починки кадров хозяевами страниц) — кадр без подписи или лицензии роняет сборку.
function checkPodpisi() {
  const cards = cardFrames(), pages = fullFrames();
  const red = [...cards.filter((f) => !f.credit), ...pages.filter((f) => f.state === 'none')];
  const yellow = [...cards.filter((f) => f.credit && !f.lic), ...pages.filter((f) => f.state === 'partial')];
  if (!red.length && !yellow.length) return console.log(`podpisi: ${cards.length + pages.length} кадров — у всех подпись и лицензия`);
  const msg = `podpisi: из ${cards.length + pages.length} кадров без подписи ${red.length}, без лицензии ${yellow.length} — список: npm run proverka-podpisey -- --spisok`;
  if (process.env.RC_PODPISI_STROGO === '1') throw new Error(`${msg}\n${red.map((f) => `${f.museum}/${f.key} ${f.src}`).join('\n')}`);
  console.warn(`⚠ ${msg}`);
}

// Р132 (22.10): кадр карточки не показан на полной странице дня (замена #333 вырезала figure, кадр лёг только в json).
// Только отчёт — сборку не роняет (новых замков без слова Сергея нет). Починка: python3 scripts/kadr.py vernut --primenit.
function checkKadryKartochki() {
  const net = kadryNeNaStranice();
  if (!net.length) return console.log('kadry: все кадры карточек дней показаны на их полных страницах');
  console.warn(`⚠ kadry: ${net.length} кадр(ов) карточки не показаны на полной странице дня — python3 scripts/kadr.py vernut\n${net.map((x) => `  ${x.museum}/${x.key} ${x.src}`).join('\n')}`);
}

// Замок на второй путь к календарю (план сайта А4, 20.10; как AI_Projects #2284): данные календаря — только из записей
// src/content/days (src/lib/kalendar-dannye.mjs). Файл в public/, который сам задаёт window.MUSEUM_CALENDAR = {…},
// — второй источник дат мимо src/: сайт не собирается.
function checkNetStaryhKalendarey() {
  const bad = [];
  const walk = (d) => {
    for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) { walk(f); continue; }
      if (!/\.(?:js|html?)$/i.test(e.name)) continue;
      const code = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '')
        .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
      if (/window\.MUSEUM_CALENDAR\s*=\s*\{/.test(code)) bad.push(f);
    }
  };
  walk('public');
  if (bad.length) throw new Error(`второй путь к календарю — данные дней мимо src/content/days (${bad.length}):\n${bad.join('\n')}`);
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
        checkNetStaryhKalendarey();
        checkPodpisi();
        checkKadryKartochki();
        if (!fs.existsSync(SRC)) { checkSitebars(root, base); checkNoGoogleFonts(); return; }
        const bad = [];
        let n = 0;
        let nKal = 0;
        const kalFaily = [];
        for (const museum of fs.readdirSync(SRC).sort()) {
          // Календарь страницы (museum-calendar-month.js) — из записей дней (шаг 4Б ядра, 19.10): один файл на музей
          // dist/muzei/<музей>/kalendar-dney.<хеш>.js вместо старого public/muzei/<музей>/calendar-<x>.js.
          // Старые calendar-<x>.js удалены (19.10), nikitin/calendar.js — 20.10 (А4): нет записей, а тег остался — ошибка сборки.
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
          // «Куда дальше» и стрелки шапки — ближайшие полные страницы музея (src/lib/sosedi-polnye.mjs, Р165).
          const polnye = SOSEDI_POLNYE.has(museum) ? [...new Set(jobs.map((j) => j.key))] : [];
          // Пилот den-shablon (Р297): день из карточки src/content/dni-shablon и общего шаблона — den-shablon/<ключ>/,
          // как анкета: from = out (страницу собрал шаблон), дальше тот же конвейер. Копия для сверки 1:1 с den/<ключ>/ —
          // noindex и без hreflang, как staraya; журнал правок — как у живой страницы (иначе не 1:1).
          const shablonDir = path.join(root, 'muzei', museum, 'den-shablon');
          if (fs.existsSync(shablonDir)) for (const key of fs.readdirSync(shablonDir).sort()) {
            const out = path.join(shablonDir, key, 'index.html');
            if (fs.existsSync(out)) jobs.push({ key, self: `${base}muzei/${museum}/den-shablon/${key}/`, out, from: out, shablon: true });
          }
          const sosedInfo = (k) => {
            const card = JSON.parse(fs.readFileSync(path.join(cardsDir, `${k}.json`), 'utf8'));
            const src = path.join(SRC, museum, `${k}.html`);
            const title = (fs.existsSync(src) && zagolovok(fs.readFileSync(src, 'utf8'))) || card.title;
            return { href: `${base}muzei/${museum}/den/${k}/`, when: whenOfKey(k), title, hook: card.hook };
          };
          for (const { key, self, out, from, staraya, shablon } of jobs) {
            if (!fs.existsSync(path.join(root, 'muzei', museum, 'den', key, 'index.html'))) { bad.push(`${museum}/${key} — нет карточки дня`); continue; }
            let html = fs.readFileSync(from, 'utf8');
            if (kalSrc) html = html.replace(OLD_KAL, (m, a, q) => { nKal++; return `${a}${q}${kalSrc}${q}`; });
            else if (OLD_KAL.test(html)) { OLD_KAL.lastIndex = 0; bad.push(`${museum}/${key} — тег старого calendar-*.js, а записей дней нет`); continue; }
            if (staraya || shablon) { fs.mkdirSync(path.dirname(out), { recursive: true }); html = html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '').replace(/<head([^>]*)>/i, '<head$1>\n<meta name="robots" content="noindex">'); }
            if (!/<head[^>]*>/i.test(html)) { bad.push(`${museum}/${key} — нет <head>`); continue; }
            if (polnye.length) {
              const { prev, next } = polnyeSosedi(polnye, key);
              html = perepisatSosedey(html, { prev: prev && sosedInfo(prev), next: next && sosedInfo(next) });
            }
            // CSP (Р64): полная страница идёт мимо Base.astro — та же meta сразу после <head>; выключено без PUBLIC_CSP=1.
            if (cspVkl()) html = html.replace(/<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>\s*/gi, '').replace(/<head([^>]*)>/i, (h) => `${h}\n${cspMeta()}`);
            for (const e of checkMuseumName(html, museum)) bad.push(`${museum}/${key} — ${e}`);
            // Превью-сборка (PUBLIC_NOINDEX=1, как в Base.astro): свой robots страницы заменяется на noindex.
            if (process.env.PUBLIC_NOINDEX === '1') html = html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '')
              .replace(/<head([^>]*)>/i, '<head$1>\n<meta name="robots" content="noindex">');
            // Пометки языков (hreflang, как в Base.astro; план сайта Г19): только готовые языки + x-default.
            // Старые пометки страницы — долой; у копии «staraya» (noindex) их нет.
            html = html.replace(/<link\b[^>]*\bhreflang=[^>]*>\s*/gi, '');
            if (!staraya && !shablon) html = html.replace(/<head([^>]*)>/i, (h) => `${h}\n${hreflangi(self, base, site).map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}">`).join('\n')}`);
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
            // Нет и кадра в карточке — главный кадр самой страницы (hero, иначе первый растровый <img>), Д5 20.10:
            // literatura/02-01 была под noindex, check-og её пропускал, и страница вышла без og:image и без image в Article.
            const heroSrc = () => {
              const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map(([t]) => t)
                .filter((t) => /\ssrc=["'][^"']+\.(?:jpe?g|png|webp)["']/i.test(t));
              const t = imgs.find((x) => /class=["'][^"']*\bhero/i.test(x)) ?? imgs[0];
              return t && /\ssrc=["']([^"']+)["']/i.exec(t)[1];
            };
            if (site && !/property=["']og:image["']/i.test(html)) {
              const src = img ? (/^https?:/.test(img.src) ? img.src : `${base}${img.src.replace(/^\//, '')}`) : heroSrc();
              if (src) {
                const abs = new URL(src, site).href;
                html = html.replace(/<\/head>/i, `<meta property="og:image" content="${abs}" />\n<meta name="twitter:image" content="${abs}" />\n</head>`);
              }
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
                  // isPartOf — страница музея (CreativeWork), музей — её about: Museum в isPartOf schema.org не допускает (как Base.astro).
                  isPartOf: { '@type': 'WebPage', name: MUSEUMS[museum], url: new URL(`${base}muzei/${museum}/`, site).href,
                    about: { '@type': 'Museum', name: MUSEUMS[museum], url: new URL(`${base}muzei/${museum}/`, site).href } },
                  typicalAgeRange: typicalAgeRange(znak(museum, key)),
                  author: redakciyaLd(new URL(base, site).href), publisher: redakciyaLd(new URL(base, site).href), license: LICENZIYA };
                add.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
              }
              // Событие и произведения дня (Д5, пакет 3, 22.10) — тем же построителем, что у шаблона (Base.astro), и у страниц со своей ld+json.
              if (MUSEUMS[museum] && d.title) {
                const dated = JSON.parse(fs.readFileSync(`src/data/calendar-meta-${museum}.json`, 'utf8')).dated;
                const ogImg = /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i.exec(html)?.[1];
                const absolyut = (src) => new URL(/^https?:/.test(src) ? src : `${base}${src.replace(/^\//, '')}`, site).href;
                const sobytie = dated ? sobytieLd({ title: d.title, year: d.year, key, url, image: ogImg }) : undefined;
                for (const u of [sobytie, ...proizvedeniyaLd({ museum, images: d.images, url, absolyut })].filter(Boolean))
                  add.push(`<script type="application/ld+json">${JSON.stringify(u).replace(/</g, '\\u003c')}</script>`);
              }
              // Своя ld+json у старой страницы — возраст (436-ФЗ, Р41) отдельной WebPage этого адреса.
              if (!add.some((x) => x.includes('typicalAgeRange'))) add.push(`<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org',
                '@type': 'WebPage', url, inLanguage: 'ru', typicalAgeRange: typicalAgeRange(znak(museum, key)) })}</script>`);
              html = html.replace(/<\/head>/i, `${add.join('\n')}\n</head>`);
            }
            // Подпись «Редакция», лицензия CC BY 4.0 (Р34, Р35), «Проверено» и журнал исправлений (Е5) — как у шаблонов
            // (Base.astro, страница дня): журнал — перед подвалом страницы, строка лицензии — в конце подвала.
            // Журнал на странице — только у основной; даты статьи в разметке — у обеих (копия «staraya» — та же статья).
            const zhKartochki = zhurnal(museum, key), zh = staraya ? undefined : zhKartochki;
            if (site) html = ldRedakciya(html, redakciyaLd(new URL(base, site).href), { modified: zhKartochki?.modified, published: zhKartochki?.published, url: new URL(self, site).href });
            html = html.replace(/<meta\s+name=["']author["'][^>]*>\s*/gi, '').replace(/<link\s+rel=["']license["'][^>]*>\s*/gi, '')
              .replace(/<\/head>/i, `<meta name="author" content="${REDAKCIYA}" />\n<link rel="license" href="${LICENZIYA}" />\n<style data-rc-podval>${PODVAL_CSS}\n${POLNYY_DEN_CSS}</style>\n</head>`);
            // Область <main> (WCAG 1.3.1, Lighthouse landmark-one-main; Б10, 20.10): у 61 полной страницы её нет —
            // всё от <body> до подвала страницы (последний <footer> верхнего уровня). Полоса и кнопка «глаз» встают позже — снаружи.
            if (!/<main\b|role=["']main["']/i.test(html)) {
              const b = html.match(/<body\b[^>]*>/i), f = html.search(/\n<footer\b(?![\s\S]*\n<footer\b)/i);
              if (b && f > b.index) { const a = b.index + b[0].length; html = `${html.slice(0, a)}\n<main>${html.slice(a, f)}\n</main>${html.slice(f)}`; }
            }
            {
              // Общий подвал дня (А2+Б6, Р84) — из шаблона src/lib/podval-dnya.mjs, тот же, что у карточки дня.
              const zag = decode(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, '').trim() || key);
              const lic = podvalDnyaHtml({ base, title: zag, url: site ? new URL(self, site).href : self }) + licenziyaHtml(base, { links: true });
              // «Этот день в других музеях» (Р286 п.2, src/lib/etot-den.mjs) — перед журналом и подвалом; у копии «staraya» нет.
              // Других готовых дней этой даты нет — блока нет.
              const ed = staraya ? '' : blokDrugieMuzei(base, museum, key);
              if (ed) html = html.replace(/<\/head>/i, `<style data-rc-etot-den>${ETOT_DEN_CSS}</style>\n</head>`);
              const fOpen = html.search(/<footer\b(?![\s\S]*<footer\b)/i), fClose = html.lastIndexOf('</footer>');
              if (fOpen > 0 && fClose > fOpen) html = html.slice(0, fOpen) + ed + zhurnalHtml(zh) + html.slice(fOpen, fClose) + lic + html.slice(fClose);
              else html = html.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${ed}${zhurnalHtml(zh)}${lic}\n</body>`);
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
            // Знак 436-ФЗ (Р87, 21.10) — в полосе; на трагическом дне (Р40) под ней строка «Родителю», на <html> — data-rc-bez-ochkov:
            // museum-score.js / museum-quiz.js и rc-vozrast.css не показывают очки и звания; фраза про очки в тексте — долой.
            const vz = znak(museum, key);
            const bez = bezOchkov(museum, key);
            html = html.replace(/<html\b/i, `<html data-rc-vozrast="${vz}"${bez ? ' data-rc-bez-ochkov' : ''}`);
            // Направление письма (Г19, 20.10) — как у шаблонов (Base.astro: dir={lang.dir}): из src/data/yazyki.json по lang страницы.
            {
              const lang = /<html\b[^>]*\slang=["']?([\w-]+)/i.exec(html)?.[1]?.split('-')[0] ?? poUmolchaniyu;
              html = html.replace(/<html\b([^>]*?)\s+dir=["']?[^"'\s>]*["']?/i, '<html$1').replace(/<html\b/i, `<html dir="${yazyk(lang).dir}"`);
            }
            if (bez) html = html.replace(/\s*За (?:каждый )?верный ответ — \d+ очк[а-яё]* из 100\./g, '') // \w без флага u кириллицу не ловит
              .replace(/Для викторины и счёта нужен JavaScript; без него очки не начисляются\./g, 'Для викторины нужен JavaScript.');
            html = html.replace(/<\/head>/i, `<style data-rc-vozrast>${VOZRAST_CSS}</style>\n${sitebarAssets(base)}\n</head>`)
              .replace(/<body([^>]*)>/i, (b) => `${b}\n${sitebarHtml({ base, slug: museum, title: MUSEUMS[museum], here: whenOfKey(key), vozrast: znakHtml(vz) })}${roditelyuHtml(roditelyu(museum, key))}`);
            // Версия для слабовидящих (Д7): класс — первым скриптом <head> (до стилей, без мигания), кнопка — в начале <body>.
            html = html.replace(/<head(?:\s[^>]*)?>/i, (h) => `${h}\n<script>${slabovidHeadJs(base)}</script>`)
              .replace(/<\/head>/i, `<style data-rc-slabovid>${SLABOVID_KNOPKA_CSS}</style>\n${slabovidCssHtml(base)}\n</head>`)
              // печать урока (Б22) и картина во весь экран (Б20) — как у шаблонов (Base.astro)
              .replace(/<\/head>/i, `<link rel="stylesheet" media="print" href="${base}assets/rc-pechat.css">\n</head>`)
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
