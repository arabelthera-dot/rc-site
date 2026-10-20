#!/usr/bin/env node
// Личные почтовые ящики (gmail.com, yandex.ru, mail.ru и родня) в отданной сборке — красная.
// Публично — только почта проекта (src/data/kanaly.json). Запуск: node scripts/pochta-v-sborke.mjs dist
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || 'dist';
const LICHNAYA = /[A-Za-z0-9._%+-]+@(?:gmail\.com|googlemail\.com|yandex\.(?:ru|com)|ya\.ru|mail\.ru|bk\.ru|inbox\.ru|list\.ru|rambler\.ru)\b/gi;
const EXT = /\.(html|js|mjs|css|json|xml|txt|webmanifest)$/i;
const brak = [];
const obhod = (d) => {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) obhod(p);
    else if (EXT.test(f.name)) for (const m of fs.readFileSync(p, 'utf8').matchAll(LICHNAYA)) brak.push(`${path.relative(root, p)}: ${m[0]}`);
  }
};
if (!fs.existsSync(root)) { console.error(`нет папки ${root}`); process.exit(2); }
obhod(root);
if (brak.length) {
  console.error(`брак: личная почта в сборке — ${brak.length}\n` + [...new Set(brak)].slice(0, 30).join('\n'));
  process.exit(1);
}
console.log('личной почты в сборке нет');
