// Книга стиля и орфография машиной — ПОДСКАЗЧИК Агента (Р716, Р717, 10.11.2026; пункты 78 и 80 очереди 1).
// Текст дня → замечания строкой: «ММ-ДД факт N [правило] «фрагмент» — что сделать». Только сообщает:
// код выхода всегда 0, в сборку и CI не встроен, страниц и данных не правит, контроль глазами не заменяет.
// Правила — из правил проекта: стоп-лист канцелярита и отглагольные берутся из .vale/styles/RC (один источник с Vale);
// иноагенты и запрещённые организации (Р316, Р318); Википедия (Р90); оговорки вместо «мы первые» (Р504);
// «научный консультант» (08.10); восклицания (PREFERENCES); кавычки «ёлочки» (вложенные „лапки“ — museum-core/recepty.md);
// даты словами («в 1900 году», не «г.»/«01.01.1900»); тире вместо дефиса между словами.
// Орфография — LanguageTool локально, без облака: java из ~/.local/share/languagetool (LT_DIR).
// Поставить LT (бесплатно, Maven Central): pip3 download --no-deps jdk4py → pip3 install --target <tmp>;
// java-runtime → $LT_DIR/jdk4py/java-runtime; mvn dependency:copy-dependencies по pom.xml с
// org.languagetool:languagetool-commandline и language-ru 6.8 → $LT_DIR/jars. Нет LT — работает только книга стиля.
// Запуск: node scripts/kniga-stilya.mjs [--muzei izobreteniya] [--dni 01-01,01-02] [--bez-lt] [файл.txt …]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const LT_DIR = process.env.LT_DIR || path.join(os.homedir(), '.local/share/languagetool');

// Токены Vale (existence): список строк под «tokens:».
function valeTokeny(fajl) {
  const t = fs.readFileSync(path.join(ROOT, '.vale/styles/RC', fajl), 'utf8');
  const blok = t.split(/^tokens:\s*$/m)[1] ?? '';
  return [...blok.matchAll(/^\s+- '(.*)'\s*$/gm)].map((m) => m[1].replace(/''/g, "'"));
}

// Правила книги стиля: [id, регулярка, что сделать].
export function pravila() {
  const p = [];
  for (const t of valeTokeny('Kancelyarit.yml')) p.push(['канцелярит', new RegExp(t, 'giu'), 'вычеркнуть или сказать действием (rc-text)']);
  for (const t of valeTokeny('Otglagolnye.yml')) p.push(['отглагольное', new RegExp(t, 'giu'), 'сказать глаголом (rc-text)']);
  const s = (id, re, chto) => p.push([id, new RegExp(re, 'giu'), chto]);
  s('иноагенты', String.raw`каспаров\p{L}*|facebook|фейсбук\p{L}*|instagram|инстаграм\p{L}*|(?<!\p{L})meta(?!\p{L})|иноагент\p{L}*|иностранн\p{L}* агент\p{L}*`,
    'удалить и переделать день, замену — Сергею (Р316, Р318)');
  s('википедия', String.raw`википеди\p{L}*|викисклад\p{L}*|wikipedia|wikimedia|commons\.wiki`, 'источник вычеркнут (Р90)');
  s('оговорка', String.raw`(?<!\p{L})(?:одн(?:им|ой|ого|а|о)|одни) из (?:первых|самых первых)|по некоторым (?:данным|сведениям)|(?<!\p{L})считается,? что|(?<!\p{L})якобы|(?<!\p{L})возможно,|может быть|по-видимому|(?<!\p{L})вероятно|принято считать`,
    'мы первые — в полный голос, без оговорок (Р504)');
  s('научный консультант', String.raw`научн\p{L}* консультант\p{L}*`, 'просто «консультант» (Сергей 08.10)');
  s('восклицание', String.raw`[^!\s][^!]{0,40}!`, 'без восклицаний (PREFERENCES)');
  s('дата', String.raw`(?<!\p{L})\d{3,4}\s?(?:г|гг)\.(?!\p{L})|(?<!\d)\d{1,2}\.\d{1,2}\.\d{2,4}(?!\d)|(?<!\p{L})\d{1,2}-(?:го|е|ое)\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)|(?<![\p{L}\d])[XVI]+\s?в\.(?!\p{L})`,
    'дату словами: «в 1900 году», «1 января 1900 года», «в XX веке»');
  s('тире', String.raw`\p{L}\s-\s\p{L}|\p{L}\s–\s\p{L}`, 'между словами — длинное тире «—»');
  s('пробел', String.raw`\p{L}\s+[,.:;!?](?!\.)`, 'пробел перед знаком препинания');
  return p;
}

