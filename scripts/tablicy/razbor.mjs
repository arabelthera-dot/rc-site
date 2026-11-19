// Единый разборщик утверждённых таблиц календаря (вместо 8 gen-calendar.py, опись 19.10).
// Адаптер музея — только конфиг в adaptery.json: файлы, колонки по заголовку; особый — ne-sdayutsya (блоки).
// Режим: node scripts/tablicy/razbor.mjs --sverka — таблица против записей src/content/days; только отчёт,
// записи не пишет, выход всегда 0 (заявку роняют только сборка и битые ссылки).
// --zapis [slug] — в существующих записях меняет только hook на старшую версию таблицы (norm расходится);
// хук таблицы «—»/пусто не трогает, новых файлов не создаёт, остальные поля и формат (indent 2 + \n) — как были.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseMonth } from './bloki.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DAYS = process.env.DAYS || path.join(HERE, '../../src/content/days');
const ADAPTERY = JSON.parse(fs.readFileSync(path.join(HERE, 'adaptery.json'), 'utf8'));
const MON = { 'янв': 1, 'фев': 2, 'мар': 3, 'апр': 4, 'мая': 5, 'май': 5, 'июн': 6, 'июл': 7, 'авг': 8, 'сен': 9,
  'окт': 10, 'ноя': 11, 'дек': 12 };
const pad = (n) => String(n).padStart(2, '0');
// 365 ключей года 2027 (не високосный): 01-01 … 12-31.
export const ALL = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(Date.UTC(2027, 0, 1 + i)); return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
});

// «1 янв», «✓ 12 мая», «**3 фев**» → 01-01 / 05-12 / 02-03; не дата → null.
export function parseDate(cell) {
  const m = String(cell ?? '').replace(/\*\*/g, '').trim().match(/^(?:✓\s*)?(\d{1,2})\s+([а-я]{3})/);
  return m && MON[m[2]] ? `${pad(MON[m[2]])}-${pad(Number(m[1]))}` : null;
}

