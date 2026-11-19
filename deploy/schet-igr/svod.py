#!/usr/bin/env python3
"""Сводка «начал игру — доиграл» (Р286 п.3) из журнала nginx rc-igry.log → /srv/rc-site/schet/igry.json.
Крон на msk-new раз в час (README.md). В выход — только суммы по дню и игре; журнал — время и строка события, без адресов.
Читает rc-igry.log и ротированные rc-igry.log.N[.gz] — счёт за всё время, что лежат журналы (logrotate: 400 дней)."""
import glob, gzip, json, os, sys, urllib.parse
LOG = os.environ.get('RC_IGRY_LOG', '/var/log/nginx/rc-igry.log')
OUT = os.environ.get('RC_IGRY_OUT', '/srv/rc-site/schet/igry.json')
schet = {}
for f in sorted(glob.glob(LOG + '*')):
    with (gzip.open(f, 'rt') if f.endswith('.gz') else open(f)) as fh:
        for line in fh:
            parts = line.split(' ', 2)
            if len(parts) < 3 or parts[1] != '0':          # 1 — бот по User-Agent, не считаем
                continue
            q = dict(urllib.parse.parse_qsl(parts[2].strip()))
            m, d, g, e = q.get('m', ''), q.get('d', ''), q.get('g', ''), q.get('e', '')
            if e not in ('nachal', 'vyigral', 'proigral') or not m or len(d) != 5:
                continue
            r = schet.setdefault((m, d, g), {'muzey': m, 'den': d, 'igra': g, 'nachal': 0, 'vyigral': 0, 'proigral': 0})
            r[e] += 1
stroki = sorted(schet.values(), key=lambda r: (r['muzey'], r['den'], r['igra']))
os.makedirs(os.path.dirname(OUT), exist_ok=True)
tmp = OUT + '.tmp'
with open(tmp, 'w') as fh:
    json.dump({'obnovleno': __import__('datetime').datetime.now().astimezone().isoformat(timespec='minutes'), 'stroki': stroki}, fh, ensure_ascii=False)
os.replace(tmp, OUT)
print(f'{len(stroki)} строк → {OUT}', file=sys.stderr)
