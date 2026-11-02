#!/usr/bin/env python3
"""r569. Собирает загадки января из черновиков по дню в один файл данных и кладёт копию для страницы.
python3 tools/zagadki/sobrat.py <папка с 01-ДД.json>
→ src/data/igry/zagadki/izobreteniya-01.json (источник) и public/muzei/izobreteniya/vau/zagadki-01.json (для загадки).
Источник пояснения (ist) подставляется машиной из поля .src того удара карточки, откуда цитата."""
import sys, os, json, re, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import yaml
from izvlech import lines
from proverka import proverit, istochnik, WT
MES = 'января'
papka = sys.argv[1]
dni = {}
for d in range(1, 32):
    k = f'01-{d:02d}'
    den = json.load(open(f'{papka}/{k}.json'))
    osh = proverit(k, den)
    if osh: sys.exit(f'{k}: {"; ".join(osh)}')
    karta = yaml.safe_load(open(f'{WT}/src/content/dni-shablon/izobreteniya/{k}.yaml'))
    polya = dict(lines(karta))
    voprosy = []
    for v in den['voprosy']:
        ist = re.sub(r'^Источники?:\s*', '', istochnik(polya, v['pole'], karta))
        ist = re.sub(r'\s*[—-]\s*(https?://)?[\w.-]+\.(ru|com|org|su|net)(/\S*)?(?=\s|$)', ';', ist)
        ist = re.sub(r'\s*;[\s;]*', '; ', ist).strip(' ;.,')
        voprosy.append({'q': v['q'], 'o': v['o'], 'a': v['a'], 'e': v['e'], 'ist': ist,
                        'pole': v['pole'], 'citata': v['citata'], 'klyuch': v['klyuch']})
    dni[k] = {'data': f'{d} {MES}', 'predmet': den['predmet'],
              'url': f'https://russian-civilization.ru/muzei/izobreteniya/den/{k}/', 'voprosy': voprosy}
out = {'muzei': 'izobreteniya', 'mesyac': '01',
       'pro': 'Загадка дня: 3 вопроса, у каждого верный ответ подтверждён цитатой из карточки дня (src/content/dni-shablon/izobreteniya/01-ДД.yaml, поле pole). Проверка: python3 tools/zagadki/proverka.py',
       'stroka': 'Русская цивилизация · {data} · {predmet} {kvadraty} — {verno} из {vsego}',
       'dni': dni}
src = f'{WT}/src/data/igry/zagadki/izobreteniya-01.json'
json.dump(out, open(src, 'w'), ensure_ascii=False, indent=1)
shutil.copy(src, f'{WT}/public/muzei/izobreteniya/vau/zagadki-01.json')
print('собрано дней:', len(dni))
