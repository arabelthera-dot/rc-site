"""Р136 (Сергей 22.10.2026): put --istochnik-fonda — кадр Госкаталога без открытой лицензии только с полной
атрибуцией; остальные фонды без прав по-прежнему отвергаются. python3 -m unittest discover tests/py"""
import importlib.util, io, json, tempfile, unittest
from pathlib import Path
from unittest import mock
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('kadr', ROOT / 'scripts/kadr.py')
kadr = importlib.util.module_from_spec(spec); spec.loader.exec_module(kadr)
MUZEY = 'Мемориальный музей космонавтики'


def jpeg():
    b = io.BytesIO(); Image.new('RGB', (600, 800), 'gray').save(b, 'JPEG'); return b.getvalue()


class TestIstochnik(unittest.TestCase):
    def test_podpis_polnaya(self):
        p = kadr.gk_podpis('автор не указан', '1957', MUZEY, '27352216')
        self.assertEqual(p, 'Фото: автор не указан, 1957. Хранится: Мемориальный музей космонавтики. '
                            'Госкаталог музейного фонда РФ, № 27352216')
        g = kadr.GK_CREDIT.match(p)
        self.assertEqual((g['avtor'], g['god'], g['muzey'], g['nomer']), ('автор не указан', '1957', MUZEY, '27352216'))

    def test_avtor_s_tochkoy(self):
        g = kadr.GK_CREDIT.match(kadr.gk_podpis('О. Кузьмин, Фотохроника ТАСС', '1969', 'Музей современной истории России', '7629896'))
        self.assertEqual(g['avtor'], 'О. Кузьмин, Фотохроника ТАСС'); self.assertEqual(g['god'], '1969')

    def test_bez_polnoty_otkaz(self):
        for a in (('автор не указан', '1957', MUZEY, 'abc'), ('автор не указан', '1957', 'ММК', '27352216'),
                  ('автор не указан', '', MUZEY, '27352216'), ('', '1957', MUZEY, '27352216')):
            with self.assertRaises(SystemExit):
                kadr.gk_podpis(*a)

    def test_ssylka_na_nomer(self):
        h = kadr.gk_html(kadr.gk_podpis('автор не указан', '1957', MUZEY, '27352216'))
        self.assertTrue(h.endswith('№ <a href="https://goskatalog.ru/portal/#/collections?id=27352216" target="_blank" rel="noopener">27352216</a>'))

    def test_tolko_goskatalog(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(kadr, 'ROOT', Path(d)):
            day = Path(d) / 'src/content/days/m/01-01.json'; day.parent.mkdir(parents=True); day.write_text('{}')
            with self.assertRaises(SystemExit) as e:
                kadr.put('m', '01-01', 'rusmuseum:https://x/y.jpg', 'кадр', 'автор', istochnik=dict(nomer='1', muzey=MUZEY, god='1'))
            self.assertIn('только для кадров Госкаталога', str(e.exception))

    def test_bez_prav_po_prezhnemu_otkaz(self):  # без --istochnik-fonda Госкаталог без прав не ставится
        with tempfile.TemporaryDirectory() as d, mock.patch.object(kadr, 'ROOT', Path(d)), \
                mock.patch.object(kadr, 'fetch', return_value=jpeg()), \
                mock.patch.object(kadr, 'sources', return_value={'goskatalog': {'name': 'Госкаталог'}}):
            day = Path(d) / 'src/content/days/m/01-01.json'; day.parent.mkdir(parents=True); day.write_text('{}')
            with self.assertRaises(SystemExit) as e:
                kadr.put('m', '01-01', 'goskatalog:https://x/1.jpg', 'кадр', 'автор не указан, 1957')
            self.assertIn('права не названы', str(e.exception))
            self.assertFalse((Path(d) / 'public').exists())

    def test_rezhim_stavit_kadr(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(kadr, 'ROOT', Path(d)), \
                mock.patch.object(kadr, 'fetch', return_value=jpeg()), \
                mock.patch.object(kadr, 'sources', return_value={'goskatalog': {'name': 'Госкаталог'}}), \
                mock.patch.object(kadr, 'vernut'), mock.patch.object(kadr, 'sinhron'):
            day = Path(d) / 'src/content/days/m/01-01.json'; day.parent.mkdir(parents=True); day.write_text('{}')
            kadr.put('m', '01-01', 'goskatalog:https://x/1.jpg', 'Ракета Р-7 на старте.', 'автор не указан',
                     istochnik=dict(nomer='27352216', muzey=MUZEY, god='1957'), obrez=(0, 0.25, 0, 0))
            im = json.loads(day.read_text())['images'][0]
            self.assertEqual(im['credit'], kadr.gk_podpis('автор не указан', '1957', MUZEY, '27352216'))
            self.assertEqual(Image.open(Path(d) / 'public' / im['src']).size, (600, 600))
            k = kadr.fond_kadry(day)[0]
            self.assertEqual(k['source'], 'https://goskatalog.ru/portal/#/collections?id=27352216')


if __name__ == '__main__':
    unittest.main()
