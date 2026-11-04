// Копия утверждённого в сайт (Р506, 04.11.2026): карточки ns-utverzhdeno/ns-ММ-ДД.md и привязка кадров
// ns-material/ММ-ДД.md («Факт к кадру: N») из workspace → src/data/utverzhdeno/ne-sdayutsya/ММ-ДД.json.
// Сборка не видит workspace, поэтому сверщик (scripts/sverka-utverzhdeno.mjs) читает эту копию.
// Порядок фактов на странице («poryadok», 15 номеров: первые 10 — «Десять фактов», дальше «Ещё пять»):
// строка карточки «Порядок на странице: 7, 14, 1–6, 8–13, 15», иначе — из прежней копии, иначе 1…15.
// Проверенные человеком «не повторы» (ne_povtory, см. sverka-utverzhdeno.mjs) тоже берутся из прежней копии.
// Запуск одной командой: node scripts/utverzhdeno-kopiya.mjs [--iz ~/workspace/knowledge] [ММ-ДД …]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const argv = process.argv.slice(2);
const i = argv.indexOf('--iz');
const IZ = i >= 0 ? argv.splice(i, 2)[1] : path.join(os.homedir(), 'workspace/knowledge');
const KUDA = new URL('../src/data/utverzhdeno/ne-sdayutsya/', import.meta.url).pathname;
fs.mkdirSync(KUDA, { recursive: true });

// «7, 14, 1–6, 8» → [7, 14, 1, 2, 3, 4, 5, 6, 8]
export function razobratPoryadok(s) {
  const out = [];
  for (const kusok of s.split(/[,;\s]+/).filter(Boolean)) {
    const m = kusok.match(/^(\d+)(?:[–—-](\d+))?$/);
    if (!m) continue;
    const a = +m[1]; const b = m[2] ? +m[2] : a;
    for (let n = a; n <= b; n++) out.push(n);
  }
  return out;
}

export function razobratKartochku(tekst) {
  const stroki = tekst.split('\n');
  const fakty = [];
  let tek = null; let poryadok = null;
  for (const s of stroki) {
    const m = s.match(/^(\d{1,2})\.\s+(?:\(([^)]*)\)\s+)?(.+)$/);
    if (m) { tek = { n: +m[1], metka: m[2] || '', zagolovok: m[3].trim(), podrobnee: '', istochnik: '' }; fakty.push(tek); continue; }
    const p = s.match(/^Порядок на странице:\s*(.+)$/);
    if (p) { poryadok = razobratPoryadok(p[1]); continue; }
    if (!tek) continue;
    if (s.startsWith('Подробнее:')) tek.podrobnee = s.slice(10).trim();
    else if (s.startsWith('Источник:')) tek.istochnik = s.slice(9).trim();
  }
  return { zagolovok: stroki[0].trim(), fakty, poryadok };
}

export function razobratMaterial(tekst) {
  const kadry = [];
  let tek = null;
  for (const s of tekst.split('\n')) {
    const k = s.match(/^Кадр (\d+)\b/);
    if (k) { tek = { n: +k[1], fajl: '', gk: '', fakt: null, takzhe: [] }; kadry.push(tek); continue; }
    if (!tek) continue;
    if (s.startsWith('Файл:')) tek.fajl = s.slice(5).trim().replace(/\s*\(\d+×\d+\)\s*$/, '');
    else if (s.startsWith('Источник:')) { const g = s.match(/goskatalog\.ru\/portal\/#\/collections\?id=(\d+)/); if (g) tek.gk = g[1]; }
    else if (s.startsWith('Факт к кадру:')) {
      const ch = (s.slice(13).match(/\d+/g) || []).map(Number);
      tek.fakt = ch[0] ?? null; tek.takzhe = ch.slice(1);
    }
  }
  return kadry.filter((x) => x.fajl);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = path.join(IZ, 'ns-utverzhdeno');
  const dni = argv.length ? argv : fs.readdirSync(dir).map((f) => f.match(/^ns-(\d\d-\d\d)\.md$/)?.[1]).filter(Boolean).sort();
  let n = 0;
  for (const key of dni) {
    const k = razobratKartochku(fs.readFileSync(path.join(dir, `ns-${key}.md`), 'utf8'));
    if (k.fakty.length !== 15) { console.log(`::error::utverzhdeno-kopiya: ${key} — в карточке ${k.fakty.length} фактов, ждали 15`); process.exitCode = 1; continue; }
    const mf = path.join(IZ, 'ns-material', `${key}.md`);
    const kadry = fs.existsSync(mf) ? razobratMaterial(fs.readFileSync(mf, 'utf8')).filter((x) => x.fakt) : [];
    const staryj = path.join(KUDA, `${key}.json`);
    const prezhnij = fs.existsSync(staryj) ? JSON.parse(fs.readFileSync(staryj, 'utf8')) : {};
    const poryadok = k.poryadok || prezhnij.poryadok || k.fakty.map((f) => f.n);
    const zapis = { key, zagolovok: k.zagolovok, poryadok, fakty: k.fakty, kadry,
      ...(prezhnij.ne_povtory ? { ne_povtory: prezhnij.ne_povtory } : {}),
      iz: { kartochka: `knowledge/ns-utverzhdeno/ns-${key}.md`, material: kadry.length ? `knowledge/ns-material/${key}.md` : null } };
    fs.writeFileSync(staryj, `${JSON.stringify(zapis, null, 1)}\n`);
    n++;
  }
  console.log(`utverzhdeno-kopiya: записано ${n} дней в src/data/utverzhdeno/ne-sdayutsya/`);
}
