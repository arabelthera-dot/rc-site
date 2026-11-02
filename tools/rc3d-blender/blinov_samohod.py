# r593-09: паровой гусеничный «самоход» Ф. А. Блинова (1888) кодом в Блендере 4.2 — музейная диорама.
#   ~/opt/blender-run.sh -b --python blinov_samohod.py -- <выход.glb>
# Факты — только из карточки дня 01-09.yaml. Чего там нет (размеры, раскладка узлов) — ДОПУЩЕНИЕ-реконструкция:
#   • две гусеницы из звеньев («бесконечные рельсы»): плита с почвозацепом, изнутри — два отрезка рельса, по которым
#     катятся опорные катки; большие спицевые колёса спереди и сзади (как на картине К. П. Белова 1947 г.);
#   • вертикальный котёл с высокой трубой посередине (картина Белова: котёл и труба с дымом);
#   • две паровые машины — каждая ведёт свою гусеницу (факт 1 карточки: «каждую гусеницу вела своя паровая машина»),
#     коленвал разрезан посередине; передача на ведущее колесо — цепью (допущение);
#   • место машиниста сзади с двумя рычагами-регуляторами (по одному на машину; поворот — выключением одной);
#   • деревянная рама и настил, бочка воды, поленница; дорога с колеёй: впереди — глубокие колёсные колеи с водой,
#     позади — плоский след гусениц.
# Масштаб — примерно 1 ед. = 1 м (допущение). Свет в glb не кладётся — его даёт просмотрщик.
import bpy, bmesh, math, sys, os
import numpy as np
from mathutils import Vector, Matrix

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['/tmp/pomoshchniki/r593-3d-mashiny-v2/09/raw.glb']
OUT = A[0]
DIR = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(DIR, 'tex'); os.makedirs(TEX, exist_ok=True)
TAU = math.tau

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
rng = np.random.default_rng(1888)
R = np.random.default_rng(2245)          # для расстановки мелочей

# ── шумы и текстуры (numpy, бесшовно через БПФ) ────────────────────────────────────────────────────────
def shum(n, beta=2.0, m=None):
    m = m or n
    w = rng.standard_normal((m, n))
    fy = np.fft.fftfreq(m)[:, None]; fx = np.fft.fftfreq(n)[None, :]
    f = np.sqrt(fx * fx + fy * fy); f[0, 0] = 1
    s = np.real(np.fft.ifft2(np.fft.fft2(w) / f ** (beta / 2 + 0.5)))
    s -= s.min(); return s / s.max()
