#!/usr/bin/env python3
"""Готовность января (Р544, Р179): таблица 62 дней — два музея × 01-01…01-31.

Пересчитывается при каждой сборке (шаг в конце `npm run build`): читает собранные страницы
dist/muzei/<музей>/den/01-ДД/index.html и кладёт рядом таблицу:
  dist/doska/gotovnost-yanvarya/index.html  — таблица для людей (стили — gotovnost.css рядом)
  dist/doska/gotovnost-yanvarya/tablica.csv — та же таблица для машины
  dist/doska/gotovnost-yanvarya/dannye.json — всё, что посчитано, с причинами

Колонки: дата, герой, 10 фактов + «Ещё 5», хук, кадры без повторов, игра, аудиогид, ролик 16:9, ролик 9:16,
источник открывается. Клетка зелёная — проверено и есть; красная — короткая строка, чего нет; серая —
не проверено (сеть, сайт не пустил проверку) и зелёной не считается. Полный день — все клетки зелёные.

Кадры — как tools/kadry-povtory.py (Р408): разных в теле ≥ 6, повторов 0; повтор — pHash, Хэмминг ≤ 8
(без imagehash — совпадение файла по содержимому). Ролики — по video/registry.json: у страницы есть
data-rc-video, в реестре у выпуска есть horizontal шире высоты и vertical выше ширины.

Без --zamok только отчёт: код выхода всегда 0, сборку не роняет. Откат — убрать шаг из package.json и этот файл.

Храповик полных дней (Р550, --zamok data/gotovnost/polnye-dni.json): день из списка получил красную клетку — код 1
и ::error:: (полный день стал неполным — заявка красная). Серая клетка не краснит: облако без сети — серое, не красное.
«Полный для храповика» — все клетки зелёные, у «Источника» допустима серая (ссылки есть, но не проверены сетью).
Новый такой день — ::notice::; --zapisat дописывает его в список (убирать из списка машина не умеет — только расти).

РФ-выход (Р550, Р553, включён): ссылки источников проверяются через российский выход socks5h://rf-proxy:1080 (PySocks) —
где он есть (наш раннер, наш сервер). Другой адрес — --rf-vyhod socks5h://хост:порт или GOTOVNOST_RF_PROXY; выключить —
--rf-vyhod net. Выхода нет (облако GitHub) — проверка напрямую с чужой точки: открылось — зелёное, не открылось —
серое, не красное (с чужой точки «не открылось» не доказывает «не открывается у читателя в России»).

  python3 tools/tablica-gotovnosti.py --dist dist                       # в сборке
  python3 tools/tablica-gotovnosti.py --live --out /tmp/gotovnost       # по живому сайту
  python3 tools/tablica-gotovnosti.py --live --bez-seti --out /tmp/g    # без проверки источников
  python3 tools/tablica-gotovnosti.py --dist dist --bez-seti --zamok data/gotovnost/polnye-dni.json   # храповик в CI
  python3 tools/tablica-gotovnosti.py --dist dist --rf-vyhod --zamok data/gotovnost/polnye-dni.json --zapisat
  python3 tools/tablica-gotovnosti.py --proba                           # пробы храповика на выдуманных строках
"""
import argparse
import concurrent.futures as cf
import csv
import hashlib
import html
import html.parser
import importlib.util
import io
import json
import os
import re
import socket
import ssl
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

SAJT = 'https://russian-civilization.ru'
PUT_TABLICY = 'doska/gotovnost-yanvarya'
MUZEI = [  # slug, полное название — дословно title_ru из src/data/museums.json
    ('izobreteniya', 'Музей «Что изобрели русские первыми в мире»'),
    ('ne-sdayutsya', 'Музей стойкости и подвига «Русские не сдаются»'),
]
DNI = [f'01-{d:02d}' for d in range(1, 32)]
FAKTOV, ESCHE = 10, 5
KOLONKI = [  # ключ, заголовок
    ('geroj', 'Герой'),
    ('fakty', '10 фактов + «Ещё 5»'),
    ('huk', 'Хук'),
    ('kadry', 'Кадры без повторов'),
    ('igra', 'Игра'),
    ('audio', 'Аудиогид'),
    ('v169', 'Ролик 16:9'),
    ('v916', 'Ролик 9:16'),
    ('istochnik', 'Источник открывается'),
]
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
      'Chrome/124.0 Safari/537.36')
OK, NET, SERYJ = 'ok', 'net', 'seryj'

