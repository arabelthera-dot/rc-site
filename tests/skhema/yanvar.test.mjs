// Пробы замка января (src/lib/zamok-yanvarya.mjs, Р570 п.2): по одному нарушению каждого вида — красно с «день, факт N: …»,
// живой январь двух музеев — зелёный (найденный брак — в долге src/data/yanvar-dolg.json), не январь — замок молчит.
// Запуск: node --test tests/skhema/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import YAML from 'yaml';
import { skhema } from '../../src/lib/dni-shablon.mjs';
import { skhemaNeSdayutsya } from '../../src/lib/dni-ne-sdayutsya.mjs';
import { snimki, sverkaTekstov, tekst } from '../../src/lib/zakon.mjs';

const SKHEMY = { izobreteniya: skhema, 'ne-sdayutsya': skhemaNeSdayutsya };
const chitat = (muzei, key) => YAML.parse(fs.readFileSync(`src/content/dni-shablon/${muzei}/${key}.yaml`, 'utf8'));
const oshibki = (d) => { const r = SKHEMY[d.muzei].safeParse(d); return r.success ? '' : r.error.issues.map((x) => x.message).join('\n'); };
const zamok = (d) => oshibki(d).split('\n').filter((s) => /^(izobreteniya|ne-sdayutsya) \d\d-\d\d, /.test(s)).join('\n');

// Запретное имя для пробы — первая запись снимков, которую сверка сборки ловит в простом тексте.
const zapretnoe = snimki().flatMap((s) => (s.zapisi || []).flatMap((z) => (z.varianty || []).map((v) => v.tekst)))
  .find((t) => sverkaTekstov([tekst('proba 0', `Упомянут ${t}.`)]).sovpadeniya.length);

const s = (d, f) => { const k = structuredClone(d); f(k); return k; };
const OBRAZEC = chitat('izobreteniya', '01-05');

test('живой январь двух музеев проходит замок', () => {
  for (const muzei of Object.keys(SKHEMY))
    for (const f of fs.readdirSync(`src/content/dni-shablon/${muzei}`).filter((x) => /^01-\d\d\.yaml$/.test(x)))
      assert.equal(zamok(chitat(muzei, f.slice(0, 5))), '', `${muzei}/${f}`);
});

for (const [imya, pravka, zhdu] of [
  ['а) смягчение «одним из первых»', (k) => { k.fakty[0].udary[1].summary += ' Шухов стал одним из первых.'; },
    /^izobreteniya 01-05, факт 2 \(summary\): смягчение «одним из первых»/m],
  ['а) смягчение «по некоторым данным»', (k) => { k.story.abzacy[0] = `По некоторым данным, ${k.story.abzacy[0]}`; },
    /^izobreteniya 01-05, поле story\.abzacy\.0: смягчение «по некоторым данным»/m],
  ['а) нет «в мире» в заголовке', (k) => { k.lead.h1 = 'Первый расчётный нефтепровод — Владимир Шухов'; },
    /^izobreteniya 01-05, поле lead\.h1: нет «в мире»/m],
  ['б) запретное имя', (k) => { k.fakty[0].udary[2].det = [`Упомянут ${zapretnoe}.`]; },
    /^izobreteniya 01-05, факт 3 \(det\.0\): запретное имя/m],
  ['в) нет адреса источника', (k) => { delete k.fakty[0].udary[0].href; },
    /^izobreteniya 01-05, факт 1 \(href\): нет адреса источника/m],
]) test(`красно: ${imya}`, () => assert.match(zamok(s(OBRAZEC, pravka)), zhdu));

test('не январь — замок молчит', () => {
  const k = s(OBRAZEC, (x) => { x.key = '02-05'; x.fakty[0].udary[1].summary += ' Шухов стал одним из первых.'; delete x.fakty[0].udary[0].href; });
  assert.equal(zamok(k), '');
});