def ss(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def normal_iz(h, k):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * k; dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * k
    n = np.dstack([-dx, -dy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return n * 0.5 + 0.5
def kartinka(imya, rgb, noncolor=False):
    h, w = rgb.shape[:2]
    im = bpy.data.images.new(imya, w, h, alpha=False)
    px = np.ones((h, w, 4), np.float32); px[..., :3] = np.clip(rgb, 0, 1)
    im.pixels.foreach_set(px.ravel())
    put = os.path.join(TEX, imya + '.png'); im.filepath_raw = put; im.file_format = 'PNG'; im.save()
    bpy.data.images.remove(im)
    im = bpy.data.images.load(put)
    if noncolor: im.colorspace_settings.name = 'Non-Color'
    return im
def zagruzit(imya, nc=False):
    im = bpy.data.images.load(os.path.join(TEX, imya))
    if nc: im.colorspace_settings.name = 'Non-Color'
    return im

def tex_kraska(n=512, baza=(0.16, 0.22, 0.19)):   # котёл/машины: серо-зелёная краска, сколы, копоть
    a, b, g = shum(n, 2.0), shum(n, 2.8), shum(n, 0.5)
    skol = ss(0.80, 0.87, a * 0.6 + g * 0.4)
    kr = np.array(baza) * (0.78 + 0.4 * b[..., None])
    col = kr * (1 - skol[..., None]) + np.array([0.20, 0.19, 0.18]) * skol[..., None]
    rough = 0.42 + 0.2 * b + 0.1 * skol; metal = 0.85 * skol
    return col, np.dstack([np.ones_like(a), rough, metal]), normal_iz(0.3 * g + 0.3 * b + 0.6 * skol, 2.0)
def tex_chugun(n=512):     # чугун и железо ходовой: окалина, ржавые подтёки, присохшая грязь
    a, b, c = shum(n, 2.2), shum(n, 3.0), shum(n, 1.2)
    rzh = ss(0.55, 0.78, a * 0.7 + c * 0.3)
    okal = np.array([0.13, 0.125, 0.12]) * (0.75 + 0.5 * b[..., None])
    rcol = np.array([0.33, 0.17, 0.08]) * (0.6 + 0.6 * c[..., None])
    col = okal * (1 - rzh[..., None]) + rcol * rzh[..., None]
    rough = 0.45 + 0.15 * b + 0.3 * rzh; metal = 0.8 * (1 - rzh) + 0.1
    return col, np.dstack([np.ones_like(a), rough, metal]), normal_iz(0.6 * b + 1.2 * rzh * c, 3.0)
def tex_gusenica(n=512):   # звенья: тёмное железо, грязь, натёртые до блеска кромки — по шуму
    a, b, c = shum(n, 2.0), shum(n, 3.0), shum(n, 1.0)
    gr = ss(0.45, 0.7, a)
    zhel = np.array([0.16, 0.15, 0.14]) * (0.8 + 0.4 * b[..., None])
    gcol = np.array([0.24, 0.17, 0.11]) * (0.7 + 0.5 * c[..., None])
    col = zhel * (1 - gr[..., None]) + gcol * gr[..., None]
    rough = 0.40 + 0.5 * gr; metal = 0.85 * (1 - gr)
    return col, np.dstack([np.ones_like(a), rough, metal]), normal_iz(0.5 * b + 0.8 * gr * c, 2.5)
def tex_sloi(n=512):       # срез земли диорамы: слои суглинка
    v = np.linspace(0, 1, n)[:, None] * np.ones((1, n)); a = shum(n, 2.2)
    sl = 0.5 + 0.5 * np.sin(v * 38 + a * 4)
    col = np.array([0.24, 0.17, 0.11]) * (0.75 + 0.35 * sl[..., None]) * (0.85 + 0.3 * a[..., None])
    col[v > 0.86] = col[v > 0.86] * 0.7 + np.array([0.06, 0.05, 0.03])
    return col
def tex_ciferblat(n=256):  # манометр без надписей: шкала из рисок, красная черта
    y, x = np.mgrid[0:n, 0:n] / (n - 1) * 2 - 1; r = np.hypot(x, y); a = np.degrees(np.arctan2(x, -y)) % 360
    col = np.ones((n, n, 3)) * np.array([0.86, 0.82, 0.70])
    v = (a >= 45) & (a <= 315); u = (a - 45) / 270 * 40
    col[v & (r > 0.70) & (r < 0.82) & (np.abs(u - np.round(u)) < 0.08)] = (0.05, 0.05, 0.05)
    col[(a > 280) & (a <= 315) & (r > 0.82) & (r < 0.88)] = (0.6, 0.05, 0.03)
    col[(np.abs(x + y * 0.3) < 0.03) & (y < 0.05) & (y > -0.6)] = (0.05, 0.05, 0.05)
    col[r > 0.93] = (0.3, 0.22, 0.1)
    return col
def derevo_tint(imya, k, add=(0, 0, 0)):  # вариант дерева из CC0-текстуры: темнее/старее
    im = zagruzit('fine_grained_wood_Diffuse.jpg'); w, h = im.size
    px = np.array(im.pixels[:], np.float32).reshape(h, w, 4)
    g = px[..., :3].mean(axis=2, keepdims=True)
    rgb = (px[..., :3] * 0.6 + g * 0.4) * np.array(k) + np.array(add)
    bpy.data.images.remove(im)
    return kartinka(imya, rgb)

# ── рельеф диорамы: одна функция для сетки и для текстуры ─────────────────────────────────────────────
GX, GY = 1.95, 1.38                     # полуразмеры подставки
TY = 0.62                               # ось гусеницы по ширине
XF = 1.20                               # передний край гусениц
NZ = 384
_n1, _n2, _n3 = shum(NZ, 2.4), shum(NZ, 1.4), shum(NZ, 3.2)
def probe(f, x, y):
    u = (x + GX) / (2 * GX) * (NZ - 1); v = (y + GY) / (2 * GY) * (NZ - 1)
    i0 = np.clip(np.floor(u).astype(int), 0, NZ - 2); j0 = np.clip(np.floor(v).astype(int), 0, NZ - 2)
    fu, fv = u - i0, v - j0
    return (f[j0, i0] * (1 - fu) * (1 - fv) + f[j0, i0 + 1] * fu * (1 - fv) + f[j0 + 1, i0] * (1 - fu) * fv + f[j0 + 1, i0 + 1] * fu * fv)
def rel(x, y, detal=False):
    """Высота земли и маски (колея гусениц, колёсные колеи, обочина, лужи)."""
    ay = np.abs(y); dy = np.abs(ay - TY)
    n1, n2 = probe(_n1, x, y), probe(_n2, x, y)
    h = 0.014 * (n2 - 0.5) + 0.006 * (n1 - 0.5)
    obochina = ss(0.98, 1.18, ay)
    h += obochina * (0.035 + 0.025 * (n1 - 0.4))
    # след гусениц: от заднего края до передка машины, с почвозацепами
    vdol = 1 - ss(XF - 0.04, XF + 0.08, x)
    polosa = (1 - ss(0.14, 0.17, dy)) * vdol
    berm = (ss(0.15, 0.19, dy) * (1 - ss(0.21, 0.27, dy))) * vdol
    zacep = 0.5 + 0.5 * np.cos(TAU * x / 0.105)
    h += -0.020 * polosa - 0.005 * polosa * ss(0.6, 0.9, zacep) + 0.012 * berm
    val = np.exp(-((x - XF - 0.1) / 0.05) ** 2) * (1 - ss(0.12, 0.2, dy))   # валик грязи перед гусеницей
    h += 0.016 * val
    # колёсные колеи телег: впереди — глубокие, под гусеницами — раскатаны
    dk = np.abs(ay - TY)
    koleya = (1 - ss(0.025, 0.05, dk)) * ss(XF - 0.02, XF + 0.12, x)
    kberm = ss(0.04, 0.06, dk) * (1 - ss(0.07, 0.11, dk)) * ss(XF - 0.02, XF + 0.12, x)
    h += -0.06 * koleya + 0.014 * kberm
    # лужа на дороге
    r2 = ((x - 1.45) / 0.26) ** 2 + ((y + 0.05) / 0.17) ** 2
    luzha = np.exp(-r2 * 1.4)
    h += -0.045 * luzha
    if detal:
        h += 0.003 * probe(_n3, x, y)
    return h, dict(polosa=polosa, koleya=koleya, obochina=obochina, luzha=luzha, berm=berm)
VODA_Z = -0.030

def tex_zemlya(n=1024):
    xs = np.linspace(-GX, GX, n)[None, :] * np.ones((n, 1)); ys = np.linspace(-GY, GY, n)[:, None] * np.ones((1, n))
    h, m = rel(xs, ys, True)
    a, b, g = shum(n, 2.0), shum(n, 3.4), shum(n, 1.1)
    gal = ss(0.88, 0.93, g)                                      # мелкая галька
    sush = np.array([0.36, 0.27, 0.18]); mokr = np.array([0.17, 0.12, 0.08])
    vlaga = np.clip(0.35 + 0.5 * m['polosa'] + 0.9 * m['koleya'] + 0.9 * m['luzha'] - 0.4 * m['obochina'] + 0.3 * (a - 0.5), 0, 1)
    col = sush * (1 - vlaga[..., None]) + mokr * vlaga[..., None]
    col = col * (0.8 + 0.35 * b[..., None])
    trava = m['obochina'] * ss(0.4, 0.7, a + 0.2 * b)
    col = col * (1 - trava[..., None]) + np.array([0.24, 0.24, 0.10]) * (0.7 + 0.5 * b[..., None]) * trava[..., None]
    col = col * (1 - gal[..., None]) + np.array([0.45, 0.42, 0.38]) * gal[..., None]
    # запечённая тень под машиной (в просмотрщике теней нет)
    xx, yy = np.abs(xs + 0.0), np.abs(ys)
    ten = (1 - ss(1.05, 1.55, xx)) * (1 - ss(0.72, 1.12, yy))
    ten = np.maximum(ten * 0.55, (1 - ss(0.0, 0.2, np.abs(yy - TY) - 0.12)) * (1 - ss(1.15, 1.35, xx)) * 0.35)
    col = col * (1 - ten[..., None])
    rough = 0.93 - 0.45 * np.clip(m['koleya'] + m['luzha'], 0, 1) - 0.2 * m['polosa'] * vlaga
    nor = normal_iz(h * 120 + 0.6 * b + 1.2 * gal, 1.0)
    return col, np.dstack([np.ones_like(a), rough, np.zeros_like(a)]), nor

# ── материалы ─────────────────────────────────────────────────────────────────────────────────────────
def pbsdf(imya):
    m = bpy.data.materials.new(imya); m.use_nodes = True
    return m, m.node_tree.nodes['Principled BSDF'], m.node_tree
def mat(imya, cvet, metal, sher, emis=None):
    m, b, _ = pbsdf(imya)
    b.inputs['Base Color'].default_value = (*cvet, 1); b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = sher
    if emis:
        b.inputs['Emission Color'].default_value = (*emis[0], 1); b.inputs['Emission Strength'].default_value = emis[1]
    return m
def mat_tex(imya, col_img, orm_img=None, nor_img=None, nor_sila=1.0, sher=0.5, metal=0.0):
    m, b, t = pbsdf(imya); N, L = t.nodes, t.links
    tc = N.new('ShaderNodeTexImage'); tc.image = col_img; L.new(tc.outputs['Color'], b.inputs['Base Color'])
    if orm_img:
        to = N.new('ShaderNodeTexImage'); to.image = orm_img
        sp = N.new('ShaderNodeSeparateColor'); L.new(to.outputs['Color'], sp.inputs['Color'])
        L.new(sp.outputs['Green'], b.inputs['Roughness']); L.new(sp.outputs['Blue'], b.inputs['Metallic'])
    else:
        b.inputs['Roughness'].default_value = sher; b.inputs['Metallic'].default_value = metal
    if nor_img:
        tn = N.new('ShaderNodeTexImage'); tn.image = nor_img
        nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = nor_sila
        L.new(tn.outputs['Color'], nm.inputs['Color']); L.new(nm.outputs['Normal'], b.inputs['Normal'])
    return m

c, o, n_ = tex_kraska(); KR = [kartinka('kraska-cvet', c), kartinka('kraska-orm', o, True), kartinka('kraska-normal', n_, True)]
c, o, n_ = tex_chugun(); CH = [kartinka('chugun-cvet', c), kartinka('chugun-orm', o, True), kartinka('chugun-normal', n_, True)]
c, o, n_ = tex_gusenica(); GU = [kartinka('gusenica-cvet', c), kartinka('gusenica-orm', o, True), kartinka('gusenica-normal', n_, True)]
c, o, n_ = tex_zemlya(); ZE = [kartinka('zemlya-cvet', c), kartinka('zemlya-orm', o, True), kartinka('zemlya-normal', n_, True)]
img_sloi = kartinka('sloi-cvet', tex_sloi()); img_cif = kartinka('ciferblat', tex_ciferblat())
wood_nor = zagruzit('fine_grained_wood_nor_gl.jpg', True)
img_doski = derevo_tint('doski-cvet', (0.95, 0.80, 0.62))
img_brus = derevo_tint('brus-cvet', (0.55, 0.42, 0.30))
img_kora = kartinka('kora-cvet', np.array([0.20, 0.15, 0.10]) * (0.6 + 0.6 * shum(256, 1.5, 256)[..., None] *
                    (0.6 + 0.4 * (0.5 + 0.5 * np.sin(np.linspace(0, 60, 256))[None, :, None]))))

M = {
    'kraska':  mat_tex('kraska-kotla', KR[0], KR[1], KR[2], 0.8),
    'chugun':  mat_tex('chugun', CH[0], CH[1], CH[2], 1.0),
    'gusen':   mat_tex('zvenya-gusenicy', GU[0], GU[1], GU[2], 1.0),
    'zemlya':  mat_tex('zemlya-dorogi', ZE[0], ZE[1], ZE[2], 1.0),
    'sloi':    mat_tex('zemlya-srez', img_sloi, None, None, sher=0.95),
    'doski':   mat_tex('derevo-nastil', img_doski, None, wood_nor, 0.8, sher=0.72),
    'brus':    mat_tex('derevo-rama', img_brus, None, wood_nor, 1.0, sher=0.78),
    'kora':    mat_tex('kora-polen', img_kora, None, wood_nor, 1.5, sher=0.9),
    'cifer':   mat_tex('ciferblat', img_cif, None, None, sher=0.3),
    'latun':   mat('latun', (0.78, 0.56, 0.25), 1.0, 0.26),
    'med':     mat('med', (0.80, 0.42, 0.27), 1.0, 0.32),
    'blesk':   mat('stal-shlif', (0.72, 0.72, 0.71), 1.0, 0.2),
    'temn':    mat('stal-temnaya', (0.05, 0.05, 0.05), 0.75, 0.42),
    'torec':   mat('derevo-torec', (0.62, 0.48, 0.30), 0.0, 0.85),
    'voda':    mat('voda-luzhi', (0.06, 0.045, 0.03), 0.0, 0.04),
    'trava':   mat('trava-suhaya', (0.42, 0.40, 0.17), 0.0, 0.8),
    'trava2':  mat('trava-zelenaya', (0.20, 0.27, 0.09), 0.0, 0.75),
    'kamen':   mat('kamen', (0.40, 0.38, 0.35), 0.0, 0.8),
    'dym':     mat('dym', (0.62, 0.62, 0.63), 0.0, 1.0),
    'dym2':    mat('dym-temnyj', (0.36, 0.35, 0.35), 0.0, 1.0),
    'ogon':    mat('ogon-v-topke', (1.0, 0.45, 0.12), 0.0, 0.6, emis=((1.0, 0.42, 0.1), 2.0)),
    'belyj':   mat('kraska-belaya', (0.78, 0.77, 0.73), 0.0, 0.6),
    'chern':   mat('kraska-chernaya', (0.04, 0.04, 0.04), 0.0, 0.5),
    'plinth':  mat_tex('derevo-podstavka', derevo_tint('podstavka-cvet', (0.30, 0.20, 0.13)), None, wood_nor, 0.6, sher=0.45),
}

# ── построители ───────────────────────────────────────────────────────────────────────────────────────
VSE = []
def mesh_obj(imya, verts, faces, uvs, material, rodit, smooth=True):
    me = bpy.data.meshes.new(imya); me.from_pydata(verts, [], faces); me.validate()
    if uvs is not None:
        ul = me.uv_layers.new(name='UV')
        for p in me.polygons:
            for li, vi in zip(p.loop_indices, p.vertices): ul.data[li].uv = uvs[vi]
    for p in me.polygons: p.use_smooth = smooth
    me.materials.append(material)
    ob = bpy.data.objects.new(imya, me); sc.collection.objects.link(ob); ob.parent = rodit
    VSE.append(ob); return ob

def osi(p, d):
    d = Vector(d).normalized()
    return Matrix.Translation(Vector(p)) @ Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()

def lathe(imya, prof, material, rodit, seg=48, tile=0.5, at=Matrix.Identity(4), phase=0.0):
    """Тело вращения вокруг локальной Z; prof — [(r, z), …], None — излом (острое ребро)."""
    polosy, cur = [], []
    for p in prof:
        if p is None: polosy.append(cur); cur = [cur[-1]]
        else: cur.append(p)
    polosy.append(cur)
    rmax = max(p[0] for p in prof if p); nu = max(1, round(TAU * rmax / tile))
    verts, faces, uvs = [], [], []
    for pol in polosy:
        if len(pol) < 2: continue
        base = len(verts); s = 0.0; vv = [0.0]
        for j in range(1, len(pol)): s += math.hypot(pol[j][0] - pol[j - 1][0], pol[j][1] - pol[j - 1][1]); vv.append(s)
        for j, (r, z) in enumerate(pol):
            for i in range(seg + 1):
                a = TAU * i / seg + phase
                verts.append(tuple(at @ Vector((r * math.cos(a), r * math.sin(a), z))))
                uvs.append((nu * i / seg, (pol[0][1] + vv[j]) / tile))
        for j in range(len(pol) - 1):
            for i in range(seg):
                a, b = base + j * (seg + 1) + i, base + (j + 1) * (seg + 1) + i
                faces.append((a, a + 1, b + 1, b))
    return mesh_obj(imya, verts, faces, uvs, material, rodit)

def box_bm(size, fask, seg=2):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    if fask > 0: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=fask, segments=seg, profile=0.5, affect='EDGES')
    return bm
def bm_obj(imya, bm, T, material, rodit, tile=0.6):
    bmesh.ops.transform(bm, matrix=T, verts=bm.verts)
    me = bpy.data.meshes.new(imya); bm.to_mesh(me); bm.free()
    uv = me.uv_layers.new(name='UV')
    for p in me.polygons:
        n = p.normal; ax = max(range(3), key=lambda k: abs(n[k])); u_, v_ = [k for k in range(3) if k != ax]
        for li, vi in zip(p.loop_indices, p.vertices):
            v = me.vertices[vi].co; uv.data[li].uv = (v[u_] / tile, v[v_] / tile)
    for p in me.polygons: p.use_smooth = True
    me.materials.append(material)
    ob = bpy.data.objects.new(imya, me); sc.collection.objects.link(ob); ob.parent = rodit
    VSE.append(ob); return ob
def box(imya, size, centr, material, rodit, fask=0.01, rot=None, tile=0.6, seg=2):
    T = Matrix.Translation(Vector(centr)) @ (rot if rot else Matrix.Identity(4))
    return bm_obj(imya, box_bm(size, min(fask, min(size) * 0.45), seg), T, material, rodit, tile)

def prizma(imya, kontur, tol, centr_y, material, rodit, fask=0.006, tile=0.6):
    """Плоская литая деталь: контур в плоскости XZ, толщина tol по Y, фаска по всем рёбрам."""
    bm = bmesh.new()
    vs = [bm.verts.new((x, -tol / 2, z)) for x, z in kontur]
    f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    nv = [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, tol, 0), verts=nv)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=fask, segments=2, profile=0.5, affect='EDGES', clamp_overlap=True)
    return bm_obj(imya, bm, Matrix.Translation((0, centr_y, 0)), material, rodit, tile)

