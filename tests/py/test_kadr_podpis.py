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

    def test_musor_razbora(self):  # 21.10: разбор по 5 музеям
        self.check('Лагерь встречает самолёт, 1934 Печатная подпись называет самолёт.', '', 'Лагерь встречает самолёт', '1934')
        self.check('Журнал боевых действий 2-й танковой дивизии вермахта, 16.11.1941 Тот же день глазами противника.',
                   '', 'Журнал боевых действий 2-й танковой дивизии вермахта', '1941')
        self.check('Дом Ошевнева. Документальная фотография: Alexxx1979, CC BY-SA 4.0.', '', 'Дом Ошевнева', '')
        self.check('Лодка проекта 705 в море, снимок начала 1980-х.', '', 'Лодка проекта 705 в море, снимок начала 1980-х', '')
        self.check('Фотография Мандельштама, 1930 год, автор не установлен.', '', 'Фотография Мандельштама', '1930')
        self.check('Орест Кипренский. Портрет А. С. Пушкина, 1827. Государственная Третьяковская галерея.',
                   'Орест Кипренский', 'Портрет А. С. Пушкина', '1827')
        self.assertEqual(kadr.opis('Фото Министерства обороны США', 'Лодка в море')['avtor'], '')

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


class Imenitelny(unittest.TestCase):  # 21.10: автор в именительном, «рисунок/работы» — автор, а не изображённый
    def test_padezh(self):
        im = kadr.imenitelny
        self.assertEqual(im('Евгения Халдея'), 'Евгений Халдей')
        self.assertEqual(im('Екатерины Борисовой'), 'Екатерина Борисова')
        self.assertEqual(im('Михаила Калашникова. По'), 'Михаил Калашников')
        self.assertEqual(im('Картина Максима Преснякова'), 'Максим Пресняков')
        self.assertEqual(im('Картина Айвазовского'), 'Айвазовский')
        self.assertEqual(im('М. М. Калашникова', 'Фото '), 'М. М. Калашников')
        self.assertEqual(im('Е. И. Гейтмана', 'гравюра '), 'Е. И. Гейтман')
        for s in ('Виталий Барсов', 'Наталья Филатова', 'Иван Шкаев', 'Kate Vader', 'В. Завьялов', 'А. Радаков'):
            self.assertEqual(im(s), s)  # уже именительный — как есть
        self.assertEqual(im('В. Завьялов', 'Художник '), 'В. Завьялов')
        self.assertEqual(im('И. Иванова', 'Фото: '), 'И. Иванова')  # после «Фото:» — не трогать
        for s in ('Любовью Тимофеевной', 'Вооружённых', 'Красной', 'XIX', 'Р-7'):
            self.assertEqual(im(s), '', s)

    def test_tvorets(self):
        av = lambda s: kadr.iz_podpisi(s)['avtor']
        self.assertEqual(av('Антон Чехов. Рисунок В. А. Серова'), 'В. А. Серов')
        self.assertEqual(av('Портрет Пушкина работы Кипренского'), 'Кипренский')
        self.assertEqual(av('Фото: Иван Иванов'), 'Иван Иванов')
        self.assertEqual(av('Ил-4 над Гудаутой, 1943. Фото Евгения Халдея'), 'Евгений Халдей')
        self.assertEqual(av('Фонтанный дом. Фото Екатерины Борисовой, 2020, CC BY-SA 4.0.'), 'Екатерина Борисова')
        self.assertEqual(av('Александр Радищев. Портрет работы неизвестного художника, не позднее 1790.'), '')
        self.assertEqual(av('Аркадий Гайдар. Фотография неизвестного автора, опубликована в 1946 году.'), '')
        self.assertEqual(av('О. С. Костович. Фотография конца XIX века, автор неизвестен.'), '')
        self.assertEqual(av('Фотография Мандельштама, 1930 год, автор не установлен.'), '')
        self.assertEqual(av('И. Репин. Запорожцы. 1891'), 'И. Репин')
