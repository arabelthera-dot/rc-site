// Плашка, подпись ссылки и «На чём стоит страница» — из строки «Источник» факта (Р831, Р832). Строка «Источник» в yaml
// (src) — утверждённая (scripts/ns-iz-utverzhdennyh.mjs, scripts/yanvar-v-obrazec.mjs); плашка, подпись и пункты
// источников страницы при переносе брались со старой страницы и с ней расходились. Здесь они сводятся к строке «Источник»:
//   — «два источника» при одном источнике в строке → «один источник» (служебная, на страницу не выводится);
//   — подпись ссылки (stranica) — имя того источника строки, чей адрес стоит в href, если подпись — имя другого источника;
//   — пункт источников «к факту N» / «к фактам N, M» — номера фактов, у которых этот адрес в href или в строке «Источник»;
//   — адрес href факта, которого нет в «На чём стоит страница», дописывается пунктом (подпись — как у дня: «к факту N» или сайт);
//   — пункт «старой страницы», на который не ссылается ни один факт, снимается.
// «документ» и «легенда» не трогаются. Образец — шаг transform у схемы Zod в Astro content collections: данные
// приводятся при загрузке, файл не переписывается (https://docs.astro.build/en/guides/content-collections/).
// Вызов — из faktyIzUtverzhdeno (src/lib/fakty-iz-utverzhdeno.mjs), выключатель тот же: RC_FAKTY_IZ_UTVERZHDENO=0.

import { domainToUnicode } from 'node:url';

// Адрес в строке: полный http(s) или голый «сайт.ru/путь», «сайт.рф/путь» (кириллица — только с путём: «История.РФ» — имя).
const ADRES = /https?:\/\/[^\s;,)<>«»"]+|(?<![\p{L}\d.@\/-])(?:[a-z\d-]+(?:\.[a-z\d-]+)*\.[a-z]{2,})(?:\/[^\s;,)<>«»"]*)?|(?<![\p{L}\d.@\/-])[а-яё\d-]+(?:\.[а-яё\d-]+)*\.(?:рф|рус)\/[^\s;,)<>«»"]*/giu;
// Сравнение адресов: без схемы, www и хвостовых «./», сайт — кириллицей (xn--… → .рф), путь — без %-кодов.
const raskod = (x) => { try { return decodeURI(x); } catch { return x; } };
const chist = (u) => {
  const t = raskod(u.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[.]+$/, '').replace(/\/$/, ''));
  const i = t.indexOf('/');
  const host = i < 0 ? t : t.slice(0, i);
  return (domainToUnicode(host) || host) + (i < 0 ? '' : t.slice(i));
};
const hostAdresa = (u) => chist(u).split('/')[0];

// Строка «Источник» → [{ imya, adres }] по адресам; imya — текст перед адресом до предыдущего адреса и его пояснения в скобках.
export function razobratIstochnik(src) {
  const t = String(src ?? '').replace(/<[^>]+>/g, ' ').replace(/^\s*Источники?:\s*/, '');
  const ist = [];
  let ot = 0;
  for (const m of t.matchAll(ADRES)) {
    const imya = t.slice(ot, m.index).replace(/^[\s.;,)]+/, '').replace(/^\([^)]*\)[\s.;,]*/, '').replace(/[\s,;:(—–-]+$/, '').trim();
    ist.push({ imya, adres: m[0] });
    ot = m.index + m[0].length;
  }
  const kuski = t.split(';').map((x) => x.trim()).filter(Boolean);
  const hosty = new Set(ist.map((x) => hostAdresa(x.adres)));
  return { ist, chislo: Math.max(hosty.size, kuski.length) };
}

// Адрес a ссылается на u: совпадает целиком или a — голый сайт (без пути) того же хоста.
const toZhe = (a, u) => { const ca = chist(a), cu = chist(u); return ca === cu || (!ca.includes('/') && ca === hostAdresa(cu)); };

export function poIstochniku(syroe) {
  const bloki = [syroe.fakty].flat();
  let nomer = 0;
  const udary = [];
  const novye = bloki.map((b) => ({ ...b, udary: (b.udary ?? []).map((u0) => {
    const u = { ...u0 };
    const { ist, chislo } = razobratIstochnik(u.src);
    if (u.pometka === 'два источника' && u.src && chislo < 2) u.pometka = 'один источник';
    if (u.href && u.stranica && ist.length > 1) {
      const svoj = ist.find((x) => toZhe(x.adres, u.href) && x.imya);
      const chuzhoj = ist.some((x) => x !== svoj && x.imya === u.stranica && !toZhe(x.adres, u.href));
      if (svoj && chuzhoj) u.stranica = svoj.imya;
    }
    udary.push({ n: ++nomer, u, ist });
    return u;
  }) }));
  const fakty = Array.isArray(syroe.fakty) ? novye : novye[0];
  if (!Array.isArray(syroe.sources)) return { ...syroe, fakty };

  const ktoSsylaetsya = (href) => udary.filter(({ u, ist }) => (u.href && chist(u.href) === chist(href)) || ist.some((x) => toZhe(x.adres, href))).map((x) => x.n);
  const k = (ns) => (ns.length === 1 ? `к факту ${ns[0]}` : `к фактам ${ns.join(', ')}`);
  const ssylkiHtml = (h) => [...h.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const sources = syroe.sources.flatMap((s) => {
    const adresa = 'html' in s ? ssylkiHtml(s.html) : [s.href];
    const ns = [...new Set(adresa.flatMap(ktoSsylaetsya))].sort((a, b) => a - b);
    if (/стар(?:ой|ая|ую) страниц/i.test(`${s.html ?? ''} ${s.title ?? ''} ${s.note ?? ''}`) && !ns.length) return [];
    if ('note' in s && ns.length && /^к факт(?:у|ам)\s/.test(s.note.trim())) return [{ ...s, note: k(ns) }];
    return [s];
  });
  const poFaktam = syroe.sources.some((s) => /^к факт(?:у|ам)\s/.test(String(s.note ?? '').trim()));
  const est = sources.flatMap((s) => ('html' in s ? ssylkiHtml(s.html) : [s.href]));
  for (const { u, ist } of udary) {
    if (!u.href || est.some((a) => toZhe(a, u.href))) continue;
    est.push(u.href);
    const imya = ist.find((x) => toZhe(x.adres, u.href) && x.imya)?.imya;
    sources.push({ href: u.href, title: imya || u.stranica || hostAdresa(u.href), note: poFaktam ? k(ktoSsylaetsya(u.href)) : hostAdresa(u.href) });
  }
  return { ...syroe, fakty, sources: sources.length ? sources : syroe.sources };
}
