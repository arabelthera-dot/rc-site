#!/usr/bin/env python3
"""Снимки glb с 4 сторон (спереди, справа, сзади, слева) + лист 2×2 — для проверки глазами.

Без OpenGL и Blender: свой растеризатор на numpy (z-буфер, текстура по UV, свет Ламберта),
чтобы работал на сервере и в облаке одинаково. Общий для tools/kaggle3d.py и tools/hf3d.py.

  python3 tools/snimki3d.py model.glb [папка]     → model_speredi.png … + model_obzor.jpg
"""
import json
import sys
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image

STORONY = [("speredi", 0), ("sprava", 90), ("szadi", 180), ("sleva", 270)]


def zagruzit(glb):
    """glb → одна сетка с вершинами, гранями, UV и картинкой текстуры (или цветами вершин)."""
    obj = trimesh.load(str(glb), force="scene")
    # dump() применяет преобразования узлов сцены и сохраняет UV/текстуру каждой части
    chasti = [m for m in obj.dump() if isinstance(m, trimesh.Trimesh) and len(m.faces)]
    if not chasti:
        raise ValueError(f"{glb}: в файле нет сетки")
    return chasti


def _cveta(m):
    """Возвращает (uv, tex) или (vcol, None)."""
    v = m.visual
    if getattr(v, "kind", None) == "texture" and getattr(v, "uv", None) is not None:
        mat = v.material
        img = getattr(mat, "baseColorTexture", None) or getattr(mat, "image", None)
        if img is not None:
            tex = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
            return np.asarray(v.uv, dtype=np.float32), tex
        base = getattr(mat, "baseColorFactor", None)
        if base is not None:
            c = np.asarray(base[:3], dtype=np.float32) / (255.0 if max(base[:3]) > 1 else 1.0)
            return np.tile(c, (len(m.vertices), 1)), None
    try:
        cv = v if getattr(v, "kind", None) == "vertex" else v.to_color()
        vc = np.asarray(cv.vertex_colors, dtype=np.float32)[:, :3] / 255.0
        return vc, None
    except Exception:
        return np.full((len(m.vertices), 3), 0.75, dtype=np.float32), None


def est_tekstura(glb):
    return any(_cveta(m)[1] is not None for m in zagruzit(glb))


def _ras(V, F, W, H):
    """V — экранные (x, y, z), чем больше z, тем ближе. Вернёт буферы id грани и барицентрик."""
    zbuf = np.full((H, W), -np.inf, dtype=np.float32)
    fid = np.full((H, W), -1, dtype=np.int64)
    bar = np.zeros((H, W, 3), dtype=np.float32)
    T = V[F]  # (n,3,3)
    x0, y0 = T[:, :, 0].min(1), T[:, :, 1].min(1)
    x1, y1 = T[:, :, 0].max(1), T[:, :, 1].max(1)
    for i in np.argsort(T[:, :, 2].mean(1)):
        a, b, c = T[i]
        xa, xb = max(int(np.floor(x0[i])), 0), min(int(np.ceil(x1[i])), W - 1)
        ya, yb = max(int(np.floor(y0[i])), 0), min(int(np.ceil(y1[i])), H - 1)
        if xa > xb or ya > yb:
            continue
        den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(den) < 1e-12:
            continue
        xs, ys = np.meshgrid(np.arange(xa, xb + 1) + 0.5, np.arange(ya, yb + 1) + 0.5)
        l0 = ((b[1] - c[1]) * (xs - c[0]) + (c[0] - b[0]) * (ys - c[1])) / den
        l1 = ((c[1] - a[1]) * (xs - c[0]) + (a[0] - c[0]) * (ys - c[1])) / den
        l2 = 1 - l0 - l1
        ins = (l0 >= -1e-4) & (l1 >= -1e-4) & (l2 >= -1e-4)
        if not ins.any():
            continue
        z = l0 * a[2] + l1 * b[2] + l2 * c[2]
        zb = zbuf[ya:yb + 1, xa:xb + 1]
        upd = ins & (z > zb)
        if not upd.any():
            continue
        zb[upd] = z[upd]
        fid[ya:yb + 1, xa:xb + 1][upd] = i
        bar[ya:yb + 1, xa:xb + 1][upd] = np.stack([l0, l1, l2], -1)[upd]
    return fid, bar


