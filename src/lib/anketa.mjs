// Анкета большой страницы дня: разрезка HTML на блоки и обратная сборка (ADR docs/adr/0001-anketa-dnya.md).
// Одна правда для конвертера scripts/full-page-to-anketa.mjs и шаблона src/components/den/DenBlok.astro.
// Тип блока по id/классу/тегу. Порядок важен: первое совпадение.
export const TYPES = [
  ['shapka', (b) => b.tag === 'header' && /\btop\b/.test(b.cls)],
  ['kroshki', (b) => /\bcrumbs\b/.test(b.cls)],
  ['oblozhka', (b) => /\bhero\b|\bhero-(?:lead|text|scene|under)\b|\bscene-caption\b/.test(b.cls) || /^hero/.test(b.id)],
  ['navigaciya', (b) => /\bdaynav\b/.test(b.cls) || b.id === 'secnav'],
  ['dokument', (b) => b.id === 'dokument' || /data-proof-block/.test(b.open) || /^(?:tower-sheet|chertezh|patent|dokument-)/.test(b.id)],
  ['video', (b) => b.id === 'video'],
  ['audiogid', (b) => b.id === 'audioguide' || b.id === 'audiogid'],
  ['istoriya', (b) => /^(?:story|istoriya|heart|put|pervenstvo)$/.test(b.id)],
  ['istochniki', (b) => /^(?:sources|sources-rights|itog)$/.test(b.id)],
  ['citata', (b) => b.id === 'credo' || b.tag === 'blockquote' || /\bquote\b/.test(b.cls)],
  ['more', (b) => b.id === 'more'],
  ['podderzhat', (b) => /^(?:support|podderzhat)/.test(b.id) || /\brc-sub\b|\bsupport\b/.test(b.cls)],
  ['interaktiv', (b) => /^(?:games|quiz|fork|chat-sec|razbor|trudno-poverit|result|chto-zametit|theme-inventions|zoom|scale|myth)/.test(b.id)],
  ['kalendar', (b) => b.id === 'calendar'],
  ['kuda-dalshe', (b) => /^(?:kuda-dalshe|catalog|mirovoy-kontekst)/.test(b.id)],
  ['podval', (b) => b.tag === 'footer'],
  ['dvizhok', (b) => b.tag === 'script' && /\ssrc=["'][^"']*assets\/[\w-]+\.js/.test(b.open)],
  ['nastroyki', (b) => b.tag === 'script' && /type=["']application\/json["']/.test(b.open)],
  ['kod', (b) => b.tag === 'script'],
  ['stil', (b) => b.tag === 'style'],
  ['sluzhebnoe', (b) => b.tag === 'noscript' || /\bskip\b/.test(b.cls)],
  ['razdel', () => true],
];

const VOID = /^(?:area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
function elementEnd(html, start) {
  const open = /^<([a-zA-Z][\w-]*)\b[^>]*>/.exec(html.slice(start));
  if (!open) return -1;
  const tag = open[1].toLowerCase();
  if (VOID.test(tag) || /\/>$/.test(open[0])) return start + open[0].length;
  if (tag === 'script' || tag === 'style') {
    const e = html.toLowerCase().indexOf(`</${tag}`, start + open[0].length);
    return e < 0 ? -1 : html.indexOf('>', e) + 1;
  }
  const re = new RegExp(`<!--[\\s\\S]*?-->|<(script|style)\\b[\\s\\S]*?</\\1\\s*>|<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<!--') || m[1]) continue;
    if (m[2]) depth--; else if (!/\/>$/.test(m[0])) depth++;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

// Разрезать документ: doc (всё до <body> включительно и хвост) + блоки верхнего уровня тела.
export function split(html) {
  const bodyOpen = /<body\b[^>]*>/i.exec(html);
  if (!bodyOpen) throw new Error('нет <body>');
  const from = bodyOpen.index + bodyOpen[0].length;
  const to = html.toLowerCase().lastIndexOf('</body>');
  const headOpen = /<head\b[^>]*>/i.exec(html);
  const headClose = html.search(/<\/head>/i);
  const doc = {
    prolog: html.slice(0, headOpen.index),
    head_attrs: headOpen[0].slice(5, -1),
    head: html.slice(headOpen.index + headOpen[0].length, headClose),
    between: html.slice(headClose + 7, bodyOpen.index),
    body_attrs: bodyOpen[0].slice(5, -1),
    epilog: html.slice(to),
  };
  const body = [];
  let i = from, lead = '';
  while (i < to) {
    const lt = html.indexOf('<', i);
    if (lt < 0 || lt >= to) { lead += html.slice(i, to); break; }
    lead += html.slice(i, lt);
    let end;
    if (html.startsWith('<!--', lt)) end = html.indexOf('-->', lt) + 3;
    else if (html.startsWith('</', lt)) end = html.indexOf('>', lt) + 1; // беспризорный закрывающий тег (01-05: </body> посреди)
    else end = elementEnd(html, lt);
    if (end <= lt || end > to) end = to;
    const piece = html.slice(lt, end);
    if (!/^<[a-zA-Z]/.test(piece)) { lead += piece; i = end; continue; }
    body.push(block(lead, piece));
    lead = '';
    i = end;
  }
  if (lead) body.push({ type: 'razdel', html: lead });
  return { doc, body };
}

function attr(open, name) {
  return new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i').exec(open)?.[2] ?? '';
}
function block(lead, piece) {
  const open = /^<[^>]*>/.exec(piece)[0];
  const b = { tag: /^<([\w-]+)/.exec(open)[1].toLowerCase(), id: attr(open, 'id'), cls: attr(open, 'class'), open };
  const type = TYPES.find(([, f]) => f(b))[0];
  const out = { type };
  if (b.id) out.id = b.id;
  const nav = attr(open, 'data-nav');
  if (nav) out.nav = nav;
  // Интерактив = имя движка из public/assets/*.js + его настройки JSON — полями, а не куском HTML.
  if (type === 'dvizhok') {
    const src = attr(open, 'src');
    out.engine = /assets\/([\w-]+)\.js/.exec(src)[1];
    out.src = src;
    const rest = open.replace(/^<script|>$/g, '').replace(/\s+src\s*=\s*(["']).*?\1/i, '');
    if (rest.trim()) out.attrs = rest;
    if (piece !== `<script${out.attrs ?? ''} src="${src}"></script>`) out.html = piece; // нестандартная запись — храним как есть
    if (lead) out.lead = lead;
    return out;
  }
  if (type === 'nastroyki') {
    const inner = piece.slice(open.length, piece.lastIndexOf('</'));
    try {
      out.config = JSON.parse(inner);
      out.attrs = open.replace(/^<script|>$/g, '');
      out.raw = inner; // точная запись JSON — для сверки 1:1; шаблон берёт её, пока config не правили
      if (lead) out.lead = lead;
      return out;
    } catch { /* не JSON — как есть */ }
  }
  out.html = lead + piece;
  return out;
}

// Обратная сборка блока — по ней рисует шаблон src/components/den/DenBlok.astro.
export function blockHtml(b) {
  if (b.html !== undefined && b.type !== 'dvizhok') return b.html;
  const lead = b.lead ?? '';
  if (b.type === 'dvizhok') return lead + (b.html ?? `<script${b.attrs ?? ''} src="${b.src}"></script>`);
  if (b.type === 'nastroyki') return `${lead}<script${b.attrs}>${b.raw ?? JSON.stringify(b.config)}</script>`;
  return '';
}
export function assemble({ doc, body }) {
  return `${doc.prolog}<head${doc.head_attrs}>${doc.head}</head>${doc.between}<body${doc.body_attrs}>`
    + body.map(blockHtml).join('') + doc.epilog;
}

