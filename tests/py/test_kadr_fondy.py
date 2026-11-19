"""Р93: Библиотека Конгресса только по разрешению; --bez выключает фонды. python3 -m unittest discover tests/py"""
import importlib.util, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('kadr', ROOT / 'scripts/kadr.py')
kadr = importlib.util.module_from_spec(spec); spec.loader.exec_module(kadr)


class TestAdaptery(unittest.TestCase):
    def test_loc_vyklyuchen_po_umolchaniyu(self):
        self.assertNotIn('loc', [n for n, _ in kadr.adaptery()])

    def test_loc_tolko_s_flagom(self):
        self.assertIn('loc', [n for n, _ in kadr.adaptery(vkl=('loc',))])

    def test_bez(self):
        names = [n for n, _ in kadr.adaptery(bez={'ermitazh', 'loc'}, vkl=('loc',))]
        self.assertNotIn('ermitazh', names); self.assertNotIn('loc', names)

    def test_r93_v_spravke(self):
        self.assertIn('Р93', kadr.TOLKO_PO_RAZRESHENIYU['loc'])


if __name__ == '__main__':
    unittest.main()
