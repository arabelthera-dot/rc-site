// Сторож смены хозяина домена (п.494 плана, Р744, Р745; «expired domain abuse»).
// Источники дней ведут на чужие сайты. Домен истёк и перекуплен — по старой ссылке ребёнок попадёт на казино или
// чужую пропаганду. Раз в неделю для каждого внешнего домена из src/content снимается отпечаток:
//   регистратор, дата создания и окончания — RDAP (бесплатный https://rdap.org), для .ru/.su/.рф — whois.tcinet.ru:43
//   (у ТЦИ нет RDAP); заголовок <title> и язык <html lang> главной страницы.
// Отпечатки — data/domeny-otpechatki.json. Сравнение со снятым: сменилась дата создания (домен перерегистрирован),
// регистратор, язык, заголовок без общих слов или срок регистрации прошёл — домен попадает в отчёт со ссылкой
// на копию в web.archive.org. Ссылки на сайте скрипт не переписывает: решение — глазами, по заявке-предупреждению.
// Запуск: node scripts/domeny-otpechatki.mjs                    сверка с записанным, отчёт в domeny-otchet.md (код 0)
//         node scripts/domeny-otpechatki.mjs --zapisat          снять отпечатки и записать их (первый прогон, после проверки)
//         node scripts/domeny-otpechatki.mjs --limit 50         только первые 50 доменов (по частоте ссылок)
//         node scripts/domeny-otpechatki.mjs --spisok           только перечислить домены, без сети
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const KORNI = ['src/content'];
const RASSH = /\.(?:md|mdx|json|ya?ml)$/i;
const FAIL = 'data/domeny-otpechatki.json';
const OTCHET = process.env.DOMENY_OTCHET || 'domeny-otchet.md';
const SVOI = ['russian-civilization.ru'];
// Вторые уровни, где домен хозяина — три метки (msk.ru, com.ru, co.uk …).
const DVOYNYE = new Set(['com.ru', 'org.ru', 'net.ru', 'pp.ru', 'msk.ru', 'spb.ru', 'msk.su', 'co.uk', 'org.uk', 'ac.uk',
  'gov.uk', 'com.ua', 'org.ua', 'com.au', 'co.jp', 'ac.jp', 'com.cn', 'edu.cn', 'co.kr', 'com.br', 'nsk.ru', 'nnov.ru']);
// rdap.org за Cloudflare: без User-Agent отвечает 403.
const UA = 'rc-site-domeny/1.0 (+https://russian-civilization.ru)';
const TCI = /\.(?:ru|su|xn--p1ai)$/;

export function domenHozyaina(h) {
  const m = h.toLowerCase().replace(/\.$/, '').split('.');
  if (m.length <= 2) return m.join('.');
  const dva = m.slice(-2).join('.');
  return DVOYNYE.has(dva) ? m.slice(-3).join('.') : dva;
}

function* faily(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* faily(p);
    else if (RASSH.test(e.name)) yield p;
  }
}

// Домены хозяев → сколько ссылок и первый файл; порядок — по числу ссылок.
export function sobratDomeny(korni = KORNI) {
  const d = new Map();
  for (const k of korni) for (const f of faily(k)) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/https?:\/\/[^\s"'<>()\]\\]+/g)) {
      let h;
      try { h = new URL(m[0]).hostname; } catch { continue; }
      if (!h.includes('.') || /^[\d.]+$/.test(h)) continue;
      const dom = domenHozyaina(h);
      if (SVOI.includes(dom)) continue;
      const z = d.get(dom) || { ssylok: 0, fail: f };
      z.ssylok++;
      d.set(dom, z);
    }
  }
  return [...d].sort((a, b) => b[1].ssylok - a[1].ssylok || a[0].localeCompare(b[0]));
}

const pauza = (ms) => new Promise((r) => setTimeout(r, ms));

function whois43(dom, server = 'whois.tcinet.ru') {
  return new Promise((resolve) => {
    let t = '';
    const s = net.connect(43, server, () => s.write(dom + '\r\n'));
    s.setTimeout(15000, () => { s.destroy(); resolve(null); });
    s.on('data', (c) => { t += c; });
    s.on('end', () => resolve(t));
    s.on('error', () => resolve(null));
  });
}