# Разбор кадров и пороги — из tools/kadry-povtory.py, чтобы мерка была одна.
_kp_spec = importlib.util.spec_from_file_location(
    'kadry_povtory', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kadry-povtory.py'))
kp = importlib.util.module_from_spec(_kp_spec)
_kp_spec.loader.exec_module(kp)
try:
    from PIL import Image
    import imagehash
    PHASH = True
except Exception:
    PHASH = False


# ── Источник страниц и файлов: собранная dist или живой сайт ──

class Dist:
    def __init__(self, koren):
        self.koren = koren

    def stranica(self, slug, d):
        p = os.path.join(self.koren, 'muzei', slug, 'den', d, 'index.html')
        if not os.path.isfile(p):
            return None
        with open(p, encoding='utf-8') as f:
            return f.read()

    def fajl(self, put):
        p = os.path.join(self.koren, urllib.parse.unquote(put).lstrip('/'))
        if not os.path.isfile(p):
            return None
        with open(p, 'rb') as f:
            return f.read()

    def est(self, put):
        return os.path.isfile(os.path.join(self.koren, urllib.parse.unquote(put).lstrip('/')))

    def reestr(self):
        b = self.fajl('/video/registry.json')
        return json.loads(b) if b else None


class Zhivoj:
    def __init__(self, sajt):
        self.sajt = sajt.rstrip('/')
        self.kesh = {}

    def _get(self, put, metod='GET'):
        u = self.sajt + urllib.parse.quote(put, safe='/%:?=&')
        for popytka in range(3):
            try:
                r = urllib.request.urlopen(urllib.request.Request(u, method=metod, headers={'User-Agent': 'rc-gotovnost'}),
                                           timeout=30)
                return r.read() if metod == 'GET' else b''
            except urllib.error.HTTPError:
                return None
            except Exception:
                time.sleep(2)
        return None

    def stranica(self, slug, d):
        b = self._get(f'/muzei/{slug}/den/{d}/')
        return b.decode('utf-8', 'replace') if b is not None else None

    def fajl(self, put):
        if put not in self.kesh:
            self.kesh[put] = self._get(put)
        return self.kesh[put]

    def est(self, put):
        return self._get(put, 'HEAD') is not None

    def reestr(self):
        b = self.fajl('/video/registry.json')
        return json.loads(b) if b else None


# ── Разбор страницы ──

def tekst(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()


def razdel(s, sid):
    """HTML раздела <section id=sid> до следующего <section; None — раздела нет."""
    m = re.search(r'<section\b[^>]*\bid="%s"[^>]*>' % re.escape(sid), s)
    if not m:
        return None
    k = s.find('<section', m.end())
    return s[m.end(): k if k >= 0 else len(s)]


def baza(s, slug, d):
    m = re.search(r'<base\s+href="([^"]+)"', s)
    return urllib.parse.urljoin(f'/muzei/{slug}/den/{d}/', m.group(1) if m else '')


def kak_put(src, b):
    """Адрес картинки/файла на странице → путь своего сайта; чужой адрес → None."""
    u = urllib.parse.urlsplit(urllib.parse.urljoin(SAJT + b, src))
    if u.netloc and not u.netloc.endswith('russian-civilization.ru'):
        return None
    return u.path


def p_geroj(s):
    m = re.search(r'<h1\b[^>]*>(.*?)</h1>', s, re.S)
    t = tekst(m.group(1)) if m else ''
    return (OK, t) if t else (NET, 'нет заголовка h1')


def p_huk(s):
    m = re.search(r'<p\b[^>]*class="[^"]*\bhook\b[^"]*"[^>]*>(.*?)</p>', s, re.S)
    t = tekst(m.group(1)) if m else ''
    return (OK, t[:90] + ('…' if len(t) > 90 else '')) if t else (NET, 'нет хука')


def p_fakty(s):
    f = razdel(s, 'fakty')
    if f is not None:
        n = f.count('<details')
    else:  # старая страница: факты — карточки div.q в «Трудно поверить»
        t = razdel(s, 'trudno-poverit') or ''
        n = len(re.findall(r'class="q"', t))
    e = razdel(s, 'fakty-dnya')
    ne = e.count('<details') if e is not None else 0
    beda = []
    if n != FAKTOV:
        beda.append(f'фактов {n} из {FAKTOV}')
    if ne < ESCHE:
        beda.append(f'«Ещё» {ne} из {ESCHE}' if e is not None else '«Ещё 5» нет')
    return (NET, '; '.join(beda)) if beda else (OK, f'{n} + {ne}')


def p_igra(s):
    if 'id="quizBox"' not in s:
        return NET, 'нет викторины'
    if not re.search(r'(?:var|const|let)\s+(?:Q|quiz)\s*=\s*\[\s*\{|MUSEUM_QUIZ\s*=', s):
        return NET, 'викторина без вопросов'
    n = len(re.findall(r'["\']?(?:q|question|vopros)["\']?\s*:\s*["\']', s))
    return OK, f'вопросов {n}' if n else 'викторина есть'


def p_audio(s, b, ist):
    m = re.search(r'MUSEUM_AUDIOGUIDE\s*=\s*\{.*?["\']?audioSrc["\']?\s*:\s*["\']([^"\']+)["\']', s, re.S)
    if not m:
        return NET, 'нет аудиогида', None
    if 'id="audioguide"' not in s:
        return NET, 'нет места аудиогида на странице', None
    put = kak_put(m.group(1), b)
    if put is None:
        return OK, m.group(1), None
    return (OK, put.rsplit('/', 1)[-1], put) if ist.est(put) else (NET, f'нет файла {put.rsplit("/", 1)[-1]}', put)


def p_video(s, reestr):
    ids = list(dict.fromkeys(re.findall(r'data-rc-video="([^"]+)"', s)))
    if not ids:
        return (NET, 'нет ролика на странице'), (NET, 'нет ролика на странице'), []
    if reestr is None:
        return (SERYJ, 'реестр роликов не прочитан'), (SERYJ, 'реестр роликов не прочитан'), ids
    rel = reestr.get('releases', {})
    gor = ver = None
    for i in ids:
        r = rel.get(i) or {}
        h, v = r.get('horizontal') or {}, r.get('vertical') or {}
        if not gor and h.get('w', 0) > h.get('h', 0) > 0:
            gor = (OK, f'{i} · {h.get("sec", "?")} с')
        if not ver and v.get('h', 0) > v.get('w', 0) > 0:
            ver = (OK, f'{i} · {v.get("sec", "?")} с')
    nikak = all(i not in rel for i in ids)
    pochemu = f'выпуска {ids[0]} нет в реестре' if nikak else None
    return (gor or (NET, pochemu or 'в реестре нет 16:9'),
            ver or (NET, pochemu or 'в реестре нет 9:16'), ids)


def ssylki_istochnikov(s):
    """→ (ссылки, есть ли раздел источников вообще)."""
    out, est = [], False
    for sid in ('sources', 'sources-rights', 'istochnik'):
        r = razdel(s, sid)
        if r is not None:
            est = True
            out += re.findall(r'href="(https?://[^"]+)"', r)
    return list(dict.fromkeys(adres(html.unescape(u)) for u in out)), est


def adres(u):
    """Ссылка для запроса: без #якоря (его сервер не видит), домен — punycode, путь и запрос — %-коды."""
    r = urllib.parse.urlsplit(u.strip())
    host = r.hostname.encode('idna').decode() if r.hostname else ''
    if r.port:
        host += f':{r.port}'
    return urllib.parse.urlunsplit((r.scheme, host, urllib.parse.quote(r.path, safe='/%:@!$&\'()*+,;=~-._'),
                                    urllib.parse.quote(r.query, safe='=&%/:+,;@!$\'()*~-._'), ''))


def p_kadry(s, b, ist):
    r = kp.Razbor()
    r.feed(s)
    vse, propal = [], []
    for k in r.kadry:
        put = kak_put(k['src'], b)
        if put is None:  # чужой адрес — не наш кадр, сравнивать не по чему
            propal.append(k['src'])
            continue
        dan = ist.fajl(put)
        if not dan:
            propal.append(put)
            continue
        otpechatok = hashlib.sha1(dan).hexdigest()  # svg и всё, что PIL не открывает, — по содержимому
        if PHASH and not put.lower().endswith('.svg'):
            try:
                im = Image.open(io.BytesIO(dan))
                im.load()
                otpechatok = imagehash.phash(im.convert('RGB'))
            except Exception:
                pass
        vse.append(dict(k, put=put, h=otpechatok))
    povtory = []
    for i, k in enumerate(vse):
        for j in range(i):
            if 'povtor' in vse[j]:
                continue
            a, b = k['h'], vse[j]['h']
            blizko = False if type(a) is not type(b) else (a == b) if isinstance(a, str) else (a - b <= kp.POROG)
            if blizko:
                k['povtor'] = vse[j]['put']
                povtory.append((k['put'], vse[j]['put']))
                break
    telo = [k for k in vse if not k['oblozhka']]
    raznyh = len([k for k in telo if 'povtor' not in k])
    beda = []
    if raznyh < kp.MIN_RAZNYH:
        beda.append(f'разных кадров {raznyh} из {kp.MIN_RAZNYH}')
    if povtory:
        beda.append('повтор: ' + ', '.join(a.rsplit('/', 1)[-1] for a, _ in povtory[:3]))
    if propal:
        beda.append('нет файла: ' + ', '.join(p.rsplit('/', 1)[-1] for p in propal[:3]))
    podr = {'raznyh': raznyh, 'v_tele': len(telo), 'povtory': povtory, 'net_fajla': propal}
    return ((NET, '; '.join(beda)) if beda else (OK, f'разных {raznyh}, повторов 0')), podr


# ── Источники: открываются ли (сеть) ──

def otkryt(u, srok):
    """→ (код или None, пояснение). 5xx бывает разовым — переспрашиваем один раз через паузу."""
    kod, pr = otkryt1(u, srok)
    if kod is not None and kod >= 500:
        time.sleep(3)
        kod, pr = otkryt1(u, srok)
    return kod, pr


def otkryt1(u, srok):
    """→ (код или None, пояснение). Запрос как из браузера; сертификат не нашего УЦ — повтор без сверки."""
    kontekst = [None, ssl._create_unverified_context()]
    poslednee = 'нет ответа'
    for kx in kontekst:
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers={
                'User-Agent': UA, 'Accept': 'text/html,application/pdf,*/*', 'Accept-Language': 'ru-RU,ru;q=0.9'}),
                timeout=srok, context=kx)
            r.read(2048)
            return r.status, ''
        except urllib.error.HTTPError as e:
            return e.code, ''
        except ssl.SSLError as e:
            poslednee = 'сертификат'
            continue
        except Exception as e:
            pr = getattr(e, 'reason', e)
            if isinstance(pr, ssl.SSLError):
                poslednee = 'сертификат'
                continue
            return None, 'нет ответа' if 'timed out' in str(pr) else type(pr).__name__
    return None, poslednee


