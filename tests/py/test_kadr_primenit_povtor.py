"""Р90: вторая копия кадра дня (крупный + превью) берёт уже сохранённый скан того же адреса, без сети и без «файл уже есть»."""
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
import kadr  # noqa: E402


class PovtorKadra(unittest.TestCase):
    def test_vtoraya_kopiya_beret_gotovyy_skan(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            hit = dict(fond='ГТГ', card='https://my.tretyakov.ru/app/masterpiece/1', image='https://x.ru/scan/abc.jpg',
                       avtor='Кустодиев', god='1919')
            imya = kadr.slug(f'{hit["fond"]}-abc')
            gotov = root / 'public' / f'muzei/sport/img/01-01-{imya}.jpg'
            gotov.parent.mkdir(parents=True)
            Image.new('RGB', (800, 600)).save(gotov)
            den = root / 'den.json'
            den.write_text(json.dumps({'images': [{'src': 'a.jpg'}, {'src': 'a-330t.webp'}]}))
            k = dict(muzey='sport', den='01-01', fayl='a-330t.webp', avtor='', god='', put=den, vid='json', i=1)
            with mock.patch.object(kadr, 'ROOT', root), mock.patch.object(kadr, 'sources', lambda: {}), \
                    mock.patch.object(kadr, 'fetch', side_effect=AssertionError('сеть не нужна')):
                self.assertTrue(kadr.primenit(k, hit))
            self.assertEqual(json.loads(den.read_text())['images'][1]['src'], f'muzei/sport/img/01-01-{imya}.jpg')


if __name__ == '__main__':
    unittest.main()
