#!/usr/bin/env python3
"""Сторож из России (Р721 пп.129, 130, 152, 153; 10.11.2026). Раз в сутки, только читает сайт снаружи.

Три вопроса — и итог в status.json + README.md (папка VYHOD, по умолчанию .storozh-rf):
  а) открываются ли сайт и медиа из российских сетей: Globalping (бесплатно, без ключа) — пробы в сетях
     МТС, Билайна, Ростелекома (Мегафона среди проб Globalping нет — так и пишем); запасной — два московских
     узла check-host.net;
  б) нет ли домена или его адреса в реестре блокировок — ежедневная выгрузка antifilter.download
     (domains.lst, ip.lst);
  в) сколько дней до конца сертификата — из ответа проб, а не открылось — напрямую; тревога при < POROG_DNEY (20).
Что-то не так — печатает строки тревоги в TREVOGA (файл), работа всегда зелёная: сборку не останавливает.
Образец — Upptime (https://upptime.js.org): проверка по расписанию на Actions, итог — файл в репозитории.
"""
import datetime as dt
import ipaddress
import json
import os
import socket
import ssl
import time
import urllib.request

DOMENY = os.environ.get('DOMENY', 'russian-civilization.ru media.russian-civilization.ru').split()
POROG = int(os.environ.get('POROG_DNEY', '20'))
VYHOD = os.environ.get('VYHOD', '.storozh-rf')
# Сети операторов (номер автономной системы → имя); Мегафон (AS31133, AS25159) — проб у Globalping нет.
SETI = {8359: 'МТС', 8402: 'Билайн', 3216: 'Билайн', 12389: 'Ростелеком', 31133: 'Мегафон', 25159: 'Мегафон'}
UA = {'User-Agent': 'rc-storozh-rf (+https://github.com/arabelthera-dot/rc-site)'}


def zapros(url, dannye=None, tajmaut=60):
    zag = dict(UA, Accept='application/json')
    if dannye is not None:
        zag['Content-Type'] = 'application/json'
        dannye = json.dumps(dannye).encode()
    with urllib.request.urlopen(urllib.request.Request(url, data=dannye, headers=zag), timeout=tajmaut) as r:
        return r.read()


def globalping_raz(domen, mesta):
    telo = {'type': 'http', 'target': domen, 'locations': mesta,
            'measurementOptions': {'protocol': 'HTTPS', 'request': {'method': 'HEAD', 'path': '/'}}}
    m = json.loads(zapros('https://api.globalping.io/v1/measurements', telo))
    for _ in range(18):  # до 90 с
        time.sleep(5)
        r = json.loads(zapros(f"https://api.globalping.io/v1/measurements/{m['id']}"))
        if r.get('status') != 'in-progress':
            break
    itog = []
    for x in r.get('results', []):
        p, res = x['probe'], x['result']
        if res.get('status') == 'in-progress':  # проба не успела — не ответ, а «не знаем»
            continue
        tls = res.get('tls') or {}
        kod = res.get('statusCode')
        nado = (200,) if domen == DOMENY[0] else tuple(range(200, 500))
        itog.append({'set': SETI.get(p['asn'], p['network']), 'asn': p['asn'], 'gorod': p.get('city'),
                     'kod': kod, 'sert_podlinnyy': tls.get('authorized'), 'sert_do': tls.get('expiresAt'),
                     'oshibka': None if kod else (res.get('rawOutput') or '')[:120],
                     'ok': res.get('status') == 'finished' and kod in nado and tls.get('authorized') is True})
    return m['id'], itog


