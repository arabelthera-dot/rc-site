// Сторож ссылок и опасного JS (разбор безопасности 20.10.2026, b-cepochka-postavok.md п. 1, 2).
// 1) Домены: каждый внешний адрес http(s):// в исходниках страниц — дни (src/content/days), полные страницы
//    (src/data/full-pages), шаблоны (src/components, src/layouts, src/pages, src/lib, src/data), движки
//    (public/assets) — сверяется с data/razreshennye-domeny.txt. Ловит и <a href>, которых не видит
//    vneshnie-hosty.mjs. Запись списка разрешает хост и его поддомены. Новый домен — код 1.
// 2) Опасный JS в public/assets/**/*.js и <script> полных страниц: eval(, new Function, atob(, document.write,
//    присвоение location внешнего адреса, склейка 'ht'+'tps'. На main 20.10.2026 — 0 нарушений, поэтому строгий.
// Запуск: node scripts/storozh-ssylok.mjs            проверка (код 0 — чисто, 1 — нарушения)
//         node scripts/storozh-ssylok.mjs --sobrat   пересобрать список доменов из текущего дерева (только вручную)
import fs from 'node:fs';
import path from 'node:path';

const SPISOK = 'data/razreshennye-domeny.txt';
const KORNI = ['src/content/days', 'src/data', 'src/components', 'src/layouts', 'src/pages', 'src/lib', 'public/assets'];
const RASSH = /\.(?:md|mdx|json|ya?ml|html|astro|js|mjs|ts|css|svg)$/i;
const URL_RE = /https?:\/\/([A-Za-z0-9.-]+)/g;

function* faily(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* faily(p);
    else if (RASSH.test(e.name)) yield p;
  }
}
const host = (h) => h.toLowerCase().replace(/\.$/, '').replace(/^www\./, '');

const vstrechi = new Map(); // хост → первый файл
for (const k of KORNI) for (const f of faily(k)) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(URL_RE)) {
    const h = host(m[1]);
    if (!h.includes('.') || /^[\d.]+$/.test(h) && h.startsWith('127.')) continue;
    if (!vstrechi.has(h)) vstrechi.set(h, f);
  }
}

if (process.argv.includes('--sobrat')) {
  const shapka = '# Разрешённые внешние домены rc-site (storozh-ssylok.mjs). Запись разрешает домен и его поддомены.\n'
    + '# Собрано с main 20.10.2026. Новый домен добавляй, только если он законен (источник, музей, архив).\n';
  fs.writeFileSync(SPISOK, shapka + [...vstrechi.keys()].sort().join('\n') + '\n');
  console.log(`список доменов: ${vstrechi.size} → ${SPISOK}`);
  process.exit(0);
}

const razr = fs.readFileSync(SPISOK, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#')).map(host);
const razresheno = (h) => razr.some((r) => h === r || h.endsWith('.' + r));
const narusheniya = [];
for (const [h, f] of vstrechi) if (!razresheno(h)) narusheniya.push(`новый внешний домен ${h} в ${f} — добавь в ${SPISOK}, если законен`);

// Опасный JS
const OPASNO = [
  [/\beval\s*\(/, 'eval('],
  [/\bnew\s+Function\b/, 'new Function'],
  [/\batob\s*\(/, 'atob('],
  [/\bdocument\.write(?:ln)?\s*\(/, 'document.write'],
  [/\blocation(?:\.href)?\s*=\s*[`'"](?:https?:)?\/\//, 'присвоение location внешнего адреса'],
  [/\blocation\.(?:assign|replace)\s*\(\s*[`'"](?:https?:)?\/\//, 'location.assign/replace на внешний адрес'],
  [/[`'"](?:h|ht|htt|http|https|https:|https:\/)[`'"]\s*\+\s*[`'"]/, "склейка адреса 'ht'+'tps'"],
];
function proverkaJs(kod, f) {
  for (const [re, imya] of OPASNO) {
    const m = re.exec(kod);
    if (m) narusheniya.push(`опасный JS: ${imya} в ${f} — «${m[0]}»`);
  }
}
let jsFailov = 0;
for (const f of faily('public/assets')) if (/\.m?js$/.test(f)) { jsFailov++; proverkaJs(fs.readFileSync(f, 'utf8'), f); }
for (const f of faily('src/data/full-pages')) if (f.endsWith('.html')) {
  jsFailov++;
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) proverkaJs(m[1], f);
}

for (const s of narusheniya) console.log(`::error::${s}`);
console.log(`storozh-ssylok: доменов встречено ${vstrechi.size}, в списке ${razr.length}; файлов со скриптами ${jsFailov}; нарушений ${narusheniya.length}`);
process.exit(narusheniya.length ? 1 : 0);