RF_VYHOD_PO_UMOLCHANIYU = 'socks5h://rf-proxy:1080'
RF_VYHOD = RF_VYHOD_PO_UMOLCHANIYU  # включатель одной строкой: None — выключить РФ-выход


def vklyuchit_rf_vyhod(url):
    """Весь сокетный выход процесса — через SOCKS5 (socks5h: имя сайта разрешает выход). → None или почему нельзя."""
    u = urllib.parse.urlsplit(url)
    if u.scheme not in ('socks5', 'socks5h') or not u.hostname:
        return f'РФ-выход {url}: нужен адрес socks5h://хост:порт'
    try:
        import socks  # PySocks
    except ImportError:
        return 'РФ-выход: нет PySocks (pip install pysocks)'
    try:
        socket.create_connection((u.hostname, u.port or 1080), timeout=3).close()
    except OSError as e:
        return f'РФ-выход {u.hostname}:{u.port or 1080} не отвечает ({type(e).__name__})'
    socks.set_default_proxy(socks.SOCKS5, u.hostname, u.port or 1080, rdns=u.scheme == 'socks5h',
                            username=u.username, password=u.password)
    socket.socket = socks.socksocket
    return None


def bez_rf_vyhoda(otvety):
    """Проверка не из России: открылось — верим, не открылось — серое (с чужой точки отказ ничего не доказывает)."""
    return {u: (k, pr) if k is not None and k < 400 else (None, f'{k or pr}, без РФ-выхода') for u, (k, pr) in otvety.items()}


