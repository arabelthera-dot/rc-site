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

    def test_parallelnyy_muzey_ne_zatiraetsya(self):
        # другой музей дописал свои строки, пока шёл наш прогон: при подмене таблицы они остаются
        def fn(k):
            if k['den'] == '01':
                with open(self.out, 'a') as f:
                    f.write('drug2\t02\tg.jpg\t\t\tx\ty\n')
            return []
        rows = self.run_([('f', fn)])
        self.assertIn('drug2\t02\tg.jpg\t\t\tx\ty', rows)
        self.assertIn('drug\t01\tf.jpg\t\t\tx\ty', rows)
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


class Strogo(unittest.TestCase):
    """Промахи сухого прогона iskusstvo 21.10.2026: картины есть в ГТГ, сверка их не узнавала."""
    def k(self, avtor, nazv, god):
        return dict(inv='', derzhatel='', avtor=avtor, nazvanie=nazv, god=god, podpis='')

    def test_skobki_fonda(self):
        r = dict(title='Черное море (На Черном море начинает разыгрываться буря)', avtor='Иван Айвазовский', god='1881')
        self.assertTrue(kadr.strogo(self.k('Иван Айвазовский', 'Чёрное море', '1881'), r))

    def test_god_ryadom_s_datirovkoy(self):
        r = dict(fond='Государственная Третьяковская галерея', title='Крестный ход в Курской губернии', avtor='Илья Репин', god='1881–1883', datirovka='1881–1883')
        self.assertTrue(kadr.strogo(self.k('Илья Репин', 'Крестный ход в Курской губернии', '1880'), r))

    def test_chuzhaya_kartina_ne_proskakivaet(self):
        r = dict(fond='tretyakov', title='Крестный ход в дубовом лесу. Явленная икона', avtor='Илья Репин', god='1877–1924')
        self.assertIsNone(kadr.strogo(self.k('Илья Репин', 'Крестный ход в Курской губернии', '1880'), r))
        r = dict(title='Хоста. Черное море', avtor='Алексей Моргунов', god='1881')
        self.assertIsNone(kadr.strogo(self.k('Иван Айвазовский', 'Чёрное море', '1881'), r))

    def test_god_daleko_ne_proskakivaet(self):
        r = dict(fond='tretyakov', title='Крестный ход в Курской губернии', avtor='Илья Репин', god='1891')
        self.assertIsNone(kadr.strogo(self.k('Илья Репин', 'Крестный ход в Курской губернии', '1880'), r))


class BezMarok(unittest.TestCase):
    """Р126: марки и прочая филателия в кадры не попадают."""
    def test_marki(self):
        for n in ('Марка почтовая. № 893. Н.Ф. Гастелло', 'Почтовая марка, посвященная капитану Гастелло',
                  'Карточка почтовая маркированная «Дальний бомбардировщик Ил-4»', 'Конверт первого дня',
                  'Марочный лист «Кижи»'):
            self.assertTrue(kadr.marka(n), n)

    def test_ne_marki(self):
        for n in ('Бомбардировка крепости Осовец', 'Кижский погост. Колокольня Общий вид.',
                  'Маркиз де Кюстин', 'Портрет генерала Бржозовского'):
            self.assertFalse(kadr.marka(n), n)


