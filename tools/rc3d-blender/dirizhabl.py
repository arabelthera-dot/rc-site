# r593-29: первый в мире дирижабль на жёстком каркасе «Россия» О. С. Костовича (1879–1889) кодом в Блендере 4.2.
# Сцена «постройка на Охтинской верфи»: корабль стоит на деревянных козлах-ложементах, обшивка с одного бока ещё
# не набрана — виден каркас из арборита (фанеры), шахта-«втулка» с тросами-«спицами», главный вал к винту.
#   ~/opt/blender-run.sh -b --python dirizhabl.py -- <выход.glb>
#
# РАЗМЕРЫ — из файла дня 01-29.yaml: длина 64 м, поперёк больше 12 м (≈ 1 : 5,3), объём 5000 м³; вал — труба Ø 0,2 м,
# длина ≈ 30 м (почти половина корабля) — от шахты до носа; мотор — 8 цилиндров, 80 сил, 240 кг; шахта сквозь середину,
# внизу в ней экипаж и мотор. Масштаб модели 1 ед. ≈ 18,8 м (длина 3,4 ед.).
# ДОПУЩЕНИЯ: форма гондолы-лодки и винта — по чертежу проекта (лист фигур); рули на корме, цвет обшивки, число шпангоутов
# и стрингеров, цепная передача от мотора к валу — реконструкция; мотор — уменьшенный и увеличенный в масштабе
# (иначе его не видно), по снимку сохранившегося мотора в музее ВВС; козлы, бочки, лестница, листы фанеры — обстановка.
import bpy, bmesh, math, sys, os, faulthandler; faulthandler.enable()
import numpy as np
from mathutils import Vector, Matrix

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['/tmp/pomoshchniki/r593-3d-mashiny-v2/29/raw.glb']
OUT = A[0]
DIR = os.path.dirname(os.path.abspath(OUT))
TEX = os.path.join(DIR, 'tex'); os.makedirs(TEX, exist_ok=True)
TAU = math.tau

L = 3.4            # длина корпуса
R = 0.36           # наибольший радиус (64 м : 12+ м)
ZC = 0.76          # ось корпуса над настилом
XN, XK = -L / 2, L / 2
FR = [-1.40, -1.05, -0.70, -0.35, 0.0, 0.35, 0.70, 1.05, 1.40]   # шпангоуты-обода

def rr(x):
    t = (x - XN) / L
    if t <= 0 or t >= 1: return 0.0
    u = 2 * t - 1
    k = 2.0 if u < 0 else 2.6           # нос полнее, корма острее
    return R * (1 - abs(u) ** k) ** 0.62

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
rng = np.random.default_rng(1879)

# ── текстуры (numpy → png, без повторов-тайлов) ─────────────────────────────────────────────────────
def shum(n, m=None, beta=2.0, aniz=(1.0, 1.0)):
    m = m or n
    w = rng.standard_normal((n, m))
    fy = np.fft.fftfreq(n)[:, None] * aniz[0]; fx = np.fft.fftfreq(m)[None, :] * aniz[1]
    f = np.sqrt(fx * fx + fy * fy); f[0, 0] = 1
    s = np.real(np.fft.ifft2(np.fft.fft2(w) / f ** (beta / 2 + 0.5)))
    s -= s.min(); return s / s.max()
def ss(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def kartinka(imya, rgb):
    h, w = rgb.shape[:2]
    im = bpy.data.images.new(imya, w, h, alpha=False)
    px = np.ones((h, w, 4), np.float32); px[..., :3] = np.clip(rgb, 0, 1)   # значения уже в sRGB
    im.pixels.foreach_set(px.ravel())
    put = os.path.join(TEX, imya + '.png'); im.filepath_raw = put; im.file_format = 'PNG'; im.save()
    bpy.data.images.remove(im)
    return bpy.data.images.load(put)

def tex_obshivka(n=1024):
    """Лакированная обшивка: u — по окружности (24 полотнища), v — вдоль корпуса; швы, швы-шпангоуты, пятна лака."""
    a, b, c = shum(n, beta=2.2), shum(n, beta=3.2), shum(n, beta=1.0, aniz=(0.15, 1.0))
    v, u = np.mgrid[0:n, 0:n] / n
    base = np.array([0.56, 0.44, 0.28]) * (0.86 + 0.16 * a[..., None] + 0.06 * c[..., None])
    gore = u * 24; dg = np.abs(gore - np.round(gore)) / 24 * n       # расстояние до шва в пикселях
    shov = np.exp(-(dg / 1.3) ** 2)
    xs = (np.array(FR) - XN) / L
    dr = np.min(np.abs(v[..., None] - xs[None, None, :]), axis=2) * n
    ring = np.exp(-(dr / 1.6) ** 2)
    nit = 0.5 + 0.5 * np.sin(v * TAU * 220)                           # строчка вдоль полотнищ
    col = base * (1 - 0.32 * shov[..., None] - 0.25 * ring[..., None]) * (1 - 0.03 * nit[..., None])
    pyat = ss(0.78, 0.92, b)[..., None]
    col = col * (1 - 0.18 * pyat) + np.array([0.12, 0.06, 0.0]) * 0.2 * pyat
    return col
def tex_derevo(n=1024, m=1024, cvet=(0.74, 0.55, 0.32), temn=0.35, kolca=90, seed_aniz=0.04):
    """Дерево: волокно вдоль u (ось x картинки), кольца-полосы, сучки редко."""
    a = shum(n, m, beta=2.6, aniz=(1.0, seed_aniz)); b = shum(n, m, beta=1.4); g = shum(n, m, beta=3.0)
    v, u = np.mgrid[0:n, 0:m] / np.array([n, m])[:, None, None]
    pol = 0.5 + 0.5 * np.sin(TAU * kolca * (v + 0.35 * a + 0.02 * g))
    pol = pol ** 3
    col = np.array(cvet) * (1 - temn * pol[..., None]) * (0.85 + 0.25 * b[..., None])
    return col
def tex_nastil(n=1024):
    """Настил: старое серо-бурое дерево, 10 досок по v (каждая доска — своя полоса картинки), грязь, пятна смолы."""
    col = tex_derevo(n, n, cvet=(0.40, 0.34, 0.28), temn=0.30, kolca=140)
    g = shum(n, beta=2.0)
    col = col * (0.82 + 0.22 * g[..., None])
    smola = ss(0.86, 0.93, shum(n, beta=2.8))[..., None]
    col = col * (1 - 0.55 * smola)
    return col

img_obsh = kartinka('obshivka', tex_obshivka())
img_arb = kartinka('arborit', tex_derevo(1024, 1024, cvet=(0.84, 0.58, 0.30), temn=0.32, kolca=60))
img_nast = kartinka('nastil', tex_nastil())
img_lodka = kartinka('lodka', tex_derevo(512, 512, cvet=(0.42, 0.25, 0.14), temn=0.4, kolca=40))

# ── материалы ─────────────────────────────────────────────────────────────────────────────────────
def mat(imya, cvet, metal, sher, coat=0.0, img=None):
    m = bpy.data.materials.new(imya); m.use_nodes = True
    t = m.node_tree; b = t.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*cvet, 1)
    b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = sher
    if coat: b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.08
    if img is not None:
        tc = t.nodes.new('ShaderNodeTexImage'); tc.image = img
        t.links.new(tc.outputs['Color'], b.inputs['Base Color'])
    return m
