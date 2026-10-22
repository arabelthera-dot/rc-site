"""Р136: кадр фонда любого года — только с полной credit line (put --hranitsya): python3 -m unittest discover tests/py"""
import json, sys, tempfile, unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
import kadr  # noqa: E402

GK = 'https://goskatalog.ru/portal/#/collections?id=28867095'


class Atribuciya(unittest.TestCase):
    def test_stroka(self):
        s = kadr.atribuciya('автор не указан, 1961', 'Мемориальный музей космонавтики.', GK, 'Госкаталог Музейного фонда РФ')
        self.assertEqual(s, 'Фото: автор не указан, 1961. Хранится: Мемориальный музей космонавтики. '
                            'Госкаталог музейного фонда РФ, № 28867095')

    def test_drugoy_fond(self):
        s = kadr.atribuciya('Иванов И. И., 1975', 'Российская национальная библиотека', 'https://nlr.ru/x/1', 'РНБ')
        self.assertTrue(s.endswith('Хранится: Российская национальная библиотека. РНБ, карточка https://nlr.ru/x/1'), s)

    def test_vek_po_kartochke(self):
        s = kadr.atribuciya('автор не указан, середина XX века', 'Губкинский краеведческий музей', GK, 'Госкаталог')
        self.assertTrue(s.startswith('Фото: автор не указан, середина XX века. Хранится:'), s)

    def test_bez_goda_bez_muzeya_bez_kartochki(self):
        for av, mz, card in (('Иванов И. И.', 'Музей', GK), ('Иванов, 1961', '', GK), ('Иванов, 1961', 'Музей', '')):
            with self.assertRaises(SystemExit):
                kadr.atribuciya(av, mz, card, 'Госкаталог')

    def test_lic_ok_ne_rasshiren(self):
        # основание ст. 1274 принимается только вместе с --hranitsya, общий фильтр прав прежний
        self.assertIsNone(kadr.LIC_OK.search(kadr.ATRIB_PRAVO))

    def test_vidno_v_polnuyu_stranicu(self):
        cr = ('Фото: автор не указан, 1961. Хранится: Мемориальный музей космонавтики. Госкаталог музейного фонда РФ, № 28867095. '
              f'Источник: Госкаталог Музейного фонда РФ [goskatalog], {GK}. Права: {kadr.ATRIB_PRAVO}.')
        self.assertEqual(kadr.vidno(cr), cr.split(' Источник:')[0].rstrip('.'))
        self.assertEqual(kadr.vidno('И. Репин, 1891. Источник: ГТГ [tretyakov], https://x. Права: общественное достояние.'), '')
        with tempfile.TemporaryDirectory() as d:
            day = Path(d) / '10-17.json'
            day.write_text(json.dumps(dict(images=[dict(src='muzei/izobreteniya/img/a.jpg', caption='Титов', credit=cr)])))
            k = kadr.fond_kadry(day)[0]
            self.assertIn('Хранится: Мемориальный музей космонавтики', k['vidno'])
            self.assertIn('ст. 1274 ГК РФ', k['license'])


if __name__ == '__main__':
    unittest.main()
