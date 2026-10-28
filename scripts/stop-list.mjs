// Стоп-лист иноагентов и запрещённых организаций (Р316, Р318 — Сергей 28.10.2026: «на агентов никого не упоминаем
// не будем ничего писать про них просто их нет в нашем музее»). Список — data/stop-list-inoagenty.txt: реестр иностранных
// агентов, перечни нежелательных и экстремистских организаций Минюста (нежелательные — по решениям Генпрокуратуры),
// короткие названия запрещённых организаций и жёсткий стоп Р316 (Каспаров, Meta/Facebook/Instagram).
// Пометка «иноагент» или «запрещена» упоминание НЕ разрешает: найдено — заявка красная с файлом и строкой.
// Однофамилец (не лицо из реестра, сверено человеком) — строкой в data/stop-list-lozhnye.txt; жёсткий стоп Р316 так не снять.
//
//   node scripts/stop-list.mjs --sobrat <папка>  — собрать стоп-лист из снимков <папка>/data/reestry/*.json
//                                                  (выгрузка: RF_PROXY=socks5h://rf-proxy:1080 node scripts/prava.mjs --reestry)
//   node scripts/stop-list.mjs --ishodniki       — исходники: src/, public/ (кроме vendor), data/tablicy
//   node scripts/stop-list.mjs dist              — текст собранного сайта (шаг proverka.yml после npm run build)
//   node scripts/stop-list.mjs --proba           — проба: заведомые упоминания ловятся, чистый текст и <meta> — нет
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { norm, wordRe, osnovy } from '../src/lib/zakon.mjs';

export const FAYL = 'data/stop-list-inoagenty.txt';
export const LOZHNYE = 'data/stop-list-lozhnye.txt';

// Р316: «убирай полностью и каспарова и facebook» — любая форма слова, без исключений. Слова — из кусков, чтобы
// сам сторож не попадал в поиск по репо (файл стоп-листа и этот скрипт сторож не проверяет).
const TVERDYE = [
  ['стоп Р316', 'Каспаров Гарри Кимович', ['/' + 'каспаров' + '/iu', '/' + 'kasparov' + '/iu']],
  ['стоп Р316', 'Facebook (Meta Platforms Inc., экстремистская организация)', ['/' + 'facebook' + '/iu', '/ф[еэ]йсбук/iu']],
  ['стоп Р316', 'Instagram (Meta Platforms Inc., экстремистская организация)', ['/' + 'instagram' + '/iu', '/' + 'инстаграм' + '/iu']],
  // Компания Meta — слово с заглавной (тег <meta>, import.meta, metaKey не ловятся); «Мета» кириллицей — так же.
  ['стоп Р316', 'Meta Platforms Inc. (экстремистская организация)',
    ['/meta\\s+platforms/iu', '/мета\\s+платформ/iu', '/(?<![\\p{L}\\p{N}_<.:/-])Meta(?![\\p{L}\\p{N}_-])/u', '/(?<![\\p{L}\\p{N}])Мета(?![\\p{L}\\p{N}])/u']],
  // r419 (28.10.2026): строки «факты» проверяет только tests/vid-dnya.mjs в фактах дней изобретений; этот сторож их пропускает.
  ['факты Р298', 'Иностранцы в фактах дня (Р298: Тома, Лейбниц, Куммер; Р297: Лилиенталь)', ['/лейбниц/iu', '/куммер/iu', '/(?<![\\p{L}])тома(?![\\p{L}])/iu', '/лилиентал/iu']],
  ['факты Р299', 'Иностранные марки и непонятные термины в фактах дня (Р295 «Вольво», Р299 Mercedes, симплекс-метод, Данциг)', ['/mercedes|мерседес/iu', '/volvo|вольво/iu', '/симплекс|simplex/iu', '/данциг|dantzig/iu']],
  ['факты Р300', 'Сахаров — нигде в фактах', ['/сахаров/iu']],
];

// ---- Сборка стоп-листа ------------------------------------------------------------------------------

const TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
/** Латиница по загранпаспорту (ГОСТ Р 52535.1, без «ie» для ъ): «елизаров павел» → «elizarov pavel». */
export const latinica = (s) => [...norm(s)].map((c) => TR[c] ?? c).join('');

function sobrat(papka) {
  const dir = path.join(papka, 'data/reestry');
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const sn = [['иноагент', 'inoagenty.json'], ['нежелательная', 'nezhelatelnye.json'], ['экстремистская', 'ekstremistskie-organizacii.json']]
    .map(([vid, f]) => ({ vid, f, ...read(f) }));
  const out = [
    '# Стоп-лист сайта (Р316, Р318 — Сергей 28.10.2026): иноагентов и запрещённых организаций в музее нет ни в каком виде,',
    '# даже с пометкой «иноагент»/«запрещена». Сторож — scripts/stop-list.mjs (proverka.yml: исходники до сборки, dist после).',
    '# Обновить: RF_PROXY=socks5h://rf-proxy:1080 node scripts/prava.mjs --reestry в чистой папке, затем',
    '#           node scripts/stop-list.mjs --sobrat <папка>. Однофамильцы — data/stop-list-lozhnye.txt.',
    ...sn.map((s) => `# источник: ${s.reestr} — ${s.istochnik} — выгрузка ${s.data_snimka}, записей ${s.vsego}`),
    '# источник: перечень нежелательных организаций ведёт Минюст по решениям Генпрокуратуры РФ (ст. 3.1 Федерального закона № 272-ФЗ)',
    '# источник: короткие названия запрещённых организаций — data/reestry/korotkie-nazvaniya.json (r405)',
    '# Строка: вид | имя по реестру | варианты через «; ». «~слова» — любая форма слова (падежи), «"слова"» — только',
    '# в кавычках «» (как у Минюста), «/…/» — регулярное выражение, иначе — фраза целиком. Инициалы — только с точками.',
    '# Однословные названия в кавычках в сторож не идут (у нас это пьеса, слово, город); вид «факты» — для tests/vid-dnya.mjs (r419).',
    '',
  ];
  const kodir = (v) => (v.kavychki ? `"${v.tekst}"` : v.slovoforma ? `~${v.tekst}` : v.tekst);
  for (const [vid, imya, vv] of TVERDYE) out.push(`${vid} | ${imya} | ${vv.join('; ')}`);
  const k = read('korotkie-nazvaniya.json');
  // «meta» уже в жёстком стопе (с заглавной — иначе ловил бы <meta> и import.meta); многословное — любой формой.
  const tverdoe = (t) => [t, t[0].toUpperCase() + t.slice(1)].some((x) => TVERDYE.some(([, , vv]) => vv.some((r) => parseVariant(r).re.test(x))));
  for (const z of k.zapisi) {
    const vv = z.varianty.map(norm).filter((t) => !tverdoe(t)).map((t) => (t.includes(' ') ? `~${t}` : t));
    if (vv.length) out.push(`короткое | ${z.imya} | ${vv.join('; ')}`);
  }
  let vsego = 0;
  for (const s of sn) for (const z of s.zapisi) {
    // Однословное название в кавычках («Гроза», «После», «СССР», «Динамо», «Омск») у нас — пьеса, слово или город,
    // не организация: в сторож не идёт (сборка показывает его «возможным»); отличимые короткие — в korotkie-nazvaniya.json.
    const vv = (z.varianty || []).filter((v) => !v.adres && !(v.kavychki && !v.tekst.includes(' '))).map(kodir);
    // Латиница у людей: «имя фамилия», «фамилия имя» (полные формы, без инициалов).
    if (s.vid === 'иноагент') for (const v of z.varianty || []) if (v.slovoforma && v.tekst.split(' ').every((w) => w.length > 1)) vv.push(latinica(v.tekst));
    const uniq = [...new Set(vv)];
    if (!uniq.length) continue;
    vsego++;
    out.push(`${s.vid} | ${z.imya.replace(/\s*\|\s*/g, ' / ').replace(/\s+/g, ' ')} | ${uniq.join('; ')}`);
  }
  fs.writeFileSync(FAYL, out.join('\n') + '\n');
  console.log(`✓ ${FAYL}: записей ${vsego + TVERDYE.length + k.zapisi.length} (реестры ${vsego}, короткие ${k.zapisi.length}, стоп Р316 ${TVERDYE.length})`);
}

