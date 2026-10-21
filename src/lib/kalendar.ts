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
// Источник без адреса (21.10): адрес — по сайту, названному в тексте («(rvb.ru)»; только домены из
// data/razreshennye-domeny.txt, если сайта нет в списке — ссылки нет), иначе по названию учреждения из словаря data/uchrezhdeniya.json
// («Картина в Третьяковской галерее» → tretyakovgallery.ru). Данные дней не правятся — одно правило в одном месте.
const lnk = (href: string, text: string) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const URL_IN_SRC = /https?:\/\/[^\s<>"]+?(?=[.,;:)»]*(?:\s|$))/g;
const hostOf = (h: string) => h.toLowerCase().replace(/^www\./, '');
const RAZR = fs.readFileSync('data/razreshennye-domeny.txt', 'utf8').split('\n').map((s) => s.trim())
  .filter((s) => s && !s.startsWith('#')).map(hostOf);
// web.archive.org без пути — пустая главная архива, не источник
const razreshen = (h: string) => h !== 'web.archive.org' && RAZR.some((r) => h === r || h.endsWith('.' + r));
const DOMEN = /(?<![\w@.\/-])((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,})(\/[^\s()<>"«»]*[^\s()<>"«».,;:])?(?![\w-])/gi;
const UCH: { re: RegExp; url: string }[] = JSON.parse(fs.readFileSync('data/uchrezhdeniya.json', 'utf8')).uchrezhdeniya
  .map((u: { shablon: string; url: string }) => ({ re: new RegExp(`(?<!\\p{L})(?:${u.shablon})(?!\\p{L})`, 'u'), url: u.url }));
// Адрес источника по тексту без адреса: сайт из текста или учреждение из словаря; null — не нашли.
export const srcAdresHtml = (t: string): string | null => {
  let est = false;
  const sDomenom = t.replace(DOMEN, (m, h: string, put = '') => {
    if (!razreshen(hostOf(h))) return m;
    est = true;
    return lnk(`https://${h}${put}`, m);
  });
  if (est) return sDomenom;
  for (const u of UCH) {
    const m = t.match(u.re);
    if (m && m.index !== undefined) return t.slice(0, m.index) + lnk(u.url, m[0]) + t.slice(m.index + m[0].length);
  }
  return null;
};
export const srcHtml = (v?: string) => {
  const t = escSrc(stripSrcPrefix(v));
  if (/https?:\/\//.test(t)) return t.replace(URL_IN_SRC, (u) => lnk(u, u));
  return srcAdresHtml(t) ?? t;
};
