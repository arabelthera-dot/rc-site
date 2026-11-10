// node --test scripts/domeny-otpechatki.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { domenHozyaina, priznaki, razborGlavnoy, razborWhois } from './domeny-otpechatki.mjs';

test('домен хозяина', () => {
  assert.equal(domenHozyaina('lib.pushkinskijdom.ru'), 'pushkinskijdom.ru');
  assert.equal(domenHozyaina('www.museum.msk.ru'), 'museum.msk.ru');
  assert.equal(domenHozyaina('rg.ru'), 'rg.ru');
});

test('whois ТЦИ', () => {
  const o = razborWhois('domain:        RG.RU\nregistrar:     RU-CENTER-RU\ncreated:       1999-02-11T12:00:00Z\npaid-till:     2027-02-28T21:00:00Z\n');
  assert.deepEqual(o, { registrator: 'RU-CENTER-RU', sozdan: '1999-02-11', istekaet: '2027-02-28' });
  assert.deepEqual(razborWhois('No entries found for the selected source(s).'), { net: true });
});

test('главная', () => {
  assert.deepEqual(razborGlavnoy('<html lang="ru-RU"><head><title> Российская\n газета </title>'), { title: 'Российская газета', lang: 'ru' });
});

test('признаки смены', () => {
  const s = { registrator: 'RU-CENTER-RU', sozdan: '1999-02-11', istekaet: '2027-02-28', title: 'Российская газета — новости', lang: 'ru', konec: 'rg.ru' };
  assert.deepEqual(priznaki(s, { ...s, title: 'Российская газета: главное' }, '2026-11-10'), []);
  assert.deepEqual(priznaki(s, { ...s, oshibka: 'главная не открылась', title: null, lang: null }, '2026-11-10'), []);
  const p = priznaki(s, { ...s, sozdan: '2026-05-01', title: 'Best casino online', lang: 'en' }, '2026-11-10');
  assert.equal(p.length, 3);
  assert.equal(priznaki(s, { ...s, istekaet: '2026-10-01' }, '2026-11-10').length, 1);
  assert.equal(priznaki(s, { net: true }, '2026-11-10').length, 1);
});
