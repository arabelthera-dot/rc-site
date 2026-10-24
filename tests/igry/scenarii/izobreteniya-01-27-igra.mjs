// «Эльбрус» (27 янв.): плитки рецепта — на ленту шагов. Тапами: плитка, потом шаг.
// Один повар: три плитки без зависимостей, остальное машина докладывает сама. Два повара: суп в 4 шага.
const polozhit = (id, ryad) => [
  { imya: `плитка ${id}`, tap: `.el-pool .el-tile[data-id="${id}"]`, posle: 150 },
  { imya: `→ шаг ${ryad + 1}`, tap: `.el-row[data-row="${ryad}"]`, gde: [0.06, 0.5], posle: 200 },
];
export default {
  imya: 'Эльбрус, 27 янв.', put: 'chernovik/izobreteniya-01-27-igra.html', igra: '[data-elbrus-igra]', final: '.el-finale',
  shagi: [
    ...polozhit('w1', 0), ...polozhit('p1', 1), ...polozhit('g', 2),
    { imya: '«Позвать второго повара»', tap: '.el-next', zhdat: 8000 },
    ...polozhit('w1', 0), ...polozhit('p1', 0),
    ...polozhit('w2', 1), ...polozhit('p2', 1),
    ...polozhit('w3', 2), ...polozhit('p3', 2),
    ...polozhit('s', 3), ...polozhit('g', 3),
    { imya: '«Кто так считал первым?»', tap: '.el-next', zhdat: 8000 },
  ],
  zhdatFinal: 4000,
};
