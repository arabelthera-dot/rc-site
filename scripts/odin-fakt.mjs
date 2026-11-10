// Один факт в разных музеях — подсказчик Агента (п.82 очереди 1, Р716, Р717). Только сообщает, ничего не
// останавливает и не заменяет приёмку: код выхода всегда 0, в сборку и CI не встроен, страницы не правит.
// Факты дня берутся так: есть копия утверждённого src/data/utverzhdeno/<музей>/ММ-ДД.json — её fakty
// (zagolovok + podrobnee, каждый факт отдельно); нет — запись дня src/content/days/<музей>/ММ-ДД.json
// (title + hook + gist одним фактом).
// Сравнение — пары фактов из РАЗНЫХ музеев, хотя бы один из которых в выбранных музеях и месяце:
//   1) общие годы (четыре цифры) и общие имена (слова с большой буквы не в начале фразы);
//   2) близость текста: косинус TF-IDF по основам слов (первые 5 букв) и доля общих шинглов из трёх основ (Жаккар).
// Пара попадает в отчёт, если косинус ≥ 0.45, или шинглы ≥ 0.12, или есть общий год и общее имя при косинусе ≥ 0.2.
// Запуск: node scripts/odin-fakt.mjs [--muzei izobreteniya,ne-sdayutsya] [--mesyac 01] [--vse] [--otchet путь.md] [--json]
//   --vse — сравнить все музеи между собой целиком (без фильтра по музеям и месяцу).
// Без флагов — музеи и месяц из data/rabochie-dni.json.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DNI = path.join(ROOT, 'src/content/days');
const UTV = path.join(ROOT, 'src/data/utverzhdeno');

function arg(name) {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
}

const chist = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const osnova = (w) => w.toLowerCase().replace(/ё/g, 'е').slice(0, 5);
// Частые слова без смысла для сравнения: служебные и слова каждого дня музея.
const STOP = new Set(['котор', 'этого', 'этом', 'когда', 'потом', 'тольк', 'было', 'были', 'чтобы', 'перво', 'русск',
  'росси', 'году', 'годы', 'года', 'посл', 'всего', 'свой', 'своег', 'своих', 'очень', 'такой', 'также', 'через', 'между']);

