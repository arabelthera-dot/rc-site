// Без Википедии (решение Сергея Р90, проверка — Р103, 21.10.2026): ни кадров, ни ссылок, ни подписей
// с Википедией, Викискладом (Wikimedia Commons), Викитекой на страницах сайта.
// Корень: замены кадров шли руками, а в сборке не было ни одной проверки — новые страницы снова приносили
// кадры с Commons, и музей приходилось переделывать.
// По dist/ считается каждое упоминание (адрес upload/commons.wikimedia.org, *.wikipedia.org, wikisource,
// слова «Викисклад», «Википедия», «Викитека», «Wikimedia Commons») — в разметке, подписях, data-source, JS.
// Ошибка (код 1): в музее упоминаний больше потолка из scripts/bez-viki-dolg.json или они появились там,
// где потолка нет. Потолки — числа на main 21.10.2026: долг старых музеев может только убывать, новые — чистые.
// ДОЧИСТИЛИ МУЗЕЙ — СТРОКУ ИЗ bez-viki-dolg.json УДАЛИТЬ; убавили — потолок снизить до нового числа.
// Запуск: node scripts/bez-viki.mjs [--dist dist] [--spisok] [--json отчёт.json] [--proba]
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const DIST = arg('--dist', 'dist');
const JSON_OUT = arg('--json', '');
const SPISOK = argv.includes('--spisok');

const VIKI = /(?:[a-z]+\.)?wikimedia\.org|[a-z-]+\.(?:m\.)?wikipedia\.org|wikisource\.org|wikimedia\s+commons|wikipedia|викисклад|википеди|викитек/giu;

