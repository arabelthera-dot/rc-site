#!/usr/bin/env python3
"""Сторож изменений (Р309, 28.10.2026): то, чего не видит сторож «сайт жив» (storozh.sh).

Четыре проверки, каждая — против эталона в этой папке или прошлого запуска:
  dns        A/AAAA/NS/MX/CAA доменов сайта ↔ dns-etalon.txt (два независимых резолвера);
  stranicy   ключевые страницы живого сайта ↔ зеркало GitHub Pages (та же сборка из main), побайтно;
             плюс чужие хосты у <script>/<iframe>/<link>/<form> и адресов внутри <script> ↔ razreshennye-hosty.txt;
  ct         новые сертификаты в журналах Certificate Transparency (crt.sh, запасной — Cert Spotter),
             которых нет на нашем сервере и нет в sertifikaty.txt;
  dvoyniki   новые зарегистрированные домены-двойники (dnstwist) сверх dvoyniki-etalon.txt и прошлого запуска.

Итог — файл trevogi.json (список {vid, zagolovok, tekst}) и сводка запуска; тревогу поднимает trevoga.sh.
Ошибка внешнего сервиса (crt.sh лёг, зеркало не открылось) — предупреждение в сводке, не тревога.
Запуск: python3 storozh_izm.py [dns] [stranicy] [ct] [dvoyniki]   (без аргументов — все четыре)
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from datetime import datetime, timedelta, timezone

PAPKA = os.path.dirname(os.path.abspath(__file__))
SOST = os.environ.get('SOST', '.storozh-izm')  # состояние между запусками (кэш actions)
SAIT = os.environ.get('IZM_SAIT', 'https://russian-civilization.ru').rstrip('/')
ZERKALO = os.environ.get('IZM_ZERKALO', 'https://arabelthera-dot.github.io/rc-site').rstrip('/')
DOMEN = 'russian-civilization.ru'
SVODKA = os.environ.get('GITHUB_STEP_SUMMARY', '/dev/null')
UA = {'User-Agent': 'rc-storozh-izm (+https://github.com/arabelthera-dot/rc-site)'}

trevogi = []


def svodka(s):
    print(s)
    with open(SVODKA, 'a', encoding='utf-8') as f:
        f.write(s + '\n')


def preduprezhdenie(s):
    print(f'::warning::{s}')
    with open(SVODKA, 'a', encoding='utf-8') as f:
        f.write(f'- ⚠️ {s}\n')


def trevoga(vid, zagolovok, stroki):
    trevogi.append({'vid': vid, 'zagolovok': zagolovok, 'tekst': '\n'.join(stroki)})
    svodka(f'### 🔴 {zagolovok}\n' + '\n'.join(f'- {s}' for s in stroki))


def stroki(imya):
    with open(os.path.join(PAPKA, imya), encoding='utf-8') as f:
        return [s.strip() for s in f if s.strip() and not s.lstrip().startswith('#')]


def zabrat(url, taym=30, popytki=2):
    posl = None
    for i in range(popytki):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=taym) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001 — внешний сервис: любая ошибка = повтор
            posl = e
            time.sleep(5 * (i + 1))
    raise RuntimeError(f'{url}: {posl}')


def sost_chitat(imya, nachalo):
    p = os.path.join(SOST, imya)
    if os.path.exists(p):
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    return nachalo


def sost_pisat(imya, znach):
    os.makedirs(SOST, exist_ok=True)
    with open(os.path.join(SOST, imya), 'w', encoding='utf-8') as f:
        json.dump(znach, f, ensure_ascii=False, indent=1, sort_keys=True)


# ---------- 1. DNS ----------
def proverka_dns():
    import dns.resolver as rezolver  # dnspython ставится вместе с dnstwist (workflow)
    etalon = {}
    for s in stroki('dns-etalon.txt'):
        imya, tip, znach = s.split(None, 2)
        etalon.setdefault((imya, tip), set())
        if znach != '-':
            etalon[(imya, tip)].add(znach.lower())
    rezolvery = {'Cloudflare 1.1.1.1': '1.1.1.1', 'Google 8.8.8.8': '8.8.8.8'}
    rashozhdeniya, oshibki = [], []
    for nazv, ip in rezolvery.items():
        r = rezolver.Resolver(configure=False)
        r.nameservers = [ip]
        r.lifetime = 15
        for (imya, tip), nado in sorted(etalon.items()):
            try:
                est = {x.to_text().lower() for x in r.resolve(imya, tip)}
            except (rezolver.NoAnswer, rezolver.NXDOMAIN):
                est = set()
            except Exception as e:  # noqa: BLE001
                oshibki.append(f'{nazv}: {imya} {tip} — {type(e).__name__}')
                continue
            if est != nado:
                rashozhdeniya.append(f'{nazv}: {imya} {tip} — сейчас {sorted(est) or "нет"}, эталон {sorted(nado) or "нет"}')
    for o in oshibki:
        preduprezhdenie(f'DNS: {o}')
    if rashozhdeniya:
        trevoga('dns', 'DNS не совпадает с эталоном', rashozhdeniya +
                ['Законная смена (Михаил) — поправить scripts/storozh-izm/dns-etalon.txt заявкой.'])
    else:
        svodka(f'- 🟢 DNS: {len(etalon)} записей совпадают с эталоном ({", ".join(rezolvery)})')


# ---------- 2. Подмена страниц и чужие скрипты ----------
TEG = re.compile(r'<(script|iframe|frame|embed|object|link|form|meta)\b([^>]*)>', re.I)
ATTR = re.compile(r'\b(src|href|action|data|content)\s*=\s*["\']?([^"\'\s>]+)', re.I)
SKRIPT = re.compile(r'<script\b[^>]*>(.*?)</script>', re.I | re.S)
ADRES = re.compile(r'(?:https?:)?//([a-z0-9.-]+\.[a-z]{2,}|xn--[a-z0-9.-]+)', re.I)


def chuzhie_hosty(html):
    razr = [h.lower() for h in stroki('razreshennye-hosty.txt')]
    ok = lambda h: any(h == r or h.endswith('.' + r) for r in razr)  # noqa: E731
    naydeno = set()
    for teg, attrs in TEG.findall(html):
        teg = teg.lower()
        a = {k.lower(): v for k, v in ATTR.findall(attrs)}
        if teg == 'link':
            rel = re.search(r'rel\s*=\s*["\']?([^"\'>]+)', attrs, re.I)
            if not rel or not re.search(r'stylesheet|preload|modulepreload|prefetch|import|manifest', rel.group(1), re.I):
                continue
        if teg == 'meta':  # перенаправление <meta http-equiv="refresh" content="0;url=...">
            if not re.search(r'http-equiv\s*=\s*["\']?refresh', attrs, re.I):
                continue
        for k in ('src', 'href', 'action', 'data', 'content'):
            for h in ADRES.findall(a.get(k, '')):
                if not ok(h.lower()):
                    naydeno.add(f'<{teg} {k}> → {h.lower()}')
    for telo in SKRIPT.findall(html):
        for h in ADRES.findall(telo):
            if not ok(h.lower()):
                naydeno.add(f'адрес внутри <script> → {h.lower()}')
    return sorted(naydeno)


def idet_vykladka():
    """Сборка deploy.yml идёт или закончилась меньше 20 минут назад — Pages и msk-new могут на минуты расходиться."""
    try:
        out = subprocess.run(['gh', 'run', 'list', '-w', 'deploy.yml', '-L', '3', '--json', 'status,updatedAt'],
                             capture_output=True, text=True, timeout=60, check=True).stdout
    except Exception:  # noqa: BLE001
        return False
    seychas = datetime.now(timezone.utc)
    for r in json.loads(out or '[]'):
        if r['status'] != 'completed':
            return True
        if seychas - datetime.fromisoformat(r['updatedAt'].replace('Z', '+00:00')) < timedelta(minutes=20):
            return True
    return False


def stranicy():
    puti = stroki('stranicy.txt')
    pauza = int(os.environ.get('IZM_PAUZA', '180'))
    raznye, chuzhie, ne_otkrylis = [], [], []
    sverit = {}
    for p in puti:
        try:
            zhivoy = zabrat(SAIT + p)
        except Exception as e:  # noqa: BLE001
            ne_otkrylis.append(f'{SAIT}{p}: {e}')
            continue
        html = zhivoy.decode('utf-8', 'replace')
        for c in chuzhie_hosty(html):
            chuzhie.append(f'{SAIT}{p}: {c}')
        sverit[p] = zhivoy
    for p in list(sverit):
        try:
            if zabrat(ZERKALO + p) == sverit[p]:
                del sverit[p]
        except Exception as e:  # noqa: BLE001
            preduprezhdenie(f'зеркало не открылось, {p} не сверена: {e}')
            del sverit[p]
    if sverit:  # повтор: выкладка на msk-new идёт после Pages, минуты расхождения законны
        print(f'расходятся {list(sverit)} — повтор через {pauza} с')
        time.sleep(pauza)
        for p in list(sverit):
            try:
                a, b = zabrat(SAIT + p), zabrat(ZERKALO + p)
            except Exception as e:  # noqa: BLE001
                preduprezhdenie(f'повтор {p} не удался: {e}')
                continue
            if a == b:
                continue
            raznye.append(f'{SAIT}{p}: {len(a)} байт, sha256 {hashlib.sha256(a).hexdigest()[:12]}; '
                          f'сборка из main (зеркало) — {len(b)} байт, {hashlib.sha256(b).hexdigest()[:12]}; '
                          f'первое отличие — байт {next((i for i, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))}')
    for s in ne_otkrylis:
        preduprezhdenie(f'страница не открылась (доступность — дело storozh.yml): {s}')
    if raznye and idet_vykladka():
        preduprezhdenie('страницы расходятся с зеркалом, но выкладка идёт или только что прошла — проверю в следующий раз')
        raznye = []
    if raznye:
        trevoga('stranicy', 'Страница сайта не совпадает со сборкой из main', raznye +
                ['Сравнение: живой сайт (msk-new) ↔ зеркало GitHub Pages той же сборки. Проверь, не правили ли файлы на сервере.'])
    if chuzhie:
        trevoga('skripty', 'На странице чужой домен скрипта/фрейма/формы', chuzhie +
                ['Законный новый сервис — добавить хост в scripts/storozh-izm/razreshennye-hosty.txt заявкой.'])
    if not raznye and not chuzhie:
        svodka(f'- 🟢 Страницы: {len(puti) - len(ne_otkrylis)} из {len(puti)} совпадают со сборкой из main, чужих скриптов нет')


# ---------- 3. Сертификаты в журналах CT ----------
def nashi_na_servere():
    """Серийные номера и sha256 ключа (SPKI) сертификатов, которые сейчас отдаёт наш сервер."""
    serialy, klyuchi = set(), set()
    for h in (DOMEN, 'www.' + DOMEN, 'media.' + DOMEN):
        try:
            pem = subprocess.run(['openssl', 's_client', '-connect', f'{h}:443', '-servername', h],
                                 input='', capture_output=True, text=True, timeout=30).stdout
            ser = subprocess.run(['openssl', 'x509', '-noout', '-serial'], input=pem, capture_output=True,
                                 text=True, check=True).stdout
            serialy.add(ser.split('=', 1)[1].strip().lower().lstrip('0'))
            pub = subprocess.run(['openssl', 'x509', '-noout', '-pubkey'], input=pem, capture_output=True,
                                 text=True, check=True).stdout
            der = subprocess.run(['openssl', 'pkey', '-pubin', '-outform', 'der'], input=pub.encode(),
                                 capture_output=True, check=True).stdout
            klyuchi.add(hashlib.sha256(der).hexdigest())
        except Exception as e:  # noqa: BLE001
            preduprezhdenie(f'сертификат {h} не прочитан: {type(e).__name__}')
    return serialy, klyuchi


def ct_zapisi():
    """Записи {id, izdatel, imena, s, serial, klyuch} из crt.sh и Cert Spotter вместе: crt.sh под нагрузкой
    отвечает 502 или пустым списком, поэтому один источник не надёжен. Пустой ответ — как ошибка."""
    out, istochniki = [], []
    try:
        d = json.loads(zabrat(f'https://crt.sh/?q={DOMEN}&output=json&exclude=expired', 90, 3))
        if not d:
            raise RuntimeError('пустой список')
        out += [{'id': f'crtsh:{x["id"]}', 'izdatel': x['issuer_name'], 'imena': sorted(set(x['name_value'].split('\n'))),
                 's': x['not_before'].rstrip('Z') + 'Z', 'serial': x['serial_number'].lower().lstrip('0'), 'klyuch': ''}
                for x in d]
        istochniki.append(f'crt.sh {len(d)}')
    except Exception as e:  # noqa: BLE001
        preduprezhdenie(f'crt.sh не ответил: {e}')
    try:
        d = json.loads(zabrat(f'https://api.certspotter.com/v1/issuances?domain={DOMEN}&include_subdomains=true'
                              '&expand=dns_names&expand=issuer', 60, 3))
        if not d:
            raise RuntimeError('пустой список')
        out += [{'id': f'certspotter:{x["id"]}', 'izdatel': x['issuer']['name'], 'imena': x['dns_names'],
                 's': x['not_before'], 'serial': '', 'klyuch': x['pubkey_sha256']} for x in d]
        istochniki.append(f'Cert Spotter {len(d)}')
    except Exception as e:  # noqa: BLE001
        preduprezhdenie(f'Cert Spotter не ответил: {e}')
    if not istochniki:
        raise RuntimeError('ни crt.sh, ни Cert Spotter')
    return ', '.join(istochniki), out


def ct():
    izdateli = [s.split(None, 1)[1] for s in stroki('sertifikaty.txt') if s.startswith('izdatel ')]
    nashi = {s.split()[1] for s in stroki('sertifikaty.txt') if s.startswith('nash ')}
    try:
        istochnik, zapisi = ct_zapisi()
    except Exception as e:  # noqa: BLE001
        preduprezhdenie(f'журналы CT недоступны (crt.sh и Cert Spotter): {e}')
        return
    vidennye = set(sost_chitat('ct.json', []))
    serialy, klyuchi = nashi_na_servere()
    granica = datetime.now(timezone.utc) - timedelta(days=int(os.environ.get('IZM_CT_DNEY', '10')))
    chuzhie = []
    for z in zapisi:
        nomer = z['id'].split(':', 1)[1]
        if z['id'] in vidennye or nomer in nashi or (z['serial'] and z['serial'] in nashi):
            continue
        svoy_izdatel = any(i.lower() in z['izdatel'].lower() for i in izdateli)
        na_servere = (z['serial'] and z['serial'] in serialy) or (z['klyuch'] and z['klyuch'] in klyuchi)
        svezhiy = datetime.fromisoformat(z['s'].replace('Z', '+00:00')) >= granica
        if not svoy_izdatel or (svezhiy and not na_servere):
            chuzhie.append(f'{", ".join(z["imena"])} — издатель «{z["izdatel"]}», выпущен {z["s"]}, '
                           f'{"на нашем сервере его НЕТ" if not na_servere else "на сервере есть"} ({z["id"]})')
        else:
            vidennye.add(z['id'])
    sost_pisat('ct.json', sorted(vidennye))
    if chuzhie:
        trevoga('ct', 'В журналах CT сертификат на наш домен, выпущенный не нами', chuzhie + [
            'Проверь у Михаила, не выпускал ли он его (certbot на msk-new). Свой — добавить строкой «nash <номер>» '
            'в scripts/storozh-izm/sertifikaty.txt. Чужой — инцидент SEV-1 (docs/security/incident-response.md).'])
    else:
        svodka(f'- 🟢 Сертификаты ({istochnik}): все свои')


# ---------- 4. Домены-двойники ----------
def dvoyniki():
    etalon = {s.lower() for s in stroki('dvoyniki-etalon.txt')}
    proshlye = set(sost_chitat('dvoyniki.json', []))
    try:
        out = subprocess.run([sys.executable, '-m', 'dnstwist', '--registered', '--format', 'json', '--threads', '40',
                              '--tld', os.path.join(PAPKA, 'zony.txt'), DOMEN],
                             capture_output=True, text=True, timeout=1500, check=True).stdout
        naydeno = json.loads(out)
    except Exception as e:  # noqa: BLE001
        preduprezhdenie(f'dnstwist не отработал: {type(e).__name__}: {str(e)[:200]}')
        return
    novye = []
    vse = set()
    for x in naydeno:
        d = x['domain'].lower()
        if x.get('fuzzer') == '*original' or d == DOMEN:
            continue
        vse.add(d)
        if d not in etalon and d not in proshlye:
            novye.append(f'{d} ({x.get("fuzzer")}) — A {",".join(x.get("dns_a") or []) or "—"}, '
                         f'NS {",".join(x.get("dns_ns") or []) or "—"}, MX {",".join(x.get("dns_mx") or []) or "—"}')
    sost_pisat('dvoyniki.json', sorted(vse | proshlye))
    if novye:
        trevoga('dvoyniki', 'Зарегистрирован новый домен-двойник', novye + [
            'Разобрать: парковка, фишинг, почта (MX)? Разобрали — внести в scripts/storozh-izm/dvoyniki-etalon.txt.'])
    else:
        svodka(f'- 🟢 Двойники: {len(vse)} зарегистрированных похожих доменов, новых нет')


if __name__ == '__main__':
    vse_proverki = {'dns': proverka_dns, 'stranicy': stranicy, 'ct': ct, 'dvoyniki': dvoyniki}
    vybor = sys.argv[1:] or list(vse_proverki)
    svodka(f'## Сторож изменений — {", ".join(vybor)}')
    for v in vybor:
        try:
            vse_proverki[v]()
        except Exception as e:  # noqa: BLE001 — сбой одной проверки не роняет остальные
            preduprezhdenie(f'проверка {v} упала: {type(e).__name__}: {e}')
    with open(os.environ.get('TREVOGI', 'trevogi.json'), 'w', encoding='utf-8') as f:
        json.dump(trevogi, f, ensure_ascii=False, indent=1)
    print(f'тревог: {len(trevogi)}')