export function razborWhois(t) {
  const pole = (k) => (t.match(new RegExp('^' + k + ':\\s*(.+)$', 'mi')) || [])[1]?.trim() || null;
  if (/No entries found/i.test(t)) return { net: true };
  return { registrator: pole('registrar'), sozdan: pole('created')?.slice(0, 10) || null, istekaet: pole('paid-till')?.slice(0, 10) || null };
}

export function razborRdap(j) {
  const sob = (a) => (j.events || []).find((e) => e.eventAction === a)?.eventDate?.slice(0, 10) || null;
  const reg = (j.entities || []).find((e) => (e.roles || []).includes('registrar'));
  const imya = reg?.vcardArray?.[1]?.find((v) => v[0] === 'fn')?.[3] || reg?.publicIds?.[0]?.identifier || reg?.handle || null;
  return { registrator: imya, sozdan: sob('registration'), istekaet: sob('expiration') };
}

async function registraciya(dom) {
  if (TCI.test(dom)) {
    const t = await whois43(dom);
    return t ? { ...razborWhois(t), istochnik: 'whois.tcinet.ru' } : { oshibka: 'whois не ответил' };
  }
  try {
    const r = await fetch('https://rdap.org/domain/' + dom, { signal: AbortSignal.timeout(20000), headers: { accept: 'application/rdap+json', 'user-agent': UA } });
    if (r.status === 404) return { oshibka: 'нет RDAP для зоны', istochnik: 'rdap.org' };
    if (!r.ok) return { oshibka: 'RDAP ' + r.status, istochnik: 'rdap.org' };
    return { ...razborRdap(await r.json()), istochnik: 'rdap.org' };
  } catch (e) { return { oshibka: 'RDAP: ' + (e.cause?.code || e.name) }; }
}

