// Копия утверждённого в сайт (Р506, Р511 — любой музей, 04.11.2026): карточка дня и привязка кадров («Факт к кадру: N»)
// из workspace → src/data/utverzhdeno/<музей>/ММ-ДД.json. Сборка не видит workspace, поэтому сверщик
// (scripts/sverka-utverzhdeno.mjs) читает эту копию. Где карточки (стандарт — knowledge/utverzhdeno/README.md):
//  — knowledge/utverzhdeno/<музей>/ММ-ДД.md; кадры — там же ММ-ДД.kadry.md или раздел «КАДРЫ» в самой карточке;
//  — «Русские не сдаются» по-старому: ns-utverzhdeno/ns-ММ-ДД.md и ns-material/ММ-ДД.md (utverzhdeno/ne-sdayutsya/ главнее).
// Порядок фактов на странице («poryadok»): строка карточки «Порядок на странице: 7, 14, 1–6, 8–13, 15»,
// иначе — из прежней копии, иначе по номерам. Фактов — сколько утвердил Сергей (Р510: меньше можно, 15 не обязательно);
// «Порядок» обязан назвать ровно те номера, что есть в карточке, — иначе копия не пишется.
// Проверенные человеком «не повторы» (ne_povtory, см. sverka-utverzhdeno.mjs) тоже берутся из прежней копии.
// Строка «Источник:» факта в копию не идёт: сверщику она не нужна, а её адреса в src/data ловит storozh-ssylok.
// Запуск: node scripts/utverzhdeno-kopiya.mjs [--muzey X] [--iz ~/workspace/knowledge] [ММ-ДД …]
//   без --muzey — все музеи, у которых в workspace есть карточки; музей без карточек — строка отчёта, не ошибка.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const argv = process.argv.slice(2);
const i = argv.indexOf('--iz');
const IZ = i >= 0 ? argv.splice(i, 2)[1] : path.join(os.homedir(), 'workspace/knowledge');
const j = argv.indexOf('--muzey');
const MUZEY = j >= 0 ? argv.splice(j, 2)[1] : null;
const KUDA = (muzey) => new URL(`../src/data/utverzhdeno/${muzey}/`, import.meta.url).pathname;

// Где карточки музея: { dni: [ММ-ДД], kartochka(key), material(key) } — пути от IZ или null, если карточек нет.
export function istochnikiMuzeya(muzey, iz = IZ) {
  const nov = path.join(iz, 'utverzhdeno', muzey);
  const est = (p) => fs.existsSync(p);
  const iz1 = est(nov) ? fs.readdirSync(nov).map((f) => f.match(/^(\d\d-\d\d)\.md$/)?.[1]).filter(Boolean) : [];
  const ns = muzey === 'ne-sdayutsya' && est(path.join(iz, 'ns-utverzhdeno'))
    ? fs.readdirSync(path.join(iz, 'ns-utverzhdeno')).map((f) => f.match(/^ns-(\d\d-\d\d)\.md$/)?.[1]).filter(Boolean) : [];
  const dni = [...new Set([...iz1, ...ns])].sort();
  if (!dni.length) return null;
  const kartochka = (key) => (iz1.includes(key) ? `utverzhdeno/${muzey}/${key}.md` : ns.includes(key) ? `ns-utverzhdeno/ns-${key}.md` : null);
  const material = (key) => [`utverzhdeno/${muzey}/${key}.kadry.md`, ...(muzey === 'ne-sdayutsya' ? [`ns-material/${key}.md`] : [])]
    .find((p) => est(path.join(iz, p))) || null;
  return { dni, kartochka, material };
}

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

// Раздел «КАДРЫ» карточки — привязка кадров, не факты.
const doKadrov = (tekst) => tekst.split(/^КАДРЫ\s*$/m)[0];
const razdelKadrov = (tekst) => tekst.split(/^КАДРЫ\s*$/m)[1] || '';

