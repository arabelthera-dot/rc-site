#!/usr/bin/env node
// Права на кадры по ведомостям public/**/rights.json. Перенос режима проверки
// russian-civilization/tools/audit-prava.py (не `vzyat`; план 18.10, шаг 3).
// У каждой записи-картинки ведомости должны быть непустые источник и лицензия (основание).
//   источник — одно из: source, source_url, url, holder (адрес карточки кадра или держатель);
//   лицензия — одно из: license, osnovanie, basis.
// Красное — пустое/отсутствующее поле, запись без имени файла, нечитаемый JSON.
// Предупреждение (не красное) — файл кадра, на который ссылается запись, не найден рядом с ведомостью.
// Запуск: node scripts/prava.mjs [папка]   (по умолчанию public/)
// Выход: 0 — чисто, 1 — нарушения. В proverka.yml не подключён.
//
// Е1/Е2 (Сергей 20.10.2026, Р47) — разбор в src/lib/zakon.mjs, при сборке его зовёт src/integrations/zakon.mjs:
//   node scripts/prava.mjs --reestry   — обновить снимки реестров Минюста в data/reestry/*.json
//                                        (прокси — переменная RF_PROXY=socks5h://хост:порт; раз в неделю —
//                                        задание reestry в glazami-hrapovik.yml);
//   node scripts/prava.mjs --zakon     — сверка текстов с реестрами (то же, что при сборке);
//   node scripts/prava.mjs --xx        — кадры XX века без основания, списком.
import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import net from 'node:net';
import tls from 'node:tls';
import https from 'node:https';
import { norm, sverkaReestrov, kadryXX } from '../src/lib/zakon.mjs';

const rezhim = ['--reestry', '--zakon', '--xx'].find((f) => process.argv.includes(f));

const SOURCE_KEYS = ['source', 'source_url', 'url', 'holder'];
const LICENSE_KEYS = ['license', 'osnovanie', 'basis'];
const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile() && e.name === 'rights.json') yield p;
  }
}

const filled = (o, keys) => keys.some((k) => typeof o[k] === 'string' ? o[k].trim() : o[k] != null && o[k] !== '');

if (!rezhim) {
  const root = process.argv[2] || 'public';
  const red = [];
  const warn = [];
  let ledgers = 0, kadrov = 0;
  for (const f of walk(root)) {
    ledgers++;
    const name = relative('.', f);
    let data;
    try { data = JSON.parse(readFileSync(f, 'utf8')); } catch (e) { red.push(`${name}: не JSON (${e.message})`); continue; }
    const items = Array.isArray(data) ? data : Array.isArray(data?.files) ? data.files : null;
    if (!items) { red.push(`${name}: нет списка записей (массив или files[])`); continue; }
    items.forEach((it, i) => {
      const file = it?.file || it?.local_path;
      const id = file || it?.id || `#${i}`;
      if (!file || !IMG_RE.test(file)) { red.push(`${name} [${id}]: нет имени файла картинки (file)`); return; }
      kadrov++;
      if (!filled(it, SOURCE_KEYS)) red.push(`${name} [${id}]: нет источника (${SOURCE_KEYS.join('/')})`);
      if (!filled(it, LICENSE_KEYS)) red.push(`${name} [${id}]: нет лицензии (${LICENSE_KEYS.join('/')})`);
      if (!existsSync(join(dirname(f), file))) warn.push(`${name} [${id}]: файл не найден рядом с ведомостью`);
    });
  }
  for (const r of red) console.log('✗ ' + r);
  for (const w of warn) console.log('? ' + w);
  console.log(`prava: ведомостей ${ledgers}, кадров ${kadrov}, красных ${red.length}, предупреждений ${warn.length}`);
  process.exit(red.length ? 1 : 0);
}

// ---- Е1: сверка и отчёты -------------------------------------------------------------------------------

function otchetZakon() {
  const r = sverkaReestrov();
  for (const s of r.sovpadeniya) console.log(`✗ ${s.gde}: «${s.imya}» — ${s.reestr} (вариант «${s.variant}»)`);
  if (process.argv.includes('--vse')) for (const s of r.vozmozhnye) console.log(`? ${s.gde}: «${s.imya}» — ${s.reestr} (вариант «${s.variant}»)`);
  for (const s of r.starye) console.log('? ' + s);
  console.log(`zakon: снимков ${r.snimkov}, записей ${r.zapisey}, совпадений ${r.sovpadeniya.length}, возможных (однофамильцы, короткие названия — проверить человеку; --vse — списком) ${r.vozmozhnye.length}`);
  return r.sovpadeniya.length ? 1 : 0;
}

