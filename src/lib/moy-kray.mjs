// «Мой край» (п.505, Р746): страница /moy-kray/ — карта 89 субъектов России сеткой квадратов (src/data/moy-kray.json),
// у области — все готовые дни всех музеев, связанные с её местами. Дни — src/lib/etot-den.mjs (один источник
// с «Этим днём» и страницами /god/, п.497), места — связи дня со словарём src/data/slovar.json (тип mesto), свой
// словарь не заводится. Область без дней — серая, без ссылки. ВЫКЛЮЧЕНО: включает PUBLIC_MOY_KRAY=1 (страницы
// и блока на главной нет). Как в мире — тайловые карты-сетки (NPR, Washington Post) и getStaticPaths Astro.
import fs from 'node:fs';
import { gotovyeDni } from './etot-den.mjs';
import kraya from '../data/moy-kray.json' with { type: 'json' };
import slovar from '../data/slovar.json' with { type: 'json' };

export const krayOn = () => process.env.PUBLIC_MOY_KRAY === '1';
export const adresKraya = (base) => `${base}moy-kray/`;

const svyaziDnya = (d) => {
  const p = `src/content/days/${d.museum}/${d.key}.json`;
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, 'utf8')).slovar ?? []).filter((id) => id.startsWith('mesto:')) : [];
};
const nazvanieMesta = (id) => slovar[id]?.nazvanie ?? id;

let cache;
// { oblasti: [{ kod, nazvanie, kratko, ryad, kol, mesta, dni: [день + mesta дня] }], zaKartoy: [{ id, nazvanie, dni }],
//   dney } — дни области по дате и номеру музея; dney — сколько разных дней привязано хоть к одной области.
export function kray() {
  if (cache) return cache;
  const dni = [...gotovyeDni().values()].flat().sort((a, b) => a.key.localeCompare(b.key))
    .map((d) => ({ ...d, svyazi: svyaziDnya(d) })).filter((d) => d.svyazi.length);
  const sobrat = (mesta) => dni.filter((d) => d.svyazi.some((m) => mesta.includes(m)))
    .map((d) => ({ ...d, mesta: d.svyazi.filter((m) => mesta.includes(m)).map(nazvanieMesta) }));
  const oblasti = kraya.oblasti.map((o) => ({ ...o, dni: sobrat(o.mesta) }));
  const zaKartoy = kraya.za_kartoy.map((id) => ({ id, nazvanie: nazvanieMesta(id), dni: sobrat([id]) })).filter((z) => z.dni.length);
  const vMeste = new Set(oblasti.flatMap((o) => o.dni.map((d) => `${d.museum}/${d.key}`)));
  cache = { oblasti, zaKartoy, dney: vMeste.size };
  return cache;
}
