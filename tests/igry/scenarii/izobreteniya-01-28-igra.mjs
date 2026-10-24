// Хавкин (28 янв.): ящик — в дом (закрыто), ящик — в Индию; 4 деревни тапом; волна холеры;
// чума — держать палец на ящике ~7 с (накопительно).
const derevnya = (n) => ({ imya: `деревня ${n}`, tap: `.hv-vil:nth-child(${n})`, posle: 200 });
export default {
  imya: 'Хавкин, 28 янв.', put: 'chernovik/izobreteniya-01-28-igra.html', igra: '[data-havkin-igra]', final: '.hv-finale',
  shagi: [
    { imya: 'ящик (дома)', tap: '.hv-crate-s1', posle: 2300 },
    { imya: 'ящик (в Индию)', tap: '.hv-crate-s1', posle: 2200 },
    derevnya(1), derevnya(2), derevnya(3), derevnya(4),
    { imya: '«Дальше» после волны', tap: '.hv-next', zhdat: 12000 },
    { povtor: [{ imya: 'держать ящик', hold: '.hv-crate-s2', ms: 3000, posle: 200 }], poka: '.hv-finale', max: 5 },
  ],
  zhdatFinal: 4000,
};
