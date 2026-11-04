// Каркас карточки дня из старой страницы — диспетчер (Р493). Договор адаптеров — scripts/karkas/README.md.
// По имени музея грузит scripts/karkas/<музей>.mjs; адаптер даёт export function razobrat(html, json, den):
//   html — текст старой страницы src/data/full-pages/<музей>/ММ-ДД.html или null (страницы нет),
//   json — запись дня src/content/days/<музей>/ММ-ДД.json или null, den — ключ дня «ММ-ДД».
// Возвращает поля карточки (как в src/content/dni-shablon/<музей>/ММ-ДД.yaml, без muzei/key/fakty) и nety: [...] —
// чего на старой странице нет (поле пустое, работа не останавливается). Факты карточки ставит машина утверждённого
// (у НС — scripts/ns-iz-utverzhdennyh.mjs), не адаптер.
// Запуск для проверки: node scripts/karkas-iz-staroy.mjs <музей> ММ-ДД — печатает, что разобрано и чего нет.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function adapter(muzei) {
  const file = path.join(KOREN, 'scripts/karkas', `${muzei}.mjs`);
  if (!fs.existsSync(file)) throw new Error(`${file}: адаптера музея «${muzei}» нет — договор в scripts/karkas/README.md`);
  const mod = await import(pathToFileURL(file).href);
  if (typeof mod.razobrat !== 'function') throw new Error(`${file}: нет export function razobrat(html, json, den)`);
  return mod;
}

// Старая страница и запись дня с диска (нет файла — null) → адаптер музея.
export async function karkas(muzei, den) {
  const chitat = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
  const html = chitat(path.join(KOREN, 'src/data/full-pages', muzei, `${den}.html`));
  const zap = chitat(path.join(KOREN, 'src/content/days', muzei, `${den}.json`));
  const { razobrat } = await adapter(muzei);
  const polya = razobrat(html, zap && JSON.parse(zap), den);
  polya.nety ??= [];
  return polya;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [muzei, den] = process.argv.slice(2);
  if (!muzei || !/^\d\d-\d\d$/.test(den ?? '')) { console.error('нужно: node scripts/karkas-iz-staroy.mjs <музей> ММ-ДД'); process.exit(1); }
  const { nety, ...polya } = await karkas(muzei, den);
  console.log(`${muzei}/${den}: поля ${Object.keys(polya).join(', ')}`);
  for (const s of nety) console.log(`  нет: ${s}`);
}