// Нормализация для сравнения: жирный/теги, пометка «(NNN)» в конце, кавычки, ё, неразрывный пробел, пробелы, точка в конце.
export function norm(s) {
  let t = String(s ?? '').replace(/\*\*|<[^>]+>/g, '').trim().replace(/\s*\(\d+\)\s*$/, '');
  t = t.replace(/[«»"“”„'’‘]/g, '').replace(/ё/g, 'е').replace(/Ё/g, 'Е').replace(/ /g, ' ');
  return t.replace(/\s+/g, ' ').trim().replace(/\.+$/, '').trim();
}

// papka — путь от корня сайта (таблицы лежат в data/tablicy/, ядро шаг 2); ~ — домашняя папка.
const home = (p) => /^~(?=\/|$)/.test(p) ? p.replace(/^~/, os.homedir()) : path.resolve(HERE, '../..', p);
const maskRe = (m) => new RegExp('^' + m.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');

// Файлы адаптера в порядке старшинства: группы fayly по очереди, внутри — по rang, затем по имени.
function files(a) {
  const dir = home(a.papka);
  if (!fs.existsSync(dir)) return null;
  const names = fs.readdirSync(dir);
  const rank = (b) => (a.rang ?? []).map((r) => { const k = Object.keys(r).find((s) => b.includes(s)); return k === undefined ? 0 : r[k]; });
  const cmp = (x, y) => { const rx = rank(x), ry = rank(y);
    for (let i = 0; i < rx.length; i++) if (rx[i] !== ry[i]) return rx[i] - ry[i];
    return x < y ? -1 : x > y ? 1 : 0; };
  const out = [];
  for (const group of a.fayly) {
    const res = group.map(maskRe);
    out.push(...names.filter((n) => res.some((r) => r.test(n)) && !out.includes(path.join(dir, n))).sort(cmp).map((n) => path.join(dir, n)));
  }
  return out;
}

// md-таблица: строка заголовка начинается с колонки data; колонки ищутся по началу заголовка.
// Таблица кончается непустой строкой не-таблицы; пустая строка таблицу не обрывает.
// mesyac — карта «начало имени файла → месяц»: тогда в колонке даты номер дня (pervoprohodcy, «| 1 |»).
export function parseTable(file, kolonki, mesyac) {
  const out = [];
  const base = path.basename(file);
  const mo = mesyac ? Object.entries(mesyac).find(([k]) => base.startsWith(k))?.[1] : null;
  if (mesyac && !mo) return out;
  let col = null;
  for (const ln of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!ln.startsWith('|')) { if (ln.trim() !== '') col = null; continue; }
    const cells = ln.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (cells[0]?.startsWith(kolonki.data)) {
      col = Object.fromEntries(Object.entries(kolonki).map(([k, h]) => [k, cells.findIndex((c) => c.startsWith(h))]));
      if (col.hook < 0) col = null;
      continue;
    }
    if (!col || col.hook >= cells.length) continue;
    const nd = mo && cells[0].replace(/\*\*/g, '').trim().match(/^(\d{1,2})$/);
    const key = mo ? (nd ? `${pad(mo)}-${pad(Number(nd[1]))}` : null) : parseDate(cells[0]);
    if (!key) continue;
    const u = { key };
    for (const [k, i] of Object.entries(col)) if (k !== 'data' && i >= 0) u[k] = cells[i];
    out.push(u);
  }
  return out;
}

// Блоки ne-sdayutsya: месяц — из имени calendar-ММ-*.md, день — номер блока «## День N».
// Хук берётся как есть после **Хук:** (parseMonth требует «…» целиком — здесь сырой текст для сверки).
function parseBloki(file) {
  const mo = Number(path.basename(file).slice(9, 11));
  const raw = {}; let n = 0;
  for (const ln of fs.readFileSync(file, 'utf8').split('\n')) {
    if (ln.startsWith('## День')) n++;
    const m = ln.match(/^\*\*Хук:\*\*\s*(.*)/);
    if (m && n) raw[n] ??= m[1];
  }
  return parseMonth(file).map((u, i) => ({ key: `${pad(mo)}-${pad(u.day)}`, nazvanie: u.title,
    hook: raw[i + 1] ?? u.hook, mehanika: u.mechanic }));
}

// Заголовки «## 1 января · Название» / «### Название» / «**Крючок:** …» или «**Хук.** …» в несколько строк
// (karikatura: january-31-na-utverzhdenie.md — утверждён, «да» Сергея 04.09: «по карикатуре утверждаю все 12»).
const ROD = { 'января': 1, 'февраля': 2, 'марта': 3, 'апреля': 4, 'мая': 5, 'июня': 6, 'июля': 7, 'августа': 8,
  'сентября': 9, 'октября': 10, 'ноября': 11, 'декабря': 12 };
function parseZagolovki(file) {
  const out = []; let u = null, inHook = false;
  for (const ln of fs.readFileSync(file, 'utf8').split('\n')) {
    const h = ln.match(/^##\s+(\d{1,2})\s+([а-я]+)/);
    if (h && ROD[h[2]]) { u = { key: `${pad(ROD[h[2]])}-${pad(Number(h[1]))}` }; out.push(u); inHook = false;
      const z = ln.match(/·\s*(.+)$/); if (z) u.nazvanie = z[1].trim(); continue; }
    if (!u) continue;
    if (inHook) { if (ln.trim() && !ln.startsWith('**')) { u.hook += ' ' + ln.trim(); continue; } inHook = false; }
    const t = ln.match(/^###\s+(.+)/); if (t) { u.nazvanie = t[1].trim(); continue; }
    const k = ln.match(/^\*\*(?:Крючок:|Хук[.:])\*\*\s*(.*)/); if (k && u.hook === undefined) { u.hook = k[1].trim(); inHook = true; }
  }
  for (const x of out) x.hook = String(x.hook ?? '').replace(/\s+/g, ' ').trim();
  return out;
}

// Утверждённое по музею: ключ → [{file, …поля}] по возрастанию старшинства; null — таблиц нет на диске.
export function approved(slug) {
  const a = ADAPTERY[slug];
  if (!a || a === 'todo') return null;
  const fs_ = files(a);
  if (!fs_ || !fs_.length) return null;
  const c = {};
  for (const f of fs_) {
    const units = a.tip === 'bloki' ? parseBloki(f) : /\.md$/.test(f) && (a.zagolovki ?? []).includes(path.basename(f)) ? parseZagolovki(f)
      : parseTable(f, a.kolonki, a.mesyac_iz_imeni);
    for (const u of units) (c[u.key] ??= []).push({ file: path.basename(f), ...u });
  }
  return c;
}

function sverka() {
  console.log('музей: дат в таблице / совпало / (из них = старой версии) / хук расходится / нет записи / нет в таблице');
  for (const slug of Object.keys(ADAPTERY).filter((k) => !k.startsWith('_'))) {
    if (ADAPTERY[slug] === 'todo') { console.log(`${slug}: todo — адаптер не описан, пропуск`); continue; }
    const ap = approved(slug);
    if (!ap) { console.log(`${slug}: таблиц нет на диске (${home(ADAPTERY[slug].papka)}), пропуск`); continue; }
    const dir = path.join(DAYS, slug);
    const recs = {};
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')))
      recs[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    let ok = 0, old = 0; const diff = [], noRec = [], noTab = [], pusto = [];
    for (const k of ALL) {
      if (!ap[k]) { if (recs[k]) noTab.push(k); continue; }
      if (!recs[k]) { noRec.push(k); continue; }
      const rh = norm(recs[k].hook), v = ap[k], top = v[v.length - 1];
      // «—» в колонке хука — день оставлен пустым по утверждённой таблице (kalendar-pobed 22 июня): запись свободна.
      if (/^[—–-]?$/.test(norm(top.hook))) { ok++; pusto.push(k); continue; }
      if (rh === norm(top.hook)) { ok++; continue; }
      if (v.some((x) => norm(x.hook) === rh)) { ok++; old++; continue; }
      diff.push({ k, file: top.file, tab: top.hook, rec: recs[k].hook });
    }
    console.log(`${slug}: ${Object.keys(ap).length} / ${ok} / (${old}) / ${diff.length} / ${noRec.length} / ${noTab.length}`);
    for (const d of diff) console.log(`  ≠ ${d.k} [${d.file}]\n    табл: ${d.tab}\n    запись: ${d.rec}`);
    if (noRec.length) console.log(`  нет записи: ${noRec.join(', ')}`);
    if (noTab.length) console.log(`  нет в таблице: ${noTab.join(', ')}`);
    if (pusto.length) console.log(`  пустой день по таблице (совпало): ${pusto.join(', ')}`);
  }
}

function zapis(only) {
  for (const slug of Object.keys(ADAPTERY).filter((k) => !k.startsWith('_') && (!only || k === only))) {
    const ap = ADAPTERY[slug] === 'todo' ? null : approved(slug);
    if (!ap) { console.log(`${slug}: таблиц нет или todo, пропуск`); continue; }
    const dir = path.join(DAYS, slug); let n = 0;
    for (const k of ALL) {
      const f = path.join(dir, `${k}.json`), v = ap[k];
      if (!v || !fs.existsSync(f)) continue;
      const h = String(v[v.length - 1].hook ?? '').replace(/\*\*|<[^>]+>/g, '').trim();
      if (!h || /^[—–-]+$/.test(h)) continue;
      const rec = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (norm(rec.hook) === norm(h)) continue;
      rec.hook = h; fs.writeFileSync(f, JSON.stringify(rec, null, 2) + '\n'); n++;
    }
    console.log(`${slug}: изменено ${n}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const zi = process.argv.indexOf('--zapis');
  if (process.argv.includes('--sverka')) sverka();
  else if (zi > 0) zapis(process.argv[zi + 1]?.startsWith('--') ? undefined : process.argv[zi + 1]);
  else console.log('Запуск: node scripts/tablicy/razbor.mjs --sverka | --zapis [slug]   (отчёт / хуки записей по старшей версии)');
  process.exitCode = 0;
}
