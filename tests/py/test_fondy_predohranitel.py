"""Предохранитель fondy/_set.py: молчащий хост уходит на паузу, после паузы — одна проба."""
import sys
import unittest
from pathlib import Path
from unittest import mock

import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
from fondy import _set  # noqa: E402


class Otvet:
    status_code = 200


class Sessiya:
    def __init__(self):
        self.vyzovy = 0
        self.molchit = True

    def request(self, *a, **kw):
        self.vyzovy += 1
        if self.molchit:
            raise requests.ConnectTimeout('молчит')
        return Otvet()


class Predohranitel(unittest.TestCase):
    def setUp(self):
        for d in (_set._put, _set._okno, _set._pauza):
            d.clear()
        _set._put['h.ru'] = 'pryamo'  # хост уже отвечал в этом прогоне

    def test_pauza_i_proba(self):
        s, url, chasy = Sessiya(), 'https://h.ru/api', [1000.0]
        with mock.patch.object(_set.time, 'monotonic', lambda: chasy[0]):
            for _ in range(_set.OKNO_MIN):
                with self.assertRaises(_set.Nedostupen):
                    _set.get(s, url)
            n = s.vyzovy
            with self.assertRaisesRegex(_set.Nedostupen, 'на паузе'):
                _set.get(s, url)
            self.assertEqual(s.vyzovy, n, 'на паузе сеть не трогаем')
            chasy[0] += _set.PAUZA_S + 1
            s.molchit = False
            self.assertIs(type(_set.get(s, url)), Otvet)
            self.assertEqual(_set._okno['h.ru'], [False])
            self.assertNotIn('h.ru', _set._pauza)

    def test_redkiy_otvet_ne_spasaet(self):
        # молчит, отвечает, молчит, молчит, молчит — как Эрмитаж 22.10: доля сбоев 4/5 → пауза
        s, url = Sessiya(), 'https://h.ru/api'
        for molchit in (True, False, True, True, True):
            s.molchit = molchit
            try:
                _set.get(s, url)
            except _set.Nedostupen:
                pass
        self.assertIn('h.ru', _set._pauza)

    def test_razovyy_sboy_ne_pauza(self):
        s, url = Sessiya(), 'https://h.ru/api'
        with self.assertRaises(_set.Nedostupen):
            _set.get(s, url)
        s.molchit = False
        _set.get(s, url)
        self.assertNotIn('h.ru', _set._pauza)


if __name__ == '__main__':
    unittest.main()
