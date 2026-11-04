// Пробы схемы утверждённой карточки (src/lib/skhema-utverzhdeno.mjs): «кадр без факта» — красно, живые карточки — зелёные.
// Запуск: node --test tests/skhema/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { kartochkaUtv } from '../../src/lib/skhema-utverzhdeno.mjs';

const KOREN = 'src/data/utverzhdeno';
const kartochki = fs.readdirSync(KOREN, { withFileTypes: true }).filter((d) => d.isDirectory())
  .flatMap((d) => fs.readdirSync(path.join(KOREN, d.name)).filter((f) => /^\d\d-\d\d\.json$/.test(f)).map((f) => path.join(KOREN, d.name, f)));
const obrazec = JSON.parse(fs.readFileSync(kartochki[0], 'utf8'));
const sKadrom = (pravka) => ({ ...obrazec, kadry: obrazec.kadry.map((x, i) => (i === 0 ? { ...x, ...pravka } : x)) });
const oshibka = (d) => { const r = kartochkaUtv.safeParse(d); return r.success ? '' : r.error.issues.map((x) => x.message).join('\n'); };

test('живые карточки проходят схему', () => {
  assert.ok(kartochki.length > 0);
  for (const f of kartochki) assert.equal(oshibka(JSON.parse(fs.readFileSync(f, 'utf8'))), '', f);
});

for (const [imya, pravka, zhdu] of [
  ['кадр с прочерком «к факту: —»', { mesto: null, fakt: null, takzhe: [], privyazka: '—' }, /нет привязки к факту \(«к факту: —»\)/],
  ['кадр без строки привязки', { mesto: null, fakt: null, takzhe: [], privyazka: null }, /нет привязки к факту \(«к факту: пусто»\)/],
  ['кадр с голым «нет»', { mesto: null, fakt: null, takzhe: [], privyazka: 'нет' }, /нет привязки к факту/],
  ['кадр «к факту: общий»', { mesto: null, fakt: null, takzhe: [], privyazka: 'общий' }, /непонятная привязка «общий»/],
  ['номер факта вне карточки', { mesto: 'fakt', fakt: 99, takzhe: [], privyazka: '99' }, /номер факта вне карточки: 99/],
  ['второй номер вне карточки', { mesto: 'fakt', fakt: obrazec.fakty[0].n, takzhe: [40], privyazka: '1, 40' }, /номер факта вне карточки: 40/],
]) test(`красно: ${imya}`, () => assert.match(oshibka(sKadrom(pravka)), zhdu));

for (const [imya, pravka] of [
  ['обложка', { mesto: 'oblozhka', fakt: null, takzhe: [], privyazka: 'обложка' }],
  ['галерея', { mesto: 'galereya', fakt: null, takzhe: [], privyazka: 'галерея' }],
  ['«нет (пояснение)»', { mesto: 'net', fakt: null, takzhe: [], privyazka: 'нет (снимок другого года)' }],
  ['к факту 1', { mesto: 'fakt', fakt: obrazec.fakty[0].n, takzhe: [], privyazka: String(obrazec.fakty[0].n) }],
]) test(`зелено: ${imya}`, () => assert.equal(oshibka(sKadrom(pravka)), ''));
