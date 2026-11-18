// Зеркало github.io/rc-site/ для заграницы (Р815, 18.11.2026, Сергей «делай всё сам»). russian-civilization.ru закрыт
// из-за границы гео-фильтром Hostkey; сборка — под корень домена (base '/'), а Pages этого репо живёт в подпапке
// /rc-site/, поэтому оформление и картинки там 404 (Р814). Скрипт переписывает уже готовую сборку под подпапку: путь
// меняется, только если начинается с верхнего имени самой сборки (/_astro, /muzei, /assets …) и стоит после кавычки,
// &quot;, url(, =, запятой или пробела; плюс data-base="/" и ссылки на корень href="/". Сборку для .ru и сервера не
// трогает — вызывается только в задаче deploy на копии артефакта. Проба 18.11 на сборке 44300113438: 5873 файла,
// 10 страниц в браузере — 0 незагруженных файлов, 0 ссылок мимо /rc-site/. Откат — убрать шаги zerkalo в deploy.yml.
// Запуск: node scripts/zerkalo-podpapka.mjs <папка> /rc-site
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [kor, bazaArg] = process.argv.slice(2);
if (!kor || !bazaArg) { console.error('запуск: zerkalo-podpapka.mjs <папка> /rc-site'); process.exit(2); }
const baza = bazaArg.replace(/\/+$/, '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const verh = readdirSync(kor).sort((a, b) => b.length - a.length).map(esc);
const put = `/(?:${verh.join('|')})(?=[/"'\`?#&\\s),;]|$)`;
const rx = new RegExp(`(["'\`(=,]|&quot;|&#39;|^|\\s)(${put})`, 'gm');
const RASH = /\.(html|css|js|mjs|json|xml|webmanifest|svg|txt)$/;

function* faily(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* faily(p);
    else if (RASH.test(n)) yield p;
  }
}

let nf = 0, nz = 0;
for (const p of faily(kor)) {
  const t = readFileSync(p, 'utf8');
  if (t.includes('�')) continue;
  let k = 0;
  const t2 = t
    .replace(rx, (_, pre, p2) => { k++; return pre + baza + p2; })
    .replace(/data-base="\/"/g, () => { k++; return `data-base="${baza}/"`; })
    .replace(/(href|action)=(["'])\/\2/g, (_, a, q) => { k++; return `${a}=${q}${baza}/${q}`; });
  if (t2 !== t) { writeFileSync(p, t2); nf++; nz += k; }
}
console.log(`зеркало ${baza}/: файлов ${nf}, замен ${nz}, верхних имён ${verh.length}`);
if (nf === 0) { console.error('ничего не переписано — сборка не та'); process.exit(1); }
