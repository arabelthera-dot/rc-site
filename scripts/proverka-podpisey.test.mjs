// Самотест proverka-podpisey (21.10.2026): проверка обязана ронять полные страницы, а не только карточки.
// Корень: до 21.10 полные страницы были «только отчёт» — у новых музеев набралось 293 кадра без лицензии.
// Собираем временный корень с одной полной страницей и смотрим код выхода.
// Запуск: node scripts/proverka-podpisey.test.mjs   Код 1 — проверка врёт.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, 'proverka-podpisey.mjs');
const page = (fig, rights = false) => `<html><body><h1>Тест</h1>${fig}${rights ? '<table class="rights-table"><tr><td>Права</td></tr></table>' : ''}</body></html>`;
const NOCAP = '<img src="/a.jpg" alt="Кадр без подписи">';
const PARTIAL = '<figure><img src="/a.jpg" alt="Кадр"><figcaption>Фото: Иванов</figcaption></figure>';
const OK = '<figure><img src="/a.jpg" alt="Кадр"><figcaption>Фото: Викисклад, CC BY-SA 4.0</figcaption></figure>';

const make = (html, dolg) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'podpisi-test-'));
  fs.mkdirSync(path.join(root, 'src/content/days'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src/data/full-pages/novyy'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.writeFileSync(path.join(root, 'src/data/full-pages/novyy/01-01.html'), html);
  if (dolg) fs.writeFileSync(path.join(root, 'scripts/podpisi-dolg.json'), JSON.stringify(dolg));
  return root;
};
const cases = [
  ['подписанный кадр', page(OK), null, 0],
  ['кадр без подписи на полной странице', page(NOCAP), null, 1],
  ['подпись без лицензии на полной странице', page(PARTIAL), null, 1],
  ['только таблица прав, музея нет в долге', page(NOCAP, true), null, 1],
  ['только таблица прав, в пределах потолка', page(NOCAP, true), { novyy: 1 }, 0],
  // Р136: кадр Госкаталога без лицензии — подписан только полной атрибуцией; без держателя или номера — брак
  ['Госкаталог: полная подпись источника', page('<figure><img src="/a.jpg" alt="Кадр"><figcaption>Ракета. Фото: автор не указан, 1957. Хранится: Мемориальный музей космонавтики. Госкаталог музейного фонда РФ, № <a href="#">27352216</a></figcaption></figure>'), null, 0],
  ['Госкаталог: подпись без держателя', page('<figure><img src="/a.jpg" alt="Кадр"><figcaption>Ракета. Фото: автор не указан, 1957. Госкаталог музейного фонда РФ, № 27352216</figcaption></figure>'), null, 1],
  ['Госкаталог: подпись без номера', page('<figure><img src="/a.jpg" alt="Кадр"><figcaption>Ракета. Фото: автор не указан, 1957. Хранится: Мемориальный музей космонавтики. Госкаталог музейного фонда РФ</figcaption></figure>'), null, 1],
  ['только таблица прав, сверх потолка', page(NOCAP + NOCAP.replace('a.jpg', 'b.jpg'), true), { novyy: 1 }, 1],
];
let bad = 0;
for (const [name, html, dolg, want] of cases) {
  const r = spawnSync(process.execPath, [SCRIPT, '--root', make(html, dolg)], { encoding: 'utf8' });
  const ok = r.status === want;
  if (!ok) bad++;
  console.log(`${ok ? 'ок ' : 'БРАК'} ${name}: код ${r.status}, ждали ${want}${ok ? '' : '\n' + r.stdout + r.stderr}`);
}
if (bad) { console.error(`\nОШИБКА: самотест proverka-podpisey — ${bad} из ${cases.length} неверно.`); process.exit(1); }
console.log(`\nСамотест proverka-podpisey: ${cases.length} из ${cases.length}.`);
