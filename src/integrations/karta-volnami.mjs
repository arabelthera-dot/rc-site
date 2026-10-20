// Карта сайта волнами (Е6, Р47; «да» Сергея 20.10.2026) — вместо @astrojs/sitemap. Поисковик сначала получает
// флагманские страницы, потом остальное, языки — по одному. Открытые волны — строка otkryty в src/data/karta-sayta.json.
//   sitemap-index.xml          — индекс только открытых волн (его называет robots.txt; /sitemap.xml — копия);
//   sitemap-volna-1.xml        — главная, витрина музеев /muzei/, «О проекте», «Как сделан музей», музеи с готовыми днями, лучшие дни;
//   sitemap-volna-2.xml        — остальные страницы для поиска;
//   sitemap-<код языка>.xml    — страницы /<код>/…; в индексе, только если код в otkryty и ready:true в yazyki.json.
// Файлы всех волн пишутся всегда (scripts/glazami.mjs меряет по ним весь сайт), в индекс идут только открытые.
// Вне карт: страница с <meta name="robots" content="noindex"> в готовом HTML («День готовится», /doska/, /karta/, /proverka/,
// /poisk/ без поиска, пробы языков) и служебные адреса SLUZHEBNYE. Стоит после fullPages — смотрит итоговый HTML.
// lastmod — правда, а не дата сборки: у дня — последняя правка карточки по журналу исправлений (Е5, src/lib/redakciya.mjs),
// у музея, его календаря и таблицы — самая свежая правка его дней, у главной — всех дней, у прочих — git log шаблона.
// Даты нет — lastmod не пишется (так разрешает протокол sitemaps.org).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { zhurnal } from '../lib/redakciya.mjs';
import { kadryXX } from '../lib/zakon.mjs';
import { cardFrames, fullFrames } from '../lib/podpisi.mjs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const DAYS = 'src/content/days';
const SLUZHEBNYE = /^\/(?:doska|karta|poisk|proverka)\//;
const FLAGMANY = new Set(['/', '/muzei/', '/o-proekte/', '/kak-sdelan-muzey/']);
const LIMIT = 50000; // протокол: не больше 50 000 адресов в файле
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pozzhe = (a, b) => (!a || (b && new Date(b) > new Date(a)) ? b : a);

/** Лучшие дни (волна 1): Set «музей/ключ». Критерий — в шапке файла и в src/data/karta-sayta.json (_volny). */
export function luchshieDni(root = '.') {
  const waivers = read(path.join(root, 'src/data/passport-waivers.json'));
  const bezOsnovaniya = new Set(kadryXX(root).bez.map((k) => `${k.museum}/${k.key}`));
  const sKadrom = new Set([...cardFrames(root), ...fullFrames(root).filter((f) => ['ok', 'near', 'rights'].includes(f.state))]
    .map((f) => `${f.museum}/${f.key}`));
  const out = new Set();
  for (const m of fs.readdirSync(path.join(root, DAYS)))
    for (const f of fs.readdirSync(path.join(root, DAYS, m)).filter((x) => x.endsWith('.json'))) {
      const d = read(path.join(root, DAYS, m, f));
      const id = `${m}/${d.key}`;
      if ((d.legacy_page || d.body?.length) && d.hook && !waivers[m] && !waivers[id] && sKadrom.has(id) && !bezOsnovaniya.has(id)) out.add(id);
    }
  return out;
}

/** Дата последнего коммита файла (ISO) или undefined. */
function gitDate(file) {
  if (!fs.existsSync(file)) return undefined;
  try { return execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { encoding: 'utf8' }).trim() || undefined; } catch { return undefined; }
}