export function schet(text) {
  return [...text.matchAll(VIKI)].map((m) => m[0]);
}
// Кадры: <img>, у которого Википедия в самом теге (src, data-source, data-license) или в подписи его <figure>.
// Это число картинок, которые надо заменить; упоминаний больше — ссылки «Изображения:», таблица прав, JS.
export function kadry(html) {
  const out = new Set();
  const viki = (t) => { VIKI.lastIndex = 0; return VIKI.test(t); };
  const src = (tag) => (/\ssrc\s*=\s*["']([^"']+)/i.exec(tag) || [])[1];
  for (const f of html.matchAll(/<figure\b[\s\S]*?<\/figure>/gi)) {
    if (!viki(f[0])) continue;
    for (const im of f[0].matchAll(/<img\b[^>]*>/gi)) if (src(im[0])) out.add(src(im[0]));
  }
  for (const im of html.matchAll(/<img\b[^>]*>/gi)) if (viki(im[0]) && src(im[0])) out.add(src(im[0]));
  return out;
}

if (argv.includes('--proba')) {
  const da = ['src="https://upload.wikimedia.org/a.jpg"', 'Фото: Викисклад', 'Цифровой файл: Wikimedia Commons',
    'https://ru.wikipedia.org/wiki/X', 'по данным Википедии', 'ru.wikisource.org', 'Викитека'];
  const net = ['Госкаталог музейного фонда РФ', 'Президентская библиотека', 'Wiki-игра «Собери слово»'];
  const plohie = [...da.filter((s) => !schet(s).length), ...net.filter((s) => schet(s).length)];
  if (plohie.length) { console.error('bez-viki --proba: регулярка ошиблась на', plohie); process.exit(1); }
  console.log(`bez-viki --proba: ${da.length} заведомых ловит, ${net.length} чистых пропускает`);
  process.exit(0);
}

function* faily(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* faily(p);
    else if (/\.(?:html|js|mjs|json|css)$/i.test(e.name)) yield p;
  }
}

// Музей — папка после muzei/; всё прочее — «sayt» (главная, служебные страницы).
const muzeyIz = (rel) => { const m = /^muzei\/([^/]+)\//.exec(rel); return m ? m[1] : 'sayt'; };

const poMuzeyam = new Map(); // музей → { vsego, stranicy: Map(rel → n) }
for (const f of faily(DIST)) {
  const rel = path.relative(DIST, f).split(path.sep).join('/');
  if (rel.startsWith('_astro/') && !/\.js$/.test(rel)) continue;
  const text = fs.readFileSync(f, 'utf8');
  const n = schet(text).length;
  if (!n) continue;
  const mz = muzeyIz(rel);
  if (!poMuzeyam.has(mz)) poMuzeyam.set(mz, { vsego: 0, stranicy: new Map(), kadry: new Set() });
  const z = poMuzeyam.get(mz);
  z.vsego += n;
  if (/\.html$/.test(rel) && mz !== 'sayt') for (const k of kadry(text)) z.kadry.add(new URL(k, 'https://x/' + rel).pathname);
  z.stranicy.set(rel, n);
}

// Снятые кадры (Р90): проход 21.10 чистил карточки дней, а полные страницы остались с кадрами Викисклада —
// подписи «Фото: ник, CC BY-SA» слова «wikimedia» не содержат, и счётчик выше их не видел.
// bez-viki-snyato.json — отпечатки (sha256) файлов из data/r90-snyato/ в том виде, в каком они стояли до снятия
// (Р106, Р108 — личные разрешения Сергея — исключены). Картинка, на которую ссылается страница музея и чей
// отпечаток в списке, — снятый кадр вернулся. Потолок — "snyato:<музей>" в bez-viki-dolg.json, только убывает.
import crypto from 'node:crypto';
const snyatoFile = path.join(path.dirname(new URL(import.meta.url).pathname), 'bez-viki-snyato.json');
const SNYATO = fs.existsSync(snyatoFile) ? JSON.parse(fs.readFileSync(snyatoFile, 'utf8')) : {};
const otpechatok = new Map();
export function ssylkiNaKadry(html) {
  const out = new Set();
  const IMG = /[^\s"'(),]+\.(?:jpe?g|png|webp|gif|avif)(?=[\s"'),?#]|$)/gi;
  for (const m of html.matchAll(/(?:src|srcset|href|content|poster|data-[a-z-]+)\s*=\s*["']([^"']+)["']|"(?:url|image|contentUrl|src)"\s*:\s*"([^"]+)"/gi))
    for (const u of (m[1] || m[2]).matchAll(IMG)) out.add(u[0]);
  return out;
}
// Интерактивы держат кадры строками в JS (массивы visuals, film-stage) — ни атрибута, ни <img>, и сверка по
// HTML их не видела (терем 01-03, 22.10). Поэтому смотрим и .js/.json музея, и каждую строку-путь к картинке:
// по отпечатку файла, а если путь не открылся — по хвосту пути из списка снятых (не короче «папка/файл»).
export function stroki_kadrov(text) {
  const out = new Set();
  for (const m of text.matchAll(/["'`]([^"'`\s]+\.(?:jpe?g|png|webp|gif|avif))(?:[?#][^"'`]*)?["'`]/gi)) out.add(m[1]);
  return out;
}
const snyatyePuti = Object.values(SNYATO).map((v) => v[2]);
const poHvostu = (pn) => {
  const h = pn.replace(/^(?:\.\.?\/)+/, '').replace(/^\//, '');
  return h.includes('/') && snyatyePuti.some((p) => p === h || p.endsWith('/' + h));
};
const kadrySnyatye = new Map(); // музей → Set('страница → файл')
if (Object.keys(SNYATO).length) for (const f of faily(DIST)) {
  const rel = path.relative(DIST, f).split(path.sep).join('/');
  if (!/^muzei\/[^/]+\/.*\.(?:html|m?js|json)$/.test(rel)) continue;
  const text = fs.readFileSync(f, 'utf8');
  const vse = new Set([...ssylkiNaKadry(text), ...stroki_kadrov(text)]);
  for (const u of vse) {
    if (/^https?:/i.test(u) && !/russian-civilization|rc-museum-preview/.test(u)) continue;
    let pn;
    try { pn = decodeURIComponent(new URL(u, 'https://x/' + rel).pathname).replace(/^\/rc-museum-preview\//, '/'); } catch { continue; }
    const fp = path.join(DIST, pn);
    if (!otpechatok.has(fp)) otpechatok.set(fp, fs.existsSync(fp) && fs.statSync(fp).isFile() ? crypto.createHash('sha256').update(fs.readFileSync(fp)).digest('hex') : '');
    const h = otpechatok.get(fp);
    if (!(h && SNYATO[h]) && !(!h && poHvostu(u))) continue;
    const mz = muzeyIz(rel);
    if (!kadrySnyatye.has(mz)) kadrySnyatye.set(mz, new Set());
    kadrySnyatye.get(mz).add(`${rel} → ${pn.slice(1)}`);
  }
}

const dolgFile = path.join(path.dirname(new URL(import.meta.url).pathname), 'bez-viki-dolg.json');
const dolg = fs.existsSync(dolgFile) ? JSON.parse(fs.readFileSync(dolgFile, 'utf8')) : {};
const oshibki = [];
const stroki = [...poMuzeyam].sort((a, b) => b[1].vsego - a[1].vsego);
let itogo = 0, itogoKadrov = 0;
for (const [mz, z] of stroki) {
  itogo += z.vsego;
  itogoKadrov += z.kadry.size;
  const potolok = dolg[mz];
  const metka = potolok === undefined ? 'НОВОЕ — потолка нет' : z.vsego > potolok ? `БОЛЬШЕ потолка ${potolok}` : z.vsego < potolok ? `меньше потолка ${potolok} — снизь потолок` : 'на потолке';
  console.log(`${mz}: ${z.vsego} упоминаний на ${z.stranicy.size} стр.${mz === 'sayt' ? '' : `, кадров ${z.kadry.size}`} — ${metka}`);
  if (potolok === undefined || z.vsego > potolok) oshibki.push(mz);
  if (SPISOK || oshibki.includes(mz)) {
    for (const [rel, n] of [...z.stranicy].sort((a, b) => b[1] - a[1])) console.log(`   ${n}\t${rel}`);
  }
}
for (const [mz, set] of kadrySnyatye) {
  const potolok = dolg['snyato:' + mz] ?? 0;
  console.log(`${mz}: снятых кадров Викисклада снова на страницах — ${set.size}${set.size > potolok ? ` (потолок ${potolok})` : ''}`);
  if (set.size > potolok) { oshibki.push('snyato:' + mz); for (const x of set) console.log('   ' + x); }
}
for (const mz of Object.keys(dolg)) if (mz.startsWith('snyato:') && !kadrySnyatye.has(mz.slice(7))) console.log(`${mz}: 0 — дочищен, строку из bez-viki-dolg.json удалить`);
for (const mz of Object.keys(dolg)) if (!mz.startsWith("snyato:") && !poMuzeyam.has(mz)) console.log(`${mz}: 0 — дочищен, строку из bez-viki-dolg.json удалить`);
console.log(`Итого упоминаний Википедии/Викисклада: ${itogo}; кадров в музеях: ${itogoKadrov}`);
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(Object.fromEntries(stroki.map(([mz, z]) => [mz, { vsego: z.vsego, kadry: [...z.kadry], stranicy: Object.fromEntries(z.stranicy) }])), null, 1));
if (oshibki.length) {
  console.error(`\nОШИБКА: Википедии стало больше или она появилась в новом месте: ${oshibki.join(', ')} (Р90). Кадр — из русских фондов (Госкаталог), см. scripts/kadr.py.`);
  process.exit(1);
}
