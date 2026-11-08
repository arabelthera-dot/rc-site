// Картинка по постоянному номеру (Р648, Р649, очередь 222/258): в карточке дня вместо пути — «kartinka:000123»,
// путь от public/ — одной строкой в реестре src/data/kartinki.json (номер → put, istochnik, licenziya).
// Перенёс файл в другую папку — правишь put в реестре, дни не трогаешь. Неизвестный номер — сборка падает.
// Номер не переиспользуется; новый — следующий за последним (scripts/kartinki-nomera.mjs).
// Образец: стабильные идентификаторы IIIF Image API 3.0 (https://iiif.io/api/image/3.0/) — номер не зависит от места хранения.
import fs from 'node:fs';

export const REESTR = 'src/data/kartinki.json';
export const NOMER = /^kartinka:(\d{6})(\?.*)?$/;
let kesh;
export const reestr = () => (kesh ??= JSON.parse(fs.readFileSync(REESTR, 'utf8')).kartinki);

// Номер → путь. slesh: true — «/muzei/…» (карточки dni-shablon), false — «muzei/…» (карточки days). Не номер — как есть.
export function kartinka(v, { slesh = false, gde = '' } = {}) {
  const m = typeof v === 'string' && NOMER.exec(v);
  if (!m) return v;
  const k = reestr()[m[1]];
  if (!k) throw new Error(`${gde ? `${gde}: ` : ''}картинки ${v} нет в реестре ${REESTR}`);
  return (slesh ? '/' : '') + k.put + (m[2] ?? '');
}

// Вся карточка: каждое значение-номер заменяется путём; остальное не меняется.
export function razreshit(d, opt = {}) {
  const gde = opt.gde ?? [d?.museum ?? d?.muzei, d?.key].filter(Boolean).join('/');
  const obhod = (x) => (Array.isArray(x) ? x.map(obhod)
    : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, obhod(v)]))
      : kartinka(x, { ...opt, gde }));
  return obhod(d);
}
