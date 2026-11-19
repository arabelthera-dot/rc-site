#!/usr/bin/env node
// М78 (AI_Projects #2357, 04.11.2026): авторы статей, на которые ссылаются дни, — сверка с реестром иноагентов
// (разбор — src/lib/avtory-ssylok.mjs, сопоставление имён — src/lib/zakon.mjs).
//   node scripts/avtory-ssylok.mjs              — сверка по кэшу data/avtory-ssylok.json, без сети (так в npm run build):
//                                                 иноагент-автор — выход 1 с адресом, днём и именем; адреса нет в кэше —
//                                                 предупреждение «не проверено», не падение.
//   node scripts/avtory-ssylok.mjs --napolnit   — скачать адреса, которых нет в кэше (каждый один раз), и записать автора.
//        RF_PROXY=socks5h://rf-proxy:1080         российский выход (как scripts/prava.mjs); без переменной — напрямую.
//        --povtor                                 заново — и адреса с прошлой ошибкой; --pauza 1500 (мс), --taymaut 20 (с);
//        --potoki 6                               сайтов одновременно (один сайт — строго по очереди с паузой);
//        --skolko N                               не больше N адресов за запуск (кэш пишется каждые 10).
//   node scripts/avtory-ssylok.mjs --url <адрес> — одна страница: что скачалось и какой автор (кэш не трогает).
// Выключить шаг целиком: AVTORY_SSYLOK=0.
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';
import { avtorIz, chitatKesh, pisatKesh, ssylki, sverkaAvtorov, KESH } from '../src/lib/avtory-ssylok.mjs';

if (process.env.AVTORY_SSYLOK === '0') { console.log('avtory-ssylok: выключена (AVTORY_SSYLOK=0)'); process.exit(0); }
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

// SOCKS5 без зависимостей (как scripts/prava.mjs): socks5h — имя сайта разрешает прокси.
function socksConnect(host, port, proxy) {
  return new Promise((ok, fail) => {
    const s = net.connect(+proxy.port || 1080, proxy.hostname);
    const hb = Buffer.from(host);
    const steps = [Buffer.from([5, 1, 0]), Buffer.concat([Buffer.from([5, 1, 0, 3, hb.length]), hb, Buffer.from([port >> 8, port & 255])])];
    let step = 0;
    s.setTimeout(15000, () => s.destroy(new Error('SOCKS5: время вышло')));
    s.once('error', fail);
    s.on('data', function on(d) {
      if (d[0] !== 5 || d[1] !== 0) { s.destroy(); return fail(new Error(`SOCKS5: отказ ${d[1]}`)); }
      if (++step < 2) return s.write(steps[1]);
      s.off('data', on); s.setTimeout(0); ok(s);
    });
    s.write(steps[0]);
  });
}

