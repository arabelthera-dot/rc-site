// Каркас карточки дня из старой страницы — музей «Великие русские книги и их авторы» (Р493).
// razobrat(html, json, den) → объект с полями карточки (как src/content/dni-shablon/ne-sdayutsya/01-01.yaml).
// Блока нет на старой странице — поля нет, причина в nety; раздел старой страницы не лёг в шаблон — в vybrosheno.
// Данных не выдумывает: чего старая страница не знает (подпись «куда дальше», ввод календаря) — пусто и вслух.
// Запуск: node scripts/karkas/literatura.mjs --proba — разбирает все страницы музея, ничего не пишет.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const MUZEI = 'literatura', NAZVANIE = 'Музей «Великие русские книги и их авторы»';
const SAYT = 'https://russian-civilization.ru';
const MES = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const LITSENZIYA = 'цитирование в информационных и учебных целях с указанием автора и источника (ст. 1274 ГК РФ)';
const ENT = { nbsp: ' ', gt: '>', lt: '<', amp: '&', quot: '"', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…' };
const ent = (s) => s.replace(/&(#\d+|[a-z]+);/g, (x, k) => (k[0] === '#' ? String.fromCodePoint(+k.slice(1)) : ENT[k] ?? x));
const tekst = (s) => ent((s ?? '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const vnutri = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
const atr = (teg, k) => { const v = teg?.match(new RegExp(`\\s${k}="([^"]*)"`))?.[1]; return v === undefined ? undefined : ent(v); };

// Адреса старой страницы — от /muzei/literatura/ (../../, img/…) и с приставкой /rc-site; в карточке — от корня сайта.
const adres = (u) => {
  if (!u || /^(https?:|mailto:|#|data:)/.test(u)) return u;
  if (u.startsWith('/rc-site/')) return u.slice('/rc-site'.length);
  if (u.startsWith('/')) return u;
  if (u.startsWith('../../')) return `/${u.replace(/^(\.\.\/)+/, '')}`;
  return `/muzei/${MUZEI}/${u}`;
};
// Дополнение (Р494): источник эпизода, которого нет на старой странице, — src/data/karkas-dopolnenie/literatura.json,
// { "ДД-ММ": { "номер удара": { src, url } | { ne_podtverzhden: "где искали" } } }; неподтверждённый удар не переносится.
const DOPOLNENIE = (() => { const f = fileURLToPath(new URL(`../../src/data/karkas-dopolnenie/${MUZEI}.json`, import.meta.url)); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; })();
const adresaVHtml = (s) => vnutri(s).replace(/\s(href|src)="([^"]*)"/g, (x, k, u) => ` ${k}="${adres(u)}"`);

export function razobrat(html, json, den) {
  const h = html, j = json ?? {}, nety = [], vybrosheno = [];
  const sekcii = [...h.matchAll(/<section([^>]*)\sid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)].map((m) => ({ id: m[2], klass: atr(m[1], 'class') ?? '', telo: m[3] }));
  const sekciya = (id) => sekcii.find((s) => s.id === id)?.telo;
  const klass = (s, k, teg = 'div') => s?.match(new RegExp(`<${teg}[^>]*class="${k}"[^>]*>([\\s\\S]*?)</${teg}>`))?.[1];
  const h2 = (s) => s?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1];
  const wrap = (s) => (s ?? '').replace(/^\s*<div class="wrap">/, '').replace(/<\/div>\s*$/, '');

  // window.MUSEUM_* — литералы в пустой песочнице; календарь музея подставлен пустым, скрипты с document пропускаются.
  const okno = { MUSEUM_CALENDAR: new Proxy({}, { get: (o, k) => (o[k] ??= {}) }) };
  for (const [, kod] of h.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    if (!/window\.MUSEUM_/.test(kod)) continue;
    try { vm.runInNewContext(kod, { window: okno }); } catch { /* не литерал */ }
  }

  // Права кадров — таблица «Изображения и права»: строка по data-rc-rights-id, адрес источника — ссылка второй колонки.
  const prava = [...(h.match(/<table class="rights-table">([\s\S]*?)<\/table>/g) ?? []).join('').matchAll(/<tr data-rc-rights-id="([^"]+)">([\s\S]*?)<\/tr>/g)]
    .map((m) => { const td = [...m[2].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((t) => t[1]); return { id: m[1], href: atr(td[1]?.match(/<a[^>]*>/)?.[0], 'href'), osnovanie: tekst(td[2]) }; });
  const kadr = (img, { podpis, credit, pravaId }) => {
    const src = adres(atr(img, 'src')), alt = atr(img, 'alt') ?? '';
    const stroka = prava.find((p) => p.id === pravaId) ?? prava.find((p) => p.href && p.href === atr(img, 'data-source'));
    const data_source = atr(img, 'data-source') || stroka?.href, license = atr(img, 'data-license') || stroka?.osnovanie;
    if (!data_source || !license) { nety.push(`кадр ${src}: нет ${data_source ? 'основания прав' : 'адреса источника'} ни в разметке, ни в таблице прав — кадр не перенесён`); return null; }
    const k = { src, alt: alt || podpis, data_source, license, podpis: podpis || alt, ...(credit ? { credit } : {}) };
    const [sh, vy] = [+atr(img, 'width'), +atr(img, 'height')];
    if (sh > 0 && vy > 0) Object.assign(k, { width: sh, height: vy });
    return k;
  };

  const [, mm, dd] = den.match(/^(\d\d)-(\d\d)$/), d = +dd, mes = +mm - 1;
  const h1 = tekst(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]);
  const chip = tekst(klass(h, 'date-chip'));
  const god = j.year ? String(j.year) : undefined;
  const title = tekst(h.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
  const opisanie = atr(h.match(/<meta name="description"[^>]*>/)?.[0], 'content') ?? '';
  const url = `${SAYT}/muzei/${MUZEI}/den/${den}/`;

  const karta = { muzei: MUZEI, key: den };
  karta.head = {
    title, description: opisanie, canonical: url, ...(j.title ? { sobytie: j.title } : {}), ...(/^\d{3,4}$/.test(god ?? '') ? { god } : {}),
    og: { type: 'article', site_name: 'Русская цивилизация', title, description: opisanie, url },
    ld: { '@context': 'https://schema.org', '@type': 'Article', headline: h1, description: opisanie, url,
      inLanguage: 'ru-RU', isAccessibleForFree: true, publisher: { '@type': 'Organization', name: 'Русская цивилизация', url: `${SAYT}/` } },
  };
  if (!/og:image/.test(h)) nety.push('нет на старой странице: og:image — картинки для соцсетей нет');

  const geroy = h.match(/<img[^>]*class="hero-img"[^>]*>/)?.[0];
  if (geroy) {
    const cap = klass(h, 'scene-cap');
    const credit = tekst(cap?.match(/<span class="credit">([\s\S]*?)<\/span>/)?.[1]);
    const k = kadr(geroy, { podpis: tekst(cap?.replace(/<span class="credit">[\s\S]*?<\/span>/, '')), credit });
    if (k?.width) karta.oblozhka = { ...k, hint: chip, celikom: false };
    else if (k) nety.push('обложка: у кадра героя нет размеров — обложка не перенесена');
  } else nety.push('нет на старой странице: обложка (кадра героя нет)');

  karta.kroshka = tekst(h.match(/<span class="here">([\s\S]*?)<\/span>/)?.[1]) || `${d} ${MES[mes]} · ${h1}`;
  const [chipData, ...chipPrivyazka] = chip.split(' · ');
  karta.lead = { data: `День ${d} · ${MES[mes]}${god ? ` · ${god}` : ''}`, privyazka: chipPrivyazka.join(' · ') ? `${chipData} — ${chipPrivyazka.join(' · ')}.` : chipData,
    kto: vnutri(klass(h, 'who')), h1, hook: tekst(h.match(/<p class="hook">([\s\S]*?)<\/p>/)?.[1]) };
  karta.stamp = [...(klass(h, 'stamp') !== undefined ? h.matchAll(/<div class="v">([\s\S]*?)<\/div><div class="k">([\s\S]*?)<\/div>/g) : [])]
    .map((m) => ({ v: tekst(m[1]), k: tekst(m[2]) }));
  if (!karta.stamp.length) nety.push('нет на старой странице: штамп с числами');

  // «Пять историй» — удары истории дня: заголовок и вводная — summary, абзацы раскрытия — det, строка «Источник эпизода» — src.
  const pyat = sekciya('five-stories');
  const udary = [...(pyat ?? '').matchAll(/<article class="moment"[^>]*>([\s\S]*?)<\/article>/g)].map(([, a], i) => {
    const det = a.match(/<details>([\s\S]*?)<\/details>/)?.[1] ?? '';
    const istP = det.match(/<p class="source">([\s\S]*?)<\/p>/)?.[1];
    const u = { summary: `${tekst(h2(a))}. ${tekst(a.match(/<p class="lead">([\s\S]*?)<\/p>/)?.[1])}`.replace(/([.!?…])\. /, '$1 '),
      podrobnee: tekst(det.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]) || undefined,
      det: [...det.replace(/<p class="source">[\s\S]*?<\/p>/, '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => adresaVHtml(m[1])).filter(Boolean),
      src: istP ? `Источник: ${tekst(istP).replace(/^Источник эпизода\s*·\s*/, '')}` : '' };
    const href = atr(istP?.match(/<a[^>]*>/)?.[0], 'href');
    if (/^https?:\/\//.test(href ?? '')) u.href = href;
    const fig = a.match(/<figure([^>]*)>([\s\S]*?)<\/figure>/);
    if (fig) {
      const cap = fig[2].match(/<figcaption>([\s\S]*?)<\/figcaption>/)?.[1] ?? '';
      const k = kadr(fig[2].match(/<img[^>]*>/)?.[0], { podpis: tekst(cap.replace(/<span class="credit">[\s\S]*?<\/span>/, '')),
        credit: tekst(cap.match(/<span class="credit">([\s\S]*?)<\/span>/)?.[1]), pravaId: atr(fig[1], 'data-rc-rights-id') });
      if (k) { if (/portrait/.test(atr(fig[1], 'class') ?? '')) k.klass = 'portret'; u.kadr = k; }
    }
    if (!u.podrobnee) delete u.podrobnee;
    const dop = DOPOLNENIE[den]?.[i];
    if (!u.src && dop?.src) { u.src = `Источник: ${dop.src}`; if (dop.url) u.href = dop.url; }
    if (!u.src && dop?.ne_podtverzhden) { nety.push(`история «${tekst(h2(a))}»: источник не подтверждён (${dop.ne_podtverzhden}) — удар не перенесён`); return null; }
    if (!u.src) nety.push(`история «${tekst(h2(a))}»: нет строки источника`);
    return u;
  }).filter(Boolean);
  if (udary.length) karta.story = { kicker: tekst(pyat.match(/<div class="n">[^/]*\/\s*([^<]+)<\/div>/)?.[1]) || 'Пять историй', h2: h1, udary };
  else nety.push('нет на старой странице: пять историй — истории дня нет');

  const ag = okno.MUSEUM_AUDIOGUIDE, kvi = okno.MUSEUM_QUIZ;
  karta.daynav = [karta.story && { id: 'story', label: 'Читать' }, ag && { id: 'audioguide', label: 'Слушать' },
    kvi?.items?.length && { id: 'quiz', label: 'Викторина' }, sekciya('calendar') && { id: 'calendar', label: 'Календарь' }].filter(Boolean);
  nety.push('нет на старой странице: видео', 'нет на старой странице: факты (блок fakty)');

  // Разделы, которых в шаблоне нет, — 1:1 разметкой: голос дня — до истории, «Сюжет» и «Слово героя» — после неё.
  karta.razdely = [];
  const VZYATO = ['five-stories', 'games', 'result', 'istochniki', 'calendar', 'kuda-dalshe', 'audioguide'];
  for (const s of sekcii.filter((x) => !VZYATO.includes(x.id))) {
    const posle = s.klass.includes('voice-first') ? 'daynav' : 'story';
    karta.razdely.push({ posle, html: `<section class="${s.klass}" id="${s.id}">${adresaVHtml(wrap(s.telo))}</section>` });
  }
  const kd = sekciya('kuda-dalshe');
  if (kd) karta.razdely.push({ posle: 'calendar', html: `<section class="block" id="kuda-dalshe">${adresaVHtml(wrap(kd))}</section>` });

  const igry = sekciya('games');
  if (/class="game"/.test(igry ?? '') || /MUSEUM_CHOICE_TALE/.test(h)) vybrosheno.push('игра «Твой выбор» (choiceTale) и её noscript — игр не делаем, Р436');

  if (kvi?.items?.length) {
    const v = kvi.items;
    karta.quiz = { kicker: `Проверь себя · ${v.length} вопросов`, h2: kvi.title || 'Викторина', intro: 'На каждый вопрос — одна попытка. После ответа покажем объяснение.',
      noscript: `Для викторины нужен JavaScript. Ответы: ${v.map((x, i) => `${i + 1} — ${x.o[x.c]}`).join('; ')}.`,
      ball: Number.isInteger(kvi.points) && kvi.points > 0 ? kvi.points : 10, voprosy: v.map((x) => ({ q: x.q, o: x.o, a: x.c, e: x.e })) };
  } else nety.push('нет на старой странице: викторина');

  const rez = sekciya('result');
  if (rez) {
    const p = [...rez.replace(/<div class="diploma"[\s\S]*$/, '').matchAll(/<p([^>]*)>([\s\S]*?)<\/p>/g)];
    const diplom = rez.match(/<div class="diploma"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    karta.result = { h2: tekst(h2(rez)), intro: tekst(p.find((m) => /ending/.test(m[1]))?.[2] ?? p[0]?.[2]),
      zvanie: tekst(diplom?.match(/<b>([\s\S]*?)<\/b>/)?.[1]), note: tekst(p.find((m) => !/ending/.test(m[1]))?.[2]) || tekst(diplom?.match(/<p>([\s\S]*?)<\/p>/)?.[1]) };
  } else nety.push('нет на старой странице: итог дня');

  const kal = sekciya('calendar');
  if (kal) {
    const intro = tekst(kal.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1]);
    if (intro) karta.kalendar = { kicker: tekst(klass(kal, 'kicker')) || undefined, h2: tekst(h2(kal)), intro };
    else nety.push(`нет на старой странице: вводный абзац календаря — блок kalendar пуст (есть только заголовок «${tekst(h2(kal))}»)`);
  } else nety.push('нет на старой странице: календарь');

  // Кадры записи дня, которых нет ни в обложке, ни в историях, ни в разделах.
  const zanyato = new Set([karta.oblozhka?.src, ...udary.map((u) => u.kadr?.src), ...karta.razdely.flatMap((r) => [...r.html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]))]);
  karta.figures = [];
  for (const i of j.images ?? []) {
    const src = adres(i.src.startsWith('/') || /^https?:/.test(i.src) ? i.src : `/${i.src}`);
    if (zanyato.has(src)) continue;
    zanyato.add(src);
    const data_source = i.credit?.match(/https?:\/\/\S+?(?=[.,;]?(?:\s|$))/)?.[0];
    if (!data_source) { nety.push(`кадр записи дня ${src}: нет адреса источника — не перенесён`); continue; }
    karta.figures.push({ src, alt: i.caption ?? h1, data_source, license: i.credit.match(/Права:\s*(.+?)\.?$/)?.[1] ?? LITSENZIYA,
      podpis: i.caption ?? h1, credit: i.credit.split(/\s*Источник:/)[0].trim() || undefined });
  }

  const ist = sekciya('istochniki') ?? '';
  karta.sources = [...(ist.match(/<ul class="source-list">([\s\S]*?)<\/ul>/)?.[1] ?? '').matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => ({ html: adresaVHtml(m[1]) }));
  if (!karta.sources.length) nety.push('нет на старой странице: список источников');
  const povest = ist.replace(/<ul[\s\S]*?<\/ul>/g, '').match(/<\/summary>[\s\S]*?<p>([\s\S]*?)<\/p>/)?.[1];
  if (povest) vybrosheno.push('абзац «как устроено повествование» в источниках — места в шаблоне нет');

  // «Куда дальше»: у старых ссылок нет подписи (lbl) и крючка (hook) — придумать нельзя; ссылки ушли разделом 1:1.
  karta.kuda = [];
  if (kd) nety.push(`нет на старой странице: подпись и крючок у ссылок «куда дальше» (${(kd.match(/<a /g) ?? []).length} ссылок перенесены разделом как есть)`);

  const sk = okno.MUSEUM_SCORE;
  if (sk?.awards && sk?.ranks) karta.score = { awards: sk.awards, ranks: sk.ranks };
  else nety.push('нет на старой странице: баллы и звания (MUSEUM_SCORE)');

  const ch = okno.MUSEUM_CHROME;
  if (ch?.share) karta.chrome = { share: ch.share, ...(ch.prev ? { prev: { ...ch.prev, href: adres(ch.prev.href) } } : {}), ...(ch.next ? { next: { ...ch.next, href: adres(ch.next.href) } } : {}),
    all: { href: adres(ch.all?.href ?? `/muzei/${MUZEI}/`), label: ch.all?.label ?? NAZVANIE }, random: ch.random ?? [] };
  else nety.push('нет на старой странице: шапка музея (MUSEUM_CHROME)');

  const r = okno.MUSEUM_RETURN?.riddle ?? okno.MUSEUM_RETURN;
  if (r?.q && r?.a) karta.return = { q: r.q, a: r.a, ...(r.src ? { src: r.src } : {}) };
  else nety.push('нет на старой странице: вопрос возврата (MUSEUM_RETURN)');

  if (ag?.audioSrc) {
    karta.audioguide = { audioSrc: adres(ag.audioSrc), durationLabel: ag.durationLabel, lead: ag.lead, stops: ag.stops ?? [], transcript: ag.transcript ?? [], note: ag.note };
    if (ag.heading) vybrosheno.push(`заголовок аудиогида «${ag.heading}» — поля в шаблоне нет`);
  } else nety.push('нет на старой странице: аудиогид');

  karta.proof = { status: 'ne_utverzhdeno', note: `Каркас собран машиной из старой страницы src/data/full-pages/${MUZEI}/${den}.html (scripts/karkas/literatura.mjs, Р493); факты не сверены.` };
  for (const [k, v] of Object.entries(karta)) if (v === undefined) delete karta[k];
  if (karta.kalendar && karta.kalendar.kicker === undefined) delete karta.kalendar.kicker;
  return { ...karta, nety: [...new Set(nety)], vybrosheno: [...new Set(vybrosheno)] };
}

// ── Проба: все страницы музея, ничего не пишет. ──
if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv.includes('--proba')) {
  const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const STARYE = path.join(KOREN, 'src/data/full-pages', MUZEI), ZAPISI = path.join(KOREN, 'src/content/days', MUZEI);
  const { z } = await import('astro/zod');
  const { obshchiePolya } = await import(path.join(KOREN, 'src/lib/den-obshchee.mjs'));
  const { BLOKI } = await import(path.join(KOREN, 'src/lib/dni-shablon.mjs'));
  const skhema = z.object(obshchiePolya(BLOKI));
  const dni = fs.readdirSync(STARYE).filter((f) => /^\d\d-\d\d\.html$/.test(f)).map((f) => f.slice(0, 5)).sort();
  let proshla = 0;
  const vidyNety = new Map(), vidyVybr = new Map(), provaly = [];
  for (const den of dni) {
    const zp = path.join(ZAPISI, `${den}.json`);
    const json = fs.existsSync(zp) ? JSON.parse(fs.readFileSync(zp, 'utf8')) : null;
    let karta;
    try { karta = razobrat(fs.readFileSync(path.join(STARYE, `${den}.html`), 'utf8'), json, den); }
    catch (e) { provaly.push(`${den}: разбор упал — ${e.message}`); continue; }
    const { nety, vybrosheno, ...ost } = karta;
    if (!json) nety.push('нет записи дня src/content/days — событие и год не взяты');
    for (const s of nety) { const vid = s.replace(/^кадр \S+/, 'кадр …').replace(/источник не подтверждён \(.*\) —/, 'источник не подтверждён (…) —').replace(/«.*»/g, '«…»').replace(/\(\d+ ссыл/, '(N ссыл'); vidyNety.set(vid, (vidyNety.get(vid) ?? 0) + 1); }
    for (const s of vybrosheno) { const vid = s.replace(/«.*»/g, '«…»'); vidyVybr.set(vid, (vidyVybr.get(vid) ?? 0) + 1); }
    const r = skhema.safeParse(ost);
    if (r.success) proshla++;
    else provaly.push(`${den}: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  }
  console.log(`прошла ${proshla} из ${dni.length} (${NAZVANIE})`);
  if (provaly.length) { console.log('\nНЕ ПРОШЛИ:'); for (const s of provaly) console.log(`  ${s}`); }
  console.log('\nНЕТ НА СТАРОЙ СТРАНИЦЕ (сколько дней):');
  for (const [s, n] of [...vidyNety].sort((a, b) => b[1] - a[1])) console.log(`  ${n} — ${s}`);
  console.log('\nВЫБРОШЕНО (сколько дней):');
  for (const [s, n] of [...vidyVybr].sort((a, b) => b[1] - a[1])) console.log(`  ${n} — ${s}`);
}
