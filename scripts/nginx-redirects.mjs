// Карта 301 для nginx из src/data/redirects.json (21.10.2026): старые адреса — HTTP 301 на уровне веб-сервера,
// а не страница 200 + meta refresh (её поисковики передают хуже). Заглушки meta refresh остаются запасным путём
// (src/integrations/legacy-redirects.mjs) — карта их не заменяет, а опережает.
// Пишет deploy/nginx/rc-redirects.map: строки "/old" "/new"; для nginx map $uri. Адрес …/index.html даёт вторую
// строку — папку «…/» (так её открывают по ссылке), если такой папки нет среди старых адресов и целей.
// Запуск: node scripts/nginx-redirects.mjs  (--check — сверка без записи, код 1 при расхождении).
// Подключение, проверка, откат — deploy/nginx/README.md.
import fs from 'node:fs';

const OUT = 'deploy/nginx/rc-redirects.map';
const map = JSON.parse(fs.readFileSync('src/data/redirects.json', 'utf8'));
const targets = new Set(Object.values(map));
const ok = (s) => /^\/[\x21-\x7e]*$/.test(s) && !/["';{}\\]/.test(s);
// Копию дня den/<ключ>/staraya/ сборка (src/integrations/full-pages.mjs) пишет поверх заглушки — это живая
// страница (noindex); 301 её бы спрятал, поэтому в карту не идёт.
const ZHIVAYA = /\/den\/[^/]+\/staraya\/(index\.html)?$/;
const rows = new Map();
const bad = [];
let skip = 0;
for (const [from, to] of Object.entries(map)) {
  if (!ok(from) || !ok(to)) { bad.push(`${from} → ${to}`); continue; }
  if (ZHIVAYA.test(from)) { skip++; continue; }
  rows.set(from, to);
}
let dirs = 0;
for (const [from, to] of Object.entries(map)) {
  if (!from.endsWith('/index.html')) continue;
  const dir = from.slice(0, -'index.html'.length);
  if (dir === '/' || ZHIVAYA.test(from) || map[dir] || targets.has(dir) || rows.has(dir)) continue;
  rows.set(dir, to); dirs++;
}
if (bad.length) { console.error(`недопустимые символы для nginx map:\n${bad.join('\n')}`); process.exit(1); }
const text = '# Сгенерировано scripts/nginx-redirects.mjs из src/data/redirects.json — руками не править.\n'
  + `# ${rows.size} строк: ${Object.keys(map).length - skip} старых адресов (из ${Object.keys(map).length}; ${skip} — живые копии staraya)`
  + ` + ${dirs} папок «…/» от …/index.html.\n`
  + [...rows].sort(([a], [b]) => (a < b ? -1 : 1)).map(([a, b]) => `"${a}" "${b}";`).join('\n') + '\n';
// Сверка синтаксиса (nginx -t на машине сборки нет): каждая строка — комментарий или "ключ" "значение";
const lines = text.trimEnd().split('\n');
const rule = /^"\/[^"\s;]*" "\/[^"\s;]*";$/;
const wrong = lines.filter((l) => !l.startsWith('#') && !rule.test(l));
const n = lines.filter((l) => !l.startsWith('#')).length;
if (wrong.length || n !== rows.size) { console.error(`карта не прошла сверку: ${wrong.slice(0, 5).join(' | ')} (${n}/${rows.size})`); process.exit(1); }
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== text) { console.error(`${OUT} устарел — node scripts/nginx-redirects.mjs`); process.exit(1); }
  console.log(`${OUT}: актуален, ${n} строк`);
} else {
  fs.writeFileSync(OUT, text);
  console.log(`${OUT}: ${n} строк (${Object.keys(map).length - skip} из ${Object.keys(map).length} адресов + ${dirs} папок; пропущено staraya: ${skip})`);
}
