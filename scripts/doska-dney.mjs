// Доска дней (пп. 58, 59, 85 плана; Р627 — инструмент, не проверка): готовность и дата последнего изменения
// каждого дня — машиной из исходных файлов, без сборки. Служебный файл, не страница сайта, не шаг CI и не шаг build;
// дни не правит, полей в них не вписывает (статус и дата — только в таблице).
// Пять вопросов до изменения (Сергей, 28.09.2026):
// Что задевает — ничего: только читает src/content/days, src/content/dni-shablon, src/data/utverzhdeno,
//   src/data/full-pages, реестр роликов и озвучку в public/ (с диска, а нет на диске — из дерева git HEAD).
// Что нужно — видеть, какой день готов и когда менялся, не открывая страниц и не собирая сайт.
// Что будет без нужного — готовность считается руками (поле status) или только для января по сборке
//   (tools/tablica-gotovnosti.py), даты изменения дня нет нигде.
// Проверка до слияния — прогон на январе и 02-01, 02-02 двух музеев (в заявке), --proba на выдуманных днях.
// Откат — удалить этот файл и строку data/doska-dney/ из .gitignore.
//
// Части дня (есть — по исходникам, без чтения смысла):
//   факты    — ударов в блоке fakty (yaml) или фактов утверждённого (utverzhdeno) ≥ 10; у полной страницы — id="fakty";
//   игра     — блок igra или vizual (у «Русские не сдаются» вместо игры визуализация, Р436/Р437);
//   вопросы  — у quiz есть voprosy;
//   ролик    — video.klyuch записан в дне и файл выпуска public/video/registry/<klyuch>.json есть;
//              выпуск есть, а в дне не записан — «есть выпуск, не подключён» (не засчитывается);
//   гид      — audioguide.audioSrc записан и файл public/muzei/<музей>/<файл> есть;
//   картинки — разных картинок (обложка, figures, кадры утверждённого, images карточки) ≥ 6.
// Статус: gotov — все 6 частей; chastichno — есть факты; zagotovka — фактов нет.
// Дата изменения — последний коммит, задевший любой файл дня (git log, одним вызовом на всё дерево).
//
//   node scripts/doska-dney.mjs                                   все музеи, все дни → data/doska-dney/doska.{json,md}
//   node scripts/doska-dney.mjs --muzei izobreteniya,ne-sdayutsya --dni 01,02-01,02-02 --out /tmp/doska
//        (--dni: ММ — весь месяц, ММ-ДД — один день)
//   node scripts/doska-dney.mjs --proba                           пробы подсчёта на выдуманных днях
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const CHASTI = ['fakty', 'igra', 'voprosy', 'rolik', 'gid', 'kartinki'];
const NAZV = { fakty: 'факты', igra: 'игра / визуализация', voprosy: 'вопросы', rolik: 'ролик', gid: 'гид', kartinki: 'картинки' };
const MES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MIN_FAKTOV = 10, MIN_KARTINOK = 6;

const chitat = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };
const json = (f) => { const t = chitat(f); return t == null ? null : JSON.parse(t); };

