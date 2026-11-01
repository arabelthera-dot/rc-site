# Аэроплан типа «Фарман IV» (1909–1910) для 3D-игры дня «Котельников, РК-1» — на таком «Фармане» разбился Мациевич (1910).
# Модель целиком скриптом, без текстур (PBR-материалы: льняное полотно на просвет, лакированное дерево, сталь тросов).
# Оси three.js, метры, начало = группа 'samolet' сцены; +x — нос (полёт), лётчик сидит на передней кромке нижнего крыла.
# Части — отдельные glb, по одному на узел игры (логика игры разламывает самолёт по ним):
#   aeroplan-fuzelyazh — ферма хвоста, рули, передний руль высоты, мотор «Гном», сиденье, шасси  (узел fuzelyazh, 0,0,0)
#   aeroplan-vint      — толкающий винт (узел vint, крутится вокруг x)
#   aeroplan-krylo-vl/vr/nl/nr — верхние и нижние полукрылья (узлы kryloVL/VR/NL/NR); стойки и расчалки — с верхними.
# Запуск: ~/opt/blender/blender.sh -b --factory-startup --python tools/rc3d-blender/aeroplan.py ; затем szhat.sh
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from lib import *

reset()

LIN = mat('lnyanoe_polotno', color=hexc('#ece2c8'), rough=0.85)
b = LIN.node_tree.nodes['Principled BSDF']
b.inputs['Transmission Weight'].default_value = 0.35       # на просвет видны нервюры
LIN.use_backface_culling = False
WOOD = mat('derevo_lak', color=hexc('#8e5a2b'), rough=0.32)
WOODV = mat('derevo_vint', color=hexc('#a26a36'), rough=0.25)
STAL = mat('stal_tros', color=hexc('#a4a8ad'), rough=0.3, metal=1.0)
MOT = mat('motor_gnom', color=hexc('#55565a'), rough=0.4, metal=0.85)
REZ = mat('rezina', color=hexc('#2a2826'), rough=0.85)

# ── размеры ──
YU, YL = 1.0, -0.45            # верхнее и нижнее крыло
XLE, XTE = -0.3, -2.3          # передняя и задняя кромка (хорда 2 м)
SPAN_U, SPAN_L = 5.2, 4.9      # полуразмах
RIB = 0.36                     # шаг нервюр
STRUT_Z = (0.95, 2.55, 4.15)   # стойки по размаху
SX = (-0.55, -2.0)             # передний и задний ряд стоек

def wing(B, s, y0, L):
    """Полукрыло: двухслойное полотно с провисом между нервюрами, нервюры, лонжероны, кромка."""
    nb = max(1, round((L - 0.05) / RIB)); sub = 4; nc = 12
    zs = [s * (0.05 + (L - 0.05) * i / (nb * sub)) for i in range(nb * sub + 1)]
    def camber(u): return 0.075 * math.sin(math.pi * min(1, u * 1.15)) if u < 0.87 else 0.075 * math.sin(math.pi * 0.9) * (1 - u) / 0.13
    top, bot = [], []
    for j, z in enumerate(zs):
        sag = 0.012 * math.sin(math.pi * (j % sub) / sub)        # полотно проседает между нервюрами
        for i in range(nc + 1):
            u = i / nc; x = XLE + (XTE - XLE) * u
            top.append((x, y0 + camber(u) - sag * math.sin(math.pi * u) ** 0.5, z))
            bot.append((x, y0 + camber(u) * 0.25 + sag * 0.5 * math.sin(math.pi * u), z))
    n = nc + 1; vs = top + bot; o = len(top); fs = []
    for j in range(len(zs) - 1):
        for i in range(nc):
            a, b_, c, d = j * n + i, j * n + i + 1, (j + 1) * n + i + 1, (j + 1) * n + i
            fs.append((a, b_, c, d)); fs.append((o + d, o + c, o + b_, o + a))
    for i in range(nc):                                           # торцы
        fs.append((i, o + i, o + i + 1, i + 1)); k = (len(zs) - 1) * n
        fs.append((k + i + 1, o + k + i + 1, o + k + i, k + i))
    B.mesh(vs, fs, LIN)
    for j in range(0, len(zs), sub):                             # нервюры под полотном
        z = zs[j]; pts = [(XLE + (XTE - XLE) * u, y0 + camber(u) * 0.6, z) for u in (0.02, 0.2, 0.4, 0.6, 0.8, 0.98)]
        B.tube(pts, 0.011, WOOD, sides=5)
    for xs in (XLE - 0.005, -0.75, -1.85):                       # передняя кромка и два лонжерона
        u = (xs - XLE) / (XTE - XLE)
        B.cyl((xs, y0 + max(0, camber(max(u, 0))) * 0.6, s * 0.04), (xs, y0 + max(0, camber(max(u, 0))) * 0.6, s * (L + 0.01)), 0.018, WOOD, sides=8)