M = {
    'obsh':   mat('obshivka-lak', (1, 1, 1), 0.0, 0.34, img=img_obsh),
    'arb':    mat('arborit', (1, 1, 1), 0.0, 0.45, img=img_arb),
    'nast':   mat('nastil', (1, 1, 1), 0.0, 0.85, img=img_nast),
    'lodka':  mat('lodka-lak', (1, 1, 1), 0.0, 0.30, img=img_lodka),
    'chugun': mat('chugun', (0.075, 0.075, 0.08), 0.85, 0.48),
    'latun':  mat('latun', (0.80, 0.58, 0.28), 1.0, 0.26),
    'stal':   mat('stal', (0.62, 0.62, 0.64), 1.0, 0.24),
    'med':    mat('med', (0.80, 0.45, 0.30), 1.0, 0.32),
    'tros':   mat('tros-stalnoj', (0.30, 0.30, 0.31), 0.9, 0.42),
    'verevka':mat('verevka-penka', (0.62, 0.52, 0.36), 0.0, 0.9),
    'kozha':  mat('kozha', (0.25, 0.12, 0.07), 0.0, 0.55),
    'tkan':   mat('tkan-ruley', (0.70, 0.62, 0.48), 0.0, 0.7),
}

# ── построители ───────────────────────────────────────────────────────────────────────────────────
def mesh_obj(imya, verts, faces, uvs, material, rodit, smooth=True):
    me = bpy.data.meshes.new(imya); me.from_pydata(verts, [], faces); me.validate()
    if uvs is not None:
        ul = me.uv_layers.new(name='UV')
        for p in me.polygons:
            for li, vi in zip(p.loop_indices, p.vertices): ul.data[li].uv = uvs[vi]
    for p in me.polygons: p.use_smooth = smooth
    me.materials.append(material)
    ob = bpy.data.objects.new(imya, me); sc.collection.objects.link(ob); ob.parent = rodit
    return ob

def osi(p, d):
    d = Vector(d).normalized()
    return Matrix.Translation(Vector(p)) @ Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()

def lathe(imya, prof, material, rodit, seg=48, tile=0.5, at=Matrix.Identity(4), phase=0.0):
    """Тело вращения вокруг локальной Z. prof — [(r, z), …]; None — острый излом."""
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

def box(imya, size, centr, material, rodit, fask=0.006, rot=None, tile=0.6, uvsdvig=(0, 0)):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    if fask > 0: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=fask, segments=2, profile=0.5, affect='EDGES')
    T = Matrix.Translation(Vector(centr)) @ (rot if rot else Matrix.Identity(4))
    bmesh.ops.transform(bm, matrix=T, verts=bm.verts)
    me = bpy.data.meshes.new(imya); bm.to_mesh(me); bm.free()
    uv = me.uv_layers.new(name='UV')
    R3 = (rot if rot else Matrix.Identity(4)).to_3x3()
    for p in me.polygons:
        n = R3.transposed() @ p.normal; ax = max(range(3), key=lambda k: abs(n[k])); u_, v_ = [k for k in range(3) if k != ax]
        if ax == 2: u_, v_ = 0, 1
        for li, vi in zip(p.loop_indices, p.vertices):
            v = R3.transposed() @ (me.vertices[vi].co - Vector(centr))
            uv.data[li].uv = (v[u_] / tile + uvsdvig[0], v[v_] / tile + uvsdvig[1])
    for p in me.polygons: p.use_smooth = True
    me.materials.append(material)
    ob = bpy.data.objects.new(imya, me); sc.collection.objects.link(ob); ob.parent = rodit
    ob.modifiers.new('wn', 'WEIGHTED_NORMAL').keep_sharp = True
    return ob

def plita(imya, poly, tol, at, material, rodit, fask=0.004, tile=0.4):
    """Плоская деталь по контуру poly [(u, v)] в плоскости XY локально, толщина tol по Z, фаска по всем рёбрам."""
    bm = bmesh.new()
    vs = [bm.verts.new((u, v, -tol / 2)) for u, v in poly]
    f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    for e in r['geom']:
        if isinstance(e, bmesh.types.BMVert): e.co.z += tol
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if fask > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=min(fask, tol * 0.4), segments=2, profile=0.5, affect='EDGES', clamp_overlap=True)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    me = bpy.data.meshes.new(imya); bm.to_mesh(me); bm.free()
    uv = me.uv_layers.new(name='UV')
    for p in me.polygons:
        for li, vi in zip(p.loop_indices, p.vertices):
            v = me.vertices[vi].co; uv.data[li].uv = (v.x / tile, v.y / tile + v.z / tile)
    me.transform(at)
    for p in me.polygons: p.use_smooth = True
    me.materials.append(material)
    ob = bpy.data.objects.new(imya, me); sc.collection.objects.link(ob); ob.parent = rodit
    ob.modifiers.new('wn', 'WEIGHTED_NORMAL').keep_sharp = True
    return ob

def sterzhen(imya, p1, p2, r, material, rodit, seg=12, fask=None):
    p1, p2 = Vector(p1), Vector(p2); Ld = (p2 - p1).length
    f = r * 0.25 if fask is None else fask
    pr = [(0, 0), (r - f, 0), (r, f), (r, Ld - f), (r - f, Ld), (0, Ld)]
    return lathe(imya, pr, material, rodit, seg=seg, at=osi(p1, p2 - p1), tile=0.2)