// Кавычки: сначала вырезать «…» с вложенными „…“, потом искать прямые и лапки снаружи (recepty.md, 08.11.2026).
function kavychki(t) {
  let bez = t;
  for (let i = 0; i < 3; i++) bez = bez.replace(/«[^«»]*»/g, (m) => ' '.repeat(m.length));
  const z = [];
  for (const m of bez.matchAll(/["“”„']/g)) z.push(['кавычки', m.index, t.slice(Math.max(0, m.index - 15), m.index + 15), 'только «ёлочки», внутри — „лапки“']);
  const otkr = (t.match(/«/g) || []).length, zakr = (t.match(/»/g) || []).length;
  if (otkr !== zakr) z.push(['кавычки', 0, `« ${otkr} / » ${zakr}`, 'непарные «ёлочки»']);
  return z;
}

export function kniga(t, pr = pravila()) {
  const z = [];
  for (const [id, re, chto] of pr) for (const m of t.matchAll(re)) z.push([id, m.index, m[0].trim(), chto]);
  return z.concat(kavychki(t));
}

// LanguageTool одним запуском на все куски: склеить через пустую строку, смещения разнести обратно.
function lt(kuski) {
  const java = path.join(LT_DIR, 'jdk4py/java-runtime/bin/java');
  if (!fs.existsSync(java) || !fs.existsSync(path.join(LT_DIR, 'jars'))) return null;
  const nachala = []; let tekst = '';
  for (const k of kuski) { nachala.push(tekst.length); tekst += k.tekst + '\n\n'; }
  const f = path.join(os.tmpdir(), `kniga-stilya-${process.pid}.txt`);
  fs.writeFileSync(f, tekst);
  const r = spawnSync(java, ['-cp', path.join(LT_DIR, 'jars/*'), 'org.languagetool.commandline.Main', '-l', 'ru-RU', '--json', f],
    { encoding: 'utf8', maxBuffer: 64 << 20 });
  fs.rmSync(f, { force: true });
  const j = r.stdout.indexOf('{');
  if (j < 0) return null;
  const out = kuski.map(() => []);
  for (const m of JSON.parse(r.stdout.slice(j)).matches) {
    let i = nachala.length - 1; while (i > 0 && nachala[i] > m.offset) i--;
    const sovet = m.replacements?.slice(0, 2).map((x) => x.value).join(' / ');
    out[i].push([`LT ${m.rule.id}`, m.offset - nachala[i], tekst.substr(m.offset, m.length), m.message + (sovet ? ` → ${sovet}` : '')]);
  }
  return out;
}

// Куски дня из копии утверждённого: заголовок дня и каждого факта, «подробнее».
function kuskiDnya(muzei, den) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/utverzhdeno', muzei, `${den}.json`), 'utf8'));
  const k = [{ gde: `${den} заголовок`, tekst: d.zagolovok ?? '' }];
  for (const f of d.fakty ?? []) k.push({ gde: `${den} факт ${f.n}`, tekst: [f.zagolovok, f.podrobnee].filter(Boolean).join(' ') });
  return k;
}

function main() {
  const muzei = arg('--muzei', 'izobreteniya');
  const fajly = argv.filter((a, i) => !a.startsWith('--') && !['--muzei', '--dni'].includes(argv[i - 1]));
  let kuski;
  if (fajly.length) kuski = fajly.map((f) => ({ gde: path.basename(f), tekst: fs.readFileSync(f, 'utf8') }));
  else {
    const dir = path.join(ROOT, 'src/data/utverzhdeno', muzei);
    const dni = arg('--dni')?.split(',') ?? fs.readdirSync(dir).filter((f) => /^\d\d-\d\d\.json$/.test(f)).map((f) => f.slice(0, 5)).sort();
    kuski = dni.flatMap((d) => kuskiDnya(muzei, d));
  }
  const pr = pravila();
  const ltz = argv.includes('--bez-lt') ? null : lt(kuski);
  if (!argv.includes('--bez-lt') && !ltz) console.log(`LanguageTool не найден в ${LT_DIR} — только книга стиля (как поставить — в шапке файла).`);
  const schet = {};
  // Словарь LT не знает имён и редких слов (на пробе 34 из 34) — они одной строкой на день, с числом повторов.
  const slova = new Map();
  kuski.forEach((k, i) => {
    const den = k.gde.split(' ')[0];
    for (const [id, , frag, chto] of kniga(k.tekst, pr).concat(ltz?.[i] ?? [])) {
      schet[id] = (schet[id] ?? 0) + 1;
      if (id === 'LT MORFOLOGIK_RULE_RU_RU') {
        const m = slova.get(den) ?? new Map(); m.set(frag, (m.get(frag) ?? 0) + 1); slova.set(den, m); continue;
      }
      console.log(`${k.gde} [${id}] «${frag.replace(/\s+/g, ' ').slice(0, 60)}» — ${chto}`);
    }
  });
  for (const [den, m] of slova) console.log(`${den} [LT словарь] незнакомые слова (чаще имена): ${[...m].map(([w, n]) => n > 1 ? `${w} ×${n}` : w).join(', ')} — опечатку искать глазами`);
  const vsego = Object.values(schet).reduce((a, b) => a + b, 0);
  console.log(`Итого замечаний: ${vsego}` + (vsego ? ' — ' + Object.entries(schet).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') : '')
    + '. Подсказка, не приговор: каждое смотреть глазами.');
}

if (import.meta.url === `file://${process.argv[1]}`) { try { main(); } catch (e) { console.log(`Подсказчик споткнулся: ${e.message}`); } process.exit(0); }
