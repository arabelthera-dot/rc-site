// М78 (AI_Projects #2357, 04.11.2026): авторы статей, на которые ссылаются дни, — сверка с реестром иноагентов.
// Е1 (src/lib/zakon.mjs) ищет имена из реестров только в нашем тексте; автора чужой статьи он не видит. Так на странице
// Родионова (23 янв.) год жила ссылка на «Коммерсантъ» 2004 (kommersant.ru/doc/476951), автор — Олег Кашин, иноагент.
// Здесь: каждый внешний адрес из карточек дней, шаблона дня и полных страниц → автор из кэша data/avtory-ssylok.json
// (JSON-LD author, meta author / article:author, типовые подписи) → sverkaTekstov из zakon.mjs — то же сопоставление
// имён, те же исключения (ключ «<музей>/<ключ>|<вариант>» в data/reestry/isklyucheniya.json), своей копии правил нет.
// Сеть только в наполнении кэша (scripts/avtory-ssylok.mjs --napolnit, локально, через РФ-прокси); сверка — без сети:
// адреса нет в кэше — «не проверено», предупреждение; иноагент-автор — красная.
import fs from 'node:fs';
import path from 'node:path';
import { sverkaTekstov, tekst } from './zakon.mjs';

export const KESH = 'data/avtory-ssylok.json';
const DAYS = 'src/content/days';
const SHABLON = 'src/content/dni-shablon';
const FULL = 'src/data/full-pages';
// Свои: домен сайта и прежнее превью на Pages.
const SVOI = /(^|\.)russian-civilization\.ru$|^arabelthera-dot\.github\.io$/;
// Файлы (кадры, звук, документы) — у них нет страницы с подписью автора.
const FAYL = /\.(jpe?g|png|webp|gif|svg|tiff?|mp3|mp4|webm|ogg|pdf|djvu|zip)(?:$|[?#])/i;
const ls = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []);

/** Адреса из одного текста: без хвостовой пунктуации, без своих и без файлов. */
export function adresaIz(raw) {
  const out = [];
  for (const m of String(raw).matchAll(/https?:\/\/[^\s"'<>\\]+/g)) {
    const url = m[0].replace(/&amp;/g, '&').replace(/[.,;:!?)»\]]+$/, '');
    let u;
    try { u = new URL(url); } catch { continue; }
    if (SVOI.test(u.hostname) || FAYL.test(u.pathname)) continue;
    out.push(url);
  }
  return out;
}

/** Внешние адреса источников: Map url → [«<музей>/<ключ>», …] (дни в порядке файлов, без повторов). */
export function ssylki(root = '.') {
  const map = new Map();
  const add = (den, raw) => { for (const url of adresaIz(raw)) { const d = map.get(url) || []; if (!d.includes(den)) d.push(den); map.set(url, d); } };
  const papka = (dir, re, den) => {
    for (const museum of ls(path.join(root, dir))) {
      for (const f of ls(path.join(root, dir, museum)).filter((x) => re.test(x))) add(den(museum, f), fs.readFileSync(path.join(root, dir, museum, f), 'utf8'));
    }
  };
  papka(DAYS, /\.json$/, (m, f) => `${m}/${f.slice(0, -5)}`);
  papka(SHABLON, /\.ya?ml$/, (m, f) => `${m}/${f.replace(/\.ya?ml$/, '')}`);
  // Полная страница — только ссылки href (адреса в скриптах и стилях — не источники).
  for (const museum of ls(path.join(root, FULL))) {
    for (const f of ls(path.join(root, FULL, museum)).filter((x) => x.endsWith('.html'))) {
      const html = fs.readFileSync(path.join(root, FULL, museum, f), 'utf8');
      add(`${museum}/${f.slice(0, -5)}`, [...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)].map((m) => m[1]).join(' '));
    }
  }
  return map;
}

