# Строки дня для пробы перевода (п.142, Р603): хук, факты (из утверждённого), подписи, тексты игр. Адрес страницы — нет.
# python3 tools/perevod-proba/stroki.py <музей> <ММ-ДД> > stroki.json  →  [{"id", "ru"}]
import json, re, sys, html
from html.parser import HTMLParser
import yaml

muzei, den = sys.argv[1], sys.argv[2]
KIR = re.compile('[а-яёА-ЯЁ]')
out = []
def dob(i, t):
    if isinstance(t, str) and KIR.search(t):
        out.append({'id': i, 'ru': html.unescape(re.sub(r'<br\s*/?>', ' ', re.sub(r'</?(b|i|em|strong)>', '', t))).strip()})

y = yaml.safe_load(open(f'src/content/dni-shablon/{muzei}/{den}.yaml'))
u = json.load(open(f'src/data/utverzhdeno/{muzei}/{den}.json'))
dob('hook.h1', y['lead']['h1']); dob('hook.hook', y['lead']['hook'])
for f in u['fakty']:
    dob(f"fakt.{f['n']}.zagolovok", f['zagolovok']); dob(f"fakt.{f['n']}.podrobnee", f['podrobnee'])
dob('oblozhka.podpis', y['oblozhka'].get('podpis'))
for i, f in enumerate(y.get('figures') or []): dob(f'figures.{i}.podpis', f.get('podpis'))
def obhod(v, p):
    if isinstance(v, dict):
        for k, x in v.items():
            if k == 'podpis': dob(p + '.podpis', x)
            else: obhod(x, f'{p}.{k}')
    elif isinstance(v, list):
        for i, x in enumerate(v): obhod(x, f'{p}.{i}')
obhod(y.get('razdely'), 'razdely')
q = y.get('quiz') or {}
for i, v in enumerate(q.get('voprosy', [])):
    dob(f'quiz.{i}.q', v['q']); dob(f'quiz.{i}.e', v['e'])
    for j, o in enumerate(v['o']): dob(f'quiz.{i}.o.{j}', o)
class T(HTMLParser):
    n = 0
    def handle_data(self, d):
        if KIR.search(d): T.n += 1; dob(f"igra.{y['igra']['imya']}.{T.n}", ' '.join(d.split()))
T().feed(open(f"src/data/igry/{muzei}/{y['igra']['imya']}.html").read())
json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
