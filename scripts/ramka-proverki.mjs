// Судья рабочей рамки (Р558, Сергей 05.11.2026): четыре проверки — ролик, кадры, дата, «глазами» — строгие для дней
// из data/rabochie-dni.json (музеи × месяц) и молчат про все прочие дни. Храповик, как у gotovnost-hrapovik:
// грязный день рамки краснит заявку, если заявка его трогает или если его нет в долге (долг — грязные дни рамки на main;
// убирать можно, пополнять нельзя). Стал чистым — строка «снять из долга», `--zapisat` снимает сам.
// Мерит собранную dist (шаблонные дни dni-shablon в full-pages не видны):
//   ролик  — proverit из scripts/media-dnya.mjs: <video> вне игры, mp4 в public/ есть и не пустой;
//   дата   — rashozhdenie из scripts/data-dnya.mjs по <title>/<h1> страницы и названию/хуку карточки (недатированные музеи — чисто);
//   кадры  — JSON tools/kadry-povtory.py --ramka: у дня нет ни одного замечания мерки (разных ≥ 6, портретов ≤ 1/3, без повторов);
//   глазами — tablica.tsv scripts/glazami.mjs --tolko (дни из --spisok): страница открылась и прошла все пункты.
// Нет отчёта кадров или «глазами» — заявка красная: строгая проверка без замера не зеленеет.
// Запуск: node scripts/ramka-proverki.mjs --dist dist --kadry /tmp/kadry-ramka.json --glazami /tmp/glazami/tablica.tsv
//         [--baza origin/main] [--zapisat] | --proba | --spisok (дни рамки через запятую: музей/ММ-ДД)
// Откат — удалить шаг ramka-proverki из .github/workflows/proverka.yml.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { proverit } from './media-dnya.mjs';
import { rashozhdenie } from './data-dnya.mjs';

const RAMKA = 'data/rabochie-dni.json';
const PROVERKI = ['ролик', 'кадры', 'дата', 'глазами'];
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const est = (k) => process.argv.includes(k);

export function dniRamki(r) {
  const mm = r['месяц'], dney = new Date(2024, +mm, 0).getDate(); // високосный: у февраля 29 дней
  return r['музеи'].flatMap((m) => Array.from({ length: dney }, (_, i) => `${m}/${mm}-${String(i + 1).padStart(2, '0')}`));
}

// Тронутые заявкой дни рамки: страница, карточка, шаблон, утверждённая карточка.
export function tronutye(fajly, dni) {
  const set = new Set();
  for (const f of fajly) {
    const m = /^src\/(?:data\/full-pages|content\/days|content\/dni-shablon|data\/utverzhdeno)\/([\w-]+)\/(\d\d-\d\d)\.\w+$/.exec(f);
    if (m && dni.includes(`${m[1]}/${m[2]}`)) set.add(`${m[1]}/${m[2]}`);
  }
  return set;
}

// Красный: день грязный и (тронут или не в долге). Долг по проверке — список дней.
export function sudit(gryaz, dolg, tronut) {
  const krasnye = [], snyat = [];
  for (const p of PROVERKI) {
    const d = new Set(dolg[p] || []);
    for (const [den, prichina] of Object.entries(gryaz[p] || {})) {
      if (tronut.has(den)) krasnye.push(`${den} — ${p}: ${prichina} (день тронут заявкой — сдаётся чистым)`);
      else if (!d.has(den)) krasnye.push(`${den} — ${p}: ${prichina} (на main был чистым)`);
    }
    for (const den of d) if (!(gryaz[p] || {})[den]) snyat.push(`${den} — ${p}`);
  }
  return { krasnye, snyat };
}

