// Сверка текста «старый сайт — новый сайт» (план переезда, шаг 4; 19.10.2026).
// Для каждого дня с legacy_page (src/content/days/<музей>/<ключ>.json) сравниваются четыре поля:
//   дата     — «9 января» из ключа ММ-ДД: есть в старой странице → должна быть и в новой;
//   название — <h1> и <title> старой страницы = <h1> и <title> новой (dist/muzei/<музей>/den/<ключ>/index.html);
//              название карточки входит в <h1> или <title> старой страницы;
//   хук      — первое предложение хука карточки есть в тексте старой страницы и в тексте новой;
//   источник — каждый домен из source карточки (или вся строка, если доменов нет) есть в старой и в новой.
// Текст сравнивается после чистки: без тегов, скриптов, стилей; ё=е, кавычки, тире и пробелы приведены.
// Любое расхождение — красное: код 1. Старый сайт — клон arabelthera-dot/rc-museum-preview (main).
// Запуск: node scripts/sverka-teksta.mjs [--dist dist] [--legacy путь] [--polya data,nazvanie,hook,istochnik]
//         (LEGACY — путь к старому сайту, по умолчанию ~/rc-museum-preview; --vse — печатать все расхождения)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DIST = path.resolve(arg('--dist', 'dist'));
const LEGACY = path.resolve(arg('--legacy', process.env.LEGACY || path.join(os.homedir(), 'rc-museum-preview')));
const POLYA = new Set(arg('--polya', 'data,nazvanie,hook,istochnik').split(','));
const VSE = process.argv.includes('--vse');
const DAYS = 'src/content/days';
const MES = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

if (!fs.existsSync(path.join(LEGACY, 'muzei'))) { console.error(`sverka-teksta: нет старого сайта в ${LEGACY}`); process.exit(2); }
if (!fs.existsSync(DIST)) { console.error(`sverka-teksta: нет сборки ${DIST}`); process.exit(2); }

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…', shy: '' };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => e[0] === '#'
  ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
  : (ENT[e.toLowerCase()] ?? m));
const norm = (s) => decode(s).toLowerCase().replace(/ё/g, 'е').replace(/[«»„“”"'’`]/g, '')
  .replace(/[‑–—−-]/g, '-').replace(/­/g, '').replace(/\s+/g, ' ').trim();
const text = (html) => norm(html.replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' '));
const tag = (html, t) => { const m = html.match(new RegExp(`<${t}\\b[^>]*>([\\s\\S]*?)<\\/${t}>`, 'i')); return m ? text(m[1]) : ''; };
const firstSentence = (s) => { const m = s.match(/^[\s\S]*?[.!?…](?=\s|$)/); return (m ? m[0] : s).trim(); };
const sourceParts = (s) => {
  const d = (s || '').match(/[a-zа-я0-9-]+(?:\.[a-zа-я0-9-]+)*\.(?:ru|рф|su|com|org|net|info|edu|gov|int|io|de|fr|uk)\b/gi);
  return d && d.length ? [...new Set(d.map((x) => x.toLowerCase()))] : [norm((s || '').replace(/^\s*источники?\s*:\s*/i, ''))].filter(Boolean);
};

let dney = 0, krasnyh = 0;
const brak = [], poPolyu = { data: 0, nazvanie: 0, hook: 0, istochnik: 0, net_stranicy: 0, net_staroy: 0 };
for (const museum of fs.readdirSync(DAYS).sort()) {
  for (const f of fs.readdirSync(path.join(DAYS, museum)).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(DAYS, museum, f), 'utf8'));
    if (!d.legacy_page) continue;
    const key = f.replace(/\.json$/, ''), id = `${museum}/${key}`;
    const oldF = path.join(LEGACY, d.legacy_page), newF = path.join(DIST, 'muzei', museum, 'den', key, 'index.html');
    dney++;
    const errs = [];
    if (!fs.existsSync(oldF)) errs.push(['net_staroy', `нет старой страницы ${d.legacy_page}`]);
    if (!fs.existsSync(newF)) errs.push(['net_stranicy', `нет новой страницы muzei/${museum}/den/${key}/`]);
    if (!errs.length) {
      const oh = fs.readFileSync(oldF, 'utf8'), nh = fs.readFileSync(newF, 'utf8');
      const ot = text(oh), nt = text(nh);
      if (POLYA.has('data')) {
        const [mm, dd] = key.split('-').map(Number);
        const data = mm && dd ? `${dd} ${MES[mm - 1]}` : '';
        if (data && ot.includes(data) && !nt.includes(data)) errs.push(['data', `«${data}» есть на старой, нет на новой`]);
      }
      if (POLYA.has('nazvanie')) {
        for (const t of ['h1', 'title']) {
          const a = tag(oh, t), b = tag(nh, t);
          if (a !== b) errs.push(['nazvanie', `<${t}> старый «${a}» ≠ новый «${b}»`]);
        }
        const nz = norm(d.title || '');
        if (nz && !tag(oh, 'h1').includes(nz) && !tag(oh, 'title').includes(nz))
          errs.push(['nazvanie', `название карточки «${d.title}» не входит в <h1>/<title> старой («${tag(oh, 'h1')}»)`]);
      }
      if (POLYA.has('hook') && d.hook) {
        const h = norm(firstSentence(d.hook));
        if (!ot.includes(h)) errs.push(['hook', `хук карточки «${firstSentence(d.hook)}» не найден на старой`]);
        if (!nt.includes(h) && ot.includes(h)) errs.push(['hook', `хук есть на старой, нет на новой`]);
      }
      if (POLYA.has('istochnik') && d.source) {
        for (const p of sourceParts(d.source)) {
          if (!ot.includes(p)) errs.push(['istochnik', `источник «${p}» не найден на старой`]);
          else if (!nt.includes(p)) errs.push(['istochnik', `источник «${p}» есть на старой, нет на новой`]);
        }
      }
    }
    if (errs.length) {
      krasnyh++;
      for (const k of new Set(errs.map((e) => e[0]))) poPolyu[k]++;
      brak.push(`✗ ${id} (${d.legacy_page})\n  ${errs.map((e) => e[1]).join('\n  ')}`);
    }
  }
}
for (const b of VSE ? brak : brak.slice(0, 30)) console.log(b);
if (!VSE && brak.length > 30) console.log(`… ещё ${brak.length - 30} (полный список — --vse)`);
console.log(`\nsverka-teksta: дней с legacy_page ${dney}, сверено чисто ${dney - krasnyh}, с расхождениями ${krasnyh}`);
console.log(`  по полям (дней): дата ${poPolyu.data}, название ${poPolyu.nazvanie}, хук ${poPolyu.hook}, источник ${poPolyu.istochnik}, нет новой страницы ${poPolyu.net_stranicy}, legacy_page нет на main старого сайта ${poPolyu.net_staroy}`);
process.exit(krasnyh ? 1 : 0);
