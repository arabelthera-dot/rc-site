// Каркас карточки дня из старой страницы — адаптер музея «Что изобрели русские первыми в мире» (Р493).
// razobrat(html, json, den) → объект с полями карточки src/content/dni-shablon/izobreteniya/ММ-ДД.yaml (образец — 01-13)
// плюс nety: [] — чего на старой странице нет (блок пустой, разбор не останавливается) и vybrosheno: [] — разделы
// старой страницы, которых нет в шаблоне. Зовёт диспетчер scripts/karkas-iz-staroy.mjs; сам ничего не пишет.
// Проба: node scripts/karkas/izobreteniya.mjs --proba — разбирает все src/data/full-pages/izobreteniya/*.html.
// На страницах четыре вида вёрстки: январь 06–17 (полный: hero-fig, удары, var Q), январь 18–23 (без chrome и ролика),
// январь 25–29 (короткий: без истории и викторины), старый вид 30 янв., 02-03…12-14 (статья абзацами, const quiz, без штампа).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const MUZEI = 'izobreteniya', IMYA = 'Музей «Что изобрели русские первыми в мире»', SAYT = 'https://russian-civilization.ru';
const STARYE = `src/data/full-pages/${MUZEI}`, ZAPISI = `src/content/days/${MUZEI}`;
// Блоки шаблона (BLOKI src/lib/dni-shablon.mjs) и их старые имена; что не здесь — ВЫБРОШЕНО.
const VZYATO = ['dokument', 'video', 'audioguide', 'story', 'fakty', 'games', 'kadry', 'pervenstvo', 'quiz', 'quiz-sec', 'result', 'sources', 'calendar', 'kuda-dalshe'];
const NAV = ['story', 'audioguide', 'fakty', 'video', 'games', 'pervenstvo', 'quiz', 'calendar', 'kadry', 'sources'];

