"""Адаптер Библиотеки Конгресса (LoC) для `kadr.py zamena` (Р90).

po_nomeru(kadr) -> [{fond, card, image, title, avtor, god, osnovanie}]

Источники, по порядку:
1. JSON API loc.gov (www.loc.gov/pictures/search, /search, item/<id>) — официальный, без ключа.
   Лимит LoC (https://www.loc.gov/apis/json-and-yaml/working-within-limits/): 20 запросов/мин,
   превышение — блок на 1 час, и каждый запрос во время блока продлевает его. При нагрузке LoC
   отдаёт 429 или HTML-страницу с CAPTCHA (Cloudflare «Just a moment...», код 403).
   Поэтому: честный User-Agent, пауза >=3,1 с между запросами, при первом 403/429/HTML —
   JSON API до конца прогона не трогаем (не продлеваем блок).
2. SRU каталога LoC (lx2.loc.gov:210/lcdb, MODS) — запасной путь для поиска по названию+автору;
   записи отдела эстампов и фотографий дают цифровой номер (hdl.loc.gov/loc.pnp/<id>) и условия.
3. tile.loc.gov/storage-services — сканы, лимит 150/мин; адрес выводится из цифрового номера
   (cph.3a03499 -> .../cph/3a00000/3a03000/3a03400/3a03499r.jpg), существование проверяется HEAD.
"""
from __future__ import annotations

import html
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

FOND = "Library of Congress"
UA = "rc-site-fondy/1.0 (+https://github.com/arabelthera-dot/rc-site; kadr.py zamena)"
WWW = "https://www.loc.gov"
TILE = "https://tile.loc.gov/storage-services/service/pnp"
SRU = "http://lx2.loc.gov:210/lcdb"
PAUZA = {"www": 3.1, "sru": 1.0, "tile": 0.5}

_posledniy: dict[str, float] = {}
_json_zakryt = False  # Cloudflare/429 — JSON API в этом прогоне больше не трогаем


class Zakryto(Exception):
    pass


def _get(url: str, kanal: str, metod: str = "GET", timeout: int = 30):
    dt = time.monotonic() - _posledniy.get(kanal, 0)
    if dt < PAUZA[kanal]:
        time.sleep(PAUZA[kanal] - dt)
    _posledniy[kanal] = time.monotonic()
    req = urllib.request.Request(url, method=metod, headers={"User-Agent": UA, "Accept": "application/json, */*"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.headers.get("Content-Type", ""), (r.read() if metod == "GET" else b"")
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Content-Type", ""), b""
    except (urllib.error.URLError, TimeoutError, OSError):
        return 0, "", b""


def _json(url: str):
    """JSON API loc.gov с учётом лимита; None — нет ответа или закрыто."""
    global _json_zakryt
    if _json_zakryt:
        return None
    import json
    sep = "&" if "?" in url else "?"
    kod, ct, body = _get(url + sep + "fo=json", "www")
    if kod in (403, 429) or (kod == 200 and "json" not in ct):
        _json_zakryt = True
        print(f"loc: JSON API закрыт ({kod}, {ct or '-'}) — Cloudflare/лимит; дальше SRU + tile", file=sys.stderr)
        return None
    if kod != 200:
        return None
    try:
        return json.loads(body)
    except ValueError:
        return None


# ---------- цифровые номера и сканы ----------

RE_DIGID = re.compile(r"\b(cph|ppmsca|ppmsc|ppem|prok|prokc|pga|det|fsa|fsac|ds|cwpb|matpc|npcc|ggbain|hec|stereo)[.\s]?(\d[a-z]\d{5}|\d{5})\b", re.I)
RE_REPRO = re.compile(r"\bLC-(?:USZC4|USZC2|USZ62|USZ61|DIG-[a-z]+)-\d+\b", re.I)


def _papka(kol: str, n: str) -> str:
    if re.fullmatch(r"\d[a-z]\d{5}", n):  # 3a03499 -> 3a00000/3a03000/3a03400/3a03499
        p, d = n[:2], n[2:]
        return f"{kol}/{p}{d[0]}0000/{p}{d[:2]}000/{p}{d[:3]}00/{n}"
    return f"{kol}/{n[:3]}00/{n}"  # 01424 -> 01400/01424


def skan(digid: str) -> str:
    """Прямой адрес скана на tile.loc.gov по цифровому номеру, '' если нет."""
    kol, n = digid.lower().split(".", 1)
    baza = f"{TILE}/{_papka(kol, n)}"
    for suf in ("v.jpg", "r.jpg", "u.tif"):
        if _get(baza + suf, "tile", "HEAD")[0] == 200:
            return baza + suf
    return ""


def _digid_iz(*teksty: str) -> str:
    for t in teksty:
        m = RE_DIGID.search(t or "")
        if m:
            return f"{m.group(1).lower()}.{m.group(2).lower()}"
    return ""


# ---------- JSON API ----------

def _iz_json_item(it: dict) -> dict | None:
    item = it.get("item", it)
    card = it.get("url") or item.get("id") or ""
    links = it.get("links") or {}
    card = links.get("item") or card
    digid = _digid_iz(str(item.get("digital_id", "")), str(it.get("digital_id", "")), str(it.get("image", {})), card)
    image = ""
    img = it.get("image") or {}
    if isinstance(img, dict):
        image = img.get("full") or img.get("large") or ""
    if not image and digid:
        image = skan(digid)
    if image.startswith("//"):
        image = "https:" + image
    avtor = item.get("creator") or it.get("creator") or ""
    if isinstance(avtor, list):
        avtor = "; ".join(map(str, avtor))
    osn = it.get("rights") or item.get("rights_information") or item.get("rights") or ""
    if isinstance(osn, list):
        osn = " ".join(map(str, osn))
    return {"fond": FOND, "card": card if card.startswith("http") else WWW + card, "image": image,
            "title": it.get("title") or item.get("title") or "", "avtor": str(avtor),
            "god": str(item.get("date") or it.get("created_published_date") or ""), "osnovanie": str(osn).strip()}


def _json_poisk(q: str, n: int = 5) -> list[dict]:
    qs = urllib.parse.quote_plus(q)
    for url in (f"{WWW}/pictures/search/?q={qs}&c={n}", f"{WWW}/search/?q={qs}&c={n}&fa=partof:prints+and+photographs+division"):
        d = _json(url)
        if not d:
            continue
        res = [r for r in (_iz_json_item(x) for x in d.get("results", [])[:n]) if r and r["card"]]
        if res:
            return res
    return []


# ---------- SRU (MODS) ----------

def _txt(s: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s))).strip()


