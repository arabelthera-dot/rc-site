// Дом Ошевнева, 1 янв.: «Дом против метели» (3D) — «Начать испытание», затем по очереди обе компоновки;
// после каждой метель идёт ~2 с, потом открывается следующая кнопка. Финал — блок «Твой результат».
export default {
  imya: 'Дом Ошевнева, 1 янв.',
  put: 'muzei/arhitektura/den/01-01/',
  igra: '[data-house3d]',
  final: '[data-house3d-reveal]:not([hidden])',
  shagi: [
    { imya: '«Начать испытание»', tap: '[data-house3d-start]' },
    { imya: '«Поставить отдельно»', tap: '[data-house-layout="separate"]:not(:disabled)', zhdat: 20000 },
    { imya: '«Соединить параллельно» (после метели)', tap: '[data-house-layout="wallet"]:not(:disabled)', zhdat: 10000 },
  ],
  zhdatFinal: 10000,
};