// ---- Разбор стоп-листа -----------------------------------------------------------------------------

function parseVariant(s) {
  const t = s.trim();
  const rx = /^\/(.+)\/([a-z]*)$/.exec(t);
  if (rx) return { tekst: t, re: new RegExp(rx[1], rx[2].includes('u') ? rx[2] : rx[2] + 'u'), syroy: true, slova: [] };
  if (t.startsWith('"') && t.endsWith('"')) {
    const w = norm(t.slice(1, -1)).split(' ');
    return { tekst: t, re: new RegExp(`[«„“]\\s*${w.join('[\\s-]+').replace(/е/g, '[её]')}\\s*[»“”]`, 'iu'), syroy: true, slova: w };
  }
  // Инициалы («~п о елизаров») — только с точками в видимом тексте: «П. О. Елизаров»; иначе «долина, а в…» ловилось как «Долин А. В.».
  const tt = norm(t.replace(/^~/, '')).split(' ');
  if (t.startsWith('~') && tt.length <= 3 && tt.filter((x) => x.length === 1).length === tt.length - 1)
    return { tekst: t, re: new RegExp(`(?<![\\p{L}])${tt.map((x) => (x.length === 1 ? `${x}\\.\\s*` : wordRe(x, true))).join('\\s*')}(?![\\p{L}])`, 'iu'), syroy: true, slova: tt.filter((x) => x.length > 1), flex: true };
  const flex = t.startsWith('~');
  const w = norm(flex ? t.slice(1) : t).split(' ');
  return { tekst: t, re: new RegExp(`(?<![\\p{L}\\p{N}])${w.map((x) => wordRe(x, flex)).join(' ')}(?![\\p{L}\\p{N}])`, 'u'),
    syroy: false, slova: w, flex };
}

/** [{ vid, imya, varianty: [{ tekst, re, syroy, slova, flex }] }] */
export function zagruzit(fayl = FAYL) {
  return fs.readFileSync(fayl, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => {
    const [vid, imya, vv] = l.split(' | ');
    return { vid, imya, varianty: vv.split('; ').map(parseVariant) };
  });
}

/** Однофамильцы: «вариант | слова рядом (в той же строке, ±120 знаков) или @часть пути файла | кто это и кто сверил». */
export function lozhnye(fayl = LOZHNYE) {
  if (!fs.existsSync(fayl)) return [];
  return fs.readFileSync(fayl, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => { const [variant, ryadom, kto] = l.split(' | ').map((x) => x.trim());
      return { variant, ...(ryadom.startsWith('@') ? { put: ryadom.slice(1) } : { ryadom: norm(ryadom) }), kto }; });
}

const SUSHCH = { laquo: '«', raquo: '»', quot: '"', amp: '&', nbsp: ' ', bdquo: '„', ldquo: '“', rdquo: '”', mdash: '—', ndash: '–', apos: "'" };
const ATR = /\b(?:alt|title|content|aria-label|placeholder|data-caption|data-title)\s*=\s*("[^"]*"|'[^']*')/gi;
// Строчные теги внутри фразы: «Иван <b>Павлов</b>» — одна фраза; блочные (<li>, <p>, <meta>) и подписи — раздел « | ».
const STROCHNYE = /^<\/?(a|b|i|u|s|em|strong|span|small|mark|abbr|cite|q|sup|sub|nobr|wbr)\b/i;
/** Видимый текст строки: теги — пробелом или разделом (их подписи alt/title/content — остаются), сущности — знаками. */
export const vidimyy = (s) => String(s)
  .replace(/<[^>]*>/g, (tag) => {
    const atr = [...tag.matchAll(ATR)].map((m) => m[1].slice(1, -1));
    return atr.length ? ' | ' + atr.join(' | ') + ' | ' : STROCHNYE.test(tag) ? ' ' : ' | ';
  })
  .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : SUSHCH[e.toLowerCase()] ?? m))
  .replace(/\\u([0-9a-f]{4})/gi, (m, h) => String.fromCharCode(parseInt(h, 16)));

