# Обратный перевод на русский для проверки (п.168): строки перевода дня X→ru тем же Argos Translate (без прямой пары — через
# английский) сверяются с русским подлинником. Только подсказка: пишет таблицу подозрительных строк (потеряно число, мало общих
# слов) в stdout — perevod.yml кладёт её в сводку прогона; ничего не останавливает и ничего не меняет в файлах.
# Как в мире: обратный перевод (back-translation) — обычная сверка машинного перевода; переводчик — https://github.com/argosopentech/argos-translate ,
# похожая сверка с подлинником — BLEU/chrF в https://github.com/mjpost/sacrebleu .
# Руками: python3 scripts/perevod-obratno.py src/data/perevod/<музей>-<ММ-ДД>.json …   OBRATNO_N=40 — строк на язык (0 — все).
import json, os, re, sys
from difflib import SequenceMatcher
import argostranslate.package as pak, argostranslate.translate as tr

N = int(os.environ.get('OBRATNO_N', '40'))
CHISLO = re.compile(r'\d+')
SLOVO = re.compile(r'[а-яёa-z]{4,}')


def ustanovit(nuzhno):
    est = {(p.from_code, p.to_code) for p in pak.get_installed_packages()}
    if nuzhno - est:
        pak.update_package_index()
        for p in pak.get_available_packages():
            if (p.from_code, p.to_code) in nuzhno - est:
                print(f'obratno: ставлю модель {p.from_code}→{p.to_code}', file=sys.stderr)
                pak.install_from_path(p.download())


def obratno(t, kod):
    en = t if kod == 'en' else tr.translate(t, kod, 'en')
    return tr.translate(en, 'en', 'ru')


def shozhest(a, b):
    """Доля общих основ слов (первые 5 букв) — грубо, но одинаково для всех языков."""
    osn = lambda s: [w[:5] for w in SLOVO.findall(s.lower())]
    return SequenceMatcher(None, osn(a), osn(b)).ratio()


fayly = [f for f in sys.argv[1:] if f.endswith('.json') and os.path.exists(f)]
if not fayly:
    print('Обратный перевод: файлов перевода нет.')
    sys.exit(0)
dannye = {f: json.load(open(f, encoding='utf-8')) for f in fayly}
kody = sorted({k for d in dannye.values() for k in d if not k.startswith('_') and k != 'ru'})
ustanovit({('en', 'ru')} | {(k.split('-')[0], 'en') for k in kody if k.split('-')[0] != 'en'})
print('### Обратный перевод на русский (подсказка, ничего не останавливает)\n')
for f, d in dannye.items():
    for kod in kody:
        stroki = [(k, t) for k, t in (d.get(kod) or {}).items() if k in d['ru']]
        stroki = stroki[:N] if N else stroki
        hudshie = []
        for k, t in stroki:
            nazad = obratno(t, kod.split('-')[0])
            ru = d['ru'][k]
            poteryano = set(CHISLO.findall(ru)) - set(CHISLO.findall(t))
            s = shozhest(ru, nazad)
            if poteryano or s < 0.35:
                hudshie.append((s, k, ru, nazad, poteryano))
        print(f'- {os.path.basename(f)} {kod}: проверено {len(stroki)}, подозрительных {len(hudshie)}')
        for s, k, ru, nazad, poteryano in sorted(hudshie)[:10]:
            chisla = f" потеряны числа {', '.join(sorted(poteryano))};" if poteryano else ''
            print(f'  - `{k}` сходство {s:.2f};{chisla} было: «{ru[:120]}» → назад: «{nazad[:120]}»')
