#!/usr/bin/env python3
"""Дореформенный скан → текст в старой и в современной орфографии (п. 101 очереди 1, r718-dorefo).
Ручной инструмент, в сборку и CI не входит.

Распознаёт печатную страницу до 1918 года моделью Tesseract `orus` (дообучена на «Искре» 1900–1905,
github.com/AButon-8/iskra_ocr, Apache 2.0; по их тесту 94 % слов против 61 % у обычной rus).
Пишет рядом два файла: <скан>.dorefo.txt (как напечатано: ѣ, і, ѳ, ѵ, ъ) и <скан>.sovr.txt (по-современному:
ѣ→е, і→и, ѳ→ф, ѵ→и, ъ на конце слова убран). Текстовый файл (.txt) только переводится в современную орфографию.
Окончания -аго/-яго, -ыя/-ія и приставки из-/раз- перед глухими («изслѣдованіе») не трогает: это правка
по смыслу, её делает человек. Текст — черновик для чтения, в день не вставлять без сверки с картинкой.

Проба 10.11.2026 (archive.org, слова сверены глазом): «Боярская дума древней Руси» 1902, с. 16, проза —
67 из 72 слов (93 %; ошибки: ѣ пропущена, ъ→ь, «!» вместо ѣ); Ивановский, «Разбор сочинения г. Каченовского»
1856, заглавный лист крупным наборным шрифтом — 13 из 25 (52 %; Ѣ→Ъ, регистр вперемешку). Таблицы не читает.
Рукописи этот путь не читает: «Из воспоминаний русской революционерки», скоропись 1908 г. — 0 из 80 слов.
Рукопись — Transkribus (бесплатный план: 50 кредитов в месяц, 1 кредит = 1 страница, вручную через сайт; платные
от 99 € в год — не брать) или eScriptorium/Kraken (открытые, бесплатные, но нужна модель под почерк; не проверено).

Установка без root (проверено 10.11.2026):
  ~/.venvs/agent311/bin/pip install tesserocr
  # orus.traineddata (11,8 МБ) с raw.githubusercontent.com/AButon-8/iskra_ocr/main/ → ~/.local/share/tessdata/

  ~/.venvs/agent311/bin/python tools/dorefo-tekst.py skan.jpg
  ~/.venvs/agent311/bin/python tools/dorefo-tekst.py tekst.txt          # только перевод орфографии
  ~/.venvs/agent311/bin/python tools/dorefo-tekst.py skan.jpg --vyvod -  # в stdout
"""
import argparse
import os
import re
import sys

TESSDATA = os.environ.get("TESSDATA_PREFIX", os.path.expanduser("~/.local/share/tessdata"))
MIN_STORONA = 2000

ZAMENY = str.maketrans({"ѣ": "е", "Ѣ": "Е", "і": "и", "І": "И", "ѳ": "ф", "Ѳ": "Ф", "ѵ": "и", "Ѵ": "И"})
# ъ на конце слова (в том числе перед дефисом: «къ-тому»); внутри слова («подъёмъ» → «подъём») остаётся
ER_NA_KONCE = re.compile(r"(?<=[А-Яа-яЁё])[ъЪ](?![А-Яа-яЁё])")


def v_sovremennuyu(tekst):
    return ER_NA_KONCE.sub("", tekst.translate(ZAMENY))


def raspoznat(put, psm):
    import tesserocr
    from PIL import Image, ImageOps

    with Image.open(put) as img:
        img = ImageOps.autocontrast(ImageOps.exif_transpose(img).convert("L"), cutoff=1)
    if max(img.size) < MIN_STORONA:
        k = MIN_STORONA / max(img.size)
        img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    with tesserocr.PyTessBaseAPI(path=TESSDATA, lang="orus", psm=psm) as api:
        api.SetImage(img)
        return api.GetUTF8Text().strip(), api.MeanTextConf()


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("puti", nargs="+", help="сканы (jpg/png/tif) или .txt")
    ap.add_argument("--psm", type=int, default=3, help="разметка страницы Tesseract (3 — авто, 6 — один блок)")
    ap.add_argument("--vyvod", help="«-» — в stdout, файлы не писать")
    a = ap.parse_args()
    if not os.path.exists(os.path.join(TESSDATA, "orus.traineddata")) and any(
        not p.endswith(".txt") for p in a.puti
    ):
        sys.exit(f"нет {TESSDATA}/orus.traineddata — см. установку в начале файла")
    for put in a.puti:
        if put.endswith(".txt"):
            staryy, uv = open(put, encoding="utf-8").read(), None
        else:
            staryy, uv = raspoznat(put, a.psm)
        novyy = v_sovremennuyu(staryy)
        if a.vyvod == "-":
            print(f"=== {put}" + (f" (уверенность {uv} %)" if uv is not None else ""))
            print(novyy)
            continue
        osnova = os.path.splitext(put)[0]
        if uv is not None:
            open(osnova + ".dorefo.txt", "w", encoding="utf-8").write(staryy + "\n")
        open(osnova + ".sovr.txt", "w", encoding="utf-8").write(novyy + "\n")
        print(f"{put}: {len(novyy.split())} слов" + (f", уверенность {uv} %" if uv is not None else ""))


if __name__ == "__main__":
    main()
