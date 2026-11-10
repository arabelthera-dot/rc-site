// Сторож «Истории дня» и «Вспомни» (п.503, Р745): у каждой карточки дня экраны начинаются обложкой, кончаются игрой,
// на экране не больше 280 знаков; флаги в коде выключены. Запуск: node tests/istoriya.mjs
import fs from 'node:fs';
import yaml from 'js-yaml';
import assert from 'node:assert/strict';
import { ekrany, korotko, DO_ZNAKOV } from '../src/lib/istoriya.mjs';

const kod = fs.readFileSync('src/lib/istoriya.mjs', 'utf8');
assert.match(kod, /const VKL_ISTORIYA = false;/, 'История дня должна быть выключена');
assert.match(kod, /const VKL_VSPOMNI = false;/, '«Вспомни» должно быть выключено');
assert.equal(korotko('а'.repeat(400)).length <= DO_ZNAKOV, true);
let n = 0;
for (const muzei of fs.readdirSync('src/content/dni-shablon')) {
  for (const f of fs.readdirSync(`src/content/dni-shablon/${muzei}`).filter((x) => x.endsWith('.yaml'))) {
    const d = yaml.load(fs.readFileSync(`src/content/dni-shablon/${muzei}/${f}`, 'utf8'));
    if (d.adres !== 'den') continue;
    const ek = ekrany(d, '/');
    assert.equal(ek[0].vid, 'oblozhka', `${muzei}/${f}: первый экран — обложка`);
    assert.equal(ek.at(-1).vid, 'igra', `${muzei}/${f}: последний экран — игра`);
    assert.ok(ek.some((e) => e.vid === 'fakt'), `${muzei}/${f}: нет фактов`);
    for (const e of ek) if (e.tekst) assert.ok(e.tekst.length <= DO_ZNAKOV, `${muzei}/${f}: экран длиннее ${DO_ZNAKOV}: ${e.tekst.length}`);
    n++;
  }
}
console.log(`istoriya: ${n} дней, экраны в норме`);