def _sru(cql: str, n: int = 5) -> list[dict]:
    url = SRU + "?" + urllib.parse.urlencode(dict(version="1.1", operation="searchRetrieve", query=cql,
                                                     maximumRecords=n, recordSchema="mods"))
    kod, _, body = _get(url, "sru")
    if kod != 200:
        return []
    out = []
    for rec in body.decode("utf-8", "replace").split("<zs:record>")[1:]:
        urls = re.findall(r"<url[^>]*>([^<]+)</url>", rec)
        digid = _digid_iz(*urls)
        if not digid:  # не отдел эстампов и фотографий — кадра нет
            continue
        t = re.search(r"<titleInfo>\s*<title>(.*?)</title>", rec, re.S)
        names = [_txt(x) for x in re.findall(r'<name[^>]*type="personal"[^>]*>\s*<namePart>(.*?)</namePart>', rec, re.S)]
        god = re.search(r"<dateIssued[^>]*>(.*?)</dateIssued>", rec, re.S)
        osn = re.search(r'<accessCondition[^>]*type="use and reproduction"[^>]*>(.*?)</accessCondition>', rec, re.S)
        out.append({"fond": FOND, "card": f"https://hdl.loc.gov/loc.pnp/{digid}",
                    "image": skan(digid), "title": _txt(t.group(1)) if t else "", "avtor": names[0] if names else "",
                    "god": _txt(god.group(1)) if god else "", "osnovanie": _txt(osn.group(1)) if osn else ""})
    return out


def _sru_q(*slova: str) -> str:
    return " and ".join(f'cql.anywhere="{w.replace(chr(34), "")}"' for w in slova if w)


# ---------- вход ----------

def po_nomeru(kadr: dict) -> list[dict]:
    """Кандидаты LoC для кадра: сначала по шифру/цифровому номеру, потом по названию+автору."""
    pole = " ".join(str(kadr.get(k) or "") for k in ("inv", "fayl", "podpis", "derzhatel"))
    digid = _digid_iz(pole)
    repro = RE_REPRO.search(pole)
    res: list[dict] = []
    if digid:
        res = _json_poisk(digid, 3)
        if not res:
            img = skan(digid)
            if img:  # скан есть, метаданных нет (JSON закрыт, в SRU номера нет) — карточку дать постоянной ссылкой
                res = [{"fond": FOND, "card": f"https://hdl.loc.gov/loc.pnp/{digid}", "image": img,
                        "title": "", "avtor": "", "god": "", "osnovanie": ""}]
    if not res and repro:
        res = _json_poisk(repro.group(0), 3)
    if not res:
        nazv = kadr.get("nazvanie") or kadr.get("syuzhet") or kadr.get("podpis") or ""
        avtor = kadr.get("avtor") or ""
        if nazv:
            res = _json_poisk(f"{nazv} {avtor}".strip(), 5) or _sru(_sru_q(nazv, avtor), 5) or _sru(_sru_q(nazv), 5)
    seen, out = set(), []
    for r in res:
        if r["card"] not in seen:
            seen.add(r["card"])
            out.append(r)
    return out


def prokudin(syuzhet: str, n: int = 5) -> list[dict]:
    """Снимки Прокудина-Горского (коллекция prok) по сюжету — для архитектуры."""
    return (_json_poisk(f"{syuzhet} Prokudin-Gorskii", n)
            or _sru(_sru_q("Prokudin-Gorskii", syuzhet), n))


if __name__ == "__main__":
    import json
    proby = [
        {"muzey": "izobreteniya", "den": "", "fayl": "", "podpis": "Софья Ковалевская, ILN 1884",
         "derzhatel": "Library of Congress", "inv": "cph.3a03499", "avtor": "", "god": "1884", "syuzhet": "Kovalevsky"},
        {"muzey": "arhitektura", "den": "", "fayl": "", "podpis": "", "derzhatel": "", "inv": "",
         "avtor": "Prokudin-Gorskii", "god": "", "syuzhet": "Kizhi"},
    ]
    for k in proby:
        r = po_nomeru(k)
        if not r and k["avtor"] == "Prokudin-Gorskii":
            r = prokudin(k["syuzhet"]) or prokudin("church")
        print(k["inv"] or k["syuzhet"], "->", json.dumps(r[:2], ensure_ascii=False, indent=1))