// Фраза не перескакивает через знаки препинания: «Иван Шишкин, Михаил Нестеров» — не «Шишкин Михаил»,
// "@type":"Article","headline":"19 января" — не «Article 19», «юрий смирнов, александр…» — не «Смирнов Александр».
const RAZDEL = /[,;:!?()[\]{}«»„“”"|/·—–=<>]+|\.(?=\s|$)/u;
const kuski = (v) => v.split(RAZDEL).map(norm).filter(Boolean).join(' ¦ ');

/** Проверка текстов [{ gde, syroy }]: [{ gde, stroka, vid, imya, variant, naydeno, kusok }]. */
export function proverit(tx, spisok = zagruzit(), lozh = lozhnye()) {
  const fayly = tx.map((t) => {
    const stroki = String(t.syroy).split('\n').map((x) => { const v = vidimyy(x); return { v, n: kuski(v) }; });
    const slova = new Set(stroki.flatMap((s) => s.n.split(' ')));
    return { gde: t.gde, stroki, slova, poryadok: [...slova].sort() };
  });
  // Предотбор: варианты, все слова которых (или их основы) есть в корпусе, затем — в файле (двоичный поиск по основе).
  const slovar = [...new Set(fayly.flatMap((f) => f.poryadok))].sort();
  const estPrefiks = (p, sp = slovar) => { let lo = 0, hi = sp.length; while (lo < hi) { const m = (lo + hi) >> 1; if (sp[m] < p) lo = m + 1; else hi = m; } return !!sp[lo]?.startsWith(p); };
  const est = (w, flex) => (flex && w.length > 1 ? osnovy(w).some((o) => estPrefiks(o)) : estPrefiks(w));
  const vFayle = (f, w, flex) => (flex && w.length > 1 ? osnovy(w).some((o) => estPrefiks(o, f.poryadok)) : f.slova.has(w));
  const out = [];
  for (const z of spisok.filter((x) => !x.vid.startsWith('факты'))) for (const v of z.varianty) {
    if (!v.slova.every((w) => est(w, v.flex))) continue;
    for (const f of fayly) {
      if (v.slova.length && !v.slova.every((w) => vFayle(f, w, v.flex))) continue;
      f.stroki.forEach((s, i) => {
        const txt = v.syroy ? s.v : s.n;
        for (const m of txt.matchAll(new RegExp(v.re.source, v.re.flags.includes('g') ? v.re.flags : v.re.flags + 'g'))) {
          const kusok = txt.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60).replace(/\s+/g, ' ').trim();
          if (z.vid !== 'стоп Р316') {
            const okno = norm(txt.slice(Math.max(0, m.index - 120), m.index + m[0].length + 120));
            if (lozh.some((l) => l.variant === v.tekst && (l.put ? f.gde.includes(l.put) : okno.includes(l.ryadom)))) continue;
          }
          out.push({ gde: f.gde, stroka: i + 1, vid: z.vid, imya: z.imya, variant: v.tekst, naydeno: m[0], kusok });
        }
      });
    }
  }
  return out.sort((a, b) => a.gde.localeCompare(b.gde) || a.stroka - b.stroka);
}

// ---- Обход файлов ----------------------------------------------------------------------------------

