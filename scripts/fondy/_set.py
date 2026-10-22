"""Общий сетевой путь адаптеров fondy (не адаптер: kadr.adaptery() пропускает файлы на «_»).

Порядок: сначала напрямую (браузерный UA, таймаут PRYAMO_S), при отказе/таймауте/403/429/5xx —
через прокси РФ (RC_FONDY_PROXY, по умолчанию socks5h://rf-proxy:1080; пусто — без прокси).
Хост, не ответивший ни так, ни так, помечается «недоступен» до конца прогона и дальше пропускается сразу.
Предохранитель (circuit breaker): хост, уже отвечавший, но SBOI_PODRYAD раз подряд молчащий, уходит на паузу
PAUZA_S — запросы к нему сразу Nedostupen, без ожидания таймаута; после паузы одна проба, ответил — счёт с нуля.

TLS: verify — бандл certifi + scripts/fondy/certs/*.pem. Там лежат промежуточные сертификаты, которые
некоторые сайты не отдают сами (Эрмитаж — GlobalSign GCC R46 AlphaSSL CA 2025, корень GlobalSign Root R46
уже есть в certifi). verify=False не используется.
"""
import os
import tempfile
import threading
import time
from pathlib import Path
from urllib.parse import urlsplit

import certifi
import requests

BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
PROXY = os.environ.get('RC_FONDY_PROXY', 'socks5h://rf-proxy:1080')
PRYAMO_S = 9
PROXY_S = 20
PLOHO = {403, 407, 429, 502, 503, 504}  # 500 — ответ сервера по существу (Госкаталог на кривой номер), не сеть

SBOI_PODRYAD = 3
PAUZA_S = 60

_put: dict[str, str] = {}        # хост -> 'pryamo' | 'proxy' | 'net' (на прогон)
_sboi: dict[str, int] = {}       # хост -> сбоев подряд
_pauza: dict[str, float] = {}    # хост -> monotonic, до которого не спрашиваем
_zamok = threading.Lock()
_bundle = None


class Nedostupen(requests.RequestException):
    pass


def bundle() -> str:
    global _bundle
    if _bundle is None:
        extra = sorted((Path(__file__).parent / 'certs').glob('*.pem'))
        if not extra:
            _bundle = certifi.where()
        else:
            f = tempfile.NamedTemporaryFile('w', suffix='.pem', prefix='fondy-ca-', delete=False)
            f.write(Path(certifi.where()).read_text())
            for p in extra:
                f.write('\n' + p.read_text())
            f.close()
            _bundle = f.name
    return _bundle


def sessiya(ua: str = BROWSER_UA) -> requests.Session:
    s = requests.Session()
    s.headers['User-Agent'] = ua
    s.verify = bundle()
    s.trust_env = False
    return s


def zapros(s: requests.Session, metod: str, url: str, timeout=None, proxy=None, **kw) -> requests.Response:
    """GET/POST напрямую, затем через прокси (proxy= — свой, иначе PROXY). Nedostupen — хост закрыт на прогон."""
    proxy = proxy if proxy is not None else PROXY
    host = urlsplit(url).hostname or ''
    put = _put.get(host)
    if put == 'net':
        raise Nedostupen(f'{host}: недоступен в этом прогоне')
    with _zamok:
        do = _pauza.get(host, 0)
        if do > time.monotonic():
            raise Nedostupen(f'{host}: на паузе после {SBOI_PODRYAD} сбоев подряд')
        if do:
            # пауза вышла: эта проба одна, остальные ждут её исхода ещё PAUZA_S
            _pauza[host] = time.monotonic() + PAUZA_S
    try:
        r = _zapros(s, metod, url, host, put, timeout, proxy, **kw)
    except Nedostupen:
        with _zamok:
            _sboi[host] = _sboi.get(host, 0) + 1
            if _put.get(host) != 'net' and _sboi[host] >= SBOI_PODRYAD:
                _pauza[host] = time.monotonic() + PAUZA_S
        raise
    with _zamok:
        _sboi[host] = 0
        _pauza.pop(host, None)
    return r


def _zapros(s, metod, url, host, put, timeout, proxy, **kw):
    if put in (None, 'pryamo'):
        try:
            r = s.request(metod, url, timeout=timeout or PRYAMO_S, proxies={'http': None, 'https': None}, **kw)
            if r.status_code not in PLOHO:
                _put[host] = 'pryamo'
                return r
        except requests.RequestException:
            pass
        if put == 'pryamo' or not proxy:
            # прямой путь уже работал — разовый сбой; прокси не задан — некуда
            if not proxy:
                _put[host] = 'net'
            raise Nedostupen(f'{host}: напрямую не ответил')
    try:
        px = {'http': proxy, 'https': proxy}
        r = s.request(metod, url, timeout=timeout or PROXY_S, proxies=px, **kw)
        if r.status_code not in PLOHO:
            _put[host] = 'proxy'
            return r
    except requests.RequestException:
        pass
    _put[host] = 'net'
    raise Nedostupen(f'{host}: недоступен ни напрямую, ни через прокси')


def get(s, url, **kw):
    return zapros(s, 'GET', url, **kw)


def post(s, url, **kw):
    return zapros(s, 'POST', url, **kw)
