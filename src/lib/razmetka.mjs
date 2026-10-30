// Проверка разметки schema.org (Д5 плана сайта, 20.10.2026): офлайн, по спецификации, без кабинетов Google и Яндекса.
// Синтаксис JSON-LD + обязательные и рекомендуемые поля по типам: schema.org (типы и их свойства) и правила
// расширенных результатов Google (Article: headline, image, author.name, datePublished/dateModified в ISO 8601;
// Organization: name, url, logo). Длину headline не проверяем: прежнего предела 110 знаков у Google больше нет —
// «Consider using a concise title, as long titles may be truncated» (https://developers.google.com/search/docs/appearance/structured-data/article,
// сверено 20.10.2026, ред. 08.09.2026); Яндекс тип Article для сниппетов не поддерживает и длину не задаёт
// (https://yandex.ru/support/webmaster/ru/schema-org/what-is-schema-org). Адрес url разметки страницы должен совпадать с canonical — иначе поисковик
// приписывает разметку чужой странице. Сборка только предупреждает (src/integrations/zakon.mjs).
import { kadrLd } from './prava-ld.mjs';

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
  Event: [['name', est], ['startDate', est]],
  VisualArtwork: [['name', est], ['image', est]],
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
      for (const k of ['datePublished', 'dateModified', 'startDate', 'endDate']) if (est(u[k]) && !(ISO.test(u[k]) || /^\d{4}(-\d{2})?$/.test(u[k]))) bedy.push(`${tip}: ${k} не ISO 8601 («${u[k]}»)`);
      for (const k of ['url', 'image', 'logo', 'license']) for (const v of [u[k]].flat()) {
        const s = typeof v === 'object' && v ? v.url ?? v.contentUrl : v;
        if (est(s) && !ABS.test(s)) bedy.push(`${tip}: ${k} не абсолютный адрес («${s}»)`);
      }
      // Разметка этой страницы (не вложенный музей/сайт) — о её адресе
      if (canonical && u.url && ['WebPage', 'CollectionPage', 'Article'].includes(tip) && u.url !== canonical) bedy.push(`${tip}: url ${u.url} ≠ canonical ${canonical}`);
    }
  }
  return bedy;
}

export const canonicalIz = (html) => /<link[^>]*rel=["']?canonical["']?[^>]*href=["']([^"']+)["']/i.exec(html)?.[1];

// Событие и произведения дня (Д5, пакет 3 описи 22.10.2026) — один построитель на оба шаблона дня (Base.astro и
// full-pages.mjs). Event — само событие дня: startDate из ключа ММ-ДД и года карточки; год-промежуток («1943–1944») —
// годы начала и конца без дня; года нет или он словами («XII век») — узла нет. VisualArtwork — настоящие кадры дня
// у музеев, где кадр сам произведение (живопись, карикатура); сгенерированное и реконструкции — не произведения.
const VID_PROIZVEDENIYA = { iskusstvo: 'живопись', karikatura: 'карикатура' };
const god = (y) => String(y).padStart(4, '0');

export function sobytieLd({ title, year, key, url, image }) {
  if (!title || year == null || year === '') return undefined;
  const odin = /^\d{1,4}$/.exec(String(year).trim()), dva = /^(\d{3,4})\s*[–—-]\s*(\d{3,4})$/.exec(String(year).trim());
  if (!odin && !dva) return undefined;
  const dates = odin ? { startDate: `${god(odin[0])}-${key}` } : { startDate: god(dva[1]), endDate: god(dva[2]) };
  return { '@context': 'https://schema.org', '@type': 'Event', '@id': `${url}#sobytie`, name: title, ...dates, url,
    // Р396 п.2: картинка события — ImageObject с паспортом (карточка пересылки og/ — наша, CC BY), не голая строка.
    ...(image ? { image: typeof image === 'string' ? kadrLd({ src: image, license: /\/og\//.test(image) ? 'Русская цивилизация, CC BY 4.0' : '' }) : image } : {}) };
}

export function proizvedeniyaLd({ museum, images = [], url, absolyut }) {
  const artform = VID_PROIZVEDENIYA[museum];
  if (!artform) return [];
  return images.filter((i) => !i.generated && i.src && !/\.svg$/i.test(i.src)).map((i, n) => ({
    '@context': 'https://schema.org', '@type': 'VisualArtwork', '@id': `${url}#proizvedenie-${n + 1}`,
    name: i.caption, image: kadrLd({ src: absolyut(i.src), license: i.license ?? '', text: `${i.caption ?? ''}. ${i.credit ?? ''}` }), artform, creditText: i.credit, url }));
}
