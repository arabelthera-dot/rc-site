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
  for (const { imya, title: t } of korotkieImena(html)) bad.push(`обрезанное имя «${imya}» вместо «${t}»`);
  return [...new Set(bad)];
}

// Прежние имена музеев со старого сайта, которые словами из title_ru не выводятся (инвентаризация src/,
// 20.10.2026, AI_Projects#804). Нашлось новое старое имя — строкой сюда, и проверка его больше не пропустит.
const STARYE_IMENA = {
  'kalendar-pobed': ['Музей русских побед', 'Музей «Календарь побед»'],
  literatura: ['Музей русских писателей'],
  pervoprohodcy: ['Музей «Русские первопроходцы»'],
  iskusstvo: ['Музей «Русское искусство»'],
  izobreteniya: ['Музей изобретений'],
};
// Слова, по которым один музей от другого не отличить: «Музей русских», «Музей народов России» — не обрезок.
const OBSHCHIE = /^(?:и|их|в|россии|русск\S*|российск\S*|народов|народн\S*|детский|музей)$/;
const slova = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[«»"„“]/g, ' ').split(/\s+/).filter(Boolean);
const TITLES = Object.entries(MUSEUMS).map(([slug, title]) => ({ slug, title, w: slova(title) }));
// Слова фразы по порядку входят в слова title_ru (подпоследовательность).
const podposl = (w, t) => { let i = 0; for (const x of t) if (x === w[i]) i++; return i === w.length; };

/**
 * Короткие и прежние имена музеев в HTML или тексте — всё, что выдаёт себя за имя музея, но не равно его title_ru.
 * Полные title_ru сначала прячутся (имя «Музей «Русский парк» — как всё начиналось» с тире — не обрезок). Дальше
 * каждая фраза «Музей …»/«Детский музей …» до знака препинания, тега, кавычки атрибута или строки JS:
 *  — её слова по порядку входят в title_ru одного музея и среди них есть отличительное («Музей «Русские не сдаются»»,
 *    «Музей карикатуры», «Музей спорта», «Музей русской кухни») — обрезок этого музея;
 *  — прежнее имя из STARYE_IMENA («Музей русских побед — календарь…») — старое имя.
 * Чужие музеи («Музей Победы», «Музей Арктики и Антарктики», «Музей радио») целиком ни в один title_ru
 * не входят и не задеваются. Возвращает [{ imya, slug, title }] без повторов.
 */
export function korotkieImena(html) {
  let text = decode(String(html)).replace(/[  ]/g, ' ');
  for (const t of [...ALL_TITLES].sort((a, b) => b.length - a.length)) text = text.split(t).join('\u0000');
  const found = new Map();
  const add = (imya, slug) => found.set(imya, { imya, slug, title: MUSEUMS[slug] });
  for (const [slug, imena] of Object.entries(STARYE_IMENA)) for (const s of imena) if (text.includes(s)) add(s, slug);
  for (const m of text.matchAll(/(?:Детский м|М)узей[ \t]+[^<>"'`\n\r·|—–,.:;!?(){}\[\]\\\u0000]{2,80}/g)) {
    const imya = m[0].replace(/\s+/g, ' ').replace(/[\s«]+$/, '').trim();
    if ([...found.keys()].some((s) => imya.startsWith(s))) continue;
    const w = slova(imya);
    if (!w.some((x) => !OBSHCHIE.test(x))) continue;
    const t = TITLES.find((x) => podposl(w, x.w));
    if (t) add(imya, t.slug);
  }
  return [...found.values()];
}