def proverit_ssylki(vse, srok, byudzhet, potokov, rf_vyhod=None):
    itog = {}
    nachalo = time.time()
    s_rf = False
    if rf_vyhod:
        beda = vklyuchit_rf_vyhod(rf_vyhod)
        if beda:  # выхода нет — проверяем напрямую, отказы серые, не красные
            print(f'::warning::tablica-gotovnosti: {beda} — источники напрямую, не открывшиеся серые', file=sys.stderr)
        else:
            s_rf = True
            print(f'tablica-gotovnosti: источники — через РФ-выход {urllib.parse.urlsplit(rf_vyhod).hostname}',
                  file=sys.stderr)
    with cf.ThreadPoolExecutor(potokov) as ex:
        bud = {ex.submit(otkryt, u, srok): u for u in vse}
        try:
            for f in cf.as_completed(bud, timeout=byudzhet):
                itog[bud[f]] = f.result()
        except cf.TimeoutError:
            pass
        for f, u in bud.items():
            if u not in itog:
                f.cancel()
                itog[u] = (None, 'не успели проверить')
    print(f'tablica-gotovnosti: ссылок источников {len(vse)}, проверено за {time.time() - nachalo:.0f} с'
          + ('' if s_rf else ' (без РФ-выхода)'), file=sys.stderr)
    return itog if s_rf else bez_rf_vyhoda(itog)


