// Версия в адресе своих скриптов и стилей (Р204, 23.10.2026): public/assets/*.js|*.css копируются в dist как есть,
// и ссылка на них не меняется от правки к правке — телефон держит старый файл из кэша (Р203: игра 29 января
// не проходилась на телефоне со старым скриптом). После сборки в каждом HTML ссылка src/href на свой .js/.css
// получает ?v=<первые 10 знаков sha1 содержимого файла в dist>: файл поменялся — адрес новый, кэш не мешает.
// Ручная ?v=… в странице заменяется настоящей (руками её забывают обновлять). Имена с хэшем (rc-<md5>.css,
// rc-metrika-<md5>.js) и чужие адреса не трогаются. Идёт ПОСЛЕ minify — хэш от того, что уйдёт посетителю.
// Выключатель: RC_BEZ_VERSIY=1.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SSYLKA = /(<(?:script|link)\b[^>]*?\s(?:src|href)=)(["'])([^"'?#]+\.(?:js|css))(?:\?v=[^"'#]*)?(\2)/gi;
const S_HESHEM = /-[0-9a-f]{8,}\.(?:js|css)$/;

export default function versii() {
  return {
    name: 'rc-versii',
    hooks: {
      'astro:build:done': ({ dir }) => {
        if (process.env.RC_BEZ_VERSIY === '1') { console.log('rc-versii: выключено (RC_BEZ_VERSIY=1)'); return; }
        const root = fileURLToPath(dir);
        const hesh = new Map(); // путь файла в dist → версия (null — файла нет)
        const versiya = (fp) => {
          if (!hesh.has(fp)) {
            hesh.set(fp, fs.existsSync(fp) && fs.statSync(fp).isFile()
              ? crypto.createHash('sha1').update(fs.readFileSync(fp)).digest('hex').slice(0, 10) : null);
          }
          return hesh.get(fp);
        };
        let stranic = 0, ssylok = 0;
        const walk = (d) => {
          for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const fp = path.join(d, e.name);
            if (e.isDirectory()) { walk(fp); continue; }
            if (!e.name.endsWith('.html')) continue;
            const html = fs.readFileSync(fp, 'utf8');
            let n = 0;
            const out = html.replace(SSYLKA, (m, a, q, url, z) => {
              if (/^(?:[a-z]+:)?\/\//i.test(url) || S_HESHEM.test(url)) return m;
              const file = url.startsWith('/') ? path.join(root, url) : path.resolve(d, url);
              if (!file.startsWith(root)) return m;
              const v = versiya(file);
              if (!v) return m;
              n++;
              return `${a}${q}${url}?v=${v}${z}`;
            });
            if (n && out !== html) { fs.writeFileSync(fp, out); stranic++; ssylok += n; }
          }
        };
        walk(root);
        console.log(`rc-versii: версия в адресе у ${ssylok} ссылок на свои .js/.css на ${stranic} страницах (файлов ${[...hesh.values()].filter(Boolean).length})`);
      },
    },
  };
}