def struts_wires(B, s):
    """Стойки между крыльями и перекрёстные расчалки (с верхним полукрылом)."""
    for z in STRUT_Z:
        for x in SX: B.cyl((x, YL + 0.03, s * z), (x, YU + 0.03, s * z), 0.025, WOOD, sides=8)
    zz = (0.06,) + STRUT_Z
    for x in SX:
        for a, c in zip(zz[:-1], zz[1:]):
            B.cyl((x, YL + 0.05, s * a), (x, YU, s * c), 0.0035, STAL, sides=4, caps=False)
            B.cyl((x, YU, s * a), (x, YL + 0.05, s * c), 0.0035, STAL, sides=4, caps=False)
    for z in STRUT_Z:                                            # расчалки по хорде
        B.cyl((SX[0], YL + 0.05, s * z), (SX[1], YU, s * z), 0.003, STAL, sides=4, caps=False)
        B.cyl((SX[0], YU, s * z), (SX[1], YL + 0.05, s * z), 0.003, STAL, sides=4, caps=False)

def plane(B, x0, x1, y, z0, z1, ribs=4):
    """Плоская полотняная поверхность руля с рамкой из реек."""
    B.mesh([(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], [(0, 1, 2, 3), (3, 2, 1, 0)], LIN)
    for z in (z0, z1): B.cyl((x0, y, z), (x1, y, z), 0.012, WOOD, sides=5)
    for x in (x0, x1): B.cyl((x, y, z0), (x, y, z1), 0.014, WOOD, sides=5)
    for k in range(1, ribs): z = z0 + (z1 - z0) * k / ribs; B.cyl((x0, y + 0.006, z), (x1, y + 0.006, z), 0.008, WOOD, sides=4)

def rudder(B, x0, x1, y0, y1, z):
    B.mesh([(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)], [(0, 1, 2, 3), (3, 2, 1, 0)], LIN)
    for y in (y0, y1): B.cyl((x0, y, z), (x1, y, z), 0.012, WOOD, sides=5)
    for x in (x0, x1): B.cyl((x, y0, z), (x, y1, z), 0.014, WOOD, sides=5)
    B.cyl(((x0 + x1) / 2, y0, z), ((x0 + x1) / 2, y1, z), 0.008, WOOD, sides=4)

def wheel(B, x, y, z, r=0.3):
    B.torus((x, y, z), r - 0.03, 0.035, REZ, axis=(0, 0, 1), seg=28, sides=8)
    B.torus((x, y, z), r - 0.075, 0.012, STAL, axis=(0, 0, 1), seg=28, sides=5)
    B.cyl((x, y, z - 0.07), (x, y, z + 0.07), 0.035, STAL, sides=10)
    for k in range(16):
        a = k / 16 * 2 * math.pi; zz = z + (0.05 if k % 2 else -0.05)
        B.cyl((x, y, zz), (x + (r - 0.08) * math.cos(a), y + (r - 0.08) * math.sin(a), z), 0.003, STAL, sides=3, caps=False)

def shift(B, O):
    O = Vector(O)
    for p in B.parts.values(): p[0][:] = [v - O for v in p[0]]

# ── Фюзеляж-ферма: хвост, рули, передний руль высоты, мотор, сиденье, шасси ──
F = Builder()
XT0, XT1 = -6.6, -7.7                      # хвостовые плоскости
for z in (-0.95, 0.95):                    # 4 лонжерона хвостовой фермы сходятся к хвосту
    zt = 0.55 * (1 if z > 0 else -1)
    F.cyl((XTE + 0.1, YU, z), (XT0 + 0.2, 0.62, zt), 0.022, WOOD); F.cyl((XTE + 0.1, YL + 0.05, z), (XT0 + 0.2, -0.05, zt), 0.022, WOOD)
    xs = [XTE + 0.1 + (XT0 + 0.2 - XTE - 0.1) * k / 4 for k in range(5)]
    def P(x, up):
        t = (x - XTE - 0.1) / (XT0 + 0.2 - XTE - 0.1); zz = z + (zt - z) * t
        return (x, (YU + (0.62 - YU) * t) if up else (YL + 0.05 + (-0.05 - YL - 0.05) * t), zz)
    for k in range(1, 5):                  # стойки фермы и диагонали-тросы
        F.cyl(P(xs[k], 1), P(xs[k], 0), 0.014, WOOD, sides=6)
        F.cyl(P(xs[k - 1], 1), P(xs[k], 0), 0.0028, STAL, sides=4, caps=False); F.cyl(P(xs[k - 1], 0), P(xs[k], 1), 0.0028, STAL, sides=4, caps=False)
    for k in range(1, 5):                  # поперечины между левой и правой половиной
        if z > 0: F.cyl((xs[k], P(xs[k], 1)[1], P(xs[k], 1)[2]), (xs[k], P(xs[k], 1)[1], -P(xs[k], 1)[2]), 0.012, WOOD, sides=5); \
                  F.cyl((xs[k], P(xs[k], 0)[1], P(xs[k], 0)[2]), (xs[k], P(xs[k], 0)[1], -P(xs[k], 0)[2]), 0.012, WOOD, sides=5)
plane(F, XT0, XT1, 0.62, -1.15, 1.15, 5)   # верхний и нижний стабилизатор (бипланный хвост)
plane(F, XT0, XT1, -0.05, -1.15, 1.15, 5)
for z in (-0.55, 0.55): rudder(F, XT0 - 0.35, XT1 - 0.05, -0.05, 0.62, z)   # два руля поворота
for z in (-0.55, 0.55): F.cyl((XT0 + 0.2, 0.62, z), (XT0 + 0.2, -0.05, z), 0.014, WOOD, sides=6)
# передний руль высоты на выносе
XE0, XE1, YE = 2.55, 3.35, 0.45
for z in (-0.45, 0.45):
    F.cyl((XLE, YU, z * 1.4), (XE0 + 0.15, YE + 0.02, z), 0.02, WOOD); F.cyl((XLE + 0.6, YL + 0.05, z * 1.4), (XE0 + 0.15, YE - 0.02, z), 0.02, WOOD)
    F.cyl((XLE, YU, z * 1.4), (XLE + 0.6, YL + 0.05, z * 1.4), 0.0028, STAL, sides=4, caps=False)
plane(F, XE0, XE1, YE, -1.1, 1.1, 4)
F.cyl((0.1, -0.1, 0), (XE0 + 0.1, YE - 0.02, 0), 0.006, STAL, sides=4)       # тяга руля
# сиденье лётчика на передней кромке нижнего крыла
F.box((-0.42, -0.38, 0), (0.42, 0.04, 0.42), WOOD)
F.box((-0.64, -0.12, 0), (0.04, 0.5, 0.40), WOOD, rot=(0, 0, 12))
for z in (-0.18, 0.18): F.cyl((-0.25, -0.4, z), (-0.25, YL, z), 0.018, WOOD, sides=6)
F.cyl((0.35, -0.42, -0.25), (0.35, -0.42, 0.25), 0.02, WOOD, sides=6)          # упор для ног
F.cyl((0.35, -0.42, 0), (XLE + 0.02, YL + 0.02, 0), 0.02, WOOD, sides=6)
F.cyl((0.05, -0.42, 0), (0.12, 0.25, 0), 0.014, STAL, sides=6); F.sphere((0.12, 0.27, 0), 0.03, REZ, 8, 6)   # ручка
# бак за спиной
F.cyl((-0.9, 0.55, -0.32), (-0.9, 0.55, 0.32), 0.15, STAL, sides=14)
for z in (-0.25, 0.25): F.cyl((-0.9, 0.42, z), (-0.9, YU, z), 0.012, STAL, sides=4)
# мотор «Гном» — ротативный, 7 цилиндров, на задней кромке, винт позади (толкающий)
MX, MY = XTE - 0.05, 0.28
F.cyl((MX + 0.35, MY, 0), (MX - 0.12, MY, 0), 0.07, MOT, sides=12)              # вал и картер
for k in range(7):
    a = k / 7 * 2 * math.pi; d = Vector((0, math.cos(a), math.sin(a)))
    c = Vector((MX - 0.05, MY, 0)); F.cyl(c + d * 0.08, c + d * 0.36, 0.055, MOT, sides=10)
    for r in (0.16, 0.22, 0.28): F.torus(tuple(c + d * r), 0.065, 0.01, MOT, axis=tuple(d), seg=12, sides=4)
F.cyl((MX - 0.05, MY, -0.11), (MX - 0.05, MY, 0.11), 0.1, MOT, sides=16)
for y, zz in ((YU, 0.4), (YL + 0.05, 0.4)):                                     # моторная рама
    for z in (-zz, zz): F.cyl((MX + 0.3, MY, 0), (MX + 0.1, y, z), 0.016, STAL, sides=6)
# шасси: два полоза с загнутым носом, по паре колёс со спицами на каждом
for z in (-0.9, 0.9):
    F.tube([(1.35, -0.85, z), (1.2, -1.1, z), (0.9, -1.24, z), (-0.6, -1.26, z), (-2.0, -1.24, z)], 0.035, WOOD, sides=8)
    for x in (0.7, -1.5):
        F.cyl((x, -1.24, z), (x + (0.15 if x > 0 else -0.1), YL, z * 0.95), 0.025, WOOD, sides=8)
    F.cyl((1.25, -1.0, z), (XLE + 0.1, YL, z), 0.022, WOOD, sides=8)
    F.cyl((-0.6, -1.1, z - 0.3), (-0.6, -1.1, z + 0.3), 0.02, STAL, sides=8)      # ось на резиновых шнурах
    for dz in (-0.2, 0.2): wheel(F, -0.6, -1.1, z + dz)
    F.cyl((-0.6, -1.1, z), (-0.6, -1.26, z), 0.015, REZ, sides=6)
fuz = F.object('aeroplan_fuzelyazh', smooth_angle=40)
export([fuz], 'aeroplan-fuzelyazh')
print('TRIS fuz', count_tris([fuz]))

# ── Винт: две лопасти, начало = ступица, ось вращения x ──
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
VX = MX - 0.24
Vb = Builder()
for s in (1, -1):
    vs, fs = [], []
    for i in range(9):
        t = i / 8; y = s * (0.07 + 1.05 * t); w = 0.07 + 0.09 * math.sin(math.pi * min(1, t * 1.25)) - 0.02 * t
        tw = (40 - 28 * t) * D; th = 0.03 * (1 - 0.6 * t) + 0.006
        for ux, uz in ((-th, -w), (th, -w), (th, w), (-th, w)):
            vs.append((ux * math.cos(tw) - uz * math.sin(tw) * s, y, ux * math.sin(tw) * s + uz * math.cos(tw)))
    for i in range(8):
        for k in range(4): k2 = (k + 1) % 4; fs.append((i * 4 + k, i * 4 + k2, (i + 1) * 4 + k2, (i + 1) * 4 + k))
    fs.append((3, 2, 1, 0)); fs.append((32, 33, 34, 35))
    Vb.mesh(vs, fs, WOODV)
Vb.cyl((0.06, 0, 0), (-0.06, 0, 0), 0.08, WOODV, sides=14); Vb.cyl((-0.06, 0, 0), (-0.09, 0, 0), 0.05, STAL, sides=10)
vint = Vb.object('aeroplan_vint', smooth_angle=50)
export([vint], 'aeroplan-vint')

# ── Полукрылья (начало каждого = его узел в сцене) ──
KR = {'vl': (YU, SPAN_U, 1), 'vr': (YU, SPAN_U, -1), 'nl': (YL, SPAN_L, 1), 'nr': (YL, SPAN_L, -1)}
for k, (y0, L, s) in KR.items():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o)
    B = Builder(); wing(B, s, y0, L)
    if k[0] == 'v': struts_wires(B, s)
    O = ((XLE + XTE) / 2, y0, s * L / 2); shift(B, O)
    ob = B.object('aeroplan_krylo_' + k, smooth_angle=50)
    export([ob], 'aeroplan-krylo-' + k)
    print('ORIGIN', k, [round(v, 3) for v in O], 'TRIS', count_tris([ob]))
print('VINT', VX, MY)