function slova(t) {
  return (t.match(/[А-Яа-яЁёA-Za-z-]{3,}/g) || []).map(osnova).filter((w) => !STOP.has(w));
}
function gody(t) {
  return new Set(t.match(/\b1[0-9]{3}\b|\b20[0-9]{2}\b/g) || []);
}
// Имена: слово с большой буквы, перед которым нет конца фразы.
function imena(t) {
  const out = new Set();
  const re = /([.!?»"]\s+|^|\s)([А-ЯЁ][а-яё]{3,})/g;
  let m;
  while ((m = re.exec(t))) if (!/[.!?»"]/.test(m[1]) && m[1] !== '') out.add(osnova(m[2]));
  return out;
}

export function sobratFakty(root = ROOT) {
  const fakty = [];
  const dni = path.join(root, 'src/content/days');
  const utv = path.join(root, 'src/data/utverzhdeno');
  for (const muzei of fs.readdirSync(dni).sort()) {
    const papka = path.join(dni, muzei);
    if (!fs.statSync(papka).isDirectory()) continue;
    for (const f of fs.readdirSync(papka).filter((x) => /^\d\d-\d\d\.json$/.test(x)).sort()) {
      const key = f.slice(0, 5);
      const u = path.join(utv, muzei, f);
      if (fs.existsSync(u)) {
        const d = JSON.parse(fs.readFileSync(u, 'utf8'));
        for (const x of d.fakty || []) {
          fakty.push({ muzei, key, n: x.n, zagolovok: chist(x.zagolovok), text: chist(`${x.zagolovok ?? ''} ${x.podrobnee ?? ''}`) });
        }
        continue;
      }
      const d = JSON.parse(fs.readFileSync(path.join(papka, f), 'utf8'));
      fakty.push({ muzei, key, n: 0, zagolovok: chist(d.title), text: chist(`${d.title ?? ''}. ${d.hook ?? ''} ${d.gist ?? ''}`) });
    }
  }
  return fakty;
}

export function naytiPary(fakty, vFokuse, { kos = 0.45, shin = 0.12, kosImya = 0.2 } = {}) {
  // Подготовка: основы, TF-IDF, шинглы, годы, имена.
  const df = new Map();
  for (const f of fakty) {
    f.sl = slova(f.text);
    f.gody = gody(f.text);
    f.imena = imena(f.text);
    for (const w of new Set(f.sl)) df.set(w, (df.get(w) || 0) + 1);
    f.shingly = new Set();
    for (let i = 0; i + 2 < f.sl.length; i++) f.shingly.add(f.sl.slice(i, i + 3).join(' '));
  }
  const N = fakty.length;
  const index = new Map();
  fakty.forEach((f, i) => {
    const tf = new Map();
    for (const w of f.sl) tf.set(w, (tf.get(w) || 0) + 1);
    f.vec = new Map();
    let norma = 0;
    for (const [w, c] of tf) {
      const v = (1 + Math.log(c)) * Math.log(N / df.get(w));
      f.vec.set(w, v);
      norma += v * v;
    }
    norma = Math.sqrt(norma) || 1;
    for (const [w, v] of f.vec) {
      f.vec.set(w, v / norma);
      if (df.get(w) <= N * 0.05) {
        if (!index.has(w)) index.set(w, []);
        index.get(w).push(i);
      }
    }
  });
  const pary = [];
  fakty.forEach((a, i) => {
    if (!vFokuse(a)) return;
    const skal = new Map();
    for (const [w, v] of a.vec) for (const j of index.get(w) || []) {
      const b = fakty[j];
      if (b.muzei === a.muzei) continue;
      if (vFokuse(b) && j < i) continue; // пара из двух фактов в фокусе — один раз
      skal.set(j, (skal.get(j) || 0) + v * b.vec.get(w));
    }
    for (const [j, c] of skal) {
      const b = fakty[j];
      const obGody = [...a.gody].filter((g) => b.gody.has(g));
      const obImena = [...a.imena].filter((x) => b.imena.has(x));
      let ob = 0;
      for (const s of a.shingly) if (b.shingly.has(s)) ob++;
      const zh = ob ? ob / (a.shingly.size + b.shingly.size - ob) : 0;
      const pochemu = [];
      if (c >= kos) pochemu.push(`текст близок (косинус ${c.toFixed(2)})`);
      if (zh >= shin) pochemu.push(`общие обороты (шинглы ${zh.toFixed(2)})`);
      if (obGody.length && obImena.length && c >= kosImya) pochemu.push(`общий год ${obGody.join(', ')} и имя ${obImena.join(', ')}`);
      if (pochemu.length) pary.push({ a, b, kos: c, zh, gody: obGody, imena: obImena, pochemu });
    }
  });
  pary.sort((x, y) => y.kos + y.zh - (x.kos + x.zh));
  return pary;
}

const kto = (f) => `${f.muzei} ${f.key}${f.n ? ` факт ${f.n}` : ''}`;
const korotko = (s) => (s.length > 140 ? `${s.slice(0, 140)}…` : s);

function main() {
  let muzei = arg('--muzei')?.split(',');
  let mesyac = arg('--mesyac');
  if (!muzei || !mesyac) {
    try {
      const r = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/rabochie-dni.json'), 'utf8'));
      muzei ||= r['музеи'];
      mesyac ||= r['месяц'];
    } catch {}
  }
  const vse = process.argv.includes('--vse');
  const vFokuse = vse ? () => true : (f) => muzei.includes(f.muzei) && f.key.startsWith(`${mesyac}-`);
  const fakty = sobratFakty();
  const pary = naytiPary(fakty, vFokuse);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(pary.map((p) => ({ a: kto(p.a), b: kto(p.b), kos: +p.kos.toFixed(3), shingly: +p.zh.toFixed(3), gody: p.gody, imena: p.imena })), null, 1));
    return;
  }
  const strok = [
    `# Один факт в разных музеях — подсказка (п.82, Р717)`,
    ``,
    `Фокус: ${vse ? 'все музеи целиком' : `${muzei.join(', ')}, месяц ${mesyac}`}. Фактов всего: ${fakty.length}, в фокусе: ${fakty.filter(vFokuse).length}. Пар найдено: ${pary.length}.`,
    `Это подсказка: пару смотрит человек — повтор это или просто общий герой. Ничего не остановлено.`,
    ``,
  ];
  pary.forEach((p, i) => {
    strok.push(`${i + 1}. факт в музее ${kto(p.a)} = факт в музее ${kto(p.b)} — ${p.pochemu.join('; ')}`);
    strok.push(`   - ${p.a.muzei}: ${korotko(p.a.zagolovok || p.a.text)}`);
    strok.push(`   - ${p.b.muzei}: ${korotko(p.b.zagolovok || p.b.text)}`);
  });
  const tekst = strok.join('\n') + '\n';
  const kuda = arg('--otchet');
  if (kuda) {
    fs.writeFileSync(kuda, tekst);
    console.log(`Отчёт: ${kuda} (пар: ${pary.length})`);
  } else process.stdout.write(tekst);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (e) {
    console.log(`Подсказчик не смог отработать: ${e.message}`);
  }
  process.exitCode = 0;
}
