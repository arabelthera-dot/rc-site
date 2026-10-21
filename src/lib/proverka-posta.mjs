// Е8 (Сергей 20.10.2026, Р47): пост 9:00 в каналы проходит ту же проверку, что сборка, — теми же функциями.
// Пост собирает scripts/kanaly/post.py, проверяет scripts/kanaly/proverka.mjs (этим модулем); брак — пост не уходит.
//   карточка дня — схема записи дня из src/content.config.ts (хук одним предложением, до 200 знаков, без вопроса;
//                  источник; картинки с подписью и источником, без текста на картинке) — грузится через Vite,
//                  как её грузит Astro; заморожённый файл схемы не копируется и не правится;
//   имя музея    — дословно title_ru и checkMuseumName (src/lib/imya-muzeya.mjs), как на полных страницах;
//   реестры      — sverkaTekstov (src/lib/zakon.mjs): сильное совпадение — брак, возможное — предупреждение;
//   трагический день — src/lib/vozrast.mjs (Р40, признак tragicheskieDni): в пост не идёт;
//   картинка     — файл сайта, кадр дня с подписью и источником; кадр XX века — с основанием (kadrXX, ведомость);
//   ссылки       — только на адрес сайта (site из astro.config.mjs) и открываются с ответом 200 до отправки.
import fs from 'node:fs';
import path from 'node:path';
import { checkMuseumName, decode, MUSEUMS } from './imya-muzeya.mjs';
import { sverkaTekstov, tekst, kadrXX, vedomostOsnovaniy } from './zakon.mjs';
import { pageFrames } from './podpisi.mjs';
import { tragicheskij } from './vozrast.mjs';

const DAYS = 'src/content/days';
const FULL = 'src/data/full-pages';

/** Схема записи дня — та же, что у сборки: src/content.config.ts через Vite (astro:content — заглушка defineCollection). */
export async function shemaDnya(root = process.cwd()) {
  const { createServer } = await import('vite');
  const server = await createServer({
    root, configFile: false, logLevel: 'error', appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] },
    plugins: [{ name: 'rc-astro-content', resolveId: (id) => (id === 'astro:content' ? '\0astro:content' : null),
      load: (id) => (id === '\0astro:content' ? 'export const defineCollection = (c) => c;' : null) }],
  });
  try {
    return (await server.ssrLoadModule('/src/content.config.ts')).collections.days.schema;
  } finally {
    await server.close();
  }
}

/** Ответ адреса: GET с переходами, 20 с на попытку; сеть, 429 и 5xx — ещё две попытки через 5 и 15 с. */
export async function otvet(url) {
  let st;
  for (const pauza of [0, 5000, 15000]) {
    if (pauza) await new Promise((r) => setTimeout(r, pauza));
    try {
      st = (await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'rc-kanaly/1.0' } })).status;
      if (st !== 429 && st < 500) return st;
    } catch (e) {
      st = `сеть: ${e.cause?.code || e.message}`;
    }
  }
  return st;
}

