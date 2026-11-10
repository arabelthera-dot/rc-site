// Подкаст-лента /podkast.xml из аудиогидов дней (п.504, Р746): RSS 2.0 + теги itunes (их читают ВК Подкасты, Звук)
// и Яндекса (yandex:*, Яндекс Музыка). Выпуск — готовый день (есть хук или текст, как в /rss.xml), у которого гид уже
// на сайте: файл гида ищет тот же proverit() замка медиа (scripts/media-dnya.mjs) в public/ — своего поиска нет.
// Заголовок — название дня, описание — хук, enclosure — mp3 гида с длиной файла, guid — адрес страницы дня,
// pubDate — дата дня в 2027 (09:00 по Москве). Обложка 3000×3000 — знак проекта public/icon-512.png, увеличенный sharp.
// Флаг podkast в src/data/nastroyki.json: false — шаг спит, ленты в dist нет (откат = false).
// Запуск после astro build: node scripts/podkast.mjs --proba && node scripts/podkast.mjs --dist dist
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { proverit } from './media-dnya.mjs';

const args = process.argv.slice(2);
const DIST = args.includes('--dist') ? args[args.indexOf('--dist') + 1] : 'dist';
const SITE = 'https://russian-civilization.ru';
const OBLOZHKA = 'podkast-oblozhka.jpg';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cdata = (s) => `<![CDATA[${String(s).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
// Модуль можно подключить (vypuski, lenta, xmlOk) без запуска главной части.
const MAIN = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
const LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Выпуски: full — src/data/full-pages, days — src/content/days, root — public/ (там mp3 гидов).
export function vypuski({ full, days, root }) {
  const out = [];
  for (const muzey of fs.readdirSync(full).sort()) {
    for (const f of fs.readdirSync(path.join(full, muzey)).filter((x) => /^\d\d-\d\d\.html$/.test(x)).sort()) {
      const key = f.slice(0, 5);
      const dj = path.join(days, muzey, `${key}.json`);
      if (!fs.existsSync(dj)) continue;
      const d = JSON.parse(fs.readFileSync(dj, 'utf8'));
      if (!(d.hook || d.gist) || !d.title) continue;
      const html = fs.readFileSync(path.join(full, muzey, f), 'utf8');
      const r = proverit(html, muzey, root);
      if (r.ag.length || !r.agFayl) continue;
      const m = +key.slice(0, 2) - 1;
      const den = Math.min(+key.slice(3), LEN[m]);
      out.push({
        muzey, key, title: d.title, hook: d.hook || d.gist, sek: r.agSek,
        url: `/${r.agFayl}`, dlina: fs.statSync(path.join(root, r.agFayl)).size,
        link: `${SITE}/muzei/${muzey}/den/${key}/`,
        date: new Date(Date.UTC(2027, m, den, 6, 0, 0)),
      });
    }
  }
  return out.sort((a, b) => b.date - a.date || a.link.localeCompare(b.link));
}

const hms = (s) => { s = Math.round(s || 0); return [s / 3600 | 0, (s / 60 | 0) % 60, s % 60].map((x) => String(x).padStart(2, '0')).join(':'); };

export function lenta(items) {
  const opis = 'Аудиогиды дней города-музея «Русская цивилизация»: каждый день — победа, открытие или первенство русских, рассказ на несколько минут.';
  const obl = `${SITE}/${OBLOZHKA}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:yandex="http://news.yandex.ru" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Русская цивилизация</title>
