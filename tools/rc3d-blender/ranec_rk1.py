# Ранец РК-1 (Котельников, 1911) для 3D-игры дня «Котельников, РК-1». Две модели (оси three.js, метры):
#   ranec-rk1.raw.glb   — корпус-лоток 0.30×0.40×0.15 (центр = объект 'ranec'), скруглённые рёбра, заклёпки по борту,
#                         внутренняя полка, упоры пружин, обрезки плечевых лямок и поясного ремня с пряжками;
#   kryshka-rk1.raw.glb — крышка 0.31×0.40 (центр = объект 'kryshka'), ребро жёсткости, заклёпки, петля сверху.
# Ид. игры не меняются: ranec / petlya / kryshka / pruzhina / kolco остаются в сцене (gen_kotelnikov.py).
# Запуск: ~/opt/blender/blender.sh -b --factory-startup --python ~/rc3d-proba/blender/ranec_rk1.py
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, numpy as np
from lib import *

reset(); random.seed(7)

def kraska_tex(path, n=512):
    """Окрашенный металл с потёртостями: серо-зелёная краска, светлые царапины и сколы до металла по краям."""
    rng = np.random.default_rng(3); base = np.array([0.36, 0.40, 0.34])
    y, x = np.mgrid[0:n, 0:n] / n
    noise = sum(np.sin((x * f + rng.random()) * 6.28 * rng.integers(1, 4)) * np.sin((y * f + rng.random()) * 6.28) / f for f in (2, 5, 11, 23))
    img = base[None, None, :] * (1 + 0.06 * noise[..., None])
    for _ in range(140):   # царапины
        x0, y0, a, L = rng.random() * n, rng.random() * n, rng.random() * 6.28, rng.integers(10, 70)
        for t in range(L):
            xi, yi = int(x0 + math.cos(a) * t) % n, int(y0 + math.sin(a) * t) % n
            img[yi, xi] = [0.62, 0.63, 0.60]
    edge = np.minimum(np.minimum(x, 1 - x), np.minimum(y, 1 - y))
    chip = (edge < 0.06) & (rng.random((n, n)) < 0.25 * (1 - edge / 0.06))
    img[chip] = [0.55, 0.55, 0.53]
    im = bpy.data.images.new('kraska', n, n); px = np.concatenate([np.clip(img, 0, 1), np.ones((n, n, 1))], 2)
    im.pixels.foreach_set(px[::-1].astype(np.float32).ravel()); im.filepath_raw = path; im.file_format = 'PNG'; im.save()

os.makedirs(TEX, exist_ok=True); kraska_tex(os.path.join(TEX, 'kraska_rk1.png'))
KR = mat('kraska_rk1', rough=0.55, metal=0.6, tex='kraska_rk1.png', tile=0.3)
KRI = mat('kraska_vnutri', color=hexc('#4a4f45'), rough=0.7, metal=0.4)
ZAK = mat('zaklepka', color=hexc('#9a9a92'), rough=0.35, metal=1.0)
LAT = mat('latun', color=hexc('#b39a5c'), rough=0.3, metal=1.0)
KOZ = mat('kozha_lyamok', rough=0.75, tex='kozha.png', normal='kozha_n.png', tile=0.25)
PRU = mat('pruzhina_stal', color=hexc('#6d7075'), rough=0.3, metal=1.0)

# ── Корпус: лоток, открытый в сторону −Z (наружу от спины), крышка закрывает −Z ──
B = Builder(); W, H, Dp, t, r = 0.30, 0.40, 0.15, 0.012, 0.022
B.rbox((0, 0, Dp / 2 - t / 2), (W, H, t), KR, rad=0.006)                       # спинка (к лётчику)
for s in (-1, 1):
    B.rbox((s * (W / 2 - t / 2), 0, 0), (t, H, Dp), KR, rad=0.006)             # боковины
    B.rbox((0, s * (H / 2 - t / 2), 0), (W, t, Dp), KR, rad=0.006)             # верх/низ
for s in (-1, 1):
    for sy in (-1, 1): B.cyl(V(s * (W / 2 - r), sy * (H / 2 - r), -Dp / 2), V(s * (W / 2 - r), sy * (H / 2 - r), Dp / 2), r, KR, sides=12)  # скругление вертикальных рёбер