// Метки utm_* (откуда пришёл посетитель) на ответ страницы не влияют — проверяется адрес без них.
const bezUtm = (u) => u.replace(/[?&]utm_[^&#]*/g, '').replace(/^([^?#]*)&/, '$1?');
const adresa = (post) => [...new Set([...(post.urls || []), post.url,
  ...[...String(post.tg || '').matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&')),
  ...[...String(post.vk || '').matchAll(/https?:\/\/[^\s<>"«»]+/g)].map((m) => m[0])].filter(Boolean).map(bezUtm))];

/** Картинка поста: файл в public/, кадр карточки дня или полной страницы с подписью; XX век — с основанием прав. */
function proverkaKartinki(post, root, karta, brak) {
  const { slug } = post.main;
  const key = post.key;
  const pub = path.resolve(root, 'public');
  const file = path.resolve(root, post.image || '');
  if (!post.image || !file.startsWith(pub + path.sep) || !fs.existsSync(file)) return brak.push(`картинка «${post.image}» — не файл сайта в public/`);
  const rel = path.relative(pub, file).split(path.sep).join('/');
  const ved = vedomostOsnovaniy(root);
  const im = (karta.images || []).find((x) => x.src.replace(/^\//, '') === rel);
  if (im) {
    if (im.text_on_image) brak.push(`картинка ${rel} — текст на картинке`);
    const xx = kadrXX({ museum: slug, key, src: im.src, caption: im.caption, credit: im.credit || '', generated: !!im.generated }, 'карточка', karta.year, ved);
    if (xx && !xx.osnovanie) brak.push(`картинка ${rel} — кадр XX века без основания прав (подпись или data/reestry/osnovaniya.json)`);
    return;
  }
  const page = path.join(root, FULL, slug, `${key}.html`);
  const html = fs.existsSync(page) ? fs.readFileSync(page, 'utf8') : '';
  const fr = pageFrames(html).find((f) => {
    const src = f.src.split(/[?#]/)[0];
    return path.resolve(pub, src.startsWith('/') ? src.slice(1) : `muzei/${slug}/${src}`) === file;
  });
  if (!fr) return brak.push(`картинка ${rel} — нет среди кадров дня ${slug}/${key} (карточка или полная страница)`);
  if (fr.state === 'none') brak.push(`картинка ${rel} — у кадра на полной странице нет ни подписи с источником, ни таблицы прав`);
  const xx = kadrXX({ museum: slug, key, ...fr }, 'полная страница', karta.year, ved);
  if (xx && !xx.osnovanie) brak.push(`картинка ${rel} — кадр XX века без основания прав (подпись или data/reestry/osnovaniya.json)`);
}

/**
 * Проверка собранного поста (JSON от scripts/kanaly/post.py: key, url, urls, image, tg, vk, main, also).
 * opts: root, site ('https://russian-civilization.ru/'), shema (схема дня; нет — загрузится), proverkaAdresa (url → статус).
 * Возвращает { brak: [строки], preduprezhdeniya: [строки] } — брак не пуст, значит пост не уходит.
 */
export async function proverkaPosta(post, { root = process.cwd(), site, shema, proverkaAdresa = otvet } = {}) {
  const brak = [];
  const preduprezhdeniya = [];
  shema ??= await shemaDnya(root);
  const key = post.key;
  const muzei = [post.main, ...(post.also || [])].filter(Boolean);
  if (!post.main) brak.push('у поста нет главного дня');
  const karty = {};
  const tx = [];

  for (const m of muzei) {
    const id = `${m.slug}/${key}`;
    const f = path.join(root, DAYS, m.slug, `${key}.json`);
    if (!fs.existsSync(f)) { brak.push(`${id}: нет карточки дня`); continue; }
    const karta = JSON.parse(fs.readFileSync(f, 'utf8'));
    karty[m.slug] = karta;
    // Карточка в том виде, в каком она уходит в пост (хук поста на месте хука карточки), — через схему сборки.
    const r = shema.safeParse({ ...karta, hook: m.hook });
    if (!r.success) for (const i of r.error.issues) brak.push(`${id}: ${i.path.join('.') || 'карточка'} — ${i.message}`);
    if (m.hook !== String(karta.hook ?? '').trim()) brak.push(`${id}: хук в посте не дословно из карточки`);
    if (!MUSEUMS[m.slug]) brak.push(`${id}: музея нет в src/data/museums.json`);
    else if (m.title !== MUSEUMS[m.slug]) brak.push(`${id}: имя музея «${m.title}» вместо «${MUSEUMS[m.slug]}» (title_ru полностью)`);
    if (tragicheskij(m.slug, key)) brak.push(`${id}: тихий трагический день, в пост не идёт`);
    tx.push(tekst(`${id} пост.hook`, m.hook || '')); // title_ru — утверждённое имя, сверено выше дословно
  }

  // Имя музея в готовом тексте: полный title_ru, ни одного обрезка — та же функция, что для полных страниц.
  for (const [where, text] of [['Telegram', post.tg], ['VK', post.vk]]) {
    for (const e of checkMuseumName(String(text || ''), post.main?.slug)) brak.push(`${where}: ${e}`);
    const plain = decode(String(text || ''));
    for (const m of muzei) if (MUSEUMS[m.slug] && !plain.includes(MUSEUMS[m.slug]))
      brak.push(`${where}: нет полного имени «${MUSEUMS[m.slug]}»`);
  }

  // Реестры Минюста — разбор сборки, исключения data/reestry/isklyucheniya.json по «<музей>/<ключ>|<вариант>».
  const r = sverkaTekstov(tx, root);
  for (const s of r.sovpadeniya) brak.push(`${s.gde}: «${s.imya}» — ${s.reestr} (найдено «${s.variant}»)`);
  for (const s of r.vozmozhnye) preduprezhdeniya.push(`${s.gde}: возможно «${s.imya}» — ${s.reestr} (найдено «${s.variant}»)`);
  for (const s of r.starye) preduprezhdeniya.push(s);

  if (post.main && karty[post.main.slug]) proverkaKartinki(post, root, karty[post.main.slug], brak);

  // Ссылки: только сайт и только живые — посетитель из канала не должен попасть на 404.
  // Адреса открываются разом: худший случай одного адреса (три попытки) — около 80 с, а не сумма по всем.
  const nash = adresa(post).filter((u) => !site || u.startsWith(site) || !brak.push(`ссылка ${u} — не на ${site}`));
  const st = await Promise.all(nash.map((u) => proverkaAdresa(u)));
  nash.forEach((u, i) => { if (st[i] !== 200) brak.push(`ссылка ${u} — ответ ${st[i]}, а не 200`); });
  return { brak: [...new Set(brak)], preduprezhdeniya };
}
