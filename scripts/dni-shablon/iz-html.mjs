// Старая полная страница дня → карточка шаблона (Р286, на основе разбора пробы r297):
//   node scripts/dni-shablon/iz-html.mjs <музей> <ММ-ДД> [имя-игры]
// читает src/data/full-pages/<музей>/ММ-ДД.html, пишет src/content/dni-shablon/<музей>/ММ-ДД.yaml (adres: den),
// разметку игры src/data/igry/<музей>/<имя>.html и её скрипт public/muzei/<музей>/igry/<имя>.js.
// Тексты — 1:1 из страницы, ничего не выкидывается: блок, которого шаблон не знает, — в razdely (после соседа сверху),
// неразобранный остаток — ошибка. Факты не сочиняются: нет блока #fakty — нет фактов, сборку остановит замок
// src/lib/dni-shablon.mjs, пока факты с отрывком/страницей/ссылкой/пометкой не внесены в карточку.
import fs from 'node:fs';
import vm from 'node:vm';
import YAML from 'yaml';
import { BLOKI } from '../../src/lib/dni-shablon.mjs';

const [muzei, key, imya = `den-${process.argv[3]}`] = process.argv.slice(2);
if (!muzei || !/^\d\d-\d\d$/.test(key ?? '')) { console.error('запуск: node scripts/dni-shablon/iz-html.mjs <музей> <ММ-ДД> [имя-игры]'); process.exit(2); }
const src = fs.readFileSync(`src/data/full-pages/${muzei}/${key}.html`, 'utf8');
const one = (re, s = src) => { const m = re.exec(s); if (!m) throw new Error(`${muzei}/${key}: нет ${re}`); return m[1]; };
const may = (re, s = src) => re.exec(s)?.[1];
const all = (re, s) => [...s.matchAll(re)];
const ctx = (code, w = {}) => { vm.runInNewContext(code, { window: w }); return w; };
// Все секции верхнего уровня (<section …id="…">…\n</section>) по порядку — для известных блоков и razdely.
const sekcii = all(/^<section[^>]*id="([^"]+)"[^>]*><\/section>|^<section[^>]*?id="([^"]+)"[\s\S]*?\n<\/section>/gm, src).map((m) => ({ id: m[1] ?? m[2], html: m[0] }));
const sec = (id) => sekcii.find((s) => s.id === id)?.html;
const IGRA = 'games';
const udary = (s) => all(/<li( class="find")?><details><summary><span>([\s\S]*?)<span class="more-lbl"><span class="o">Узнать подробнее<\/span><span class="c">Свернуть<\/span><\/span><\/span><\/summary>\n        <div class="det">\n([\s\S]*?)\n        <\/div><\/details><\/li>/g, s).map((m) => {
  const ps = m[3].split('\n').map((p) => { const x = /^          <p( class="src-note")?>([\s\S]*)<\/p>$/.exec(p); if (!x) throw new Error('абзац удара не разобран: ' + p); return x; });
  const det = ps.filter((x) => !x[1]).map((x) => x[2]); const srcN = ps.filter((x) => x[1]);
  if (srcN.length !== 1 || ps.at(-1) !== srcN[0]) throw new Error('у удара не одна строка src-note в конце');
  const u = { summary: m[2] };
  if (m[1]) u.find = true;
  const t = /^<span class="tag">([^<]*)<\/span>/.exec(det[0]); if (t) { u.tag = t[1]; det[0] = det[0].slice(t[0].length); }
  u.det = det; u.src = srcN[0][2]; return u; });
const proverUdary = (s, list) => { const n = (s.match(/<li>|<li class/g) || []).length; if (n !== list.length) throw new Error(`ударов ${list.length} из ${n}`); return list; };

// Скрипт страницы с игрой и викториной: «кнопки» + игра + «ВИКТОРИНА». Игра — как есть, в своей обёртке.
const bigJs = one(/<script>\n(\(function\(\)\{\n  var \$ = function\(id\)\{return document\.getElementById\(id\);\};\n  \$\('readBtn'\)[\s\S]*?\n\}\)\(\);)\n<\/script>/);
const igraJs = one(/\$\('listenBtn'\)[^\n]*\n\n?([\s\S]*?)\n\n  \/\* ── ВИКТОРИНА/, bigJs);
const Q = vm.runInNewContext('(' + one(/\n  var Q = (\[[\s\S]*?\n  \]);/, bigJs) + ')');
const qBall = +one(/award\('q'\+qi,(\d+)\)/, bigJs);
const W = ctx(one(/<script>\n(?:\/\*[\s\S]*?\*\/\n)?(window\.MUSEUM_SCORE = [\s\S]*?)\n<\/script>/));
// Настройки полосы: у части дней (01-17…) window.MUSEUM_CHROME нет — museum-chrome.js без настроек, поле chrome не пишется.
const chromeJs = may(/<script>(window\.MUSEUM_CHROME=\{[\s\S]*?\};)<\/script>/), chrome = chromeJs && ctx(chromeJs).MUSEUM_CHROME;
// Второй inline-скрипт сразу после большого (01-17…: развилка, чат, перечень темы) — как есть в <имя>-dop.js.
const dopJs = may(/\n\}\)\(\);\n<\/script>\n\n?<script>\n((?!window\.)[\s\S]*?)\n<\/script>/);
// Свой CSS дня вместо inline <style> (01-17…): <link> на public/assets/izobreteniya-den*.css — список имён.
const cssDnya = all(/<link rel="stylesheet" href="\.\.\/\.\.\/assets\/(izobreteniya-den[\w-]*)\.css">/g, src).map((m) => m[1]);
const RET = ctx(one(/<script>(window\.MUSEUM_RETURN=[\s\S]*?)<\/script>/)).MUSEUM_RETURN;
const AG = ctx(one(/<script>(window\.MUSEUM_AUDIOGUIDE=\{[\s\S]*?\};)<\/script>/)).MUSEUM_AUDIOGUIDE;
const proof = JSON.parse(one(/<script type="application\/json" data-proof>([\s\S]*?)<\/script>/));
const meta = (n) => one(new RegExp(`<meta (?:name|property)="${n}" content="([^"]*)">`));
const hero = /<img class="scene" src="([^"]*)" data-source="([^"]*)" data-license="([^"]*)" width="(\d+)" height="(\d+)" alt="([^"]*)" fetchpriority="high"( decoding="async")?>/.exec(src);
// Подпись обложки: с <span class="credit"> (01-15, 01-16) или без него (01-17…).
const cap = /<div class="scene-cap">([\s\S]*?) <span class="credit">([\s\S]*?)<\/span><\/div>/.exec(src) ?? /<div class="scene-cap">([\s\S]*?)()<\/div>/.exec(src);
const figStil = may(/<figure class="hero-fig" style="([^"]*)">/), sceneId = may(/<div class="hero-scene[^"]*" id="([^"]*)">/);
const story = sec('story'), fakty = sec('fakty'), perv = sec('pervenstvo'), quiz = sec('quiz'), result = sec('result'), video = sec('video');
// Блок шаблона, разметка которого на старой странице другая (01-17…: без inline-стилей, классы своего CSS), —
// в svoi 1:1, layout выводит его как есть; данные викторины (вопросы, балл) всё равно берутся из скрипта.
const KALENDAR = '<section class="block" id="calendar">\n  <div class="wrap">\n    <h2 style="margin-bottom:6px">Календарь изобретений</h2>\n    <p style="color:var(--muted);margin-top:0;max-width:62ch">Выбери любой день — узнаешь, что русские сделали первыми в мире. Листай месяцы стрелками.</p>\n    <div id="calbox"></div>\n  </div>\n</section>';
const svoi = {};
if (!/<p style="margin-top:0">/.test(perv)) svoi.pervenstvo = perv;
if (!/<p style="color:var\(--muted\);max-width:62ch">/.test(quiz)) svoi.quiz = quiz;
if (!/<h2 style="margin-bottom:6px">/.test(result)) svoi.result = result;
if (sec('calendar') !== KALENDAR) svoi.calendar = sec('calendar');
const kd = all(/<div class="kd-card( main)?"><span class="kd-lbl">([^<]*)<\/span><a href="([^"]*)">([\s\S]*?) <span class="kd-arr">→<\/span><\/a>\n        <p>([\s\S]*?)<\/p><\/div>/g, sec('kuda-dalshe'));

