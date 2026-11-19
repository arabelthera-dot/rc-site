"""Р126: почтовые марки, конверты, маркированные карточки не кадр — find отсеивает их у любого фонда."""
import contextlib
import io
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
import kadr  # noqa: E402


class Marki(unittest.TestCase):
    def test_marka(self):
        for s in ('Марка почтовая «Городки»', 'Блок марок «Герои России»', 'на марке 1944 года', 'Конверт маркированный',
                  'Почтовая карточка', 'Postage stamp, USSR 1965', 'Штемпель спецгашения'):
            self.assertTrue(kadr.marka(s), s)
        for s in ('Ярмарка в Нижнем Новгороде', 'Марко Богатый', 'Правило Марковникова', 'Открытка почтовая «Екатеринбург»',
                  'Кустодиев. Масленица'):
            self.assertFalse(kadr.marka(s), s)

    def test_find_otseivaet_vse_fondy(self):
        def fond(_f, _q, _n, _g):
            print('? rusmuseum:https://r/1.jpg | Марка почтовая «Гастелло» | автор не указан\n    --card https://r/1')
            print('? rusmuseum:https://r/2.jpg | Гастелло, фотография 1941 | автор не указан\n    --card https://r/2')
            return 2
        stary = dict(kadr.SEARCH), kadr.FONDY, kadr.sources
        kadr.SEARCH['rusmuseum'], kadr.FONDY, kadr.sources = fond, ['rusmuseum'], lambda: {}
        try:
            with contextlib.redirect_stdout(io.StringIO()) as out, contextlib.redirect_stderr(io.StringIO()):
                kadr.find('Гастелло')
        finally:
            kadr.SEARCH.clear(); kadr.SEARCH.update(stary[0]); kadr.FONDY, kadr.sources = stary[1], stary[2]
        v = out.getvalue()
        self.assertNotIn('r/1', v)
        self.assertIn('r/2.jpg', v)
        self.assertIn('rusmuseum: 1', v)


if __name__ == '__main__':
    unittest.main()