def sterzhen(imya, p1, p2, r, material, rodit, seg=16, fask=None):
    p1, p2 = Vector(p1), Vector(p2); L = (p2 - p1).length
    f = r * 0.25 if fask is None else fask
    pr = [(0, 0), (r - f, 0), (r, f), (r, L - f), (r - f, L), (0, L)]
    return lathe(imya, pr, material, rodit, seg=seg, at=osi(p1, p2 - p1), tile=0.2)

def zaklepki(imya, tochki_normali, r, material, rodit):
    """Полукруглые головки заклёпок: [(точка, нормаль), …]."""
    pr = [(r * math.cos(a), r * 0.6 * math.sin(a)) for a in np.linspace(0, math.pi / 2, 4)]
    pr = [(r * 1.02, -0.002)] + pr
    for p, nrm in tochki_normali:
        lathe(imya, pr, material, rodit, seg=8, at=osi(p, nrm), tile=0.1)

def bolty(imya, centr, napr, Rr, n, s, material, rodit, faza=0.0):
    h = s * 0.7; at0 = osi(centr, napr)
    for i in range(n):
        a = TAU * (i + 0.5) / n + faza
        p = at0 @ Vector((Rr * math.cos(a), Rr * math.sin(a), 0))
        lathe(imya, [(0, 0), (s, 0), (s, h * 0.8), (s * 0.75, h), (0, h * 1.05)], material, rodit, seg=6,
              at=osi(p, napr), tile=0.1, phase=math.pi / 6)

def tor(imya, Rr, r, at, material, rodit, seg=40, k=10):
    pr = [(Rr + r * math.cos(TAU * j / k), r * math.sin(TAU * j / k)) for j in range(k + 1)]
    return lathe(imya, pr, material, rodit, seg=seg, at=at, tile=0.2)

def truba(imya, tochki, r, material, rodit, res=10, bres=3):
    """Труба/тяга по кривой (curve → mesh) с круглым сечением."""
    cu = bpy.data.curves.new(imya, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = r; cu.bevel_resolution = bres; cu.resolution_u = res; cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(tochki) - 1)
    for bp, p in zip(sp.bezier_points, tochki):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    ob = bpy.data.objects.new(imya + '-kr', cu); sc.collection.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.data.objects.remove(ob); bpy.data.curves.remove(cu)
    for p in me.polygons: p.use_smooth = True
    me.materials.clear(); me.materials.append(material)
    o2 = bpy.data.objects.new(imya, me); sc.collection.objects.link(o2); o2.parent = rodit; VSE.append(o2)
    return o2

def obolochka(pts, r):
    """Выпуклая оболочка окружностей [(x, z, r)] в плоскости XZ, обход против часовой."""
    P = []
    for cx, cz, rr in pts:
        for i in range(96): a = TAU * i / 96; P.append((cx + rr * math.cos(a), cz + rr * math.sin(a)))
    P = sorted(set(P))
    def cr(o, a, b): return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, up = [], []
    for p in P:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(P):
        while len(up) >= 2 and cr(up[-2], up[-1], p) <= 0: up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]
def razlozhit(poly, n):
    """Равномерно n точек по замкнутой ломаной: [(p, касательная)]."""
    P = [Vector((x, z)) for x, z in poly]; P.append(P[0])
    d = [0.0]
    for i in range(1, len(P)): d.append(d[-1] + (P[i] - P[i - 1]).length)
    L = d[-1]; out = []; j = 0
    for k in range(n):
        s = L * k / n
        while d[j + 1] < s: j += 1
        t = (s - d[j]) / max(1e-9, d[j + 1] - d[j]); p = P[j].lerp(P[j + 1], t)
        out.append(p)
    res = []
    for k in range(n):
        tng = (out[(k + 1) % n] - out[k - 1]).normalized(); res.append((out[k], tng))
    return res, L

UZLY = {}
def uzel(imya):
    e = bpy.data.objects.new(imya, None); sc.collection.objects.link(e)
    e['uzel'] = imya; UZLY[imya] = e
    return e

# ══ РАЗМЕРЫ (допущения, ~метры) ══════════════════════════════════════════════════════════════════════
H = 0.32        # ось больших колёс
RP = 0.31       # радиус пути центров звеньев вокруг колеса
XW = 0.88       # оси переднего/заднего колеса
RW = 0.277      # обод большого колеса (катится по рельсам звеньев)
RK = 0.11       # опорный каток
ZK = 0.153      # ось катков
XK = (-0.44, 0.0, 0.44)
ZD = 0.82       # верх настила
SIDES = (-1, 1)

# ══ 1. ГУСЕНИЦЫ ═════════════════════════════════════════════════════════════════════════════════════
gus = uzel('gusenicy')
def zveno_bm():
    """Звено в локальных осях: x — вдоль хода, y — поперёк, z — наружу (к земле на нижней ветви)."""
    parts = []
    parts.append((box_bm((0.098, 0.30, 0.022), 0.006, 1), (0, 0, 0)))                 # плита
    parts.append((box_bm((0.026, 0.27, 0.016), 0.005, 1), (0.0, 0, 0.018)))           # почвозацеп
    for yy in (-0.08, 0.08):
        parts.append((box_bm((0.104, 0.032, 0.022), 0.005, 1), (0, yy, -0.021)))     # отрезок «бесконечного рельса»
    bm = bmesh.new()
    for b, off in parts:
        bmesh.ops.translate(b, vec=off, verts=b.verts)
        me = bpy.data.meshes.new('tmp'); b.to_mesh(me); b.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
    return bm
