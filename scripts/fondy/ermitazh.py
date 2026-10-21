"""Адаптер Государственного Эрмитажа для `kadr.py zamena` (Р90).

po_nomeru(kadr) -> [{fond, card, image, title, avtor, god, osnovanie}]

Источник — открытое API сайта (то же, что зовёт строка поиска на hermitagemuseum.org):
POST https://www.hermitagemuseum.org/api/search/search/default, form-data
searchQuery, lng=ru, page, limit -> data.searchResults.workofart.elements[]
(id, name, image, params.avtor/date). Ищет и по инв. номеру (ЭРР-6046, ГЭ-1234),
и по автору+названию. Инв. номер сверяется по карточке
(div[data-row=record_id]). Скан — api/files/fshow с w=1600.
Сайт открывается только через прокси socks5h://rf-proxy:1080 и с verify=False.
"""
import re
import sys
import datetime

import requests
import urllib3

urllib3.disable_warnings()

FOND = "Государственный Эрмитаж"
BAZA = "https://www.hermitagemuseum.org"
PROXY = "socks5h://rf-proxy:1080"
TAIMAUT = 40

_s = requests.Session()
_s.proxies = {"http": PROXY, "https": PROXY}
_s.verify = False
_s.headers["User-Agent"] = "Mozilla/5.0 (rc-site kadr.py zamena)"

_INV = re.compile(r"\b(ЭРР|ГЭ|ЭРЖ|ЭРГ|ЭРТ|ЭРМб|ЭРФ|ЭРО|ЭРЗ|ЭРС|ЭРД|ЭРН|ЭРК|ЭРА|ЭРЭ)[\s\-–]*(\d+)", re.I)


def _norm_inv(s):
    m = _INV.search(s or "")
    return f"{m.group(1).upper()}-{m.group(2)}" if m else ""


def _poisk(zapros, limit=10):
    r = _s.post(f"{BAZA}/api/search/search/default",
                files={k: (None, v) for k, v in
                       {"searchQuery": zapros, "lng": "ru", "page": "1", "limit": str(limit)}.items()},
                timeout=TAIMAUT)
    r.raise_for_status()
    d = r.json()
    if d.get("error") != "ok":
        return []
    return ((d.get("data") or {}).get("searchResults") or {}).get("workofart", {}).get("elements") or []


def _kartochka(eid):
    """Инв. номер и полный скан со страницы карточки."""
    t = _s.get(f"{BAZA}/digital-collection/{eid}", timeout=TAIMAUT).text
    m = re.search(r'data-row="record_id".*?class="value">\s*([^<]+?)\s*<', t, re.S)
    inv = m.group(1).strip() if m else ""
    im = re.search(r'https://hermitagemuseum\.org/api/files/fshow\?needlePath=[^"\'\s<]+', t)
    return inv, (im.group(0).replace("&amp;", "&") if im else "")


def _skan(url, w=1600):
    url = re.sub(r"%3Fw%3D\d+", f"%3Fw%3D{w}", url)
    return re.sub(r"%26h%3D\d+", f"%26h%3D{w}", url)


def _param(el, k):
    v = ((el.get("params") or {}).get(k) or {}).get("value", "")
    if isinstance(v, list):
        v = ", ".join(x.get("title", "") if isinstance(x, dict) else str(x) for x in v)
    return str(v or "").strip()


def _osnovanie(avtor):
    """Общественное достояние по ст. 1281 ГК РФ: автор умер >70 лет назад (+1 янв.)."""
    m = re.search(r"\(\s*(?:\d{3,4}|\?)?\s*[-–]\s*(\d{4})\s*\)", avtor or "")
    if not m:
        return ""
    smert = int(m.group(1))
    if smert + 70 < datetime.date.today().year:
        return (f"Общественное достояние: автор умер в {smert} г., срок охраны (ст. 1281 ГК РФ) "
                f"истёк 1 января {smert + 71} г.; держатель — {FOND}")
    return ""


def _nash_derzhatel(d):
    d = (d or "").strip().lower()
    return not d or "эрмитаж" in d or "hermitage" in d


def _familiya(avtor):
    """«Орловский, Александр» → Орловский; «И. Теребенев», «Исаак Крукшенк» → фамилия последним словом."""
    a = (avtor or "").strip()
    if not a:
        return ""
    if "," in a:
        return a.split(",")[0].strip()
    slova = [w for w in re.split(r"\s+", a) if len(w) > 2 and not w.endswith(".")]
    return slova[-1] if slova else re.split(r"\s+", a)[-1]


def po_nomeru(kadr: dict) -> list:
    if not _nash_derzhatel(kadr.get("derzhatel")):
        return []
    inv = _norm_inv(kadr.get("inv"))
    zaprosy = []
    if inv:
        zaprosy.append(("inv", inv))
    nazv = (kadr.get("nazvanie") or kadr.get("syuzhet") or kadr.get("podpis") or "").strip(" «»")
    if nazv:
        zaprosy.append(("nazv", f"{_familiya(kadr.get('avtor'))} {nazv}".strip()))
    vyhod, byli = [], set()
    for vid, q in zaprosy:
        try:
            elementy = _poisk(q)
        except requests.RequestException as e:
            print(f"[ermitazh] поиск «{q}»: {e}", file=sys.stderr)
            continue
        for el in elementy:
            eid = str(el.get("id") or "")
            if not eid or eid in byli:
                continue
            avtor = _param(el, "avtor")
            if vid == "nazv" and kadr.get("avtor"):
                fam = _familiya(kadr["avtor"]).lower()
                if fam and fam not in avtor.lower():
                    continue
            try:
                inv_k, image = _kartochka(eid)
            except requests.RequestException:
                inv_k, image = "", ""
            if vid == "inv" and _norm_inv(inv_k) != inv:
                continue
            byli.add(eid)
            vyhod.append({
                "fond": FOND + (f", инв. {inv_k}" if inv_k else ""),
                "card": f"{BAZA}/digital-collection/{eid}",
                "image": _skan(image or el.get("image", "")),
                "title": (el.get("name") or "").strip(),
                "avtor": avtor,
                "god": _param(el, "date"),
                "osnovanie": _osnovanie(avtor),
            })
        if vid == "inv" and vyhod:
            break  # номер совпал — точнее не будет
    return vyhod


if __name__ == "__main__":
    import json
    proby = [
        {"muzey": "art", "den": "", "fayl": "", "podpis": "", "derzhatel": "Эрмитаж",
         "inv": "ЭРР-6046", "avtor": "", "god": "1814", "syuzhet": ""},
        {"muzey": "art", "den": "", "fayl": "", "podpis": "", "derzhatel": "",
         "inv": "", "avtor": "Орловский", "god": "1814", "syuzhet": "Автопортрет в черкесском костюме"},
        {"muzey": "art", "den": "", "fayl": "", "podpis": "", "derzhatel": "Третьяковская галерея",
         "inv": "ЭРР-6046", "avtor": "Орловский", "god": "", "syuzhet": "Автопортрет"},
    ]
    ok = True
    for i, k in enumerate(proby):
        r = po_nomeru(k)
        print(f"--- проба {i + 1}:", json.dumps(r, ensure_ascii=False, indent=1))
        nashel = any(x["card"].endswith("/1518919") for x in r)
        ok &= nashel if i < 2 else not r
    print("ПРОВЕРКА:", "OK" if ok else "ПРОВАЛ")
    sys.exit(0 if ok else 1)
