"""Адаптер ГМИИ им. Пушкина: разбор образца ответа /api/entity/OBJECT/<id> (офлайн)."""
import importlib.util, sys, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/fondy'))
spec = importlib.util.spec_from_file_location('fondy.pushkin', ROOT / 'scripts/fondy/pushkin.py')
pushkin = importlib.util.module_from_spec(spec); spec.loader.exec_module(pushkin)

OBRAZEC = {"id": "291606", "title": "Теребенев И.И. Гравюра. Наполеонова пляска. 1813", "data": [
    {"attribute": "fund", "data": [{"title": "Графика русcкая", "value": "40", "hasInIndex": True}]},
    {"attribute": "record_id", "value": ["ГР-86641"]},
    {"attribute": "author", "data": [{"title": "Теребенев Иван Иванович (автор)", "value": "15922105"}]},
    {"attribute": "object_title", "value": ["Наполеонова пляска"]},
    {"attribute": "create_date4", "value": ["1813"]}],
    "image": "/api/spf/bWbI.jpg",
    "images": [{"id": "16119556", "main": True, "path": "/api/spf/bWbI.jpg"}], "deleted": False}


class TestPushkin(unittest.TestCase):
    def test_razbor(self):
        r = pushkin.razobrat(OBRAZEC)
        self.assertEqual(r['title'], 'Наполеонова пляска')
        self.assertEqual(r['avtor'], 'Иван Иванович Теребенев')
        self.assertEqual(r['god'], '1813')
        self.assertEqual(r['inv'], 'ГР-86641')
        self.assertEqual(r['derzhatel'], 'ГМИИ им. А. С. Пушкина')
        self.assertEqual(r['card'], 'https://collection.pushkinmuseum.art/entity/OBJECT/291606')
        self.assertEqual(r['image'], 'https://collection.pushkinmuseum.art/api/spf/bWbI.jpg?w=4000&h=4000')

    def test_datirovka_intervalom(self):
        e = dict(OBRAZEC, data=OBRAZEC['data'][:-1] + [{"attribute": "create_date4", "value": ["1950-е – 1980-е (?)"]}])
        self.assertEqual(pushkin.razobrat(e)['god'], '1950')

    def test_chuzhoy_derzhatel_bez_seti(self):
        self.assertEqual(pushkin.po_nomeru({'derzhatel': 'Государственный Эрмитаж', 'avtor': 'И. Теребенев'}), [])

    def test_strogo_sovpadaet(self):
        kspec = importlib.util.spec_from_file_location('kadr', ROOT / 'scripts/kadr.py')
        kadr = importlib.util.module_from_spec(kspec); kspec.loader.exec_module(kadr)
        k = dict(podpis='И. Теребенев · 1813 «Наполеонова пляска»', syuzhet='', derzhatel='', inv='',
                 avtor='И. Теребенев', nazvanie='«Наполеонова пляска»', god='1813')
        self.assertEqual(kadr.strogo(k, pushkin.razobrat(OBRAZEC)), 'автор + год + название')


def _kadr():
    kspec = importlib.util.spec_from_file_location('kadr', ROOT / 'scripts/kadr.py')
    kadr = importlib.util.module_from_spec(kspec); kspec.loader.exec_module(kadr)
    return kadr


def _k(kadr, podpis):
    return dict(kadr.iz_podpisi(podpis), podpis=podpis, syuzhet='', derzhatel='', inv='')


def _zapis(i, title, inv, data_='1813'):
    return dict(OBRAZEC, id=i, title='', data=[
        {"attribute": "record_id", "value": [inv]},
        {"attribute": "author", "data": [{"title": "Теребенев Иван Иванович (автор)", "value": "1"}]},
        {"attribute": "object_title", "value": [title]},
        {"attribute": "create_date4", "value": [data_]}])


class TestStrogoNazvanie(unittest.TestCase):
    """Название фонда — с полем nazvanie подписи, не со всей подписью (ложные ГМИИ 291625, 21.10.2026)."""
    KARANTIN = _zapis('291625', 'Карантин для Наполеона по возвращении его из России', 'ГР-86640', '1813-1814')

    def test_lozhnye_otvergayutsya(self):
        kadr = _kadr()
        r = pushkin.razobrat(self.KARANTIN)
        for p in ('И. Теребенев · 1813 «Нос, привезённый Наполеоном с собой из России в Париж» '
                  'От великой армии домой везёт один отмороженный нос.',
                  'И. Теребенев · 1813 «Угощение Наполеону в России» Русские «угощают» завоевателя отпором — он не рад.'):
            self.assertIsNone(kadr.strogo(_k(kadr, p), r), p)

    def test_vernyy_prinimaetsya(self):
        kadr = _kadr()
        r = pushkin.razobrat(_zapis('291621', 'Русский Сцевола', 'ГР-17802'))
        k = _k(kadr, 'И. Теребенев · 1813 «Русский Сцевола» Крестьянин отсекает заклеймённую руку: '
                     'в сюжете гравюры он отказывается служить Наполеону.')
        self.assertEqual(kadr.strogo(k, r), 'автор + год + название')
        self.assertTrue(r['card'].endswith('/291621'))

    def test_god_v_diapazone_datirovki(self):
        kadr = _kadr()
        r = pushkin.razobrat(self.KARANTIN)
        k = _k(kadr, 'И. Теребенев · 1814 «Карантин для Наполеона по возвращении его из России»')
        self.assertEqual(kadr.strogo(k, r), 'автор + год + название')
        k = _k(kadr, 'И. Теребенев · 1815 «Карантин для Наполеона по возвращении его из России»')
        self.assertIsNone(kadr.strogo(k, r))

    def test_bukva_azbuki_ne_lyubaya(self):
        kadr = _kadr()
        r = dict(pushkin.razobrat(OBRAZEC), title='Буква «Г»', god='1815')
        k = dict(_k(kadr, 'Азбука · 1815 Буква «В» Голодные французы едят ворон.'), avtor='И. Теребенев')
        self.assertIsNone(kadr.strogo(k, r))
        k = dict(_k(kadr, 'Азбука · 1815 Буква «Г» Наполеон храбр на словах.'), avtor='И. Теребенев')
        self.assertEqual(kadr.strogo(k, r), 'автор + год + название')

    def test_zhurnal_po_nomeru(self):
        kadr = _kadr()
        r = {'fond': 'РГБ', 'card': 'x', 'title': 'Будильник, 1873. № 4', 'avtor': '', 'god': '1873'}
        k = _k(kadr, 'Карикатура из журнала «Будильник», 1873, № 4')
        self.assertEqual(kadr.strogo(k, r), 'журнал + год + номер выпуска')
        self.assertIsNone(kadr.strogo(_k(kadr, 'Карикатура из журнала «Будильник», 1873, № 5'), r))
        self.assertIsNone(kadr.strogo(_k(kadr, 'Карикатура из журнала «Будильник», 1873'), r))
        self.assertIsNone(kadr.strogo(_k(kadr, 'Карикатура из журнала «Стрекоза», 1873, № 4'), r))


if __name__ == '__main__':
    unittest.main()
