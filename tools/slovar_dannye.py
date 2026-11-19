"""Словарь связей дня (Р37) — одна запись = один файл (Р776, 14.11).

src/data/slovar/<tip>--<slug>.json, служебные ключи — _<имя>.json (_roli). Склейка — как в
src/lib/slovar-dannye.mjs: файлы по имени, ключ «tip:slug». Пишет — только файл своей записи.

    import slovar_dannye
    sl = slovar_dannye.chitat()                       # { 'lyudi:…': {...}, '_roli': {...} }
    slovar_dannye.zapisat('lyudi:ivan-ivanov', {...})  # новый или изменённый файл одной записи
"""
import json
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent
PAPKA = KOREN / 'src/data/slovar'


def fayl(klyuch):
    """Ключ → путь файла: lyudi:ivan-ivanov → src/data/slovar/lyudi--ivan-ivanov.json."""
    imya = klyuch if klyuch.startswith('_') else klyuch.replace(':', '--', 1)
    if '/' in imya or ':' in imya:
        raise ValueError(f'ключ словаря «{klyuch}»: нужно «tip:slug» или «_имя»')
    return PAPKA / f'{imya}.json'


def klyuch(put):
    imya = Path(put).stem
    return imya if imya.startswith('_') else imya.replace('--', ':', 1)


def chitat(papka=PAPKA):
    return {klyuch(f): json.loads(f.read_text(encoding='utf-8')) for f in sorted(Path(papka).glob('*.json'))}


def zapisat(k, zapis):
    fayl(k).write_text(json.dumps(zapis, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
