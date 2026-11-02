// Пробы расчётов «Соотношения сил» (src/lib/vizual-sily.mjs). Запуск: node scripts/vizual-sily.test.mjs
import assert from 'node:assert/strict';
import { masshtabSil, vidFigurki, slovoFigurki, razVo } from '../src/lib/vizual-sily.mjs';

assert.equal(masshtabSil(18, 184), 1);              // «Меркурий»: 184 фигурки по одной
assert.equal(masshtabSil(300, 40000), 200);         // 40 000 — 200 фигурок, не 40 000 узлов
assert.equal(masshtabSil(1, 201), 2);
assert.equal(masshtabSil(5, 1000000), 5000);
assert.equal(vidFigurki('18 орудий брига «Меркурий» 184 пушки двух линейных кораблей'), 'orudie');
assert.equal(vidFigurki('экипаж брига'), 'korabl');
assert.equal(vidFigurki('защитники заставы'), 'chelovek');
assert.equal(slovoFigurki('orudie', 1), 'орудие');
assert.equal(slovoFigurki('chelovek', 200), 'человек');
assert.equal(slovoFigurki('korabl', 12), 'кораблей');
assert.equal(razVo(18, 184), 'Перевес врага — в 10 раз');
assert.equal(razVo(2, 5), 'Перевес врага — в 2,5 раза');
assert.equal(razVo(300, 40000), 'Перевес врага — в 133 раза');
assert.equal(razVo(10, 12), '');
assert.equal(razVo(100, 10), '');
console.log('vizual-sily: пробы прошли');