function urlset(items) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + items.map((u) => `<url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')
    + '\n</urlset>\n';
}

export default function kartaVolnami() {
  let site;
  return {
    name: 'rc-karta-volnami',
    hooks: {
      'astro:config:done': ({ config }) => { site = new URL(config.base, config.site); },
      'astro:build:done': ({ dir, pages, logger }) => {
        const out = fileURLToPath(dir);
        const nastroyki = read('src/data/karta-sayta.json');
        const yazyki = read('src/data/yazyki.json').yazyki.filter((y) => y.code !== 'ru');
        const otkryty = new Set(nastroyki.otkryty);
        // Превью-сборка закрыта целиком (robots.txt: Disallow) — noindex там у всех, по нему не отбираем.
        const vseNoindex = process.env.PUBLIC_NOINDEX === '1';
        const luchshie = luchshieDni();

        // Даты дней по журналу; музей и главная — самая свежая правка их дней.
        const denDate = new Map();
        const muzeyDate = new Map();
        let vsehDate;
        const sGotovymi = new Set();
        for (const m of fs.readdirSync(DAYS))
          for (const f of fs.readdirSync(path.join(DAYS, m)).filter((x) => x.endsWith('.json'))) {
            const d = read(path.join(DAYS, m, f));
            if (d.hook || d.gist) sGotovymi.add(m);
            const iso = zhurnal(m, d.key)?.modified;
            if (!iso) continue;
            denDate.set(`${m}/${d.key}`, iso);
            muzeyDate.set(m, pozzhe(muzeyDate.get(m), iso));
            vsehDate = pozzhe(vsehDate, iso);
          }

        const volny = new Map([['volna-1', []], ['volna-2', []], ...yazyki.map((y) => [y.code, []])]);
        let vne = 0;
        for (const { pathname } of pages) {
          const p = `/${pathname}`.replace(/\/?$/, '/').replace(/^\/+/, '/');
          const html = path.join(out, p, 'index.html');
          if (!fs.existsSync(html)) continue; // robots.txt, rss.xml, json — не страницы
          if (SLUZHEBNYE.test(p) || (!vseNoindex && /<meta name=["']?robots["']? content=["']?noindex/i.test(fs.readFileSync(html, 'utf8')))) { vne++; continue; }
          const den = /^\/muzei\/([^/]+)\/den\/(\d\d-\d\d)\/$/.exec(p);
          const muzey = /^\/muzei\/([^/]+)\/(?:calendar\/|tablica\/)?$/.exec(p);
          const yazyk = yazyki.find((y) => p.startsWith(`/${y.code}/`));
          const lastmod = den ? denDate.get(`${den[1]}/${den[2]}`)
            : muzey ? muzeyDate.get(muzey[1])
            : p === '/' ? vsehDate
            : gitDate(`src/pages${p.slice(0, -1)}.astro`) || gitDate(`src/pages${p}index.astro`);
          const volna = yazyk ? yazyk.code
            : FLAGMANY.has(p) || (den && luchshie.has(`${den[1]}/${den[2]}`)) || (muzey && p === `/muzei/${muzey[1]}/` && sGotovymi.has(muzey[1])) ? 'volna-1'
            : 'volna-2';
          volny.get(volna).push({ loc: new URL(p.slice(1), site).href, lastmod });
        }

        const index = [];
        const otchet = [];
        for (const [imya, items] of volny) {
          const yazyk = yazyki.find((y) => y.code === imya);
          if (yazyk && !items.length) continue; // языка ещё нет — нет и файла
          if (items.length > LIMIT) throw new Error(`карта сайта: в ${imya} ${items.length} адресов, больше ${LIMIT} — делить волну`);
          items.sort((a, b) => (a.loc < b.loc ? -1 : 1));
          const fayl = `sitemap-${imya}.xml`;
          fs.writeFileSync(path.join(out, fayl), urlset(items));
          const otkryta = otkryty.has(imya) && (!yazyk || yazyk.ready);
          if (otkryta) index.push({ loc: new URL(fayl, site).href, lastmod: items.reduce((a, u) => pozzhe(a, u.lastmod), undefined) });
          otchet.push(`${imya} ${items.length}${otkryta ? '' : ' (закрыта)'}`);
        }
        const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          + index.map((s) => `<sitemap><loc>${esc(s.loc)}</loc>${s.lastmod ? `<lastmod>${s.lastmod}</lastmod>` : ''}</sitemap>`).join('\n')
          + '\n</sitemapindex>\n';
        fs.writeFileSync(path.join(out, 'sitemap-index.xml'), xml);
        // /sitemap.xml — привычный адрес (поисковики и сторожа идут сюда первым; обход 20.10, план сайта А5).
        fs.writeFileSync(path.join(out, 'sitemap.xml'), xml);
        logger.info(`карта сайта волнами: ${otchet.join(', ')}; вне карт ${vne} (noindex и служебные); лучших дней ${luchshie.size}`);
      },
    },
  };
}
