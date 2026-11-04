import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

// Дни после выкладки в Россию (Р536, п. 9): машина открывает живой сайт как посетитель — страницы дней, изменённых
// этой выкладкой, а если таких нет — выборку. По каждому дню: страница 200; живая страница = выложенная сборке
// (SMOKE_DIST); хук карточки календаря src/content/days/<музей>/ММ-ДД.json виден на странице; ролики (<video>/<source>)
// и аудиогид (MUSEUM_AUDIOGUIDE.audioSrc) отдаются: HEAD 200, тип video/mp4 и audio/mpeg, размер = файлу сборки.
// Окружение: SMOKE_IZMENENIYA — файл со списком путей заявки/выкладки (по строке); SMOKE_DIST — папка выложенной сборки;
// SMOKE_VYBORKA — сколько дней брать без изменённых (6); SMOKE_MUZEI — только эти музеи (через запятую); SMOKE_DNI — «музей/ММ-ДД,…» вместо всего этого;
// SMOKE_SLOMAT=1 — заведомо неверный хук (проба: проверка обязана покраснеть).
const KOREN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const DIST = process.env.SMOKE_DIST ? path.resolve(process.env.SMOKE_DIST) : null;
const MES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const stranica = (d) => `/muzei/${d.split('/')[0]}/den/${d.split('/')[1]}/`;
const vSborke = (d) => !DIST || fs.existsSync(path.join(DIST, stranica(d), 'index.html'));
// День живёт на адресе den: в сборке есть страница; без сборки — карточка шаблона с «adres: den».
function vseDni() {
  if (DIST) {
    return fs.readdirSync(path.join(DIST, 'muzei')).flatMap((m) => {
      const p = path.join(DIST, 'muzei', m, 'den');
      return fs.existsSync(p) ? fs.readdirSync(p).filter((k) => /^\d\d-\d\d$/.test(k)).map((k) => `${m}/${k}`) : [];
    });
  }
  const sh = path.join(KOREN, 'src/content/dni-shablon');
  return fs.readdirSync(sh).flatMap((m) => fs.readdirSync(path.join(sh, m))
    .filter((f) => /^\d\d-\d\d\.ya?ml$/.test(f) && /^adres: den$/m.test(fs.readFileSync(path.join(sh, m, f), 'utf8')))
    .map((f) => `${m}/${f.slice(0, 5)}`));
}
// Путь из заявки → день: карточка календаря, карточка шаблона, ролик day-ДДmon-….
function denIzPuti(p) {
  let m = p.match(/^src\/content\/(?:days|dni-shablon)\/([^/]+)\/(\d\d-\d\d)\.(?:json|ya?ml)$/);
  if (m) return `${m[1]}/${m[2]}`;
  m = p.match(/^public\/muzei\/([^/]+)\/video\/day-(\d\d)([a-z]{3})-/);
  if (m && MES.includes(m[3])) return `${m[1]}/${String(MES.indexOf(m[3]) + 1).padStart(2, '0')}-${m[2]}`;
  return null;
}
function dniDlyaProverki() {
  if (process.env.SMOKE_DNI) return process.env.SMOKE_DNI.split(',').map((s) => s.trim()).filter(Boolean);
  const muzei = (process.env.SMOKE_MUZEI || '').split(',').filter(Boolean);
  const vse = new Set(vseDni().filter((d) => !muzei.length || muzei.includes(d.split('/')[0])));
  const f = process.env.SMOKE_IZMENENIYA;
  const izm = f && fs.existsSync(f) ? [...new Set(fs.readFileSync(f, 'utf8').split('\n').map(denIzPuti).filter(Boolean))] : [];
  const izmZhivye = izm.filter((d) => vse.has(d) && vSborke(d));
  if (izmZhivye.length) return izmZhivye.sort();
  // Выборка: равномерно по отсортированному списку — каждый музей с адресом den попадает, повторяемо от прогона к прогону.
  const spisok = [...vse].sort(), n = Math.min(+(process.env.SMOKE_VYBORKA || 6), spisok.length);
  return Array.from({ length: n }, (_, i) => spisok[Math.floor((i * spisok.length) / n)]);
}

const norm = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&quot;/g, '"')
  .replace(/&#39;|&#x27;/g, "'").replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&mdash;/g, '—').replace(/&amp;/g, '&')
  .toLowerCase().replace(/ё/g, 'е').replace(/[^0-9a-zа-я]+/g, ' ').trim();
const hukKartochki = (d) => {
  const f = path.join(KOREN, 'src/content/days', `${d}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).hook ?? null : null;
};
// Адрес файла со страницы: «/x» — от корня, иначе — от <base href> (или папки музея, как failPublic).
const adresFaila = (d, src, base) => (src.startsWith('/') || /^https?:/.test(src) ? src : (base || `/muzei/${d.split('/')[0]}/`) + src);

const DNI = dniDlyaProverki();
test('есть дни для проверки', () => { expect(DNI.length, 'ни одного дня на адресе den').toBeGreaterThan(0); });

for (const d of DNI) {
  test(`день ${d}`, async ({ page, request }) => {
    const put = stranica(d);
    const otvet = await page.goto(put, { waitUntil: 'domcontentloaded' });
    expect(otvet?.status(), `код ответа ${put}`).toBe(200);
    const html = await otvet.text();
    if (DIST) {
      const vyl = fs.readFileSync(path.join(DIST, put, 'index.html'), 'utf8');
      expect(html === vyl, `${put}: живая страница не совпадает с выложенной сборкой — сайт в России старый`).toBe(true);
    }
    const huk = hukKartochki(d);
    expect(huk, `нет хука в карточке src/content/days/${d}.json`).toBeTruthy();
    const ozhidaem = process.env.SMOKE_SLOMAT === '1' ? `${huk} заведомо неверный хук пробы` : huk;
    expect(norm(html).includes(norm(ozhidaem)), `${put}: на странице нет хука карточки «${ozhidaem}»`).toBe(true);

    const base = html.match(/<base\s[^>]*href="([^"]+)"/)?.[1];
    const media = [];
    for (const m of html.matchAll(/<(?:video|source)\b[^>]*\ssrc="([^"]+\.mp4[^"]*)"/g)) media.push({ src: m[1], tip: 'video/mp4' });
    const ag = html.match(/MUSEUM_AUDIOGUIDE\s*=\s*\{[^}]*?"audioSrc"\s*:\s*"([^"]+)"/)?.[1];
    if (ag) media.push({ src: ag, tip: 'audio/mpeg' });
    for (const { src, tip } of media) {
      const u = adresFaila(d, src, base);
      const h = await request.head(u);
      expect(h.status(), `${put}: ${u} — код`).toBe(200);
      expect(h.headers()['content-type'] ?? '', `${put}: ${u} — тип`).toContain(tip);
      const f = DIST && path.join(DIST, decodeURI(u.split(/[?#]/)[0]));
      if (f && fs.existsSync(f)) expect(+h.headers()['content-length'], `${put}: ${u} — размер не как в сборке`).toBe(fs.statSync(f).size);
    }
    console.log(`${d}: 200, хук есть, файлов ${media.length} (${media.map((x) => x.tip).join(', ') || 'нет роликов и аудиогида'})`);
  });
}