def sharnir_bm():
    bm = bmesh.new()
    for yy, L in ((-0.135, 0.032), (-0.03, 0.05), (0.06, 0.04), (0.145, 0.016)):
        r = bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.013, radius2=0.013, depth=L)
        bmesh.ops.rotate(bm, verts=r['verts'], cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, 'X'))
        bmesh.ops.translate(bm, vec=(0.05, yy, -0.002), verts=r['verts'])
    r = bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.007, radius2=0.007, depth=0.33)
    bmesh.ops.rotate(bm, verts=r['verts'], cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, 'X'))
    bmesh.ops.translate(bm, vec=(0.05, 0, -0.002), verts=r['verts'])
    return bm
put_pts = obolochka([(-XW, H, RP), (XW, H, RP)], RP)
SAG = 0.035
put_pts = [(x, z - (SAG * math.cos(math.pi * x / (2 * XW)) if (z > H + 0.05 and abs(x) < XW) else 0.0)) for x, z in put_pts]
tmp_res, Lput = razlozhit(put_pts, 400)
NZV = int(round(Lput / 0.105))
zv, _ = razlozhit(put_pts, NZV)
for s in SIDES:
    for k, (p, t) in enumerate(zv):
        nrm = Vector((t.y, -t.x))                       # наружу (обход против часовой)
        X = Vector((t.x, 0, t.y)); Y = Vector((0, -1, 0)); Z = Vector((nrm.x, 0, nrm.y))
        T = Matrix((X, Y, Z)).transposed().to_4x4(); T.translation = Vector((p.x, s * TY, p.y))
        bm_obj('zveno', zveno_bm(), T.copy(), M['gusen'], gus, tile=0.3)
        bm_obj('zveno-sharnir', sharnir_bm(), T.copy(), M['blesk'] if k % 7 == 0 else M['temn'], gus, tile=0.3)

# ══ 2. ХОДОВАЯ: большие колёса, катки, тележки ══════════════════════════════════════════════════════
hod = uzel('hodovaya')
def bolshoe_koleso(x, s, vedushchee):
    y0 = s * TY; ax = (0, 1, 0)
    at = osi((x, y0 - 0.13, H), ax)
    # обод с двумя дорожками под рельсы и средним гребнем
    lathe('koleso-obod', [(RW - 0.035, 0.0), (RW - 0.004, 0.0), (RW, 0.006), (RW, 0.095), (RW + 0.012, 0.11), (RW + 0.012, 0.15),
                          (RW, 0.165), (RW, 0.254), (RW - 0.004, 0.26), (RW - 0.035, 0.26), (RW - 0.04, 0.255), (RW - 0.04, 0.005), (RW - 0.035, 0.0)],
          M['chugun'], hod, seg=72, at=at, tile=0.4)
    # ступица
    lathe('koleso-stupica', [(0.0, -0.02), (0.05, -0.02), (0.065, 0.0), (0.07, 0.05), (0.06, 0.13), (0.07, 0.21), (0.065, 0.26), (0.05, 0.28), (0.0, 0.28)],
          M['chugun'], hod, seg=32, at=at, tile=0.3)
    # литые спицы (по 6 в двух плоскостях, со сдвигом), фигурные
    for pl, faza in ((0.06, 0.0), (0.20, TAU / 12)):
        for i in range(6):
            a = TAU * i / 6 + faza + (0.3 if vedushchee else 0.0)
            p1 = at @ Vector((0.06 * math.cos(a), 0.06 * math.sin(a), pl)); p2 = at @ Vector(((RW - 0.035) * math.cos(a + 0.12), (RW - 0.035) * math.sin(a + 0.12), pl))
            pm = (p1 + p2) / 2 + (at.to_3x3() @ Vector((-math.sin(a), math.cos(a), 0))) * 0.02
            truba('koleso-spica', [p1, pm, p2], 0.017, M['chugun'], hod, res=4, bres=2)
    # колпак ступицы и чека
    for yy in (y0 - 0.15, y0 + 0.15):
        d = 1 if yy > y0 else -1
        lathe('koleso-kolpak', [(0, 0), (0.04, 0), (0.04, 0.02), (0.03, 0.035), (0, 0.04)], M['latun'] if vedushchee else M['chugun'], hod,
              seg=24, at=osi((x, yy + d * 0.02, H), (0, d, 0)), tile=0.2)
    bolty('koleso-bolt', (x, y0 - 0.15, H), (0, -1, 0), 0.05, 6, 0.009, M['temn'], hod)
def katok(x, s):
    y0 = s * TY; at = osi((x, y0 - 0.12, ZK), (0, 1, 0))
    lathe('katok', [(0.0, -0.01), (0.04, -0.01), (0.05, 0.0), (RK + 0.016, 0.0), (RK + 0.016, 0.03), (RK, 0.045), (RK, 0.195), (RK + 0.016, 0.21),
                    (RK + 0.016, 0.24), (0.05, 0.24), (0.04, 0.25), (0.0, 0.25)], M['chugun'], hod, seg=40, at=at, tile=0.3)
    for i in range(5):
        a = TAU * i / 5
        for zz in (-0.012, 0.252):
            p = at @ Vector((0.075 * math.cos(a), 0.075 * math.sin(a), zz))
            lathe('katok-okno', [(0.0, 0), (0.018, 0), (0.016, 0.004)], M['temn'], hod, seg=12, at=osi(p, (0, 1 if zz > 0.1 else -1, 0)), tile=0.1)
for s in SIDES:
    for x in (-XW, XW): bolshoe_koleso(x, s, x > 0)
    for x in XK: katok(x, s)
    # литая балка тележки по обе стороны гусеницы: от оси до оси, с лапами к каткам
    kontur = [(-XW - 0.07, H - 0.035), (-XW - 0.05, H - 0.06), (-0.62, H - 0.05)]
    for x in XK: kontur += [(x - 0.09, H - 0.05), (x - 0.05, ZK - 0.03), (x + 0.05, ZK - 0.03), (x + 0.09, H - 0.05)]
    kontur += [(0.62, H - 0.05), (XW + 0.05, H - 0.06), (XW + 0.07, H - 0.035), (XW + 0.07, H + 0.035), (XW + 0.05, H + 0.06),
               (0.55, H + 0.05), (0.0, H + 0.075), (-0.55, H + 0.05), (-XW - 0.05, H + 0.06), (-XW - 0.07, H + 0.035)]
    for yy in (s * TY - s * 0.165, s * TY + s * 0.165):
        prizma('telezhka-balka', kontur, 0.024, yy, M['chugun'], hod, fask=0.007)
        for x in (-XW, *XK, XW):
            zz = H if abs(x) > 0.8 else ZK
            lathe('telezhka-buksa', [(0, 0), (0.035, 0), (0.042, 0.008), (0.042, 0.03), (0.03, 0.04), (0, 0.04)], M['chugun'], hod, seg=20,
                  at=osi((x, yy + math.copysign(0.012, yy - s * TY), zz), (0, math.copysign(1, yy - s * TY), 0)), tile=0.2)
        for x in np.linspace(-0.7, 0.7, 6):
            zaklepki('telezhka-zaklepka', [((x, yy + math.copysign(0.012, yy - s * TY), H + 0.03), (0, math.copysign(1, yy - s * TY), 0))], 0.008, M['temn'], hod)
    # стойки от тележки к раме (литые кронштейны)
    for x in (-0.66, 0.0, 0.66):
        prizma('telezhka-stoyka', [(x - 0.07, H + 0.04), (x + 0.07, H + 0.04), (x + 0.045, 0.68), (x - 0.045, 0.68)], 0.05, s * 0.43, M['chugun'], hod, fask=0.008)

# ══ 3. РАМА И НАСТИЛ (дерево) ════════════════════════════════════════════════════════════════════════
rama = uzel('rama')
for s in SIDES:
    box('rama-brus', (2.36, 0.11, 0.13), (0, s * 0.40, 0.715), M['brus'], rama, fask=0.012, tile=0.9)
    for x in (-1.12, -0.4, 0.4, 1.12):                              # железные угольники и болты
        box('rama-ugolnik', (0.12, 0.012, 0.11), (x, s * 0.458, 0.735), M['chugun'], rama, fask=0.003)
        for zz in (0.70, 0.77):
            lathe('rama-bolt', [(0, 0), (0.012, 0), (0.012, 0.008), (0.009, 0.012), (0, 0.013)], M['temn'], rama, seg=6,
                  at=osi((x, s * 0.464, zz), (0, s, 0)), tile=0.1, phase=math.pi / 6)
for x in (-1.12, -0.4, 0.4, 1.12):
    box('rama-poperechina', (0.11, 0.70, 0.11), (x, 0, 0.725), M['brus'], rama, fask=0.012, tile=0.9)
