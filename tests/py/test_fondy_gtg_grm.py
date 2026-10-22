"""Третьяковка и Русский музей: датировка с карточки и год для строгой сверки (без сети)."""
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts/fondy'))
import rusmuseum  # noqa: E402
import tretyakov  # noqa: E402


class Datirovka(unittest.TestCase):
    def test_diapazon(self):
        self.assertEqual(tretyakov.datirovka('1905–1906'), (1905, 1906))
        self.assertEqual(tretyakov.datirovka('1876'), (1876, 1876))
        self.assertEqual(tretyakov.datirovka('Первая половина 1820-х'), (1820, 1829))
        self.assertIsNone(tretyakov.datirovka(''))

    def test_god_dlya_sverki(self):
        self.assertEqual(tretyakov.god_dlya_sverki('1876', '1876'), '1876')
        self.assertTrue(tretyakov.god_dlya_sverki('1905–1906', '1906').startswith('1906'))
        self.assertTrue(tretyakov.god_dlya_sverki('1905–1906', '1910').startswith('1905'))
        self.assertEqual(tretyakov.god_dlya_sverki('', '1906'), '')


class NuxtGRM(unittest.TestCase):
    def test_kartochka(self):
        a = [{'name': 1, 'artist': 2, 'propertyYears': 3, 'detailPicture': 4, 'detailUrl': 6},
             'Купчиха за чаем', 'Б.М.Кустодиев ', '1918', {'src': 5, 'description': 7},
             '/upload/x/Ж-1 kupchiha.webp', '/collections/a/b/', 'Кустодиев Б. Купчиха за чаем. 1918.']
        h = f'<script type="application/json" id="__NUXT_DATA__">{json.dumps(a, ensure_ascii=False)}</script>'
        c = rusmuseum.nuxt_kartochka(h)
        self.assertEqual((c['name'], c['artist'], c['propertyYears']), ('Купчиха за чаем', 'Б.М.Кустодиев', '1918'))
        self.assertEqual(c['image'], '/upload/x/Ж-1 kupchiha.webp')
        self.assertEqual(rusmuseum.nuxt_kartochka('<html></html>'), {})


if __name__ == '__main__':
    unittest.main()
