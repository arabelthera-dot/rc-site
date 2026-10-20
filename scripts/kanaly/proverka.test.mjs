// Е8 (Р47): пробы проверки поста в каналы — заведомый брак отклонён, нормальный пост проходит. Без сети и без отправки:
// пост собирает scripts/kanaly/post.py --json, ссылки «открывает» заглушка — 200 только у существующего дня сайта.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { proverkaPosta, shemaDnya } from '../../src/lib/proverka-posta.mjs';
import { snimki } from '../../src/lib/zakon.mjs';

const SITE = 'https://russian-civilization.ru/';
const sobrat = (key) => JSON.parse(execFileSync('python3', ['scripts/kanaly/post.py', '--json', '--date', key], { encoding: 'utf8' }));
// Заглушка сети: 200 — адрес дня, у которого есть карточка, иначе 404.
const proverkaAdresa = async (u) => {
  const m = u.startsWith(SITE) && /^muzei\/([\w-]+)\/den\/(\d\d-\d\d)\/$/.exec(u.slice(SITE.length));
  return m && fs.existsSync(`src/content/days/${m[1]}/${m[2]}.json`) ? 200 : 404;
};
const shema = await shemaDnya();
const proverit = (post) => proverkaPosta(post, { site: SITE, shema, proverkaAdresa });
const kopiya = (p) => JSON.parse(JSON.stringify(p));
const zamenit = (p, from, to) => { p.tg = p.tg.split(from).join(to); p.vk = p.vk.split(from).join(to); return p; };
let n = 0;
const brak = async (imya, post, re) => {
  const r = await proverit(post);
  assert.ok(r.brak.some((s) => re.test(s)), `${imya}: не отклонён (брак: ${r.brak.join(' | ') || 'нет'})`);
  console.log(`отклонён — ${imya}: ${r.brak.find((s) => re.test(s))}`);
  n++;
};

// Нормальный пост — проходит.
const norma = sobrat('01-05');
assert.ok(norma?.main, 'на 01-05 пост не собрался');
const ok = await proverit(norma);
assert.deepEqual(ok.brak, [], `нормальный пост отклонён: ${ok.brak.join(' | ')}`);
console.log(`проходит — нормальный пост 01-05 (${norma.main.slug} + ${norma.also.length} в «Сегодня также»)`);

// 1. Имя из реестра Минюста в хуке (полное ФИО — сильное совпадение, как в сборке).
const zapis = snimki().filter((s) => s.fayl === 'inoagenty.json').flatMap((s) => s.zapisi || []).find((z) => (z.varianty || []).some((v) => !v.kavychki && !v.adres && v.tekst.split(' ').length === 3));
const fio = zapis.varianty.find((v) => !v.kavychki && !v.adres && v.tekst.split(' ').length === 3).tekst
  .split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
let p = kopiya(norma);
zamenit(p, p.main.hook, (p.main.hook = `${fio} рассказал эту сказку внукам у печки`));
await brak('имя из реестра', p, /Минюст/);

// 2. Второе предложение в хуке — схема записи дня из src/content.config.ts.
p = kopiya(norma);
zamenit(p, p.main.hook, (p.main.hook = `${norma.main.hook} А потом волк остался без хвоста.`));
await brak('второе предложение в хуке', p, /хук — одно предложение/);

// 3. Обрезанное имя музея.
p = kopiya(norma);
const cut = p.main.title.split(' ').slice(0, -1).join(' ');
zamenit(p, p.main.title, (p.main.title = cut));
await brak('обрезанное имя музея', p, /обрезанное имя|title_ru полностью/);

// 4. Битая ссылка.
p = kopiya(norma);
const bad = p.url.replace(/den\/\d\d-\d\d\/$/, 'den/13-45/');
zamenit(p, p.url, bad); p.urls = p.urls.map((u) => (u === p.url ? bad : u)); p.url = bad;
await brak('битая ссылка', p, /ответ 404/);

// 5. Ссылка не на сайт.
p = kopiya(norma);
zamenit(p, p.url, 'https://example.com/'); p.urls[0] = p.url = 'https://example.com/';
await brak('ссылка не на сайт', p, /не на https:\/\/russian-civilization\.ru\//);

// 6. День 16+ — тихий трагический день: post.py его не берёт, подложенный — отклонён.
const tihiy = sobrat('01-08');
assert.ok(![tihiy?.main, ...(tihiy?.also || [])].some((m) => m?.slug === 'ne-sdayutsya'), 'день 16+ попал в пост');
const karta = JSON.parse(fs.readFileSync('src/content/days/ne-sdayutsya/01-08.json', 'utf8'));
p = kopiya(tihiy);
p.also = [...p.also, { slug: 'ne-sdayutsya', title: 'Музей стойкости и подвига «Русские не сдаются»', hook: karta.hook.trim() }];
await brak('день 16+', p, /16\+ — тихий трагический день/);

// 7. Картинка не с сайта.
p = kopiya(norma);
p.image = 'README.md';
await brak('картинка не файл сайта', p, /не файл сайта/);

console.log(`пробы поста: нормальный проходит, бракованных отклонено ${n} из 7`);