def tor(imya, Rr, r, at, material, rodit, seg=48, k=8):
    pr = [(Rr + r * math.cos(TAU * j / k), r * math.sin(TAU * j / k)) for j in range(k + 1)]
    return lathe(imya, pr, material, rodit, seg=seg, at=at, tile=0.2)

def krivye(imya, linii, r, material, rodit, res=1, gladko=True):
    """Тросы/канаты/тяги: кривые (несколько сплайнов в одном объекте) с круглым сечением."""
    cu = bpy.data.curves.new(imya, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = r; cu.bevel_resolution = res; cu.use_fill_caps = True
    for pts in linii:
        if gladko and len(pts) > 2:
            sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
            for bp, p in zip(sp.bezier_points, pts):
                bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
            sp.resolution_u = 4
        else:
            sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
            for q, p in zip(sp.points, pts): q.co = (*p, 1)
    ob = bpy.data.objects.new(imya, cu); sc.collection.objects.link(ob); ob.parent = rodit
    cu.materials.append(material)
    return ob

def provis(p1, p2, sag, n=6):
    p1, p2 = Vector(p1), Vector(p2)
    return [tuple(p1.lerp(p2, i / n) - Vector((0, 0, sag * 4 * (i / n) * (1 - i / n)))) for i in range(n + 1)]

UZLY = {}
KOREN = bpy.data.objects.new('dirizhabl-rossiya', None); sc.collection.objects.link(KOREN)
def uzel(imya):
    e = bpy.data.objects.new(imya, None); sc.collection.objects.link(e); e.parent = KOREN
    e['uzel'] = imya
    UZLY[imya] = e
    return e

# ═══ 1. ОБШИВКА (с вырезом: бок ещё не обшит) ═════════════════════════════════════════════════════════
obol = uzel('obolochka')
NA = 64
xs = sorted(set([round(x, 4) for x in np.linspace(XN, XK, 72)] + FR))
xs = [x for x in xs if XN < x < XK]
xs = [XN + 0.0005] + xs + [XK - 0.0005]
def ugol_v(a):          # a=0 — бок −Y (к зрителю), a=π/2 — верх
    return (-math.cos(a), math.sin(a))
# вырез: полотнища с углом в [−35°, 125°], каждое снято между своими шпангоутами — «рваный» край постройки
def snyato(j, x):
    a = TAU * (j + 0.5) / NA
    ad = math.degrees(a); ad = ad - 360 if ad > 180 else ad
    if not (-38 <= ad <= 128): return False
    gore = int((ad + 38) // 20)
    lo = [-1.05, -0.70, -1.05, -1.40, -1.05, -0.70, -1.05, -0.70, -1.05][gore % 9]
    hi = [0.70, 1.05, 0.70, 1.05, 0.70, 0.35, 0.70, 1.05, 0.70][gore % 9]
    return lo <= x <= hi
verts, uvs, faces = [], [], []
for i, x in enumerate(xs):
    r = rr(x)
    for j in range(NA + 1):
        a = TAU * j / NA; cy, cz = ugol_v(a)
        verts.append((x, r * cy, ZC + r * cz)); uvs.append((j / NA, (x - XN) / L))
for i in range(len(xs) - 1):
    xm = (xs[i] + xs[i + 1]) / 2
    for j in range(NA):
        if snyato(j, xm): continue
        a0 = i * (NA + 1) + j; b0 = (i + 1) * (NA + 1) + j
        faces.append((a0, b0, b0 + 1, a0 + 1))
ob_sk = mesh_obj('obshivka', verts, faces, uvs, M['obsh'], obol)
sol = ob_sk.modifiers.new('tolsh', 'SOLIDIFY'); sol.thickness = 0.007; sol.offset = 1.0; sol.use_even_offset = True
# пояса-бандажи поверх обшивки на шпангоутах (тёмное железо) — только где обшивка набрана
for x in FR:
    r = rr(x) + 0.006
    pts = []
    for j in range(NA + 1):
        a = TAU * j / NA
        if snyato(min(j, NA - 1), x + 0.001) or snyato(max(j - 1, 0), x + 0.001):
            if len(pts) > 1: krivye('bandazh', [pts], 0.0055, M['chugun'], obol, res=0, gladko=False)
            pts = []; continue
        cy, cz = ugol_v(a); pts.append((x, r * cy, ZC + r * cz))
    if len(pts) > 1: krivye('bandazh', [pts], 0.0055, M['chugun'], obol, res=0, gladko=False)
# латунные носовой и кормовой колпаки
lathe('nos-kolpak', [(0, -0.07), (0.018, -0.065), (0.03, -0.04), (0.045, 0.0), (0.05, 0.02), (0.0, 0.02)], M['latun'], obol, seg=32,
      at=osi((XN + 0.035, 0, ZC), (1, 0, 0)))
lathe('korma-kolpak', [(0, -0.09), (0.012, -0.08), (0.025, -0.03), (0.03, 0.0), (0.0, 0.0)], M['latun'], obol, seg=32,
      at=osi((XK - 0.02, 0, ZC), (-1, 0, 0)))
# рули: крест из четырёх перьев (каркас-рамка + натянутая ткань), допущение
for k in range(4):
    ang = TAU * k / 4 + math.pi / 4 * 0
    x0, x1 = 1.16, 1.60
    poly = [(x0, rr(x0) - 0.01), (x1, rr(x1) - 0.01), (x1 + 0.03, rr(x1) + 0.05), (x1 - 0.05, rr(x0) + 0.20), (x0 + 0.12, rr(x0) + 0.20)]
    rot = Matrix.Translation((0, 0, ZC)) @ Matrix.Rotation(ang, 4, 'X') @ Matrix.Rotation(math.pi / 2, 4, 'X')
    plita('rul-pero', poly, 0.010, rot, M['tkan'], obol, fask=0.003, tile=0.5)
    # окантовка пера деревянной рейкой
    rama = [poly[1], poly[2], poly[3], poly[4], poly[0]]
    T = Matrix.Translation((0, 0, ZC)) @ Matrix.Rotation(ang, 4, 'X') @ Matrix.Rotation(math.pi / 2, 4, 'X')
    krivye('rul-rejka', [[tuple(T @ Vector((u, v, 0))) for u, v in rama[:-1]] + [tuple(T @ Vector((rama[0][0], rama[0][1], 0)))]],
           0.008, M['arb'], obol, res=1, gladko=False)
    # петли руля
    for xx in (x0 + 0.08, x1 - 0.06):
        p = T @ Vector((xx, rr(xx) + 0.005, 0)); sterzhen('rul-petlya', p - (T.to_3x3() @ Vector((0, 0, 0.018))), p + (T.to_3x3() @ Vector((0, 0, 0.018))), 0.012, M['latun'], obol, seg=12)

# ═══ 2. КАРКАС ИЗ АРБОРИТА: обода-фермы и стрингеры ═════════════════════════════════════════════════
kark = uzel('karkas-iz-arborita')
for x in FR:
    r = rr(x) - 0.004
    h = min(0.06, r * 0.22)
    at = osi((x, 0, ZC), (1, 0, 0))
    nseg = 48
    tor('obod-vnesh', r - 0.009, 0.009, at, M['arb'], kark, seg=nseg, k=6)
    tor('obod-vnutr', r - h, 0.007, at, M['arb'], kark, seg=nseg, k=6)
    # решётка фермы-обода: зигзаг между кольцами
    nz = 36; zig = []
    for i in range(nz + 1):
        a = TAU * i / nz
        rad = r - 0.009 if i % 2 == 0 else r - h
        zig.append(tuple(at @ Vector((rad * math.cos(a), rad * math.sin(a), 0))))
    krivye('obod-reshetka', [zig], 0.0045, M['arb'], kark, res=0, gladko=False)
# стрингеры — продольные рейки по обшивке
NS = 24
lin = []
for j in range(NS):
    a = TAU * (j + 0.5) / NS; cy, cz = ugol_v(a)
    pts = []
    for x in np.linspace(XN + 0.06, XK - 0.05, 26):
        r = rr(x) - 0.012
        pts.append((x, r * cy, ZC + r * cz))
    lin.append(pts)
krivye('stringer', lin, 0.0075, M['arb'], kark, res=0, gladko=False)
# латунные косынки-накладки на пересечениях в вырезе
for x in FR[2:7]:
    for j in range(NS):
        a = TAU * (j + 0.5) / NS; cy, cz = ugol_v(a); r = rr(x) - 0.012
        if not (-40 < math.degrees(a if a < math.pi else a - TAU) < 130): continue
        p = Vector((x, r * cy, ZC + r * cz)); n = Vector((0, cy, cz))
        lathe('kosynka', [(0, 0), (0.011, 0), (0.012, 0.004), (0, 0.006)], M['latun'], kark, seg=10, at=osi(p, n))

# ═══ 3. ШАХТА-ВТУЛКА И ТРОСЫ-СПИЦЫ («велосипедное колесо») ═══════════════════════════════════════════
sh = uzel('shahta-i-trosy')
ZB, ZT = 0.16, ZC + R - 0.02           # шахта от дна гондолы до верха корпуса
S = 0.045
for sx in (-1, 1):
    for sy in (-1, 1):
        sterzhen('shahta-stoyka', (sx * S, sy * S, ZB), (sx * S, sy * S, ZT), 0.008, M['arb'], sh, seg=10)
diag = []
zz = np.linspace(ZB + 0.12, ZT - 0.02, 12)
for k in range(len(zz)):
    z = zz[k]
    for sx, sy, ex, ey in ((-1, -1, 1, -1), (1, -1, 1, 1), (1, 1, -1, 1), (-1, 1, -1, -1)):
        diag.append([(sx * S, sy * S, z), (ex * S, ey * S, z)])
        if k + 1 < len(zz): diag.append([(sx * S, sy * S, z), (ex * S, ey * S, zz[k + 1])])
krivye('shahta-reshetka', diag, 0.0035, M['arb'], sh, res=0, gladko=False)
# ступицы-втулки на шахте (латунь), к ним — тросы
VT = [ZC - 0.22, ZC, ZC + 0.22]
for z in VT:
    lathe('vtulka', [(0, -0.018), (0.068, -0.018), (0.075, -0.01), (0.075, 0.01), (0.068, 0.018), (0, 0.018)], M['latun'], sh, seg=32,
          at=osi((0, 0, z), (0, 0, 1)))
trosy = []
for x in (-0.70, -0.35, 0.35, 0.70):
    r = rr(x) - 0.03
    for j in range(16):
        a = TAU * (j + 0.5) / 16; cy, cz = ugol_v(a)
        p = (x, r * cy, ZC + r * cz)
        z0 = VT[2] if cz > 0.35 else (VT[0] if cz < -0.35 else VT[1])
        trosy.append([(0.0, 0.07 * cy, z0), p])
r0 = rr(0) - 0.03
for j in range(20):                                        # колесо в сечении у шахты
    a = TAU * (j + 0.5) / 20; cy, cz = ugol_v(a)
    if abs(cy) < 0.12: continue
    z0 = VT[2] if cz > 0.35 else (VT[0] if cz < -0.35 else VT[1])
    trosy.append([(0.0, 0.07 * math.copysign(1, cy), z0), (0.0, r0 * cy, ZC + r0 * cz)])
krivye('tros-spica', trosy, 0.0022, M['tros'], sh, res=1, gladko=False)
# люк-площадка наверху шахты
lathe('shahta-lyuk', [(0, 0), (0.075, 0), (0.08, 0.008), (0.06, 0.018), (0, 0.02)], M['latun'], sh, seg=32, at=osi((0, 0, ZT + 0.008), (0, 0, 1)))

# ═══ 4. ГЛАВНЫЙ ВАЛ ИЗ АРБОРИТА И ВИНТ ═════════════════════════════════════════════════════════════════
val = uzel('val-i-vint')
XV = XN - 0.10                         # ступица винта перед носом
lathe('val-truba', [(0, 0), (0.016, 0), (0.019, 0.003), (0.019, -XV - 0.003), (0.016, -XV), (0, -XV)], M['arb'], val, seg=20,
      at=osi((XV, 0, ZC), (1, 0, 0)), tile=0.3)
for x in FR[:5] + [XN + 0.05]:          # подшипники-обоймы на ободах
    lathe('val-podshipnik', [(0.019, -0.016), (0.03, -0.016), (0.034, -0.01), (0.034, 0.01), (0.03, 0.016), (0.019, 0.016)], M['latun'], val, seg=24,
          at=osi((x, 0, ZC), (1, 0, 0)))
    if x in FR[:4]:
        r = rr(x) - 0.05
        krivye('val-rastyazhka', [[(x, 0, ZC), (x, r * math.cos(t), ZC + r * math.sin(t))] for t in (math.pi / 4, 3 * math.pi / 4, 5 * math.pi / 4, 7 * math.pi / 4)],
               0.0018, M['tros'], val, res=0, gladko=False)
# цепная передача от мотора вверх по шахте к валу (допущение)
lathe('zvezda-verh', [(0, -0.008), (0.05, -0.008), (0.055, -0.004), (0.055, 0.004), (0.05, 0.008), (0, 0.008)], M['stal'], val, seg=24,
      at=osi((0.0, 0.0, ZC), (0, 1, 0)))
krivye('cep', [[(-0.05, 0.0, ZC), (-0.05, 0.0, 0.30)], [(0.05, 0.0, ZC), (0.05, 0.0, 0.30)]], 0.004, M['chugun'], val, res=0, gladko=False)
# ступица винта
lathe('vint-stupica', [(0, -0.06), (0.022, -0.058), (0.04, -0.03), (0.045, 0.0), (0.04, 0.03), (0.028, 0.05), (0.0, 0.055)], M['latun'], val, seg=32,
      at=osi((XV, 0, ZC), (-1, 0, 0)))
# лопасти с круткой: сечения-профили вдоль радиуса
RV = 0.34
def lopast(faza):
    ns, nc = 18, 14
    vs, uv, fs = [], [], []
    for i in range(ns):
        s = i / (ns - 1); rad = 0.035 + (RV - 0.035) * s
        chord = 0.05 + 0.085 * math.sin(math.pi * min(1, 0.15 + s * 0.95)) * (1 - 0.35 * s)
        if i == ns - 1: chord *= 0.35
        thick = chord * (0.18 - 0.08 * s)
        pitch = math.radians(58 - 40 * s)            # крутка: у корня круче, к концу положе
        for k in range(nc):
            t = TAU * k / nc
            cx = 0.5 * chord * math.cos(t); cz = 0.5 * thick * math.sin(t) * (1.0 + 0.4 * math.cos(t))
            # cx — по хорде (вдоль окружности вращения), cz — по оси вала; поворот на угол установки
            u = cx * math.cos(pitch) - cz * math.sin(pitch); w = cx * math.sin(pitch) + cz * math.cos(pitch)
            p = Matrix.Rotation(faza, 3, 'X') @ Vector((w - 0.01, u, rad))
            vs.append((XV + p.x, p.y, ZC + p.z)); uv.append((k / nc, s))
    for i in range(ns - 1):
        for k in range(nc):
            a = i * nc + k; b = i * nc + (k + 1) % nc
            fs.append((a, b, b + nc, a + nc))
    c = len(vs); p = Matrix.Rotation(faza, 3, 'X') @ Vector((-0.01, 0, RV + 0.004)); vs.append((XV + p.x, p.y, ZC + p.z)); uv.append((0.5, 1))
    for k in range(nc):
        fs.append(((ns - 1) * nc + k, (ns - 1) * nc + (k + 1) % nc, c))
    o = mesh_obj('vint-lopast', vs, fs, uv, M['lodka'], val)
    sd = o.modifiers.new('sd', 'SUBSURF'); sd.levels = 1; sd.render_levels = 1
    # латунная оковка конца лопасти
for f in (0.0, math.pi):
    lopast(f)
lathe('vint-obtekatel', [(0, -0.09), (0.01, -0.088), (0.022, -0.07), (0.03, -0.04), (0.03, 0.0), (0, 0)], M['latun'], val, seg=32,
      at=osi((XV - 0.055, 0, ZC), (1, 0, 0)))

# ═══ 5. ГОНДОЛА-ЛОДКА (низ шахты: экипаж и мотор) ═══════════════════════════════════════════════════════
gon = uzel('gondola')
LG, BG = 1.04, 0.25
def gw(x):  # полуширина
    t = min(1.0, abs(2 * x / LG)); return BG / 2 * max(0.0, 1 - t ** 2.4) ** 0.6
def gzb(x): t = abs(2 * x / LG); return 0.10 + 0.07 * t ** 3
def gzt(x): t = abs(2 * x / LG); return 0.245 + 0.03 * t ** 2
NX, NT = 48, 14
vs, uv, fs = [], [], []
gxs = [(-LG / 2) * math.cos(math.pi * i / (NX - 1)) for i in range(NX)]
for i, x in enumerate(gxs):
    w = max(gw(x), 0.002); zb, zt = gzb(x), gzt(x)
    for k in range(NT):
        th = -math.pi / 2 + math.pi * k / (NT - 1)
        y = w * math.sin(th); z = zt - (zt - zb) * (abs(math.cos(th)) ** 0.55)
        vs.append((x, y, z)); uv.append(((x + LG / 2) / LG, k / (NT - 1) * 0.3))
for i in range(NX - 1):
    for k in range(NT - 1):
        a = i * NT + k; fs.append((a, a + 1, a + NT + 1, a + NT))
o = mesh_obj('gondola-korpus', vs, fs, uv, M['lodka'], gon)
sl = o.modifiers.new('tolsh', 'SOLIDIFY'); sl.thickness = 0.008; sl.offset = -1
# привальный брус по борту и киль
for s in (-1, 1):
    pts = [(x, s * gw(x), gzt(x) + 0.004) for x in np.linspace(-LG / 2 + 0.01, LG / 2 - 0.01, 30)]
    krivye('gondola-bort', [pts], 0.009, M['latun'], gon, res=1, gladko=False)
krivye('gondola-kil', [[(x, 0, gzb(x) - 0.004) for x in np.linspace(-LG / 2 + 0.02, LG / 2 - 0.02, 24)]], 0.010, M['arb'], gon, res=1, gladko=False)
# пайол и банки-скамьи для экипажа
box('gondola-pajol', (0.80, 0.16, 0.012), (0.0, 0, 0.125), M['arb'], gon, fask=0.003, tile=0.4)
for x in (-0.38, -0.27, -0.16):
    box('gondola-banka', (0.035, 2 * gw(x) - 0.02, 0.016), (x, 0, 0.205), M['arb'], gon, fask=0.004, tile=0.3)
# стойки и леер
posts = []
for s in (-1, 1):
    for x in np.linspace(-0.42, 0.42, 9):
        y = s * (gw(x) - 0.006)
        sterzhen('gondola-stoyka', (x, y, gzt(x)), (x, y, gzt(x) + 0.07), 0.004, M['latun'], gon, seg=8)
        posts.append((x, y, gzt(x) + 0.07))
    pp = [p for p in posts if p[1] * s > 0]
    krivye('gondola-leer', [[p for p in pp]], 0.0028, M['verevka'], gon, res=1, gladko=False)
# подвеска гондолы к корпусу — стропы
stropy = []
for s in (-1, 1):
    for x in np.linspace(-0.40, 0.40, 6):
        y = s * (gw(x) - 0.006); zt = gzt(x) + 0.07
        for dx in (-0.12, 0.12):
            xh = x + dx; rh = rr(xh) + 0.004
            stropy.append([(x, y, zt), (xh, s * rh * math.sin(math.radians(28)), ZC - rh * math.cos(math.radians(28)))])
krivye('gondola-stropa', stropy, 0.0022, M['verevka'], gon, res=1, gladko=False)

# ═══ 6. ДВИГАТЕЛЬ: 8 цилиндров, маховик (по снимку мотора в музее ВВС; масштаб увеличен) ═══════════════
dv = uzel('dvigatel')
XE = 0.24; ZE = 0.15                  # центр мотора и низ рамы
LE = 0.30
for s in (-1, 1):                     # продольные балки рамы
    box('dv-rama', (LE + 0.04, 0.014, 0.016), (XE, s * 0.045, ZE + 0.008), M['chugun'], dv, fask=0.003)
for xx in (XE - LE / 2, XE, XE + LE / 2):   # три А-образные стойки (щёки)
    hgt = 0.15 if xx == XE else 0.11
    poly = [(-0.045, 0), (0.045, 0), (0.016, hgt), (-0.016, hgt)]
    for s in (-1, 1):
        at = Matrix.Translation((xx, s * 0.045, ZE)) @ Matrix.Rotation(math.pi / 2, 4, 'X')
        plita('dv-shcheka', poly, 0.010, at, M['chugun'], dv, fask=0.002, tile=0.2)
        lathe('dv-podshipnik', [(0, -0.008), (0.012, -0.008), (0.014, 0), (0.012, 0.008), (0, 0.008)], M['latun'], dv, seg=16,
              at=osi((xx, s * 0.052, ZE + hgt), (0, 1, 0)))
# цилиндры: 4 латунных блока × 2 = 8 цилиндров, лежачие оппозитные
for s in (-1, 1):
    for side in (-1, 1):
        x0 = XE + side * 0.012; x1 = XE + side * (LE / 2 - 0.012)
        y = s * 0.028; z = ZE + 0.035
        Lc = abs(x1 - x0)
        lathe('dv-cilindr', [(0, 0), (0.018, 0), (0.022, 0.004), (0.022, 0.012), (0.019, 0.016), (0.019, Lc - 0.016), (0.022, Lc - 0.012),
                             (0.022, Lc - 0.004), (0.018, Lc), (0, Lc)], M['latun'], dv, seg=24, at=osi((x0, y, z), (side, 0, 0)), tile=0.2)
        for q in np.linspace(0.03, Lc - 0.03, 5):  # рёбра охлаждения
            tor('dv-rebro', 0.0195, 0.0025, osi((x0 + side * q, y, z), (side, 0, 0)), M['latun'], dv, seg=20, k=6)
# коленвал, маховик со спицами, шатуны-тяги
ZK = ZE + 0.15
sterzhen('dv-kolenval', (XE, -0.065, ZK), (XE, 0.065, ZK), 0.007, M['stal'], dv, seg=12)
RM = 0.105
mat_m = osi((XE, -0.075, ZK), (0, 1, 0))
lathe('dv-mahovik-obod', [(RM - 0.008, -0.006), (RM, -0.006), (RM + 0.003, -0.003), (RM + 0.003, 0.003), (RM, 0.006), (RM - 0.008, 0.006), (RM - 0.010, 0)],
      M['chugun'], dv, seg=64, at=mat_m)
lathe('dv-mahovik-stupica', [(0, -0.012), (0.016, -0.012), (0.018, 0), (0.016, 0.012), (0, 0.012)], M['latun'], dv, seg=20, at=mat_m)
sp = []
for k in range(24):
    a = TAU * k / 24; b = a + (0.25 if k % 2 else -0.25)
    sp.append([(XE + 0.014 * math.cos(b), -0.075 + (0.008 if k % 2 else -0.008), ZK + 0.014 * math.sin(b)),
               (XE + (RM - 0.009) * math.cos(a), -0.075, ZK + (RM - 0.009) * math.sin(a))])
krivye('dv-mahovik-spica', sp, 0.0014, M['stal'], dv, res=0, gladko=False)
shat = []
for s in (-1, 1):
    for side in (-1, 1):
        shat.append([(XE + side * (LE / 2 - 0.01), s * 0.05, ZE + 0.11), (XE + side * 0.012, s * 0.05, ZK)])
        shat.append([(XE + side * (LE / 2 - 0.01), s * 0.05, ZE + 0.11), (XE + side * (LE / 2 - 0.01), s * 0.028, ZE + 0.06)])
krivye('dv-tyaga', shat, 0.0045, M['stal'], dv, res=1, gladko=False)
lathe('dv-zvezda', [(0, -0.006), (0.04, -0.006), (0.044, 0), (0.04, 0.006), (0, 0.006)], M['stal'], dv, seg=24, at=osi((XE, 0.07, ZK), (0, 1, 0)))
# бензиновый бак и медные трубки (допущение)
lathe('dv-bak', [(0, 0), (0.022, 0), (0.028, 0.008), (0.028, 0.08), (0.022, 0.088), (0, 0.088)], M['med'], dv, seg=24,
      at=osi((XE + LE / 2 + 0.04, -0.04, ZE + 0.05), (0, 1, 0)))
krivye('dv-trubka', [[(XE + LE / 2 + 0.04, 0.0, ZE + 0.078), (XE + LE / 2 + 0.02, 0.0, ZE + 0.10), (XE + 0.06, 0.028, ZE + 0.065)]], 0.003, M['med'], dv, res=1)

# ═══ 7. СТАПЕЛЬ ОХТИНСКОЙ ВЕРФИ: настил, козлы-ложементы, бочки, фанера, лестница ═══════════════════════
st = uzel('stapel')
DX, DY = 3.95, 1.15
NB = 10
bw = DY / NB
for i in range(NB):
    y = -DY / 2 + bw * (i + 0.5)
    # доска с вершинами вдоль длины — для запечённой тени (цвет вершин)
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=44, y_segments=2, size=0.5)
    bmesh.ops.scale(bm, vec=(DX - 0.02 * (i % 3), bw - 0.01, 1), verts=bm.verts)
    bm.faces.ensure_lookup_table()
    r = bmesh.ops.extrude_face_region(bm, geom=list(bm.faces))
    for e in r['geom']:
        if isinstance(e, bmesh.types.BMVert): e.co.z -= 0.045
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.bevel(bm, geom=[e for e in bm.edges if e.is_boundary or len(e.link_faces) == 2 and e.calc_face_angle(0) > 0.5],
                    offset=0.005, segments=2, profile=0.5, affect='EDGES', clamp_overlap=True)
    jit = rng.uniform(-0.004, 0.004)
    bmesh.ops.translate(bm, vec=(0, y, jit), verts=bm.verts)
    me = bpy.data.meshes.new('nastil-doska'); bm.to_mesh(me); bm.free()
    ul = me.uv_layers.new(name='UV')
    ca = me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
    ton = rng.uniform(0.82, 1.08)
    for p in me.polygons:
        p.use_smooth = True
        for li, vi in zip(p.loop_indices, p.vertices):
            v = me.vertices[vi].co
            ul.data[li].uv = ((v.x + DX / 2) / DX, (i + (v.y - y) / bw + 0.5) / NB)
            # мягкая тень корабля, гондолы и козел
            d1 = ((v.x / 1.85) ** 2 + (v.y / 0.42) ** 2)
            d2 = (((v.x - 0.0) / 0.62) ** 2 + (v.y / 0.17) ** 2)
            sh_ = 0.55 * math.exp(-d1 ** 2 * 1.2) + 0.30 * math.exp(-d2 * 1.5)
            for xk in (-1.05, 1.05):
                sh_ += 0.18 * math.exp(-(((v.x - xk) / 0.12) ** 2 + (v.y / 0.4) ** 4))
            kr = min(1.0, (abs(v.x) / (DX / 2)) ** 6 + (abs(v.y) / (DY / 2)) ** 8)   # затемнение края, как в макете
            c = max(0.25, ton * (1 - sh_) * (1 - 0.25 * kr))
            ca.data[li].color = (c, c, c * 0.98, 1)
    me.materials.append(M['nast'])
    ob = bpy.data.objects.new('nastil-doska', me); sc.collection.objects.link(ob); ob.parent = st
# лаги под настилом
for x in (-1.65, -0.55, 0.55, 1.65):
    box('nastil-laga', (0.12, DY + 0.12, 0.08), (x, 0, -0.085), M['lodka'], st, fask=0.012, tile=0.4)
# козлы-ложементы
for xk in (-1.05, 1.05):
    rh = rr(xk); zb = ZC - rh                       # низ корпуса над этим местом
    zs = zb - 0.05                                  # низ седла
    wy = rh * 0.92
    # седло: брус с вырезом по корпусу
    poly = [(-wy, 0.0), (wy, 0.0), (wy, zb + rh * 0.42 - zs)]
    nar = 18
    for k in range(nar + 1):
        a = math.radians(-90 + 52) - math.radians(104) * k / nar   # дуга снизу корпуса справа → слева
        a = -math.pi / 2 + math.radians(50) * (1 - 2 * k / nar)
        y = (rh + 0.006) * math.cos(a); z = ZC + (rh + 0.006) * math.sin(a) - zs
        if abs(y) < wy: poly.append((y, z))
    poly.append((-wy, zb + rh * 0.42 - zs))
    at = Matrix.Translation((xk, 0, zs)) @ Matrix.Rotation(math.pi / 2, 4, 'Y') @ Matrix.Rotation(-math.pi / 2, 4, 'Z')
    at = Matrix(((0, 0, 1, xk), (1, 0, 0, 0), (0, 1, 0, zs), (0, 0, 0, 1)))
    plita('kozly-sedlo', poly, 0.08, at, M['arb'], st, fask=0.008, tile=0.5)
    # кожаная подкладка на седле
    pad = []
    for k in range(13):
        a = -math.pi / 2 + math.radians(38) * (1 - 2 * k / 12)
        pad.append((xk, (rh + 0.004) * math.cos(a), ZC + (rh + 0.004) * math.sin(a)))
    for dx in (-0.025, 0.0, 0.025):
        krivye('kozly-podkladka', [[(p[0] + dx, p[1], p[2]) for p in pad]], 0.008, M['kozha'], st, res=1)
    # ноги-стойки (наклонные), распорки
    for s in (-1, 1):
        for dx in (-0.06, 0.06):
            p_top = Vector((xk + dx * 0.4, s * (wy - 0.05), zs + 0.005)); p_bot = Vector((xk + dx * 1.6, s * (wy + 0.10), 0.0))
            d = p_top - p_bot; Lb = d.length
            rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
            box('kozly-noga', (0.05, 0.05, Lb), tuple((p_top + p_bot) / 2), M['arb'], st, fask=0.008, rot=rot, tile=0.4)
        # раскос-крест
        for a1, a2 in (((xk - 0.11, s * (wy + 0.08), 0.03), (xk + 0.11, s * (wy - 0.02), zs - 0.04)),
                       ((xk + 0.11, s * (wy + 0.08), 0.03), (xk - 0.11, s * (wy - 0.02), zs - 0.04))):
            a1, a2 = Vector(a1), Vector(a2); d = a2 - a1
            rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
            box('kozly-raskos', (0.022, 0.03, d.length), tuple((a1 + a2) / 2), M['arb'], st, fask=0.005, rot=rot, tile=0.4)
    box('kozly-styazhka', (0.04, 2 * wy + 0.12, 0.04), (xk, 0, 0.12), M['arb'], st, fask=0.007, tile=0.4)
    for s in (-1, 1):                              # клинья у подножия
        box('kozly-klin', (0.18, 0.06, 0.03), (xk, s * (wy + 0.13), 0.015), M['lodka'], st, fask=0.006)
        lathe('kozly-skoba', [(0, 0), (0.006, 0), (0.006, 0.01), (0, 0.012)], M['chugun'], st, seg=8,
              at=osi((xk, s * (wy - 0.05), zs + 0.04), (0, s, 0)))
# кильблоки под гондолой
for xg in (-0.28, 0.28):
    box('kilblok', (0.07, 0.2, 0.09), (xg, 0, gzb(xg) - 0.05), M['lodka'], st, fask=0.008)
# швартовы-растяжки от корпуса к рымам в настиле
shv = []
for x, s in ((-1.45, -1), (-1.45, 1), (1.40, -1), (1.40, 1), (-0.5, 1), (0.6, -1)):
    rh = rr(x); p1 = (x, s * rh * 0.7, ZC - rh * 0.7)
    p2 = (x, s * 0.52, 0.005)
    shv.append(provis(p1, p2, 0.025, 8))
    tor('rym', 0.014, 0.004, osi(p2, (1, 0, 0)), M['chugun'], st, seg=16, k=6)
krivye('shvartov', shv, 0.0038, M['verevka'], st, res=1, gladko=True)
# бочки из арборита (на заводе из него делали бочки) — две у кормы
for (bx, by, rot) in ((1.70, 0.40, 0.0), (1.53, 0.47, 0.0)):
    hb = 0.16
    lathe('bochka', [(0, 0), (0.05, 0), (0.054, 0.004), (0.062, hb * 0.5), (0.054, hb - 0.004), (0.05, hb), (0, hb)], M['arb'], st, seg=32,
          at=osi((bx, by, 0.0), (0, 0, 1)), tile=0.15)
    for zq in (0.025, 0.06, hb - 0.06, hb - 0.025):
        rq = 0.054 + (0.062 - 0.054) * math.sin(math.pi * zq / hb)
        tor('bochka-obruch', rq + 0.001, 0.0028, osi((bx, by, zq), (0, 0, 1)), M['chugun'], st, seg=32, k=6)
lathe('bochka-lezhit', [(0, 0), (0.05, 0), (0.054, 0.004), (0.062, 0.08), (0.054, 0.156), (0.05, 0.16), (0, 0.16)], M['arb'], st, seg=32,
      at=osi((1.66, 0.22, 0.062), (0.3, -1, 0)), tile=0.15)
# стопка листов фанеры-арборита у носа
for k in range(7):
    box('list-fanery', (0.42, 0.30, 0.012), (-1.70 + 0.004 * k, -0.36, 0.006 + 0.0125 * k), M['arb'], st, fask=0.0025,
        rot=Matrix.Rotation(0.03 * math.sin(k * 2.3), 4, 'Z'), tile=0.5, uvsdvig=(0.13 * k, 0.21 * k))
# прислонённая к корпусу лестница (с +Y)
lx, ly0 = -0.55, 0.52
top = Vector((lx, rr(lx) * 0.98, ZC + 0.10)); bot = Vector((lx - 0.04, ly0, 0.0))
for dx in (-0.06, 0.06):
    a1 = bot + Vector((dx, 0, 0)); a2 = top + Vector((dx, 0, 0)); d = a2 - a1
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
    box('lestnica-tetiva', (0.02, 0.026, d.length), tuple((a1 + a2) / 2), M['arb'], st, fask=0.005, rot=rot, tile=0.3)
for k in range(1, 9):
    p = bot.lerp(top, k / 9)
    sterzhen('lestnica-stupen', p + Vector((-0.06, 0, 0)), p + Vector((0.06, 0, 0)), 0.0075, M['arb'], st, seg=8)
# бухта каната
bx, by = 1.72, -0.40
pts = []
for k in range(120):
    t = k / 119 * TAU * 4.3
    rad = 0.07 - 0.006 * (k // 28)
    pts.append((bx + rad * math.cos(t), by + rad * math.sin(t), 0.008 + 0.012 * (k // 28) + 0.0 * t))
krivye('buhta-kanata', [pts], 0.0075, M['verevka'], st, res=1, gladko=False)

# ═══ сборка: применить модификаторы, кривые → меши, слить по части и материалу ═══════════════════════════
dg = bpy.context.evaluated_depsgraph_get()
for ob in list(sc.objects):
    if ob.type not in ('MESH', 'CURVE'): continue
    ev = ob.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True, depsgraph=dg)
    if ob.type == 'CURVE':
        for p in me.polygons: p.use_smooth = True
        if not me.materials: me.materials.append(ob.data.materials[0])
    nob = bpy.data.objects.new(ob.name, me); sc.collection.objects.link(nob)
    nob.parent = ob.parent; nob.matrix_world = ob.matrix_world.copy()
    bpy.data.objects.remove(ob)
for imya, u in UZLY.items():
    grupy = {}
    for ch in u.children:
        if ch.type != 'MESH': continue
        mname = ch.data.materials[0].name if ch.data.materials else '-'
        grupy.setdefault(mname, []).append(ch)
    for mname, obs in grupy.items():
        for ch in obs:
            if not ch.data.uv_layers: ch.data.uv_layers.new(name='UV')
            ch.data.uv_layers[0].name = 'UV'
        has_col = any(len(ch.data.color_attributes) for ch in obs)
        if has_col:
            for ch in obs:
                if not ch.data.color_attributes:
                    ca = ch.data.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
                    for d in ca.data: d.color = (1, 1, 1, 1)
        if len(obs) > 1:
            with bpy.context.temp_override(active_object=obs[0], selected_editable_objects=obs, selected_objects=obs):
                bpy.ops.object.join()
        obs[0].name = imya + '-' + mname

# центр в начале координат: середина габарита по x, y; по высоте — середина
mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
for ob in sc.objects:
    if ob.type != 'MESH': continue
    for v in ob.data.vertices:
        w = ob.matrix_world @ v.co
        mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
KOREN.location = -(mn + mx) / 2
print('GABARIT', tuple(mn), tuple(mx))

tri = 0
for ob in sc.objects:
    if ob.type == 'MESH':
        bad = ob.data.validate(verbose=False)
        tri += sum(len(p.vertices) - 2 for p in ob.data.polygons)
        if bad or not len(ob.data.polygons): print('MESH-FIX', ob.name, bad, len(ob.data.polygons))
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=True, export_extras=True,
                          export_image_format='JPEG', export_jpeg_quality=88, export_materials='EXPORT', export_tangents=False,
                          export_vertex_color='ACTIVE', export_lights=False, export_cameras=False)
print('GLB', OUT, os.path.getsize(OUT), 'bytes, tris', tri, 'meshes', sum(1 for o in sc.objects if o.type == 'MESH'))