NDOS = 17
for i in range(NDOS):                                               # поперечные доски настила, с зазорами и разной высотой
    x = -1.2 + (i + 0.5) * 2.4 / NDOS
    dz = 0.004 * (R.random() - 0.5); rot = Matrix.Rotation((R.random() - 0.5) * 0.012, 4, 'X')
    box('nastil-doska', (2.4 / NDOS - 0.012, 1.66, 0.04), (x, 0.0, ZD - 0.02 + dz), M['doski'], rama, fask=0.006, rot=rot, tile=1.4)
    for s in SIDES:
        for yy in (0.40, 0.70):
            zaklepki('nastil-gvozd', [((x, s * yy, ZD + 0.001), (0, 0, 1))], 0.008, M['temn'], rama)
for s in SIDES:                                                      # железные полосы-оковки по краям настила
    box('nastil-okovka', (2.42, 0.03, 0.05), (0, s * 0.835, ZD - 0.02), M['chugun'], rama, fask=0.006)
for x in (-1.215, 1.215):
    box('nastil-okovka', (0.03, 1.70, 0.05), (x, 0, ZD - 0.02), M['chugun'], rama, fask=0.006)
# перильца вокруг площадки машиниста
for s in SIDES:
    pts = [(-1.18, s * 0.80), (-0.95, s * 0.80), (-0.72, s * 0.80)]
    for x, y in pts: sterzhen('perila-stoyka', (x, y, ZD), (x, y, ZD + 0.36), 0.012, M['temn'], rama, seg=10)
    truba('perila-poruchen', [Vector((-1.18, s * 0.80, ZD + 0.36)), Vector((-0.95, s * 0.80, ZD + 0.37)), Vector((-0.72, s * 0.80, ZD + 0.36))], 0.013, M['temn'], rama)
for y in (-0.80, -0.4, 0.4, 0.80):
    sterzhen('perila-stoyka', (-1.18, y, ZD), (-1.18, y, ZD + 0.36), 0.012, M['temn'], rama, seg=10)
truba('perila-poruchen', [Vector((-1.18, -0.80, ZD + 0.36)), Vector((-1.18, -0.30, ZD + 0.37)), Vector((-1.18, 0.30, ZD + 0.37)), Vector((-1.18, 0.80, ZD + 0.36))], 0.013, M['temn'], rama)
# бочка воды и поленница
bx, by = -0.98, -0.52
prof = [(0, 0.0), (0.15, 0.0), None]
for i in range(9):
    t = i / 8; prof.append((0.17 + 0.028 * math.sin(math.pi * t), 0.42 * t))
prof += [None, (0.155, 0.42), (0.155, 0.40), (0.0, 0.40)]
lathe('bochka', prof, M['doski'], rama, seg=36, at=osi((bx, by, ZD), (0, 0, 1)), tile=0.35)
for zz in (0.05, 0.14, 0.28, 0.37):
    rr = 0.17 + 0.028 * math.sin(math.pi * zz / 0.42) + 0.004
    tor('bochka-obruch', rr, 0.006, osi((bx, by, ZD + zz), (0, 0, 1)), M['temn'], rama, seg=36, k=6)
for i in range(16):                                                 # клёпки клёпаной бочки — швы клёпок (стыки досок)
    a = TAU * i / 16
    truba('bochka-shov', [Vector((bx + (0.171) * math.cos(a), by + 0.171 * math.sin(a), ZD + 0.01)),
                          Vector((bx + 0.198 * math.cos(a), by + 0.198 * math.sin(a), ZD + 0.21)),
                          Vector((bx + 0.171 * math.cos(a), by + 0.171 * math.sin(a), ZD + 0.41))], 0.0025, M['brus'], rama, res=4)