def p_istochnik(ssylki, est, otvety):
    if not ssylki:
        return NET, 'источники без ссылок — только названия' if est else 'нет раздела «Источники»'
    if otvety is None:
        return SERYJ, f'ссылок {len(ssylki)}, не проверено (без сети)'
    plohie, seryje = [], []
    for u in ssylki:
        kod, pr = otvety.get(u, (None, 'не проверено'))
        host = urllib.parse.urlsplit(u).hostname or u
        try:
            host = host.encode().decode('idna')
        except UnicodeError:
            pass
        if kod is not None and kod < 400:
            continue
        if kod in (404, 410) or (kod is not None and kod >= 500):
            plohie.append(f'{host} — {kod}')
        else:  # 401/403/429/451, сеть, сертификат: сайт не пустил проверку — не значит «не открывается»
            seryje.append(f'{host} — {kod or pr}')
    if plohie:
        return NET, f'не открывается {len(plohie)} из {len(ssylki)}: ' + '; '.join(plohie[:3])
    if seryje:
        return SERYJ, f'не проверено {len(seryje)} из {len(ssylki)}: ' + '; '.join(seryje[:2])
    return OK, f'открываются {len(ssylki)} из {len(ssylki)}'


# ── Сборка таблицы ──

def poschitat(ist, set_):
    reestr = ist.reestr()
    stroki, ssylki_dnya = [], {}
    for slug, nazv in MUZEI:
        for d in DNI:
            s = ist.stranica(slug, d)
            st = {'muzej': slug, 'den': d, 'adres': f'/muzei/{slug}/den/{d}/'}
            if s is None:
                st['kletki'] = {k: (NET, 'страницы нет') for k, _ in KOLONKI}
                stroki.append(st)
                continue
            b = baza(s, slug, d)
            kl = {'geroj': p_geroj(s), 'fakty': p_fakty(s), 'huk': p_huk(s), 'igra': p_igra(s)}
            a = p_audio(s, b, ist)
            kl['audio'] = a[:2]
            kl['kadry'], st['kadry'] = p_kadry(s, b, ist)
            kl['v169'], kl['v916'], st['roliki'] = p_video(s, reestr)
            ssylki_dnya[(slug, d)] = ssylki_istochnikov(s)
            st['kletki'] = kl
            stroki.append(st)
    otvety = None
    if set_ is not None:
        vse = sorted({u for v, _ in ssylki_dnya.values() for u in v})
        otvety = proverit_ssylki(vse, *set_)
    for st in stroki:
        if 'istochnik' not in st['kletki']:
            ss, est = ssylki_dnya.get((st['muzej'], st['den']), ([], False))
            st['kletki']['istochnik'] = p_istochnik(ss, est, otvety)
            st['istochniki'] = {u: otvety.get(u) for u in ss} if otvety else ss
        st['polnyj'] = all(st['kletki'][k][0] == OK for k, _ in KOLONKI)
        st['polnyj_zamok'] = polnyj_dlya_zamka(st['kletki'])
    return stroki


# ── Храповик полных дней (Р550) ──

def polnyj_dlya_zamka(kl):
    """Все клетки зелёные; у «Источника» допустима серая — ссылки есть, сеть их не проверила."""
    return all(kl[k][0] == OK or (k == 'istochnik' and kl[k][0] == SERYJ) for k, _ in KOLONKI)


def chitat_spisok(fajl):
    if not os.path.exists(fajl):
        return {}
    with open(fajl, encoding='utf-8') as f:
        return {m: set(v) for m, v in json.load(f).items() if not m.startswith('_')}


SHAPKA_SPISKA = ('Храповик полных дней января (Р550, tools/tablica-gotovnosti.py --zamok). День из списка получил красную '
                 'клетку таблицы готовности — заявка красная. Список только растёт: новый полный день дописывает машина '
                 '(.github/workflows/gotovnost-hrapovik.yml). Убрать день — только словом Сергея.')


def sverit_so_spiskom(stroki, spisok):
    """→ (сломались [(музей, день, причины)], новые [(музей, день)])."""
    slomalis, novye = [], []
    for st in stroki:
        v_spiske = st['den'] in spisok.get(st['muzej'], ())
        if v_spiske:
            krasnye = [f'{z}: {st["kletki"][k][1]}' for k, z in KOLONKI if st['kletki'][k][0] == NET]
            if krasnye:
                slomalis.append((st['muzej'], st['den'], krasnye))
        elif st['polnyj_zamok']:
            novye.append((st['muzej'], st['den']))
    return slomalis, novye


def zapisat_spisok(fajl, spisok, novye):
    for m, d in novye:
        spisok.setdefault(m, set()).add(d)
    os.makedirs(os.path.dirname(fajl) or '.', exist_ok=True)
    with open(fajl, 'w', encoding='utf-8') as f:
        json.dump({'_shapka': SHAPKA_SPISKA, **{m: sorted(spisok[m]) for m, _ in MUZEI if m in spisok}},
                  f, ensure_ascii=False, indent=2)
        f.write('\n')


