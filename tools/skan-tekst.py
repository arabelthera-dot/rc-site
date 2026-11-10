#!/usr/bin/env python3
"""Скан источника → текст в файл рядом (п. 95 очереди 1, r716-ocr). Ручной инструмент, в сборку и CI не входит.

Распознаёт страницу (jpg/png/tif/webp или pdf постранично) движком Tesseract 5 (LSTM), языки rus+bel+eng,
локально и бесплатно. Пишет <скан>.txt рядом со сканом (pdf — <скан>.txt со всеми страницами, разделитель
«--- стр. N ---»). Уже распознанный скан не трогает без --zanovo. Текст — черновик для чтения человеком:
сверять с картинкой, в день не вставлять без проверки.

Проба 10.11.2026 (по 1 абзацу, слова сверены глазом): патент Котельникова № 1607 (983 px, машинопись 1926) —
46 из 50 слов (92 %); патент США 830084 (eng) — 17 из 18 (94 %); фото газеты «Советское Зауралье» 585 px —
заголовки 19 из 40 (48 %), мелкий текст не читается. Мерка: скан ≥ 300 dpi, не фото страницы в рамке.
Чисто английский скан — --yazyki eng: с rus+bel в подписи и штампе лезут кириллические буквы.

Установка без root (проверено 10.11.2026, Debian 12):
  ~/.venvs/agent311/bin/pip install tesserocr        # колесо уже содержит tesseract 5.5.3 + leptonica
  # словари tessdata_best (github.com/tesseract-ocr/tessdata_best) → ~/.local/share/tessdata/{rus,bel,eng}.traineddata
  # pdf — нужен pymupdf (pip install pymupdf), иначе pdf пропускается с сообщением

  ~/.venvs/agent311/bin/python tools/skan-tekst.py public/muzei/izobreteniya/img/01-16-gazeta-17-yanvarya.jpg
  ~/.venvs/agent311/bin/python tools/skan-tekst.py papka/ --yazyki rus+eng --zanovo
  ~/.venvs/agent311/bin/python tools/skan-tekst.py skan.jpg --vyvod -      # в stdout, файл не писать
"""
import argparse
import os
import sys

import tesserocr
from PIL import Image, ImageOps

TESSDATA = os.environ.get("TESSDATA_PREFIX", os.path.expanduser("~/.local/share/tessdata"))
KARTINKI = (".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp", ".bmp")
DPI_PDF = 300
MIN_STORONA = 2000  # мелкий скан увеличиваем: LSTM Tesseract ждёт высоту строчной буквы ~20-30 px


def podgotovit(img):
    """Серый, растянутый контраст, мелкое — увеличить. Без бинаризации: Tesseract делает её сам (Otsu)."""
    img = ImageOps.exif_transpose(img).convert("L")
    img = ImageOps.autocontrast(img, cutoff=1)
    dlinnaya = max(img.size)
    if dlinnaya < MIN_STORONA:
        k = MIN_STORONA / dlinnaya
        img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    return img


def stranicy(put):
    if put.lower().endswith(".pdf"):
        try:
            import pymupdf as fitz
        except ImportError:
            sys.exit("pdf: нужен pymupdf (pip install pymupdf)")
        with fitz.open(put) as doc:
            for s in doc:
                pm = s.get_pixmap(dpi=DPI_PDF)
                yield Image.frombytes("RGB", (pm.width, pm.height), pm.samples)
    else:
        with Image.open(put) as img:
            yield img.copy()


def raspoznat(put, yazyki, psm):
    kuski = []
    with tesserocr.PyTessBaseAPI(path=TESSDATA, lang=yazyki, psm=psm) as api:
        api.SetVariable("user_defined_dpi", str(DPI_PDF))
        for n, img in enumerate(stranicy(put), 1):
            api.SetImage(podgotovit(img))
            tekst = api.GetUTF8Text().strip()
            uverennost = api.MeanTextConf()
            kuski.append((n, tekst, uverennost))
    return kuski


def spisok(puti):
    for p in puti:
        if os.path.isdir(p):
            for koren, _, faily in os.walk(p):
                for f in sorted(faily):
                    if f.lower().endswith(KARTINKI + (".pdf",)):
                        yield os.path.join(koren, f)
        else:
            yield p


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("puti", nargs="+", help="сканы или папки")
    ap.add_argument("--yazyki", default="rus+bel+eng", help="языки Tesseract через +, по умолчанию rus+bel+eng")
    ap.add_argument("--psm", type=int, default=3, help="разметка страницы Tesseract: 3 — авто (газета, книга), 6 — один блок")
    ap.add_argument("--zanovo", action="store_true", help="перезаписать готовый .txt")
    ap.add_argument("--vyvod", help="'-' — печатать в stdout вместо файла рядом")
    a = ap.parse_args()

    for put in spisok(a.puti):
        cel = os.path.splitext(put)[0] + ".txt"
        if a.vyvod != "-" and os.path.exists(cel) and not a.zanovo:
            print(f"есть  {cel}")
            continue
        kuski = raspoznat(put, a.yazyki, a.psm)
        if len(kuski) == 1:
            tekst = kuski[0][1] + "\n"
        else:
            tekst = "".join(f"--- стр. {n} ---\n{t}\n\n" for n, t, _ in kuski)
        sred = sum(u for *_, u in kuski) / max(len(kuski), 1)
        if a.vyvod == "-":
            sys.stdout.write(tekst)
        else:
            with open(cel, "w", encoding="utf-8") as f:
                f.write(tekst)
        print(f"готово {cel}  стр. {len(kuski)}  слов {len(tekst.split())}  уверенность Tesseract {sred:.0f}%",
              file=sys.stderr)


if __name__ == "__main__":
    main()