const razmetka = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/\s+/g, ' ').trim();
// Имя, а не адрес профиля и не служебное слово.
const imya = (s) => { const t = razmetka(s || ''); return t && !/^https?:|^\//.test(t) && t.length <= 120 ? t : ''; };
const atr = (tag, a) => (new RegExp(`\\b${a}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i').exec(tag) || [])[2];

/** Автор страницы: JSON-LD author, meta name=author / article:author / property=author, затем типовые подписи. Несколько — через «; ». */
export function avtorIz(html) {
  const out = [];
  const push = (s) => { const t = imya(s); if (t && !out.includes(t)) out.push(t); };
  // JSON-LD: author — строка, объект { name } или список; ищем во всём дереве (@graph, mainEntity…).
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let j;
    try { j = JSON.parse(m[1].trim()); } catch { continue; }
    const obhod = (v) => {
      if (Array.isArray(v)) return v.forEach(obhod);
      if (!v || typeof v !== 'object') return;
      for (const k of ['author', 'creator']) {
        for (const a of [v[k]].flat()) { if (typeof a === 'string') push(a); else if (a && typeof a === 'object' && a['@type'] !== 'Organization') push(a.name); }
      }
      Object.values(v).forEach((x) => typeof x === 'object' && obhod(x));
    };
    obhod(j);
  }
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const k = (atr(m[0], 'name') || atr(m[0], 'property') || atr(m[0], 'itemprop') || '').toLowerCase();
    if (['author', 'article:author', 'og:article:author', 'dc.creator', 'citation_author', 'mediator_author', 'sailthru.author'].includes(k)) push(atr(m[0], 'content'));
  }
  // Подписи: rel=author, itemprop=author, класс с author / byline / avtor (не «authorization»).
  for (const m of html.matchAll(/<(a|span|div|p|address|b|strong)\b([^>]*\b(?:rel=["']author|itemprop=["']author|class=["'][^"']*(?:author|byline|avtor))[^>]*)>([\s\S]*?)<\/\1>/gi)) {
    if (/authoriz/i.test(m[2])) continue;
    const t = razmetka(m[3]);
    if (t && t.length <= 80 && /\p{Lu}\p{Ll}+\s+\p{Lu}/u.test(t)) push(t);
  }
  return out.join('; ');
}

export const chitatKesh = (root = '.') => (fs.existsSync(path.join(root, KESH)) ? JSON.parse(fs.readFileSync(path.join(root, KESH), 'utf8')) : {});
export function pisatKesh(kesh, root = '.') {
  const sorted = Object.fromEntries(Object.keys(kesh).sort().map((k) => [k, kesh[k]]));
  fs.writeFileSync(path.join(root, KESH), JSON.stringify(sorted, null, 1) + '\n');
}

/**
 * Сверка авторов по кэшу, без сети.
 * { ssylok, provereno, sAvtorom, neProvereno: [url], inoagenty: [{ url, den, avtor, imya, reestr }], zhdut }
 * Запись кэша: { status: 'ok' | 'oshibka', kod, avtor, data, oshibka? }; «ok» без автора — проверено, автора нет.
 */
export function sverkaAvtorov(root = '.', { kesh = chitatKesh(root), map = ssylki(root), segodnya } = {}) {
  const tx = [];
  const neProvereno = [];
  let provereno = 0;
  let sAvtorom = 0;
  for (const [url, dni] of map) {
    const z = kesh[url];
    if (!z || z.status !== 'ok') { neProvereno.push(url); continue; }
    provereno++;
    if (!z.avtor) continue;
    sAvtorom++;
    // gde — «<музей>/<ключ> автор <адрес>»: исключения zakon.mjs снимаются по дню.
    for (const den of dni) tx.push(tekst(`${den} автор ${url}`, z.avtor));
  }
  const s = sverkaTekstov(tx, root, { segodnya });
  // Все реестры zakon.mjs: автор-организация из перечня («…» в кавычках) тоже находка.
  const inoagenty = s.sovpadeniya.map((x) => {
    const [den, , url] = x.gde.split(' ');
    return { url, den, avtor: kesh[url].avtor, imya: x.imya, reestr: x.reestr };
  });
  return { ssylok: map.size, provereno, sAvtorom, neProvereno, inoagenty, zhdut: s.zhdut, starye: s.starye };
}