def globalping(domen):
    """Пробы в сетях операторов. Отвечает — код меньше 500 и сертификат подлинный (заглушка оператора
    на https даёт чужой сертификат). Сайт обязан отдать 200, у медиа корень — 404 nginx, это «жив».
    Провал — повтор через минуту на тех же пробах (locations = номер прошлого замера): одна проба
    Билайна в Краснодаре 10.11 то открывала, то нет; тревога — только при двух провалах подряд."""
    seti = sorted({a for a in SETI if a not in (31133, 25159)})
    nomer, itog = globalping_raz(domen, [{'country': 'RU', 'asn': a, 'limit': 1} for a in seti])
    if any(not t['ok'] for t in itog):
        time.sleep(int(os.environ.get('PAUZA', '60')))
        _, vtoroy = globalping_raz(domen, nomer)
        ok2 = {(t['asn'], t['gorod']) for t in vtoroy if t['ok']}
        for t in itog:
            if not t['ok'] and (t['asn'], t['gorod']) in ok2:
                t['ok'], t['povtor'] = True, 'со второго раза'
    return itog


def checkhost(domen):
    """Запасной путь: московские узлы check-host.net (сети хостингов, не операторов)."""
    uzly = [k for k, v in json.loads(zapros('https://check-host.net/nodes/hosts'))['nodes'].items()
            if v['location'][0] == 'ru']
    if not uzly:
        return []
    q = '&'.join('node=' + u for u in uzly)
    r = json.loads(zapros(f'https://check-host.net/check-http?host=https://{domen}/&{q}'))
    for _ in range(9):  # узел ещё проверяет — null; ждём до 90 с
        time.sleep(10)
        res = json.loads(zapros(f"https://check-host.net/check-result/{r['request_id']}"))
        if all(res.get(u) is not None for u in uzly):
            break
    itog = []
    for u in uzly:
        v = (res.get(u) or [[None]])[0] or [None]  # [1|0, время, текст, код, адрес]; 404 даёт 0 — это ответ
        kod = v[3] if len(v) > 3 else None
        nado = ('2',) if domen == DOMENY[0] else ('2', '3', '4')
        itog.append({'uzel': u, 'kod': kod, 'ok': str(kod or '').startswith(nado)})
    return itog


def sert_napryamuyu(domen):
    kont = ssl.create_default_context()
    with socket.create_connection((domen, 443), timeout=20) as s, kont.wrap_socket(s, server_hostname=domen) as t:
        do = t.getpeercert()['notAfter']
    return dt.datetime.strptime(do, '%b %d %H:%M:%S %Y %Z').replace(tzinfo=dt.timezone.utc).isoformat()


def reestr(domeny):
    """Выгрузка реестра блокировок (antifilter.download, обновляется раз в сутки): домен, его поддомены
    и адреса домена (ip.lst — отдельные адреса и подсети)."""
    # построчно, без множества на 1,8 млн строк: на раннере память не тратим
    v_reestre, vsego = set(), 0
    for x in zapros('https://antifilter.download/list/domains.lst', tajmaut=180).decode('utf-8', 'replace').split():
        vsego += 1
        if any(x == d or x.endswith('.' + d) for d in domeny):
            v_reestre.add(x)
    adresa = {a for d in domeny for a in {i[4][0] for i in socket.getaddrinfo(d, 443, socket.AF_INET)}}
    seti = []
    for stroka in zapros('https://antifilter.download/list/ip.lst', tajmaut=180).decode().split():
        try:
            seti.append(ipaddress.ip_network(stroka, strict=False))
        except ValueError:
            pass
    adresa_v = sorted(a for a in adresa if any(ipaddress.ip_address(a) in n for n in seti))
    return {'domeny_v_reestre': sorted(v_reestre), 'adresa': sorted(adresa), 'adresa_v_reestre': adresa_v,
            'zapisey_v_vygruzke': vsego}


