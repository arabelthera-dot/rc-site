#!/usr/bin/env python3
"""Одинаковые картинки во всех музеях — отчёт парами (r716, пункт 83 очереди 1). Ручной инструмент, не в CI.

Кадры дня — те же «src» карточек src/content/dni-shablon/<музей>/ММ-ДД.yaml, что считает scripts/kadry-dnya.py
(обложка, кадры фактов, figures; head и video — не кадры). kadry-dnya.py ловит повтор внутри одного дня, этот —
между днями и музеями. Как в мире: перцептивный хеш (imagehash, https://github.com/JohannesBuchner/imagehash):
pHash, Хэмминг ≤ 8 из 64 бит = одна картинка (порог kadry-dnya.py); dHash — второе мнение в отчёте.

  python3 scripts/odinakovye-kartinki.py [--muzei M ...] [--dni 01-] [--public ПАПКА] [--vyhod ФАЙЛ]

--dni — начало имени дня («01-» — январь, по умолчанию все). Ничего не удаляет и не меняет: пишет только отчёт.
Откат — удалить файл.
"""
import argparse
import collections
import importlib.util
import sys
from pathlib import Path

import imagehash
import yaml
from PIL import Image

KOREN = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location('kadry_dnya', KOREN / 'scripts' / 'kadry-dnya.py')
kd = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(kd)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--muzei', nargs='*', help='музеи (по умолчанию все из dni-shablon)')
    p.add_argument('--dni', default='', help='начало имени дня, «01-» — январь')
    p.add_argument('--public', default=str(KOREN / 'public'))
    p.add_argument('--porog', type=int, default=kd.POROG)
    p.add_argument('--vyhod', default='-', help='файл отчёта (по умолчанию — экран)')
    a = p.parse_args()
    public = Path(a.public)
    shablon = KOREN / 'src' / 'content' / 'dni-shablon'
    muzei = a.muzei or sorted(x.name for x in shablon.iterdir() if x.is_dir())

    # файл картинки → [(музей, день, путь в карточке)]
    gde = collections.defaultdict(list)
    dnei = 0
    for m in muzei:
        for f in sorted((shablon / m).glob(f'{a.dni}*.yaml')):
            dnei += 1
            karta = yaml.safe_load(f.read_text(encoding='utf-8')) or {}
            for put, src in kd.kadry(karta):
                # «day-02jan-….jpg», «img/….jpg» без «/» в начале — от папки музея, как на странице
                src = src if src.startswith('/') else f'/muzei/{m}/{src}'
                gde[src].append((m, f.stem, put))
    hesh, net = {}, []
    for src in gde:
        f = kd.fail_kadra(src, public)
        try:
            with Image.open(f) as im:
                im = im.convert('RGB')
                hesh[src] = (imagehash.phash(im), imagehash.dhash(im))
        except Exception as e:
            net.append(f'{src} — {type(e).__name__}')

    def dni(src):
        return sorted({(m, d) for m, d, _ in gde[src]})

    pary = []
    # один и тот же файл в двух и более днях
    for src in gde:
        if len(dni(src)) > 1:
            pary.append((0, 0, src, src))
    # разные файлы, одна картинка
    spisok = sorted(hesh)
    for i, s1 in enumerate(spisok):
        p1, d1 = hesh[s1]
        for s2 in spisok[i + 1:]:
            p2, d2 = hesh[s2]
            h = p1 - p2
            # повтор внутри одного дня — забота kadry-dnya.py, здесь только между днями
            if h <= a.porog and not (dni(s1) == dni(s2) and len(dni(s1)) == 1):
                pary.append((h, d1 - d2, s1, s2))
    pary.sort(key=lambda x: (x[0], x[1], x[2]))

    def kak(src):
        return '; '.join(f'{m} {d} ({put.lstrip(".")})' for m, d, put in gde[src])

    vyvod = [f'# Одинаковые картинки: {", ".join(muzei)}, дни «{a.dni or "все"}»', '',
             f'Дней {dnei}, разных файлов картинок {len(gde)}, прочитано {len(hesh)}, не прочитано {len(net)}. '
             f'Пар {len(pary)} (pHash ≤ {a.porog}): тот же файл — {sum(1 for x in pary if x[2] == x[3])}, '
             f'разные файлы — {sum(1 for x in pary if x[2] != x[3])}, '
             f'из них между музеями — {sum(1 for x in pary if {m for m, _ in dni(x[2])} != {m for m, _ in dni(x[3])})}.',
             '', 'Ничего не удалено и не заменено: решение по каждой паре — за хозяином дня.', '']
    for n, (h, dh, s1, s2) in enumerate(pary, 1):
        if s1 == s2:
            vyvod += [f'{n}. тот же файл `{s1}`', f'   - {kak(s1)}']
        else:
            vyvod += [f'{n}. pHash {h}, dHash {dh}', f'   - `{s1}` — {kak(s1)}', f'   - `{s2}` — {kak(s2)}']
    if net:
        vyvod += ['', '## Не прочитаны', ''] + [f'- {x}' for x in net]
    tekst = '\n'.join(vyvod) + '\n'
    if a.vyhod == '-':
        sys.stdout.write(tekst)
    else:
        Path(a.vyhod).write_text(tekst, encoding='utf-8')
        print(vyvod[2])


if __name__ == '__main__':
    main()
