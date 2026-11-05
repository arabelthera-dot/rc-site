// Данные календаря музея из записей дней (src/content/days/<музей>/<ММ-ДД>.json) — одно место для страницы
// календаря (src/pages/muzei/[slug]/calendar.astro) и полных страниц дней (src/integrations/full-pages.mjs).
// Формат — старый window.MUSEUM_CALENDAR: {"ММ-ДД": {t, y, d, mech?, src?, href, link}} + конфиг total/dated/months.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const metaOf = (slug) => {
  const f = `src/data/calendar-meta-${slug}.json`;
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
};

// Год уже стоит в названии («Машины С. Н. Корсакова на перфокартах, 1832») — отдельным полем y не дублируем:
// все три вывода карточки (museum-calendar-month.js, museum-calendar-page.js, calendar.astro) дописывают y к t,
// и выходило «…, 1832 1832» (Р238).
const godVNazvanii = (t, y) => new RegExp(`(^|\\D)${String(y).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\D|$)`).test(t);

// days — данные записей ({key, title, year, hook, mechanic, source}); title уже с подстановкой хука (content.config.ts).
// empty — текст пустого дня (MUSEUM_CALENDAR_EMPTY) из calendar-meta, в объект календаря не входит.
export function kalendarMuzeya(slug, days, base) {
  const { card = [], empty, ...conf } = metaOf(slug);
  const cal = { ...conf };
  for (const d of days) {
    cal[d.key] = { t: d.title, ...(d.year != null && !godVNazvanii(d.title, d.year) && { y: d.year }), d: d.hook ?? '',
      ...(card.includes('mech') && { mech: d.mechanic }), ...(card.includes('src') && { src: d.source }),
      href: `${base}muzei/${slug}/den/${d.key}/`, link: 'Открыть страницу →' };
  }
  return { cal, conf, empty };
}

// Записи музея с диска — для интеграции (мимо getCollection), с тем же transform: title = title || hook.
export function zapisiMuzeya(slug) {
  const dir = path.join('src/content/days', slug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return { ...d, title: d.title || d.hook || '' };
  });
}

// Файл данных для полных страниц: window.MUSEUM_CALENDAR (+ EMPTY) и короткий хеш содержимого для имени.
export function failKalendarya(slug, base) {
  const days = zapisiMuzeya(slug);
  if (!days.length) return null;
  const { cal, empty } = kalendarMuzeya(slug, days, base);
  const js = `window.MUSEUM_CALENDAR=${JSON.stringify(cal)};\n` +
    (empty ? `window.MUSEUM_CALENDAR_EMPTY=${JSON.stringify(empty)};\n` : '');
  const hash = crypto.createHash('sha256').update(js).digest('hex').slice(0, 8);
  return { js, name: `kalendar-dney.${hash}.js`, keys: days.length };
}