function otchetXX() {
  const r = kadryXX();
  const po = (list) => Object.entries(list.reduce((a, k) => ((a[k.museum] = (a[k.museum] || 0) + 1), a), {})).map(([m, n]) => `${m} ${n}`).join(', ');
  for (const k of r.bez) console.log(`✗ ${k.museum}/${k.key} ${k.gde}: ${k.src} — «${k.podpis}»`);
  const izPodpisi = r.kadry.filter((k) => k.otkuda === 'подпись').length;
  console.log(`prava XX: кадров XX века ${r.vsego}, основание из подписи ${izPodpisi}, из ведомости ${r.kadry.filter((k) => k.otkuda === 'ведомость').length}, без основания ${r.bez.length}${r.bez.length ? ' — ' + po(r.bez) : ''}`);
  return r.bez.length ? 1 : 0;
}

// ---- Е1: загрузка реестров Минюста -----------------------------------------------------------------------
// Источники — официальные: reestrs.minjust.gov.ru (машинный интерфейс страниц реестров minjust.gov.ru) и выгрузка
// перечня экстремистских материалов minjust.gov.ru/ru/extremist-materials/. В снимок идёт только имя, варианты для
// сверки и дата включения — ИНН, СНИЛС, адреса и счета из реестра не храним. Исключённые из реестра — не берём.
// У reestrs.minjust.gov.ru сертификат НУЦ Минцифры (Russian Trusted Root CA), которого нет в Node, — проверку
// цепочки там не делаем; от подмены страхует порог: новый снимок меньше 80% прежнего не записывается.

const REESTRY_API = 'https://reestrs.minjust.gov.ru/rest/registry/';
const REESTRY = [
  { fayl: 'inoagenty.json', id: '39b95df9-9a68-6b6d-e1e3-e6388507067e', reestr: 'Реестр иностранных агентов (Минюст России)',
    istochnik: 'https://minjust.gov.ru/ru/pages/reestr-inostryannykh-agentov/',
    zapis: (v) => (v.field_5_dt ? null : { imya: v.field_2_s, vklyuchen: v.field_4_dt || v.field_4_s, lico: v.field_7_s === 'Физические лица' }) },
  { fayl: 'nezhelatelnye.json', id: 'c2d1692e-a9f6-5a79-13ee-5da5b42980df', reestr: 'Перечень нежелательных организаций (Минюст России)',
    istochnik: 'https://minjust.gov.ru/ru/documents/7756/',
    zapis: (v) => (v.field_7_dt || (v.field_10_s && v.field_10_s !== 'Включена') ? null : { imya: v.field_5_s, vklyuchen: v.field_2_s }) },
  { fayl: 'ekstremistskie-organizacii.json', id: '59961ebb-9f0e-d885-7ebc-b90399923b03', reestr: 'Перечень экстремистских организаций (Минюст России)',
    istochnik: 'https://minjust.gov.ru/ru/documents/7822/', zapis: (v) => ({ imya: v.field_2_s, vklyuchen: v.field_6_s || v.field_6_dt }) },
];
const MATERIALY = { fayl: 'ekstremistskie-materialy.json', vid: 'materialy', reestr: 'Федеральный список экстремистских материалов (Минюст России)',
  istochnik: 'https://minjust.gov.ru/ru/extremist-materials/', csv: 'https://minjust.gov.ru/uploaded/files/exportfsm.csv' };

// SOCKS5 без зависимостей: RF_PROXY=socks5h://хост:порт — имя сайта разрешает прокси (российский выход).
function socksConnect(host, port, proxy) {
  return new Promise((ok, fail) => {
    const s = net.connect(+proxy.port || 1080, proxy.hostname);
    const hb = Buffer.from(host);
    const steps = [Buffer.from([5, 1, 0]), Buffer.concat([Buffer.from([5, 1, 0, 3, hb.length]), hb, Buffer.from([port >> 8, port & 255])])];
    let step = 0;
    s.once('error', fail);
    s.on('data', function on(d) {
      if (d[0] !== 5 || d[1] !== 0) { s.destroy(); return fail(new Error(`SOCKS5: отказ ${d[1]}`)); }
      if (++step < 2) return s.write(steps[1]);
      s.off('data', on); ok(s);
    });
    s.write(steps[0]);
  });
}

