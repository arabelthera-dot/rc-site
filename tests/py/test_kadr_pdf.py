"""Р134: кадр со страницы PDF библиотеки (put «rusneb:адрес#page=N») — без сети."""
import importlib.util, io, unittest
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('kadr', ROOT / 'scripts/kadr.py')
kadr = importlib.util.module_from_spec(spec); spec.loader.exec_module(kadr)


def pdf(*razmery):
    import pymupdf
    doc = pymupdf.open()
    for w, h in razmery:
        pg = doc.new_page()
        b = io.BytesIO(); Image.new('RGB', (w, h), 'red').save(b, 'JPEG')
        pg.insert_image(pg.rect, stream=b.getvalue())
    return doc.tobytes()


class TestPdf(unittest.TestCase):
    def test_stranica(self):
        im = Image.open(io.BytesIO(kadr.pdf_stranica(pdf((500, 700), (900, 1200)), 2)))
        self.assertEqual(im.size, (900, 1200))

    def test_net_stranicy(self):
        with self.assertRaises(SystemExit):
            kadr.pdf_stranica(pdf((500, 700)), 3)

    def test_ne_pdf(self):
        with self.assertRaises(SystemExit):
            kadr.pdf_stranica(b'\xff\xd8jpeg', 1)

    def test_biblioteki_ne_v_poiske(self):
        self.assertIn('rusneb', kadr.PDF_FONDY)
        self.assertNotIn('rusneb', kadr.FONDY)


if __name__ == '__main__':
    unittest.main()
