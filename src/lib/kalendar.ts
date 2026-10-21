// Общие правила календаря музея — одно место для главной портала, главной музея и страницы календаря.
import fs from 'node:fs';

// длина месяцев невисокосного года: у недатированного музея «ДД» — номер записи в месяце
export const YEAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const plural = (n: number, one: string, few: string, many: string) => {
  const n10 = n % 10, n100 = n % 100;
  return n10 === 1 && n100 !== 11 ? one : n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20) ? few : many;
};

// календарь датированный, если в calendar-meta не сказано dated:false (нет файла — датированный)
export const isDated = (slug: string) => {
  const p = `src/data/calendar-meta-${slug}.json`;
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).dated !== false : true;
};

// номер записи больше длины месяца — запись «сверх года» (то же правило, что beyondYear
// в museum-calendar-page.js): в счётчик года не идёт, показывается отдельной группой
export const beyondYear = (key: string, dated: boolean) => !dated && +key.slice(3) > YEAR[+key.slice(0, 2) - 1];

// Все ключи ММ-ДД года с 29 февраля (366): у датированного музея на каждый ключ без карточки —
// страница «День готовится» (den/[key].astro), а не 404.
const pad2 = (n: number) => (n < 10 ? '0' : '') + n;
export const YEAR_KEYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  .flatMap((len, m) => Array.from({ length: len }, (_, d) => `${pad2(m + 1)}-${pad2(d + 1)}`));

// День «готов», если у него есть хук или основной текст (gist); одно название — день ещё готовится.
export const isReady = (d: { hook?: string; gist?: string }) => !!(d.hook || d.gist);

// Ближайший готовый день музея вперёд по году от ключа (сам ключ не в счёт), с переходом через 31.12.
export const nearestReady = <T extends { key: string; hook?: string; gist?: string }>(days: T[], key: string): T | undefined => {
  const ready = days.filter(isReady).sort((a, b) => a.key.localeCompare(b.key));
  return ready.find((d) => d.key > key) ?? ready.find((d) => d.key !== key);
};
// Подпись «Источник» уже стоит в разметке (заголовок блока, строка карточки) — префикс «Источник(и):» из данных
// не дублируем (17.10, круг 1 приёмки: «Источник: Источники:»). Одно правило для календаря и страницы дня.
export const SRC_PREFIX = /^\s*(?:<(?:b|strong|i|em)>\s*)?(?:Источник|Источники|ИСТОЧНИК|ИСТОЧНИКИ)\s*:\s*(?:<\/(?:b|strong|i|em)>\s*)?/i;
export const stripSrcPrefix = (v?: string) => (v ? String(v).replace(SRC_PREFIX, '') : '');
// Источник — ссылкой (Б18, опись Р84, 21.10): адрес в тексте источника становится нажимаемой ссылкой
// («Как сделан музей» обещает, что источник можно открыть самому). Текст экранируется, адрес — без хвостовой пунктуации.
const escSrc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const srcHtml = (v?: string) => escSrc(stripSrcPrefix(v)).replace(/https?:\/\/[^\s<>"]+?(?=[.,;:)»]*(?:\s|$))/g,
  (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
