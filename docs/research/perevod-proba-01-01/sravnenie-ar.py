#!/usr/bin/env python3
# Сравнение двух переводов дня на арабский (А — Argos со словарём, Б — модель по словарю):
# имена из glossary-ar.tsv, длина ar/ru, строки без изоляции bidi, HTML-мусор, сходство обратного перевода с ru.
import json, csv, re, difflib
g = list(csv.DictReader(open('glossary-ar.tsv'), delimiter='\t'))
for nm in 'AB':
    X = json.load(open(f'{nm}-ar.json'))
    imen = verno = bidi = musor = 0; dl = []; sh = []
    for x in X:
        dl.append(len(x['t']) / max(1, len(x['ru'])))
        sh.append(difflib.SequenceMatcher(None, x['ru'], x['obratno']).ratio())
        bidi += bool(re.search(r'[A-Za-z0-9]', x['t']))
        musor += '&quot;' in x['t']
        for e in g:
            if e['ru_osnova'] in x['ru']:
                imen += 1; verno += e['ar'].split()[-1][:4] in x['t']
    print(nm, f'имён {verno}/{imen}', f'длина ar/ru {sum(dl)/len(dl):.2f} (макс {max(dl):.2f})',
          f'строк с цифрами/латиницей {bidi}', f'&quot; {musor}', f'сходство обратного {sum(sh)/len(sh):.2f}')
