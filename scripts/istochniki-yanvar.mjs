// Источник дня открывается (p544-e, Р546, Р395): январь двух музеев — «Русские изобрели первыми в мире» (izobreteniya)
// и «Русские не сдаются» (ne-sdayutsya), 62 дня. У каждого дня три условия:
//   1) поле источника есть: у дня на общем шаблоне (`adres: den`) — `sources` карточки src/content/dni-shablon/<музей>/ММ-ДД.yaml,
//      у остальных — `source` записи src/content/days/<музей>/ММ-ДД.json; в поле есть ссылка https?://…;
//   2) ссылка открывается с кодом 200 (российские сайты — через socks5h://rf-proxy:1080);
//   3) в тексте страницы по ссылке есть главное событие дня — все слова ключа дня из снимка (фамилия и событие: «Котельников», «парашют»).
// В CI нет российского узла, поэтому сеть ходит только с --seti: обходит ссылки дней и переписывает снимок
// data/istochniki-yanvar.json (ссылка, код, ключ, найдено, дата). Шаг сборки — без сети: ссылка дня должна быть
// в снимке с кодом 200 и найденным ключом. Нет поля, нет ссылки, ссылка не та, что проверена, — красный (::error::, код 1).
// Строгость по Р520: находки размечены человеком в scripts/istochniki-yanvar-proba.json; при ≥10 находках и ≤1 ложной
// шаг строгий, иначе находки — ::warning:: («на пробе»).
// Запуск: node scripts/istochniki-yanvar.mjs [--proba] [--seti]. В npm run build: --proba && без флагов.
// Откат — убрать вызов из package.json.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';

const MUZEI = ['izobreteniya', 'ne-sdayutsya'];
const KLYUCHI = Array.from({ length: 31 }, (_, i) => `01-${String(i + 1).padStart(2, '0')}`);
const SNIMOK = 'data/istochniki-yanvar.json';
const PROBA = 'scripts/istochniki-yanvar-proba.json';
// Ссылка в тексте — как её делает srcHtml (src/lib/kalendar.ts): хвостовые .,;:)» не входят.
const URL_RE = /https?:\/\/[^\s<>"«»]+[^\s<>"«».,;:)]/g;

