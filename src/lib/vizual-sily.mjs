// Расчёты «Соотношения сил» (src/components/den/vizual/Sily.astro): масштаб фигурки, вид фигурки по подписи,
// слова при числах, строка перевеса. Один файл и для сборки, и для браузера (FIGURKI — контуры фигурок 24×24).
// Пробы: node scripts/vizual-sily.test.mjs

// Больше 200 фигурок у одной стороны не рисуем: шаг 1, 2, 5, 10, 20, 50… — наименьший, при котором влезает.
export const PREDEL_FIGUROK = 200;
export function masshtabSil(nashi, vrag, predel = PREDEL_FIGUROK) {
  const bolshe = Math.max(nashi, vrag);
  for (let poryadok = 1; ; poryadok *= 10)
    for (const k of [1, 2, 5]) if (bolshe / (k * poryadok) <= predel) return k * poryadok;
}

// Вид фигурки — по словам подписей обеих сторон; первое совпадение по порядку списка.
const VIDY = [
  ['orudie', /оруди|пушк|пушек|карронад|ствол|артиллер/],
  ['tank', /танк/],
  ['korabl', /корабл|судн|судов|фрегат|линкор|бриг|эсминц|крейсер/],
];
export function vidFigurki(tekst = '') {
  const t = tekst.toLowerCase();
  return VIDY.find(([, re]) => re.test(t))?.[0] ?? 'chelovek';
}

const SLOVA = {
  chelovek: ['человек', 'человека', 'человек'],
  orudie: ['орудие', 'орудия', 'орудий'],
  korabl: ['корабль', 'корабля', 'кораблей'],
  tank: ['танк', 'танка', 'танков'],
};
export function forma(n, [odin, dva, pyat]) {
  const d = n % 100, e = n % 10;
  if (d >= 11 && d <= 14) return pyat;
  if (e === 1) return odin;
  if (e >= 2 && e <= 4) return dva;
  return pyat;
}
export const slovoFigurki = (vid, n) => forma(n, SLOVA[vid] ?? SLOVA.chelovek);

// «Перевес врага — в 10 раз», «— в 2,5 раза»; меньше полутора раз или перевес наш — строки нет.
export function razVo(nashi, vrag) {
  if (!(nashi > 0) || !(vrag / nashi >= 1.5)) return '';
  const r = vrag / nashi;
  const okr = r >= 10 ? Math.round(r) : Math.round(r * 10) / 10;
  const celoe = Number.isInteger(okr);
  const slovo = celoe ? forma(okr, ['раз', 'раза', 'раз']) : 'раза';
  return `Перевес врага — в ${okr.toLocaleString('ru-RU')} ${slovo}`;
}

export const FIGURKI = {
  chelovek: 'M12 1.8a3.2 3.2 0 1 1 0 6.4a3.2 3.2 0 1 1 0-6.4ZM7.5 9.4h9l1.3 7h-2.7l-.6 5.8h-5l-.6-5.8H6.2Z',
  orudie: 'M1.5 9.6 20 4.4l1.6 4.6L3 14.6ZM9 11a5 5 0 1 1 0 10a5 5 0 1 1 0-10ZM12 18.4h9.5v2.6H12Z',
  korabl: 'M2 15h20l-3.5 5.6h-13ZM11.3 2h1.4v13h-1.4ZM13.4 3.6 20 13.4h-6.6ZM10.6 5.2 4.8 13.4h5.8Z',
  tank: 'M4 15h16a3 3 0 0 1 0 6H4a3 3 0 0 1 0-6ZM6.5 10.4h9.5l1.6 4.1H5ZM15 11.2h7.5v1.7H15Z',
};
