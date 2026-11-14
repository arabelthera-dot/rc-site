// Год и век по всем музеям (п.497, Р745): страницы /god/<ГГГГ>/ и /vek/<N>/ — все готовые дни всех музеев
// с этим годом или веком события, и фильтры поиска pagefind (век, музей, что в дне, место) на странице дня.
// Один источник — готовые дни src/lib/etot-den.mjs (год — card.year, иначе пометка даты полной страницы, п.183);
// год — только четыре цифры: «портрет народа», «без повода», пусто — не год, в страницы и фильтр века не идут.
// Места — связи дня со словарём src/data/slovar/ (тип mesto). ВЫКЛЮЧЕНО: включает PUBLIC_VREMYA=1
// (страниц /god/ и /vek/ нет, фильтров в индексе нет). Как в мире — pagefind.app/docs/filtering/.
import fs from 'node:fs';
import { gotovyeDni } from './etot-den.mjs';
import slovar from './slovar-dannye.mjs';

export const vremyaOn = () => process.env.PUBLIC_VREMYA === '1';

const RIM = [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]];
export const rim = (n) => RIM.reduce((s, [r, v]) => { while (n >= v) { s += r; n -= v; } return s; }, '');
export const godChislom = (y) => (/^\d{4}$/.test(String(y ?? '').trim()) ? +String(y).trim() : null);
export const vekGoda = (g) => Math.floor((g - 1) / 100) + 1;
export const nazvanieVeka = (n) => `${rim(n)} век`;
export const adresGoda = (base, g) => `${base}god/${g}/`;
export const adresVeka = (base, n) => `${base}vek/${n}/`;

let cache;
// Все готовые дни с годом: [{ ...день из gotovyeDni, god, vek }] по году, внутри года — по дате и номеру музея.
export function dniSGodom() {
  if (cache) return cache;
  cache = [...gotovyeDni().values()].flat().map((d) => ({ ...d, god: godChislom(d.year) })).filter((d) => d.god)
    .map((d) => ({ ...d, vek: vekGoda(d.god) })).sort((a, b) => a.god - b.god || a.key.localeCompare(b.key));
  return cache;
}
export const gody = () => [...new Set(dniSGodom().map((d) => d.god))];
export const veka = () => [...new Set(dniSGodom().map((d) => d.vek))].sort((a, b) => a - b);

// Фильтры pagefind дня museum/key: { век: [...], музей: [...], 'что в дне': [...], место: [...] } — только где есть.
export function filtryDnya(museum, key) {
  const d = (gotovyeDni().get(key) ?? []).find((x) => x.museum === museum);
  if (!d) return {};
  const f = { музей: [d.museumTitle] };
  const g = godChislom(d.year);
  if (g) f['век'] = [nazvanieVeka(vekGoda(g))];
  if (d.vnutri?.length) f['что в дне'] = d.vnutri;
  const p = `src/content/days/${museum}/${key}.json`;
  const svyazi = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).slovar ?? [] : [];
  const mesta = svyazi.filter((id) => id.startsWith('mesto:') && slovar[id]).map((id) => slovar[id].nazvanie);
  if (mesta.length) f['место'] = mesta;
  return f;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Пустые метки для копии HTML в памяти (src/integrations/poisk.mjs) — на диске разметка дня не меняется.
export const metkiFiltrov = (f) => Object.entries(f).flatMap(([k, vs]) => vs.map((v) => `<span data-pagefind-filter="${esc(k)}:${esc(v)}"></span>`)).join('');