// Блоки шаблона: id секции → имя блока; остальные секции — razdely после ближайшего известного блока выше.
const imenaBlokov = { [IGRA]: 'igra' };
const razdely = []; let posle = 'daynav';
for (const s of sekcii) {
  const b = imenaBlokov[s.id] ?? s.id;
  if (BLOKI.includes(b)) { posle = b; continue; }
  razdely.push({ posle, html: s.html });
}
const card = {
  muzei, key, adres: 'den',
  head: { title: one(/<title>([^<]*)<\/title>/), description: meta('description'), canonical: one(/<link rel="canonical" href="([^"]*)">/),
    sobytie: JSON.parse(fs.readFileSync(`src/content/days/${muzei}/${key}.json`, 'utf8')).title, god: may(/<div class="date-chip">[^<]*?(\d{3,4})<\/div>/) ?? one(/<div class="date-chip">(\d{3,4})\b/),
    og: { type: meta('og:type'), site_name: meta('og:site_name'), title: meta('og:title'), description: meta('og:description'), url: meta('og:url'), ...(may(/<meta property="og:image" content="([^"]*)">/) ? { image: meta('og:image') } : {}) },
    ld: JSON.parse(one(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)) },
  ...(hero ? { oblozhka: { src: hero[1], width: +hero[4], height: +hero[5], alt: hero[6], data_source: hero[2], license: hero[3],
    podpis: cap[1], ...(cap[2] ? { credit: cap[2] } : {}), ...(figStil ? { stil_figury: figStil } : {}), ...(sceneId ? { id_sceny: sceneId } : {}),
    ...(hero[7] ? {} : { decoding: false }), hint: one(/<span class="scene-hint">([^<]*)<\/span>/), fit_full: /class="hero-scene fit-full"/.test(src), celikom: false } } : {}),
  ...(cssDnya.length ? { css: cssDnya } : {}),
  kroshka: one(/<span class="here">([^<]*)<\/span>/),
  lead: { data: one(/<div class="date-chip">([^<]*)<\/div>/), privyazka: one(/<p class="date-origin">([\s\S]*?)<\/p>/), kto: one(/<div class="who">([\s\S]*?)<\/div>/),
    h1: one(/<h1>([\s\S]*?)<\/h1>/), hook: one(/<p class="hook">([\s\S]*?)<\/p>/) },
  stamp: all(/<div><div class="v">([^<]*)<\/div><div class="k">([^<]*)<\/div><\/div>/g, src).map((m) => ({ v: m[1], k: m[2] })),
  daynav: all(/    <a href="#([^"]*)">([^<]*)<\/a>/g, one(/(<nav class="daynav"[\s\S]*?<\/nav>)/)).map((m) => ({ id: m[1], label: m[2] })),
  // Документ первенства: секция после меню дня (verh) или пустой блок после подвала (podval), как на старой странице.
  dokument: sec('dokument') ? 'verh' : /<\/footer>\n\n<section data-proof-block><\/section>/.test(src) ? 'podval' : 'net',
  ...(video ? { video: { h2: one(/<h2 style="margin:0">([^<]*)<\/h2>/, video), klyuch: one(/data-rc-video="([^"]*)"/, video), format: one(/data-rc-format="([^"]*)"/, video),
    pole: one(/data-rc-video-field="([^"]*)"/, video), suffix: one(/data-rc-video-suffix="([^"]*)"/, video), badge: one(/data-rc-video-suffix="[^"]*">([^<]*)<\/span>/, video),
    intro: one(/<p style="color:var\(--muted\);margin-top:0">([\s\S]*?)<\/p>/, video), poster: one(/poster="([^"]*)"/, video), mp4: one(/<source src="([^"]*)"/, video),
    note: one(/<p style="font-size:13px;color:var\(--muted\);margin-top:10px">([\s\S]*?)<\/p>/, video) } } : {}),
  story: { kicker: one(/<div class="kicker">([^<]*)<\/div>/, story), h2: one(/<h2>([^<]*)<\/h2>/, story), ...(/<p style="color:var\(--muted\);max-width:62ch">/.test(story) ? { intro: one(/<p style="color:var\(--muted\);max-width:62ch">([\s\S]*?)<\/p>/, story) } : {}), udary: proverUdary(story, udary(story)) },
  ...(fakty ? { fakty: { kicker: one(/<div class="kicker">([^<]*)<\/div>/, fakty), h2: one(/<h2>([^<]*)<\/h2>/, fakty), udary: proverUdary(fakty, udary(fakty)) } } : {}),
  ...(Object.keys(svoi).length ? { svoi } : {}),
  razdely,
  igra: { imya, ...(dopJs ? { dop: true } : {}), css: all(/<link rel="stylesheet" href="\.\.\/\.\.\/assets\/(igra-[\w-]+)\.css">/g, src).map((m) => m[1]) },
  ...(svoi.pervenstvo ? {} : { pervenstvo: { kicker: one(/<div class="kicker">([^<]*)<\/div>/, perv), h2: one(/<h2>([^<]*)<\/h2>/, perv),
    granica: one(/<p style="margin-top:0">([\s\S]*?)<\/p>/, perv), net: one(/<p style="margin-bottom:0">([\s\S]*?)<\/p>/, perv),
    kolonki: all(/<th scope="col">([^<]*)<\/th>/g, perv).map((m) => m[1]),
    stroki: all(/<tr>(<td>[\s\S]*?)<\/tr>/g, perv).map((m) => all(/<td>([\s\S]*?)<\/td>/g, m[1]).map((x) => x[1])) } }),
  quiz: svoi.quiz ? { ball: qBall, voprosy: Q } : { kicker: one(/<div class="kicker">([^<]*)<\/div>/, quiz), h2: one(/<h2>([^<]*)<\/h2>/, quiz), intro: one(/<p style="color:var\(--muted\);max-width:62ch">([\s\S]*?)<\/p>/, quiz),
    noscript: one(/<noscript><div class="noscript-box">([\s\S]*?)<\/div><\/noscript>/, quiz), ball: qBall, voprosy: Q },
  ...(svoi.result ? {} : { result: { h2: one(/<h2 style="margin-bottom:6px">([^<]*)<\/h2>/, result), intro: one(/<p style="color:var\(--muted\);margin-top:0;max-width:62ch">([\s\S]*?)<\/p>/, result),
    zvanie: one(/<div class="dr-score" id="dayTxt">([^<]*)<\/div>/, result), note: one(/<div class="dr-note">([\s\S]*?)<\/div>/, result) } }),
  figures: all(/<figure class="fig"><img src="([^"]*)" alt="([^"]*)" loading="lazy" decoding="async" data-source="([^"]*)" data-license="([^"]*)"><figcaption>([\s\S]*?) <span class="credit">([\s\S]*?)<\/span><\/figcaption><\/figure>/g, src)
    .map((f) => ({ src: f[1], alt: f[2], data_source: f[3], license: f[4], podpis: f[5], credit: f[6] })),
  // Строка источника не по образцу «<a>название</a>: пояснение» (01-17: «Изображения: <a>…</a> и <a>…</a>») — { html } как есть.
  sources: all(/<li>([\s\S]*?)<\/li>/g, sec('sources')).map((li) => { const m = /^<a href="([^"]*)" rel="noopener" target="_blank">([\s\S]*?)<\/a>( \([^)]*\))?: ([\s\S]*)$/.exec(li[1]);
    return m ? { href: m[1], title: m[2], ...(m[3] ? { pometka: m[3].trim() } : {}), note: m[4] } : { html: li[1] }; }),
  kuda: kd.filter((m) => /Следующ|Предыдущ/.test(m[2])).map((m) => ({ lbl: m[2], href: m[3], title: m[4], hook: m[5], main: !!m[1] })),
  score: W.MUSEUM_SCORE,
  ...(chrome ? { chrome: { share: chrome.share, prev: chrome.prev, next: chrome.next, all: chrome.all, random: chrome.random } } : {}),
  return: RET.riddle,
  audioguide: AG,
  proof,
};
const nIst = (sec('sources').match(/<li>/g) || []).length;
if (card.sources.length !== nIst) throw new Error(`источников ${card.sources.length} из ${nIst}`);
fs.mkdirSync(`src/data/igry/${muzei}`, { recursive: true }); fs.mkdirSync(`public/muzei/${muzei}/igry`, { recursive: true });
fs.writeFileSync(`src/data/igry/${muzei}/${imya}.html`, sec(IGRA) + '\n');
fs.writeFileSync(`public/muzei/${muzei}/igry/${imya}.js`, `/* Игра ${key} — скрипт как есть со страницы src/data/full-pages/${muzei}/${key}.html (scripts/dni-shablon/iz-html.mjs, Р286);
   разметка — src/data/igry/${muzei}/${imya}.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
${igraJs}
})();
`);
if (dopJs) fs.writeFileSync(`public/muzei/${muzei}/igry/${imya}-dop.js`, `/* Второй скрипт дня ${key} (развилка, чат, перечень темы…) — как есть со страницы src/data/full-pages/${muzei}/${key}.html
   (scripts/dni-shablon/iz-html.mjs, Р286). Нужна глобальная award() (assets/museum-score.js). */
${dopJs}
`);
fs.writeFileSync(`src/content/dni-shablon/${muzei}/${key}.yaml`, YAML.stringify(card, { lineWidth: 0 }));
console.log(`${muzei}/${key}: ударов ${card.story.udary.length}, фактов ${card.fakty?.udary.length ?? 0}, разделов ${razdely.length} (${razdely.map((r) => r.html.match(/id="([^"]+)"/)[1]).join(', ') || '—'}), вопросов ${Q.length}, источников ${card.sources.length}, документ ${card.dokument}, игра ${imya}`);
