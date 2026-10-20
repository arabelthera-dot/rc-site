// Имя музея — ровно title_ru из src/data/museums.json, дословно и полностью (AGENTS.md §6, 17.10).
// Одна проверка для сборки (src/integrations/full-pages.mjs — шапка и текст полных страниц) и для поста
// в каналы (src/lib/proverka-posta.mjs, Е8/Р47). Только чтение, без зависимостей.
import fs from 'node:fs';

export const MUSEUMS = Object.fromEntries(JSON.parse(fs.readFileSync('src/data/museums.json', 'utf8')).museums
  .map((m) => [m.slug, m.title_ru]));
const ALL_TITLES = Object.values(MUSEUMS);

export const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&');

/**
 * Брак имени музея в HTML или тексте: блок шапки (<header class="top">, .museum, .museum-label) с обрезком своего
 * title_ru (например, «Что изобрели русские первыми в мире» без «Музей») и в любом месте «Музей …», обрывающийся
 * раньше полного title_ru любого музея. Полные имена сначала прячутся: «Музей «Русский парк» — как всё начиналось»
 * с тире внутри — не обрезок. Возвращает строки брака.
 */
export function checkMuseumName(html, museum) {
  const bad = [];
  const title = MUSEUMS[museum];
  if (!title) return bad;
  const norm = (x) => decode(x).replace(/\s+/g, ' ').trim();
  const head = /<header class="top"[^>]*>([\s\S]*?)<\/header>/i.exec(html)?.[1] || '';
  const blocks = [...head.matchAll(/<div class="b\d"[^>]*>([^<]*)<\/div>/g), ...head.matchAll(/<div class="museum"[^>]*>([^<]*)<\/div>/g),
    ...html.matchAll(/<div class="museum-label"[^>]*>([^<]*)<\/div>/g)].map((m) => norm(m[1]));
  const core = title.replace(/^.*?«(.*)»[^»]*$/, '$1');
  for (const b of blocks) if (b && b !== title && (title.includes(b) && b.length > 8 || b === core)) bad.push(`шапка «${b}» вместо «${title}»`);
  let text = decode(html).replace(/[  ]+/g, (s) => (s.includes(' ') ? ' ' : ' '));
  for (const t of [...ALL_TITLES].sort((a, b) => b.length - a.length)) text = text.split(t).join('\u0000');
  for (const m of text.matchAll(/[Мм]узей[  ][^<>"'\n·|—,.:;(){}\[\]\u0000]{3,80}/g)) {
    const s = m[0].replace(/\s+/g, ' ').trim();
    const t = ALL_TITLES.find((x) => x !== s && s.length > 8 && x.toLowerCase().startsWith(s.toLowerCase()));
    if (t && !ALL_TITLES.includes(s)) bad.push(`обрезанное имя «${s}» вместо «${t}»`);
  }
  return [...new Set(bad)];
}
