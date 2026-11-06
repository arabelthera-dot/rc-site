# p544-b: Первая в мире АЭС (Обнинск, 1954) кодом в Блендере 4.2 — диорама в разрезе.
#   ~/opt/blender-run.sh --python obninsk_aes.py -- <выход.glb>
# Факты — только из карточки дня 01-21.yaml: реактор АМ уран-графитовый канальный, 5 МВт; уран стоит в каналах
# графитовой кладки, через каналы бежит вода и уносит тепло; пар — турбина — провода — общая сеть; трёхэтажное
# здание с колоннами и кирпичная труба слева (фото 1957 г.); под землёй — шахта реактора, насосы и трубопроводы
# первого контура (макет в разрезе); реакторный зал под двускатной крышей; парогенератор (тетрадь Курчатова).
# ДОПУЩЕНИЕ-реконструкция (в карточке этого нет):
#   • все размеры и пропорции; масштаб условный (1 ед. ≈ 10 м), подземная часть показана мельче настоящих 17,5 м;
#   • раскладка узлов: реактор в центре здания, насосы и парогенератор в подземелье справа от шахты,
#     машинный зал с турбиной и генератором — пристройка справа, трансформатор и ЛЭП — к посёлку;
#   • число каналов, сетка графитовых блоков, вид крышки реактора и приводов стержней — условные;
#   • турбина с открытой верхней половиной корпуса, генератор с рёбрами, вид опор ЛЭП и домов посёлка — условные;
#   • цвета: горячая нитка контура красная, обратная — тёмно-бордовая, паропровод в светлой изоляции.
# Текста на модели нет. Свет в glb не кладётся — его даёт просмотрщик.
import bpy, math, sys, os
import numpy as np
from mathutils import Vector, Matrix
sys.path.insert(0, os.path.expanduser('~/rc-wt/p544-b/tools/rc3d-blender'))
import lib
from lib import Builder, hexc

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['/tmp/pomoshchniki/p544-b/3d/21/raw.glb']
OUT = A[0]
DIR = os.path.dirname(os.path.abspath(__file__)); TEX = os.path.join(DIR, 'tex'); os.makedirs(TEX, exist_ok=True)
TAU = math.tau
lib.reset()
sc = bpy.context.scene
rng = np.random.default_rng(1954)
R = np.random.default_rng(2002)

# ── процедурные текстуры (numpy, бесшовно) ───────────────────────────────────
def shum(n, beta=2.0):
    w = rng.standard_normal((n, n)); f = np.sqrt(np.fft.fftfreq(n)[None, :] ** 2 + np.fft.fftfreq(n)[:, None] ** 2); f[0, 0] = 1
    s = np.real(np.fft.ifft2(np.fft.fft2(w) / f ** (beta / 2 + 0.5))); s -= s.min(); return s / s.max()