export const tsvGlazami = (tekst) => {
  const [shapka, ...stroki] = tekst.trim().split('\n').map((s) => s.split('\t'));
  const out = {};
  for (const s of stroki) {
    const m = /\/muzei\/([^/]+)\/den\/(\d\d-\d\d)\/$/.exec(s[0]);
    if (!m) continue;
    // «дубль title» — сравнение по выборке, не свойство страницы.
    const minus = s[1] === 'не открылась' ? ['не открылась'] : shapka.slice(2).filter((n, i) => n !== 'дубль title' && s[i + 2] === '−');
    out[`${m[1]}/${m[2]}`] = minus;
  }
  return out;
};

const zagolovki = (html) => [html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1], html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]]
  .filter(Boolean).map((t) => t.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/\s+/g, ' ').trim().replace(/\s+—\s+(Музей|Русская цивилизация)[\s\S]*$/, ''));

export function izmerit(dni, { dist, kadry, glazami, root = 'public' }) {
  const gryaz = Object.fromEntries(PROVERKI.map((p) => [p, {}]));
  for (const den of dni) {
    const [m, key] = den.split('/');
    const f = path.join(dist, 'muzei', m, 'den', key, 'index.html');
    if (!fs.existsSync(f)) { for (const p of ['ролик', 'дата']) gryaz[p][den] = 'нет страницы в сборке'; continue; }
    const html = fs.readFileSync(f, 'utf8');
    const r = proverit(html, m, root);
    if (r.rolik.length) gryaz['ролик'][den] = r.rolik.join('; ');
    // Недатированный музей (calendar-meta dated:false) — дата не проверяется, как у data-dnya.
    let datirovan = true;
    try { datirovan = JSON.parse(fs.readFileSync(`src/data/calendar-meta-${m}.json`, 'utf8')).dated !== false; } catch {}
    if (!datirovan) continue;
    const polya = zagolovki(html);
    const kart = path.join('src/content/days', m, `${key}.json`);
    if (fs.existsSync(kart)) { const d = JSON.parse(fs.readFileSync(kart, 'utf8')); polya.push(d.title, d.hook); }
    const data = polya.filter(Boolean).map((t) => rashozhdenie(t, key)).find(Boolean);
    if (data) gryaz['дата'][den] = `«${data}»`;
  }
  for (const [p, otchet] of [['кадры', kadry], ['глазами', glazami]]) {
    if (!otchet) continue;
    for (const den of dni) {
      const v = otchet[den];
      if (!v) gryaz[p][den] = 'нет в замере';
      else if (v.length) gryaz[p][den] = v.join(', ');
    }
  }
  return gryaz;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const ramka = JSON.parse(fs.readFileSync(RAMKA, 'utf8'));
  const dni = dniRamki(ramka);
  if (est('--spisok')) { console.log(dni.join(',')); process.exit(0); }
  if (est('--proba')) {
    const pr = [
      ['чистый не в долге', { 'ролик': {} }, {}, [], 0],
      ['грязный в долге, не тронут', { 'ролик': { 'a/01-01': 'нет' } }, { 'ролик': ['a/01-01'] }, [], 0],
      ['грязный не в долге', { 'ролик': { 'a/01-01': 'нет' } }, {}, [], 1],
      ['грязный в долге, тронут', { 'кадры': { 'a/01-01': 'повторы' } }, { 'кадры': ['a/01-01'] }, ['a/01-01'], 1],
      ['чистый тронут', {}, { 'дата': ['a/01-01'] }, ['a/01-01'], 0],
    ];
    let mimo = 0;
    for (const [imya, g, d, t, zhd] of pr) {
      const k = sudit(g, d, new Set(t)).krasnye.length;
      if (k !== zhd) mimo++;
      console.log(`${k === zhd ? 'ок ' : 'МИМО'} ${imya}: красных ${k}, ждали ${zhd}`);
    }
    const tr = tronutye(['src/content/dni-shablon/a/01-02.yaml', 'src/data/full-pages/a/02-01.html', 'src/content/days/b/01-02.json'], ['a/01-02', 'b/01-03']);
    if ([...tr].join() !== 'a/01-02') { mimo++; console.log(`МИМО тронутые: ${[...tr]}`); }
    if (dniRamki({ 'музеи': ['a'], 'месяц': '02' }).length !== 29) { mimo++; console.log('МИМО дни февраля'); }
    const tsv = tsvGlazami('адрес\tвид\tog\tCLS<0.1\tдубль title\n/muzei/a/den/01-01/\tдень\t+\t−\t−\n/muzei/a/den/01-02/\tдень\t+\t+\t−\n/muzei/a/den/01-03/\tне открылась\n');
    if (JSON.stringify(tsv) !== '{"a/01-01":["CLS<0.1"],"a/01-02":[],"a/01-03":["не открылась"]}') { mimo++; console.log('МИМО tablica.tsv', tsv); }
    console.log(`ramka-proverki: проба ${mimo ? 'мимо ' + mimo : 'чисто'}`);
    process.exit(mimo ? 1 : 0);
  }
  const chitatJson = (f) => (f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null);
  const kadryRaw = chitatJson(arg('--kadry'));
  const kadry = kadryRaw && Object.fromEntries(Object.entries(kadryRaw).map(([k, v]) => [k, v.flagi]));
  const gf = arg('--glazami');
  const glazami = gf && fs.existsSync(gf) ? tsvGlazami(fs.readFileSync(gf, 'utf8')) : null;
  const gryaz = izmerit(dni, { dist: arg('--dist', 'dist'), kadry, glazami });
  const oshibki = [];
  if (!kadry) oshibki.push(`нет отчёта кадров ${arg('--kadry') || '(--kadry)'} — шаг kadry-povtory не отработал`);
  if (!glazami) oshibki.push(`нет таблицы «глазами» ${gf || '(--glazami)'} — шаг glazami не отработал`);

  const baza = arg('--baza', process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main');
  let fajly = [];
  try { fajly = execFileSync('git', ['diff', '--name-only', `${baza}...HEAD`], { encoding: 'utf8' }).split('\n').filter(Boolean); }
  catch { oshibki.push(`нет базы ${baza} — тронутые дни не определить`); }
  const tronut = tronutye(fajly, dni);
  const dolg = ramka['долг'] || {};
  const { krasnye, snyat } = sudit(gryaz, dolg, tronut);

  const chistyh = (p) => dni.length - Object.keys(gryaz[p]).length;
  let s = `### Рамка (Р558): ${ramka['музеи'].join(', ')}, месяц ${ramka['месяц']} — дней ${dni.length}\n\n`
    + `Чистых: ${PROVERKI.map((p) => `${p} ${chistyh(p)}`).join(', ')}. Тронуто заявкой: ${tronut.size ? [...tronut].join(', ') : 'нет'}.\n\n`
    + `| проверка | чистых | в долге | грязные дни |\n|---|---|---|---|\n`
    + PROVERKI.map((p) => `| ${p} | ${chistyh(p)} | ${(dolg[p] || []).length} | ${Object.keys(gryaz[p]).join(', ') || '—'} |`).join('\n') + '\n';
  if (snyat.length) s += `\nСтали чистыми — снять из долга (${RAMKA}, или --zapisat): ${snyat.join('; ')}\n`;
  console.log(s);
  for (const [p, g] of Object.entries(gryaz)) for (const [d, why] of Object.entries(g)) console.log(`  ${d} — ${p}: ${why}`);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, s + '\n');
  if (est('--zapisat')) {
    // Только вниз: из долга уходят ставшие чистыми, новых не прибавляется.
    ramka['долг'] = Object.fromEntries(PROVERKI.map((p) => [p, (dolg[p] || []).filter((d) => gryaz[p][d])]));
    fs.writeFileSync(RAMKA, JSON.stringify(ramka, null, 2) + '\n');
    console.log(`Долг записан: ${RAMKA}`);
  }
  for (const k of krasnye) console.log(`::error::Рамка Р558: ${k}`);
  for (const o of oshibki) console.log(`::error::Рамка Р558: ${o}`);
  process.exit(krasnye.length || oshibki.length ? 1 : 0);
}
