# Способ А пробы (п.142): Argos Translate + словарь имён. Имя из glossary.tsv → заглушка 87NN до перевода,
# после перевода заглушка → имя на языке. ru→zh/ar идёт через английский (прямых пар в Argos нет), заглушки живут оба шага.
# python3 argos_slovar.py stroki.json en,zh,ar <папка>  → <папка>/A-<код>.json [{"id","ru","t","poteri"}] и время в A-vremya.json
import json, re, sys, time, logging
logging.disable(logging.WARNING)
import argostranslate.translate as tr

def slovar(put):
    rows = [l.rstrip('\n').split('\t') for l in open(put) if l.strip() and not l.startswith('#')]
    head = rows[0]
    return [dict(zip(head, r)) | {'re': re.compile(r[0])} for r in rows[1:]]

def zaglushki(t, sl):
    vzyato = []
    def zam(m, z):
        vzyato.append(z); return str(8700 + len(vzyato))
    for z in sl: t = z['re'].sub(lambda m: zam(m, z), t)
    return t, vzyato

def vernut(t, vzyato, kod):
    poteri = 0
    for i, z in reversed(list(enumerate(vzyato, 1))):
        if str(8700 + i) in t: t = t.replace(str(8700 + i), z[kod])
        else: poteri += 1
    return t, poteri

if __name__ == '__main__':
    stroki, kody, kuda = json.load(open(sys.argv[1])), sys.argv[2].split(','), sys.argv[3]
    sl = slovar(__file__.rsplit('/', 1)[0] + '/glossary.tsv')
    vremya = {}
    t0 = time.time(); tr.translate('Проба.', 'ru', 'en'); vremya['zagruzka_modeli_s'] = round(time.time() - t0, 1)
    pod = [zaglushki(s['ru'], sl) for s in stroki]
    t0 = time.time(); en = [tr.translate(t, 'ru', 'en') for t, _ in pod]; vremya['en'] = round(time.time() - t0, 1)
    for kod in kody:
        t0 = time.time()
        gotovo = en if kod == 'en' else [tr.translate(t, 'en', kod) for t in en]
        if kod != 'en': vremya[kod] = round(time.time() - t0 + vremya['en'], 1)
        out = []
        for s, (_, vz), g in zip(stroki, pod, gotovo):
            t, p = vernut(g, vz, kod); out.append({'id': s['id'], 'ru': s['ru'], 't': t, 'imen': len(vz), 'poteri': p})
        json.dump(out, open(f'{kuda}/A-{kod}.json', 'w'), ensure_ascii=False, indent=1)
        print(kod, 'сек', vremya[kod], 'имён', sum(x['imen'] for x in out), 'потеряно', sum(x['poteri'] for x in out), file=sys.stderr)
    json.dump(vremya, open(f'{kuda}/A-vremya.json', 'w'), indent=1)
