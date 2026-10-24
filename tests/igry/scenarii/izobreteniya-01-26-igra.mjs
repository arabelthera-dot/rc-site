// Срезневский, 26 янв.: тап по верху верёвки — шар поднимается на 1100 м → «Снять!» → проявка → тап по краю шторки.
export default {
  imya: 'Срезневский, 26 янв.',
  put: 'chernovik/izobreteniya-01-26-igra.html',
  igra: '[data-shar-igra]',
  final: '.sr-finale',
  shagi: [
    { imya: 'тап по верху верёвки — поднять шар', tap: '.sr-rope', gde: [0.5, 0.02] },
    { imya: '«Снять!»', tap: '.sr-shoot', zhdat: 10000 },
    { imya: 'тап по левому краю шторки', tap: '#sr-shtorka .fl-frame', gde: [0.08, 0.5], zhdat: 12000 },
  ],
  zhdatFinal: 5000,
};