const TEKSTOVYE = /\.(html?|json|md|mdx|ya?ml|astro|m?js|ts|txt|xml|svg|vtt|srt|webmanifest)$/i;
const MIMO = /(^|\/)(vendor|node_modules|\.git)(\/|$)/;
// Сам стоп-лист, его однофамильцы, снимки реестров и сторож сборки zakon.mjs (жёсткий стоп Р316) — на страницу не выводятся.
const SPRAVOCHNIKI = /(^|\/)(stop-list-inoagenty\.txt|stop-list-lozhnye\.txt|data\/reestry\/|src\/lib\/zakon\.mjs$)/;
export function obhod(dir, out = []) {
  if (!fs.existsSync(dir) || MIMO.test(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) obhod(p, out);
    else if (TEKSTOVYE.test(e.name) && !MIMO.test(p) && !SPRAVOCHNIKI.test(p)) out.push(p);
  }
  return out;
}
const chitat = (fayly, root) => fayly.map((f) => ({ gde: path.relative(root, f), syroy: fs.readFileSync(f, 'utf8') }));
export const ISHODNIKI = ['src', 'public', 'data/tablicy'];

function otchet(r, chto, { annot = false } = {}) {
  if (!r.length) { console.log(`✓ стоп-лист (${chto}): 0 упоминаний`); return 0; }
  const fayly = new Set(r.map((x) => x.gde));
  for (const x of r) {
    const msg = `${x.vid}: ${x.imya} — найдено «${x.naydeno}» (вариант ${x.variant}) … ${x.kusok}`;
    console.log(`✗ ${x.gde}:${x.stroka}: ${msg}`);
    if (annot && process.env.GITHUB_ACTIONS) console.log(`::error file=${x.gde},line=${x.stroka}::стоп-лист — ${msg.replace(/[\r\n]/g, ' ')}`);
  }
  console.log(`✗ стоп-лист (${chto}): ${r.length} упоминаний в ${fayly.size} файлах — убрать и переделать фразу (Р318: «просто их нет в нашем музее»); однофамилец — строкой в ${LOZHNYE}`);
  return 1;
}

