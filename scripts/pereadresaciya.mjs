// Старый адрес https://arabelthera-dot.github.io/rc-site/ — не копия сайта, а переадресация на домен (18.10).
// Основной сайт с 18.10.2026 — https://russian-civilization.ru/ (выкладывает задача vykladka-site); полная копия
// на github.io/rc-site/ — дубль для поисковиков и путаница для людей. Скрипт берёт готовую сборку (dist/)
// и заменяет её переадресациями: каждая страница *.html → тот же путь на домене (meta refresh +
// link rel=canonical + location.replace, запрос и якорь сохраняются); 404.html переадресует по location.pathname
// (картинки, видео, RSS и любой другой адрес попадают на домен через неё). Прочие файлы удаляются —
// выкладка маленькая, и robots.txt с запретом не мешает поисковикам увидеть переадресацию и canonical.
// Запуск: node scripts/pereadresaciya.mjs [папка сборки, по умолчанию dist]
// (DOMAIN — адрес назначения, BASE — префикс старого адреса, по умолчанию /rc-site).
import fs from 'node:fs';
import path from 'node:path';

const DIR = process.argv[2] || 'dist';
const DOMAIN = (process.env.DOMAIN || 'https://russian-civilization.ru').replace(/\/+$/, '');
const BASE = (process.env.BASE ?? '/rc-site').replace(/\/+$/, '');
if (!fs.existsSync(path.join(DIR, 'index.html'))) throw new Error(`${DIR}/index.html нет — сначала сборка`);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const page = (target, script) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Русская цивилизация переехала</title>
<link rel="canonical" href="${esc(target)}">
<meta http-equiv="refresh" content="0; url=${esc(target)}">
<script>${script}</script>
</head>
<body>
<p>Сайт переехал: <a href="${esc(target)}">${esc(target)}</a></p>
</body>
</html>
`;

// Обход сборки: страницы запоминаем, всё остальное удаляем.
const pages = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(path.relative(DIR, p).split(path.sep).join('/'));
    else fs.rmSync(p);
  }
};
walk(DIR);

let n = 0;
for (const rel of pages) {
  const file = path.join(DIR, rel);
  if (rel === '404.html') {
    // Путь берётся у браузера: /rc-site/что-угодно → домен/что-угодно.
    const js = `var p=location.pathname.replace(/^${BASE.replace(/\//g, '\\/')}(?=\\/|$)/,'')||'/';` +
      `location.replace(${JSON.stringify(DOMAIN)}+p+location.search+location.hash);`;
    fs.writeFileSync(file, page(`${DOMAIN}/`, js));
  } else {
    // muzei/x/index.html → /muzei/x/, karta/index.html → /karta/, foo.html → /foo.html
    const url = '/' + rel.replace(/(^|\/)index\.html$/, '$1');
    const target = DOMAIN + url;
    fs.writeFileSync(file, page(target, `location.replace(${JSON.stringify(target)}+location.search+location.hash);`));
  }
  n++;
}
// Пустые папки после удаления файлов — убрать.
const prune = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) prune(path.join(dir, e.name));
  if (dir !== DIR && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
};
prune(DIR);
console.log(`переадресаций: ${n} → ${DOMAIN}`);