const MAKS = 4 * 1024 * 1024;
// Одна страница: до 5 переадресаций, тело не больше 4 МБ, кодировка — из заголовка или <meta charset>.
async function skachat(url, taymaut, proxy, hops = 0) {
  const u = new URL(url);
  const tlsS = u.protocol === 'https:';
  const port = +u.port || (tlsS ? 443 : 80);
  const raw = proxy ? await socksConnect(u.hostname, port, proxy) : null;
  const lib = tlsS ? https : http;
  const res = await new Promise((ok, fail) => {
    const req = lib.request({ host: u.hostname, port, path: u.pathname + u.search, method: 'GET', timeout: taymaut * 1000,
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) rc-site avtory-ssylok', Accept: 'text/html,*/*;q=0.5', 'Accept-Language': 'ru' },
      ...(raw && { createConnection: () => (tlsS ? tls.connect({ socket: raw, servername: u.hostname, rejectUnauthorized: false }) : raw) }) }, (r) => {
      const parts = [];
      let n = 0;
      r.on('data', (c) => { n += c.length; if (n <= MAKS) parts.push(c); else r.destroy(); });
      r.on('end', () => ok({ kod: r.statusCode, loc: r.headers.location, tip: r.headers['content-type'] || '', buf: Buffer.concat(parts) }));
      r.on('close', () => ok({ kod: r.statusCode, loc: r.headers.location, tip: r.headers['content-type'] || '', buf: Buffer.concat(parts) }));
    });
    req.on('timeout', () => req.destroy(new Error('время вышло')));
    req.on('error', fail);
    req.end();
  });
  if (res.kod >= 300 && res.kod < 400 && res.loc && hops < 5) return skachat(new URL(res.loc, url).href, taymaut, proxy, hops + 1);
  const golova = res.buf.subarray(0, 4096).toString('latin1');
  const kodirovka = (/charset=["']?([\w-]+)/i.exec(res.tip) || /<meta[^>]+charset=["']?([\w-]+)/i.exec(golova) || [])[1] || 'utf-8';
  let html;
  try { html = new TextDecoder(kodirovka.toLowerCase()).decode(res.buf); } catch { html = new TextDecoder('utf-8').decode(res.buf); }
  return { kod: res.kod, tip: res.tip, html };
}

async function napolnit() {
  const proxy = process.env.RF_PROXY ? new URL(process.env.RF_PROXY) : null;
  const pauza = +arg('--pauza', 1500);
  const taymaut = +arg('--taymaut', 20);
  const povtor = process.argv.includes('--povtor');
  const kesh = chitatKesh();
  const nado = [...ssylki().keys()].filter((u) => !kesh[u] || (povtor && kesh[u].status !== 'ok'));
  console.log(`avtory-ssylok --napolnit: не в кэше ${nado.length}${proxy ? ` через ${proxy.host}` : ' напрямую'}, пауза ${pauza} мс, таймаут ${taymaut} с`);
  // Один сайт — по очереди с паузой, разные сайты — параллельно (--potoki).
  const poSaytam = new Map();
  for (const url of nado.slice(0, +arg('--skolko', Infinity))) { const h = new URL(url).hostname; poSaytam.set(h, [...(poSaytam.get(h) || []), url]); }
  const vsego = [...poSaytam.values()].flat().length;
  const ochered = [...poSaytam.values()];
  let i = 0;
  const sayt = async (adresa) => {
    for (const url of adresa) {
      const data = new Date().toISOString().slice(0, 10);
      try {
        // Общий срок на адрес: сокет через прокси может молчать и после таймаута запроса.
        const r = await Promise.race([skachat(url, taymaut, proxy),
          new Promise((_, fail) => setTimeout(() => fail(new Error('время вышло (общий срок)')), taymaut * 2000).unref())]);
        const ok = r.kod === 200 && /html|xml/i.test(r.tip || 'html');
        kesh[url] = ok ? { status: 'ok', kod: r.kod, avtor: avtorIz(r.html), data } : { status: 'oshibka', kod: r.kod, avtor: '', data, oshibka: r.kod === 200 ? r.tip : `HTTP ${r.kod}` };
      } catch (e) {
        kesh[url] = { status: 'oshibka', kod: 0, avtor: '', data, oshibka: e.message };
      }
      const z = kesh[url];
      console.log(`${++i}/${vsego} ${z.status === 'ok' ? '✓' : '✗'} ${url}${z.avtor ? ` — автор: ${z.avtor}` : ''}${z.oshibka ? ` — ${z.oshibka}` : ''}`);
      if (i % 10 === 0) pisatKesh(kesh);
      await new Promise((r) => setTimeout(r, pauza));
    }
  };
  await Promise.all(Array.from({ length: +arg('--potoki', 6) }, async () => { while (ochered.length) await sayt(ochered.shift()); }));
  pisatKesh(kesh);
  console.log(`кэш записан: ${KESH}`);
}
// Зависший сокет не держит процесс: после наполнения и сверки — явный выход ниже.

if (arg('--url')) {
  const r = await skachat(arg('--url'), +arg('--taymaut', 20), process.env.RF_PROXY ? new URL(process.env.RF_PROXY) : null);
  console.log(`HTTP ${r.kod} ${r.tip}, ${r.html.length} знаков, автор: «${avtorIz(r.html)}»`);
  process.exit(0);
}
if (process.argv.includes('--napolnit')) await napolnit();
const s = sverkaAvtorov();
console.log(`avtory-ssylok: ссылок ${s.ssylok}, проверено ${s.provereno}, автор найден ${s.sAvtorom}, иноагентов ${s.inoagenty.length}, не проверено ${s.neProvereno.length}`);
if (s.neProvereno.length) console.log(`::warning::avtory-ssylok: не проверено ${s.neProvereno.length} адресов (нет в кэше или ошибка скачивания) — наполнить: RF_PROXY=socks5h://rf-proxy:1080 node scripts/avtory-ssylok.mjs --napolnit`);
for (const z of new Set(s.zhdut.map((x) => `· ждёт решения Сергея: ${x.gde}: «${x.imya}» — ${x.prichina}`))) console.log(z);
for (const z of s.inoagenty) console.log(`::error::avtory-ssylok: ${z.den}: ${z.url} — автор «${z.avtor}» = «${z.imya}» (${z.reestr})`);
process.exit(s.inoagenty.length ? 1 : 0);