function proba() {
  const spisok = zagruzit();
  const chel = spisok.find((z) => z.vid === 'иноагент' && z.varianty.some((v) => v.flex && v.slova.length === 2));
  const org = spisok.find((z) => z.vid === 'нежелательная' && z.varianty.some((v) => v.tekst.startsWith('"')));
  const ekstr = spisok.find((z) => z.vid === 'экстремистская');
  const imya = chel.varianty.find((v) => v.flex && v.slova.length === 2).slova.map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  const kav = `«${org.varianty.find((v) => v.tekst.startsWith('"')).slova.join(' ')}»`;
  const ex = ekstr.varianty[0];
  const exTekst = ex.tekst.startsWith('"') ? `«${ex.slova.join(' ')}»` : ex.slova.join(' ');
  const K = 'Кас' + 'паров';
  const krasnye = [
    [`<p>Чемпион мира ${K} проиграл.</p>`, 'Каспаров на странице'],
    [`<p>Гарри ${K}а обыграли</p>`, 'Каспаров в другом падеже'],
    [`<p>${K} (признан иноагентом) сыграл</p>`, 'Каспаров с пометкой «иноагент»'],
    [`<img alt="Партия ${K}а" src="a.jpg">`, 'Каспаров в подписи кадра alt'],
    ['<p>Пост в Face' + 'book</p>', 'Facebook'],
    ['<p>Страница в фейс' + 'буке</p>', 'фейсбук кириллицей'],
    ['<p>Фото из Insta' + 'gram</p>', 'Instagram'],
    ['<p>Компания Me' + 'ta купила</p>', 'Meta как компания'],
    [`<p>Об этом рассказал ${imya}.</p>`, `иноагент «${imya}»`],
    [`<p>Об этом рассказал ${imya} (иностранный агент).</p>`, `иноагент «${imya}» с пометкой`],
    [`<p>Об этом писал ${latinica(imya)}.</p>`, `иноагент латиницей «${latinica(imya)}»`],
    [`<p>Деньги дал ${kav}.</p>`, `нежелательная ${kav}`],
    [`<p>Это ${exTekst} (запрещена в России).</p>`, `экстремистская «${exTekst}» с пометкой`],
    ['<p>Расследование &laquo;Фонда борьбы с коррупцией&raquo;</p>', 'короткое название в сущностях HTML'],
    [`<p>Об этом рассказал <b>${imya.split(' ')[0]}</b> ${imya.split(' ')[1]}.</p>`, `иноагент «${imya}» через строчный тег <b>`],
  ];
  const zelenye = [
    ['<meta name="description" content="Шахматы: чемпион мира Владимир Крамник">', '<meta> и Крамник'],
    ['<p>«Металлург» Магнитогорск</p><script>if(e.metaKey){import.meta.env}</script>', 'Металлург, metaKey, import.meta'],
    ['<p>Мемориал Ленина в Ульяновске</p>', 'мемориал без кавычек'],
    [`<li>${imya.split(' ')[0]}</li><li>${imya.split(' ')[1]}ский</li>`, 'соседние пункты списка — не одна фраза'],
    [`<p>${imya.split(' ')[0]} Петров, ${imya.split(' ')[1]}ский</p>`, 'через запятую — не одна фраза'],
    ['<script type="application/ld+json">{"@type":"Article","headline":"19 января"}</script>', 'тип Article и дата — не «Article 19»'],
  ];
  let sboev = 0;
  for (const [t, chto] of krasnye) {
    const ok = proverit([{ gde: 'proba.html', syroy: t }], spisok, []).length > 0;
    console.log(`${ok ? '✓' : '✗'} проба красная: ${chto}`); if (!ok) sboev++;
  }
  for (const [t, chto] of zelenye) {
    const r = proverit([{ gde: 'proba.html', syroy: t }], spisok, []);
    console.log(`${r.length ? '✗' : '✓'} проба зелёная: ${chto}${r.length ? ' — ' + r.map((x) => x.naydeno).join(', ') : ''}`); if (r.length) sboev++;
  }
  // Однофамилец снимается строкой с соседними словами, жёсткий стоп Р316 — нет.
  const v = chel.varianty.find((x) => x.flex && x.slova.length === 2).tekst;
  const lozh = [{ variant: v, ryadom: 'архитектор хлебной биржи', kto: 'проба' }, { variant: '/каспаров/iu', ryadom: 'чемпион', kto: 'проба' }];
  const r1 = proverit([{ gde: 'p.html', syroy: `<p>${imya}, архитектор хлебной биржи</p>` }], spisok, lozh);
  const r2 = proverit([{ gde: 'p.html', syroy: `<p>${K}, чемпион</p>` }], spisok, lozh);
  console.log(`${r1.length ? '✗' : '✓'} проба: однофамилец из ${LOZHNYE} снят`); if (r1.length) sboev++;
  console.log(`${r2.length ? '✓' : '✗'} проба: стоп Р316 строкой однофамильца не снимается`); if (!r2.length) sboev++;
  // Сторож по папке: файл с упоминанием и строка в ответе.
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'stop-'));
  fs.writeFileSync(path.join(d, 'index.html'), `<p>чисто</p>\n<p>${K}</p>\n`);
  const r3 = proverit(chitat(obhod(d), d), spisok, []);
  fs.rmSync(d, { recursive: true, force: true });
  const ok3 = r3.length === 1 && r3[0].gde === 'index.html' && r3[0].stroka === 2;
  console.log(`${ok3 ? '✓' : '✗'} проба: по папке — файл index.html, строка 2`); if (!ok3) sboev++;
  console.log(sboev ? `✗ проба стоп-листа: сбоев ${sboev}` : `✓ проба стоп-листа: записей ${spisok.length}, все пробы прошли`);
  return sboev ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const a = process.argv.slice(2);
  if (a[0] === '--sobrat') sobrat(a[1] || '.');
  else if (a[0] === '--proba') process.exit(proba());
  else if (a[0] === '--ishodniki') process.exit(otchet(proverit(chitat(ISHODNIKI.flatMap((d) => obhod(d)), '.')), 'исходники', { annot: true }));
  else {
    const dir = a[0] || 'dist';
    if (!fs.existsSync(dir)) { console.log(`✗ нет папки ${dir} — сначала npm run build`); process.exit(1); }
    process.exit(otchet(proverit(chitat(obhod(dir), dir)), dir));
  }
}
