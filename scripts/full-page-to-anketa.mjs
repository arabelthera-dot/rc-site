// Конвертер «большая страница дня → анкета» (ADR 0001, вариант А Сергея 18.10.2026).
// HTML src/data/full-pages/<музей>/<ММ-ДД>.html режется на блоки верхнего уровня <body>; каждый блок получает тип
// по таблице TYPES (она выведена режимом --stats по частоте блоков во всех страницах, не на глаз).
// Сборка блоков подряд (src/components/den/DenAnketa.astro) возвращает исходную страницу 1:1.
//   node scripts/full-page-to-anketa.mjs --stats               — частоты блоков по всем страницам
//   node scripts/full-page-to-anketa.mjs <музей> <ММ-ДД> [...] — записать doc/body в карточку дня
//   node scripts/full-page-to-anketa.mjs --check <музей> <ММ-ДД> — сборка блоков = исходник (без записи)
import fs from 'node:fs';
import path from 'node:path';
import { split, assemble } from '../src/lib/anketa.mjs';

const SRC = 'src/data/full-pages';
const SKIP_MUSEUMS = new Set(['skazki', 'sport']); // зоны других помощников

function files() {
  return fs.readdirSync(SRC).filter((m) => !SKIP_MUSEUMS.has(m)).sort()
    .flatMap((m) => fs.readdirSync(path.join(SRC, m)).filter((f) => f.endsWith('.html')).map((f) => [m, f.slice(0, -5)]));
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const args = process.argv.slice(2);
  if (args[0] === '--stats') {
    const all = files();
    const type = new Map(), key = new Map(), engines = new Map();
    let exact = 0;
    for (const [m, k] of all) {
      const html = fs.readFileSync(path.join(SRC, m, `${k}.html`), 'utf8');
      const a = split(html);
      if (assemble(a) === html) exact++;
      const seenT = new Set(), seenK = new Set();
      for (const b of a.body) {
        seenT.add(b.type);
        if (b.type === 'dvizhok') { engines.set(b.engine, (engines.get(b.engine) ?? 0) + 1); continue; }
        const o = /^\s*(?:<!--[\s\S]*?-->\s*)*<([\w-]+)([^>]*)>/.exec(b.html ?? '') ?? [];
        seenK.add(`${b.type}\t${o[1] ?? b.type}${b.id ? '#' + b.id : /class=["']([^"' ]+)/.exec(o[2] ?? '') ? '.' + /class=["']([^"' ]+)/.exec(o[2])[1] : ''}`);
      }
      for (const t of seenT) type.set(t, (type.get(t) ?? 0) + 1);
      for (const t of seenK) key.set(t, (key.get(t) ?? 0) + 1);
    }
    const top = (mp, n) => [...mp].sort((x, y) => y[1] - x[1]).slice(0, n).map(([t, c]) => `${String(c).padStart(4)}  ${t}`).join('\n');
    console.log(`страниц: ${all.length} (без ${[...SKIP_MUSEUMS].join(', ')}); сборка блоков = исходник байт в байт: ${exact}`);
    console.log(`\nтипы блоков (в скольких страницах есть):\n${top(type, 40)}`);
    console.log(`\nдвижки public/assets/*.js (в скольких страницах):\n${top(engines, 40)}`);
    console.log(`\nблоки по тегу/id (в скольких страницах, топ-60):\n${top(key, 60)}`);
  } else {
    const check = args[0] === '--check';
    const [museum, ...keys] = check ? args.slice(1) : args;
    for (const k of keys) {
      const html = fs.readFileSync(path.join(SRC, museum, `${k}.html`), 'utf8');
      const a = split(html);
      if (assemble(a) !== html) throw new Error(`${museum}/${k}: сборка блоков ≠ исходник`);
      const counts = a.body.reduce((o, b) => ((o[b.type] = (o[b.type] ?? 0) + 1), o), {});
      if (check) { console.log(`${museum}/${k}: 1:1, блоков ${a.body.length}`, counts); continue; }
      const card = path.join('src/content/days', museum, `${k}.json`);
      const d = JSON.parse(fs.readFileSync(card, 'utf8'));
      d.doc = a.doc;
      d.body = a.body;
      fs.writeFileSync(card, JSON.stringify(d, null, 2) + '\n');
      console.log(`${card}: body — ${a.body.length} блоков`, counts);
    }
  }
}
