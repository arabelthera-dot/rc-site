// Выход дня по дате (Р686 п.7, Р688): день, готовый заранее, появляется на сайте в свой день сам. Как в мире —
// «scheduled publishing» статического сайта: запись с будущей датой не попадает в сборку, ночная пересборка по
// расписанию (deploy.yml, schedule) выпускает её в свой день (Hugo buildFuture: https://gohugo.io/methods/page/publishdate/ ,
// Jekyll future: https://jekyllrb.com/docs/configuration/options/ ).
// Свой день — god_pokaza-ММ-ДД, 00:00 по Москве. Год — из самой записи, нет в ней — из карточки дня того же музея и ключа
// (src/content/dni-shablon/<музей>/ММ-ДД.yaml): страница строится из записи days, а год показа часто стоит только в карточке.
// Нет god_pokaza нигде — день вне расписания, выходит сразу, как раньше.
// Выключатель — переменная RC_PO_DATE: пусто — выключено, всё как раньше; '1' — по времени сборки;
// дата ISO ('2027-02-01T00:10+03:00') — «как будто сборка в этот момент», для пробы. Откат — убрать переменную.
import fs from 'node:fs';
import YAML from 'yaml';
import { mskIso } from './msk.mjs';

const vkl = () => process.env.RC_PO_DATE || '';
const moment = () => (vkl() === '1' ? new Date() : new Date(vkl()));

const godKartochki = (muzei, key) => {
  const f = `src/content/dni-shablon/${muzei}/${key}.yaml`;
  return fs.existsSync(f) ? YAML.parse(fs.readFileSync(f, 'utf8'))?.god_pokaza : undefined;
};

/** Вышел ли день к моменту сборки: d — запись days ({ museum, key }) или карточка dni-shablon ({ muzei, key }). */
export function vyshel(d) {
  if (!vkl()) return true;
  const god = d?.god_pokaza ?? godKartochki(d?.museum ?? d?.muzei, d?.key);
  if (!Number.isInteger(god)) return true;
  const m = moment();
  if (Number.isNaN(+m)) throw new Error(`RC_PO_DATE: «${vkl()}» — не '1' и не дата ISO`);
  return `${god}-${d.key}` <= mskIso(m);
}