for k in range(9):                                                  # поленья
    rx = k % 3 + (0.5 if (k // 3) % 2 else 0); ry = k // 3
    if ry == 2 and rx > 2: continue
    c = Vector((-1.0, 0.36 + 0.105 * rx - 0.05, ZD + 0.055 + ry * 0.09))
    L = 0.34 + 0.06 * R.random(); r = 0.048 + 0.008 * R.random()
    at = osi(c - Vector((L / 2, 0, 0)), (1, 0, 0)) @ Matrix.Rotation(R.random() * TAU, 4, 'Z')
    prof = [(0, 0), (r * 0.94, 0), None, (r * 0.97, 0.004)]
    for j in range(1, 6): prof.append((r * (1 + 0.04 * math.sin(j * 2.1 + k)), L * j / 6))
    prof += [(r * 0.97, L - 0.004), None, (r * 0.94, L), (0, L)]
    lathe('poleno', prof, M['kora'], rama, seg=14, at=at, tile=0.2)
    lathe('poleno-torec', [(0, -0.001), (r * 0.94, -0.001)], M['torec'], rama, seg=14, at=at, tile=0.2)
    lathe('poleno-torec', [(r * 0.94, L + 0.001), (0, L + 0.001)], M['torec'], rama, seg=14, at=at, tile=0.2)

# ══ 4. КОТЁЛ ════════════════════════════════════════════════════════════════════════════════════════
kot = uzel('kotel')
KX = -0.18; KZ0 = ZD; RB = 0.30; HB = 1.05
at = osi((KX, 0, KZ0), (0, 0, 1))
lathe('kotel-zolnik', [(0, 0), (RB + 0.06, 0), (RB + 0.07, 0.01), (RB + 0.07, 0.07), (RB + 0.05, 0.085), (RB + 0.01, 0.09)], M['chugun'], kot, seg=64, at=at)
prof = [(RB + 0.01, 0.09), (RB + 0.012, 0.10), (RB + 0.012, 0.44), None, (RB, 0.45), (RB, HB - 0.06)]
for i in range(1, 8):
    a = math.pi / 2 * i / 7; prof.append((RB * math.cos(a) * 1.0 + 0.0, HB - 0.06 + 0.16 * math.sin(a)))
lathe('kotel-obechayka', prof, M['kraska'], kot, seg=72, at=at, tile=0.7)
for zz in (0.12, 0.44, 0.75):                                       # клёпаные швы-пояса
    RR = RB + (0.012 if zz < 0.45 else 0.0)
    lathe('kotel-poyas', [(RR, zz - 0.03), (RR + 0.006, zz - 0.025), (RR + 0.006, zz + 0.025), (RR, zz + 0.03)], M['kraska'], kot, seg=72, at=at)
    zaklepki('kotel-zaklepka', [((KX + (RR + 0.006) * math.cos(TAU * i / 40), (RR + 0.006) * math.sin(TAU * i / 40), KZ0 + zz),
                                 (math.cos(TAU * i / 40), math.sin(TAU * i / 40), 0)) for i in range(40)], 0.009, M['temn'], kot)
for i in range(11):                                                 # вертикальный шов
    zz = 0.5 + i * 0.045; a = math.radians(70)
    zaklepki('kotel-zaklepka', [((KX + RB * math.cos(a), RB * math.sin(a), KZ0 + zz), (math.cos(a), math.sin(a), 0))], 0.008, M['temn'], kot)
for i in range(24):                                                 # шов крыши
    a = TAU * i / 24; rr = RB * math.cos(math.radians(40)); zz = HB - 0.06 + 0.16 * math.sin(math.radians(40))
    zaklepki('kotel-zaklepka', [((KX + rr * math.cos(a), rr * math.sin(a), KZ0 + zz), (math.cos(a) * 0.77, math.sin(a) * 0.77, 0.64))], 0.008, M['temn'], kot)
# топочная дверца (сзади, к машинисту), приоткрыта — внутри огонь
dx = KX - RB - 0.012
for (sz, c) in (((0.05, 0.25, 0.03), (0, 0.16)), ((0.05, 0.25, 0.03), (0, 0.38)), ((0.05, 0.03, 0.22), (-0.11, 0.27)), ((0.05, 0.03, 0.22), (0.11, 0.27))):
    box('kotel-ramka-dvercy', sz, (dx + 0.005, c[0], KZ0 + c[1]), M['chugun'], kot, fask=0.008)
box('kotel-ogon', (0.02, 0.19, 0.17), (dx + 0.004, 0, KZ0 + 0.27), M['ogon'], kot, fask=0.003)
TD = Matrix.Translation((dx - 0.02, -0.11, KZ0 + 0.27)) @ Matrix.Rotation(0.9, 4, 'Z')
dv = box('kotel-dverca', (0.025, 0.21, 0.19), (0, 0.105, 0), M['chugun'], kot, fask=0.006)
dv.matrix_world = TD
sterzhen('kotel-dverca-ruchka', TD @ Vector((-0.012, 0.17, 0)), TD @ Vector((-0.06, 0.17, 0)), 0.009, M['latun'], kot, seg=8)
for zz in (0.21, 0.33):
    sterzhen('kotel-petlya', (dx - 0.02, -0.11, KZ0 + zz), (dx - 0.02, -0.11, KZ0 + zz + 0.03), 0.012, M['temn'], kot, seg=10)
# водомерное стекло и манометр (тоже к машинисту)
gx = KX - RB - 0.03
sterzhen('kotel-vodomer-truba', (gx, 0.16, KZ0 + 0.55), (gx, 0.16, KZ0 + 0.85), 0.012, M['latun'], kot, seg=12)
sterzhen('kotel-vodomer-steklo', (gx - 0.002, 0.16, KZ0 + 0.58), (gx - 0.002, 0.16, KZ0 + 0.82), 0.014, M['voda'], kot, seg=12)
for zz in (0.56, 0.84):
    box('kotel-vodomer-kran', (0.1, 0.035, 0.035), (gx + 0.04, 0.16, KZ0 + zz), M['latun'], kot, fask=0.008)
mp = Vector((gx - 0.02, -0.12, KZ0 + 0.80))
lathe('kotel-manometr', [(0, 0), (0.07, 0), (0.075, 0.008), (0.075, 0.03), (0.065, 0.036)], M['latun'], kot, seg=40, at=osi(mp, (-1, 0, 0)))
o = lathe('kotel-manometr-cifer', [(0.0, 0.031), (0.066, 0.031)], M['cifer'], kot, seg=40, at=osi(mp, (-1, 0, 0)))
ul = o.data.uv_layers[0]
for p in o.data.polygons:
    for li, vi in zip(p.loop_indices, p.vertices):
        v = osi(mp, (-1, 0, 0)).inverted() @ o.data.vertices[vi].co; ul.data[li].uv = (0.5 + v.x / 0.14, 0.5 + v.y / 0.14)
sterzhen('kotel-manometr-trubka', (KX - 0.26, -0.12, KZ0 + 0.80), (gx - 0.005, -0.12, KZ0 + 0.80), 0.009, M['med'], kot, seg=8)
# сухопарник, предохранительный клапан, свисток, труба
top = KZ0 + HB + 0.10
SX = KX + 0.15
lathe('kotel-suhoparnik', [(0, top + 0.17), (0.06, top + 0.165), (0.085, top + 0.14), (0.09, top + 0.06), (0.10, top - 0.01), (0.12, top - 0.03), (0.12, top - 0.05), None,
                           (0.11, top - 0.05), (0.11, top - 0.17)],
      M['kraska'], kot, seg=40, at=osi((SX, 0, 0), (0, 0, 1)))
bolty('kotel-bolt', (SX, 0, top - 0.03), (0, 0, 1), 0.108, 10, 0.008, M['temn'], kot)
lathe('kotel-klapan', [(0.0, 0), (0.03, 0), (0.032, 0.05), (0.02, 0.07), (0.022, 0.12), (0.03, 0.125), (0.03, 0.14), (0, 0.15)],
      M['latun'], kot, seg=24, at=osi((KX - 0.10, 0.17, top - 0.07), (0, 0, 1)))
sterzhen('kotel-klapan-rychag', (KX - 0.10, 0.17, top + 0.09), (KX - 0.30, 0.17, top + 0.05), 0.008, M['blesk'], kot, seg=8)
lathe('kotel-klapan-gruz', [(0, -0.03), (0.025, -0.03), (0.03, 0), (0.025, 0.03), (0, 0.03)], M['chugun'], kot, seg=16, at=osi((KX - 0.30, 0.17, top + 0.02), (0, 0, 1)))
lathe('kotel-svistok', [(0.0, 0), (0.012, 0), (0.012, 0.06), (0.028, 0.065), (0.028, 0.15), (0.034, 0.16), (0.0, 0.17)],
      M['latun'], kot, seg=24, at=osi((KX - 0.05, -0.17, top - 0.07), (0, 0, 1)))
TX = KX - 0.08; TZ0 = top - 0.09; TZ1 = 2.50
lathe('kotel-truba', [(0.0, TZ0 - 0.04), (0.10, TZ0 - 0.04), (0.10, TZ0 + 0.03), (0.08, TZ0 + 0.06), (0.075, TZ0 + 0.1), (0.075, TZ1 - 0.05), None,
                      (0.085, TZ1 - 0.05), (0.11, TZ1 + 0.03), (0.13, TZ1 + 0.06), (0.12, TZ1 + 0.075), (0.075, TZ1 + 0.03)],
      M['chugun'], kot, seg=40, at=osi((TX, 0, 0), (0, 0, 1)), tile=0.5)
for zz in (TZ0 + 0.45, TZ0 + 0.95):
    tor('kotel-truba-hom', 0.077, 0.007, osi((TX, 0, zz), (0, 0, 1)), M['temn'], kot, seg=40, k=6)
# растяжки трубы
for s in SIDES:
    truba('kotel-rastyazhka', [Vector((TX, 0.06 * s, TZ0 + 0.95)), Vector((TX - 0.35, s * 0.5, (TZ0 + 0.95 + ZD) / 2 + 0.05)), Vector((TX - 0.45, s * 0.78, ZD + 0.02))], 0.005, M['temn'], kot, res=8)
# дым: клубы над трубой, сносит назад (машина идёт вперёд, к +X)
for i, (dxp, dz, r) in enumerate([(0.0, 0.16, 0.11), (-0.12, 0.27, 0.14), (-0.30, 0.36, 0.17), (-0.54, 0.42, 0.20), (-0.82, 0.46, 0.22)]):
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=3, radius=r)
    for v in bm.verts:
        n = v.co.normalized(); v.co += n * r * 0.22 * (math.sin(v.co.x * 31 + i) * math.sin(v.co.y * 27 + 2 * i) * math.sin(v.co.z * 23))
    v0 = Vector((TX + dxp, 0.02 * math.sin(i * 1.7), TZ1 + 0.06 + dz))
    bm_obj('dym', bm, Matrix.Translation(v0) @ Matrix.Diagonal((1.25, 1.0, 0.85, 1.0)), M['dym2'] if i < 2 else M['dym'], kot)

# ══ 5. ПАРОВЫЕ МАШИНЫ (по одной на гусеницу) ═════════════════════════════════════════════════════════
mash = uzel('parovye-mashiny')
EZ = ZD + 0.21          # ось цилиндра
CX0, CX1 = 0.05, 0.36   # цилиндр
XKV = 0.86              # ось коленвала
RKR = 0.075             # радиус кривошипа
YE = 0.55
ug = math.radians(60)   # положение кривошипа (одна машина — со сдвигом)
for s in SIDES:
    y = s * YE
    box('mashina-stanina', (0.98, 0.20, 0.05), ((CX0 + XKV) / 2 + 0.02, y, ZD + 0.025), M['kraska'], mash, fask=0.012)
    for x in (CX0 + 0.06, CX1 - 0.06):
        prizma('mashina-lapa', [(x - 0.06, ZD + 0.05), (x + 0.06, ZD + 0.05), (x + 0.035, EZ - 0.06), (x - 0.035, EZ - 0.06)], 0.13, y, M['kraska'], mash, fask=0.008)
    at = osi((CX0, y, EZ), (1, 0, 0)); L = CX1 - CX0; RC = 0.1
    lathe('mashina-cilindr', [(0, -0.03), (RC - 0.02, -0.03), (RC + 0.025, -0.02), (RC + 0.025, 0.012), None, (RC + 0.004, 0.015), (RC + 0.004, L - 0.015), None,
                              (RC + 0.025, L - 0.012), (RC + 0.025, L + 0.02), (RC - 0.02, L + 0.03), (0.05, L + 0.03)], M['kraska'], mash, seg=48, at=at)
    for zz in (0.09, L - 0.09):
        lathe('mashina-bandazh', [(RC + 0.005, zz - 0.01), (RC + 0.01, zz - 0.006), (RC + 0.01, zz + 0.006), (RC + 0.005, zz + 0.01)], M['latun'], mash, seg=48, at=at)
    lathe('mashina-kryshka', [(0, -0.055), (0.05, -0.05), (0.07, -0.035), (RC - 0.02, -0.03)], M['kraska'], mash, seg=36, at=at)
    bolty('mashina-bolt', (CX0 - 0.03, y, EZ), (-1, 0, 0), RC + 0.012, 10, 0.011, M['temn'], mash)
    bolty('mashina-bolt', (CX1 + 0.03, y, EZ), (1, 0, 0), RC + 0.012, 10, 0.011, M['temn'], mash)
    lathe('mashina-salnik', [(0.035, 0), (0.05, 0), (0.05, 0.04), (0.03, 0.05), (0.025, 0.07)], M['latun'], mash, seg=24, at=osi((CX1 + 0.03, y, EZ), (1, 0, 0)))
    # золотниковая коробка сверху + регулятор (кран) на паровпуске
    box('mashina-zolotnik', (0.24, 0.14, 0.09), ((CX0 + CX1) / 2, y, EZ + RC + 0.06), M['kraska'], mash, fask=0.018)
    box('mashina-zolotnik-kryshka', (0.27, 0.165, 0.025), ((CX0 + CX1) / 2, y, EZ + RC + 0.115), M['kraska'], mash, fask=0.008)
    for x in np.linspace(CX0 + 0.03, CX1 - 0.03, 4):
        for yy in (y - 0.068, y + 0.068):
            lathe('mashina-bolt', [(0, 0), (0.009, 0), (0.009, 0.007), (0.006, 0.01), (0, 0.011)], M['temn'], mash, seg=6, at=osi((x, yy, EZ + RC + 0.127), (0, 0, 1)), tile=0.1)
    vx = (CX0 + CX1) / 2 - 0.05
    lathe('mashina-regulyator', [(0, -0.04), (0.035, -0.04), (0.045, 0), (0.035, 0.04), (0, 0.04)], M['latun'], mash, seg=24, at=osi((vx, y, EZ + RC + 0.2), (0, 1, 0)))
    sterzhen('mashina-vpusk', (vx, y, EZ + RC + 0.125), (vx, y, EZ + RC + 0.17), 0.022, M['med'], mash, seg=16)
    # шток, параллели, крейцкопф, шатун, кривошип
    xk = XKV + RKR * math.cos(ug if s > 0 else ug + math.pi / 2); zk = EZ + RKR * math.sin(ug if s > 0 else ug + math.pi / 2)
    xc = xk - math.sqrt(0.32 ** 2 - (zk - EZ) ** 2)
    sterzhen('mashina-shtok', (CX1 + 0.03, y, EZ), (xc, y, EZ), 0.012, M['blesk'], mash, seg=12)
    for zz in (EZ - 0.045, EZ + 0.045):
        box('mashina-parallel', (0.30, 0.04, 0.016), (CX1 + 0.2, y, zz), M['blesk'], mash, fask=0.004)
    box('mashina-parallel-opora', (0.03, 0.06, 0.13), (CX1 + 0.355, y, EZ), M['kraska'], mash, fask=0.008)
    box('mashina-krejckopf', (0.06, 0.05, 0.075), (xc, y, EZ), M['blesk'], mash, fask=0.01)
    dl = Vector((xk - xc, 0, zk - EZ)); ang = math.atan2(dl.z, dl.x); Ls = dl.length
    k = [(0, -0.028), (0.03, -0.034), (Ls * 0.5, -0.02), (Ls - 0.035, -0.026), (Ls + 0.025, -0.03), (Ls + 0.035, 0), (Ls + 0.025, 0.03), (Ls - 0.035, 0.026),
         (Ls * 0.5, 0.02), (0.03, 0.034), (0, 0.028), (-0.02, 0.0)]
    o = prizma('mashina-shatun', k, 0.022, 0, M['blesk'], mash, fask=0.005)
    o.matrix_world = Matrix.Translation((xc, y - s * 0.035, EZ)) @ Matrix.Rotation(-ang, 4, 'Y')
    lathe('mashina-kriv-disk', [(0, 0), (0.11, 0), (0.115, 0.006), (0.115, 0.024), (0.11, 0.03), (0, 0.03)], M['kraska'], mash, seg=40,
          at=osi((XKV, y - s * 0.07, EZ), (0, s, 0)))
    sterzhen('mashina-palec', (xk, y - s * 0.075, zk), (xk, y - s * 0.02, zk), 0.016, M['blesk'], mash, seg=12)
    # коленвал своей машины — свой (вал разрезан посередине, как на «Геркулесе»)
    sterzhen('mashina-val', (XKV, s * 0.04, EZ), (XKV, s * 0.93, EZ), 0.022, M['blesk'], mash, seg=16)
    for yy in (0.30, 0.74):
        prizma('mashina-podshipnik', [(XKV - 0.07, ZD), (XKV + 0.07, ZD), (XKV + 0.05, EZ - 0.01), (XKV + 0.035, EZ + 0.04), (XKV - 0.035, EZ + 0.04), (XKV - 0.05, EZ - 0.01)],
               0.05, s * yy, M['kraska'], mash, fask=0.008)
        lathe('mashina-maslenka', [(0, 0), (0.012, 0), (0.016, 0.03), (0.006, 0.04), (0, 0.042)], M['latun'], mash, seg=12, at=osi((XKV, s * yy, EZ + 0.04), (0, 0, 1)))
    # маховик со спицами
    atm = osi((XKV, s * 0.18 - s * 0.03, EZ), (0, s, 0))
    lathe('mashina-mahovik', [(0.135, 0), (0.17, 0), (0.175, 0.006), (0.175, 0.054), (0.17, 0.06), (0.135, 0.06), (0.13, 0.05), (0.13, 0.01)], M['kraska'], mash, seg=48, at=atm)
    lathe('mashina-mahovik-stupica', [(0.0, 0.0), (0.04, 0.0), (0.045, 0.01), (0.045, 0.05), (0.04, 0.06), (0, 0.06)], M['kraska'], mash, seg=20, at=atm)
    for i in range(5):
        a = TAU * i / 5
        sterzhen('mashina-mahovik-spica', atm @ Vector((0.04 * math.cos(a), 0.04 * math.sin(a), 0.03)), atm @ Vector((0.135 * math.cos(a), 0.135 * math.sin(a), 0.03)), 0.011, M['kraska'], mash, seg=8)
    # цепная передача на переднее колесо снаружи гусеницы
    yc = s * 0.885
    for (x0, z0, r0, nz) in ((XKV, EZ, 0.07, 12), (XW, H, 0.12, 20)):
        lathe('mashina-zvezdochka', [(0.02, -0.008), (r0 - 0.012, -0.008), (r0 - 0.012, 0.008), (0.02, 0.008)], M['chugun'], mash, seg=nz * 2, at=osi((x0, yc, z0), (0, 1, 0)))
        for i in range(nz):
            a = TAU * i / nz
            box('mashina-zub', (0.018, 0.014, 0.02), (x0 + (r0 - 0.004) * math.cos(a), yc, z0 + (r0 - 0.004) * math.sin(a)), M['chugun'], mash, fask=0.004,
                rot=Matrix.Rotation(-a, 4, 'Y'))
        lathe('mashina-zvezdochka-stupica', [(0, -0.03), (0.035, -0.03), (0.035, 0.03), (0, 0.03)], M['chugun'], mash, seg=16, at=osi((x0, yc, z0), (0, 1, 0)))
    sterzhen('mashina-polu-os', (XW, s * 0.78, H), (XW, s * 0.92, H), 0.022, M['blesk'], mash, seg=12)
    pts = obolochka([(XKV, EZ, 0.075), (XW, H, 0.125)], 0)
    Ltmp = razlozhit(pts, 200)[1]; nzv = int(Ltmp / 0.028)
    zvs, _ = razlozhit(pts, nzv)
    for k, (p, t) in enumerate(zvs):
        rot = Matrix.Rotation(-math.atan2(t.y, t.x), 4, 'Y')
        box('mashina-cep', (0.03, 0.012 if k % 2 else 0.022, 0.014), (p.x, yc, p.y), M['temn'] if k % 2 else M['chugun'], mash, fask=0.004, rot=rot)

# ══ 6. УПРАВЛЕНИЕ: место машиниста, два рычага ═════════════════════════════════════════════════════
upr = uzel('upravlenie')
box('upr-skamya', (0.30, 0.40, 0.04), (-1.04, 0.0, ZD + 0.40), M['doski'], upr, fask=0.01, tile=1.0)
for x in (-1.16, -0.92):
    for y in (-0.15, 0.15):
        box('upr-skamya-noga', (0.045, 0.045, 0.38), (x, y, ZD + 0.19), M['brus'], upr, fask=0.008)
box('upr-skamya-svyaz', (0.03, 0.3, 0.03), (-1.04, 0.0, ZD + 0.12), M['brus'], upr, fask=0.006)
for s in SIDES:
    y = s * 0.30; px, pz = -0.62, ZD + 0.04
    prizma('upr-sektor', [(px - 0.12, pz + 0.12), (px - 0.06, pz + 0.2), (px + 0.0, pz + 0.22), (px + 0.06, pz + 0.2), (px + 0.12, pz + 0.12), (px + 0.1, pz + 0.1),
                          (px + 0.05, pz + 0.17), (px, pz + 0.185), (px - 0.05, pz + 0.17), (px - 0.1, pz + 0.1)], 0.014, y + s * 0.02, M['chugun'], upr, fask=0.003)
    for i in range(7):
        a = math.radians(40 + i * 16.6)
        box('upr-sektor-zub', (0.012, 0.016, 0.012), (px + 0.19 * math.cos(a), y + s * 0.02, pz + 0.19 * math.sin(a) * 0.95 + 0.0), M['temn'], upr, fask=0.003)
    box('upr-osnovanie', (0.16, 0.08, 0.04), (px, y, ZD + 0.02), M['chugun'], upr, fask=0.01)
    a = math.radians(105 if s > 0 else 80)
    tip = Vector((px + 0.55 * math.cos(a), y, pz + 0.55 * math.sin(a)))
    sterzhen('upr-rychag', (px, y, pz), tip, 0.014, M['blesk'], upr, seg=12)
    lathe('upr-rukoyat', [(0, 0), (0.02, 0.005), (0.024, 0.05), (0.02, 0.09), (0, 0.1)], M['brus'], upr, seg=16, at=osi(tip, tip - Vector((px, y, pz))))
    # тяга к регулятору своей машины
    vx = (CX0 + CX1) / 2 - 0.05
    p0 = Vector((px + 0.12 * math.cos(a), y, pz + 0.12 * math.sin(a)))
    truba('upr-tyaga', [p0, Vector((-0.4, s * 0.38, ZD + 0.12)), Vector((0.1, s * 0.40, ZD + 0.14)), Vector((vx - 0.02, s * (YE - 0.06), EZ + 0.05)),
                        Vector((vx, s * (YE - 0.06), EZ + RC + 0.2))], 0.007, M['blesk'], upr, res=10)
# паропроводы от котла к машинам и выхлоп в трубу (медь)
for s in SIDES:
    truba('mashina-paroprovod', [Vector((SX, s * 0.04, top + 0.12)), Vector((SX + 0.15, s * 0.12, top + 0.10)), Vector((0.12, s * 0.42, top - 0.15)),
                             Vector(((CX0 + CX1) / 2 - 0.05, s * YE, EZ + RC + 0.32)), Vector(((CX0 + CX1) / 2 - 0.05, s * YE, EZ + RC + 0.24))], 0.019, M['med'], mash, res=14)
    truba('mashina-vyhlop', [Vector((CX0 + 0.05, s * (YE - 0.09), EZ - 0.02)), Vector((0.02, s * 0.36, EZ + 0.05)), Vector((KX + 0.3, s * 0.18, ZD + 0.7)),
                         Vector((TX + 0.09, s * 0.03, TZ0 + 0.25)), Vector((TX + 0.07, s * 0.0, TZ0 + 0.32))], 0.016, M['med'], mash, res=14)
    for t in (0.3, 0.6):
        pass

# ══ 7. ДОРОГА (диорама) ════════════════════════════════════════════════════════════════════════════
dor = uzel('doroga')
NX, NY = 164, 118
xs = np.linspace(-GX, GX, NX); ys = np.linspace(-GY, GY, NY)
XX, YY = np.meshgrid(xs, ys); HH, MS = rel(XX, YY)
verts, faces, uvs = [], [], []
for j in range(NY):
    for i in range(NX):
        verts.append((xs[i], ys[j], float(HH[j, i]))); uvs.append(((xs[i] + GX) / (2 * GX), (ys[j] + GY) / (2 * GY)))
for j in range(NY - 1):
    for i in range(NX - 1):
        a = j * NX + i; faces.append((a, a + 1, a + NX + 1, a + NX))
mesh_obj('doroga-zemlya', verts, faces, uvs, M['zemlya'], dor)
# срез земли по периметру + фаска-закругление сверху
ZB = -0.24
per = [(xs[i], ys[0]) for i in range(NX)] + [(xs[-1], ys[j]) for j in range(1, NY)] + [(xs[i], ys[-1]) for i in range(NX - 2, -1, -1)] + [(xs[0], ys[j]) for j in range(NY - 2, 0, -1)]
per.append(per[0])
verts, faces, uvs = [], [], []; sdl = 0.0
for k, (x, y) in enumerate(per):
    hz = float(rel(np.array(x), np.array(y))[0])
    if k: sdl += math.hypot(x - per[k - 1][0], y - per[k - 1][1])
    for zz in (ZB, hz):
        verts.append((x, y, zz)); uvs.append((sdl / 1.2, (zz - ZB) / 0.3))
for k in range(len(per) - 1):
    a = 2 * k; faces.append((a, a + 2, a + 3, a + 1))
mesh_obj('doroga-srez', verts, faces, uvs, M['sloi'], dor, smooth=False)
box('doroga-dno', (2 * GX, 2 * GY, 0.01), (0, 0, ZB + 0.005), M['sloi'], dor, fask=0.0)
box('doroga-podstavka', (2 * GX + 0.12, 2 * GY + 0.12, 0.07), (0, 0, ZB - 0.035), M['plinth'], dor, fask=0.02, tile=2.0, seg=3)
# вода в колеях и в луже: плоские сетки по ячейкам ниже уровня
verts, faces = [], []; idx = {}
def vid(i, j):
    if (i, j) not in idx: idx[(i, j)] = len(verts); verts.append((xs[i], ys[j], VODA_Z))
    return idx[(i, j)]
for j in range(NY - 1):
    for i in range(NX - 1):
        if min(HH[j, i], HH[j, i + 1], HH[j + 1, i], HH[j + 1, i + 1]) < VODA_Z and xs[i] > XF - 0.1:
            faces.append((vid(i, j), vid(i + 1, j), vid(i + 1, j + 1), vid(i, j + 1)))
mesh_obj('doroga-voda', verts, faces, None, M['voda'], dor, smooth=False)
# трава по обочинам
def puchok(c, n, h, mt):
    vs, fs = [], []
    for b in range(n):
        a = R.random() * TAU; nak = 0.25 + 0.5 * R.random(); hh = h * (0.6 + 0.6 * R.random()); w = 0.006 + 0.004 * R.random()
        d = Vector((math.cos(a), math.sin(a), 0)); side = Vector((-d.y, d.x, 0))
        base = len(vs)
        for k, t in enumerate((0.0, 0.5, 1.0)):
            p = Vector(c) + d * (nak * hh * t * t) + Vector((0, 0, hh * t * (1 - 0.15 * t)))
            ww = w * (1 - t) + 0.0005
            vs += [tuple(p - side * ww), tuple(p + side * ww)]
        fs += [(base, base + 1, base + 3, base + 2), (base + 2, base + 3, base + 5, base + 4)]
    return vs, fs
for mt, kol in ((M['trava'], 150), (M['trava2'], 90)):
    V, F = [], []
    for _ in range(kol):
        x = R.uniform(-GX + 0.04, GX - 0.04); ay = R.uniform(1.0, GY - 0.03) if R.random() < 0.9 else R.uniform(0.0, 0.25)
        y = ay * (1 if R.random() < 0.5 else -1)
        if abs(y) < 0.3 and x < XF: continue
        z = float(rel(np.array(x), np.array(y))[0])
        v, f = puchok((x, y, z - 0.003), 9, 0.07 + 0.08 * R.random() * (1 if abs(y) > 1 else 0.5), mt)
        F += [tuple(q + len(V) for q in ff) for ff in f]; V += v
    mesh_obj('doroga-trava', V, F, None, mt, dor)
# камни
for _ in range(26):
    x = R.uniform(-GX + 0.1, GX - 0.1); y = R.uniform(-GY + 0.08, GY - 0.08)
    if abs(x) < 1.3 and abs(y) < 0.9: continue
    r = 0.012 + 0.03 * R.random() ** 2
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=r)
    for v in bm.verts: v.co *= 1 + 0.25 * math.sin(v.co.x * 400 + v.co.y * 300)
    z = float(rel(np.array(x), np.array(y))[0])
    bm_obj('doroga-kamen', bm, Matrix.Translation((x, y, z + r * 0.2)) @ Matrix.Diagonal((1.3, 1.0, 0.55, 1.0)), M['kamen'], dor, tile=0.1)
