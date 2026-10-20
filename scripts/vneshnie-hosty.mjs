// Внешние хосты сборки (Е4, решение Сергея Р38, 20.10.2026): браузер посетителя не должен ходить за рубеж.
// По dist/ собирается всё, что браузер грузит сам, без нажатия: src/srcset/poster/data-src (img, script, iframe,
// video, audio, source), <link> стилей/шрифтов/preload/preconnect, url() и @import в CSS, import/fetch/.src в JS.
// Обычные ссылки <a href> (источники, «смотреть на …») не грузятся сами и сюда не входят.
// Разрешены свой домен, Яндекс (Метрика), VK Видео и Rutube с их раздачей; любой другой хост — список и код 1.
// Запуск: node scripts/vneshnie-hosty.mjs [--dist dist] [--json отчёт.json]
import fs from 'node:fs';
import path from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DIST = arg('--dist', 'dist');
const JSON_OUT = arg('--json', '');

// Хост разрешён, если совпадает или кончается на «.<имя>». Раздача VK Видео/Rutube — хосты, с которых их
// плеер грузит ролик и картинки; без них вставка не играет.
const RAZRESHENO = [
  'russian-civilization.ru',
  'yandex.ru', 'yandex.com', 'yandex.net', 'yastatic.net', // Метрика: вне России счётчик шлёт и на mc.yandex.com
  'vk.com', 'vk.ru', 'vkvideo.ru', 'userapi.com', 'vkuser.net', 'mycdn.me', 'okcdn.ru',
  'rutube.ru', 'rtbcdn.ru',
];
const razresheno = (h) => RAZRESHENO.some((r) => h === r || h.endsWith('.' + r));

// <link rel>, которые браузер загружает или к которым соединяется сам (canonical/alternate — нет).
const LINK_REL = /\b(?:stylesheet|preload|modulepreload|prefetch|preconnect|dns-prefetch|icon|apple-touch-icon|manifest|mask-icon)\b/i;
const ATTR = /\s(src|srcset|data-src|data-srcset|data-poster|poster|data|background|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const CSS_URL = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)|@import\s+(?:"([^"]*)"|'([^']*)')/gi;
const JS_CALL = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimportScripts\s*\(\s*|\bfetch\s*\(\s*|\bsendBeacon\s*\(\s*|\bnew\s+(?:Worker|SharedWorker|EventSource|WebSocket)\s*\(\s*|\.src\s*=\s*|\bsrc\s*:\s*)(["'`])((?:https?:)?\/\/[^"'`\s]+)\1/gi;
// Разметка, собранная строкой внутри JS (innerHTML = '<img src="https://…">'), — те же атрибуты, кавычки экранированы.
const JS_ATTR = /\s(?:src|srcset|data-src|poster)\s*=\s*\\?["']((?:https?:)?\/\/[^"'\\\s]+)/gi;

const hosts = new Map(); // хост → { stranicy: Set, tipy: Set, primer }
function zapis(u, file, tip) {
  for (const part of String(u).split(',')) {
    const url = part.trim().split(/\s+/)[0];
    const m = /^(?:https?:)?\/\/([^/?#:]+)/i.exec(url);
    if (!m) continue;
    const h = m[1].toLowerCase();
    if (!hosts.has(h)) hosts.set(h, { stranicy: new Set(), tipy: new Set(), primer: `${file} → ${url}` });
    const z = hosts.get(h);
    z.stranicy.add(file);
    z.tipy.add(tip);
  }
}

function css(text, file) {
  for (const m of text.matchAll(CSS_URL)) zapis(m.slice(1).find(Boolean), file, m[0].startsWith('@') ? 'css @import' : 'css url()');
}
function js(text, file) {
  for (const m of text.matchAll(JS_CALL)) zapis(m[2], file, 'js ' + /[a-zA-Z.]+/.exec(m[0].replace(/\bnew\s+/, ''))[0]);
  for (const m of text.matchAll(JS_ATTR)) zapis(m[1], file, 'js разметка');
}
function html(text, file) {
  for (const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) css(m[1], file);
  for (const m of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src = /\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(m[1]);
    if (src) zapis(src[1] ?? src[2] ?? src[3], file, 'script src');
    if (/type\s*=\s*["']?application\/(?:ld\+)?json/i.test(m[1])) continue;
    js(m[2], file);
  }
  const bezKoda = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  for (const t of bezKoda.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*>/gi)) {
    const tag = t[1].toLowerCase();
    const s = t[0];
    if (tag === 'a') continue;
    for (const a of s.matchAll(ATTR)) {
      const name = a[1].toLowerCase();
      if (name === 'data' && tag !== 'object') continue;
      if (name === 'xlink:href' && !['image', 'use'].includes(tag)) continue;
      zapis(a[2] ?? a[3], file, `${tag} ${name}`);
    }
    if (tag === 'link' || tag === 'image' || tag === 'use') {
      const href = /\shref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(s);
      const rel = /\srel\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/i.exec(s);
      const r = rel ? (rel[1] ?? rel[2] ?? rel[3]) : '';
      if (href && (tag !== 'link' || LINK_REL.test(r))) zapis(href[1] ?? href[2], file, tag === 'link' ? `link ${r.toLowerCase()}` : `${tag} href`);
    }
    const style = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(s);
    if (style) css((style[1] ?? style[2]).replace(/&quot;/g, '"'), file);
  }
}

function* faily(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* faily(p);
    else if (/\.(?:html?|css|m?js|svg|webmanifest)$/i.test(e.name)) yield p;
  }
}

if (!fs.existsSync(DIST)) { console.error(`vneshnie-hosty: нет папки ${DIST} — сначала npm run build`); process.exit(2); }
let n = 0;
for (const p of faily(DIST)) {
  const file = '/' + path.relative(DIST, p).split(path.sep).join('/');
  const text = fs.readFileSync(p, 'utf8');
  n++;
  if (/\.css$/i.test(p)) css(text, file);
  else if (/\.m?js$/i.test(p)) js(text, file);
  else html(text, file);
}

const spisok = [...hosts].map(([h, z]) => ({ host: h, razreshen: razresheno(h), stranic: z.stranicy.size, tipy: [...z.tipy].sort(), primer: z.primer }))
  .sort((a, b) => a.razreshen - b.razreshen || b.stranic - a.stranic || a.host.localeCompare(b.host));
const chuzhie = spisok.filter((x) => !x.razreshen);

const stroki = ['| хост | файлов | что грузится | |', '|---|---|---|---|',
  ...spisok.map((x) => `| ${x.host} | ${x.stranic} | ${x.tipy.join(', ')} | ${x.razreshen ? 'разрешён' : '**чужой**'} |`)];
console.log(`vneshnie-hosty: файлов ${n}, внешних хостов ${spisok.length}, чужих ${chuzhie.length}`);
console.log(stroki.join('\n'));
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(spisok, null, 1));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n### Внешние хосты (Е4)\n\n${stroki.join('\n')}\n`);
if (chuzhie.length) {
  console.log('\nЧужие хосты — перенести файл в public/ или заменить на VK Видео/Rutube (Р38):');
  for (const x of chuzhie) console.log(`  ${x.host}: ${x.primer}`);
  process.exit(1);
}