// Ссылки дня и откуда они: карточка шаблона (`adres: den`) рисует свои `sources`, остальное — `source` записи дня.
export function ssylkiDnya(root, muzei, key) {
  const yml = path.join(root, 'src/content/dni-shablon', muzei, `${key}.yaml`);
  if (fs.existsSync(yml)) {
    const k = YAML.parse(fs.readFileSync(yml, 'utf8'));
    if (k?.adres === 'den') {
      if (!Array.isArray(k.sources) || !k.sources.length) return { pole: yml, net: true, urls: [] };
      const urls = k.sources.flatMap((s) => [s.href, ...[...`${s.html ?? ''} ${s.title ?? ''}`.matchAll(/href="([^"]+)"/g)].map((m) => m[1])])
        .filter((u) => typeof u === 'string' && /^https?:\/\//.test(u));
      return { pole: yml, urls: [...new Set(urls)] };
    }
  }
  const json = path.join(root, 'src/content/days', muzei, `${key}.json`);
  if (!fs.existsSync(json)) return { pole: json, net: true, urls: [] };
  const src = JSON.parse(fs.readFileSync(json, 'utf8')).source;
  if (!src) return { pole: json, net: true, urls: [] };
  return { pole: json, urls: [...new Set(src.match(URL_RE) ?? [])] };
}

export function proverit(root, snimok) {
  const oshibki = [];
  for (const muzei of MUZEI) for (const key of KLYUCHI) {
    const { pole, net, urls } = ssylkiDnya(root, muzei, key);
    const file = path.relative(root, pole);
    const s = snimok.dni[`${muzei}/${key}`];
    if (net) { oshibki.push({ muzei, key, file, msg: 'нет поля источника' }); continue; }
    if (!urls.length) { oshibki.push({ muzei, key, file, msg: 'в поле источника нет ссылки https://…' }); continue; }
    if (!s) { oshibki.push({ muzei, key, file, msg: `дня нет в снимке ${SNIMOK} — node scripts/istochniki-yanvar.mjs --seti` }); continue; }
    if (!urls.includes(s.url)) { oshibki.push({ muzei, key, file, msg: `ни одна ссылка дня не проверена (в снимке — ${s.url}) — --seti` }); continue; }
    if (s.kod !== 200) { oshibki.push({ muzei, key, file, msg: `${s.url} — код ${s.kod}, не 200` }); continue; }
    if (!s.naydeno?.length) oshibki.push({ muzei, key, file, msg: `${s.url} открывается, но события дня нет в тексте (ключ: ${s.klyuch.join(', ')})` });
  }
  return oshibki;
}

// --seti: обход ссылок через российский узел; первая ссылка дня с кодом 200 и ключом в тексте идёт в снимок.
async function seti(snimok) {
  const { SocksProxyAgent } = await import('socks-proxy-agent');
  const agent = new SocksProxyAgent(process.env.RF_PROXY ?? 'socks5h://rf-proxy:1080');
  const http = await import('node:http'), https = await import('node:https');
  const get = (u, n = 0) => new Promise((ok) => {
    const lib = u.startsWith('https:') ? https : http;
    const req = lib.get(u, { agent, timeout: 40000, headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36', 'Accept-Language': 'ru' } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && n < 5) { r.resume(); return ok(get(new URL(r.headers.location, u).href, n + 1)); }
      const chunks = []; r.on('data', (c) => chunks.push(c));
      r.on('end', () => {
        const buf = Buffer.concat(chunks);
        const cs = (/charset=([\w-]+)/i.exec(r.headers['content-type'] ?? '') ?? /<meta[^>]+charset=["']?([\w-]+)/i.exec(buf.toString('latin1')))?.[1] ?? 'utf-8';
        let text; try { text = new TextDecoder(cs.toLowerCase()).decode(buf); } catch { text = buf.toString('utf8'); }
        ok({ kod: r.statusCode, text });
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', () => ok({ kod: 0, text: '' }));
  });
  const tekst = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').toLowerCase();
  const data = new Date().toISOString().slice(0, 10);
  for (const muzei of MUZEI) for (const key of KLYUCHI) {
    const id = `${muzei}/${key}`, klyuch = snimok.dni[id]?.klyuch;
    if (!klyuch) { console.log(`${id}: нет ключа события в снимке — впиши klyuch`); continue; }
    const { urls } = ssylkiDnya('.', muzei, key);
    const pervaya = snimok.dni[id]?.url;
    let zapis = { url: urls[0] ?? '', kod: 0, klyuch, naydeno: [], data };
    for (const url of [...urls].sort((a, b) => (b === pervaya) - (a === pervaya))) {
      const { kod, text } = await get(url);
      const t = tekst(text), naydeno = klyuch.filter((x) => t.includes(x.toLowerCase()));
      if (naydeno.length < klyuch.length) naydeno.length = 0;
      zapis = { url, kod, klyuch, naydeno, data };
      if (kod === 200 && naydeno.length) break;
    }
    snimok.dni[id] = zapis;
    console.log(`${id}: ${zapis.kod} ${zapis.naydeno.length ? 'событие есть' : 'события нет'} ${zapis.url}`);
  }
  fs.writeFileSync(SNIMOK, JSON.stringify(snimok, null, 1) + '\n');
}

// --proba: заведомые случаи на копии — чистый день зелёный, день без поля, без ссылки и с непроверенной ссылкой красные.
function proba(snimok) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'istochniki-'));
  for (const d of ['src/content/days', 'src/content/dni-shablon']) for (const m of MUZEI)
    fs.cpSync(d + '/' + m, path.join(root, d, m), { recursive: true });
  const chisto = proverit(root, snimok).filter((o) => !(snimok.dolg ?? []).includes(`${o.muzei}/${o.key}`)).length; // долг не в счёт
  // День для дыр — карточка шаблона (`adres: den`, после Р570 п.3 весь январь такой); нет её — запись дня JSON.
  const id = MUZEI[1], yml = (k) => path.join(root, 'src/content/dni-shablon', id, `${k}.yaml`);
  let key = KLYUCHI.find((k) => fs.existsSync(yml(k)) && YAML.parse(fs.readFileSync(yml(k), 'utf8'))?.adres === 'den');
  let f, zap, zapisat, sluchai;
  if (key) {
    f = yml(key); zap = YAML.parse(fs.readFileSync(f, 'utf8')); zapisat = () => YAML.stringify(zap);
    sluchai = [['нет поля', () => { delete zap.sources; }], ['нет ссылки', () => { zap.sources = [{ title: 'Газета (rg.ru).' }]; }],
      ['ссылка не проверена', () => { zap.sources = [{ title: 'Газета', href: 'https://rg.ru/ne-proverena.html' }]; }]];
  } else {
    key = KLYUCHI.find((k) => !fs.existsSync(yml(k)));
    f = path.join(root, 'src/content/days', id, `${key}.json`); zap = JSON.parse(fs.readFileSync(f, 'utf8')); zapisat = () => JSON.stringify(zap);
    sluchai = [['нет поля', () => { delete zap.source; }], ['нет ссылки', () => { zap.source = 'Газета (rg.ru).'; }],
      ['ссылка не проверена', () => { zap.source = 'Газета, https://rg.ru/ne-proverena.html'; }]];
  }
  const ploho = sluchai.filter(([, izm]) => { izm(); fs.writeFileSync(f, zapisat()); return !proverit(root, snimok).some((o) => o.key === key && o.muzei === id); });
  fs.rmSync(root, { recursive: true, force: true });
  if (chisto || ploho.length) {
    console.log(`::error::istochniki-yanvar --proba: чистые данные — ${chisto} находок (ждали 0); не пойманы: ${ploho.map(([n]) => n).join(', ') || '—'}`);
    process.exit(1);
  }
  console.log(`istochniki-yanvar --proba: чистые данные зелёные, ${sluchai.length} дыры красные`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const snimok = JSON.parse(fs.readFileSync(SNIMOK, 'utf8'));
  if (process.argv.includes('--seti')) await seti(snimok);
  else if (process.argv.includes('--proba')) proba(snimok);
  else {
    const p = JSON.parse(fs.readFileSync(PROBA, 'utf8'));
    const strogo = p.nakhodki.length >= 10 && p.nakhodki.filter((x) => x.lozhnaya).length <= 1;
    // Долг (храповик, как data/rabochie-dni.json): записанный брак дня не краснит, а пишется предупреждением; новый — красный.
    // Тексты дней машина не правит — день из долга чинит хозяин дня, затем убирает его из `dolg` снимка.
    const dolg = new Set(snimok.dolg ?? []);
    const oshibki = proverit('.', snimok);
    for (const o of oshibki) console.log(`::${strogo && !dolg.has(`${o.muzei}/${o.key}`) ? 'error' : 'warning'} file=${o.file}::${o.muzei} ${o.key}: ${o.msg}${dolg.has(`${o.muzei}/${o.key}`) ? ' (долг)' : ''}`);
    for (const id of dolg) if (!oshibki.some((o) => `${o.muzei}/${o.key}` === id)) console.log(`::warning::${id} чист — убери его из dolg в ${SNIMOK}`);
    const n = MUZEI.length * KLYUCHI.length, novye = oshibki.filter((o) => !dolg.has(`${o.muzei}/${o.key}`));
    console.log(`istochniki-yanvar: источник открывается ${n - oshibki.length} из ${n}, в долге ${dolg.size}${strogo ? '' : ' (на пробе, Р520)'}`);
    if (novye.length && strogo) process.exit(1);
  }
}