<link>${SITE}/</link>
<atom:link href="${SITE}/podkast.xml" rel="self" type="application/rss+xml"/>
<description>${esc(opis)}</description>
<language>ru</language>
<copyright>© Русская цивилизация</copyright>
<itunes:author>Русская цивилизация</itunes:author>
<itunes:summary>${esc(opis)}</itunes:summary>
<itunes:explicit>false</itunes:explicit>
<itunes:type>episodic</itunes:type>
<itunes:image href="${obl}"/>
<itunes:category text="History"/>
<itunes:owner><itunes:name>Русская цивилизация</itunes:name><itunes:email>info@russian-civilization.ru</itunes:email></itunes:owner>
<image><url>${obl}</url><title>Русская цивилизация</title><link>${SITE}/</link></image>
<yandex:language>ru</yandex:language>
<yandex:category>История</yandex:category>
${items.map((v) => `<item>
<title>${esc(v.title)}</title>
<description>${cdata(v.hook)}</description>
<itunes:summary>${esc(v.hook)}</itunes:summary>
<link>${v.link}</link>
<guid isPermaLink="true">${v.link}</guid>
<pubDate>${v.date.toUTCString().replace('GMT', '+0000')}</pubDate>
<enclosure url="${esc(SITE + encodeURI(v.url))}" length="${v.dlina}" type="audio/mpeg"/>
<itunes:duration>${hms(v.sek)}</itunes:duration>
<itunes:explicit>false</itunes:explicit>
<itunes:episodeType>full</itunes:episodeType>
</item>`).join('\n')}
</channel>
</rss>
`;
}

// Проверка XML без зависимостей: каждый открытый тег закрыт в своём порядке, сущности только известные.
export function xmlOk(xml) {
  const body = xml.replace(/^<\?xml[^>]*\?>/, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/i.test(body)) return 'голый &';
  const stek = [];
  for (const m of body.matchAll(/<(\/?)([\w:.-]+)[^>]*?(\/?)>/g)) {
    if (m[3]) continue;
    if (!m[1]) { stek.push(m[2]); continue; }
    if (stek.pop() !== m[2]) return `тег ${m[2]} закрыт не по порядку`;
  }
  return stek.length ? `не закрыт ${stek.join(',')}` : '';
}

async function oblozhka(dist) {
  const sharp = (await import('sharp')).default;
  await sharp('public/icon-512.png').resize(3000, 3000, { kernel: 'lanczos3' }).flatten({ background: '#1a1512' })
    .jpeg({ quality: 90 }).toFile(path.join(dist, OBLOZHKA));
}

if (MAIN && args.includes('--proba')) {
  // Заведомые дни: гид есть → выпуск; нет файла, не готов, гид в игре → не выпуск. Лента — валидный XML, выпусков столько, сколько гидов.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'podkast-proba-'));
  const full = path.join(tmp, 'full/proba'), days = path.join(tmp, 'days/proba'), pub = path.join(tmp, 'public/muzei/proba');
  for (const p of [full, days, pub]) fs.mkdirSync(p, { recursive: true });
  const kadr = Buffer.from([0xff, 0xfb, 0x90, 0x64, ...Array(413).fill(0)]);
  fs.writeFileSync(path.join(pub, 'audio-guide-a-ru.mp3'), Buffer.concat(Array(Math.ceil(60 * 44100 / 1152)).fill(kadr)));
  const ag = (src) => `<section id="audioguide"><audio controls data-guide-audio data-src="${src}"></audio></section>`;
  const den = (key, html, d) => { fs.writeFileSync(path.join(full, `${key}.html`), html); fs.writeFileSync(path.join(days, `${key}.json`), JSON.stringify(d)); };
  den('01-05', ag('audio-guide-a-ru.mp3'), { title: 'Первые в мире & «кавычки» <тег>', hook: 'Хук ]]> с концом CDATA' });
  den('02-29', ag('/muzei/proba/audio-guide-a-ru.mp3'), { title: 'Високосный', hook: 'Хук' });
  den('01-06', ag('net.mp3'), { title: 'Нет файла', hook: 'Хук' });
  den('01-07', ag('audio-guide-a-ru.mp3'), { title: 'Не готов' });
  den('01-08', '<section id="games"><audio data-guide-audio data-src="audio-guide-a-ru.mp3"></audio></section>', { title: 'Гид в игре', hook: 'Хук' });
  const v = vypuski({ full: path.join(tmp, 'full'), days: path.join(tmp, 'days'), root: path.join(tmp, 'public') });
  const xml = lenta(v);
  const bez = xmlOk(lenta([]));
  const oshibki = [];
  if (v.length !== 2) oshibki.push(`выпусков ${v.length}, ждали 2`);
  if ((xml.match(/<item>/g) || []).length !== v.length) oshibki.push('item не равно выпускам');
  if (xmlOk(xml)) oshibki.push(`XML: ${xmlOk(xml)}`);
  if (bez) oshibki.push(`XML пустой ленты: ${bez}`);
  if (!xml.includes('length="' + v[0]?.dlina + '"') || !xml.includes('type="audio/mpeg"')) oshibki.push('нет enclosure с длиной');
  if (!xml.includes('Mon, 01 Mar 2027') && !xml.includes('Sun, 28 Feb 2027')) oshibki.push('29.02 не зажато в 2027');
  if (xmlOk('<a><b></a></b>') === '' || xmlOk('<a>&</a>') === '') oshibki.push('проверка XML не ловит брак');
  fs.rmSync(tmp, { recursive: true, force: true });
  if (oshibki.length) { console.log(`::error::podkast: проба — ${oshibki.join('; ')}`); process.exit(1); }
  console.log(`podkast: проба зелёная (выпусков ${v.length} из 2, XML цел)`);
  process.exit(0);
}

if (MAIN) {
  const flag = JSON.parse(fs.readFileSync('src/data/nastroyki.json', 'utf8')).podkast === true;
  if (!flag) { console.log('podkast: флаг podkast выключен (src/data/nastroyki.json) — ленты нет'); process.exit(0); }
  const items = vypuski({ full: 'src/data/full-pages', days: 'src/content/days', root: 'public' });
  const xml = lenta(items);
  const bad = xmlOk(xml);
  if (bad) { console.log(`::error::podkast: лента не XML — ${bad}`); process.exit(1); }
  fs.writeFileSync(path.join(DIST, 'podkast.xml'), xml);
  await oblozhka(DIST);
  console.log(`podkast: ${DIST}/podkast.xml — выпусков ${items.length} (столько дней с гидом на сайте)`);
}