export function razobratKartochku(tekst) {
  const stroki = doKadrov(tekst).split('\n');
  const fakty = [];  // { n, metka, zagolovok, podrobnee }
  let tek = null; let poryadok = null;
  for (const s of stroki) {
    const m = s.match(/^(\d{1,2})\.\s+(?:\(([^)]*)\)\s+)?(.+)$/);
    if (m) { tek = { n: +m[1], metka: m[2] || '', zagolovok: m[3].trim(), podrobnee: '' }; fakty.push(tek); continue; }
    const p = s.match(/^Порядок на странице:\s*(.+)$/);
    if (p) { poryadok = razobratPoryadok(p[1]); continue; }
    if (!tek) continue;
    if (s.startsWith('Подробнее:')) tek.podrobnee = s.slice(10).trim();
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

export function kopiyaMuzeya(muzey, dniArg = [], iz = IZ) {
  const ist = istochnikiMuzeya(muzey, iz);
  if (!ist) return { muzey, n: 0, net: true };
  const kuda = KUDA(muzey);
  fs.mkdirSync(kuda, { recursive: true });
  const dni = dniArg.length ? dniArg : ist.dni;
  let n = 0; let osh = 0;
  for (const key of dni) {
    const kp = ist.kartochka(key);
    if (!kp) { console.log(`::error::utverzhdeno-kopiya: ${muzey} ${key} — карточки нет`); osh++; continue; }
    const tekst = fs.readFileSync(path.join(iz, kp), 'utf8');
    const k = razobratKartochku(tekst);
    if (!k.fakty.length) { console.log(`::error::utverzhdeno-kopiya: ${muzey} ${key} — в карточке не нашлось ни одного факта «N. (метка) текст»`); osh++; continue; }
    const mp = ist.material(key);
    const kadryTekst = mp ? fs.readFileSync(path.join(iz, mp), 'utf8') : razdelKadrov(tekst);
    const kadry = razobratMaterial(kadryTekst).filter((x) => x.fakt);
    const staryj = path.join(kuda, `${key}.json`);
    const prezhnij = fs.existsSync(staryj) ? JSON.parse(fs.readFileSync(staryj, 'utf8')) : {};
    const nomera = k.fakty.map((f) => f.n);
    const poryadok = [k.poryadok, prezhnij.poryadok].find((p) => p && p.length === nomera.length
      && [...p].sort((a, b) => a - b).join() === [...nomera].sort((a, b) => a - b).join()) || (k.poryadok ? null : nomera);
    if (!poryadok) { console.log(`::error::utverzhdeno-kopiya: ${muzey} ${key} — «Порядок на странице» (${k.poryadok.join(', ')}) не совпадает с номерами фактов карточки (${nomera.join(', ')})`); osh++; continue; }
    const zapis = { key, zagolovok: k.zagolovok, poryadok, fakty: k.fakty, kadry,
      ...(prezhnij.ne_povtory ? { ne_povtory: prezhnij.ne_povtory } : {}),
      iz: { kartochka: `knowledge/${kp}`, material: kadry.length ? (mp ? `knowledge/${mp}` : `knowledge/${kp}#КАДРЫ`) : null } };
    fs.writeFileSync(staryj, `${JSON.stringify(zapis, null, 1)}\n`);
    n++;
  }
  return { muzey, n, osh };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const vse = fs.readdirSync(new URL('../src/data/', import.meta.url).pathname)
    .map((f) => f.match(/^calendar-meta-(.+)\.json$/)?.[1]).filter(Boolean).sort();
  for (const muzey of MUZEY ? [MUZEY] : vse) {
    const r = kopiyaMuzeya(muzey, argv);
    if (r.osh) process.exitCode = 1;
    console.log(r.net ? `utverzhdeno-kopiya: ${muzey} — карточек нет, копировать нечего`
      : `utverzhdeno-kopiya: ${muzey} — записано ${r.n} дней в src/data/utverzhdeno/${muzey}/`);
  }
}
