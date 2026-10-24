// Корсаков, 25 янв.: вставить карту в станок → пробить жар/кашель/слабость → тап по строке лекарства № 4.
export default {
  imya: 'Корсаков, 25 янв.',
  put: 'chernovik/izobreteniya-01-25-igra.html',
  igra: '[data-korsakov-igra]',
  final: '.ko-finale',
  shagi: [
    { imya: 'перфокарта в станок', tap: '.ko-card-loom' },
    { imya: '«Дальше» после узора', tap: '.ko-next', zhdat: 8000 },
    { imya: 'пробить «Жар»', tap: '.ko-s2 [aria-label="Пробить: Жар"]' },
    { imya: 'пробить «Кашель»', tap: '.ko-s2 [aria-label="Пробить: Кашель"]' },
    { imya: 'пробить «Слабость»', tap: '.ko-s2 [aria-label="Пробить: Слабость"]' },
    { imya: 'строка лекарства № 4', tap: '.ko-s3 .ko-row >> nth=3', zhdat: 5000 },
  ],
  zhdatFinal: 5000,
};
