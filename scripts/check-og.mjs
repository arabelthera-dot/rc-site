// Паспорт пересылки и поиска у каждой страницы dist (задача «карточка в Telegram/ВК», 17.10):
// og:title, og:image (абсолютный), og:description, meta description, og:url, og:type, twitter:card, canonical, <title>.
// Переадресации (meta refresh) и noindex-заглушки не считаются. Выход 1, если есть страница без полного набора.
import fs from 'node:fs';
import path from 'node:path';
const DIST = process.argv[2] || 'dist';
const need = {
  title: /<title>[^<]+<\/title>/i,
  description: /<meta\s+name=["']description["']\s+content=["'][^"']{20,}/i,
  'og:title': /property=["']og:title["']\s+content=["'][^"']+/i,
  'og:description': /property=["']og:description["']\s+content=["'][^"']+/i,
  'og:image': /property=["']og:image["']\s+content=["']https?:\/\//i,
  'og:url': /property=["']og:url["']\s+content=["']https?:\/\//i,
  'og:type': /property=["']og:type["']/i,
  'twitter:card': /name=["']twitter:card["']\s+content=["']summary_large_image/i,
  canonical: /rel=["']canonical["']/i,
};
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) files.push(p);
} })(DIST);
let total = 0, full = 0, skipped = 0; const miss = {}; const bad = [];
// og:title = title (18.10): мягкая сверка — число расхождений; выход 1 только при OG_STROGO=1.
const dec = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const diff = [];
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  if (!/http-equiv=["']refresh/i.test(h)) { const t = /<title>([^<]*)<\/title>/i.exec(h)?.[1], o = /property=["']og:title["']\s+content=(["'])(.*?)\1/i.exec(h)?.[2];
  if (t != null && o != null && dec(t) !== dec(o)) diff.push(`${path.relative(DIST, f)}: «${dec(t)}» ≠ «${dec(o)}»`); }
  if (/http-equiv=["']refresh/i.test(h) || /name=["']robots["']\s+content=["'][^"']*noindex/i.test(h)) { skipped++; continue; }
  total++;
  const m = Object.keys(need).filter((k) => !need[k].test(h));
  if (!m.length) { full++; continue; }
  m.forEach((k) => (miss[k] = (miss[k] || 0) + 1));
  bad.push(`${path.relative(DIST, f)}: ${m.join(', ')}`);
}
console.log(`check-og: всего ${total}, с полным набором ${full}, без набора ${total - full} (пропущено переадресаций/noindex: ${skipped})`);
console.log(`check-og: og:title ≠ title на ${diff.length} из ${total + skipped} (без переадресаций, вместе с noindex)`);
if (diff.length) console.log(diff.slice(0, 10).join('\n'));
if (diff.length && process.env.OG_STROGO === '1') process.exit(1);
if (bad.length) { console.log('нет поля → страниц:', miss); console.log(bad.slice(0, 15).join('\n')); process.exit(1); }
