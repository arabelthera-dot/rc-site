"""Картинка по постоянному номеру для питоновских скриптов — то же, что src/lib/kartinki.mjs (Р649).
«kartinka:000123» → путь из src/data/kartinki.json; неизвестный номер — ошибка; не номер — как есть."""
import json
import re
from functools import lru_cache
from pathlib import Path

REESTR = Path(__file__).resolve().parents[1] / 'src/data/kartinki.json'
NOMER = re.compile(r'^kartinka:(\d{6})(\?.*)?$')


@lru_cache(maxsize=1)
def reestr():
    return json.loads(REESTR.read_text(encoding='utf-8'))['kartinki']


def kartinka(v, slesh=False, gde=''):
    m = NOMER.match(v) if isinstance(v, str) else None
    if not m:
        return v
    k = reestr().get(m[1])
    if not k:
        raise SystemExit(f'{gde + ": " if gde else ""}картинки {v} нет в реестре {REESTR}')
    return ('/' if slesh else '') + k['put'] + (m[2] or '')


def razreshit(d, slesh=False, gde=''):
    if isinstance(d, list):
        return [razreshit(x, slesh, gde) for x in d]
    if isinstance(d, dict):
        return {k: razreshit(v, slesh, gde) for k, v in d.items()}
    return kartinka(d, slesh, gde)
