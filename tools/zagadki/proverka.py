#!/usr/bin/env python3
"""r569. Проверка загадок января: каждый верный ответ подтверждён дословной цитатой из карточки дня.
python3 proverka.py [01-ДД ...]  — без аргументов все 31; по умолчанию читает src/data/igry/zagadki/izobreteniya-01.json; --papka <dir> — черновики по дню."""
import sys, json, re, os, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import yaml
from izvlech import lines, clean
WT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def norm(s): return re.sub(r'\s+', ' ', s.replace('ё', 'е').replace('Ё', 'Е').replace(' ', ' ')).strip().lower()
def istochnik(polya, pole, karta=None):
    if pole.startswith('pervenstvo.') and karta:
        # у «границы первенства» своего .src нет — берём первый источник карточки (sources[0])
        s = (karta.get('sources') or [{}])[0]
        return clean(s.get('title') or '') or None
    m = re.match(r'^(story\[\d+\]|fakty\[\d+\]\[\d+\])\.', pole)
    return polya.get(m.group(1) + '.src') if m else None
def proverit(key, den):
    karta = yaml.safe_load(open(f'{WT}/src/content/dni-shablon/izobreteniya/{key}.yaml'))
    polya = dict(lines(karta))
    osh = []
    if den.get('key', key) != key: osh.append('key не совпадает')
    p = den.get('predmet', '')
    if not p or len(p) > 22: osh.append(f'predmet пуст или длиннее 22: {p!r}')
    vv = den.get('voprosy') or []
    if len(vv) != 3: osh.append(f'вопросов {len(vv)}, нужно 3')
    for n, v in enumerate(vv, 1):
        o, a = v.get('o') or [], v.get('a')
        t = f'в{n}'
        if not 3 <= len(o) <= 4: osh.append(f'{t}: вариантов {len(o)}')
        if len(set(map(norm, o))) != len(o): osh.append(f'{t}: варианты повторяются')
        if not isinstance(a, int) or not 0 <= a < len(o): osh.append(f'{t}: a вне вариантов'); continue
        pole = v.get('pole', '')
        if not re.match(r'^((story\[\d+\]|fakty\[\d+\]\[\d+\])\.(summary|det\[\d+\])|pervenstvo\.granica)$', pole): osh.append(f'{t}: pole {pole!r} — нужно story/fakty, не .src')
        tekst = polya.get(pole)
        if tekst is None: osh.append(f'{t}: поля {pole!r} нет в карточке'); continue
        c, k = v.get('citata', ''), v.get('klyuch', '')
        if len(c) < 20: osh.append(f'{t}: цитата короче 20')
        if norm(c) not in norm(tekst): osh.append(f'{t}: цитаты нет в {pole} дословно')
        if len(k) < 3 or norm(k) not in norm(o[a]): osh.append(f'{t}: klyuch {k!r} не в верном варианте')
        if norm(k) not in norm(c): osh.append(f'{t}: klyuch {k!r} не в цитате')
        e = v.get('e', '')
        if not e or '\n' in e or len(e) > 220: osh.append(f'{t}: пояснение пусто, многострочно или длиннее 220')
        if not istochnik(polya, pole, karta): osh.append(f'{t}: у поля нет источника (.src) в карточке')
        if not v.get('q', '').strip().endswith('?'): osh.append(f'{t}: вопрос без «?»')
    return osh
if __name__ == '__main__':
    args = sys.argv[1:]
    obshchiy, papka = None, None
    if args[:1] == ['--papka']: papka = args[1]; args = args[2:]
    else: obshchiy = json.load(open(os.path.join(WT, 'src/data/igry/zagadki/izobreteniya-01.json')))
    keys = args or [f'01-{d:02d}' for d in range(1, 32)]
    ok = 0
    for k in keys:
        try:
            den = obshchiy['dni'][k] if obshchiy else json.load(open(f'{papka}/{k}.json'))
        except Exception as e:
            print(f'{k}: НЕТ ({e})'); continue
        osh = proverit(k, den)
        print(f'{k}: ' + ('ОК' if not osh else 'ОШИБКИ: ' + '; '.join(osh)))
        ok += not osh
    print(f'Итого {ok} из {len(keys)} дней ОК')
