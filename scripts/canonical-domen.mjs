// Адрес страницы — на своём домене (r608, 02.11.2026): canonical и og:url каждой страницы dist и карточек шаблона дня
// (src/content/dni-shablon/*/*.yaml: head.canonical, head.og.url, head.ld.url) — только https://russian-civilization.ru/…
// 22 из 31 карточки января музея изобретений смотрели на старый arabelthera-dot.github.io/rc-museum-preview: живой сайт
// это не задевало (конвейер src/integrations/full-pages.mjs ставит адрес заново), но карточка врала, и любой обход
// конвейера отдал бы поисковику чужой первоисточник. В dist адрес сверяется ещё и с путём страницы.
// Запускается в конце npm run build (шаг сборки proverka.yml и деплой). СТРОГО (Р557 п.1, 05.11.2026: на main 0 находок из 5395 страниц): находка — красная строка (::error) и код выхода 1.
// Откат — вернуть ::warning и убрать process.exit(1) в конце файла.
// Запуск: node scripts/canonical-domen.mjs --proba && node scripts/canonical-domen.mjs [--dist dist]
import fs from 'node:fs';
import path from 'node:path';
const DOMEN = 'https://russian-civilization.ru/';
const args = process.argv.slice(2);
const DIST = args.includes('--dist') ? args[args.indexOf('--dist') + 1] : null;
const svoy = (u) => typeof u === 'string' && u.startsWith(DOMEN);

// Адреса страницы из HTML: canonical и og:url (атрибуты в любом порядке).
export function adresa(html) {
  const out = [];
  for (const [t] of html.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi)) out.push(['canonical', /\bhref=["']([^"']*)["']/i.exec(t)?.[1]]);
  for (const [t] of html.matchAll(/<meta\b[^>]*\bproperty=["']og:url["'][^>]*>/gi)) out.push(['og:url', /\bcontent=["']([^"']*)["']/i.exec(t)?.[1]]);
  return out;
}
// Находки одной страницы dist: чужой домен или адрес не той страницы (rel — путь файла от корня dist).
export function nahodkiStranicy(html, rel) {
  if (/http-equiv=["']refresh/i.test(html)) return [];
  const put = DOMEN + rel.split(path.sep).join('/').replace(/(^|\/)index\.html$/, '$1');
  // Путь сверяется у индексируемых index.html; копии под noindex (staraya/, den-shablon/) честно смотрят на живой день.
  const sverka = /index\.html$/.test(rel) && !/name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
  return adresa(html).filter(([, u]) => !svoy(u) || sverka && u !== put)
    .map(([k, u]) => `${k}=${u ?? '(пусто)'}${svoy(u) ? ` ≠ ${put}` : ''}`);
}

if (args.includes('--proba')) {
  const plohie = [
    ['<link rel="canonical" href="https://arabelthera-dot.github.io/rc-museum-preview/muzei/izobreteniya/day-01jan-cabletv.html">', 'muzei/izobreteniya/den/01-01/index.html'],
    ['<meta property="og:url" content="https://example.com/x/">', 'muzei/izobreteniya/den/01-01/index.html'],
    ['<link href="https://russian-civilization.ru/muzei/izobreteniya/den/01-02/" rel="canonical">', 'muzei/izobreteniya/den/01-01/index.html'],
  ];
  const horoshie = [
    ['<link rel="canonical" href="https://russian-civilization.ru/muzei/izobreteniya/den/01-01/" />\n<meta property="og:url" content="https://russian-civilization.ru/muzei/izobreteniya/den/01-01/" />', 'muzei/izobreteniya/den/01-01/index.html'],
    ['<link rel="canonical" href="https://russian-civilization.ru/" />', 'index.html'],
    ['<meta http-equiv="refresh" content="0;url=/"><link rel="canonical" href="https://russian-civilization.ru/muzei/">', 'muzei/old.html'],
  ];
  const ne = [...plohie.filter(([h, r]) => !nahodkiStranicy(h, r).length), ...horoshie.filter(([h, r]) => nahodkiStranicy(h, r).length)];
  if (ne.length) { console.error('canonical-domen --proba: проверка ошиблась на', ne); process.exit(1); }
  console.log(`canonical-domen --proba: ${plohie.length} заведомо плохих пойманы, ${horoshie.length} хороших пропущены`);
  process.exit(0);
}

const nahodki = [];
// 1. Карточки шаблона дня: адрес в самой карточке.
const SHABLON = 'src/content/dni-shablon';
let kartochek = 0;
for (const muzei of fs.existsSync(SHABLON) ? fs.readdirSync(SHABLON) : []) {
  for (const f of fs.readdirSync(path.join(SHABLON, muzei)).filter((x) => x.endsWith('.yaml')).sort()) {
    kartochek++;
    const t = fs.readFileSync(path.join(SHABLON, muzei, f), 'utf8');
    const key = f.slice(0, -5), nado = `${DOMEN}muzei/${muzei}/den/${key}/`;
    // head.canonical, head.og.url, head.ld.url — строки «canonical:» и «url:» на отступе 4 (поля og/ld).
    for (const [, k, u] of t.matchAll(/^(  canonical|    url):\s*["']?([^\s"']+)/gm))
      if (u !== nado) nahodki.push(`${SHABLON}/${muzei}/${f}: ${k.trim()}=${u} (нужно ${nado})`);
  }
}
// 2. Собранный сайт: каждая страница dist.
let stranic = 0;
if (DIST) (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p);
  else if (e.name.endsWith('.html')) { stranic++; const rel = path.relative(DIST, p); for (const n of nahodkiStranicy(fs.readFileSync(p, 'utf8'), rel)) nahodki.push(`${DIST}/${rel}: ${n}`); }
} })(DIST);

const itog = `canonical-domen: карточек шаблона ${kartochek}${DIST ? `, страниц dist ${stranic}` : ''}; адрес не на ${DOMEN} или не той страницы — ${nahodki.length}`;
console.log(itog);
for (const n of nahodki.slice(0, 50)) console.log(`::error title=canonical не на своём домене::${n}`);
if (nahodki.length > 50) console.log(`… и ещё ${nahodki.length - 50}`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
  `### canonical-domen\n${itog}\n${nahodki.slice(0, 50).map((n) => `- ${n}`).join('\n')}\n`);
if (nahodki.length) process.exit(1);
