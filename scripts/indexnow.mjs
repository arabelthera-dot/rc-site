// IndexNow после выкладки (Е6, Р47; «да» Сергея 20.10.2026): сообщить Яндексу и Bing адреса открытых волн карты сайта.
// Кабинет не нужен: ключ — src/data/karta-sayta.json (indexnow), файл ключа — public/<ключ>.txt на сайте.
// Что отправляем: волну 1 целиком (push и ручной запуск) и все адреса открытых волн с lastmod за последние сутки;
// ночная пересборка (--tolko-svezhie) — только изменившиеся за сутки, чтобы не слать одно и то же каждую ночь.
// Список берётся с живого сайта (sitemap-index.xml) — то, что поисковик увидит сам.
// Сеть или ответ с ошибкой — предупреждение и код 0: выкладку не роняем. Коды ответов — в лог и в сводку задачи.
// Запуск: node scripts/indexnow.mjs [--tolko-svezhie] [--sayt https://russian-civilization.ru/] [--suho]
import fs from 'node:fs';

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const SAYT = (opt('--sayt') || 'https://russian-civilization.ru/').replace(/\/?$/, '/');
const KLYUCH = JSON.parse(fs.readFileSync('src/data/karta-sayta.json', 'utf8')).indexnow;
const ADRESA = ['https://yandex.com/indexnow', 'https://api.indexnow.org/indexnow'];
const SUTKI = 24 * 3600 * 1000;

const svodka = (s) => { console.log(s); if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${s}\n`); };
const zabrat = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(30000) }); if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.text(); };
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => ({ loc: m[1], lastmod: m[2] }));

try {
  const klyuchNaSayte = (await zabrat(`${SAYT}${KLYUCH}.txt`)).trim();
  if (klyuchNaSayte !== KLYUCH) throw new Error(`файл ключа ${SAYT}${KLYUCH}.txt не совпадает с ключом`);
  const spisok = new Set();
  const svezhee = Date.now() - SUTKI;
  for (const { loc: karta } of locs(await zabrat(`${SAYT}sitemap-index.xml`))) {
    const volna1 = /sitemap-volna-1\.xml$/.test(karta);
    for (const u of locs(await zabrat(karta)))
      if ((volna1 && !argv.includes('--tolko-svezhie')) || (u.lastmod && new Date(u.lastmod).getTime() >= svezhee)) spisok.add(u.loc);
  }
  svodka(`IndexNow: адресов ${spisok.size}`);
  if (!spisok.size || argv.includes('--suho')) process.exit(0);
  const telo = JSON.stringify({ host: new URL(SAYT).host, key: KLYUCH, keyLocation: `${SAYT}${KLYUCH}.txt`, urlList: [...spisok].slice(0, 10000) });
  for (const adres of ADRESA) {
    try {
      const r = await fetch(adres, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: telo, signal: AbortSignal.timeout(30000) });
      // 200 — принято, 202 — принято, ключ ещё проверяется; 422/403/429 — см. https://www.indexnow.org/documentation
      svodka(`IndexNow ${adres}: ${r.status}${r.ok ? '' : ` ${(await r.text()).slice(0, 200)}`}`);
    } catch (e) { svodka(`IndexNow ${adres}: нет ответа (${e.message}) — выкладка не затронута`); }
  }
} catch (e) {
  svodka(`IndexNow не отправлен: ${e.message} — выкладка не затронута`);
}
