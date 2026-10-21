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


if __name__ == '__main__':
    unittest.main()
