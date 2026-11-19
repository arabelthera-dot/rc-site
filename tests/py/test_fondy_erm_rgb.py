"""Эрмитаж и РГБ: год, автор, название с карточки — без сети."""
import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts/fondy'))
import ermitazh  # noqa: E402
import rgb_neb  # noqa: E402

KART = '''<div data-row="avtor"><div class="key">Автор:</div><div class="value"><a href="#">
 Теребенев, Иван Иванович (1780-1815) </a></div></div>
<div data-row="object_title"><div class="key">Название:</div><div class="value"> Карточка с буквой «Ж» </div></div>
<div data-row="create_date"><div class="key">Время:</div><div class="value"><a>1814 г.</a></div></div>
<div data-row="record_id"><div class="key">Инв.:</div><div class="value"> ЭРГ-28436 </div></div>
<img src="https://hermitagemuseum.org/api/files/fshow?needlePath=%2Fx.jpg%3Fw%3D1600%26h%3D1600">'''

MARC = '''<table><tr><td>008</td><td>050503s1873####ru</td></tr>
<tr><td>245</td><td>00 $a 1873 $n № 4</td></tr>
<tr><td>773</td><td>0# $t Будильник $d Москва, 1873</td></tr>
<tr><td>700</td><td>1# $a Теребенев, Иван Иванович $d 1780-1815</td></tr>
<tr><td>852</td><td>4# $a РГБ $j FB 1-Е 7/12</td></tr></table>'''


class Ermitazh(unittest.TestCase):
    def test_god(self):
        self.assertEqual(ermitazh.god_iz('1814 г.'), '1814')
        self.assertEqual(ermitazh.god_iz('1812-1813'), '1812')
        self.assertEqual(ermitazh.god_iz('1830-е гг.'), '')
        self.assertEqual(ermitazh.god_iz('XIX в.'), '')

    def test_avtor(self):
        self.assertEqual(ermitazh.avtor_im('Теребенев, Иван Иванович (1780-1815) Теребенев, Иван Иванович (1780-1815)'),
                         'Иван Иванович Теребенев')

    def test_kartochka_i_strogo(self):
        sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
        import kadr
        el = {'id': '1628308', 'name': 'Карточка', 'params': {'avtor': {'value': 'Теребенев, Иван Иванович (1780-1815)'}}}
        with mock.patch.object(ermitazh, '_poisk', return_value=[el]), \
                mock.patch.object(ermitazh._set, 'get', return_value=mock.Mock(text=KART)):
            k = dict(muzey='x', den='', fayl='', podpis='Теребенев, 1814, карточка с буквой Ж', derzhatel='', inv='',
                     avtor='И. Теребенев', nazvanie='Карточка с буквой «Ж»', god='1814', syuzhet='')
            r = ermitazh.po_nomeru(k)
        self.assertEqual((r[0]['god'], r[0]['inv'], r[0]['avtor']), ('1814', 'ЭРГ-28436', 'Иван Иванович Теребенев'))
        self.assertIn('w%3D6000', r[0]['image'])
        self.assertTrue(kadr.strogo(k, r[0]))


class Rgb(unittest.TestCase):
    def test_zapis_vypuska(self):
        with mock.patch.object(rgb_neb, '_get', return_value=mock.Mock(text=MARC)):
            z = rgb_neb.rgb_zapis(None, '1')
        self.assertEqual(z['god'], '1873')
        self.assertEqual(z['title'], 'Будильник, 1873. № 4')
        self.assertEqual(z['avtor'], 'Иван Иванович Теребенев')
        self.assertEqual(z['inv'], 'FB 1-Е 7/12')

    def test_zhurnal(self):
        self.assertEqual(rgb_neb.zhurnal({'podpis': '1922 «Крокодил» № 1'}), 'крокодил')
        self.assertEqual(rgb_neb.zhurnal({'podpis': 'Портрет'}), '')


if __name__ == '__main__':
    unittest.main()
