// Пробы курсов (src/lib/kursy.mjs, п.506): не меньше трёх курсов, в каждом 7–10 дней из двух и больше музеев,
// каждая ссылка — на собранный готовый день, вопросы теста — из викторин этих же дней. Запуск: node --test tests/kursy/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { kursy } from '../../src/lib/kursy.mjs';
import { gotovyeDni } from '../../src/lib/etot-den.mjs';

const vse = kursy();
test('не меньше трёх курсов', () => assert.ok(vse.length >= 3, `курсов ${vse.length}`));
for (const k of vse) test(`курс ${k.id}`, () => {
  assert.ok(k.dni.length >= 7 && k.dni.length <= 10, `дней ${k.dni.length}`);
  assert.ok(new Set(k.dni.map((d) => d.museum)).size >= 2, 'один музей');
  for (const d of k.dni) {
    assert.ok((gotovyeDni().get(d.key) ?? []).some((x) => x.museum === d.museum), `${d.museum}/${d.key} — не готовый день`);
    assert.ok(fs.existsSync(`src/data/full-pages/${d.museum}/${d.key}.html`) || fs.existsSync(`src/content/days/${d.museum}/${d.key}.json`), `${d.museum}/${d.key} — нет страницы`);
  }
  const svoi = new Set(k.dni.map((d) => `${d.museum}/${d.key}`));
  for (const v of k.voprosy) {
    assert.ok(svoi.has(`${v.museum}/${v.key}`), `вопрос не из дней курса: ${v.q}`);
    assert.ok(v.a >= 0 && v.a < v.o.length, `ответ вне списка: ${v.q}`);
  }
});
