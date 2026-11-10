# Обратный перевод на русский для сверки глазами (п.142): Argos X→ru (zh/ar — через английский), одинаково для способов А и Б.
# python3 obratno.py <папка> A-en B-en A-zh …  → поле "obratno" дописывается в <папка>/<имя>.json
import json, sys, logging
logging.disable(logging.WARNING)
import argostranslate.translate as tr
kuda = sys.argv[1]
for imya in sys.argv[2:]:
    kod = imya.split('-')[1]
    d = json.load(open(f'{kuda}/{imya}.json'))
    for x in d:
        en = x['t'] if kod == 'en' else tr.translate(x['t'], kod, 'en')
        x['obratno'] = tr.translate(en, 'en', 'ru')
    json.dump(d, open(f'{kuda}/{imya}.json', 'w'), ensure_ascii=False, indent=1)
    print(imya, 'готово', file=sys.stderr)