def hrapovik(stroki, fajl, zapis):
    """Код выхода храповика: 1 — полный день стал неполным."""
    spisok = chitat_spisok(fajl)
    slomalis, novye = sverit_so_spiskom(stroki, spisok)
    for m, d, pr in slomalis:
        print(f'::error::tablica-gotovnosti: {m} {d} был полным ({fajl}), стал неполным — ' + '; '.join(pr))
    for m, d in novye:
        print(f'::notice::tablica-gotovnosti: {m} {d} — полный день, в храповик ({fajl}) его допишет машина после слияния')
    if zapis and novye:
        zapisat_spisok(fajl, spisok, novye)
        print(f'tablica-gotovnosti: в храповик дописано {len(novye)} → {fajl}')
    print(f'tablica-gotovnosti: храповик — в списке {sum(map(len, spisok.values()))}, сломалось {len(slomalis)}, новых {len(novye)}')
    return 1 if slomalis else 0


def proba():
    """Пробы храповика на выдуманных строках: ждём красный, зелёный, серый-не-красный, рост списка."""
    import tempfile
    zel = {k: (OK, '') for k, _ in KOLONKI}
    def stroka(d, **izm):
        kl = dict(zel, **{k: (v, 'проба') for k, v in izm.items()})
        return {'muzej': 'izobreteniya', 'den': d, 'kletki': kl, 'polnyj_zamok': polnyj_dlya_zamka(kl)}
    proby = [  # имя, строки, список, ждём код, ждём новых
        ('полный остался полным', [stroka('01-02')], {'izobreteniya': {'01-02'}}, 0, 0),
        ('полный стал без кадров — красный', [stroka('01-02', kadry=NET)], {'izobreteniya': {'01-02'}}, 1, 0),
        ('источник серый без сети — не красный', [stroka('01-02', istochnik=SERYJ)], {'izobreteniya': {'01-02'}}, 0, 0),
        ('источник без ссылок — красный', [stroka('01-02', istochnik=NET)], {'izobreteniya': {'01-02'}}, 1, 0),
        ('новый полный день — в список', [stroka('01-02'), stroka('01-03', istochnik=SERYJ)], {'izobreteniya': {'01-02'}}, 0, 1),
        ('неполный не в списке — не трогаем', [stroka('01-04', v916=NET)], {}, 0, 0),
    ]
    plokho = 0
    for imya, stroki, spisok, kod_zhdu, novyh_zhdu in proby:
        sl, nv = sverit_so_spiskom(stroki, spisok)
        kod = 1 if sl else 0
        ok = kod == kod_zhdu and len(nv) == novyh_zhdu
        print(f'{"ок " if ok else "БРАК"} проба «{imya}»: {"красный" if kod else "зелёный"}, новых {len(nv)}')
        plokho += not ok
    sylki = ['https://a.ru/1', 'https://b.ru/2']
    for imya, otvety, zhdu in [
        ('без РФ-выхода 404 — серый', bez_rf_vyhoda({sylki[0]: (200, ''), sylki[1]: (404, '')}), SERYJ),
        ('без РФ-выхода открылось — зелёный', bez_rf_vyhoda({sylki[0]: (200, ''), sylki[1]: (301, '')}), OK),
        ('с РФ-выходом 404 — красный', {sylki[0]: (200, ''), sylki[1]: (404, '')}, NET),
    ]:
        tsvet = p_istochnik(sylki, True, otvety)[0]
        ok = tsvet == zhdu
        print(f'{"ок " if ok else "БРАК"} проба «{imya}»: {ZNAK.get(tsvet, tsvet)}')
        plokho += not ok
    with tempfile.TemporaryDirectory() as t:  # рост: --zapisat дописывает и не убирает
        f = os.path.join(t, 'polnye-dni.json')
        zapisat_spisok(f, {'izobreteniya': {'01-02'}}, [('izobreteniya', '01-03')])
        ok = chitat_spisok(f) == {'izobreteniya': {'01-02', '01-03'}}
        print(f'{"ок " if ok else "БРАК"} проба «запись списка»: {sorted(chitat_spisok(f).get("izobreteniya", []))}')
        plokho += not ok
    if plokho:
        print(f'::error::tablica-gotovnosti: {plokho} проб храповика не сработали')
        return 1
    print('tablica-gotovnosti: пробы храповика прошли')
    return 0


ZNAK = {OK: '✓', NET: '✗', SERYJ: '?'}
SLOVO = {OK: 'есть', NET: 'нет', SERYJ: 'не проверено'}