def snimok(chasti, ugol, razmer=512):
    """Ортографический снимок, поворот вокруг вертикали (Y вверх, как в glTF) на ugol градусов."""
    allv = np.concatenate([m.vertices for m in chasti])
    centr = (allv.min(0) + allv.max(0)) / 2
    mash = np.linalg.norm(allv - centr, axis=1).max() or 1.0
    t = np.radians(ugol)
    R = np.array([[np.cos(t), 0, np.sin(t)], [0, 1, 0], [-np.sin(t), 0, np.cos(t)]])
    W = H = razmer
    pole = 0.92 * razmer / 2
    Vs, Fs, cols, offs = [], [], [], 0
    for m in chasti:
        v = (np.asarray(m.vertices) - centr) / mash @ R.T
        Vs.append(v)
        Fs.append(np.asarray(m.faces) + offs)
        offs += len(v)
    V = np.concatenate(Vs)
    F = np.concatenate(Fs)
    scr = np.stack([W / 2 + V[:, 0] * pole, H / 2 - V[:, 1] * pole, V[:, 2]], 1)
    fid, bar = _ras(scr, F, W, H)

    # цвет каждой грани по пикселям: текстура (UV) или цвет вершин
    img = np.ones((H, W, 3), dtype=np.float32)
    mask = fid >= 0
    n = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-12
    svet = np.array([0.35, 0.5, 0.8]); svet /= np.linalg.norm(svet)
    yark = 0.35 + 0.65 * np.abs(n @ svet)  # abs — сетки из нейросетей бывают с вывернутыми гранями
    fo = 0
    for m in chasti:
        nf = len(m.faces)
        sel = mask & (fid >= fo) & (fid < fo + nf)
        if sel.any():
            f = fid[sel] - fo
            b = bar[sel]
            data, tex = _cveta(m)
            tri = np.asarray(m.faces)[f]
            val = (data[tri] * b[:, :, None]).sum(1)
            if tex is not None:
                th, tw = tex.shape[:2]
                u = np.mod(val[:, 0], 1.0)
                vv = np.mod(val[:, 1], 1.0)
                px = np.clip((u * tw).astype(int), 0, tw - 1)
                py = np.clip(((1 - vv) * th).astype(int), 0, th - 1)
                c = tex[py, px]
            else:
                c = val
            img[sel] = np.clip(c * yark[fid[sel]][:, None], 0, 1)
        fo += nf
    return Image.fromarray((img * 255).astype(np.uint8))


def snimki(glb, papka=None, razmer=512):
    """Пишет 4 png и лист obzor.jpg рядом с glb (или в papka). Возвращает список путей."""
    glb = Path(glb)
    papka = Path(papka or glb.parent)
    papka.mkdir(parents=True, exist_ok=True)
    chasti = zagruzit(glb)
    puti, kadry = [], []
    for imya, ugol in STORONY:
        im = snimok(chasti, ugol, razmer)
        p = papka / f"{glb.stem}_{imya}.png"
        im.save(p)
        puti.append(str(p))
        kadry.append(im)
    list_ = Image.new("RGB", (razmer * 2, razmer * 2), "white")
    for k, im in enumerate(kadry):
        list_.paste(im, ((k % 2) * razmer, (k // 2) * razmer))
    p = papka / f"{glb.stem}_obzor.jpg"
    list_.save(p, quality=88)
    puti.append(str(p))
    return puti


def proverit_glb(glb):
    """Разбор ответа: glb читается, есть грани, есть ли текстура, размер. Падает, если файл пустой/битый."""
    chasti = zagruzit(glb)
    return {
        "glb": str(glb),
        "granej": int(sum(len(m.faces) for m in chasti)),
        "vershin": int(sum(len(m.vertices) for m in chasti)),
        "tekstura": any(_cveta(m)[1] is not None for m in chasti),
        "kb": round(Path(glb).stat().st_size / 1024),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    print(json.dumps(proverit_glb(sys.argv[1]), ensure_ascii=False))
    for p in snimki(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None):
        print(p)
