"""Адаптер Государственного Эрмитажа для `kadr.py zamena` (Р90).

po_nomeru(kadr) -> [{fond, card, image, title, avtor, god, osnovanie}]

Источник — открытое API сайта (то же, что зовёт строка поиска на hermitagemuseum.org):
POST https://www.hermitagemuseum.org/api/search/search/default, form-data
searchQuery, lng=ru, page, limit -> data.searchResults.workofart.elements[]
(id, name, image, params.avtor/date). Ищет и по инв. номеру (ЭРР-6046, ГЭ-1234),
и по автору+названию. Инв. номер сверяется по карточке
(div[data-row=record_id]). С карточки (≤5 на запрос) — название, автор, датировка, серия, инв. номер;
«god» — точный год для строгой сверки (десятилетие/век — только в «datirovka»). Скан — api/files/fshow
с w=6000: сервер отдаёт наибольший размер, какой у него есть.
Сеть — fondy/_set.py: напрямую первым, затем прокси. Сайт не отдаёт промежуточный сертификат
GlobalSign GCC R46 AlphaSSL CA 2025 — он лежит в fondy/certs/, проверка TLS полная (verify=False нет).
"""
import re
import sys
import datetime

import requests
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import _set  # noqa: E402

FOND = "Государственный Эрмитаж"
BAZA = "https://www.hermitagemuseum.org"

_s = _set.sessiya()

_INV = re.compile(r"\b(ЭРР|ГЭ|ЭРЖ|ЭРГ|ЭРТ|ЭРМб|ЭРФ|ЭРО|ЭРЗ|ЭРС|ЭРД|ЭРН|ЭРК|ЭРА|ЭРЭ)[\s\-–]*(\d+)", re.I)


def _norm_inv(s):
    m = _INV.search(s or "")
    return f"{m.group(1).upper()}-{m.group(2)}" if m else ""


def _poisk(zapros, limit=10):
    r = _set.post(_s, f"{BAZA}/api/search/search/default",
                files={k: (None, v) for k, v in
                       {"searchQuery": zapros, "lng": "ru", "page": "1", "limit": str(limit)}.items()})
    r.raise_for_status()
    d = r.json()
    if d.get("error") != "ok":
        return []
    return ((d.get("data") or {}).get("searchResults") or {}).get("workofart", {}).get("elements") or []


MAKS_KAND = 5   # карточек на запрос (каждая — отдельный запрос к сайту)
MAKS_W = 6000   # сервер отдаёт наибольший размер, какой есть (проверено: потолок 1920 px)


def _pole(t, row):
    """Текст поля карточки div[data-row=row] .value (ссылки внутри — их текст)."""
    m = re.search(r'data-row="%s".*?class="value">(.*?)</div>' % re.escape(row), t, re.S)
    if not m:
        return ""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", m.group(1))).replace("&quot;", '"').replace("&amp;", "&").strip()


def _kartochka(eid):
    """Данные с карточки работы: inv, title, avtor (как на сайте), date, album, image (наибольший)."""
    t = _set.get(_s, f"{BAZA}/digital-collection/{eid}").text
    im = re.search(r'https://hermitagemuseum\.org/api/files/fshow\?needlePath=[^"\'\s<]+', t)
    return {"inv": _pole(t, "record_id"), "title": _pole(t, "object_title"), "avtor": _pole(t, "avtor"),
            "date": _pole(t, "create_date"), "album": _pole(t, "album"), "tech": _pole(t, "tech"),
            "image": im.group(0).replace("&amp;", "&") if im else ""}


def _skan(url, w=MAKS_W):
    url = re.sub(r"%3Fw%3D\d+", f"%3Fw%3D{w}", url)
    return re.sub(r"%26h%3D\d+", f"%26h%3D{w}", url)


def god_iz(date):
    """Год для сверки: «1814 г.», «1812-1813», «1813 (?)» → первый год; «1830-е гг.», «XIX в.», «ок. 1815» → ''
    (неточная датировка не годится для строгой сверки, она остаётся в «datirovka»)."""
    d = (date or "").strip().lower()
    if not d or re.search(r"\d{4}\s*-\s*е|-е\s*г|\bв\.|век|ок\.|около|после|до\s+\d|\bнач|\bсер|\bкон", d):
        return ""
    m = re.match(r"\D{0,3}(1[0-9]{3}|20[0-2][0-9])\b", d)
    return m.group(1) if m else ""


def avtor_im(avtor):
    """«Теребенев, Иван Иванович (1780-1815)» → «Иван Иванович Теребенев» (фамилия последним словом — так сверяет
    kadr.strogo). Несколько авторов — первый."""
    a = re.split(r"\s*;\s*|\s{2,}|(?<=\))\s+", (avtor or "").strip())[0]
    a = re.sub(r"\s*\([^)]*\)", "", a).strip(" ,")
    if "," in a:
        fam, im = [x.strip() for x in a.split(",", 1)]
        a = f"{im} {fam}".strip()
    return a


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
        # поиск сайта — «И» по всем словам и полям: «Теребенев Русский Сцевола» пусто, «Сцевола» — есть.
        # Поэтому: название целиком, затем фамилия + каждое значимое слово; полная строка — последней.
        # Кандидаты всё равно отсеиваются по фамилии автора.
        fam = _familiya(kadr.get('avtor'))
        zaprosy.append(("nazv", nazv))
        for w in [w for w in re.findall(r"[А-Яа-яЁё]{5,}", nazv)][:3]:
            zaprosy.append(("nazv", f"{fam} {w}".strip()))
        zaprosy.append(("nazv", f"{fam} {nazv}".strip()))
    vyhod, byli = [], set()
    for vid, q in zaprosy:
        try:
            elementy = _poisk(q)
        except requests.RequestException as e:
            print(f"[ermitazh] поиск «{q}»: {e}", file=sys.stderr)
            continue
        vzyato = 0
        for el in elementy:
            eid = str(el.get("id") or "")
            if not eid or eid in byli or vzyato >= MAKS_KAND:
                continue
            avtor = _param(el, "avtor")
            if vid == "nazv" and kadr.get("avtor"):
                fam = _familiya(kadr["avtor"]).lower()
                if fam and fam not in avtor.lower():
                    continue
            vzyato += 1
            try:
                k = _kartochka(eid)
            except requests.RequestException:
                k = {}
            inv_k = k.get("inv", "")
            if vid == "inv" and _norm_inv(inv_k) != inv:
                continue
            byli.add(eid)
            avtor_p = k.get("avtor") or avtor
            date = k.get("date") or _param(el, "date")
            vyhod.append({
                "fond": FOND + (f", инв. {inv_k}" if inv_k else ""),
                "derzhatel": FOND,
                "inv": inv_k,
                "card": f"{BAZA}/digital-collection/{eid}",
                "image": _skan(k.get("image") or el.get("image", "")),
                "title": (k.get("title") or el.get("name") or "").strip(),
                "avtor": avtor_im(avtor_p),
                "avtor_polno": avtor_p,
                "god": god_iz(date),
                "datirovka": date,
                "seriya": k.get("album", ""),
                "tehnika": k.get("tech", ""),
                "osnovanie": _osnovanie(avtor_p),
            })
        if vyhod:
            break  # номер совпал или нашлись работы автора — дальше шире и хуже
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