def zapisat(stroki, out, otkuda, sverka):
    os.makedirs(out, exist_ok=True)
    msk = datetime.now(timezone.utc) + timedelta(hours=3)
    polnyh = sum(st['polnyj'] for st in stroki)
    vsego = len(stroki)
    seryh = sum(not st['polnyj'] and all(st['kletki'][k][0] != NET for k, _ in KOLONKI) for st in stroki)

    with open(os.path.join(out, 'tablica.csv'), 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(['музей', 'дата', 'адрес', 'полный день']
                   + [x for _, z in KOLONKI for x in (z, z + ' — пояснение')])
        for st in stroki:
            w.writerow([dict(MUZEI)[st['muzej']], st['den'], SAJT + st['adres'], 'да' if st['polnyj'] else 'нет']
                       + [x for k, _ in KOLONKI for x in (SLOVO[st['kletki'][k][0]], st['kletki'][k][1])])

    with open(os.path.join(out, 'dannye.json'), 'w', encoding='utf-8') as f:
        json.dump({'poschitano': msk.strftime('%Y-%m-%d %H:%M МСК'), 'otkuda': otkuda, 'polnyh': polnyh,
                   'vsego': vsego, 'tolko_ne_provereno': seryh, 'dni': stroki}, f, ensure_ascii=False, indent=1, default=str)

    with open(os.path.join(out, 'gotovnost.css'), 'w', encoding='utf-8') as f:
        f.write(CSS)
    v_css = hashlib.sha1(CSS.encode('utf-8')).hexdigest()[:10]  # как scripts/versii.mjs: шаг идёт после него

    e = html.escape
    chasti = []
    for slug, nazv in MUZEI:
        sv = [st for st in stroki if st['muzej'] == slug]
        chasti.append(f'<section><h2>{e(nazv)} — полных {sum(st["polnyj"] for st in sv)} из {len(sv)}</h2>'
                      '<div class="lenta"><table><thead><tr><th class="data">Дата</th>'
                      + ''.join(f'<th>{e(z)}</th>' for _, z in KOLONKI) + '</tr></thead><tbody>')
        for st in sv:
            chasti.append(f'<tr class="{"polnyj" if st["polnyj"] else ""}"><th class="data">'
                          f'<a href="{e(st["adres"])}">{e(st["den"])}</a></th>')
            for k, _ in KOLONKI:
                cv, poyasn = st['kletki'][k]
                chasti.append(f'<td class="{cv}"><span class="znak" aria-label="{SLOVO[cv]}">{ZNAK[cv]}</span> '
                              f'{e(poyasn)}</td>')
            chasti.append('</tr>')
        chasti.append('</tbody></table></div></section>')
    dyry = []
    for st in stroki:
        if not st['polnyj']:
            bez = [f'{z.lower()}: {st["kletki"][k][1]}' for k, z in KOLONKI if st['kletki'][k][0] != OK]
            dyry.append(f'<li><a href="{e(st["adres"])}">{e(dict(MUZEI)[st["muzej"]])}, {e(st["den"])}</a> — '
                        f'{e("; ".join(bez))}</li>')
    with open(os.path.join(out, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Готовность января — полных дней {polnyh} из {vsego}</title>
<link rel="stylesheet" href="gotovnost.css?v={v_css}"></head>
<body><main>
<p class="nazad"><a href="/doska/">← Доска</a></p>
<h1>Готовность января: полных дней {polnyh} из {vsego}</h1>
<p class="pod">Два музея, 01-01…01-31. Пересчитано машиной {e(msk.strftime('%d.%m.%Y %H:%M'))} МСК по {e(otkuda)}.
Полный день — все клетки зелёные. Серая клетка — не проверено, зелёной не считается:
красного нет, но есть серое — ещё {seryh} дн.
Кадры сверены {e(sverka)}. Таблица для машины — <a href="tablica.csv">tablica.csv</a>, все подробности — <a href="dannye.json">dannye.json</a>.</p>
<p class="legenda"><span class="ok">✓ есть</span> <span class="net">✗ нет — чего не хватает</span> <span class="seryj">? не проверено</span></p>
{''.join(chasti)}
<section><h2>Дыры по дням — {len(dyry)}</h2><ol class="dyry">{''.join(dyry)}</ol></section>
</main></body></html>
''')
    return polnyh, vsego, seryh


CSS = '''*{box-sizing:border-box}
body{margin:0;background:#0b1220;color:#e8e4d8;font:15px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:1500px;margin:0 auto;padding:20px 16px 60px}
a{color:#e0c069}
h1{font-size:26px;margin:6px 0 8px}
h2{font-size:19px;margin:28px 0 10px}
.pod{color:#b9b4a6;max-width:80ch}
.nazad{margin:0}
.legenda span{display:inline-block;padding:2px 10px;border-radius:12px;margin:0 6px 6px 0}
.lenta{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #26314a;border-radius:10px}
table{border-collapse:separate;border-spacing:0;min-width:1100px;width:100%}
th,td{padding:6px 8px;border-bottom:1px solid #26314a;border-right:1px solid #1b2438;vertical-align:top;text-align:left;font-size:13px}
thead th{position:sticky;top:0;background:#141d30;z-index:2;font-weight:600}
th.data{position:sticky;left:0;background:#141d30;z-index:1;white-space:nowrap}
thead th.data{z-index:3}
td{max-width:240px;overflow-wrap:anywhere}
.ok{background:#12351f;color:#bfe8c9}
.net{background:#4a1616;color:#ffd2cc}
.seryj{background:#2c3038;color:#c9ccd2}
.znak{font-weight:700}
tr.polnyj th.data{box-shadow:inset 4px 0 0 #3fbf6a}
.dyry li{margin:4px 0}
@media (max-width:640px){
 main{padding:12px 8px 40px}
 h1{font-size:21px}
 th,td{font-size:12px;padding:5px 6px}
 td{max-width:170px}
}
'''


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dist', help='собранная dist: таблица ложится в dist/' + PUT_TABLICY)
    ap.add_argument('--live', nargs='?', const=SAJT, help='считать по живому сайту')
    ap.add_argument('--out', help='куда положить таблицу (по умолчанию dist/' + PUT_TABLICY + ')')
    ap.add_argument('--bez-seti', action='store_true', help='не проверять ссылки источников (клетка серая)')
    ap.add_argument('--srok', type=float, default=12, help='секунд на одну ссылку')
    ap.add_argument('--byudzhet', type=float, default=150, help='секунд на все ссылки')
    ap.add_argument('--potokov', type=int, default=24)
    ap.add_argument('--zamok', help='храповик: список полных дней (JSON); полный стал неполным — код 1')
    ap.add_argument('--zapisat', action='store_true', help='с --zamok: дописать новые полные дни в список')
    ap.add_argument('--rf-vyhod', nargs='?', const=RF_VYHOD_PO_UMOLCHANIYU,
                    default=os.environ.get('GOTOVNOST_RF_PROXY') or RF_VYHOD,
                    help='РФ-выход socks5h:// для проверки источников (включён: ' + str(RF_VYHOD) + '; net — выключить)')
    ap.add_argument('--proba', action='store_true', help='пробы храповика')
    a = ap.parse_args()
    if a.rf_vyhod in ('net', 'no', '0'):
        a.rf_vyhod = None
    if a.proba:
        return proba()
    try:
        if a.live:
            ist, otkuda = Zhivoj(a.live), 'живому сайту ' + a.live
        else:
            koren = a.dist or 'dist'
            if not os.path.isdir(os.path.join(koren, 'muzei')):
                print(f'tablica-gotovnosti: нет {koren}/muzei — таблица пропущена')
                if a.zamok:
                    print(f'::error::tablica-gotovnosti: храповику нечего мерить — нет {koren}/muzei')
                return 1 if a.zamok else 0
            ist, otkuda = Dist(koren), 'собранным страницам'
        out = a.out or os.path.join(a.dist or 'dist', PUT_TABLICY)
        stroki = poschitat(ist, None if a.bez_seti else (a.srok, a.byudzhet, a.potokov, a.rf_vyhod))
        sverka = 'по pHash (Хэмминг ≤ 8)' if PHASH else 'по содержимому файлов (imagehash нет)'
        polnyh, vsego, seryh = zapisat(stroki, out, otkuda, sverka)
        print(f'tablica-gotovnosti: полных дней {polnyh} из {vsego}; красного нет, но не проверено — ещё {seryh} → {out}')
        for st in stroki:
            if not st['polnyj']:
                bez = [f'{z}: {st["kletki"][k][1]}' for k, z in KOLONKI if st['kletki'][k][0] != OK]
                print(f'  {st["muzej"]} {st["den"]} — ' + '; '.join(bez))
        if a.zamok:
            return hrapovik(stroki, a.zamok, a.zapisat)
    except Exception as e:  # только отчёт — сборку не роняем; храповик без замера — красный (нечем доказать, что цело)
        print(f'tablica-gotovnosti: сбой, таблица не пересчитана: {e!r}', file=sys.stderr)
        if a.zamok:
            print(f'::error::tablica-gotovnosti: храповик не смог померить: {e!r}')
            return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
