#!/usr/bin/env python3
"""Подсказчик «близко к тексту» (пункт 81 очереди 1, Р716/Р717).

Ищет в тексте дня 12+ слов подряд, совпадающих с сохранённой выдержкой
источника (строки «Цитата:» в материалах дня). Только сообщает «что и где»,
ничего не правит и не останавливает: код выхода всегда 0, в сборку и CI
не встраивается.

Текст дня — src/data/utverzhdeno/<музей>/ММ-ДД.json (заголовки и «Подробнее»).
Выдержки — ~/workspace/knowledge/<папка>/ММ-ДД*.md, строки «Цитата…: «…»» и
следующая за ней «Адрес:».

  python3 tools/blizko-k-tekstu.py                     # все музеи, январь
  python3 tools/blizko-k-tekstu.py ne-sdayutsya 01-06  # один день
  python3 tools/blizko-k-tekstu.py --slov 10           # длина совпадения
"""
import argparse
import json
import re
from pathlib import Path

SAYT = Path(__file__).resolve().parent.parent
UTV = SAYT / 'src/data/utverzhdeno'
ZNANIYA = Path.home() / 'workspace/knowledge'
# где лежат выдержки источников по музеям
PAPKI = {
    'ne-sdayutsya': ['ns-material', 'utverzhdeno/nesdayutsya'],
}
CITATA = re.compile(r'^\s*[-*]?\s*цитата[^:]*:\s*(.+)$', re.I)
ADRES = re.compile(r'^\s*[-*]?\s*(?:адрес|источник)[^:]*:\s*(.+)$', re.I)
SLOVO = re.compile(r'[0-9a-zа-яё]+', re.I)


def slova(tekst):
    """Слова с нормализацией (регистр, ё→е) и их места в тексте."""
    return [(m.group().lower().replace('ё', 'е'), m.start(), m.end())
            for m in SLOVO.finditer(tekst)]


def vyderzhki(muzey, den):
    out = []
    for papka in PAPKI.get(muzey, []) + [f'{muzey}-material', f'utverzhdeno/{muzey}']:
        d = ZNANIYA / papka
        if not d.is_dir():
            continue
        for f in sorted(d.glob(f'*{den}*.md')):
            stroki = f.read_text(encoding='utf-8').splitlines()
            for i, s in enumerate(stroki):
                m = CITATA.match(s)
                if not m:
                    continue
                adres = ''
                for t in stroki[i + 1:i + 4]:
                    if (a := ADRES.match(t)):
                        adres = a.group(a.lastindex).strip()
                        break
                out.append((m.group(1).strip(), adres, f'{f.relative_to(ZNANIYA)}:{i + 1}'))
    return out


def kuski_dnya(muzey, den):
    f = UTV / muzey / f'{den}.json'
    if not f.exists():
        return []
    d = json.loads(f.read_text(encoding='utf-8'))
    out = []
    for fk in d.get('fakty', []):
        for pole in ('zagolovok', 'podrobnee'):
            if fk.get(pole):
                out.append((f'факт {fk.get("n")} · {pole}', fk[pole]))
    return out


def vnutri(tekst, poz):
    do = tekst[:poz]
    otkr = sum(do.count(k) for k in '«„') - do.count('»') - do.count('“')
    return otkr > 0 or do.count('"') % 2 == 1


def v_kavychkah(tekst, kuski):
    """Не меньше 80% слов совпадения в кавычках — это цитата, а не пересказ."""
    return sum(vnutri(tekst, nach) for _, nach, _ in kuski) >= 0.8 * len(kuski)


def sravnit(muzey, den, n):
    vyd = vyderzhki(muzey, den)
    if not vyd:
        return None
    nahodki = []
    for gde, tekst in kuski_dnya(muzey, den):
        sd = slova(tekst)
        for istochnik, adres, mesto in vyd:
            si = [w for w, _, _ in slova(istochnik)]
            shingly = {tuple(si[j:j + n]) for j in range(len(si) - n + 1)}
            i = 0
            while i <= len(sd) - n:
                if tuple(w for w, _, _ in sd[i:i + n]) not in shingly:
                    i += 1
                    continue
                k = i + n  # тянем совпадение, пока идут общие шинглы
                while k < len(sd) and tuple(w for w, _, _ in sd[k - n + 1:k + 1]) in shingly:
                    k += 1
                nach, kon = sd[i][1], sd[k - 1][2]
                nahodki.append((gde, k - i, tekst[nach:kon], adres, mesto,
                                v_kavychkah(tekst, sd[i:k])))
                i = k
    return len(vyd), nahodki


def main():
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument('muzey', nargs='?')
    p.add_argument('den', nargs='?', help='ММ-ДД; без него — весь январь')
    p.add_argument('--slov', type=int, default=12)
    a = p.parse_args()
    muzei = [a.muzey] if a.muzey else sorted(x.name for x in UTV.iterdir() if x.is_dir())
    itog = {'dney': 0, 'bez_vyderzhek': 0, 'peresk': 0, 'citat': 0}
    for m in muzei:
        dni = [a.den] if a.den else sorted(f.stem for f in (UTV / m).glob('01-*.json'))
        for den in dni:
            r = sravnit(m, den, a.slov)
            itog['dney'] += 1
            if r is None:
                itog['bez_vyderzhek'] += 1
                continue
            nvyd, nahodki = r
            if not nahodki:
                continue
            print(f'\n== {m} {den}: {len(nahodki)} совпад. ({nvyd} выдержек)')
            for gde, dl, kusok, adres, mesto, kav in nahodki:
                vid = 'цитата в кавычках' if kav else 'ПЕРЕСКАЗ БЛИЗКО К ТЕКСТУ'
                itog['citat' if kav else 'peresk'] += 1
                print(f'  [{vid}] {gde}, {dl} слов подряд: «{kusok}»')
                print(f'      источник: {adres or "адрес не указан"} ({mesto})')
    print(f'\nИтог: дней {itog["dney"]}, без сохранённых выдержек {itog["bez_vyderzhek"]}; '
          f'пересказ близко к тексту {itog["peresk"]}, цитат в кавычках {itog["citat"]} '
          f'(порог {a.slov} слов). Подсказка, не приговор: смотреть глазами.')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:  # подсказчик ничего не останавливает
        print(f'blizko-k-tekstu: не смог досчитать — {e}')