def main():
    teper = dt.datetime.now(dt.timezone.utc)
    status = {'proverka': teper.strftime('%Y-%m-%dT%H:%M:%SZ'), 'domeny': {}, 'trevoga': []}
    trev = status['trevoga']
    for d in DOMENY:
        z = status['domeny'][d] = {}
        try:
            z['operatory'] = globalping(d)
        except Exception as e:  # сеть проверки недоступна — это не сбой сайта
            z['operatory'] = []
            z['oshibka_globalping'] = str(e)[:200]
        try:
            z['check_host'] = checkhost(d)
        except Exception as e:
            z['check_host'] = []
            z['oshibka_check_host'] = str(e)[:200]
        tochki = z['operatory'] + z['check_host']
        upali = [t.get('set') or t.get('uzel') for t in tochki if not t['ok']]
        if not tochki:
            trev.append(f'{d}: ни одна российская сеть проверки не ответила — состояние неизвестно')
        elif upali:
            trev.append(f"{d}: не открывается из {', '.join(map(str, upali))}")
        sroki = [t['sert_do'] for t in z['operatory'] if t.get('sert_do')]
        try:
            sert = min(sroki) if sroki else sert_napryamuyu(d)
            dney = (dt.datetime.fromisoformat(sert.replace('Z', '+00:00')) - teper).days
            z['sertifikat'] = {'do': sert, 'dney': dney}
            if dney < POROG:
                trev.append(f'{d}: сертификат кончается через {dney} дн. (порог {POROG})')
        except Exception as e:
            z['sertifikat'] = {'oshibka': str(e)[:200]}
            trev.append(f'{d}: срок сертификата узнать не удалось — {str(e)[:120]}')
    try:
        status['reestr'] = reestr(DOMENY)
        r = status['reestr']
        if r['domeny_v_reestre'] or r['adresa_v_reestre']:
            trev.append('в реестре блокировок: ' + ', '.join(r['domeny_v_reestre'] + r['adresa_v_reestre']))
    except Exception as e:
        status['reestr'] = {'oshibka': str(e)[:200]}
    status['rabotaet'] = not trev
    os.makedirs(VYHOD, exist_ok=True)
    with open(os.path.join(VYHOD, 'status.json'), 'w', encoding='utf-8') as f:
        json.dump(status, f, ensure_ascii=False, indent=1)
    with open(os.path.join(VYHOD, 'README.md'), 'w', encoding='utf-8') as f:
        f.write(readme(status))
    with open(os.environ.get('TREVOGA', os.path.join(VYHOD, 'trevoga.txt')), 'w', encoding='utf-8') as f:
        f.write('\n'.join(trev))
    print(readme(status))


def readme(s):
    w = ['# Сторож из России', '',
         ('## 🟢 Сайт работает' if s['rabotaet'] else '## 🔴 Есть трудности'), '',
         f"Последняя проверка: {s['proverka']} (UTC). Проверка раз в сутки — workflow `storozh-rf.yml`.", '']
    for t in s['trevoga']:
        w.append(f'- ❗ {t}')
    for d, z in s['domeny'].items():
        w += ['', f'### {d}', '', '| Откуда | Код | Открылся |', '|---|---|---|']
        for t in z['operatory']:
            w.append(f"| {t['set']} (AS{t['asn']}, {t['gorod']}) | {t['kod']} | {'да' if t['ok'] else 'нет'} |")
        for t in z['check_host']:
            w.append(f"| {t['uzel']} (хостинг, Москва) | {t['kod']} | {'да' if t['ok'] else 'нет'} |")
        w.append('| Мегафон | — | проб в бесплатной сети Globalping нет |')
        sr = z.get('sertifikat', {})
        w += ['', f"Сертификат: до {sr.get('do', '?')}, осталось {sr.get('dney', '?')} дн."]
    r = s.get('reestr', {})
    w += ['', '### Реестр блокировок (выгрузка antifilter.download)', '',
          (f"Ошибка выгрузки: {r['oshibka']}" if 'oshibka' in r else
           f"Домены в реестре: {', '.join(r['domeny_v_reestre']) or 'нет'}; адреса {', '.join(r['adresa'])} — "
           f"в реестре: {', '.join(r['adresa_v_reestre']) or 'нет'} (записей в выгрузке: {r['zapisey_v_vygruzke']})."), '']
    return '\n'.join(w)


if __name__ == '__main__':
    main()
