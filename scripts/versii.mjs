// Версия в адресе своих скриптов и стилей (задача Джарвиса 24.10.2026, #449; Р228): public/assets/*.js|*.css уходят
// посетителю с Cache-Control max-age=604800, а ссылка на них не меняется от правки к правке — телефон до 7 дней держит
// старый движок. Шаг ПОСЛЕ astro build (npm run build): в каждом HTML dist, включая полные страницы (full-pages),
// ссылка src/href на свой .js/.css получает ?v=<первые 10 знаков sha1 содержимого файла в dist>: файл поменялся —
// адрес новый, кэш не мешает. Хэш — от того, что уйдёт посетителю (после minify). Ручная ?v=… заменяется настоящей.
// Имена с хэшем (rc-<md5>.css, _astro/*-<хэш>.js) и чужие адреса не трогаются. Один шаг на все страницы — заплатки
// версий в отдельных страницах не нужны.
// Запуск: node scripts/versii.mjs [dist]            — проставить версии, строка «страниц с версией N из M»;
//         node scripts/versii.mjs [dist] --proverka — ничего не менять, выход 1, если осталась ссылка без версии
//                                                     или с версией не от этого файла.
// Выключатель: RC_BEZ_VERSIY=1 (сборка без версий, как до шага). Откат — revert заявки.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const PROVERKA = args.includes('--proverka');
const DIST = path.resolve(args.find((a) => !a.startsWith('--')) || 'dist');

const SSYLKA = /(<(?:script|link)\b[^>]*?\s(?:src|href)=)(["'])([^"'?#]+\.(?:js|css))(\?v=[^"'#]*)?(\2)/gi;
const S_HESHEM = /(?:^|\/)_astro\/|-[0-9a-f]{8,}\.(?:js|css)$/;
const CHUZHOY = /^(?:[a-z]+:)?\/\//i;

if (process.env.RC_BEZ_VERSIY === '1') { console.log('versii: выключено (RC_BEZ_VERSIY=1)'); process.exit(0); }
if (!fs.existsSync(DIST)) { console.error(`versii: нет папки ${DIST}`); process.exit(1); }

const hesh = new Map(); // путь файла в dist → версия (null — файла нет)
const versiya = (fp) => {
  if (!hesh.has(fp)) {
    hesh.set(fp, fs.existsSync(fp) && fs.statSync(fp).isFile()
      ? crypto.createHash('sha1').update(fs.readFileSync(fp)).digest('hex').slice(0, 10) : null);
  }
  return hesh.get(fp);
};

let vsego = 0, sVersiey = 0, ssylok = 0;
const plohie = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const fp = path.join(d, e.name);
    if (e.isDirectory()) { walk(fp); continue; }
    if (!e.name.endsWith('.html')) continue;
    const html = fs.readFileSync(fp, 'utf8');
    let svoih = 0, n = 0;
    const out = html.replace(SSYLKA, (m, a, q, url, staraya, z) => {
      if (CHUZHOY.test(url) || S_HESHEM.test(url)) return m;
      const file = url.startsWith('/') ? path.join(DIST, url) : path.resolve(d, url);
      if (!file.startsWith(DIST + path.sep)) return m;
      const v = versiya(file);
      if (!v) return m;
      svoih++;
      if (PROVERKA) {
        if (staraya === `?v=${v}`) n++;
        else if (plohie.length < 20) plohie.push(`${path.relative(DIST, fp)}: ${url}${staraya || ''} (надо ?v=${v})`);
        return m;
      }
      n++;
      return `${a}${q}${url}?v=${v}${z}`;
    });
    if (!svoih) continue;
    vsego++;
    if (n === svoih) sVersiey++;
    ssylok += n;
    if (!PROVERKA && out !== html) fs.writeFileSync(fp, out);
  }
};
walk(DIST);

const faylov = [...hesh.values()].filter(Boolean).length;
console.log(`versii: страниц с версией в ссылке ${sVersiey} из ${vsego} (ссылок ${ssylok}, файлов .js/.css ${faylov})`);
if (PROVERKA && sVersiey !== vsego) {
  console.error(`versii: ${vsego - sVersiey} страниц со ссылкой без верной версии, первые:\n  ${plohie.join('\n  ')}`);
  process.exit(1);
}
