"""kadr.py zamena: атомарная таблица, сохранность при обрыве, --prodolzhit, кэш и семафор хоста.
python3 -m unittest discover tests/py"""
import sys, tempfile, threading, unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
import kadr  # noqa: E402

SHAPKA = 'музей\tдень\tфайл\tдержатель\tинв\tчто искали\tпочему нет'


def kadr_(den):
    return dict(vid='json', put=Path(f'/x/{den}.json'), i=0, fayl=f'img/{den}.jpg', podpis='п', derzhatel='', inv='',
                avtor='А. Б', nazvanie='Н', god='1900', syuzhet='с', muzey='m', den=den)


class Zamena(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / 'data').mkdir()
        self.out = self.root / 'data/r90-na-razreshenie.tsv'
        self.stary = [f'm\t{d:02d}\timg/{d:02d}.jpg\t\t\tстарое\tстарое' for d in range(1, 6)]
        self.out.write_text('\n'.join([SHAPKA, 'drug\t01\tf.jpg\t\t\tx\ty'] + self.stary) + '\n')
        self.kadry = [kadr_(f'{d:02d}') for d in range(1, 6)]

    def tearDown(self):
        self.tmp.cleanup()

    def run_(self, ad, **kw):
        with mock.patch.object(kadr, 'ROOT', self.root), mock.patch.object(kadr, 'adaptery', lambda *a: ad), \
                mock.patch.object(kadr, 'kadry_muzeya', lambda m: iter(self.kadry)), mock.patch.object(kadr, 'ustanovit_set', lambda: None), \
                mock.patch('sys.stdout'), mock.patch('sys.stderr'):
            kadr.zamena('m', j=3, **kw)
        return self.out.read_text().splitlines()

    def test_obryv_ne_teryaet_starye(self):
        def fn(k):
            if k['den'] == '03':
                raise KeyboardInterrupt
            return []
        with mock.patch.object(kadr.os, '_exit', side_effect=SystemExit):
            with self.assertRaises(SystemExit):
                self.run_([('f', fn)])
        rows = self.out.read_text().splitlines()
        self.assertEqual(len([r for r in rows if r.startswith('m\t')]), 5)
        self.assertIn('drug\t01\tf.jpg\t\t\tx\ty', rows)
        self.assertFalse(list((self.root / 'data').glob('.r90-*')))

    def test_polnyy_progon_perepisyvaet(self):
        rows = self.run_([('f', lambda k: [])])
        m = [r for r in rows if r.startswith('m\t')]
        self.assertEqual(len(m), 5)
        self.assertTrue(all('старое' not in r for r in m))
        self.assertEqual(rows[0], SHAPKA)

    def test_prodolzhit(self):
        self.kadry.append(kadr_('06'))
        vyzov = []
        rows = self.run_([('f', lambda k: vyzov.append(k['den']) or [])], prodolzhit=True)
        self.assertEqual(vyzov, ['06'])
        self.assertEqual(len([r for r in rows if r.startswith('m\t')]), 6)
        self.assertEqual(sum('старое' in r for r in rows), 5)


class Set(unittest.TestCase):
    def test_kesh_i_semafor(self):
        kadr._kesh.clear()
        zhivyh, maks, vyzovov = [0], [0], [0]
        lk, pauza = threading.Lock(), threading.Event()

        def delat():
            with lk:
                zhivyh[0] += 1; vyzovov[0] += 1; maks[0] = max(maks[0], zhivyh[0])
            pauza.wait(0.05)
            with lk:
                zhivyh[0] -= 1
            return 'ok'
        ts = [threading.Thread(target=kadr.cherez_kesh, args=(('t', i), f'https://h.test/{i}', delat)) for i in range(6)]
        ts += [threading.Thread(target=kadr.cherez_kesh, args=(('t', 0), 'https://h.test/0', delat)) for _ in range(3)]
        [t.start() for t in ts]; [t.join() for t in ts]
        self.assertLessEqual(maks[0], kadr.HOST_MAX)
        self.assertEqual(vyzovov[0], 6)  # одинаковый запрос — в сеть один раз


if __name__ == '__main__':
    unittest.main()
