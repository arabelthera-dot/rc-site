// Соседи полной страницы дня (Р165, 23.10.2026). Блок «Куда дальше» (kd-card «Следующий / Предыдущий день») и стрелки
// шапки (window.MUSEUM_CHROME.prev/next) вписаны в старые страницы руками и отставали от календаря: 17 января вёл на
// 30-е, 18-е и 19-е не связаны. Теперь их переписывает сборка: сосед — ближайшая по году полная страница того же музея
// (по кругу, 14 декабря → 1 января), подпись — её <h1>, строка под ней — хук её карточки дня. Новая полная страница
// встаёт в цепочку сама; ссылка ведёт только на собранную полную страницу — битой не бывает. Нижняя строка
// «← предыдущий / следующий день» (sosediHtml в full-pages.mjs) по-прежнему ведёт на соседние дни календаря.
import { decode } from './imya-muzeya.mjs';

// Музеи, где блок и стрелки — соседи по дням года. Остальные музеи — своим порядком, пока не решено иначе.
export const SOSEDI_POLNYE = new Set(['izobreteniya']);

export function polnyeSosedi(keys, key) {
  const k = [...new Set(keys)].sort(), i = k.indexOf(key), n = k.length;
  if (i < 0 || n < 2) return {};
  return { prev: k[(i - 1 + n) % n], next: k[(i + 1) % n] };
}

export const zagolovok = (html) => decode((/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsStr = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/</g, '\\u003c');

const KD = /(<div class="kd-card[^"]*">\s*<span class="kd-lbl">)(Следующ|Предыдущ)[^<]*(<\/span>\s*<a\b[^>]*?\bhref=")[^"]*("[^>]*>)[\s\S]*?(<span class="kd-arr">[\s\S]*?<\/a>\s*<p>)[\s\S]*?(<\/p>)/g;
const CHROME = /(\b(prev|next)\s*:\s*\{\s*href\s*:\s*)'[^']*'(\s*,\s*title\s*:\s*)'[^']*'/g;

// sosed: { prev, next } — каждый { href, when, title, hook }; нет соседа — место не трогается.
export function perepisatSosedey(html, sosed) {
  if (!sosed.prev && !sosed.next) return html;
  const chromeAt = html.search(/window\.MUSEUM_CHROME\s*=/);
  return html
    .replace(KD, (m, a, lbl, b, c, d, e) => {
      const s = lbl === 'Следующ' ? sosed.next : sosed.prev;
      if (!s) return m;
      return `${a}${lbl === 'Следующ' ? 'Следующий день' : 'Предыдущий день'}${b}${s.href}${c}${esc(`${s.when} — ${s.title}`)} ${d}${esc(s.hook)}${e}`;
    })
    .replace(CHROME, (m, a, rel, b, off) => {
      const s = sosed[rel];
      if (!s || chromeAt < 0 || off < chromeAt) return m;
      return `${a}'${jsStr(s.href)}'${b}'${jsStr(`${s.when} · ${s.title}`)}'`;
    });
}
