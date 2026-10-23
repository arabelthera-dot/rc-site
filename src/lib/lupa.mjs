// Лупа на кадр (решение Сергея Р178, 23.10.2026): посетитель приближает кадр страницы музея — пальцами, двойным
// касанием, колесом, клавиатурой — и рассматривает детали. Просмотрщик — PhotoSwipe v5 (npm, MIT), не самоделка;
// он заменил прежнюю картину во весь экран rc-uvelichenie.js (Р84, Б20). Сборка — src/integrations/lupa.mjs,
// вид — public/assets/rc-lupa.css, поведение — public/assets/rc-lupa.js.
//
// ВЫКЛЮЧАТЕЛЬ — одна константа: false — кадры не размечаются и скрипт лупы на страницы не ставится,
// страницы работают как раньше, кадр просто не приближается.
export const LUPA_VKL = true;

// Меньше этого по длинной стороне — лупа не включается: увеличивать было бы нечего, кроме пикселей.
export const MIN_STORONA = 1200;

// Что считается кадром: своя растровая картинка (jpg/png/webp) в <figure> или внутри ссылки на файл картинки.
// Не кадр (лупа не ставится): механики и всё, что меняет скрипт (у <img> id или data-*src*/data-*image* — та же
// примета, что в kartinki.mjs), картинки внутри <canvas>/<svg>/кнопок/подписей полей/<summary>/навигации/шапки
// сайта, внутри ссылки на страницу (не на файл), в <noscript>/<template>, и опт-аут data-rc-bez-lupy
// (data-rc-bez-uv — прежнее имя, тоже чтится) на самой картинке или любом предке.
const RASTER = /\.(jpe?g|png|webp)$/i;
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title']);
const NE_KADR = new Set(['button', 'label', 'summary', 'nav', 'canvas', 'svg', 'noscript', 'template', 'select', 'option']);
const OPT_OUT = /\sdata-rc-bez-(?:lupy|uv)(?:[\s=>]|$)/i;

const attr = (tag, name) => {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
};
const put = (tag, s) => tag.replace(/\s*\/?>$/, (end) => ` ${s}${end}`);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
export const putOf = (url, base) => {
  if (!url || !url.startsWith(base) || url.startsWith('//')) return null;
  const p = url.slice(base.length).split(/[?#]/)[0];
  try { return decodeURI(p); } catch { return null; }
};

// Кадры страницы: [{ tag, index, src, full, reason }] — reason пуст, если это кадр; иначе — почему нет.
export function kadry(html, base = '/') {
  const out = [];
  const stack = [];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)\b[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    if (!m[2]) continue;
    const name = m[2].toLowerCase();
    if (m[1]) { // закрывающий: снять до своего открывающего (лишний — пропустить)
      const i = stack.findLastIndex((e) => e.name === name);
      if (i >= 0) stack.length = i;
      continue;
    }
    if (RAW.has(name)) { // содержимое скрипта/стиля — не разметка
      const end = html.toLowerCase().indexOf(`</${name}`, re.lastIndex);
      re.lastIndex = end < 0 ? html.length : end;
      continue;
    }
    if (name === 'img') {
      const tag = m[0];
      const src = attr(tag, 'src') ?? '';
      const own = putOf(src, base);
      let reason = '';
      const link = stack.findLast((e) => e.name === 'a');
      const href = link && attr(link.tag, 'href');
      const hrefPut = href && putOf(href, base);
      const linkToFile = hrefPut && RASTER.test(hrefPut);
      if (!own || !RASTER.test(own)) reason = 'не своя растровая картинка';
      else if (/\sid\s*=|\sdata-(?!lupa)[\w-]*(?:src|image)[\w-]*\s*=/i.test(tag)) reason = 'картинку меняет скрипт';
      else if (OPT_OUT.test(tag) || stack.some((e) => OPT_OUT.test(e.tag))) reason = 'data-rc-bez-lupy';
      else if (stack.some((e) => NE_KADR.has(e.name))) reason = 'внутри механики или служебного блока';
      else if (stack.some((e) => e.name === 'header' && /class\s*=\s*["'][^"']*rc-sb/i.test(e.tag))) reason = 'шапка сайта';
      else if (link && !linkToFile) reason = 'картинка — ссылка на страницу';
      else if (!linkToFile && !stack.some((e) => e.name === 'figure')) reason = 'не в figure';
      out.push({ tag, index: m.index, src, own, full: linkToFile ? hrefPut : own, fullUrl: linkToFile ? href : src, inLink: !!linkToFile, reason });
      continue;
    }
    if (!VOID.has(name) && !m[0].endsWith('/>')) stack.push({ name, tag: m[0] });
  }
  return out;
}

// Разметить страницу: кадрам с исходником не меньше MIN_STORONA — data-lupa (адрес файла), data-lupa-w/-h
// (размер файла, снят на сборке) и data-lupa-srcset (копии kartinki + сам файл — телефон не качает оригинал,
// пока не приблизит). razmer(put) → [w, h] | null. Возвращает { html, vkl, kadrov, prichiny }.
export function razmetit(html, { base = '/', razmer, min = MIN_STORONA }) {
  const list = kadry(html, base);
  const prichiny = {};
  let vkl = 0, kadrov = 0;
  const repl = [];
  for (const k of list) {
    if (k.reason && k.reason !== 'не в figure' && k.reason !== 'картинка — ссылка на страницу') {
      if (k.reason !== 'не своя растровая картинка') prichiny[k.reason] = (prichiny[k.reason] || 0) + 1;
      continue;
    }
    if (k.reason) continue; // обычная картинка страницы, не кадр
    kadrov++;
    const d = razmer(k.full);
    if (!d) { prichiny['нет файла'] = (prichiny['нет файла'] || 0) + 1; continue; }
    const [w, h] = d;
    if (Math.max(w, h) < min) { prichiny[`исходник мельче ${min} px`] = (prichiny[`исходник мельче ${min} px`] || 0) + 1; continue; }
    let t = k.tag;
    if (/\sdata-lupa\s*=/i.test(t)) continue;
    t = put(t, `data-lupa="${esc(k.fullUrl)}" data-lupa-w="${w}" data-lupa-h="${h}"`);
    const srcset = attr(k.tag, 'srcset');
    if (srcset && k.full === k.own) {
      const own = `${base}${encodeURI(k.full)}`;
      const set = srcset.split(',').map((s) => s.trim()).filter(Boolean);
      if (!set.some((s) => s.endsWith(` ${w}w`))) set.push(`${own} ${w}w`);
      t = put(t, `data-lupa-srcset="${esc(set.join(', '))}"`);
    }
    repl.push([k.index, k.tag.length, t]);
    vkl++;
  }
  for (const [i, len, t] of repl.reverse()) html = html.slice(0, i) + t + html.slice(i + len);
  return { html, vkl, kadrov, prichiny };
}

// Подключение на страницу с хотя бы одним кадром под лупу: вид — в <head> (значок и курсор без мигания),
// скрипт — defer; сам PhotoSwipe и его стиль скрипт подгружает при первом открытии.
export const lupaHead = (base) => `<link rel="stylesheet" href="${base}assets/rc-lupa.css">\n<script defer src="${base}assets/rc-lupa.js"></script>\n`;