class Sinhron(unittest.TestCase):
    """Р128: кадр из фонда, положенный в json дня, попадает в полную страницу; марки уходят."""
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        r = Path(self.tmp.name)
        self.day, self.page = r / 'd.json', r / 'p.html'
        self.day.write_text('{"images": [{"src": "muzei/m/img/01-07-goskatalog-1.jpg", "caption": "Ил-4 перед вылетом, 1942.",'
                            ' "credit": "Фотограф, 1942. Источник: Госкаталог Музейного фонда РФ [goskatalog], https://goskatalog.ru/x?id=1. Права: общественное достояние."}]}')

    def tearDown(self):
        self.tmp.cleanup()

    def test_marka_zamenena(self):
        self.page.write_text('<meta content="https://s/muzei/m/marka-1942.jpg"><div class="st-stage">\n<img class="st-scene active" src="marka-1942.jpg" alt="Почтовая марка СССР">\n</div>'
                             '<span class="st-src">Марка СССР · 1942</span>')
        t, v, z, u = kadr.sinhron_den(self.page, self.day)
        self.assertEqual((v, z, u), (0, 1, 0))
        self.assertNotIn('марк', t.lower()); self.assertNotIn('marka', t)
        self.assertIn('src="/muzei/m/img/01-07-goskatalog-1.jpg"', t)
        self.assertIn('data-source="https://goskatalog.ru/x?id=1"', t)

    def test_vstavka_v_scenu(self):
        self.page.write_text('<div class="hero-scene st-stage">\n  <img class="st-scene active" src="a.jpg" alt="а">\n</div>')
        t, v, z, u = kadr.sinhron_den(self.page, self.day)
        self.assertEqual((v, z, u), (1, 0, 0))
        self.assertIn('class="st-scene" src="/muzei/m/img/01-07-goskatalog-1.jpg"', t)
        self.assertEqual(kadr.sinhron_den(self.page.__class__(self.page), self.day)[1], 1)  # без записи — повтор тот же

    def test_marka_ubrana_bez_zameny(self):
        self.day.write_text('{"images": []}')
        self.page.write_text('<figure class="fig"><img src="m.jpg" alt="Почтовая марка"><figcaption>м</figcaption></figure><p>x</p>')
        t, v, z, u = kadr.sinhron_den(self.page, self.day)
        self.assertEqual((t, u), ('<p>x</p>', 1))

    def test_anketa_body(self):
        """Р154: у дня-анкеты кадр встаёт в блоки body (живую страницу собирает DenAnketa), скрипты не тронуты."""
        import json
        d = json.loads(self.day.read_text())
        d['body'] = [{'type': 'shapka', 'html': '<header>ш</header>'}, {'type': 'kod', 'html': '<script>x="<section class=\\"block\\""</script>'},
                     {'type': 'istoriya', 'html': '\n<section class="block" id="story"><p>р</p></section>'}]
        self.day.write_text(json.dumps(d, ensure_ascii=False))
        nov, v, z, u = kadr.sinhron_anketa(self.day)
        self.assertEqual((v, z, u), (1, 0, 0))
        self.assertEqual([b['html'] for b in nov['body'][:2]], [b['html'] for b in d['body'][:2]])
        h = nov['body'][2]['html']
        self.assertTrue(h.index('01-07-goskatalog-1.jpg') < h.index('id="story"'))
        self.day.write_text(json.dumps(nov, ensure_ascii=False))
        self.assertEqual(kadr.sinhron_anketa(self.day)[1], 0)  # повтор — не дубль


class Vernut(unittest.TestCase):
    """Р132: кадр карточки встаёт на место figure, вырезанного заменой #333, той же обёрткой; счётчик — по числу кадров."""
    K = dict(src='/muzei/m/img/01-08-goskatalog-1.jpg', caption='Симонов монастырь, старая фотография.', muzey='m',
             source='https://goskatalog.ru/x?id=1', license='общественное достояние', fond='Госкаталог Музейного фонда РФ', avtor='автор не указан')

    def test_mesto_i_obertka(self):
        old = ('<p>а</p><figure class="human-frame" data-rc-rights-id="sim"><img src="../../muzei/m/media/sim.jpg" alt="Симонов монастырь">'
               '<figcaption><b>Симонов монастырь.</b> <span>Викисклад</span></figcaption></figure><p>б</p>')
        cur = '<p>а</p><p>б</p>'
        (pos, blok), = kadr.mesta(old, cur)
        self.assertEqual(cur[:pos], '<p>а</p>')
        nov = kadr.pereodet(blok, self.K, Path('/net'))
        self.assertIn('<figure class="human-frame" data-rc-rights-id="sim"><img src="../../muzei/m/img/01-08-goskatalog-1.jpg"', nov)
        self.assertIn('data-source="https://goskatalog.ru/x?id=1"', nov)
        self.assertIn('<b>Симонов монастырь, старая фотография.</b>', nov)
        self.assertNotIn('Викисклад', nov)

    def test_zamenennyy_na_meste_ne_mesto(self):
        self.assertEqual(kadr.mesta('<p>а</p><img src="a.jpg" alt="x"><p>б</p>', '<p>а</p><img src="b.jpg" alt="y"><p>б</p>'), [])

    def test_schetchik(self):
        t = 'На странице <span data-rc-count="exhibits" data-value="1">1</span> изображение; общественное достояние.'
        self.assertEqual(kadr.schetchik(t, 1), 'На странице <span data-rc-count="exhibits" data-value="2">2</span> изображения; все — общественное достояние.')

    def test_dubl(self):
        t = '<figure><img src="x.jpg" alt="Портрет"><figcaption>В. А. Серов. Портрет Н. С. Лескова, 1894. Холст, масло.</figcaption></figure>'
        self.assertTrue(kadr._dub(dict(self.K, caption='В. А. Серов. Портрет Н. С. Лескова. 1894. Госкаталог Музейного фонда РФ.'), t, Path('/net')))
        self.assertFalse(kadr._dub(self.K, t, Path('/net')))
