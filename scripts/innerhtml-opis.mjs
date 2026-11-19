#!/usr/bin/env node
// Опись HTML-вставок (OWASP DOM XSS, разбор безопасности 20.10.2026): innerHTML / outerHTML /
// insertAdjacentHTML / document.write в src/ и public/ (js, ts, astro, mjs).
// Классы: а — статическая строка; б — данные наших JSON/конфигов сборки; в — на той же строке
// источник извне (location/hash/query/localStorage/sessionStorage/fetch/ввод пользователя/postMessage).
// Замок: падает только на НОВЫЕ места класса «в» сверх базовой линии scripts/innerhtml-isklyucheniya.txt
// (строки «путь<TAB>нормализованная строка кода»). Сторонние vendor/*.min.js — отдельно, не проверяются.
// Запуск: node scripts/innerhtml-opis.mjs [--json] [--obnovit-bazu]
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIRS = ['src', 'public'];
const EXT = /\.(m?js|ts|astro)$/;
const BAZA = join(ROOT, 'scripts/innerhtml-isklyucheniya.txt');
const SINK = /\.innerHTML\s*=(?!=)|\.outerHTML\s*=(?!=)|insertAdjacentHTML\s*\(|document\.write(?:ln)?\s*\(/;
const TAINT = /\blocation\b|\bURLSearchParams\b|\.search\b|\.hash\b|localStorage|sessionStorage|\bfetch\s*\(|\.value\b|\bevent\.data\b|\be\.data\b|\bprompt\s*\(|document\.cookie|document\.referrer|window\.name/;

function* walk(d) {
  let names; try { names = readdirSync(d); } catch { return; }
  for (const n of names) {
    if (n === 'node_modules' || n.startsWith('.')) continue;
    const p = join(d, n);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (EXT.test(n)) yield p;
  }
}

// Правая часть присваивания / аргумент вставки (до конца строки)
function rhs(line) {
  const m = line.match(/(?:\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML\s*\(\s*['"`][a-z]+['"`]\s*,|document\.write(?:ln)?\s*\()([\s\S]*)$/);
  return m ? m[1] : line;
}
// Только литералы без подстановок: '...', "...", `...` без ${}, склеенные плюсом
function staticOnly(r) {
  const t = r.replace(/\/\/.*$/, '').trim().replace(/[;)]+\s*$/, '').trim();
  if (t === '') return false; // многострочное присваивание — смотреть следующую строку не берёмся
  return /^(\s*(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`$]*`)\s*\+?)+$/.test(t);
}
const norm = (s) => s.trim().replace(/\s+/g, ' ').slice(0, 240);

const mesta = [];
for (const dir of DIRS) {
  for (const f of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, f);
    const vendor = /\/vendor\/|\.min\.js$/.test(rel);
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (!SINK.test(line)) return;
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // комментарий
      let klass;
      if (vendor) klass = 'vendor';
      else if (TAINT.test(rhs(line))) klass = 'v';
      else if (staticOnly(rhs(line))) klass = 'a';
      else klass = 'b';
      mesta.push({ file: rel, line: i + 1, klass, code: norm(line) });
    });
  }
}

const baza = new Set(existsSync(BAZA)
  ? readFileSync(BAZA, 'utf8').split('\n').filter((l) => l && !l.startsWith('#')) : []);
const klyuch = (m) => m.file + '\t' + m.code;
const v = mesta.filter((m) => m.klass === 'v');
const novye = v.filter((m) => !baza.has(klyuch(m)));

if (process.argv.includes('--obnovit-bazu')) {
  writeFileSync(BAZA, '# База класса «в» (innerhtml-opis.mjs). Пополнять только после разбора места.\n'
    + v.map(klyuch).join('\n') + (v.length ? '\n' : ''));
  console.log(`база обновлена: ${v.length}`);
  process.exit(0);
}
const count = (k) => mesta.filter((m) => m.klass === k).length;
if (process.argv.includes('--json')) console.log(JSON.stringify(mesta, null, 1));
console.log(`innerhtml-opis: всего ${mesta.length}; а (статика) ${count('a')}; б (наши данные) ${count('b')}; `
  + `в (извне) ${count('v')} (в базе ${v.length - novye.length}); vendor ${count('vendor')}`);
if (novye.length) {
  console.error(`\nНОВЫЕ вставки класса «в» (${novye.length}) — переписать на textContent/createElement`
    + ' или экранировать (esc) — образец museum-return.js:');
  for (const m of novye) console.error(`  ${m.file}:${m.line}  ${m.code}`);
  process.exit(1);
}
