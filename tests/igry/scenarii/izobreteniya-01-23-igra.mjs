// Умов, 23 янв.: «Верёвка с колокольчиком» — три задания кнопками (без удержаний).
export default {
  imya: 'Умов, 23 янв.',
  put: 'chernovik/izobreteniya-01-23-igra.html',
  igra: '[data-umov-igra]',
  final: '.uv-finale',
  shagi: [
    { imya: '1: «Дёрнуть» — колокольчик звенит', tap: '.uv-pull' },
    { imya: 'ждать задание 2 (глаз)', zhdi: '.uv-eye' },
    { imya: '2: глаз «глазами Умова»', tap: '.uv-eye', posle: 300 },
    { imya: '2: «Дёрнуть»', tap: '.uv-pull' },
    { imya: 'ждать задание 3 (палец)', zhdi: '.uv-pin', zhdat: 15000 },
    { imya: '3: кнопка «палец» — прижать верёвку', tap: '.uv-pin', posle: 300 },
    { imya: '3: «Дёрнуть»', tap: '.uv-pull' },
  ],
  zhdatFinal: 15000,
};