def ss(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def kartinka(imya, rgb):
    h, w = rgb.shape[:2]; im = bpy.data.images.new(imya, w, h, alpha=False)
    px = np.ones((h, w, 4), np.float32); px[..., :3] = np.clip(rgb, 0, 1) ** (1 / 1.5)   # ближе к sRGB, но насыщеннее
    im.pixels.foreach_set(px.ravel()); put = os.path.join(TEX, imya + '.png')
    im.filepath_raw = put; im.file_format = 'PNG'; im.save(); bpy.data.images.remove(im)
    return put
N = 512
yy, xx = np.mgrid[0:N, 0:N] / N
# штукатурка фасада: светлая, с лёгкими потёками
a, b = shum(N, 2.4), shum(N, 1.2)
t_shtuk = kartinka('shtukaturka', np.array([0.80, 0.62, 0.36]) * (0.86 + 0.18 * a[..., None]) * (1 - 0.08 * ss(0.6, 0.9, b)[..., None]))
# кирпич трубы
ryad = (yy * 16) % 1; sdv = np.floor(yy * 16) % 2 * 0.5; kol = (xx * 8 + sdv) % 1
shov = np.maximum(1 - ss(0.0, 0.07, ryad) * (1 - ss(0.93, 1.0, ryad)), 1 - ss(0.0, 0.04, kol) * (1 - ss(0.96, 1.0, kol)))
kirp = np.array([0.42, 0.16, 0.09]) * (0.75 + 0.4 * shum(N, 1.0)[..., None]) * (0.85 + 0.3 * rng.random((16, 1, 1)).repeat(N // 16, 0))
t_kirp = kartinka('kirpich', kirp * (1 - shov[..., None]) + np.array([0.55, 0.52, 0.47]) * shov[..., None])
# грунт в разрезе: слои по высоте (одна плитка = вся глубина 1,5 ед.)
v = yy[..., None]; a = shum(N, 2.0)[..., None]; volna = 0.02 * np.sin(xx[..., None] * TAU * 2)
sloi = np.where(v + volna > 0.88, [0.20, 0.13, 0.07], np.where(v + volna > 0.62, [0.42, 0.28, 0.14], np.where(v + volna > 0.35, [0.55, 0.42, 0.25], [0.36, 0.33, 0.30])))
kamni = ss(0.9, 0.95, shum(N, 0.6))[..., None]
t_grunt = kartinka('grunt', sloi * (0.8 + 0.35 * a) * (1 - kamni) + np.array([0.5, 0.48, 0.44]) * kamni)
# трава газона
a, b = shum(N, 1.6), shum(N, 0.8)
t_trava = kartinka('trava', np.array([0.16, 0.27, 0.09]) * (0.7 + 0.5 * a[..., None]) + np.array([0.08, 0.06, 0.0]) * ss(0.6, 0.8, b)[..., None])
# бетон шахты: опалубочные швы
a = shum(N, 2.2); doska = 1 - ss(0.0, 0.02, (yy * 4) % 1)
t_beton = kartinka('beton', np.array([0.52, 0.51, 0.48])[None, None] * (0.8 + 0.3 * a[..., None]) * (1 - 0.25 * doska[..., None]))
# графит: тёмные блоки с фаской
gx = np.minimum((xx * 4) % 1, 1 - (xx * 4) % 1); gy = np.minimum((yy * 4) % 1, 1 - (yy * 4) % 1)
kraj = 1 - ss(0.0, 0.05, np.minimum(gx, gy))
t_grafit = kartinka('grafit', np.array([0.10, 0.10, 0.11]) * (0.8 + 0.4 * shum(N, 2.8)[..., None]) * (1 - 0.6 * kraj[..., None]))
# кровля: листы с фальцами
falc = 1 - ss(0.0, 0.03, np.minimum((xx * 8) % 1, 1 - (xx * 8) % 1))
t_krovlya = kartinka('krovlya', np.array([0.30, 0.34, 0.31]) * (0.8 + 0.3 * shum(N, 2.0)[..., None]) * (1 - 0.35 * falc[..., None]))

def M(imya, cvet, rough=0.6, metal=0.0, tex=None, tile=1.0, emis=None):
    m = lib.mat(imya, hexc(cvet) if isinstance(cvet, str) else cvet, rough, metal, tex=tex, tile=tile)
    if emis:
        bs = m.node_tree.nodes['Principled BSDF']
        bs.inputs['Emission Color'].default_value = (*hexc(emis[0]), 1); bs.inputs['Emission Strength'].default_value = emis[1]
    return m
SH = M('shtukaturka', (1, 1, 1), 0.85, tex=t_shtuk, tile=0.8)
SH2 = M('karniz', '#efe6d2', 0.7)
KI = M('kirpich', (1, 1, 1), 0.9, tex=t_kirp, tile=0.5)
GR = M('grunt', (1, 1, 1), 0.95, tex=t_grunt, tile=1.5)
TR = M('trava', (1, 1, 1), 0.95, tex=t_trava, tile=1.2)
BE = M('beton', (1, 1, 1), 0.85, tex=t_beton, tile=0.6)
GF = M('grafit', (1, 1, 1), 0.55, 0.2, tex=t_grafit, tile=0.24)
KR = M('krovlya', (1, 1, 1), 0.6, 0.3, tex=t_krovlya, tile=0.5)
STAL = M('stal', '#8d949a', 0.35, 0.9)
STAL_T = M('stal-temnaya', '#3b4045', 0.45, 0.8)
LATUN = M('latun', '#b08a3e', 0.35, 0.9)
URAN = M('uran-teplo', '#7a2a08', 0.5, 0.0, emis=('#ff7a1c', 4.0))
KONT_G = M('kontur-goryachij', '#a3221b', 0.4, 0.3)
KONT_H = M('kontur-obratnyj', '#5a1a1d', 0.45, 0.3)
IZOL = M('izolyaciya', '#d8d4c8', 0.8)
OKRASKA = M('okraska-zelenaya', '#4d6b55', 0.45, 0.4)
STEKLO = M('steklo', '#2a3a44', 0.15, 0.6)
OKNO_SVET = M('okno-svet', '#c9a050', 0.6, emis=('#ffc46b', 1.6))
CHERN = M('chernyj', '#1d1f21', 0.6, 0.3)
KRASN = M('krasnyj-kolpak', '#b8352a', 0.5)
DEREVO = M('derevo', '#6b4a2f', 0.85)
LISTVA = M('listva', '#3f6a2c', 0.9)
KRYSHA_D = M('krysha-doma', '#7b3c2c', 0.8)
STENA_D = M('stena-doma', '#b99a6a', 0.85)
PODIUM = M('podium', '#2b2724', 0.7)
FAR = M('farfor', '#e7e9ea', 0.3)
POL = M('pol', '#8a7f72', 0.8)

UZLY = {}
def uzel(imya):
    e = bpy.data.objects.new(imya, None); sc.collection.objects.link(e)
    e['uzel'] = imya; UZLY[imya] = e; return e
def sobrat(imya, b):
    e = uzel(imya); ob = b.object(imya + '--setka', smooth_angle=40); ob.parent = e; return ob

def lathe_arc(b, prof, m, a0, a1, seg, M_=Matrix(), caps=True):
    """Тело вращения по дуге a0..a1 (ось Y); профиль — замкнутый контур сечения, торцы закрыты."""
    verts, faces = [], []; n = len(prof)
    for k in range(seg + 1):
        a = a0 + (a1 - a0) * k / seg
        for (r, y) in prof: verts.append(M_ @ Vector((r * math.cos(a), y, -r * math.sin(a))))
    for k in range(seg):
        for i in range(n):
            i2 = (i + 1) % n; faces.append((k * n + i, k * n + i2, (k + 1) * n + i2, (k + 1) * n + i))
    if caps:
        faces.append(tuple(range(n))[::-1]); faces.append(tuple(seg * n + i for i in range(n)))
    b.mesh(verts, faces, m)
def T(x, y, z): return Matrix.Translation((x, y, z))
ROT_X = Matrix.Rotation(-math.pi / 2, 4, 'Z')   # ось Y → ось X (для турбины)
def oknoset(b, x0, x1, y, z, nz, h=0.2, w=0.1, step=0.24, os_='z'):
    """Окна на стене: рама + тёмное стекло; os_ — вдоль какой оси идёт стена."""
    x = x0
    while x <= x1 + 1e-6:
        if os_ == 'z':   # стена в плоскости X-Y, нормаль ±Z
            b.box((x, y, z + nz * 0.004), (w + 0.02, h + 0.02, 0.012), SH2); b.box((x, y, z + nz * 0.011), (w, h, 0.006), STEKLO)
            b.box((x, y, z + nz * 0.015), (w, 0.008, 0.006), SH2); b.box((x, y - h / 2 - 0.012, z + nz * 0.014), (w + 0.04, 0.014, 0.024), SH2)
        else:            # стена в плоскости Z-Y, нормаль ±X
            b.box((z + nz * 0.004, y, x), (0.012, h + 0.02, w + 0.02), SH2); b.box((z + nz * 0.011, y, x), (0.006, h, w), STEKLO)
            b.box((z + nz * 0.015, y, x), (0.006, 0.008, w), SH2); b.box((z + nz * 0.014, y - h / 2 - 0.012, x), (0.024, 0.014, w + 0.04), SH2)
        x += step

# ══ РАЗМЕРЫ (ДОПУЩЕНИЕ) ══════════════════════════════════════════════════════
GX0, GX1, GZ0, GZ1 = -3.3, 3.3, -2.0, 2.0
DNO = -1.5                       # низ грунта
PX0, PX1, PZ0, PZ1 = -2.4, 0.45, -1.0, 0.9   # котлован подземелья (открыт к зрителю)
RX, RZ = -1.3, -0.3              # ось реактора
ZX0, ZX1, ZZ0, ZZ1 = -2.4, -0.2, -1.0, 0.6   # здание
ET = 0.4                         # высота этажа

# ══ 1. ЗЕМЛЯ, ПОДИУМ, ГАЗОН ═══════════════════════════════════════════════════
b = Builder()
b.rbox(((GX0 + PX1) / 2 - 0.03, DNO - 0.06, (GZ0 + PZ1) / 2), (PX1 - GX0 + 0.06, 0.12, PZ1 - GZ0 + 0.12), PODIUM, rad=0.03)
b.rbox(((PX1 + GX1) / 2 + 0.03, DNO - 0.06, (GZ0 + GZ1) / 2), (GX1 - PX1 + 0.06, 0.12, GZ1 - GZ0 + 0.12), PODIUM, rad=0.03)
for (x0, x1, z0, z1) in ((GX0, PX0, GZ0, PZ1), (PX1, GX1, GZ0, GZ1), (PX0, PX1, GZ0, PZ0)):
    b.box(((x0 + x1) / 2, (DNO - 0.0) / 2, (z0 + z1) / 2), (x1 - x0, -DNO, z1 - z0), GR)
    b.box(((x0 + x1) / 2, 0.01, (z0 + z1) / 2), (x1 - x0, 0.02, z1 - z0), TR)
b.box(((PX0 + PX1) / 2, DNO + 0.05, (PZ0 + PZ1) / 2), (PX1 - PX0, 0.1, PZ1 - PZ0), BE)            # пол подземелья
# дорожки к станции и к посёлку
b.box((-1.0, 0.025, 1.3), (0.5, 0.012, 1.4), POL) if False else None
b.box((1.25, 0.025, 1.0), (1.6, 0.012, 0.22), POL)
# деревца перед фасадом и у посёлка
for (x, z, h) in ((-3.0, 0.5, 0.45), (-2.85, -0.2, 0.55), (0.75, 1.5, 0.4), (1.9, 1.55, 0.5), (3.1, -1.6, 0.5), (-2.7, 0.72, 0.4), (2.2, 0.35, 0.42)):
    b.cyl((x, 0.0, z), (x, h * 0.55, z), 0.018, DEREVO, sides=6)
    for k in range(3):
        b.sphere((x + R.uniform(-0.04, 0.04), h * (0.6 + 0.17 * k), z + R.uniform(-0.04, 0.04)), h * (0.24 - 0.04 * k), LISTVA, seg=9, rings=6)
sobrat('zemlya', b)

# ══ 2. ЗДАНИЕ (три этажа, колонны, реакторный зал под двускатной крышей) ═════
b = Builder()
HX0, HX1 = -1.78, -0.82          # реакторный зал
HV = 1.55                        # высота стен зала
W = 0.05
b.box(((ZX0 + ZX1) / 2, 3 * ET / 2, ZZ0 + W / 2), (ZX1 - ZX0, 3 * ET, W), SH)                 # задняя стена
b.box(((HX0 + HX1) / 2, (3 * ET + HV) / 2, ZZ0 + W / 2), (HX1 - HX0, HV - 3 * ET, W), SH)    # задняя стена зала выше
for x in (ZX0 + W / 2, ZX1 - W / 2):
    b.box((x, 3 * ET / 2, (ZZ0 + ZZ1) / 2), (W, 3 * ET, ZZ1 - ZZ0), SH)                         # торцы
for x in (HX0, HX1):
    b.box((x, (HV + 0.0) / 2, (ZZ0 + ZZ1) / 2 - 0.1), (W, HV, ZZ1 - ZZ0 - 0.2), SH)              # стены зала
for (x0, x1) in ((ZX0, HX0), (HX1, ZX1)):
    for k in (1, 2, 3):
        b.box(((x0 + x1) / 2, k * ET - 0.015, (ZZ0 + ZZ1) / 2), (x1 - x0, 0.03, ZZ1 - ZZ0), POL if k < 3 else SH2)
    # крыша крыльев с карнизом и парапетом
    b.box(((x0 + x1) / 2, 3 * ET + 0.03, (ZZ0 + ZZ1) / 2), (x1 - x0 + 0.06, 0.04, ZZ1 - ZZ0 + 0.06), SH2)
    b.box(((x0 + x1) / 2, 3 * ET + 0.07, ZZ0 + 0.01), (x1 - x0 + 0.06, 0.06, 0.03), SH2)
    # перегородки, столы и шкафы приборов на этажах
    for k in (0, 1, 2):
        y = k * ET
        b.box(((x0 + x1) / 2, y + ET / 2, -0.25), (x1 - x0, ET - 0.03, 0.02), SH)
        for i in range(2):
            cx = x0 + (x1 - x0) * (0.3 + 0.4 * i)
            b.box((cx, y + 0.06, -0.55), (0.12, 0.12, 0.06), OKRASKA); b.box((cx, y + 0.1, ZZ0 + 0.08), (0.14, 0.2, 0.06), OKRASKA)
            b.box((cx, y + 0.155, ZZ0 + 0.112), (0.1, 0.04, 0.004), STEKLO)
# пульт управления на первом этаже правого крыла: дуга шкафов со шкалами
for i in range(5):
    a = -0.5 + i * 0.25; cx, cz = -0.5 + 0.22 * math.sin(a), -0.62 - 0.12 * math.cos(a)
    b.box((cx, 0.11, cz), (0.1, 0.22, 0.05), OKRASKA, rot=(0, -a / lib.D, 0))
    b.box((cx + 0.026 * math.sin(a), 0.16, cz + 0.026 * math.cos(a)), (0.08, 0.06, 0.004), FAR, rot=(0, -a / lib.D, 0))
b.box((-0.5, 0.04, -0.4), (0.3, 0.08, 0.1), OKRASKA)
# фасад: колонны портика по фронту крыльев (передняя стена снята — разрез)
for x in np.arange(ZX0 + 0.08, ZX1 - 0.02, 0.2):
    if HX0 - 0.03 < x < HX1 + 0.03: continue
    b.lathe([(0.0, 0.0), (0.04, 0.0), (0.04, 0.03), (0.03, 0.04), (0.027, 0.5), (0.03, 0.75), (0.04, 0.78), (0.04, 0.8), (0.0, 0.8)], SH2, seg=12, M=T(x, 0.02, ZZ1 + 0.06))
for (x0, x1) in ((ZX0, HX0), (HX1, ZX1)):
    b.box(((x0 + x1) / 2, 0.86, ZZ1 + 0.06), (x1 - x0, 0.08, 0.11), SH2)                     # антаблемент
    b.box(((x0 + x1) / 2, 0.01, ZZ1 + 0.08), (x1 - x0 + 0.04, 0.03, 0.2), SH2)               # крыльцо
# окна снаружи: задний фасад и торцы
oknoset(b, ZX0 + 0.14, HX0 - 0.1, 0.2, ZZ0, -1, step=0.2); oknoset(b, HX1 + 0.12, ZX1 - 0.1, 0.2, ZZ0, -1, step=0.2)
for k in (1, 2):
    oknoset(b, ZX0 + 0.14, HX0 - 0.1, 0.2 + k * ET, ZZ0, -1, step=0.2); oknoset(b, HX1 + 0.12, ZX1 - 0.1, 0.2 + k * ET, ZZ0, -1, step=0.2)
for k in range(3):
    oknoset(b, ZZ0 + 0.2, ZZ1 - 0.15, 0.2 + k * ET, ZX0, -1, step=0.25, os_='x'); oknoset(b, ZZ0 + 0.2, ZZ1 - 0.15, 0.2 + k * ET, ZX1, 1, step=0.25, os_='x')
# высокие окна зала
for x in (HX0, HX1):
    s = -1 if x == HX0 else 1
    oknoset(b, ZZ0 + 0.25, ZZ1 - 0.35, 1.37, x, s, h=0.24, w=0.12, step=0.22, os_='x')
# двускатная крыша зала: открыта спереди на половину, видны фермы
GZm = (ZZ0 + ZZ1) / 2 - 0.1; L_ = ZZ1 - ZZ0 - 0.2
kon = 0.38
for s in (-1, 1):
    ang = math.atan2(kon, (HX1 - HX0) / 2 + 0.06)
    cx = (HX0 + HX1) / 2 + s * ((HX1 - HX0) / 4 + 0.015)
    b.box((cx, HV + kon / 2, ZZ0 + L_ * 0.3), (math.hypot((HX1 - HX0) / 2 + 0.06, kon), 0.025, L_ * 0.6), KR, rot=(0, 0, -s * ang / lib.D))
for z in np.linspace(ZZ0 + 0.05, ZZ1 - 0.25, 5):   # фермы
    for s in (-1, 1):
        b.cyl(((HX0 + HX1) / 2 + s * (HX1 - HX0) / 2, HV, z), ((HX0 + HX1) / 2, HV + kon - 0.03, z), 0.012, STAL_T, sides=6)
    b.cyl((HX0, HV, z), (HX1, HV, z), 0.012, STAL_T, sides=6)
    b.cyl(((HX0 + HX1) / 2, HV, z), ((HX0 + HX1) / 2, HV + kon - 0.03, z), 0.008, STAL_T, sides=6)
# фронтон сзади
b.mesh([(HX0 - 0.03, HV, ZZ0), (HX1 + 0.03, HV, ZZ0), ((HX0 + HX1) / 2, HV + kon, ZZ0)], [(0, 1, 2)], SH)
b.mesh([(HX0 - 0.03, HV, ZZ0 + 0.04), (HX1 + 0.03, HV, ZZ0 + 0.04), ((HX0 + HX1) / 2, HV + kon, ZZ0 + 0.04)], [(0, 2, 1)], SH)
# мостовой кран в зале
b.box(((HX0 + HX1) / 2, HV - 0.08, -0.45), (HX1 - HX0 - 0.06, 0.05, 0.07), M('kran', '#c79a2a', 0.5, 0.3))
b.box(((HX0 + HX1) / 2 + 0.1, HV - 0.13, -0.45), (0.1, 0.06, 0.1), STAL_T)
b.cyl(((HX0 + HX1) / 2 + 0.1, HV - 0.16, -0.45), ((HX0 + HX1) / 2 + 0.1, 0.55, -0.45), 0.004, STAL_T, sides=4)
b.torus(((HX0 + HX1) / 2 + 0.1, 0.53, -0.45), 0.02, 0.006, STAL, axis=(0, 0, 1), seg=10, sides=5)
# подземелье: бетонная облицовка котлована и перекрытие над ним
b.box((PX0 + 0.03, (DNO + 0.0) / 2, (PZ0 + PZ1) / 2), (0.06, -DNO, PZ1 - PZ0), BE)
b.box((PX1 - 0.03, (DNO + 0.0) / 2, (PZ0 + PZ1) / 2), (0.06, -DNO, PZ1 - PZ0), BE)
b.box(((PX0 + PX1) / 2, DNO / 2, PZ0 + 0.03), (PX1 - PX0, -DNO, 0.06), BE)
for (x0, x1, z0, z1) in ((PX0, HX0, PZ0, PZ1), (HX1, PX1, PZ0, PZ1), (HX0, HX1, PZ0, RZ)):   # плита пола; под залом передняя половина вырезана — виден реактор
    b.box(((x0 + x1) / 2, -0.04, (z0 + z1) / 2), (x1 - x0, 0.08, z1 - z0), BE)
b.box(((PX0 + PX1) / 2, -0.75, -0.6), (PX1 - PX0 - 0.1, 0.03, 0.75), POL)                    # промежуточный ярус
for x in (-2.2, -0.05):   # лестницы между ярусами
    for i in range(10):
        b.box((x, -1.4 + i * 0.065, -0.65 + i * 0.05), (0.12, 0.012, 0.05), STAL_T)
sobrat('zdanie', b)

# ══ 3. ТРУБА (кирпичная, слева) ═══════════════════════════════════════════════
b = Builder()
tx, tz = -2.95, -1.35
b.box((tx, 0.1, tz), (0.42, 0.2, 0.42), BE)
b.lathe([(0.0, 0.2), (0.17, 0.2), (0.105, 2.65), (0.0, 2.65)], KI, seg=20, M=T(tx, 0, tz))
for y in (0.7, 1.3, 1.9, 2.4):
    rr = 0.17 - (0.065) * (y - 0.2) / 2.45
    b.torus((tx, y, tz), rr + 0.006, 0.01, STAL_T, seg=20, sides=5)
b.lathe([(0.08, 2.6), (0.125, 2.6), (0.13, 2.72), (0.12, 2.75), (0.08, 2.75)], KI, seg=20, M=T(tx, 0, tz))
b.lathe([(0.075, 2.75), (0.075, 2.5)], CHERN, seg=16, M=T(tx, 0, tz))
for i in range(36):   # скобы лестницы
    y = 0.3 + i * 0.065; rr = 0.17 - 0.065 * (y - 0.2) / 2.45
    b.torus((tx + rr + 0.03, y, tz), 0.025, 0.004, STAL_T, axis=(0, 1, 0), seg=8, sides=4, arc=180)
# газоход от здания к трубе
b.tube([(ZX0, 0.15, -0.8), (tx + 0.15, 0.15, -0.8), (tx, 0.15, tz + 0.2)], 0.045, BE, sides=10)
sobrat('truba', b)

# ══ 4. РЕАКТОР: шахта, графитовая кладка с каналами, крышка с головками ═════
b = Builder()
YB, YT = -1.25, -0.42            # кладка
RG = 0.36
PITCH = 0.06
# бетонная шахта — задняя половина (передняя срезана)
lathe_arc(b, [(0.44, DNO + 0.1), (0.58, DNO + 0.1), (0.58, -0.08), (0.44, -0.08)], BE, 0, math.pi, 24, T(RX, 0, RZ))
lathe_arc(b, [(0.40, YB - 0.1), (0.44, YB - 0.1), (0.44, YT + 0.25), (0.40, YT + 0.25)], STAL_T, 0, math.pi, 24, T(RX, 0, RZ))   # стальной кожух
# опорная плита и нижняя плита с выводами каналов
lathe_arc(b, [(0.0, YB - 0.1), (0.40, YB - 0.1), (0.40, YB - 0.02), (0.0, YB - 0.02)], STAL, 0, math.pi, 24, T(RX, 0, RZ))
# кладка: колонны графитовых блоков задней половины, разрез по плоскости z = RZ
kanaly = []
for i in range(-7, 8):
    for j in range(-7, 8):
        x, z = i * PITCH, j * PITCH
        if x * x + z * z > RG * RG: continue
        kanaly.append((x, z))
        if z > PITCH * 0.01: continue
        hz = PITCH - 0.004 if z < -1e-6 else PITCH / 2 - 0.002
        cz = z if z < -1e-6 else -PITCH / 4
        for k in range(7):
            yb = YB + k * (YT - YB) / 7
            b.box((RX + x, yb + (YT - YB) / 14, RZ + cz), (PITCH - 0.004, (YT - YB) / 7 - 0.004, hz), GF)
        # канал в колонне: стальная трубка, на срезе — урановый стержень с теплом
        if abs(z) < 1e-6:
            b.cyl((RX + x, YB, RZ + 0.004), (RX + x, YT + 0.32, RZ + 0.004), 0.011, STAL, sides=10)
            b.cyl((RX + x, YB + 0.12, RZ + 0.006), (RX + x, YT - 0.12, RZ + 0.006), 0.0075, URAN, sides=8)
            b.cyl((RX + x, YB + 0.12, RZ + 0.018), (RX + x, YT - 0.12, RZ + 0.018), 0.0035, URAN, sides=6)
# верхняя защитная плита (половина) и плита крышки с каналами над ней
lathe_arc(b, [(0.0, YT + 0.02), (0.40, YT + 0.02), (0.40, YT + 0.2), (0.0, YT + 0.2)], BE, 0, math.pi, 24, T(RX, 0, RZ))
lathe_arc(b, [(0.0, YT + 0.2), (0.40, YT + 0.2), (0.40, YT + 0.24), (0.0, YT + 0.24)], STAL, 0, math.pi, 24, T(RX, 0, RZ))
# каналы задней половины уходят вверх к крышке
for (x, z) in kanaly:
    if -1e-6 > z:
        b.cyl((RX + x, YT + 0.24, RZ + z), (RX + x, -0.08, RZ + z), 0.008, STAL, sides=6)
# крышка реактора в полу зала: круг, головки каналов, приводы стержней
lathe_arc(b, [(0.0, -0.02), (0.56, -0.02), (0.58, 0.0), (0.58, 0.04), (0.5, 0.05), (0.0, 0.05)], STAL_T, 0, math.pi, 24, T(RX, 0, RZ))   # крышка — задняя половина (разрез)
def poludug(y, r, t, m, n=20):   # дуга задней половины (z <= RZ)
    b.tube([(RX + r * math.cos(math.pi * i / n), y, RZ - r * math.sin(math.pi * i / n)) for i in range(n + 1)], t, m, sides=6)
poludug(0.045, 0.53, 0.012, LATUN)
for (x, z) in kanaly:
    p = Vector((RX + x, 0.05, RZ + z))
    if z > 1e-6: continue
    stern = (abs(x / PITCH) % 3 == 0 and abs(z / PITCH) % 3 == 0) and (x, z) != (0, 0)
    if stern:   # привод регулирующего стержня — высокий, с красным колпаком
        b.cyl(p, p + Vector((0, 0.16, 0)), 0.014, STAL, sides=10)
        b.lathe([(0.0, 0.0), (0.019, 0.0), (0.019, 0.03), (0.012, 0.045), (0.0, 0.05)], KRASN, seg=10, M=T(p.x, p.y + 0.16, p.z))
    else:       # головка канала: стакан, фланец, колпак, отвод трубки
        b.lathe([(0.0, 0.0), (0.017, 0.0), (0.017, 0.008), (0.012, 0.01), (0.012, 0.05), (0.016, 0.052), (0.016, 0.062), (0.008, 0.07), (0.0, 0.07)], STAL, seg=10, M=T(p.x, p.y, p.z))
# центральный канал — главный, с латунным колпаком
b.lathe([(0.0, 0.0), (0.03, 0.0), (0.03, 0.1), (0.02, 0.13), (0.0, 0.13)], LATUN, seg=16, M=T(RX, 0.05, RZ))
# ограждение крышки и площадка
for i in range(9):
    a = math.pi + math.pi * i / 8; p = Vector((RX + 0.68 * math.cos(a), 0.0, RZ + 0.68 * math.sin(a)))
    b.cyl(p, p + Vector((0, 0.18, 0)), 0.006, STAL_T, sides=5)
poludug(0.18, 0.68, 0.007, KRASN)
poludug(0.1, 0.68, 0.005, STAL_T)
sobrat('reaktor', b)

# ══ 5. КОНТУР: трубы с водой, насосы, парогенератор ══════════════════════════
b = Builder()
SGX, SGZ = 0.08, -0.45
# горячая нитка: из верхней части кладки (по задней половине) — к парогенератору
for k, dz in enumerate((-0.18, -0.30)):
    b.tube([(RX + 0.42, YT + 0.12, RZ + dz), (-0.55, YT + 0.12, RZ + dz), (-0.3, YT + 0.12, SGZ + 0.05 * k), (SGX - 0.16, YT + 0.05, SGZ + 0.05 * k)], 0.03, KONT_G, sides=12)
# обратная нитка: от низа парогенератора через насосы — в низ реактора
for k, (px, pz) in enumerate(((-0.45, -0.15), (-0.45, -0.75))):
    b.tube([(SGX, -1.3, SGZ), (SGX - 0.1, -1.3, pz), (px + 0.1, -1.3, pz)], 0.026, KONT_H, sides=12)
    b.tube([(px - 0.1, -1.3, pz), (RX + 0.48, -1.3, pz), (RX + 0.38, -1.3, RZ + (pz - RZ) * 0.3)], 0.026, KONT_H, sides=12)
    # насос: корпус-улитка, фланцы, мотор
    b.lathe([(0.0, -1.42), (0.07, -1.42), (0.09, -1.36), (0.09, -1.26), (0.06, -1.22), (0.0, -1.22)], STAL_T, seg=20, M=T(px, 0, pz))
    b.lathe([(0.0, -1.22), (0.05, -1.22), (0.055, -1.2), (0.055, -1.04), (0.05, -1.02), (0.0, -1.02)], OKRASKA, seg=20, M=T(px, 0, pz))
    for i in range(12):
        a = TAU * i / 12
        b.box((px + 0.058 * math.cos(a), -1.12, pz + 0.058 * math.sin(a)), (0.008, 0.15, 0.008), OKRASKA)
    for dx in (-0.1, 0.1):
        b.cyl((px + dx * 0.9, -1.3, pz), (px + dx * 1.1, -1.3, pz), 0.04, STAL, sides=12)
# парогенератор: вертикальный сосуд с днищами, фланцами, люками; разрез сбоку показывает трубный пучок
PG = [(0.0, -1.42), (0.06, -1.41), (0.1, -1.37), (0.12, -1.3), (0.12, -0.5), (0.135, -0.49), (0.135, -0.46), (0.12, -0.45),
      (0.12, -0.3), (0.1, -0.22), (0.06, -0.18), (0.0, -0.17)]
lathe_arc(b, [(r, y) for r, y in PG] + [(max(r - 0.012, 0.0), y) for r, y in PG[::-1]], OKRASKA, 0.0, TAU * 0.75, 30, T(SGX, 0, SGZ), caps=True)
for i in range(9):          # трубки внутри: видны в вырезанной четверти
    a = -math.pi / 2 * (i / 8); rr = 0.03 + 0.07 * ((i * 37) % 9) / 9
    b.cyl((SGX + rr * math.cos(a), -1.3, SGZ - rr * math.sin(a)), (SGX + rr * math.cos(a), -0.48, SGZ - rr * math.sin(a)), 0.007, LATUN, sides=6)
for y in (-1.15, -0.8):
    b.torus((SGX, y, SGZ), 0.125, 0.008, STAL_T, seg=30, sides=5)
b.cyl((SGX + 0.12, -0.95, SGZ), (SGX + 0.17, -0.95, SGZ), 0.04, STAL, sides=12)   # люк
# опоры
for dx in (-0.1, 0.1):
    b.box((SGX + dx, -1.44, SGZ), (0.03, 0.06, 0.2), STAL_T)
sobrat('kontur', b)

# ══ 6. ПАРОПРОВОД → ТУРБИНА (машинный зал справа) ════════════════════════════
b = Builder()
MX0, MX1, MZ0, MZ1 = 0.6, 2.1, -1.1, 0.25
TY_, TZ = 0.32, -0.45
TX0, TX1 = 0.75, 1.38
# паропровод в изоляции с бандажами и задвижкой
put = [(SGX, -0.17, SGZ), (SGX, 0.25, SGZ), (SGX + 0.15, 0.55, SGZ), (TX0 + 0.12, 0.55, SGZ), (TX0 + 0.15, TY_ + 0.12, TZ)]
b.tube(put, 0.034, IZOL, sides=12)
for t in np.linspace(0.1, 0.9, 9):
    pass
for p in ((SGX, 0.0, SGZ), (SGX, 0.15, SGZ), (0.4, 0.55, SGZ), (0.55, 0.55, SGZ)):
    b.torus(p, 0.036, 0.006, STAL_T, axis=(0, 1, 0) if p[1] < 0.3 else (1, 0, 0), seg=14, sides=4)
# задвижка подачи пара на турбину (с маховиком)
zx = 0.68
b.box((zx, 0.55, SGZ), (0.08, 0.1, 0.1), OKRASKA)
b.cyl((zx, 0.6, SGZ), (zx, 0.72, SGZ), 0.008, STAL, sides=6)
b.torus((zx, 0.72, SGZ), 0.05, 0.007, KRASN, axis=(0, 1, 0), seg=18, sides=6)
for i in range(4):
    a = TAU * i / 4; b.cyl((zx, 0.72, SGZ), (zx + 0.05 * math.cos(a), 0.72, SGZ + 0.05 * math.sin(a)), 0.004, KRASN, sides=4)
# турбина: нижняя половина корпуса, ротор с дисками лопаток, вал
TP = [(0.10, 0.0), (0.12, 0.0), (0.12, 0.03), (0.13, 0.03), (0.15, 0.3), (0.19, 0.5), (0.2, 0.53), (0.21, 0.53), (0.21, 0.63), (0.10, 0.63)]
MT = T(TX0 - 0.0, TY_, TZ) @ ROT_X
lathe_arc(b, TP, STAL_T, math.pi, TAU, 24, MT)          # нижняя половина (к полу)
lathe_arc(b, TP, OKRASKA, 0.0, math.pi * 0.35, 10, MT)  # кусок верхней крышки сзади — снята для показа
# горизонтальный разъём — фланец с болтами
for s in (-1, 1):
    b.box(((TX0 + TX1) / 2 - 0.0, TY_, TZ + s * 0.19), (TX1 - TX0 - 0.03, 0.02, 0.06), STAL_T)
    for x in np.linspace(TX0 + 0.04, TX1 - 0.04, 9):
        b.cyl((x, TY_ + 0.01, TZ + s * 0.2), (x, TY_ + 0.03, TZ + s * 0.2), 0.006, STAL, sides=6)
b.cyl((TX0 - 0.15, TY_, TZ), (TX1 + 0.6, TY_, TZ), 0.025, STAL, sides=14)       # вал
nd = 9
for k in range(nd):
    x = TX0 + 0.06 + k * (TX1 - TX0 - 0.1) / (nd - 1)
    r0 = 0.045; r1 = 0.09 + 0.09 * k / (nd - 1)
    b.cyl((x - 0.012, TY_, TZ), (x + 0.012, TY_, TZ), r0, STAL, sides=16)
    nl = 28
    for i in range(nl):
        a = TAU * i / nl + k * 0.1
        u = Vector((0, math.cos(a), math.sin(a))); p0 = Vector((x, TY_, TZ)) + u * r0; p1 = Vector((x, TY_, TZ)) + u * r1
        tw = Vector((0, -math.sin(a), math.cos(a)))
        c = (p0 + p1) / 2; h = (r1 - r0) / 2; w = 0.012; d = 0.0025
        # лопатка: тонкая повёрнутая пластинка
        ax_ = (Vector((1, 0, 0)) * 0.7 + tw * 0.7).normalized(); nn = u.cross(ax_).normalized()
        vs = [c + u * su * h + ax_ * sa * w + nn * sn * d for su in (-1, 1) for sa in (-1, 1) for sn in (-1, 1)]
        b.mesh(vs, [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)], LATUN if k % 2 else STAL)
    b.torus((x, TY_, TZ), r1, 0.004, STAL, axis=(1, 0, 0), seg=28, sides=4)
# подшипники и рама
for x in (TX0 - 0.08, TX1 + 0.05, TX1 + 0.55):
    b.rbox((x, TY_ - 0.06, TZ), (0.08, 0.1, 0.12), OKRASKA, rad=0.01)
    b.box((x, TY_ - 0.17, TZ), (0.1, 0.14, 0.14), BE)
b.box(((TX0 + TX1) / 2, 0.07, TZ), (TX1 - TX0 + 0.1, 0.14, 0.42), BE)            # фундамент турбины
b.box(((TX0 + TX1) / 2, 0.12, TZ + 0.3), (TX1 - TX0, 0.16, 0.12), STAL_T)         # конденсатор
# машинный зал: пол, задняя стена с окнами, торец, колонны, фермы и половина кровли
b.box(((MX0 + MX1) / 2, 0.035, (MZ0 + MZ1) / 2), (MX1 - MX0, 0.03, MZ1 - MZ0), POL)
b.box(((MX0 + MX1) / 2, 0.45, MZ0 + 0.025), (MX1 - MX0, 0.9, 0.05), SH)
b.box((MX1 - 0.025, 0.45, (MZ0 + MZ1) / 2), (0.05, 0.9, MZ1 - MZ0), SH)
oknoset(b, MX0 + 0.15, MX1 - 0.15, 0.55, MZ0, -1, h=0.3, w=0.14, step=0.22)
oknoset(b, MZ0 + 0.2, MZ1 - 0.2, 0.55, MX1, 1, h=0.3, w=0.14, step=0.22, os_='x')
for x in np.linspace(MX0 + 0.05, MX1 - 0.05, 5):
    b.box((x, 0.45, MZ1), (0.05, 0.9, 0.05), SH2)
    b.cyl((x, 0.92, MZ0), (x, 0.92, MZ1), 0.012, STAL_T, sides=6)
    b.cyl((x, 0.92, MZ0), (x, 1.05, (MZ0 + MZ1) / 2), 0.009, STAL_T, sides=6)
    b.cyl((x, 0.92, MZ1), (x, 1.05, (MZ0 + MZ1) / 2), 0.009, STAL_T, sides=6)
b.box(((MX0 + MX1) / 2, 0.9, MZ1), (MX1 - MX0, 0.04, 0.06), SH2)
ang = math.atan2(0.13, (MZ1 - MZ0) / 2)
b.box(((MX0 + MX1) / 2, 0.98, MZ0 + (MZ1 - MZ0) / 4), (MX1 - MX0 + 0.06, 0.02, (MZ1 - MZ0) / 2 / math.cos(ang) + 0.04), KR, rot=(-ang / lib.D, 0, 0))
sobrat('turbina', b)

# ══ 7. ГЕНЕРАТОР ═════════════════════════════════════════════════════════════
b = Builder()
GX0_, GX1_ = TX1 + 0.12, TX1 + 0.5
MG = T(GX0_, TY_, TZ) @ ROT_X
b.lathe([(0.0, 0.0), (0.14, 0.0), (0.15, 0.02), (0.15, GX1_ - GX0_ - 0.02), (0.14, GX1_ - GX0_), (0.0, GX1_ - GX0_)], OKRASKA, seg=28, M=MG)
for k in range(10):
    x = GX0_ + 0.03 + k * (GX1_ - GX0_ - 0.06) / 9
    b.torus((x, TY_, TZ), 0.152, 0.009, STAL_T, axis=(1, 0, 0), seg=28, sides=5)
b.box(((GX0_ + GX1_) / 2, TY_ - 0.13, TZ), (GX1_ - GX0_ + 0.06, 0.08, 0.36), STAL_T)  # лапы
b.lathe([(0.0, 0.0), (0.07, 0.0), (0.07, 0.12), (0.0, 0.12)], STAL_T, seg=18, M=T(GX1_ + 0.02, TY_, TZ) @ ROT_X)  # возбудитель
# выводы тока: шины к трансформатору
for dz in (-0.05, 0.0, 0.05):
    b.tube([((GX0_ + GX1_) / 2, TY_ + 0.15, TZ + dz), ((GX0_ + GX1_) / 2, 0.75, TZ + dz), (2.3, 0.75, TZ + dz), (2.3, 0.45, -0.9 + dz)], 0.009, LATUN, sides=6)
sobrat('generator', b)

# ══ 8. ЛЭП: трансформатор, опоры, провода к посёлку ══════════════════════════
b = Builder()
trx, trz = 2.35, -0.9
b.box((trx, 0.06, trz), (0.4, 0.12, 0.35), BE)
b.rbox((trx, 0.27, trz), (0.26, 0.3, 0.2), OKRASKA, rad=0.015)
for i in range(9):   # рёбра радиатора
    b.box((trx - 0.12 + i * 0.03, 0.26, trz + 0.13), (0.008, 0.24, 0.06), OKRASKA)
    b.box((trx - 0.12 + i * 0.03, 0.26, trz - 0.13), (0.008, 0.24, 0.06), OKRASKA)
b.cyl((trx + 0.05, 0.42, trz - 0.05), (trx + 0.05, 0.47, trz - 0.05), 0.06, OKRASKA, sides=14)   # расширитель
for dx in (-0.08, 0.0, 0.08):     # вводы-изоляторы
    p = Vector((trx + dx, 0.42, trz + 0.05))
    b.lathe([(0.0, 0.0), (0.02, 0.0)] + sum([[(0.028, 0.02 + 0.03 * i), (0.016, 0.035 + 0.03 * i)] for i in range(4)], []) + [(0.012, 0.16), (0.0, 0.16)], FAR, seg=10, M=T(*p))
def opora(x, z, h, rot):
    """Решётчатая опора: четыре пояса, раскосы, траверса с гирляндами изоляторов."""
    ca, sa = math.cos(rot), math.sin(rot)
    def P(lx, y, lz): return Vector((x + lx * ca - lz * sa, y, z + lx * sa + lz * ca))
    nizh, verh = 0.1, 0.035
    ug = [(-1, -1), (1, -1), (1, 1), (-1, 1)]
    for sx, sz in ug:
        b.cyl(P(sx * nizh, 0.02, sz * nizh), P(sx * verh, h, sz * verh), 0.006, STAL_T, sides=4)
    nseg = 6
    for k in range(nseg):
        y0, y1 = 0.02 + h * k / nseg, 0.02 + h * (k + 1) / nseg
        w0 = nizh + (verh - nizh) * k / nseg; w1 = nizh + (verh - nizh) * (k + 1) / nseg
        for i in range(4):
            (ax, az), (bx, bz) = ug[i], ug[(i + 1) % 4]
            b.cyl(P(ax * w0, y0, az * w0), P(bx * w1, y1, bz * w1), 0.0035, STAL_T, sides=4)
            b.cyl(P(ax * w1, y1, az * w1), P(bx * w1, y1, bz * w1), 0.0035, STAL_T, sides=4)
    for y, L in ((h - 0.02, 0.2), (h - 0.14, 0.15)):
        b.cyl(P(-L, y, 0), P(L, y, 0), 0.007, STAL_T, sides=4)
    tochki = []
    for (lx, y) in ((-0.2, h - 0.02), (0.2, h - 0.02), (-0.15, h - 0.14), (0.15, h - 0.14)):
        p = P(lx, y, 0)
        for i in range(4):
            b.sphere(p - Vector((0, 0.015 + 0.018 * i, 0)), 0.012, FAR, seg=8, rings=4, scale=(1, 0.5, 1))
        tochki.append(p - Vector((0, 0.08, 0)))
    return tochki
O = [opora(2.55, -0.55, 0.95, 0.9), opora(2.8, 0.2, 0.9, 1.2), opora(2.95, 0.95, 0.85, 1.5)]
start = [Vector((trx + dx, 0.58, trz + 0.05)) for dx in (-0.08, 0.0, 0.08, 0.08)]
def provod(p, q, provis):
    pts = [p.lerp(q, t) - Vector((0, provis * 4 * t * (1 - t), 0)) for t in np.linspace(0, 1, 14)]
    b.tube(pts, 0.0035, CHERN, sides=4, caps=False)
for i in range(3):
    provod(start[i], O[0][i], 0.04)
for a_, c_ in zip(O, O[1:]):
    for i in range(4):
        provod(a_[i], c_[i], 0.06)
sobrat('lep', b)

# ══ 9. ПОСЁЛОК: дома с горящими окнами, столб с проводом в дом ═══════════════
b = Builder()
doma = [(2.35, 1.1, 0.0), (2.8, 1.55, 0.3), (3.0, -1.1, 1.3), (2.05, 1.65, -0.2), (1.55, 0.7, 0.1)]
for (x, z, r) in doma:
    w, d, h = 0.32, 0.24, 0.2
    rd = r / lib.D
    b.box((x, h / 2 + 0.02, z), (w, h, d), STENA_D, rot=(0, rd, 0))
    ca, sa = math.cos(r), math.sin(r)
    def P(lx, y, lz): return (x + lx * ca + lz * sa, y, z - lx * sa + lz * ca)
    # двускатная крыша
    vs = [P(-w / 2 - 0.03, h + 0.02, -d / 2 - 0.04), P(w / 2 + 0.03, h + 0.02, -d / 2 - 0.04), P(w / 2 + 0.03, h + 0.15, 0), P(-w / 2 - 0.03, h + 0.15, 0),
          P(-w / 2 - 0.03, h + 0.02, d / 2 + 0.04), P(w / 2 + 0.03, h + 0.02, d / 2 + 0.04)]
    b.mesh(vs, [(0, 1, 2, 3), (3, 2, 5, 4)], KRYSHA_D)
    vs2 = [P(-w / 2 - 0.03, h + 0.005, -d / 2 - 0.04), P(w / 2 + 0.03, h + 0.005, -d / 2 - 0.04), P(w / 2 + 0.03, h + 0.135, 0), P(-w / 2 - 0.03, h + 0.135, 0),
           P(-w / 2 - 0.03, h + 0.005, d / 2 + 0.04), P(w / 2 + 0.03, h + 0.005, d / 2 + 0.04)]
    b.mesh(vs2, [(3, 2, 1, 0), (4, 5, 2, 3)], KRYSHA_D)
    for s in (-1, 1):   # фронтоны
        b.mesh([P(s * w / 2, h + 0.02, -d / 2), P(s * w / 2, h + 0.02, d / 2), P(s * w / 2, h + 0.14, 0)], [(0, 1, 2) if s > 0 else (2, 1, 0)], STENA_D)
    b.box(P(0.08, h + 0.17, 0.05), (0.04, 0.12, 0.04), KI, rot=(0, rd, 0))
    # окна светятся: ток пришёл
    for lx in (-0.08, 0.08):
        for s in (-1, 1):
            b.box(P(lx, 0.12, s * (d / 2 + 0.003)), (0.06, 0.07, 0.008), OKNO_SVET, rot=(0, rd, 0))
            b.box(P(lx, 0.12, s * (d / 2 + 0.006)), (0.075, 0.085, 0.004), DEREVO, rot=(0, rd, 0)) if False else None
            b.box(P(lx, 0.12, s * (d / 2 + 0.008)), (0.006, 0.07, 0.006), DEREVO, rot=(0, rd, 0))
            b.box(P(lx, 0.08, s * (d / 2 + 0.01)), (0.08, 0.008, 0.02), DEREVO, rot=(0, rd, 0))
    b.box(P(0.0, 0.08, d / 2 + 0.003), (0.05, 0.12, 0.008), DEREVO, rot=(0, rd, 0)) if False else None
# изгороди
for (x0, z0, x1, z1) in ((1.4, 1.95, 3.25, 1.95), (3.25, 0.5, 3.25, 1.95)):
    n = int(math.hypot(x1 - x0, z1 - z0) / 0.06)
    for i in range(n + 1):
        t = i / n; b.box((x0 + (x1 - x0) * t, 0.06, z0 + (z1 - z0) * t), (0.012, 0.1, 0.012), DEREVO)
    for y in (0.04, 0.09):
        b.cyl((x0, y, z0), (x1, y, z1), 0.004, DEREVO, sides=4)
# деревянный столб у домов: провода от последней опоры
st = Vector((2.55, 0.0, 1.35))
b.cyl(st, st + Vector((0, 0.5, 0)), 0.012, DEREVO, sides=6)
b.cyl(st + Vector((-0.08, 0.47, 0)), st + Vector((0.08, 0.47, 0)), 0.008, DEREVO, sides=4)
for dx in (-0.06, 0.06):
    b.sphere(st + Vector((dx, 0.49, 0)), 0.01, FAR, seg=6, rings=4)
for i, (dx, dom) in enumerate(((-0.06, doma[0]), (0.06, doma[1]))):
    p = st + Vector((dx, 0.49, 0)); q = Vector((dom[0], 0.2, dom[1]))
    pts = [p.lerp(q, t) - Vector((0, 0.03 * 4 * t * (1 - t), 0)) for t in np.linspace(0, 1, 10)]
    b.tube(pts, 0.003, CHERN, sides=4, caps=False)
p = O[2][2]; q = st + Vector((0, 0.49, 0))
b.tube([p.lerp(q, t) - Vector((0, 0.05 * 4 * t * (1 - t), 0)) for t in np.linspace(0, 1, 12)], 0.003, CHERN, sides=4, caps=False)
sobrat('posyolok', b)

# ── экспорт ─────────────────────────────────────────────────────────────────
tri = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH':
        ob.data.calc_loop_triangles(); tri += len(ob.data.loop_triangles)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=True, export_extras=True,
                          export_image_format='JPEG', export_materials='EXPORT', export_tangents=False, export_lights=False,
                          export_cameras=False, export_animations=False)
print('GLB', OUT, os.path.getsize(OUT), 'байт, треугольников', tri, 'узлы', list(UZLY))