// Подсчёт частей одного дня по уже прочитанным исходникам; est(путь) — есть ли файл в public/.
export function chastiDnya({ muzej, key, kartochka, shablon, utv, polnaya }, est) {
  const r = {};
  const udary = (shablon?.fakty || []).reduce((n, b) => n + (b?.udary?.length || 0), 0);
  const faktov = Math.max(udary, utv?.fakty?.length || 0);
  r.fakty = faktov >= MIN_FAKTOV ? { est: true, chto: `${faktov}` }
    : polnaya?.includes('id="fakty"') ? { est: true, chto: 'полная страница' }
      : { est: false, chto: faktov ? `${faktov} из ${MIN_FAKTOV}` : 'нет' };
  const igra = shablon?.igra || shablon?.vizual;
  r.igra = igra ? { est: true, chto: shablon.igra ? 'игра' : 'визуализация' }
    : polnaya && /id="(igra|game)"/.test(polnaya) ? { est: true, chto: 'полная страница' } : { est: false, chto: 'нет' };
  const voprosov = shablon?.quiz?.voprosy?.length || 0;
  r.voprosy = voprosov ? { est: true, chto: `${voprosov}` }
    : polnaya && /id="(quiz|viktorina)"/.test(polnaya) ? { est: true, chto: 'полная страница' } : { est: false, chto: 'нет' };
  const klyuch = shablon?.video?.klyuch || kartochka?.video;
  const [mm, dd] = key.split('-');
  const vypusk = est.vypuski(`${dd}${MES[+mm - 1]}-`);
  r.rolik = klyuch && est(`video/registry/${klyuch}.json`) ? { est: true, chto: klyuch }
    : klyuch ? { est: false, chto: `${klyuch}: файла выпуска нет` }
      : vypusk ? { est: false, chto: `есть выпуск ${vypusk}, не подключён` } : { est: false, chto: 'нет' };
  const audio = shablon?.audioguide?.audioSrc || kartochka?.audio?.src;
  const audioPut = audio && (audio.includes('/') ? audio.replace(/^\//, '') : `muzei/${muzej}/${audio}`);
  r.gid = audio && est(audioPut) ? { est: true, chto: audio.split('/').pop() }
    : audio ? { est: false, chto: `${audio}: файла нет` } : { est: false, chto: 'нет' };
  const kartinki = new Set([shablon?.oblozhka?.src, ...(shablon?.figures || []).map((f) => f?.src || f?.img?.src),
    ...(utv?.kadry || []).map((k) => (typeof k === 'string' ? k : k?.src || k?.fajl || k?.file)),
    ...(kartochka?.images || []).map((k) => (typeof k === 'string' ? k : k?.src))].filter(Boolean));
  r.kartinki = { est: kartinki.size >= MIN_KARTINOK, chto: `${kartinki.size}` };
  const vse = CHASTI.every((c) => r[c].est);
  return { chasti: r, status: vse ? 'gotov' : r.fakty.est ? 'chastichno' : 'zagotovka' };
}

// Последний коммит каждого файла под путями — один git log на всё (первое появление файла = последнее изменение).
function daty(puti) {
  const out = execFileSync('git', ['log', '--format=@%cs %h', '--name-only', '--', ...puti],
    { encoding: 'utf8', maxBuffer: 1 << 28 });
  const m = new Map();
  let tek = null;
  for (const s of out.split('\n')) {
    if (s.startsWith('@')) tek = s.slice(1).split(' ');
    else if (s && !m.has(s)) m.set(s, { data: tek[0], kommit: tek[1] });
  }
  return m;
}

function estVPublic() {
  // public/ может не быть в копии (sparse-checkout без public) — тогда смотрим дерево git HEAD.
  let derevo = null;
  const est = (p) => fs.existsSync(path.join('public', p)) || (derevo ??= new Set(execFileSync('git',
    ['ls-tree', '-r', '--name-only', 'HEAD', 'public/video/registry', 'public/muzei'],
    { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n'))).has(`public/${p}`);
  return est;
}

function sobrat({ muzei, dni }) {
  const est = estVPublic();
  const vseMuzei = fs.readdirSync('src/content/days').filter((m) => fs.statSync(`src/content/days/${m}`).isDirectory());
  const spisok = muzei ? muzei.filter((m) => vseMuzei.includes(m)) : vseMuzei;
  const nazvaniya = Object.fromEntries((json('src/data/museums.json')?.museums || json('src/data/museums.json') || [])
    .map((m) => [m.slug || m.id, m.title_ru]));
  const dataPo = daty(['src/content/days', 'src/content/dni-shablon', 'src/data/utverzhdeno', 'src/data/full-pages']);
  const podhodit = (key) => !dni || dni.some((d) => (d.length === 2 ? key.startsWith(`${d}-`) : key === d));
  const stroki = [], vGitPo = {};
  for (const muzej of spisok) {
    const fajly = (k) => [`src/content/days/${muzej}/${k}.json`, `src/content/dni-shablon/${muzej}/${k}.yaml`,
      `src/data/utverzhdeno/${muzej}/${k}.json`, `src/data/full-pages/${muzej}/${k}.html`];
    const klyuchi = new Set();
    for (const [dir, ext] of [['src/content/days', '.json'], ['src/content/dni-shablon', '.yaml'],
      ['src/data/utverzhdeno', '.json'], ['src/data/full-pages', '.html']]) {
      for (const f of (fs.existsSync(`${dir}/${muzej}`) ? fs.readdirSync(`${dir}/${muzej}`) : [])) {
        if (/^\d\d-\d\d/.test(f) && f.endsWith(ext)) klyuchi.add(f.slice(0, 5));
      }
    }
    const vypuski = (git) => (fs.existsSync(`public/video/registry/${git}`) ? fs.readdirSync(`public/video/registry/${git}`) : []);
    for (const key of [...klyuchi].filter(podhodit).sort()) {
      const [fk, fs1, fu, fp] = fajly(key);
      const t = chitat(fs1);
      const den = { muzej, key, kartochka: json(fk), shablon: t ? yaml.load(t) : null, utv: json(fu), polnaya: chitat(fp) };
      const papkaVyp = (den.shablon?.video?.klyuch || '').split('/')[0] || muzej.replace(/-/g, '');
      const estDnya = Object.assign((p) => est(p), {
        vypuski: (pref) => {
          const naDiske = vypuski(papkaVyp).find((f) => f.startsWith(pref));
          if (naDiske) return `${papkaVyp}/${naDiske.replace(/\.json$/, '')}`;
          const vGit = (vGitPo[papkaVyp] ??= execFileSync('git', ['ls-tree', '--name-only', 'HEAD', `public/video/registry/${papkaVyp}/`],
            { encoding: 'utf8' }).split('\n').map((f) => path.basename(f))).find((f) => f.startsWith(pref));
          return vGit ? `${papkaVyp}/${vGit.replace(/\.json$/, '')}` : null;
        },
      });
      const { chasti, status } = chastiDnya(den, estDnya);
      const izm = fajly(key).map((f) => dataPo.get(f)).filter(Boolean).sort((a, b) => b.data.localeCompare(a.data))[0];
      stroki.push({ muzej, nazvanie: nazvaniya[muzej] || muzej, den: key, status, ...Object.fromEntries(CHASTI.map((c) => [c, chasti[c]])),
        obnovleno: izm?.data || null, kommit: izm?.kommit || null, status_v_dne: den.shablon?.status || null });
    }
  }
  return stroki;
}

const znak = (c) => (c.est ? `✅ ${c.chto}` : `— ${c.chto}`);
function markdown(stroki) {
  const svodka = {};
  for (const s of stroki) {
    const k = `${s.nazvanie} | ${s.den.slice(0, 2)}`;
    (svodka[k] ??= { dney: 0, gotov: 0, chastichno: 0, zagotovka: 0 }).dney++;
    svodka[k][s.status]++;
  }
  return [`# Доска дней — машиной из файлов (scripts/doska-dney.mjs), ${new Date().toISOString().slice(0, 10)}`, '',
    'Служебный файл, не страница сайта. Статус: gotov — все 6 частей, chastichno — есть факты, zagotovka — фактов нет.', '',
    '## Сводка по месяцам', '', '| Музей | Месяц | Дней | gotov | chastichno | zagotovka |', '|---|---|---|---|---|---|',
    ...Object.entries(svodka).map(([k, v]) => `| ${k} | ${v.dney} | ${v.gotov} | ${v.chastichno} | ${v.zagotovka} |`), '',
    '## Дни', '', `| Музей | День | Статус | ${CHASTI.map((c) => NAZV[c]).join(' | ')} | Обновлён | Коммит |`,
    `|---|---|---|${CHASTI.map(() => '---').join('|')}|---|---|`,
    ...stroki.map((s) => `| ${s.nazvanie} | ${s.den} | ${s.status} | ${CHASTI.map((c) => znak(s[c])).join(' | ')} | ${s.obnovleno || '—'} | ${s.kommit || '—'} |`),
    ''].join('\n');
}

if (process.argv.includes('--proba')) {
  const est = Object.assign((p) => p === 'video/registry/x/01jan-a.json' || p === 'muzei/x/g.mp3', { vypuski: () => null });
  const polnyj = { muzej: 'x', key: '01-01', utv: { fakty: Array(15).fill('ф'), kadry: ['1', '2', '3'] },
    shablon: { igra: {}, quiz: { voprosy: [1] }, video: { klyuch: 'x/01jan-a' }, audioguide: { audioSrc: 'g.mp3' },
      oblozhka: { src: 'o' }, figures: [{ src: 'f1' }, { src: 'f2' }] } };
  const sluchai = [
    ['все части', polnyj, 'gotov'],
    ['гида нет на диске', { ...polnyj, shablon: { ...polnyj.shablon, audioguide: { audioSrc: 'net.mp3' } } }, 'chastichno'],
    ['9 фактов, без yaml', { muzej: 'x', key: '01-02', utv: { fakty: Array(9).fill('ф') } }, 'zagotovka'],
  ];
  let plohie = 0;
  for (const [imya, den, zhdu] of sluchai) {
    const { status } = chastiDnya(den, est);
    if (status !== zhdu) plohie++;
    console.log(`${status === zhdu ? 'да ' : 'НЕТ'} ${imya}: ${status} (ждали ${zhdu})`);
  }
  process.exit(plohie ? 1 : 0);
}

const spisokArg = (k) => arg(k) ? arg(k).split(',').map((s) => s.trim()).filter(Boolean) : null;
const stroki = sobrat({ muzei: spisokArg('--muzei'), dni: spisokArg('--dni') });
const out = arg('--out', 'data/doska-dney');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'doska.json'), JSON.stringify({ sobrano: new Date().toISOString(), dney: stroki.length, stroki }, null, 1) + '\n');
fs.writeFileSync(path.join(out, 'doska.md'), markdown(stroki));
const po = (st) => stroki.filter((s) => s.status === st).length;
console.log(`доска: ${stroki.length} дней — gotov ${po('gotov')}, chastichno ${po('chastichno')}, zagotovka ${po('zagotovka')} → ${out}/doska.{json,md}`);
