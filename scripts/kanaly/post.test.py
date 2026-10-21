#!/usr/bin/env python3
"""Пробы отбора поста 9:00 (scripts/kanaly/post.py), без сети и без отправки (21.10.2026).

Регрессия: день с анкетой body (ADR 0001) без HTML в src/data/full-pages — большая страница, как у сайта;
картинка берётся из блоков анкеты; анкета без картинки — отсечена причиной «нет картинки», без исключения.
  python3 scripts/kanaly/post.test.py
"""
import datetime as dt
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('post', HERE / 'post.py')
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)

KEY = '03-15'
DATE = dt.date(2027, 3, 15)


class Otbor(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.days, self.full, self.public = root / 'days', root / 'full', root / 'public'
        (root / 'src/data').mkdir(parents=True)
        (root / 'astro.config.mjs').write_text("  site: 'https://proba.example',\n  base: '/rc',\n", encoding='utf-8')
        (root / 'src/data/museums.json').write_text(json.dumps({'museums': [
            {'slug': 'proba', 'number': 1, 'title_ru': 'Музей проб'}]}), encoding='utf-8')
        (root / 'src/data/vozrast.json').write_text(json.dumps({'sajt': '6+', 'muzei': {}, 'dni': {}}), encoding='utf-8')
        self.saved = (P.ROOT, P.DAYS, P.FULL, P.PUBLIC)
        P.ROOT, P.DAYS, P.FULL, P.PUBLIC = root, self.days, self.full, self.public
        (self.days / 'proba').mkdir(parents=True)
        (self.public / 'muzei/proba/img').mkdir(parents=True)
        (self.public / 'muzei/proba/img/kadr.jpg').write_bytes(b'\xff\xd8\xff')

    def tearDown(self):
        P.ROOT, P.DAYS, P.FULL, P.PUBLIC = self.saved
        self.tmp.cleanup()

    def card(self, body_html):
        day = {'hook': 'Хук дня.', 'images': [], 'doc': {}, 'body': [
            {'type': 'dvizhok', 'src': 'assets/museum-chrome.js'},
            {'type': 'oblozhka', 'html': body_html}]}
        (self.days / 'proba' / f'{KEY}.json').write_text(json.dumps(day, ensure_ascii=False), encoding='utf-8')

    def test_anketa_s_kartinkoy_kandidat(self):
        self.card('<section><img class="x" src="img/kadr.jpg" alt=""></section>')
        otsev = {}
        found = P.collect(KEY, [], otsev)
        self.assertEqual([m['slug'] for m in found], ['proba'])
        self.assertEqual(found[0]['image'], (self.public / 'muzei/proba/img/kadr.jpg').resolve())
        post, _ = P.build(DATE, otsev)
        self.assertIsNotNone(post)
        self.assertNotIn('нет большой страницы', otsev)

    def test_anketa_bez_kartinki_otsechena(self):
        self.card('<section><p>Без картинки</p><img src="og/oblozhka.png" alt=""></section>')
        otsev = {}
        post, _ = P.build(DATE, otsev)  # без FileNotFoundError: HTML большой страницы нет
        self.assertIsNone(post)
        self.assertEqual(otsev, {'нет картинки': 1})
        self.assertIn('нет картинки — 1', P.otsev_text(otsev))

    def test_net_bolshoy_stranicy(self):
        (self.days / 'proba' / f'{KEY}.json').write_text(json.dumps({'hook': 'Хук.'}), encoding='utf-8')
        otsev = {}
        self.assertEqual(P.build(DATE, otsev)[0], None)
        self.assertEqual(otsev, {'нет большой страницы': 1})


if __name__ == '__main__':
    unittest.main(verbosity=2)
