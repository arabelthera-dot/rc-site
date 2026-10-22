"""Р90: найденный кадр пишется в data/r90-naydeno.tsv сразу и читается назад — дозапуск и --primenit без сети."""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
import kadr  # noqa: E402


class Naydeno(unittest.TestCase):
    def test_zapis_i_chtenie(self):
        with tempfile.TemporaryDirectory() as d:
            put = Path(d) / 'r90-naydeno.tsv'
            k = dict(muzey='karikatura', den='01-01', fayl='muzei/karikatura/media/bear.jpg')
            hit = ({'fond': 'hermitage', 'card': 'https://h/1', 'image': 'https://h/1.jpg', 'avtor': 'Теребенёв\tИ.', 'god': '1807'},
                   'автор + год + название')
            kadr.naydeno_zapisat(put, k, hit)
            kadr.naydeno_zapisat(put, dict(k, den='01-02'), hit)
            d_ = kadr.naydeno_chitat(put)
            self.assertEqual(len(d_), 2)
            h, sverka = d_[('karikatura', '01-01', k['fayl'])]
            self.assertEqual((h['fond'], h['image'], sverka), ('hermitage', 'https://h/1.jpg', 'автор + год + название'))
            self.assertEqual(put.read_text().count('\n'), 3, 'шапка + 2 строки, табуляция в значении не ломает строку')

    def test_net_fayla(self):
        self.assertEqual(kadr.naydeno_chitat(Path('/nonexistent/r90-naydeno.tsv')), {})


if __name__ == '__main__':
    unittest.main()