# отбортовка по краю проёма
for s in (-1, 1):
    B.box((s * (W / 2 - 0.004), 0, -Dp / 2 + 0.003), (0.012, H, 0.006), KR)
    B.box((0, s * (H / 2 - 0.004), -Dp / 2 + 0.003), (W, 0.012, 0.006), KR)
# внутри: полка и упоры пружин (сами пружины — объект 'pruzhina' сцены)
B.box((0, -0.01, -0.005), (W - 2 * t, 0.008, Dp - 2 * t), KRI)
for x in (-0.07, 0.07):
    for y in (0.06, -0.08): B.cyl(V(x, y, Dp / 2 - t), V(x, y, Dp / 2 - t - 0.006), 0.026, KRI, sides=12)
B.box((0, 0, Dp / 2 - t - 0.001), (W - 2 * t, H - 2 * t, 0.002), KRI)
# заклёпки по боковинам и верху/низу (видны снаружи и сзади)
for s in (-1, 1):
    for y in np.linspace(-0.17, 0.17, 7): B.sphere((s * (W / 2 + 0.0005), y, -0.045), 0.0055, ZAK, 8, 5, (0.5, 1, 1)); B.sphere((s * (W / 2 + 0.0005), y, 0.045), 0.0055, ZAK, 8, 5, (0.5, 1, 1))
    for x in np.linspace(-0.12, 0.12, 5): B.sphere((x, s * (H / 2 + 0.0005), 0), 0.0055, ZAK, 8, 5, (1, 0.5, 1))
# лямки у ранца: плечевые уходят вверх-вперёд, поясной ремень — по бокам вперёд; пряжки латунь
for s in (-1, 1):
    x = s * 0.09
    B.box((x, 0.20, Dp / 2 + 0.006), (0.05, 0.10, 0.008), KOZ, rot=(-25, 0, 0))
    B.box((x, 0.245, Dp / 2 + 0.045), (0.05, 0.008, 0.07), KOZ, rot=(-15, 0, 0))
    B.box((x, -0.17, Dp / 2 + 0.006), (0.045, 0.08, 0.008), KOZ, rot=(20, 0, 0))   # нижние концы лямок
    B.box((s * 0.165, -0.15, 0.03), (0.03, 0.05, 0.11), KOZ)                       # поясной ремень вперёд
    B.torus(V(s * 0.168, -0.15, -0.025), 0.018, 0.0035, LAT, axis=(1, 0, 0), seg=16, sides=6)
    for y in (0.16, -0.135): B.sphere((x, y, Dp / 2 + 0.011), 0.006, LAT, 8, 5, (1, 1, 0.6))
korpus = B.object('ranec_rk1', smooth_angle=40)
export([korpus], 'ranec-rk1')

# ── Крышка: центр = 'kryshka'; петля на верхнем крае (ось петли — у объекта 'petlya', y=+0.2, z=+0.008) ──
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
K = Builder(); KW, KH, KT = 0.31, 0.40, 0.012
K.rbox((0, 0, 0), (KW, KH, KT), KR, rad=0.005)
K.rbox((0, -0.01, -KT / 2 - 0.002), (0.22, 0.30, 0.006), KR, rad=0.003)         # выдавленное ребро жёсткости
K.rbox((0, -0.01, -KT / 2 - 0.005), (0.04, 0.24, 0.004), KR, rad=0.0015)
for x in np.linspace(-0.135, 0.135, 7):
    for y in (0.175, -0.185): K.sphere((x, y, -KT / 2), 0.005, ZAK, 8, 5, (1, 1, 0.5))
for y in np.linspace(-0.13, 0.12, 5):
    for x in (-0.14, 0.14): K.sphere((x, y, -KT / 2), 0.005, ZAK, 8, 5, (1, 1, 0.5))
for x0, x1, m in ((-0.15, -0.055, KR), (-0.05, 0.05, ZAK), (0.055, 0.15, KR)):   # петля: три кулака на оси
    K.cyl(V(x0, KH / 2, 0.008), V(x1, KH / 2, 0.008), 0.009, m, sides=12)
K.box((0, -KH / 2 + 0.01, -KT / 2 - 0.006), (0.05, 0.02, 0.006), LAT)            # защёлка внизу
kr = K.object('kryshka_rk1', smooth_angle=40)
export([kr], 'kryshka-rk1')
print('TRIS', count_tris([kr]))
