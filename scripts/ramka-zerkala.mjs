// Зеркало GitHub Pages — не показывать внутри чужой страницы (п.501, Р745). Образец — OWASP Clickjacking
// Defense Cheat Sheet, «legacy frame-breaking»: на Pages нет заголовков (frame-ancestors/X-Frame-Options
// ставит только nginx своего сервера), поэтому — скрипт. Сборка у Pages и msk общая (артефакт github-pages),
// скрипт срабатывает только на *.github.io: на своём сервере он ничего не делает (там frame-ancestors nginx),
// Вебвизор Метрики на russian-civilization.ru не задет. Инлайн, потому что на копии Pages base '/' и файлы
// по /… не грузятся; хеш этого скрипта — в CSP_STROGIY (src/lib/csp.mjs). Откат — убрать вызов из deploy.yml.
// Запуск: node scripts/ramka-zerkala.mjs dist   (--proba — только проверка на образце, без dist)
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { RAMKA_JS } from '../src/lib/csp.mjs';

export const vstavit = (html) =>
  html.includes(RAMKA_JS) ? html : html.replace(/<head([^>]*)>/i, (h) => `${h}<script>${RAMKA_JS}</script>`);

function* html(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* html(p);
    else if (n.endsWith('.html')) yield p;
  }
}

const arg = process.argv[2];
if (arg === '--proba') {
  const v = vstavit('<html><head lang="ru"><title>x</title></head></html>');
  if (!v.includes(`<head lang="ru"><script>${RAMKA_JS}</script>`) || vstavit(v) !== v) { console.error('ramka-zerkala: проба не прошла'); process.exit(1); }
  console.log('ramka-zerkala: проба ок');
} else if (arg) {
  let n = 0;
  for (const p of html(arg)) {
    const s = readFileSync(p, 'utf8'), v = vstavit(s);
    if (v !== s) { writeFileSync(p, v); n++; }
  }
  console.log(`ramka-zerkala: скрипт рамки в ${n} страниц`);
} else { console.error('ramka-zerkala: укажи папку сборки или --proba'); process.exit(1); }