async function zapros(url, { body, kodirovka = 'utf8' } = {}) {
  const u = new URL(url);
  const proxy = process.env.RF_PROXY ? new URL(process.env.RF_PROXY) : null;
  const headers = { 'User-Agent': 'Mozilla/5.0 (rc-site prava.mjs)', 'Accept-Language': 'ru', Referer: MATERIALY.istochnik };
  if (body) Object.assign(headers, { 'Content-Type': 'application/json' });
  const raw = proxy ? await socksConnect(u.hostname, 443, proxy) : null;
  return new Promise((ok, fail) => {
    const req = https.request({ host: u.hostname, path: u.pathname + u.search, method: body ? 'POST' : 'GET', headers, timeout: 120000,
      rejectUnauthorized: u.hostname !== 'reestrs.minjust.gov.ru',
      ...(raw && { createConnection: (o) => tls.connect({ socket: raw, servername: u.hostname, rejectUnauthorized: o.rejectUnauthorized }) }) }, (res) => {
      const parts = [];
      res.on('data', (c) => parts.push(c));
      res.on('end', () => (res.statusCode === 200 ? ok(new TextDecoder(kodirovka).decode(Buffer.concat(parts))) : fail(new Error(`${url}: ${res.statusCode}`))));
    });
    req.on('timeout', () => req.destroy(new Error(`${url}: время вышло`)));
    req.on('error', fail);
    req.end(body ? JSON.stringify(body) : undefined);
  });
}

async function triRaza(fn, chto) {
  for (let i = 1; ; i++) {
    try { return await fn(); } catch (e) {
      console.log(`? ${chto}: попытка ${i} — ${e.message}`);
      if (i >= 3) throw e;
      await new Promise((r) => setTimeout(r, 5000 * i));
    }
  }
}