# увязшее колесо от телеги в колее впереди
cx, cy = 1.56, -TY - 0.05
atk = osi((cx, cy, 0.035), (0.30, 0.35, 1.0))
Rk = 0.27
lathe('doroga-telega-obod', [(Rk - 0.04, -0.03), (Rk, -0.03), (Rk + 0.012, -0.025), (Rk + 0.012, 0.025), (Rk, 0.03), (Rk - 0.04, 0.03), (Rk - 0.045, 0.0), (Rk - 0.04, -0.03)],
      M['brus'], dor, seg=56, at=atk)
lathe('doroga-telega-shina', [(Rk + 0.012, -0.022), (Rk + 0.02, -0.02), (Rk + 0.02, 0.02), (Rk + 0.012, 0.022)], M['chugun'], dor, seg=56, at=atk)
lathe('doroga-telega-stupica', [(0, -0.09), (0.04, -0.09), (0.06, -0.06), (0.065, 0.0), (0.06, 0.06), (0.04, 0.09), (0, 0.09)], M['brus'], dor, seg=24, at=atk)
for i in range(10):
    a = TAU * i / 10
    sterzhen('doroga-telega-spica', atk @ Vector((0.055 * math.cos(a), 0.055 * math.sin(a), 0)), atk @ Vector(((Rk - 0.035) * math.cos(a), (Rk - 0.035) * math.sin(a), 0)),
             0.014, M['brus'], dor, seg=8)