export function razborGlavnoy(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/\s+/g, ' ').trim().slice(0, 200) || null;
  const lang = (html.match(/<html[^>]*\slang=["']?([A-Za-z-]+)/i) || [])[1]?.toLowerCase().slice(0, 2) || null;
  return { title, lang };
}

async function glavnaya(dom) {
  for (const adres of ['https://' + dom + '/', 'https://www.' + dom + '/', 'http://' + dom + '/']) {
    try {
      const r = await fetch(adres, { signal: AbortSignal.timeout(20000), redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 ' + UA } });
      const buf = Buffer.from(await r.arrayBuffer()).subarray(0, 300000);
      let cs = (r.headers.get('content-type') || '').match(/charset=([\w-]+)/i)?.[1];
      cs ||= buf.toString('latin1').match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1];
      let html;
      try { html = new TextDecoder(cs || 'utf-8').decode(buf); } catch { html = new TextDecoder().decode(buf); }
      return { kod: r.status, konec: new URL(r.url).hostname, ...razborGlavnoy(html) };
    } catch { /* следующий адрес */ }
  }
  return { oshibka: 'главная не открылась' };
}

const slova = (s) => new Set((s || '').toLowerCase().match(/[\p{L}\d]{4,}/gu) || []);

// Признаки смены хозяина: старый отпечаток → новый. Пустое значение (сбой сети) — не признак.
export function priznaki(staryy, novyy, segodnya = new Date().toISOString().slice(0, 10)) {
  const p = [];
  const s = staryy || {}, n = novyy || {};
  if (n.net) p.push('домен не зарегистрирован (свободен)');
  if (s.sozdan && n.sozdan && s.sozdan !== n.sozdan) p.push(`дата создания ${s.sozdan} → ${n.sozdan} (перерегистрирован)`);
  if (s.registrator && n.registrator && s.registrator !== n.registrator) p.push(`регистратор ${s.registrator} → ${n.registrator}`);
  if (n.istekaet && n.istekaet < segodnya) p.push(`срок регистрации истёк ${n.istekaet}`);
  if (s.lang && n.lang && s.lang !== n.lang) p.push(`язык главной ${s.lang} → ${n.lang}`);
  if (s.title && n.title && s.title !== n.title) {
    const a = slova(s.title), b = slova(n.title);
    if (a.size && b.size && ![...a].some((x) => b.has(x))) p.push(`заголовок «${s.title}» → «${n.title}»`);
  }
  if (s.konec && n.konec && domenHozyaina(s.konec) !== domenHozyaina(n.konec)) p.push(`главная уводит на ${n.konec} (было ${s.konec})`);
  return p;
}

async function otpechatok(dom) {
  const [r, g] = await Promise.all([registraciya(dom), glavnaya(dom)]);
  return { ...r, ...g, oshibka: [r.oshibka, g.oshibka].filter(Boolean).join('; ') || undefined, snyat: new Date().toISOString().slice(0, 10) };
}

async function main() {
  const a = process.argv.slice(2);
  const limit = a.includes('--limit') ? Number(a[a.indexOf('--limit') + 1]) : Infinity;
  const vse = sobratDomeny();
  if (a.includes('--spisok')) { for (const [d, z] of vse) console.log(d, z.ssylok); console.log('доменов:', vse.length); return; }
  const zapisano = fs.existsSync(FAIL) ? JSON.parse(fs.readFileSync(FAIL, 'utf8')) : { domeny: {} };
  const rabota = vse.slice(0, limit);
  const novye = {}, trevoga = [], sboi = [];
  for (let i = 0; i < rabota.length; i += 4) { // по 4 домена, пауза — чтобы не упереться в лимит rdap.org
    await Promise.all(rabota.slice(i, i + 4).map(async ([d, z]) => {
      const o = await otpechatok(d);
      novye[d] = o;
      if (o.oshibka) sboi.push(`${d} — ${o.oshibka}`);
      const p = priznaki(zapisano.domeny[d], o);
      if (p.length) trevoga.push({ d, p, fail: z.fail, ssylok: z.ssylok });
    }));
    await pauza(1500);
  }
  if (a.includes('--zapisat')) {
    // Записываем снятое, не теряя доменов, не попавших в --limit.
    // Сбой сети не стирает снятое раньше: пустые поля нового отпечатка берутся из старого.
    const domeny = { ...zapisano.domeny };
    for (const [d, o] of Object.entries(novye)) {
      domeny[d] = { ...domeny[d], ...Object.fromEntries(Object.entries(o).filter(([, v]) => v != null)) };
      if (!o.oshibka) delete domeny[d].oshibka;
    }
    for (const d of Object.keys(domeny)) if (!vse.some(([x]) => x === d)) delete domeny[d];
    const sort = Object.fromEntries(Object.keys(domeny).sort().map((d) => [d, domeny[d]]));
    fs.writeFileSync(FAIL, JSON.stringify({ opisanie: 'Отпечатки внешних доменов из src/content — scripts/domeny-otpechatki.mjs (п.494, Р745)', domeny: sort }, null, 1) + '\n');
  }
  const bezZapisi = rabota.filter(([d]) => !zapisano.domeny[d]).map(([d]) => d);
  const t = ['## Сторож доменов: возможная смена хозяина', '',
    `Доменов в источниках: ${vse.length}, проверено: ${rabota.length}, с признаками смены: ${trevoga.length}, не ответили: ${sboi.length}, без записанного отпечатка: ${bezZapisi.length}.`, '',
    'Ссылки на сайте не переписаны. Проверить глазами; хозяин сменился — заменить ссылку в дне на архивную копию.', ''];
  for (const { d, p, fail, ssylok } of trevoga) {
    t.push(`### ${d} (${ssylok} ссыл., напр. \`${fail}\`)`, ...p.map((x) => '- ' + x),
      `- архив: https://web.archive.org/web/${(zapisano.domeny[d]?.snyat || '').replace(/-/g, '') || '2025'}*/${d}`, '');
  }
  if (sboi.length) t.push('<details><summary>Не ответили</summary>', '', ...sboi.map((x) => '- ' + x), '', '</details>');
  fs.writeFileSync(OTCHET, t.join('\n') + '\n');
  console.log(`доменов ${vse.length}, проверено ${rabota.length}, признаки смены ${trevoga.length}, сбои ${sboi.length}, без записи ${bezZapisi.length}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `trevoga=${trevoga.length}\n`);
}

if (import.meta.url === 'file://' + path.resolve(process.argv[1] || '')) main();