const slov = (t) => t.split(' ').filter(Boolean);
const kavychki = (s) => [...s.matchAll(/[«"„“]+([^«»"„“”]{2,}?)[»"“”]+/g)].map((m) => m[1]);
// Названия в кавычках: из двух и больше слов — фразой; из одного — только в кавычках и у нас (иначе «Мемориал»
// ловил бы каждый мемориал); служебные названия соцсетей — не названия материалов.
const SLUZHEBNOE = /^(в контакте|вконтакте|vk|youtube|ютуб|facebook|фейсбук|instagram|инстаграм|одноклассники|telegram|телеграм|twitter|твиттер|tiktok|тик ток|livejournal|живой журнал|ok ru)$/;
// Название в кавычках у Минюста ищем у нас тоже только в кавычках («Мемориал», а не каждый мемориал);
// полное название без кавычек и латинское — фразой.
function nazvanie(t, out, { vKavychkah = true } = {}) {
  const n = norm(t);
  if (!n || SLUZHEBNOE.test(n) || n.length < 4) return;
  out.push(vKavychkah ? { tekst: n, kavychki: true } : { tekst: n });
}
function variantyLica(fio) {
  const w = slov(norm(fio));
  if (w.length < 2 || w.length > 4) return [];
  const [f, i, o] = w;
  const v = [`${i} ${f}`, `${f} ${i}`];
  if (o) v.push(`${i} ${o} ${f}`, `${f} ${i} ${o}`, `${i[0]} ${o[0]} ${f}`, `${f} ${i[0]} ${o[0]}`);
  return v.map((tekst) => ({ tekst, slovoforma: true }));
}
function varianty(z) {
  const out = [];
  const imya = String(z.imya || '');
  for (const q of kavychki(imya)) nazvanie(q, out);
  for (const p of imya.match(/\(([^()]+)\)/g) || []) {
    const t = p.slice(1, -1);
    if (z.lico) t.split(/[;,]/).forEach((x) => out.push(...variantyLica(x.replace(/[«"][^»"]*[»"]/g, ''))));
    else if (/[A-Za-z]/.test(t) && slov(norm(t)).length >= 2) nazvanie(t, out, { vKavychkah: false });
  }
  const osnova = imya.replace(/\([^()]*\)/g, ' ').replace(/[«"„][^»"“]*[»"“]/g, ' ');
  if (z.lico) out.push(...variantyLica(osnova));
  else if (!kavychki(imya).length && slov(norm(osnova)).length >= 2) nazvanie(osnova, out, { vKavychkah: false });
  const seen = new Set();
  return out.filter((v) => !seen.has(v.tekst + v.kavychki) && seen.add(v.tekst + v.kavychki));
}
function variantyMateriala(t) {
  const out = [];
  for (const q of kavychki(t.replace(/""/g, '"'))) { const n = norm(q); if (slov(n).length >= 2 && n.length >= 10 && !SLUZHEBNOE.test(n)) out.push({ tekst: n }); }
  // Адреса: только с путём (vk.com/имя), голый домен соцсети — не материал.
  // Путь — значимый: не короче 5 знаков и не служебный хвост (watch?v=, id, groups), иначе ловит любую ссылку на видео.
  for (const m of t.matchAll(/(?:https?:\/\/)?(?:www\.)?((?:[a-z0-9-]+\.)+[a-z]{2,})\/([^\s«»"(),;]{3,})/gi)) {
    const put = m[2].replace(/[.\/=?&#-]+$/, '');
    if (put.length >= 5 && !/^(watch(\?v)?|search|groups?|id|channel|user|c|club|public|wall|video)$/i.test(put))
      out.push({ tekst: `${m[1]}/${put}`.toLowerCase(), adres: true });
  }
  return out;
}

async function obnovitReestry() {
  const dir = 'data/reestry';
  mkdirSync(dir, { recursive: true });
  const data_snimka = new Date().toISOString().slice(0, 10);
  let oshibok = 0;
  const zapisat = (meta, zapisi) => {
    const f = join(dir, meta.fayl);
    const bylo = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')).zapisi?.length || 0 : 0;
    if (zapisi.length < bylo * 0.8) { console.log(`✗ ${meta.fayl}: записей ${zapisi.length} против ${bylo} — меньше 80%, снимок не трогаю`); oshibok++; return; }
    writeFileSync(f, JSON.stringify({ reestr: meta.reestr, ...(meta.vid && { vid: meta.vid }), istochnik: meta.istochnik, data_snimka, vsego: zapisi.length, zapisi }, null, 1) + '\n');
    console.log(`✓ ${meta.fayl}: ${zapisi.length} записей`);
  };
  for (const r of REESTRY) {
    try {
      const vse = [];
      for (let offset = 0; ; offset += 500) {
        const otv = JSON.parse(await triRaza(() => zapros(`${REESTRY_API}${r.id}/values`, { body: { offset, limit: 500 } }), r.fayl));
        vse.push(...otv.values);
        if (!otv.values.length || vse.length >= otv.size) break;
      }
      zapisat(r, vse.map(r.zapis).filter(Boolean).map((z) => ({ imya: z.imya.trim(), vklyuchen: z.vklyuchen || '', varianty: varianty(z) }))
        .filter((z) => z.varianty.length));
    } catch (e) { console.log(`✗ ${r.fayl}: ${e.message}`); oshibok++; }
  }
  try {
    const csv = await triRaza(() => zapros(MATERIALY.csv, { kodirovka: 'windows-1251' }), MATERIALY.fayl);
    const zapisi = [];
    for (const m of csv.matchAll(/^(\d+);"([\s\S]*?)";([^\r\n]*)$/gm)) {
      const v = variantyMateriala(m[2]);
      if (v.length) zapisi.push({ imya: `№ ${m[1]}: ${m[2].replace(/""/g, '"').slice(0, 200)}`, vklyuchen: m[3].trim(), varianty: v });
    }
    zapisat(MATERIALY, zapisi);
  } catch (e) { console.log(`✗ ${MATERIALY.fayl}: ${e.message}`); oshibok++; }
  return oshibok ? 1 : 0;
}

if (rezhim === '--reestry') process.exit(await obnovitReestry());
if (rezhim === '--zakon') process.exit(otchetZakon());
if (rezhim === '--xx') process.exit(otchetXX());
