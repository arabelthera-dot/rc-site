"""Разбор подписи кадра для kadr.py zamena (Р90): python3 -m unittest discover tests/py"""
import sys, unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
import kadr  # noqa: E402


class Podpis(unittest.TestCase):
    def check(self, s, avtor, nazvanie, god):
        self.assertEqual(kadr.iz_podpisi(s), dict(avtor=avtor, nazvanie=nazvanie, god=god), s)

    def test_formy(self):
        self.check('А. Радаков · 1917 «Сказка о Царе-Репке» Царя-репку тянут из земли.', 'А. Радаков', '«Сказка о Царе-Репке»', '1917')
        self.check('Уильям Чарльз · ок. 1813 «Мишка-посредник» Медведь', 'Уильям Чарльз', '«Мишка-посредник»', '1813')
        self.check('«Страшный сон москвича» Алексей Радаков · 1934 Быт', 'Алексей Радаков', '«Страшный сон москвича»', '1934')
        self.check('И. Репин. Запорожцы. 1891', 'И. Репин', 'Запорожцы', '1891')
        self.check('Свадьба медведя (Иван Малютин, 1926)', 'Иван Малютин', 'Свадьба медведя', '1926')
        self.check('Карикатура на чиновника, журнал «Будильник», 1906', '', 'Карикатура на чиновника, журнал «Будильник»', '1906')
        self.check('лубок · XIX в. «Медведь с козою» Медведь пляшет', '', '«Медведь с козою»', '')
        self.check('А. Радаков · нач. XX в. «Пуритане и барабанщики», вариант', 'А. Радаков', '«Пуритане и барабанщики»', '')
        self.check('', '', '', '')

    def test_ermitazh_poluchaet_polya(self):
        import importlib.util
        spec = importlib.util.spec_from_file_location('ermitazh', kadr.ROOT / 'scripts/fondy/ermitazh.py')
        er = importlib.util.module_from_spec(spec); spec.loader.exec_module(er)
        k = dict(muzey='karikatura', den='01-01', fayl='x.jpg', podpis='', derzhatel='', inv='', syuzhet='',
                 **kadr.iz_podpisi('И. Теребенев · 1813 «Русский Сцевола» Крестьянин'))
        with mock.patch.object(er, '_poisk', return_value=[]) as p:
            er.po_nomeru(k)
        self.assertEqual(p.call_args[0][0], 'Теребенев Русский Сцевола')


if __name__ == '__main__':
    unittest.main()
