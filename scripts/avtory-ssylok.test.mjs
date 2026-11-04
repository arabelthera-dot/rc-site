// М78 (AI_Projects #2357, 04.11.2026): регрессия сверки авторов ссылок (src/lib/avtory-ssylok.mjs), без сети.
// 1) разбор автора: JSON-LD, meta author, подпись; адрес профиля — не автор;
// 2) проба во временной папке: прежний источник Родионова 23 янв. (kommersant.ru/doc/476951, автор Олег Кашин) —
//    красная; адреса нет в кэше — «не проверено», не красная; исключение по дню снимает находку;
// 3) текущие файлы с кэшем data/avtory-ssylok.json — зелёные.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { avtorIz, sverkaAvtorov } from '../src/lib/avtory-ssylok.mjs';

if (process.env.AVTORY_SSYLOK === '0') { console.log('avtory-ssylok.test: выключена (AVTORY_SSYLOK=0)'); process.exit(0); }
let oshibok = 0;
const proverka = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) oshibok++; };

proverka(avtorIz('<script type="application/ld+json">{"@graph":[{"@type":"NewsArticle","author":[{"@type":"Person","name":"Олег Кашин"}]}]}</script>') === 'Олег Кашин', 'JSON-LD author в @graph');
proverka(avtorIz('<meta name="author" content="Павел Коробов"><meta property="article:author" content="https://example.ru/p/1">') === 'Павел Коробов', 'meta author; адрес профиля — не автор');
proverka(avtorIz('<div class="article__author">Анна Петрова</div><a href="/login" class="authorization">Войти</a>') === 'Анна Петрова', 'подпись class=author, «authorization» — мимо');
proverka(avtorIz('<html><p>Текст без автора</p></html>') === '', 'без автора — пусто');

const URL = 'https://www.kommersant.ru/doc/476951';
const proba = ({ kesh, isk = {} }) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'avtory-'));
  fs.mkdirSync(path.join(root, 'data/reestry'), { recursive: true });
  for (const f of fs.readdirSync('data/reestry')) fs.copyFileSync(path.join('data/reestry', f), path.join(root, 'data/reestry', f));
  fs.writeFileSync(path.join(root, 'data/reestry/isklyucheniya.json'), JSON.stringify(isk));
  fs.mkdirSync(path.join(root, 'src/content/days/ne-sdayutsya'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/content/days/ne-sdayutsya/01-23.json'), JSON.stringify({ key: '01-23', title: 'Евгений Родионов',
    source: `«Коммерсантъ», 2004 — ${URL}` }));
  if (kesh) fs.writeFileSync(path.join(root, 'data/avtory-ssylok.json'), JSON.stringify(kesh));
  const s = sverkaAvtorov(root);
  fs.rmSync(root, { recursive: true, force: true });
  return s;
};
const kashin = { [URL]: { status: 'ok', kod: 200, avtor: 'Олег Кашин; Павел Коробов', data: '2026-11-04' } };
let s = proba({ kesh: kashin });
const n = s.inoagenty[0];
proverka(s.inoagenty.length === 1 && n.den === 'ne-sdayutsya/01-23' && n.url === URL && /Кашин Олег/.test(n.imya),
  n ? `Родионов 23 янв.: красная — ${n.den}: ${n.url} — «${n.imya}»` : 'Родионов 23 янв.: Кашин не пойман');
s = proba({});
proverka(s.inoagenty.length === 0 && s.neProvereno.includes(URL), 'нет в кэше — «не проверено», не красная');
s = proba({ kesh: { [URL]: { status: 'oshibka', kod: 403, avtor: '', data: '2026-11-04', oshibka: 'HTTP 403' } } });
proverka(s.inoagenty.length === 0 && s.neProvereno.length === 1, 'ошибка скачивания — «не проверено», не красная');
s = proba({ kesh: kashin, isk: { 'ne-sdayutsya/01-23|олег кашин': 'проба' } });
proverka(s.inoagenty.length === 0, 'исключение дня из isklyucheniya.json снимает находку');

s = sverkaAvtorov('.');
proverka(s.inoagenty.length === 0, `текущие файлы зелёные (ссылок ${s.ssylok}, проверено ${s.provereno}, автор найден ${s.sAvtorom}, иноагентов ${s.inoagenty.length})`
  + s.inoagenty.map((x) => `\n    ${x.den}: ${x.url} — «${x.avtor}» = «${x.imya}»`).join(''));

process.exit(oshibok ? 1 : 0);
