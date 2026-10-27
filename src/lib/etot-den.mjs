// «Этот день во всех музеях» (Р286 п.2, 27.10.2026): узел даты /segodnya/<ММ-ДД>/ и блок «Этот день в других
// музеях» внизу каждой готовой страницы дня. Одно место для страницы узла (src/pages/segodnya/[key]/index.astro)
// и для сборки полных страниц (src/integrations/full-pages.mjs) — чистый node, без astro:content.
// Готовый день — машинно, без ручных списков: полная страница src/data/full-pages/<музей>/<ключ>.html или анкета
// (карточка src/content/days/<музей>/<ключ>.json с body, ADR 0001), и карточка дня есть; ключ «сверх года»
// у недатированного музея — не дата (то же правило, что «Сегодня» на главной, src/lib/segodnya.ts).
// Карточка «День готовится» — не готовый день: в узел и в блок не идёт, ссылок на пустые страницы нет.
// Имя музея — ровно title_ru из src/data/museums.json (src/lib/imya-muzeya.mjs). Вид — public/assets/rc-etot-den.css.
import fs from 'node:fs';
import path from 'node:path';
import { MUSEUMS, decode } from './imya-muzeya.mjs';
import { zagolovok } from './sosedi-polnye.mjs';

const FULL = 'src/data/full-pages';
const DAYS = 'src/content/days';
const YEAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const NOMER = Object.fromEntries(JSON.parse(fs.readFileSync('src/data/museums.json', 'utf8')).museums.map((m) => [m.slug, m.number]));
const datirovan = (slug) => {
  const p = `src/data/calendar-meta-${slug}.json`;
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).dated !== false : true;
};
const MES_R = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export const kogda = (key) => `${+key.slice(3)} ${MES_R[+key.slice(0, 2) - 1]}`;
export const adresUzla = (base, key) => `${base}segodnya/${key}/`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let cache;
// Map «ММ-ДД» → готовые дни даты по номеру музея: { museum, museumTitle, key, title, hook, img?, alt? }
export function gotovyeDni() {
  if (cache) return cache;
  cache = new Map();
  const slugs = [...new Set([...(fs.existsSync(FULL) ? fs.readdirSync(FULL) : []), ...(fs.existsSync(DAYS) ? fs.readdirSync(DAYS) : [])])]
    .filter((s) => MUSEUMS[s]).sort((a, b) => (NOMER[a] ?? 999) - (NOMER[b] ?? 999) || a.localeCompare(b));
  for (const museum of slugs) {
    const dated = datirovan(museum);
    const dir = path.join(DAYS, museum);
    for (const f of (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((x) => x.endsWith('.json')).sort()) {
      const key = f.slice(0, -5);
      if (!/^\d\d-\d\d$/.test(key) || (!dated && +key.slice(3) > YEAR[+key.slice(0, 2) - 1])) continue;
      const card = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const html = path.join(FULL, museum, `${key}.html`);
      const polnaya = fs.existsSync(html);
      if (!polnaya && !card.body) continue;
      const first = (card.images ?? []).find((i) => i?.src && (/^https?:/.test(i.src) || fs.existsSync(path.join('public', i.src.replace(/^\//, '')))));
      const title = (polnaya && zagolovok(fs.readFileSync(html, 'utf8'))) || decode(card.title ?? key);
      (cache.get(key) ?? cache.set(key, []).get(key)).push({ museum, museumTitle: MUSEUMS[museum], key, title, hook: card.hook, img: first?.src, alt: first?.caption });
    }
  }
  return cache;
}
export const datyUzlov = () => [...gotovyeDni().keys()].sort();
export const adresDnya = (base, museum, key) => `${base}muzei/${museum}/den/${key}/`;

// Блок «Этот день в других музеях» для полной страницы дня museum/key. Других готовых дней этой даты нет — пусто
// (блок без ссылок не ставится). Ссылки — только на собранные готовые дни и на узел даты, битой не бывает.
export function blokDrugieMuzei(base, museum, key) {
  const drugie = (gotovyeDni().get(key) ?? []).filter((d) => d.museum !== museum);
  if (!drugie.length) return '';
  const li = drugie.map((d) => `<li class="rc-ed-item"><a class="rc-ed-link" href="${adresDnya(base, d.museum, d.key)}">`
    + `<span class="rc-ed-muzey">${esc(d.museumTitle)}</span><span class="rc-ed-title">${esc(d.title)}</span></a></li>`).join('');
  return `<section class="rc-etot-den" aria-labelledby="rc-ed-h"><h2 class="rc-ed-h" id="rc-ed-h">Этот день в других музеях</h2>`
    + `<ul class="rc-ed-list">${li}</ul><p class="rc-ed-vse"><a href="${adresUzla(base, key)}">Все музеи ${kogda(key)} →</a></p></section>`;
}
