// Маленький разбор HTML в дерево (без зависимостей) — для чтения старых готовых страниц src/data/full-pages.
// Узел: { tag, at: {…}, deti: [узлы|строки], roditel }. script/style/svg/template — внутрь не разбираются.
const PUSTYE = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const SYROE = new Set(['script', 'style', 'svg', 'template', 'noscript', 'textarea']);
// Тег, открытие которого закрывает незакрытый такой же (p внутри p не бывает и т. п.).
const SAMO = { p: /^(p)$/, li: /^(li)$/, dt: /^(dt|dd)$/, dd: /^(dt|dd)$/, option: /^(option)$/, tr: /^(tr)$/, td: /^(td|th)$/, th: /^(td|th)$/ };
const BLOK_ZAKRYVAET_P = /^(div|section|article|aside|figure|ul|ol|h[1-6]|table|details|header|footer|nav|blockquote|form|p)$/;

export function atributy(s) {
  const at = {};
  for (const m of s.matchAll(/([\w:@.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) at[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return at;
}
export function razobrat(html) {
  const koren = { tag: '#root', at: {}, deti: [], roditel: null };
  let tek = koren;
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!doctype[^>]*>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+|<)/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[4] !== undefined) { tek.deti.push(m[4]); continue; }
    if (m[1]) {
      const t = m[1].toLowerCase();
      let u = tek; while (u && u.tag !== t) u = u.roditel;
      if (u && u.roditel) tek = u.roditel; // закрыли и всё незакрытое внутри
      continue;
    }
    if (!m[2]) continue;
    const tag = m[2].toLowerCase();
    const at = atributy(m[3]);
    if (tek.tag === 'p' && BLOK_ZAKRYVAET_P.test(tag)) tek = tek.roditel;
    if (SAMO[tag] && SAMO[tag].test(tek.tag)) tek = tek.roditel;
    const uzel = { tag, at, deti: [], roditel: tek };
    tek.deti.push(uzel);
    if (SYROE.has(tag)) {
      const konec = html.toLowerCase().indexOf(`</${tag}`, re.lastIndex);
      const k = konec < 0 ? html.length : konec;
      uzel.syroe = html.slice(re.lastIndex, k);
      re.lastIndex = konec < 0 ? html.length : html.indexOf('>', k) + 1;
      continue;
    }
    if (PUSTYE.has(tag) || /\/\s*$/.test(m[3])) continue;
    tek = uzel;
  }
  return koren;
}
const SUSHN = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…', shy: '' };
export const razvernut = (s) => s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (x, k) => (k[0] === '#' ? String.fromCodePoint(k[1] === 'x' || k[1] === 'X' ? parseInt(k.slice(2), 16) : +k.slice(1)) : SUSHN[k.toLowerCase()] ?? x));
export function tekst(u) {
  if (typeof u === 'string') return razvernut(u);
  if (SYROE.has(u.tag)) return '';
  return u.deti.map((d) => (typeof d !== 'string' && /^(br|p|div|li|h\d)$/.test(d.tag) ? ' ' : '') + tekst(d)).join('');
}
export const chistyj = (u) => tekst(u).replace(/\s+/g, ' ').trim();
export function* obhod(u) { for (const d of u.deti) if (typeof d !== 'string') { yield d; yield* obhod(d); } }
export const klassy = (u) => (u.at?.class || '').split(/\s+/).filter(Boolean);
export const elementy = (u) => u.deti.filter((d) => typeof d !== 'string');
