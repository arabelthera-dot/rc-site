// Проверка разметки schema.org (Д5 плана сайта, 20.10.2026): офлайн, по спецификации, без кабинетов Google и Яндекса.
// Синтаксис JSON-LD + обязательные и рекомендуемые поля по типам: schema.org (типы и их свойства) и правила
// расширенных результатов Google (Article: headline ≤110 знаков, image, author.name, datePublished/dateModified в ISO 8601;
// Organization: name, url, logo). Адрес url разметки страницы должен совпадать с canonical — иначе поисковик
// приписывает разметку чужой странице. Сборка только предупреждает (src/integrations/zakon.mjs).

const ISO = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const ABS = /^https?:\/\/[^\s]+$/;
const LD = /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;

// Обязательное по типу: [свойство, проверка, что сказать]
const est = (v) => v != null && v !== '' && !(Array.isArray(v) && !v.length);
const imya = (v) => typeof v === 'string' ? v.trim() !== '' : est(v?.name);
const PRAVILA = {
  WebSite: [['name', est], ['url', est]],
  Organization: [['name', est], ['url', est]],
  Museum: [['name', est], ['url', est]],
  WebPage: [['url', est]],
  CollectionPage: [['name', est], ['url', est]],
  Article: [['headline', est], ['image', est], ['author', imya, 'author без name'], ['publisher', imya, 'publisher без name'],
    ['datePublished', est], ['dateModified', est]],
};

/** Проблемы разметки одной страницы: массив строк (пусто — всё в порядке). canonical — адрес страницы. */
export function proverkaRazmetki(html, canonical) {
  const bedy = [];
  const bloki = [...html.matchAll(LD)];
  if (!bloki.length) return ['нет JSON-LD'];
  for (const [, tekst] of bloki) {
    let data;
    try { data = JSON.parse(tekst); } catch (e) { bedy.push(`синтаксис JSON-LD: ${e.message}`); continue; }
    for (const u of [data].flat()) {
      const tip = [u?.['@type']].flat()[0];
      if (!tip) { bedy.push('узел без @type'); continue; }
      if (!/^https?:\/\/schema\.org\/?$/.test(u['@context'] ?? '')) bedy.push(`${tip}: @context не https://schema.org`);
      for (const [svoystvo, ok, chto] of PRAVILA[tip] ?? []) if (!ok(u[svoystvo])) bedy.push(`${tip}: ${chto ?? `нет ${svoystvo}`}`);
      if (tip === 'Article' && typeof u.headline === 'string' && u.headline.length > 110) bedy.push(`Article: headline длиннее 110 знаков (${u.headline.length})`);
      for (const k of ['datePublished', 'dateModified']) if (est(u[k]) && !ISO.test(u[k])) bedy.push(`${tip}: ${k} не ISO 8601 («${u[k]}»)`);
      for (const k of ['url', 'image', 'logo', 'license']) for (const v of [u[k]].flat()) {
        const s = typeof v === 'object' && v ? v.url : v;
        if (est(s) && !ABS.test(s)) bedy.push(`${tip}: ${k} не абсолютный адрес («${s}»)`);
      }
      // Разметка этой страницы (не вложенный музей/сайт) — о её адресе
      if (canonical && u.url && ['WebPage', 'CollectionPage', 'Article'].includes(tip) && u.url !== canonical) bedy.push(`${tip}: url ${u.url} ≠ canonical ${canonical}`);
    }
  }
  return bedy;
}

export const canonicalIz = (html) => /<link[^>]*rel=["']?canonical["']?[^>]*href=["']([^"']+)["']/i.exec(html)?.[1];