# верстовой столб у обочины — чёрно-белые полосы
sx, sy = 1.62, 1.18; sz = float(rel(np.array(sx), np.array(sy))[0]) - 0.02
for k in range(7):
    box('doroga-stolb', (0.07, 0.07, 0.085), (sx, sy, sz + 0.0425 + k * 0.085), M['belyj'] if k % 2 else M['chern'], dor, fask=0.008)
lathe('doroga-stolb-verh', [(0.0, 0.0), (0.05, 0.0), (0.05, 0.02), (0.0, 0.07)], M['chern'], dor, seg=4, at=osi((sx, sy, sz + 0.595), (0, 0, 1)), phase=math.pi / 4)

# ── слить меши внутри каждого узла по материалам, сгладить по углу ─────────────────────────────────────
def sliyanie():
    gruppy = {}
    for o in VSE:
        gruppy.setdefault(o.parent.name, {}).setdefault(o.data.materials[0].name, []).append(o)
    for imya, e in UZLY.items():
        po = gruppy.get(imya, {})
        for mn, obs in po.items():
            for ob in obs:
                mw = ob.matrix_world.copy(); ob.parent = None; ob.matrix_world = mw
            if len(obs) > 1:
                with bpy.context.temp_override(active_object=obs[0], object=obs[0], selected_objects=obs, selected_editable_objects=obs):
                    bpy.ops.object.join()
            ob = obs[0]; ob.name = f'{imya}--{mn}'; ob.data.name = ob.name
            with bpy.context.temp_override(active_object=ob, object=ob, selected_objects=[ob], selected_editable_objects=[ob]):
                bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
                if mn not in ('dym', 'dym-temnyj', 'trava-suhaya', 'trava-zelenaya'):
                    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(42))
            ob.parent = e
bpy.context.view_layer.update()
sliyanie()

# центрирование: в glTF центр примерно в начале координат
tri = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH':
        ob.data.calc_loop_triangles(); tri += len(ob.data.loop_triangles)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=True, export_extras=True,
                          export_image_format='JPEG', export_materials='EXPORT', export_tangents=False, export_lights=False,
                          export_cameras=False)
print('GLB', OUT, os.path.getsize(OUT), 'байт, треугольников', tri, 'узлы', list(UZLY))
