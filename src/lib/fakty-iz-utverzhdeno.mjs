// Текст фактов дня — из копии утверждённого (Р686 п.1, Сергей 09.11.2026): страница дня строится машиной из утверждённого
// файла, помощник факты руками не переписывает. Путь один: knowledge/utverzhdeno → src/data/utverzhdeno/<музей>/ММ-ДД.json
// (scripts/utverzhdeno-kopiya.mjs) → страница. У дня с 02-01 и копией утверждённого заголовок факта (summary) и «Подробнее»
// (det) берутся из копии, порядок — её «poryadok»; в yaml шаблона у факта остаётся только своё: n — номер факта
// в утверждённом, источник, отрывок, кадр, пометка, поля формы. Блоки «Десять фактов» / «Ещё» сохраняют свои размеры.
// Факты yaml без n идут по месту: i-й факт страницы — i-й номер poryadok (так их сопоставлял сверщик).
// Образец — ссылка вместо копии, как reference() в Astro content collections (документация Astro, раздел content collections).
// Выключатель RC_FAKTY_IZ_UTVERZHDENO=0 — прежний путь: текст yaml главнее, из копии берётся только недостающий текст.
// Откат — RC_FAKTY_IZ_UTVERZHDENO=0 или убрать вызовы faktyIzUtverzhdeno (den-obshchee, zakon, sverka/chitat-stranicu).
import fs from 'node:fs';
import path from 'node:path';

export const S_DNYA = '02-01';
const vklyucheno = () => process.env.RC_FAKTY_IZ_UTVERZHDENO !== '0';

// syroe — разобранный yaml дня; koren — корень сайта. Возвращает { syroe, oshibki }: syroe с подставленным текстом
// (новый объект, исходный не меняется), oshibki — строки для общего списка ошибок карточек.
export function faktyIzUtverzhdeno(syroe, muzei, key, koren = '.') {
  const f = path.join(koren, 'src/data/utverzhdeno', muzei, `${key}.json`);
  if (!syroe?.fakty || key < S_DNYA || !fs.existsSync(f)) return { syroe, oshibki: [] };
  const utv = JSON.parse(fs.readFileSync(f, 'utf8'));
  const poNomeru = new Map(utv.fakty.map((x) => [x.n, x]));
  const poryadok = utv.poryadok?.length ? utv.poryadok : utv.fakty.map((x) => x.n);
  const bloki = [syroe.fakty].flat();
  const udary = bloki.flatMap((b) => b.udary ?? []);
  const gde = `${muzei}/${key}: текст фактов из ${f}`;
  if (udary.length !== poryadok.length)
    return { syroe, oshibki: [`${gde} — фактов в yaml ${udary.length}, в утверждённом ${poryadok.length}`] };
  const sN = udary.filter((u) => u.n != null).length;
  if (sN && sN !== udary.length) return { syroe, oshibki: [`${gde} — номер n есть не у всех фактов yaml (${sN} из ${udary.length})`] };
  let vPoryadke = udary.map((u, i) => ({ ...u, n: u.n ?? poryadok[i] }));
  if (sN) {
    const poN = new Map(vPoryadke.map((u) => [u.n, u]));
    const lishnie = vPoryadke.map((u) => u.n).filter((n) => !poryadok.includes(n));
    if (lishnie.length || poN.size !== poryadok.length)
      return { syroe, oshibki: [`${gde} — номера n в yaml (${vPoryadke.map((u) => u.n).join(', ')}) не те, что в утверждённом (${poryadok.join(', ')})`] };
    vPoryadke = poryadok.map((n) => poN.get(n));
  }
  const net = poryadok.filter((n) => !poNomeru.has(n));
  if (net.length) return { syroe, oshibki: [`${gde} — в утверждённом нет фактов ${net.join(', ')} из poryadok`] };
  const glavnee = vklyucheno();
  const sTekstom = vPoryadke.map((u) => {
    const x = poNomeru.get(u.n);
    return glavnee || !u.summary ? { ...u, summary: x.zagolovok, det: [x.podrobnee] } : u;
  });
  let i = 0;
  const novye = bloki.map((b) => ({ ...b, udary: (b.udary ?? []).map(() => sTekstom[i++]) }));
  return { syroe: { ...syroe, fakty: Array.isArray(syroe.fakty) ? novye : novye[0] }, oshibki: [] };
}
