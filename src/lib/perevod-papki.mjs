// Переводы — по папке на язык (Р649 п.263): файл строк дня и игры раньше держал все языки в одном json, теперь
// каждый язык — свой файл в папке своего кода: src/data/perevod/<код>/<музей>-<ММ-ДД>.json (русский — в perevod/ru/),
// src/data/igry/stroki/<код>/<музей>-<ММ-ДД>.json (русский игры остаётся в src/data/igry/stroki/<музей>-<ММ-ДД>.json —
// его пишут stroki-igr и stroki-ruchnyh-igr, игры не меняются). Файл языка устроен как прежний общий, но с одним языком:
// { "_", "<код>": { ключ: текст }, "_otpechatki": { "<код>": … }, "_gotovo": { "<код>": дата } }. chitat() склеивает
// папки обратно в прежний вид { "_", "ru", "<код>"…, "_otpechatki", "_gotovo" } — прочий код машины перевода не меняется.
// Как в мире: папка на язык — i18next «locales/<lng>/<ns>.json» (https://www.i18next.com/how-to/add-or-load-translations),
// маска файлов Weblate «locales/*/file.json» (https://docs.weblate.org/en/latest/admin/projects.html#file-mask),
// Astro — папка на язык (https://docs.astro.build/en/guides/internationalization/).
import fs from 'node:fs';
import path from 'node:path';

export const PAPKA_DNYA = 'src/data/perevod';
export const PAPKA_IGR = 'src/data/igry/stroki';
const KODY = JSON.parse(fs.readFileSync('src/data/yazyki.json', 'utf8')).yazyki.map((y) => y.code);
const RAZDELY = ['_otpechatki', '_gotovo'];

/** Папки языков внутри papka (только коды из src/data/yazyki.json). */
const papkiYazykov = (papka) => (fs.existsSync(papka) ? KODY.filter((c) => fs.existsSync(path.join(papka, c))) : []);

/** Склеить язык в общий вид: { _, <код>…, _otpechatki, _gotovo }. */
function dobavit(fayl, chast) {
  for (const [k, v] of Object.entries(chast)) {
    if (k === '_') fayl._ ??= v;
    else if (RAZDELY.includes(k)) Object.assign((fayl[k] ??= {}), v);
    else fayl[k] = v;
  }
  return fayl;
}

/** Файл строк id (<музей>-<ММ-ДД>) в прежнем общем виде; ничего нет — null. Корневой файл (русский игры) — первым. */
export function chitat(papka, id) {
  const fayl = {};
  let est = false;
  for (const f of [path.join(papka, `${id}.json`), ...papkiYazykov(papka).map((c) => path.join(papka, c, `${id}.json`))]) {
    if (!fs.existsSync(f)) continue;
    dobavit(fayl, JSON.parse(fs.readFileSync(f, 'utf8')));
    est = true;
  }
  return est ? fayl : null;
}

/** Все id, у которых есть хоть один язык в папках языков. */
export function vseId(papka) {
  const out = new Set();
  for (const c of papkiYazykov(papka)) for (const f of fs.readdirSync(path.join(papka, c))) if (f.endsWith('.json')) out.add(f.slice(0, -5));
  return [...out].sort();
}

/** Записать общий вид по папкам языков. ruVKorne — русский остаётся в корневом файле (игры): его не трогаем.
 *  Возвращает записанные пути. */
export function zapisat(papka, id, fayl, otstup = 1, { ruVKorne = false } = {}) {
  const zapisany = [];
  for (const code of Object.keys(fayl).filter((k) => !k.startsWith('_') && KODY.includes(k))) {
    if (code === 'ru' && ruVKorne) continue;
    const chast = { _: fayl._, [code]: fayl[code] };
    for (const r of RAZDELY) if (fayl[r]?.[code] !== undefined) chast[r] = { [code]: fayl[r][code] };
    const f = path.join(papka, code, `${id}.json`);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify(chast, null, otstup) + '\n');
    zapisany.push(f);
  }
  return zapisany;
}

/** id по пути файла языка или корневого файла: …/<код>/<id>.json или …/<id>.json → { papka, id }. */
export function razobrat(f) {
  const id = path.basename(f, '.json');
  const dir = path.dirname(f);
  return { papka: KODY.includes(path.basename(dir)) ? path.dirname(dir) : dir, id };
}
