// r405 (28.10.2026): регрессия сверки с реестрами (src/lib/zakon.mjs). r380 нашёл мимо сверки Каспарова (иноагент,
// «имя фамилия») в sport/02-17 и 06-25 и «Facebook AI Research» в yaml шаблона дня izobreteniya/01-19.
// 1) без раздела «ждёт решения Сергея, r380» сверка обязана поймать все три места на текущих файлах;
// 2) проба во временной папке: «Гарри Каспаров» и «Facebook» без пометки — красная, с исключением или пометкой — зелёная.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sverkaReestrov } from '../src/lib/zakon.mjs';

let oshibok = 0;
const proverka = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) oshibok++; };

const r380 = [['sport/02-17', 'Каспаров Гарри Кимович', 'каспаров'], ['sport/06-25', 'Каспаров Гарри Кимович', 'каспаров'], ['izobreteniya/01-19', 'Meta Platforms', 'facebook']];
// Место r380, убранное из содержания (19 янв. изобретений переписан r403, #544), — не ошибка: ловить там нечего.
const estVSoderzhanii = (id, slovo) => [`src/content/days/${id}.json`, `src/content/dni-shablon/${id}.yaml`]
  .some((f) => fs.existsSync(f) && fs.readFileSync(f, 'utf8').toLowerCase().includes(slovo));
const bez = sverkaReestrov('.', { bezZhdut: true });
for (const [id, kto, slovo] of r380) {
  if (!estVSoderzhanii(id, slovo)) { console.log(`· ${id}: «${slovo}» убрано из содержания — ловить нечего`); continue; }
  const s = bez.sovpadeniya.find((x) => x.gde.startsWith(`${id} `) && x.imya.includes(kto));
  proverka(!!s, s ? `красная без исключения: ${s.gde}: «${s.imya}» — ${s.reestr} (найдено «${s.variant}»)` : `${id}: «${kto}» не пойман`);
}
const s = sverkaReestrov('.');
proverka(s.sovpadeniya.length === 0, `main с исключениями зелёный (совпадений ${s.sovpadeniya.length}, ждут решения ${s.zhdut.length})`);

// Проба: свой корень с теми же реестрами и одной карточкой json + одной yaml.
const proba = (isk, hook = 'Гарри Каспаров сыграл с машиной.') => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zakon-'));
  fs.mkdirSync(path.join(root, 'data/reestry'), { recursive: true });
  for (const f of fs.readdirSync('data/reestry')) if (f !== 'isklyucheniya.json') fs.copyFileSync(path.join('data/reestry', f), path.join(root, 'data/reestry', f));
  fs.writeFileSync(path.join(root, 'data/reestry/isklyucheniya.json'), JSON.stringify(isk));
  fs.mkdirSync(path.join(root, 'src/content/days/proba'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/content/days/proba/01-01.json'), JSON.stringify({ key: '01-01', title: 'Проба', hook }));
  fs.mkdirSync(path.join(root, 'src/content/dni-shablon/proba'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/content/dni-shablon/proba/01-02.yaml'), 'karty:\n  - det:\n      - Статью написали в Facebook AI Research.\n');
  const r = sverkaReestrov(root);
  fs.rmSync(root, { recursive: true, force: true });
  return r;
};
const krasnaya = proba({});
proverka(krasnaya.sovpadeniya.length === 2, `проба без исключения красная: ${krasnaya.sovpadeniya.map((x) => `${x.gde} «${x.variant}»`).join('; ')}`);
const zelenaya = proba({ 'proba/01-01|гарри каспаров': 'проба r405', 'proba/01-02|facebook': 'проба r405' });
proverka(zelenaya.sovpadeniya.length === 0, `проба с исключением зелёная (совпадений ${zelenaya.sovpadeniya.length})`);
const pometka = proba({ 'proba/01-02|facebook': 'проба r405' }, 'Гарри Каспаров (признан в РФ иностранным агентом) сыграл с машиной.');
proverka(pometka.sovpadeniya.length === 0, `проба с пометкой «иностранный агент» зелёная (совпадений ${pometka.sovpadeniya.length})`);
const familiya = proba({ 'proba/01-02|facebook': 'проба r405' }, 'Гарри Кимович Каспаров сыграл с машиной, а Каспаров, Гарри — ещё раз.');
proverka(familiya.sovpadeniya.length === 1, `«Гарри Кимович Каспаров» ловится (совпадений ${familiya.sovpadeniya.length})`);
process.exit(oshibok ? 1 : 0);
