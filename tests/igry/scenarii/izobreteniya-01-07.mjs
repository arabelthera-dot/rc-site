// Колесов, 7 янв.: «Сшей обходной путь на бьющемся сердце» — кнопка пережатия, 8 секунд ЭКГ,
// затем 8 тапов по золотым точкам шва на холсте сердца (точки качаются с пульсом на ~1–2 px из 300).
// Финал — подпись «шов готов, кровь идёт в обход» (отдельного финального блока у игры нет).
const N = 8, J = { x: 112, y: 200 };
const tochki = Array.from({ length: N }, (_, i) => {
  const a = (i / N) * Math.PI * 2;
  return { imya: `стежок ${i + 1}`, tap: '#cvHeart', gde: [(J.x + Math.cos(a) * 15) / 300, (J.y + Math.sin(a) * 15) / 300], posle: 150 };
});
export default {
  imya: 'Колесов, 7 янв.',
  put: 'muzei/izobreteniya/den/01-07/',
  igra: '#games',
  final: '#shovTxt:has-text("шов готов")',
  shagi: [
    { imya: '«Пережать артерию и смотреть ЭКГ»', tap: '#clampGo' },
    { imya: 'ждать 8 секунд ЭКГ', zhdi: '#shovTxt:has-text("стежков 0 из 8")', zhdat: 12000 },
    { povtor: tochki, poka: '#shovTxt:has-text("шов готов")', max: 3 },
  ],
  zhdatFinal: 5000,
};