const ENT = { nbsp: ' ', gt: '>', lt: '<', amp: '&', quot: '"', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…', apos: "'" };
const ent = (s) => s.replace(/&(#\d+|[a-z]+);/g, (x, k) => (k[0] === '#' ? String.fromCodePoint(+k.slice(1)) : ENT[k] ?? x));
const tekst = (s) => ent((s ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([.,;:!?»)])/g, '$1').replace(/([«(])\s+/g, '$1').trim();
const vnutri = (s) => ent((s ?? '').replace(/\s+/g, ' ').trim());
const atr = (teg, k) => { const v = teg?.match(new RegExp(`\\s${k}="([^"]*)"`))?.[1]; return v === undefined ? undefined : ent(v); };
const ot = (u) => (u && !/^(\/|https?:)/.test(u) ? `/muzei/${MUZEI}/${u}` : u);
const bezPrav = (s) => s.replace(/\s*Права:[\s\S]*$/, '').trim();

// Массив-литерал после «var Q = [» / «const quiz=[»: парная скобка с учётом строк, затем исполнение в пустой песочнице.
function massiv(h, imena) {
  const m = h.match(new RegExp(`(?:var|const|let)\\s+(?:${imena})\\s*=\\s*\\[`));
  if (!m) return null;
  let i = m.index + m[0].length - 1, glub = 0, str = null;
  for (let j = i; j < h.length; j++) {
    const c = h[j];
    if (str) { if (c === '\\') j++; else if (c === str) str = null; continue; }
    if (c === '"' || c === "'" || c === '`') str = c;
    else if (c === '[') glub++;
    else if (c === ']' && --glub === 0) {
      try { return vm.runInNewContext(h.slice(i, j + 1), {}, { timeout: 500 }); } catch { return null; }
    }
  }
  return null;
}

// Удары: <li><details><summary><span>…<span class="more-lbl">…</span></span></summary><div class="det"><p>…</p><p class="src-note">…</p></div>
function udary(s) {
  return [...(s ?? '').matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>\s*<div class="det">([\s\S]*?)<\/div>\s*<\/details>/g)].map(([, sum, det]) => {
    const summary = vnutri(sum.replace(/<span class="more-lbl">[\s\S]*?<\/span>\s*<\/span>/, '').replace(/^\s*<span>|<\/span>\s*$/g, ''));
    const p = [...det.matchAll(/<p([^>]*)>([\s\S]*?)<\/p>/g)];
    const src = p.find((x) => /src-note/.test(x[1]));
    const tag = tekst(det.match(/<span class="tag">([\s\S]*?)<\/span>/)?.[1]); // «Находка дня» — пометка удара, не текст
    const abz = p.filter((x) => x !== src).map((x) => vnutri(x[2].replace(/<span class="tag">[\s\S]*?<\/span>/, ''))).filter(Boolean);
    return { summary, ...(tag ? { find: true, tag } : {}), det: abz, ...(src ? { src: tekst(src[2]) } : {}) };
  }).filter((u) => u.summary);
}

export function razobrat(html, json, den) {
  const h = html, j = json ?? {}, nety = [], vybrosheno = [];
  const net = (chto) => nety.push(`нет на старой странице: ${chto}`);
  const sekciya = (id) => h.match(new RegExp(`<section[^>]*\\sid="${id}"[^>]*>([\\s\\S]*?)</section>`))?.[1];
  const klass = (s, k, teg = 'div') => s?.match(new RegExp(`<${teg}[^>]*class="${k}"[^>]*>([\\s\\S]*?)</${teg}>`))?.[1];
  const kicker = (s) => tekst(klass(s, 'kicker')) || undefined;
  const h2 = (s) => tekst(s?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]) || undefined;
  const pervyyP = (s) => tekst(s?.match(/<\/h2>(?:\s*<\/div>)?\s*<p[^>]*>([\s\S]*?)<\/p>/)?.[1]) || undefined;
  const abzacy = (s) => [...(s ?? '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => vnutri(m[1])).filter(Boolean);
  const chisto = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)));

  const okno = {};
  for (const [, kod] of h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
    if (!/window\.MUSEUM_/.test(kod)) continue;
    try { vm.runInNewContext(kod, { window: okno }, { timeout: 500 }); } catch { /* скрипт с document — не литерал */ }
  }

  const karta = { muzei: MUZEI, key: den, adres: 'den' };
  const h1 = tekst(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]);
  if (!h1) net('заголовок h1');
  const chip = tekst(klass(h, 'date-chip'));
  const god = chip.match(/\b(\d{3,4})\b/)?.[1] ?? (j.year ? String(j.year) : undefined);
  const hook = tekst(h.match(/<p class="hook"[^>]*>([\s\S]*?)<\/p>/)?.[1]);
  const opisanie = ent(h.match(/<meta (?:property|name)="(?:og:)?description" content="([^"]*)"/)?.[1] ?? '') || hook;
  const sobytie = j.title || h1, url = `${SAYT}/muzei/${MUZEI}/den/${den}/`, title = `${sobytie} — ${IMYA}`;
  karta.head = chisto({ title, description: opisanie, canonical: url, sobytie, god,
    og: { type: 'article', site_name: 'Русская цивилизация', title: h1, description: opisanie, url },
    ld: { '@context': 'https://schema.org', '@type': 'Article', headline: h1, description: opisanie, url, inLanguage: 'ru',
      isPartOf: { '@type': 'WebSite', name: IMYA }, publisher: { '@type': 'Organization', name: 'Русская цивилизация' },
      about: { '@type': 'CreativeWork', name: h1 } } });

  // Кадр с подписью: <img … data-source data-license> + текст подписи, в нём <span class="credit">…</span>.
  const kadr = (img, podpisHtml) => {
    const credit = tekst(podpisHtml?.match(/<span class="credit">([\s\S]*?)<\/span>/)?.[1]);
    const k = chisto({ src: ot(atr(img, 'src')), width: +atr(img, 'width') || undefined, height: +atr(img, 'height') || undefined,
      alt: atr(img, 'alt'), data_source: atr(img, 'data-source'), license: atr(img, 'data-license'),
      podpis: tekst(podpisHtml?.replace(/<span class="credit">[\s\S]*?<\/span>/, '').replace(/<span class="scene-hint">[\s\S]*?<\/span>/, '')) || undefined,
      credit: credit ? bezPrav(credit) : undefined });
    return k;
  };
  const geroy = h.match(/<figure class="hero-fig"[\s\S]*?<\/figure>/)?.[0] ?? h.match(/<div class="hero-scene[\s\S]*?<div class="scene-caption">[\s\S]*?<\/div>\s*<\/div>/)?.[0];
  const geroyImg = geroy?.match(/<img[^>]*class="scene[^"]*"[^>]*>/)?.[0] ?? h.match(/<img[^>]*class="scene[^"]*"[^>]*>/)?.[0];
  if (geroyImg) {
    const k = kadr(geroyImg, klass(h, 'scene-cap'));
    karta.oblozhka = chisto({ ...k, hint: tekst(klass(h, 'scene-hint', 'span')) || undefined, fit_full: /hero-scene fit-full/.test(h) || undefined });
    if (!k.data_source) net('адрес источника обложки (data-source)');
  } else net('кадр обложки (на месте героя анимация или пусто)');

  karta.kroshka = tekst(h.match(/<span class="here">([\s\S]*?)<\/span>/)?.[1]) || undefined;
  const privyazka = tekst(h.match(/<p class="date-origin"[^>]*>([\s\S]*?)<\/p>/)?.[1]);
  if (!privyazka) net('привязка даты (date-origin)');
  const kto = vnutri(klass(h, 'who'));
  if (!kto) net('кто изобрёл (who)');
  karta.lead = chisto({ data: chip, privyazka, kto, h1, hook });
  const shtamp = h.slice(Math.max(0, h.search(/class="stamp"/))).slice(0, 4000);
  karta.stamp = /class="stamp"/.test(h)
    ? [...shtamp.matchAll(/<div class="v">([\s\S]*?)<\/div>\s*<div class="k">([\s\S]*?)<\/div>/g)].map((m) => ({ v: tekst(m[1]), k: tekst(m[2]) })) : [];
  if (!karta.stamp.length) net('штамп (stamp)');

  const nav = h.match(/<nav class="daynav"[\s\S]*?<\/nav>/)?.[0] ?? '';
  karta.daynav = [...nav.matchAll(/<a href="#([\w-]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map(([, id, l]) => ({ id: id === 'quiz-sec' ? 'quiz' : id, label: tekst(l) })).filter((p) => NAV.includes(p.id));
  if (sekciya('dokument') !== undefined) karta.dokument = 'verh';

  const vid = sekciya('video'), video = vid?.match(/<video[^>]*>/)?.[0];
  if (video) {
    const klyuch = atr(video, 'data-rc-video'), format = atr(video, 'data-rc-format') ?? 'horizontal';
    const p = [...vid.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => tekst(m[1]));
    karta.video = chisto({ h2: h2(vid), klyuch, format, pole: klyuch && `${klyuch}:${format}.sec`, suffix: 'сек',
      badge: tekst(vid.match(/<span[^>]*data-rc-video-field[^>]*>([\s\S]*?)<\/span>/)?.[1]) || undefined, intro: p[0],
      poster: atr(video, 'poster'), mp4: atr(vid.match(/<source[^>]*>/)?.[0], 'src'), note: p.length > 1 ? p.at(-1) : undefined });
  } else net('ролик (video)');

  const ag = okno.MUSEUM_AUDIOGUIDE;
  if (ag) karta.audioguide = chisto(Object.fromEntries(['audioSrc', 'durationLabel', 'lead', 'stops', 'transcript', 'note'].map((k) => [k, ag[k]])));
  else net('аудиогид (MUSEUM_AUDIOGUIDE)');

  // История: удары (январь) или статья абзацами (старый вид, #articleBody).
  const ist = sekciya('story');
  const istUdary = udary(ist);
  if (istUdary.length) karta.story = chisto({ kicker: kicker(ist), h2: h2(ist), intro: pervyyP(ist), udary: istUdary });
  else if (ist && abzacy(ist).length) karta.story = chisto({ kicker: kicker(ist), h2: h2(ist), abzacy: abzacy(ist.match(/id="articleBody"[^>]*>([\s\S]*)/)?.[1] ?? ist) });
  else net('история (story)');

  // Факты: на старой странице один список; шаблон делит 10 + остальное (замок живого адреса).
  const fs0 = sekciya('fakty'), fu = udary(fs0);
  if (fu.length) {
    karta.fakty = [chisto({ id: 'fakty', nav: 'Факты', kicker: kicker(fs0), h2: h2(fs0), udary: fu.slice(0, 10) })];
    if (fu.length > 10) karta.fakty.push({ id: 'fakty-dnya', udary: fu.slice(10) });
    if (fu.length > 10) net('заголовок второго блока фактов (fakty-dnya.kicker, h2) — старая страница не делит факты');
    if (fu.length < 15) net(`факты до 10 + 5: на старой странице ${fu.length}`);
    net('цитаты фактов из документа (otryvok, stranica, href) — на старой странице только src-note');
  } else net('факты (fakty)');

  karta.razdely = [];
  if (sekciya('games') !== undefined) net('игра дня — раздел games есть, но 2D/3D переносится руками (igra.imya, model3d), не машиной');
  else net('игра дня (games)');

  const pv = sekciya('pervenstvo') ?? h.match(/<section[^>]*>((?:(?!<\/section>)[\s\S])*class="border-box"[\s\S]*?)<\/section>/)?.[1];
  const ramka = klass(pv, 'border-box');
  if (ramka) {
    const p = abzacy(ramka), tab = pv.match(/<table class="ctx">([\s\S]*?)<\/table>/)?.[1];
    karta.pervenstvo = chisto({ kicker: kicker(pv), h2: h2(pv), granica: p[0], net: p[1],
      kolonki: [...(tab?.match(/<thead>([\s\S]*?)<\/thead>/)?.[1] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => tekst(m[1])),
      stroki: [...(tab?.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? '').matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
        .map((r) => [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => vnutri(m[1]))) });
    if (!p[1]) net('«чего здесь нет» в первенстве (второй абзац border-box)');
    if (!tab) net('таблица первенства (table.ctx)');
  } else net('первенство (border-box)');

  const vopr = massiv(h, 'Q|quiz');
  const qs = sekciya('quiz') ?? sekciya('quiz-sec');
  if (Array.isArray(vopr) && vopr.length) {
    const voprosy = vopr.map((v) => ({ q: v.q, o: v.o, a: v.a ?? v.c, e: v.e }));
    let noscript = tekst(klass(qs, 'noscript-box'));
    if (!noscript) { noscript = `Для викторины нужен JavaScript. Ответы: ${voprosy.map((v, i) => `${i + 1} — ${v.o[v.a]}`).join('; ')}.`; net('noscript викторины — собран из ответов викторины'); }
    karta.quiz = chisto({ kicker: kicker(qs), h2: h2(qs), intro: pervyyP(qs), noscript, ball: 10, voprosy });
  } else net('викторина (var Q / const quiz)');

  const rs = sekciya('result');
  if (rs) karta.result = chisto({ h2: h2(rs), intro: pervyyP(rs), zvanie: tekst(h.match(/id="dayTxt"[^>]*>([\s\S]*?)<\/div>/)?.[1]) || undefined, note: tekst(klass(rs, 'dr-note')) || undefined });
  else net('итог дня (result)');

  // Кадры: #kadry страницы, затем кадры записи дня (images[], права — из credit); обложка не повторяется.
  const kadry = [...(sekciya('kadry') ?? '').matchAll(/<figure[^>]*>([\s\S]*?)<\/figure>/g)]
    .map((f) => kadr(f[1].match(/<img[^>]*>/)?.[0], f[1].match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1])).filter((k) => k.src);
  for (const i of j.images ?? []) {
    const src = ot(String(i.src ?? i.file ?? '').replace(/^\/?(muzei\/izobreteniya\/)?/, '')), credit = i.credit ?? '';
    if (!i.src && !i.file) continue;
    const data_source = i.data_source ?? i.source ?? credit.match(/https?:\/\/\S+?(?=[.,;]?(?:\s|$))/)?.[0];
    kadry.push(chisto({ src: src.startsWith('/') ? src : `/${src}`, alt: i.alt ?? i.caption, data_source, license: i.license ?? credit.match(/Права:\s*(.+?)\.?$/)?.[1],
      podpis: i.caption, credit: credit ? bezPrav(credit.split(/\s*Источник:/)[0]) : undefined, width: i.width, height: i.height }));
  }
  const bylo = new Set([karta.oblozhka?.src]);
  karta.figures = kadry.filter((k) => !bylo.has(k.src) && bylo.add(k.src));
  const bezIst = karta.figures.filter((k) => !k.data_source).length;
  if (!karta.figures.length) net('кадры, кроме обложки (#kadry, images записи дня)');
  if (bezIst) net(`адрес источника у ${bezIst} кадр(ов)`);

  karta.sources = [...(h.match(/<ul class="sources">([\s\S]*?)<\/ul>/)?.[1] ?? '').matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(([, li]) => {
    const a = li.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*:?\s*([\s\S]*)/);
    return a ? chisto({ href: ent(a[1]), title: tekst(a[2]), note: tekst(a[3]) || undefined }) : { title: tekst(li) };
  });
  if (!karta.sources.length) net('источники (ul.sources)');

  karta.kuda = [...h.matchAll(/<div class="kd-card( main)?">\s*<span class="kd-lbl">([\s\S]*?)<\/span>\s*<a href="([^"]+)">([\s\S]*?)<\/a>\s*(?:<p>([\s\S]*?)<\/p>)?\s*<\/div>/g)]
    .filter((m) => m[3] !== 'index.html' && !m[3].startsWith('../')) // «Весь музей» и «Город-музей» — в образце не переносятся
    .map((m) => chisto({ lbl: tekst(m[2]), href: m[3], title: tekst(m[4].replace(/<span class="kd-arr">[\s\S]*?<\/span>/, '')), hook: tekst(m[5]) || undefined, main: !!m[1] }));
  if (!karta.kuda.length) net('куда дальше (kd-card)');

  if (okno.MUSEUM_SCORE) karta.score = chisto({ awards: okno.MUSEUM_SCORE.awards, ranks: okno.MUSEUM_SCORE.ranks });
  else net('баллы и звания (MUSEUM_SCORE)');
  if (okno.MUSEUM_CHROME) { const { museum, city, ...ost } = okno.MUSEUM_CHROME; karta.chrome = { ...ost, random: ost.random ?? [] }; }
  else net('шапка навигации (MUSEUM_CHROME)');
  const vz = okno.MUSEUM_RETURN?.riddle ?? okno.MUSEUM_RETURN;
  if (vz) karta.return = chisto({ q: vz.q, a: vz.a, src: vz.src });
  else net('вопрос возврата (MUSEUM_RETURN)');
  net('проверка первенства (proof) — пишется руками');

  const vse = [...h.matchAll(/<section[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
  vybrosheno.push(...vse.filter((id) => !VZYATO.includes(id) && !(pv && id === h.match(new RegExp(`<section[^>]*\\sid="(${id})"[^>]*>(?:(?!</section>)[\\s\\S])*class="border-box"`))?.[1])));
  return { ...karta, nety, vybrosheno };
}

// ── Проба: разобрать все старые страницы, ничего не писать ──
async function proba() {
  // Полную схему каркас не пройдёт: игра, проверка первенства и замок живого адреса пишутся руками — печатаем как замечание.
  const { skhema } = await import('../../src/lib/dni-shablon.mjs');
  const fayly = fs.readdirSync(STARYE).filter((f) => /^\d\d-\d\d\.html$/.test(f)).sort();
  let proshla = 0;
  const vidy = {};
  const OSNOVA = ['head', 'lead'];
  for (const f of fayly) {
    const den = f.slice(0, 5), zp = path.join(ZAPISI, `${den}.json`);
    let k;
    try { k = razobrat(fs.readFileSync(path.join(STARYE, f), 'utf8'), fs.existsSync(zp) ? JSON.parse(fs.readFileSync(zp, 'utf8')) : null, den); }
    catch (e) { console.log(`✗ ${den}: разбор упал — ${e.message}`); continue; }
    const bez = OSNOVA.filter((p) => !k[p]?.h1 && !k[p]?.title);
    const est = ['oblozhka', 'story', 'fakty', 'pervenstvo', 'quiz', 'video', 'audioguide', 'sources', 'kuda', 'figures', 'return', 'chrome']
      .filter((p) => (Array.isArray(k[p]) ? k[p].length : k[p]));
    const ok = !bez.length && (k.story || k.fakty);
    if (ok) proshla++;
    const vid = !k.story ? 'короткий, без истории' : k.stamp.length ? (k.chrome ? 'январь, полный' : 'январь, без chrome') : 'старый вид, статья абзацами';
    (vidy[vid] ??= []).push(den);
    console.log(`${ok ? '✓' : '✗'} ${den} [${vid}] есть: ${est.join(', ')}; удары истории ${k.story?.udary?.length ?? 0}, факты ${(k.fakty ?? []).flatMap((b) => b.udary).length}, вопросы ${k.quiz?.voprosy?.length ?? 0}, кадры ${k.figures.length}, источники ${k.sources.length}`);
    for (const n of k.nety) console.log(`    ${n}`);
    const sh = skhema.safeParse(k);
    if (!sh.success) console.log(`    схема (дописать руками): ${[...new Set(sh.error.issues.map((i) => i.path[0] ?? i.message))].join(', ')}`);
    if (k.vybrosheno.length) console.log(`    ВЫБРОШЕНО (в шаблоне нет): ${k.vybrosheno.join(', ')}`);
  }
  console.log(`\nВиды записи: ${Object.entries(vidy).map(([v, d]) => `${v} — ${d.join(' ')}`).join('; ')}`);
  console.log(`прошла ${proshla} из ${fayly.length}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes('--proba')) await proba();
