#!/usr/bin/env python3
"""3D предметов в облаке Kaggle: фото → Kaggle Dataset → блокнот на GPU T4 (Hunyuan3D-2, запасной
TRELLIS) → glb + снимки с 4 сторон в /tmp/3d/ДД/.

По умолчанию ничего не отправляет (выключено): только собирает пакет и показывает, что уйдёт.
Отправка — флаг --go. Ключ: ~/.kaggle/kaggle.json, ~/.kaggle/access_token или KAGGLE_API_TOKEN.

  python3 tools/kaggle3d.py /tmp/r559/02/k1.jpg /tmp/r559/11/k1.jpg            # сухой прогон
  python3 tools/kaggle3d.py --glaz /tmp/r559/glaz.tsv --go                      # все «годно»
  python3 tools/kaggle3d.py --zabrat ПОЛЬЗОВАТЕЛЬ/rc3d-ЗАПУСК                   # забрать готовое
  python3 tools/kaggle3d.py --razobrat ПАПКА                                    # разобрать выгрузку

День берётся из имени папки фото (/tmp/r559/05/k1.jpg → 05) или из --day.
Ждёт до --zhdat минут (по умолчанию 170, чтобы уложиться в ход); не дождался — печатает
команду --zabrat, по которой результат забирается позже. Состояние: /tmp/3d/_kaggle/ЗАПУСК/.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import snimki3d  # noqa: E402

KUDA = Path(os.environ.get("RC3D_KUDA", "/tmp/3d"))
BLOKNOT = Path(__file__).resolve().parent / "kaggle3d_bloknot.py"
CLI_LIB = Path.home() / ".local/kaggle-cli"  # pip install --target, общее окружение не трогаем
USKORITEL = "NvidiaTeslaT4"  # P100 Kaggle списал (kaggle 2.2.5: _RETIRED_ACCELERATORS)
MAKS_STORONA = 2048


def kaggle_cmd():
    if os.environ.get("KAGGLE_CMD"):  # подстановка для проверки без ключа
        return os.environ["KAGGLE_CMD"].split()
    if shutil.which("kaggle"):
        return ["kaggle"]
    return [sys.executable, "-m", "kaggle.cli"]


def kaggle(*args, check=True):
    env = dict(os.environ)
    if CLI_LIB.is_dir():
        env["PYTHONPATH"] = f"{CLI_LIB}:{env['PYTHONPATH']}" if env.get("PYTHONPATH") else str(CLI_LIB)
    r = subprocess.run(kaggle_cmd() + [str(a) for a in args], capture_output=True, text=True, env=env)
    out = (r.stdout or "") + (r.stderr or "")
    # без ключа kaggle 2.2.5 печатает инструкцию и выходит с кодом 0 — это тоже отказ
    if re.search(r"API token file|Could not find kaggle credentials|401 Client Error|Unauthorized", out):
        raise SystemExit(f"kaggle не принял ключ:\n{out[-800:]}")
    if check and r.returncode:
        raise RuntimeError(f"kaggle {' '.join(map(str, args))}: код {r.returncode}\n{out[-2000:]}")
    return out


def klyuch():
    """(есть ли ключ, имя пользователя или None, откуда)."""
    kj = Path.home() / ".kaggle/kaggle.json"
    imya = os.environ.get("KAGGLE_USERNAME")
    if kj.is_file():
        try:
            imya = imya or json.loads(kj.read_text()).get("username")
        except ValueError:
            pass
        return True, imya, str(kj)
    at = Path.home() / ".kaggle/access_token"
    if os.environ.get("KAGGLE_API_TOKEN") or at.is_file() or os.environ.get("KAGGLE_KEY"):
        return True, imya, "access_token"
    return False, None, None


def uznat_imya():
    out = kaggle("config", "view", check=False)
    m = re.search(r"username:\s*(\S+)", out)
    return m.group(1) if m and m.group(1) != "None" else None


def iz_glaz(tsv, ocenka):
    """glaz.tsv (ДД, №, оценка) → пути /tmp/r559/ДД/k№.jpg (№ вида n2 → n2.jpg)."""
    baza = Path(tsv).parent
    puti = []
    for st in Path(tsv).read_text().splitlines():
        if st.startswith("#") or not st.strip():
            continue
        p = st.split("\t")
        if len(p) >= 3 and p[2].strip() == ocenka:
            nom = p[1].strip()
            imya = nom if nom[:1].isalpha() else f"k{nom}"
            puti.append(baza / p[0].strip() / f"{imya}.jpg")
    return puti


def den_foto(p, den):
    if den:
        return den
    d = Path(p).parent.name
    if re.fullmatch(r"\d\d", d):
        return d
    raise SystemExit(f"{p}: день не виден из папки — укажите --day ДД")


def sobrat_bloknot():
    """kaggle3d_bloknot.py → .ipynb (ячейки по "# %%")."""
    kod = BLOKNOT.read_text()
    kuski = re.split(r"(?m)^# %%.*\n", kod)
    yacheyki = []
    for k in kuski:
        k = k.strip("\n")
        if k.strip():
            yacheyki.append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [],
                             "source": k.splitlines(keepends=True)})
    for y in yacheyki:  # сразу ловим опечатки, а не через 15 минут в облаке
        compile("".join(y["source"]), "<ячейка>", "exec")
    return {"nbformat": 4, "nbformat_minor": 5, "cells": yacheyki,
            "metadata": {"kernelspec": {"name": "python3", "display_name": "Python 3", "language": "python"},
                         "language_info": {"name": "python"}}}


def sobrat(foto, den, imya, zapusk, papka):
    """Пакет к отправке: data/ (фото + dataset-metadata.json), kernel/ (ipynb + kernel-metadata.json)."""
    data, kern = papka / "data", papka / "kernel"
    for d in (data, kern):
        shutil.rmtree(d, ignore_errors=True)
        d.mkdir(parents=True)
    spisok = {}
    for p in foto:
        p = Path(p)
        if not p.is_file():
            raise SystemExit(f"нет файла: {p}")
        dd = den_foto(p, den)
        k = f"{dd}_{p.stem}"
        im = Image.open(p)
        im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
        im.thumbnail((MAKS_STORONA, MAKS_STORONA))
        if im.mode == "RGBA":
            im.save(data / f"{k}.png")
        else:
            im.save(data / f"{k}.jpg", quality=95)
        spisok[k] = str(p)
    ds = f"{imya}/rc3d-foto-{zapusk}"
    (data / "dataset-metadata.json").write_text(json.dumps(
        {"title": f"rc3d foto {zapusk}", "id": ds, "licenses": [{"name": "CC0-1.0"}]}, ensure_ascii=False))
    (kern / "rc3d.ipynb").write_text(json.dumps(sobrat_bloknot(), ensure_ascii=False, indent=1))
    kslug = f"{imya}/rc3d-{zapusk}"
    (kern / "kernel-metadata.json").write_text(json.dumps({
        "id": kslug, "title": f"rc3d {zapusk}", "code_file": "rc3d.ipynb", "language": "python",
        "kernel_type": "notebook", "is_private": "true", "enable_gpu": "true", "enable_tpu": "false",
        "enable_internet": "true", "machine_shape": USKORITEL, "dataset_sources": [ds],
        "competition_sources": [], "kernel_sources": [], "model_sources": []}, ensure_ascii=False, indent=1))
    sost = {"zapusk": zapusk, "dataset": ds, "kernel": kslug, "foto": spisok}
    (papka / "sostoyanie.json").write_text(json.dumps(sost, ensure_ascii=False, indent=1))
    return sost


def status_kernel(kslug):
    """kaggle 2.2.5 печатает: 'ИМЯ has status "KernelWorkerStatus.COMPLETE"'."""
    out = kaggle("kernels", "status", kslug, check=False)
    m = re.search(r'has status "([^"]+)"', out)
    st = m.group(1).split(".")[-1].lower() if m else "neizvestno"
    if st.startswith("cancel"):
        st = "cancel"
    return st, out


def zhdat_dataset(ds, minut=10):
    konec = time.time() + minut * 60
    while time.time() < konec:
        out = kaggle("datasets", "status", ds, check=False).lower()
        if "ready" in out:
            return
        if "error" in out:
            raise RuntimeError(f"датасет {ds}: {out}")
        time.sleep(15)
    raise RuntimeError(f"датасет {ds} не готов за {minut} мин")


def razobrat(vygruzka, sost=None):
    """Выгрузка блокнота (out/otchet.json + *.glb) → /tmp/3d/ДД/имя.glb + снимки. Возвращает сводку."""
    vygruzka = Path(vygruzka)
    ot = next(iter(sorted(vygruzka.rglob("otchet.json"))), None)
    if not ot:
        raise SystemExit(f"{vygruzka}: нет otchet.json — блокнот не дошёл до конца, см. журнал *.log")
    dannye = json.loads(ot.read_text())
    svodka = []
    for k, v in sorted(dannye["predmety"].items()):
        dd, _, stem = k.partition("_")
        zap = {"predmet": k, "den": dd, **v}
        if sost:
            zap["iskhodnik"] = sost["foto"].get(k)
        glb = ot.parent / v["glb"] if v.get("glb") else None
        if glb and glb.is_file():
            try:
                pr = snimki3d.proverit_glb(glb)
                cel = KUDA / dd / f"{stem}.glb"
                cel.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy(glb, cel)
                zap.update(pr, glb=str(cel), snimki=snimki3d.snimki(cel))
            except Exception as e:
                zap["oshibka_razbora"] = repr(e)[:300]
        svodka.append(zap)
    for dd in sorted({z["den"] for z in svodka}):
        (KUDA / dd).mkdir(parents=True, exist_ok=True)
        (KUDA / dd / "otchet_kaggle.json").write_text(json.dumps(
            [z for z in svodka if z["den"] == dd], ensure_ascii=False, indent=1))
    return svodka


def pechat(svodka):
    gotovo = [z for z in svodka if z.get("snimki")]
    print(f"\n{len(gotovo)} из {len(svodka)} предметов — glb и снимки готовы")
    for z in svodka:
        if z.get("snimki"):
            tx = "с текстурой" if z.get("tekstura") else "БЕЗ текстуры"
            print(f"  {z['predmet']}: {z.get('model')} {tx}, {z['granej']} граней → {z['glb']}  обзор: {z['snimki'][-1]}")
        else:
            osh = {k: v for k, v in z.items() if k.startswith("oshibka")}
            print(f"  {z['predmet']}: НЕ ВЫШЛО {osh}")


def zabrat(kslug, papka, sost):
    vyg = papka / "vygruzka"
    shutil.rmtree(vyg, ignore_errors=True)
    vyg.mkdir(parents=True)
    kaggle("kernels", "output", kslug, "-p", vyg, "-o")
    svodka = razobrat(vyg, sost)
    pechat(svodka)
    return svodka


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("foto", nargs="*")
    ap.add_argument("--day")
    ap.add_argument("--glaz", help="glaz.tsv — взять фото с оценкой --ocenka")
    ap.add_argument("--ocenka", default="годно")
    ap.add_argument("--go", action="store_true", help="отправить в Kaggle (без флага — сухой прогон)")
    ap.add_argument("--zhdat", type=int, default=170, help="минут ждать блокнот")
    ap.add_argument("--zabrat", metavar="ПОЛЬЗОВАТЕЛЬ/rc3d-ЗАПУСК")
    ap.add_argument("--razobrat", metavar="ПАПКА")
    a = ap.parse_args()

    if a.razobrat:
        pechat(razobrat(a.razobrat))
        return
    if a.zabrat:
        zapusk = a.zabrat.split("/rc3d-")[-1]
        papka = KUDA / "_kaggle" / zapusk
        sf = papka / "sostoyanie.json"
        sost = json.loads(sf.read_text()) if sf.is_file() else None
        st, out = status_kernel(a.zabrat)
        print("статус:", st)
        if st != "complete":
            print(out.strip())
            if st != "error":
                return
        papka.mkdir(parents=True, exist_ok=True)
        zabrat(a.zabrat, papka, sost)
        return

    foto = list(a.foto)
    if a.glaz:
        foto += [str(p) for p in iz_glaz(a.glaz, a.ocenka)]
    if not foto:
        ap.error("нет фото")
    est, imya, otkuda = klyuch()
    if a.go and not est:
        raise SystemExit("нет ключа Kaggle (~/.kaggle/kaggle.json или access_token) — его заводит Михаил (М77)")
    if a.go and not imya:
        imya = uznat_imya()
        if not imya:
            raise SystemExit("ключ есть, но имя пользователя Kaggle не узнать — задайте KAGGLE_USERNAME")
    zapusk = time.strftime("%Y%m%d-%H%M%S")
    papka = KUDA / "_kaggle" / zapusk
    sost = sobrat(foto, a.day, imya or "POLZOVATEL", zapusk, papka)
    print(f"пакет: {papka}  ({len(sost['foto'])} фото, блокнот {sost['kernel']}, GPU {USKORITEL})")
    if not a.go:
        print("сухой прогон: в Kaggle ничего не ушло; ключ:", otkuda or "нет", "— для отправки добавьте --go")
        return

    print(kaggle("datasets", "create", "-p", papka / "data", "-q").strip()[-500:])
    zhdat_dataset(sost["dataset"])
    print(kaggle("kernels", "push", "-p", papka / "kernel", "--accelerator", USKORITEL).strip()[-500:])
    konec = time.time() + a.zhdat * 60
    st, neponyatno = "queued", 0
    while time.time() < konec:
        st, out = status_kernel(sost["kernel"])
        print(time.strftime("%H:%M:%S"), st, flush=True)
        if st in ("complete", "error", "cancel"):
            break
        neponyatno = neponyatno + 1 if st == "neizvestno" else 0
        if neponyatno >= 3:
            raise SystemExit("kaggle трижды ответил непонятно:\n" + out[-1500:])
        time.sleep(int(os.environ.get("RC3D_PAUZA", 60)))
    if st in ("complete", "error"):  # и при ошибке забираем: журнал и то, что успело
        zabrat(sost["kernel"], papka, sost)
    else:
        print(f"не дождался за {a.zhdat} мин (статус {st}). Забрать позже:\n"
              f"  python3 tools/kaggle3d.py --zabrat {sost['kernel']}")


if __name__ == "__main__":
    main()
