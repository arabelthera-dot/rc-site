# r593-17: плоская аэродинамическая труба воздухоплавательного кружка Н. Е. Жуковского (МВТУ, 1909) кодом в Блендере.
# Музейный макет: деревянный канал с коллектором, рабочая часть со смотровым окном, модель крыла на державке весов,
# диффузор, двухлопастный вентилятор с электромотором; струйки потока — полупрозрачные ленты; кусок пола лаборатории.
#   ~/opt/blender-run.sh -b --python truba_zhukovskogo.py -- <выход.glb>
#
# ЧТО ИЗ ФАЙЛА ДНЯ (01-17.yaml): кружок строил трубы в 1909 г. (плоскую и круглую), постройку вёл студент А. Туполев,
#   поток 22 м/с, после перестройки 1915–1916 — 36 м/с; труба работала до 1950 г.; вентилятор с двухлопастным
#   пропеллером на станине (снимок 1916 г., Госкаталог № 5816845); деревянные стенки (снимок лаборатории МВТУ).
# ДОПУЩЕНИЯ (размеров в файле дня нет): сечение канала 0,40 × 0,56 м, длина ≈4 м, форма коллектора, спрямляющая
#   решётка, рычажные весы на крыше рабочей части, микроманометр, рубильник, профиль крыла — профиль Жуковского
#   (НЕЖ), линии тока посчитаны по теореме Кутты — Жуковского для крыла в свободном потоке (стенки не учтены).
import bpy, bmesh, math, sys, os, cmath
import numpy as np
from mathutils import Vector, Matrix

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['/tmp/pomoshchniki/r593-3d-mashiny-v2/17/raw.glb']
OUT = A[0]
DIR = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(DIR, 'tex'); os.makedirs(TEX, exist_ok=True)
TAU = math.tau

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
rng = np.random.default_rng(1909)
R = np.random.default_rng(17)          # геометрический разброс (доски, болты)

# ── размеры (м), все — допущение ──────────────────────────────────────────────────────────────────────
ZA = 0.95                 # ось канала над полом
A0, B0 = 0.20, 0.28       # полуширина (Y) и полувысота (Z) канала внутри
TH = 0.026                # толщина доски
XM, X1 = -2.02, -1.52     # коллектор: устье → горло
XW0, XW1 = -0.62, 0.18    # рабочая часть
XWING = -0.22             # ось крыла
XD0, XD1 = 0.70, 1.34     # диффузор
AD1 = 0.50                # полуразмер выхода диффузора (квадрат 1,0 × 1,0)
XF = 1.36                 # щит вентилятора
XP = 1.52                 # плоскость винта
RPROP = 0.43
XMOT0, XMOT1 = 1.70, 2.12 # электромотор
CHORD = 0.30; ALFA = math.radians(7.0)

# ── текстуры: периодический шум через БПФ (бесшовно) ────────────────────────────────────────────────────
def shum(n, beta=2.0, aniz=(1.0, 1.0), m=None):
    m = m or n
    w = rng.standard_normal((m, n))
    fy = np.fft.fftfreq(m)[:, None] * aniz[0]; fx = np.fft.fftfreq(n)[None, :] * aniz[1]
    f = np.sqrt(fx * fx + fy * fy); f[0, 0] = 1
    s = np.real(np.fft.ifft2(np.fft.fft2(w) / f ** (beta / 2 + 0.5)))
    s -= s.min(); return s / s.max()
def ss(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def normal_iz(h, k):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * k; dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * k
    n = np.dstack([-dx, -dy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return n * 0.5 + 0.5
def kartinka(imya, rgb, noncolor=False, alpha=None, fmt='JPEG'):
    h, w = rgb.shape[:2]
    im = bpy.data.images.new(imya, w, h, alpha=alpha is not None)
    px = np.ones((h, w, 4), np.float32); px[..., :3] = np.clip(rgb, 0, 1)
    if alpha is not None: px[..., 3] = np.clip(alpha, 0, 1)
    im.pixels.foreach_set(px.ravel())
    ext = '.png' if fmt == 'PNG' else '.jpg'
    put = os.path.join(TEX, imya + ext); im.filepath_raw = put; im.file_format = fmt
    if fmt == 'JPEG': sc.render.image_settings.quality = 90
    im.save(); bpy.data.images.remove(im)
    im = bpy.data.images.load(put)
    if noncolor: im.colorspace_settings.name = 'Non-Color'
    return im

def tex_derevo(n, osn, temn, kolec, sila_kolec, svetl=0.0, sher=0.55, volna=0.12, suchki=2):
    """Строганая доска: волокно вдоль u (оси X картинки), годичные слои — изогнутые полосы, редкие сучки."""
    yy, xx = np.mgrid[0:n, 0:n] / n
    var = shum(n, 2.6, aniz=(1.0, 0.06))                 # длинные продольные разводы
    vol = shum(n, 1.2, aniz=(1.0, 0.02))                 # тонкое волокно
    nis = shum(n, 3.0)
    t = yy * kolec + 2.2 * var + volna * np.sin(TAU * (xx * 2 + 0.3 * nis))
    for _ in range(suchki):                                   # сучки: кольца огибают точку
        cx, cy = rng.random(), rng.random()
        dx = (xx - cx + 0.5) % 1 - 0.5; dy = (yy - cy + 0.5) % 1 - 0.5
        r = np.sqrt((dx * 2.5) ** 2 + (dy * 9) ** 2)
        t += 1.2 * np.exp(-r * 9)
    ring = t % 1.0
    pozd = ss(0.70, 0.93, ring) * (1 - ss(0.95, 1.0, ring))
    col = np.array(osn)[None, None, :] * (0.86 + 0.22 * var[..., None] + 0.08 * vol[..., None])
    col = col * (1 - sila_kolec * pozd[..., None]) + np.array(temn)[None, None, :] * sila_kolec * pozd[..., None] * 0.6
    col *= (1 + svetl)
    h = 0.55 * pozd + 0.35 * vol + 0.1 * nis
    rough = sher + 0.18 * pozd + 0.12 * nis - 0.06 * var
    orm = np.dstack([np.ones_like(h), rough, np.zeros_like(h)])
    pol2 = lambda a: 0.25 * (a[0::2, 0::2] + a[1::2, 0::2] + a[0::2, 1::2] + a[1::2, 1::2])   # ORM и нормали — 512
    nrm = normal_iz(h, 2.2)
    return col, pol2(orm), pol2(nrm)

def tex_metall(n=512):   # пятнистая серая основа под металлы (цвет металла задаёт множитель материала)
    a, b, c = shum(n, 2.2), shum(n, 3.2), shum(n, 1.0)
    v = 0.78 + 0.22 * a + 0.08 * b - 0.10 * ss(0.75, 0.9, c)
    return np.dstack([v, v * 0.995, v * 0.985])

def tex_struyka(n=512):  # альфа струйки по длине: проявление, пунктир «бегущего» воздуха, затухание
    u = np.linspace(0, 1, n)
    konc = ss(0.0, 0.08, u) * (1 - ss(0.86, 1.0, u))
    shtrih = 0.55 + 0.45 * ss(0.15, 0.55, 0.5 + 0.5 * np.sin(TAU * u * 46))
    a = (konc * shtrih)[None, :].repeat(8, 0)
    return np.ones((8, n, 3)), a

c, o, nr = tex_derevo(1024, (0.50, 0.36, 0.23), (0.20, 0.12, 0.065), 26, 0.38, sher=0.50)
SOSNA = [kartinka('sosna-cvet', c), kartinka('sosna-orm', o, True), kartinka('sosna-normal', nr, True)]
c, o, nr = tex_derevo(1024, (0.58, 0.50, 0.41), (0.26, 0.20, 0.15), 38, 0.32, sher=0.66, volna=0.06, suchki=1)
DUB = [kartinka('dub-cvet', c), kartinka('dub-orm', o, True), kartinka('dub-normal', nr, True)]
MET = kartinka('metall-cvet', tex_metall())
c, a = tex_struyka(); STR = kartinka('struyka', c, alpha=a, fmt='PNG')

# ── материалы ─────────────────────────────────────────────────────────────────────────────────────────
def pbsdf(imya):
    m = bpy.data.materials.new(imya); m.use_nodes = True
    return m, m.node_tree.nodes['Principled BSDF'], m.node_tree
def cvet_tex(t, b, img, mnozh=None):
    N, L = t.nodes, t.links
    tc = N.new('ShaderNodeTexImage'); tc.image = img
    if mnozh:
        mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
        L.new(tc.outputs['Color'], mx.inputs[6]); mx.inputs[7].default_value = (*mnozh, 1)
        L.new(mx.outputs[2], b.inputs['Base Color'])
    else:
        L.new(tc.outputs['Color'], b.inputs['Base Color'])
    return tc
def mat_derevo(imya, nabor, mnozh=None, coat=0.0, nsila=0.8):
    m, b, t = pbsdf(imya); N, L = t.nodes, t.links
    cvet_tex(t, b, nabor[0], mnozh)
    to = N.new('ShaderNodeTexImage'); to.image = nabor[1]
    sp = N.new('ShaderNodeSeparateColor'); L.new(to.outputs['Color'], sp.inputs['Color'])
    L.new(sp.outputs['Green'], b.inputs['Roughness']); L.new(sp.outputs['Blue'], b.inputs['Metallic'])
    tn = N.new('ShaderNodeTexImage'); tn.image = nabor[2]
    nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = nsila
    L.new(tn.outputs['Color'], nm.inputs['Color']); L.new(nm.outputs['Normal'], b.inputs['Normal'])
    if coat: b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.08
    return m
def mat_met(imya, cvet, metal, sher):
    m, b, t = pbsdf(imya)
    cvet_tex(t, b, MET, cvet)
    b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = sher
    return m
def mat(imya, cvet, metal, sher, alpha=1.0):
    m, b, _ = pbsdf(imya)
    b.inputs['Base Color'].default_value = (*cvet, 1); b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = sher
    if alpha < 1: b.inputs['Alpha'].default_value = alpha; m.blend_method = 'BLEND'; m.use_backface_culling = False
    return m

M = {
    'sosna':  [mat_derevo('sosna-1', SOSNA), mat_derevo('sosna-2', SOSNA, (0.86, 0.80, 0.74)),
               mat_derevo('sosna-3', SOSNA, (1.0, 0.93, 0.80))],
    'rebro':  mat_derevo('sosna-rebro', SOSNA, (0.62, 0.52, 0.44)),                    # рёбра жёсткости темнее, морёные
    'krylo':  mat_derevo('krylo-lak', SOSNA, (1.0, 0.97, 0.9), coat=0.7, nsila=0.3),    # модель крыла под лаком
    'vint':   mat_derevo('vint-lak', SOSNA, (0.95, 0.85, 0.7), coat=0.6, nsila=0.4),
    'pol':    [mat_derevo('pol-1', DUB), mat_derevo('pol-2', DUB, (0.84, 0.80, 0.76)),
               mat_derevo('pol-3', DUB, (0.92, 0.84, 0.72)), mat_derevo('pol-4', DUB, (0.74, 0.68, 0.64))],
    'cokol':  mat_derevo('cokol', DUB, (0.42, 0.36, 0.32)),
    'chugun': mat_met('chugun', (0.16, 0.16, 0.17), 0.85, 0.55),
    'motor':  mat_met('motor-kraska', (0.09, 0.12, 0.11), 0.35, 0.42),                 # мотор: тёмно-зелёная эмаль
    'stal':   mat_met('stal', (0.72, 0.72, 0.72), 1.0, 0.24),
    'ugol':   mat_met('ugolok-voronyonyj', (0.11, 0.105, 0.10), 0.9, 0.45),            # воронёные уголки, болты
    'latun':  mat_met('latun', (0.80, 0.58, 0.27), 1.0, 0.26),
    'med':    mat_met('med', (0.80, 0.42, 0.26), 1.0, 0.32),
    'mramor': mat('mramor', (0.78, 0.76, 0.72), 0.0, 0.25),
    'rezina': mat('rezina', (0.05, 0.045, 0.04), 0.0, 0.7),
    'zhidk':  mat('spirt-krasnyj', (0.42, 0.05, 0.04), 0.0, 0.15),
    'temn':   mat('proyom-temnyj', (0.015, 0.014, 0.013), 0.0, 0.9),
    'steklo': mat('steklo', (0.85, 0.92, 0.95), 0.0, 0.03, alpha=0.13),
}
def mat_struyka():
    m, b, t = pbsdf('struyka-vozduh'); N, L = t.nodes, t.links
    tc = N.new('ShaderNodeTexImage'); tc.image = STR
    b.inputs['Base Color'].default_value = (0.80, 0.90, 1.0, 1); b.inputs['Roughness'].default_value = 0.35
    m2 = N.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'; m2.inputs[1].default_value = 0.55
    L.new(tc.outputs['Alpha'], b.inputs['Alpha'])
    m.blend_method = 'BLEND'; m.use_backface_culling = False
    return m
M['struyka'] = mat_struyka()

def ten_tex(n=512):       # мягкая тень под трубой (просмотрщик тени не считает) — в мировых координатах пола
    xs = np.linspace(-2.5, 2.5, n); ys = np.linspace(-1.25, 1.25, n // 2)
    X, Y = np.meshgrid(xs, ys)
    def pr(x0, x1, y0, y1, k=1.0):
        return np.clip((x1 - np.abs(X - (x0 + x1) / 2) * 2 + 0) * 0 + 1, 0, 1) * ((X > x0) & (X < x1) & (Y > y0) & (Y < y1)) * k
    m = pr(XM + 0.1, XD1, -0.32, 0.32, 0.8) + pr(XD0, XF, -0.55, 0.55, 0.6) + pr(XMOT0 - 0.1, XMOT1 + 0.1, -0.42, 0.42, 1.0)
    m = np.clip(m, 0, 1)
    f = np.fft.fft2(m); ky = np.fft.fftfreq(m.shape[0])[:, None]; kx = np.fft.fftfreq(m.shape[1])[None, :]
    m = np.real(np.fft.ifft2(f * np.exp(-(kx ** 2 + ky ** 2) * (2 * math.pi * 14) ** 2 / 2)))
    a = np.clip(m, 0, 1) * 0.62
    a[:3] = a[-3:] = 0; a[:, :3] = a[:, -3:] = 0
    return np.zeros(a.shape + (3,)), a
c, a = ten_tex(); TEN = kartinka('ten', c, alpha=a, fmt='PNG')
m, b, t = pbsdf('ten-pod-truboj'); tc = t.nodes.new('ShaderNodeTexImage'); tc.image = TEN
b.inputs['Base Color'].default_value = (0, 0, 0, 1); b.inputs['Roughness'].default_value = 1
t.links.new(tc.outputs['Alpha'], b.inputs['Alpha']); m.blend_method = 'BLEND'; M['ten'] = m

# ── построители ───────────────────────────────────────────────────────────────────────────────────────
PARTS = []
OSTR = {}
def mesh_obj(imya, verts, faces, uvs, material, rodit, smooth=True, ostryj=None):
    me = bpy.data.meshes.new(imya); me.from_pydata([tuple(v) for v in verts], [], faces); me.validate()
    if uvs is not None:
        ul = me.uv_layers.new(name='UV')
        for p in me.polygons:
            for li, vi in zip(p.loop_indices, p.vertices): ul.data[li].uv = uvs[vi]
    for p in me.polygons: p.use_smooth = smooth
    if ostryj: me.set_sharp_from_angle(angle=math.radians(ostryj))
    OSTR[imya] = ostryj or 80
    me.materials.append(material)
    ob = bpy.data.objects.new(imya, me); sc.collection.objects.link(ob); ob.parent = rodit
    PARTS.append(ob)
    return ob

def osi(p, d, up=None):
    d = Vector(d).normalized()
    if up is None:
        return Matrix.Translation(Vector(p)) @ Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
    x = Vector(up).cross(d).normalized(); y = d.cross(x)
    m = Matrix((x, y, d)).transposed().to_4x4(); m.translation = Vector(p); return m

def lathe(imya, prof, material, rodit, seg=48, tile=0.5, at=Matrix.Identity(4), a0=0.0, a1=TAU, phase=0.0, ostryj=None):
    polosy, cur = [], []
    prof = list(prof)
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
                a = a0 + (a1 - a0) * i / seg + phase
                verts.append(at @ Vector((r * math.cos(a), r * math.sin(a), z)))
                uvs.append((nu * (a1 - a0) / TAU * i / seg, (vv[j]) / tile))
        for j in range(len(pol) - 1):
            for i in range(seg):
                a, b = base + j * (seg + 1) + i, base + (j + 1) * (seg + 1) + i
                faces.append((a, a + 1, b + 1, b))
    ob = mesh_obj(imya, verts, faces, uvs, material, rodit, ostryj=ostryj)
    bm = bmesh.new(); bm.from_mesh(ob.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bm.to_mesh(ob.data); bm.free()
    if ostryj: ob.data.set_sharp_from_angle(angle=math.radians(ostryj))
    return ob

def box(imya, size, centr, material, rodit, fask=0.006, rot=None, tile=0.6, uvsdvig=None, ostryj=40):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    if fask > 0: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=min(fask, min(size) * 0.45), segments=2, profile=0.5, affect='EDGES')
    T = Matrix.Translation(Vector(centr)) @ (rot if rot else Matrix.Identity(4))
    me = bpy.data.meshes.new(imya); bm.to_mesh(me); bm.free()
    du, dv = uvsdvig if uvsdvig else (R.random(), R.random())
    uv = me.uv_layers.new(name='UV')
    dl = max(range(3), key=lambda k: size[k])                       # волокно — вдоль длинной стороны
    for p in me.polygons:
        n = p.normal; ax = max(range(3), key=lambda k: abs(n[k]))
        drugie = [k for k in range(3) if k != ax]
        u_ = dl if dl in drugie else drugie[0]; v_ = [k for k in drugie if k != u_][0]
        for li, vi in zip(p.loop_indices, p.vertices):
            v = me.vertices[vi].co; uv.data[li].uv = (v[u_] / tile + du, v[v_] / tile + dv)
    me.transform(T)
    for p in me.polygons: p.use_smooth = True
    me.set_sharp_from_angle(angle=math.radians(ostryj)); OSTR[imya] = ostryj
    me.materials.append(material)
    ob = bpy.data.objects.new(imya, me); sc.collection.objects.link(ob); ob.parent = rodit; PARTS.append(ob)
    return ob

def brus(imya, p1, p2, w, h, material, rodit, up=(0, 0, 1), fask=0.006):
    """Брус между точками p1, p2 сечением w × h (h — вдоль up)."""
    p1, p2 = Vector(p1), Vector(p2); d = p2 - p1
    at = osi((p1 + p2) / 2, d, up)
    return box(imya, (w, h, d.length), (0, 0, 0), material, rodit, fask=fask, rot=at)

def sterzhen(imya, p1, p2, r, material, rodit, seg=16, fask=0.0):
    p1, p2 = Vector(p1), Vector(p2); L = (p2 - p1).length
    pr = [(r - fask, 0), (r, fask), (r, L - fask), (r - fask, L)] if fask else [(r, 0), (r, L)]
    pr = [(0, 0)] + pr + [(0, L)]
    return lathe(imya, pr, material, rodit, seg=seg, at=osi(p1, p2 - p1), tile=0.2, ostryj=50)

def bolt(imya, p, napr, s, material, rodit, h=None):
    h = h or s * 0.7
    return lathe(imya, [(0, 0), (s, 0), (s, h * 0.7), (s * 0.8, h), (0, h * 1.1)], material, rodit, seg=6,
                 at=osi(p, napr), tile=0.1, phase=R.random(), ostryj=40)

def tor(imya, Rr, r, at, material, rodit, seg=40, k=12):
    pr = [(Rr + r * math.cos(TAU * j / k), r * math.sin(TAU * j / k)) for j in range(k + 1)]
    return lathe(imya, pr, material, rodit, seg=seg, at=at, tile=0.2)

def sweep(imya, put, sech, material, rodit, up=None, zamk=False, tile=0.5, kryshki=True, ostryj=None, uvsdvig=0.0):
    """Протянуть плоское сечение [(x, y)] вдоль ломаной put [Vector]. up — постоянный «верх» сечения, иначе параллельный перенос."""
    put = [Vector(p) for p in put]; n = len(put); k = len(sech)
    verts, faces, uvs = [], [], []
    T = [(put[min(i + 1, n - 1)] - put[max(i - 1, 0)]).normalized() for i in range(n)]
    if up is not None:
        UP = [Vector(up)] * n
    else:
        u0 = Vector((0, 0, 1)) if abs(T[0].z) < 0.9 else Vector((1, 0, 0)); UP = []
        for i in range(n):
            u0 = (u0 - T[i] * u0.dot(T[i])).normalized(); UP.append(u0.copy())
    dl = 0.0
    per = sum((Vector(sech[(j + 1) % k]) - Vector(sech[j])).length for j in range(k))
    for i in range(n):
        if i: dl += (put[i] - put[i - 1]).length
        X = UP[i].cross(T[i]).normalized(); Y = T[i].cross(X)
        s = 0.0
        for j in range(k + 1):
            x, y = sech[j % k]
            if j: s += (Vector(sech[j % k]) - Vector(sech[j - 1])).length
            verts.append(put[i] + X * x + Y * y); uvs.append((dl / tile + uvsdvig, s / max(per, 1e-6)))
    for i in range(n - 1):
        for j in range(k):
            a, b = i * (k + 1) + j, (i + 1) * (k + 1) + j
            faces.append((a, a + 1, b + 1, b))
    if kryshki and not zamk:
        faces.append(tuple(range(k - 1, -1, -1))); faces.append(tuple((n - 1) * (k + 1) + j for j in range(k)))
    return mesh_obj(imya, verts, faces, uvs, material, rodit, ostryj=ostryj)

def fask_sech(w, h, e):
    """Прямоугольник w × h (центр — середина нижней грани) с фасками e."""
    return [(-w / 2 + e, 0), (w / 2 - e, 0), (w / 2, e), (w / 2, h - e), (w / 2 - e, h), (-w / 2 + e, h), (-w / 2, h - e), (-w / 2, e)]

# ── стенки канала из досок: поверхность P(s, t), доска — сечение с фасками, протянутое по s ───────────────
def polu(x):
    """Полуразмеры канала (a — по Y, b — по Z) в точке x."""
    if x <= X1:
        u = (x - XM) / (X1 - XM); f = 0.26 * (1 - u) ** 2.3
        return A0 + f, B0 + f
    if x >= XD0:
        u = min(1.0, (x - XD0) / (XD1 - XD0)); return A0 + (AD1 - A0) * u, B0 + (AD1 - B0) * u
    return A0, B0

def stenka(imya, x0, x1, storona, t_dosok, rodit, ns=2, material_po_doske=True, otstup=0.0):
    """Доски одной стенки: storona ∈ {'+y','-y','+z','-z'}; t_dosok — границы досок по t ∈ [0, 1]."""
    xs = np.linspace(x0, x1, ns + 1)
    def P(x, t):
        a, b = polu(x)
        if storona in ('+y', '-y'):
            sg = 1 if storona == '+y' else -1
            return Vector((x, sg * a, ZA - b + 2 * b * t))
        sg = 1 if storona == '+z' else -1
        aa = a + TH                                   # верх и низ перекрывают торцы боковых стенок
        return Vector((x, -aa + 2 * aa * t, ZA + sg * b))
    def Nrm(x, t):
        e = 1e-3; du = P(min(x + e, x1), t) - P(max(x - e, x0), t); dv = P(x, t + e) - P(x, t - e)
        n = du.cross(dv).normalized()
        c = P(x, t); vn = Vector((0, c.y, c.z - ZA))
        return n if n.dot(vn) > 0 else -n
    for k in range(len(t_dosok) - 1):
        t0, t1 = t_dosok[k], t_dosok[k + 1]
        verts, faces, uvs = [], [], []
        du = R.random(); dv = R.random()
        for i, x in enumerate(xs):
            w = (P(x, t1) - P(x, t0)).length
            e = 0.004; et = e / max(w, 1e-4) * (t1 - t0); gap = 0.0015 / max(w, 1e-4) * (t1 - t0)
            sech = [(t0 + gap + et, 0), (t1 - gap - et, 0), (t1 - gap, e), (t1 - gap, TH - e), (t1 - gap - et, TH), (t0 + gap + et, TH), (t0 + gap, TH - e), (t0 + gap, e)]
            for j, (t, h) in enumerate(sech + [sech[0]]):
                verts.append(P(x, t) + Nrm(x, t) * (h + otstup))
                uvs.append(((x - x0) / 0.6 + du, (t - t0) / (t1 - t0) * w / 0.6 * 0.5 + dv + j * 0.002))
        m = 9
        for i in range(len(xs) - 1):
            for j in range(8):
                a, b = i * m + j, (i + 1) * m + j
                faces.append((a, b, b + 1, a + 1))
        faces.append(tuple(range(7, -1, -1))); faces.append(tuple(len(xs) * m - m + j for j in range(8)))
        mat_ = M['sosna'][R.integers(3)] if material_po_doske else M['sosna'][0]
        ob = mesh_obj(imya, verts, faces, uvs, mat_, rodit, ostryj=35)

def doski_t(n): return list(np.linspace(0, 1, n + 1))

def rebro(imya, x, rodit, w=0.05, h=0.05, material=None, bolty=True):
    """Рама-ребро жёсткости вокруг канала в сечении x + стальные косынки и болты в углах."""
    material = material or M['rebro']
    a, b = polu(x); a += TH; b += TH
    brus(imya, (x, -a - h, ZA + b + h / 2), (x, a + h, ZA + b + h / 2), w, h, material, rodit, up=(0, 0, 1))
    brus(imya, (x, -a - h, ZA - b - h / 2), (x, a + h, ZA - b - h / 2), w, h, material, rodit, up=(0, 0, 1))
    for s in (-1, 1):
        brus(imya, (x, s * (a + h / 2), ZA - b), (x, s * (a + h / 2), ZA + b), w, h, material, rodit, up=(0, s, 0))
    if bolty:
        for s in (-1, 1):
            for sz in (-1, 1):
                p = Vector((x, s * (a + h + 0.001), ZA + sz * (b + h / 2)))
                box(imya + '-kosynka', (w + 0.03, 0.004, h * 1.6), p + Vector((0, s * 0.002, -sz * h * 0.3)), M['ugol'], rodit, fask=0.0015)
                for dz in (-0.022, 0.012):
                    bolt(imya + '-bolt', p + Vector((0, s * 0.004, -sz * h * 0.3 + dz)), (0, s, 0), 0.008, M['ugol'], rodit)

def ugolok(imya, x0, x1, rodit, shag=0.2):
    """Стальные уголки по четырём продольным рёбрам канала + болты."""
    a, b = A0 + TH, B0 + TH; f, t = 0.042, 0.005
    for sy in (-1, 1):
        for sz in (-1, 1):
            sech = [(0, 0), (f, 0), (f, t), (t, t), (t, f), (0, f)]
            sech = [(sy * x, sz * y) for x, y in sech]
            if sy * sz < 0: sech = sech[::-1]
            put = [Vector((x0, sy * a, ZA + sz * b)), Vector((x1, sy * a, ZA + sz * b))]
            # сечение в плоскости YZ: X-ось сечения → +Y мира, Y-ось сечения → +Z мира
            verts, faces = [], []
            for p in put:
                for (u, v) in sech: verts.append(p + Vector((0, u, v)))
            for j in range(6):
                faces.append((j, (j + 1) % 6, 6 + (j + 1) % 6, 6 + j))
            faces.append(tuple(range(5, -1, -1))); faces.append(tuple(range(6, 12)))
            ob = mesh_obj(imya, verts, faces, [(v.x / 0.3, v.y / 0.3 + v.z) for v in verts], M['ugol'], rodit, ostryj=30)
            for x in np.arange(x0 + 0.08, x1 - 0.04, shag):
                bolt(imya + '-bolt', (x, sy * (a + t), ZA + sz * (b - 0.022)), (0, sy, 0), 0.007, M['ugol'], rodit)
                bolt(imya + '-bolt', (x + shag / 2, sy * (a - 0.022), ZA + sz * (b + t)), (0, 0, sz), 0.007, M['ugol'], rodit)

def kozly(imya, x, rodit, a_shir, verh_z, krepkie=False):
    """Козлы из бруса: две разведённые ноги с каждой стороны, ригели, раскосы, стальные башмаки."""
    w = 0.06 if krepkie else 0.05
    for s in (-1, 1):
        top = Vector((x, s * (a_shir - 0.02), verh_z - 0.03)); niz = Vector((x, s * (a_shir + 0.16), 0.0))
        brus(imya, niz + Vector((0, 0, 0.03)), top, w, w, M['rebro'], rodit, up=(1, 0, 0))
        box(imya + '-bashmak', (w + 0.03, w + 0.05, 0.03), niz + Vector((0, 0, 0.015)), M['chugun'], rodit, fask=0.006)
        bolt(imya + '-bolt', niz + Vector((0.0, s * 0.0, 0.032)), (0, 0, 1), 0.009, M['ugol'], rodit)
    brus(imya, (x, -a_shir - 0.08, verh_z - 0.03), (x, a_shir + 0.08, verh_z - 0.03), w, 0.06, M['rebro'], rodit, up=(0, 0, 1))
    zl = verh_z * 0.32
    ah = a_shir + 0.16 * (1 - zl / verh_z) - 0.02
    brus(imya, (x + w * 0.9 * 0, -ah - 0.04, zl), (x, ah + 0.04, zl), w * 0.8, 0.07, M['rebro'], rodit, up=(0, 0, 1))
    brus(imya, (x, -ah + 0.02, zl + 0.03), (x, a_shir - 0.05, verh_z - 0.07), w * 0.7, 0.05, M['rebro'], rodit, up=(1, 0, 0))

# ── корень и узлы-части ─────────────────────────────────────────────────────────────────────────────────
KOREN = bpy.data.objects.new('truba-kruzhka-zhukovskogo-1909', None); sc.collection.objects.link(KOREN)
def uzel(imya):
    e = bpy.data.objects.new(imya, None); sc.collection.objects.link(e); e.parent = KOREN; e['uzel'] = imya
    return e

# ══ 1. Канал трубы: коллектор, решётка, деревянный канал, диффузор, рёбра, уголки, козлы ══════════════════
kan = uzel('kanal-truby')
T_BOK, T_VERH = doski_t(5), doski_t(4)
for (x0, x1, ns) in ((XM, X1, 10), (X1, XW0, 2), (XW1, XD0, 2), (XD0, XD1, 4)):
    for st in ('+y', '-y', '+z', '-z'):
        stenka('doska', x0, x1, st, T_BOK if st[1] == 'y' else T_VERH, kan, ns=ns)
# закруглённая губа устья коллектора (тор по прямоугольнику со скруглёнными углами)
am, bm = polu(XM); am += TH * 0.5; bm += TH * 0.5
put = []
rr = 0.07
for k, (cy, cz, a0) in enumerate(((am - rr, bm - rr, 0), (-am + rr, bm - rr, 90), (-am + rr, -bm + rr, 180), (am - rr, -bm + rr, 270))):
    for j in range(7):
        ang = math.radians(a0 + j * 15)
        put.append(Vector((XM - 0.01, cy + rr * math.cos(ang), ZA + cz + rr * math.sin(ang))))
put.append(put[0])
guba = [(0.022 * math.cos(TAU * j / 12) - 0.0, 0.022 * math.sin(TAU * j / 12)) for j in range(12)]
sweep('guba', put, guba, M['sosna'][2], kan, up=(1, 0, 0), kryshki=False, tile=0.4, zamk=True)
# спрямляющая решётка в горле коллектора (допущение)
for y in np.linspace(-A0, A0, 7)[1:-1]:
    box('reshyotka', (0.16, 0.006, 2 * B0), (X1 + 0.08, y, ZA), M['sosna'][1], kan, fask=0.0015)
for z in np.linspace(-B0, B0, 9)[1:-1]:
    box('reshyotka', (0.16, 2 * A0, 0.006), (X1 + 0.08, 0, ZA + z), M['sosna'][1], kan, fask=0.0015)
# рёбра жёсткости
for x in [X1 + 0.03, -1.1, -0.72, XW1 + 0.12, 0.45, XD0 + 0.04]:
    rebro('rebro', x, kan)
for x in (XM + 0.06, XM + 0.24):
    rebro('rebro-kollektora', x, kan, w=0.04, h=0.04, bolty=False)
for x in (XD0 + 0.32, XD1 - 0.03):
    rebro('rebro-diffuzora', x, kan, w=0.045, h=0.045)
ugolok('ugolok', X1 + 0.06, XW0 - 0.02, kan)
ugolok('ugolok', XW1 + 0.02, XD0, kan)
kozly('kozly', -1.30, kan, A0 + TH, ZA - B0 - TH)
kozly('kozly', 0.48, kan, A0 + TH, ZA - B0 - TH)
kozly('kozly', XD1 - 0.12, kan, AD1 + TH - 0.08, ZA - AD1 - TH + 0.05)
kozly('kozly', XM + 0.18, kan, polu(XM + 0.18)[0] + TH, ZA - polu(XM + 0.18)[1] - TH)
# штуцер статического давления к микроманометру
lathe('shtucer', [(0, 0), (0.016, 0), (0.016, 0.03), (0.01, 0.035), (0.007, 0.06), (0, 0.06)], M['latun'], kan, seg=16,
      at=osi((-0.88, -(A0 + TH), ZA - 0.1), (0, -1, 0)))

# ══ 2. Рабочая часть: стойки, смотровое окно со стеклом (+Y) и открытый бок (−Y), крыша-люк ════════════════
rab = uzel('rabochaya-chast')
for st in ('+z', '-z'):
    stenka('rab-doska', XW0, XW1, st, T_VERH, rab, ns=2)
for x in (XW0, XW1):
    rebro('rab-stoyka', x, rab, w=0.07, h=0.06)
for s in (-1, 1):  # рамы окон: верхний и нижний брус, средний импост
    y = s * (A0 + 0.018)
    for z in (ZA + B0 - 0.018, ZA - B0 + 0.018):
        brus('rab-rama', (XW0 + 0.03, y, z), (XW1 - 0.03, y, z), 0.036, 0.04, M['sosna'][2], rab, up=(0, 0, 1))
    if s > 0:
        brus('rab-rama', (XWING + 0.33, y, ZA - B0), (XWING + 0.33, y, ZA + B0), 0.03, 0.03, M['sosna'][2], rab, up=(0, 1, 0))
        box('steklo', (XW1 - XW0 - 0.07, 0.006, 2 * B0 - 0.05), ((XW0 + XW1) / 2, A0 + 0.012, ZA), M['steklo'], rab, fask=0.002)
        for x in (XW0 + 0.06, XW1 - 0.06):          # латунные прижимные планки стекла
            for z in (ZA + B0 - 0.04, ZA - B0 + 0.04):
                lathe('vint-stekla', [(0, 0), (0.009, 0), (0.009, 0.004), (0, 0.007)], M['latun'], rab, seg=12, at=osi((x, A0 + 0.04, z), (0, 1, 0)))
    else:            # петли откинутой дверцы бока — сама дверца снята для показа
        for z in (ZA + B0 - 0.09, ZA - B0 + 0.09):
            box('petlya', (0.05, 0.006, 0.07), (XW1 - 0.06, -(A0 + 0.04), z), M['latun'], rab, fask=0.0015)
            sterzhen('petlya-os', (XW1 - 0.035, -(A0 + 0.045), z - 0.04), (XW1 - 0.035, -(A0 + 0.045), z + 0.04), 0.006, M['latun'], rab, seg=10)
# фланец-окно в крыше под державку
box('kryshka-lyuka', (0.30, 0.30, 0.012), (XWING, 0, ZA + B0 + TH + 0.006), M['sosna'][1], rab, fask=0.004)
for dx in (-0.12, 0.12):
    for dy in (-0.12, 0.12):
        bolt('lyuk-bolt', (XWING + dx, dy, ZA + B0 + TH + 0.012), (0, 0, 1), 0.008, M['ugol'], rab)
# подпорки-ноги под рабочей частью (крепче)
kozly('rab-kozly', XW0 + 0.12, rab, A0 + TH, ZA - B0 - TH, krepkie=True)
kozly('rab-kozly', XW1 - 0.12, rab, A0 + TH, ZA - B0 - TH, krepkie=True)

# ══ 3. Модель крыла: профиль Жуковского (НЕЖ) из конформного отображения ══════════════════════════════════
MU = complex(-0.09, 0.075); RC = abs(1 - MU)
th_ = np.linspace(0, TAU, 97)[:-1]
zc = MU + RC * np.exp(1j * th_); prof = zc + 1 / zc
CH_Z = prof.real.max() - prof.real.min(); SCL = CHORD / CH_Z; XC_Z = (prof.real.max() + prof.real.min()) / 2
def fiz(zeta):    # ζ → (x, z) в мире: крыло повёрнуто на угол атаки (нос вверх), центр хорды в (XWING, ZA)
    w = (zeta - XC_Z) * cmath.exp(-1j * ALFA)
    return XWING + w.real * SCL, ZA + w.imag * SCL
kryl = uzel('model-kryla')
pts = [fiz(z) for z in prof]
# утолщаем острую заднюю кромку на 1 мм, чтобы у меша не было нулевой толщины
SPAN = A0 - 0.006
verts, faces, uvs = [], [], []
nP = len(pts)
for j, yy in enumerate((-SPAN, SPAN)):
    for i, (x, z) in enumerate(pts):
        verts.append(Vector((x, yy, z))); uvs.append((i / nP * 1.2, j * 0.8))
for i in range(nP):
    faces.append((i, (i + 1) % nP, nP + (i + 1) % nP, nP + i))
faces.append(tuple(range(nP - 1, -1, -1))); faces.append(tuple(range(nP, 2 * nP)))
mesh_obj('krylo', verts, faces, uvs, M['krylo'], kryl, ostryj=60)
for yy in (-SPAN - 0.001, SPAN + 0.001):  # латунные торцевые накладки
    vv = [Vector((x, yy, z)) for x, z in pts]
    cx = sum(v.x for v in vv) / nP; cz = sum(v.z for v in vv) / nP
    vv2 = [Vector((cx + (v.x - cx) * 1.06, yy + (0.003 if yy > 0 else -0.003), cz + (v.z - cz) * 1.25)) for v in vv]
    f = [tuple(range(nP)), tuple(range(2 * nP - 1, nP - 1, -1))] + [(i, (i + 1) % nP, nP + (i + 1) % nP, nP + i) for i in range(nP)]
    if yy < 0: f = [tuple(reversed(q)) for q in f]
    mesh_obj('krylo-shajba', vv + vv2, f, [(v.x * 3, v.z * 3) for v in vv + vv2], M['latun'], kryl, ostryj=50)
# узел крепления державки на крыле
lathe('krylo-bobyshka', [(0, 0), (0.014, 0), (0.014, 0.02), (0.009, 0.03), (0, 0.03)], M['latun'], kryl, seg=16,
      at=osi((XWING, 0, ZA + 0.012), (0, 0, 1)))

# ══ 4. Весы: державка сквозь крышу, рычажные весы на чугунной плите ═══════════════════════════════════════
ves = uzel('vesy')
ZT = ZA + B0 + TH + 0.012            # крыша
sterzhen('derzhavka', (XWING, 0, ZA + 0.03), (XWING, 0, ZT + 0.16), 0.006, M['stal'], ves, seg=12)
box('ves-plita', (0.46, 0.26, 0.025), (XWING - 0.05, 0, ZT + 0.0125), M['chugun'], ves, fask=0.006)
for dx in (-0.26, 0.16):
    for dy in (-0.11, 0.11):
        bolt('ves-bolt', (XWING + dx, dy, ZT + 0.025), (0, 0, 1), 0.007, M['ugol'], ves)
ZB = ZT + 0.22                       # ось коромысла
for s in (-1, 1):                    # латунные стойки-колонки
    lathe('ves-kolonka', [(0, 0), (0.024, 0), (0.024, 0.012), (0.012, 0.022), (0.009, 0.05), (0.009, 0.17), (0.013, 0.18),
                          (0.013, 0.205), (0, 0.205)], M['latun'], ves, seg=20, at=osi((XWING, s * 0.075, ZT + 0.025), (0, 0, 1)))
box('ves-prizma', (0.02, 0.17, 0.012), (XWING, 0, ZB - 0.006), M['stal'], ves, fask=0.002)
# коромысло: плоская стальная балка от весовой чаши (−X) до противовеса (+X)
XL, XR = XWING - 0.40, XWING + 0.22
box('ves-koromyslo', (XR - XL, 0.014, 0.024), ((XL + XR) / 2, 0, ZB + 0.006), M['stal'], ves, fask=0.003)
box('ves-koromyslo-shkala', (0.30, 0.004, 0.012), (XWING - 0.20, 0.009, ZB + 0.012), M['latun'], ves, fask=0.001)
for i in range(13):                  # риски шкалы — геометрией
    box('ves-riska', (0.0015, 0.002, 0.008 if i % 4 else 0.014), (XWING - 0.33 + i * 0.022, 0.0115, ZB + 0.012), M['ugol'], ves, fask=0)
box('ves-reiter', (0.018, 0.026, 0.03), (XWING - 0.17, 0, ZB + 0.008), M['latun'], ves, fask=0.003)   # бегунок
lathe('ves-protivoves', [(0, -0.04), (0.035, -0.04), (0.04, -0.03), (0.04, 0.03), (0.035, 0.04), (0, 0.04)], M['latun'], ves, seg=28,
      at=osi((XR + 0.04, 0, ZB + 0.006), (1, 0, 0)))
sterzhen('ves-tyaga', (XWING, 0, ZT + 0.16), (XWING, 0, ZB - 0.01), 0.004, M['stal'], ves, seg=10)
tor('ves-serga', 0.012, 0.0025, osi((XWING, 0, ZT + 0.16), (0, 1, 0)), M['stal'], ves, seg=16, k=6)
# чаша с гирями на подвесе
xc = XL + 0.03
for k in range(3):
    a = TAU * k / 3 + 0.3
    sterzhen('ves-podves', (xc, 0, ZB - 0.005), (xc + 0.05 * math.cos(a), 0.05 * math.sin(a), ZT + 0.07), 0.0016, M['stal'], ves, seg=6)
lathe('ves-chasha', [(0, 0), (0.035, 0.0), (0.055, 0.008), (0.06, 0.016), (0.057, 0.016), (0.034, 0.004), (0, 0.004)], M['latun'], ves, seg=32,
      at=osi((xc, 0, ZT + 0.055), (0, 0, 1)))
zg = ZT + 0.059
for (r_, h_) in ((0.028, 0.016), (0.022, 0.013), (0.016, 0.011)):
    lathe('ves-girya', [(0, 0), (r_, 0), (r_, h_ - 0.003), (r_ * 0.55, h_), (r_ * 0.4, h_ + 0.008), (r_ * 0.5, h_ + 0.012), (0, h_ + 0.012)],
          M['latun'], ves, seg=24, at=osi((xc, 0, zg), (0, 0, 1)), ostryj=40)
    zg += h_
# стрелка и дуга-указатель на противовесном конце
sterzhen('ves-strelka', (XR - 0.02, 0, ZB + 0.02), (XR - 0.02, 0, ZB + 0.15), 0.0025, M['ugol'], ves, seg=6)
for i in range(9):
    a0, a1 = math.radians(-20 + i * 5), math.radians(-15 + i * 5)
    p0 = Vector((XR - 0.02 + 0.15 * math.sin(a0), 0.012, ZB + 0.15 * math.cos(a0)))
    p1 = Vector((XR - 0.02 + 0.15 * math.sin(a1), 0.012, ZB + 0.15 * math.cos(a1)))
    brus('ves-duga', p0, p1, 0.006, 0.012, M['latun'], ves, up=(0, 1, 0), fask=0.001)
sterzhen('ves-duga-stoika', (XR - 0.02, 0.012, ZT + 0.025), (XR - 0.02, 0.012, ZB + 0.13), 0.005, M['latun'], ves, seg=10)
# демпфер (масляный успокоитель) под коромыслом
lathe('ves-dempfer', [(0, 0), (0.026, 0), (0.026, 0.07), (0.029, 0.075), (0.029, 0.08), (0.006, 0.08)], M['latun'], ves, seg=24,
      at=osi((XR - 0.09, 0, ZT + 0.025), (0, 0, 1)))
sterzhen('ves-dempfer-shtok', (XR - 0.09, 0, ZT + 0.07), (XR - 0.09, 0, ZB - 0.006), 0.003, M['stal'], ves, seg=8)

# ══ 5. Вентилятор: щит с кольцом, двухлопастный винт, электромотор на деревянной станине ═══════════════════
ven = uzel('ventilyator')
# щит вентилятора: квадратная доска с круглым проёмом (вертикальные доски + обечайка)
RO = RPROP + 0.025; HW = AD1 + TH + 0.06
nseg = 96; verts, faces, uvs = [], [], []
for j, xx in enumerate((XF, XF + 0.05)):
    for i in range(nseg):
        a = TAU * i / nseg
        c, s_ = math.cos(a), math.sin(a)
        k = HW / max(abs(c), abs(s_))
        verts.append(Vector((xx, RO * c, ZA + RO * s_))); verts.append(Vector((xx, k * c, ZA + k * s_)))
        uvs += [(RO * c, RO * s_ + j * 0.3), (k * c, k * s_ + j * 0.3)]
nv = 2 * nseg
for i in range(nseg):
    a, b = 2 * i, 2 * ((i + 1) % nseg)
    faces.append((a, a + 1, b + 1, b))                       # перед
    faces.append((nv + a, nv + b, nv + b + 1, nv + a + 1))   # зад
    faces.append((a + 1, nv + a + 1, nv + b + 1, b + 1))     # наружный край
    faces.append((a, b, nv + b, nv + a))                     # проём
ob = mesh_obj('shchit', verts, faces, uvs, M['sosna'][0], ven, ostryj=30)
bm_ = bmesh.new(); bm_.from_mesh(ob.data); bmesh.ops.recalc_face_normals(bm_, faces=bm_.faces); bm_.to_mesh(ob.data); bm_.free()
ob.data.set_sharp_from_angle(angle=math.radians(30))
for z in np.linspace(-HW, HW, 8)[1:-1]:                     # швы досок щита — накладные планки
    for s in (-1, 1):
        y0 = s * HW; y1 = s * math.sqrt(max(RO ** 2 - z ** 2, 0)) if abs(z) < RO else 0
        if abs(z) < RO:
            brus('shchit-planka', (XF - 0.005, y1 + s * 0.02, ZA + z), (XF - 0.005, y0 - s * 0.01, ZA + z), 0.012, 0.03, M['rebro'], ven, up=(0, 0, 1))
for s in (-1, 1):
    brus('shchit-stoyka', (XF + 0.08, s * (HW - 0.05), 0.0), (XF + 0.08, s * (HW - 0.05), ZA + HW), 0.07, 0.07, M['rebro'], ven, up=(1, 0, 0))
    brus('shchit-podkos', (XF + 0.40, s * (HW - 0.05), 0.0), (XF + 0.10, s * (HW - 0.05), ZA + 0.25), 0.05, 0.05, M['rebro'], ven, up=(0, 1, 0))
    box('shchit-bashmak', (0.1, 0.1, 0.03), (XF + 0.08, s * (HW - 0.05), 0.015), M['chugun'], ven, fask=0.006)
lathe('obechajka', [(RO - 0.004, -0.01), (RO + 0.02, -0.01), (RO + 0.02, 0.0), (RO + 0.002, 0.004), (RO + 0.002, 0.16), (RO + 0.012, 0.165),
                    (RO + 0.012, 0.18), (RO - 0.004, 0.18)], M['stal'], ven, seg=96, at=osi((XF + 0.05, 0, ZA), (1, 0, 0)), ostryj=40)
for i in range(16):
    a = TAU * (i + 0.5) / 16
    bolt('obechajka-bolt', (XF + 0.045, (RO + 0.012) * math.cos(a), ZA + (RO + 0.012) * math.sin(a)), (-1, 0, 0), 0.007, M['ugol'], ven)

# винт: две лопасти с круткой и сужением, профиль «плоско-выпуклый»
def lopast(imya, ugol, rodit):
    nr, nk = 22, 14
    verts, faces, uvs = [], [], []
    r0 = 0.055
    for i in range(nr + 1):
        u = i / nr; r = r0 + (RPROP - r0) * u
        ch = 0.15 * (1 - 0.45 * u) * (math.sqrt(max(1 - ((u - 0.15) / 0.86) ** 6, 0)) if u > 0.15 else 1) + 0.006
        ch = max(ch, 0.012)
        if u < 0.12: ch = 0.06 + (ch - 0.06) * (u / 0.12)
        tol = ch * (0.16 if u > 0.12 else 0.5)
        beta = math.atan2(0.18, TAU * r / 3.0) if u > 0.05 else math.radians(60)   # крутка
        for j in range(nk):
            ang = TAU * j / nk
            px = -0.5 * ch * math.cos(ang)
            pz = (0.5 * tol * math.sin(ang) * (1.0 if math.sin(ang) > 0 else 0.35)) * (1 - 0.6 * ((px / ch + 0.5) ** 3))
            # в плоскости вращения: хорда вдоль окружного направления t, толщина вдоль оси X
            cx = px * math.cos(beta) - pz * math.sin(beta); cz = px * math.sin(beta) + pz * math.cos(beta)
            tdir = Vector((0, -math.sin(ugol), math.cos(ugol))); rdir = Vector((0, math.cos(ugol), math.sin(ugol)))
            verts.append(Vector((XP, 0, ZA)) + rdir * r + tdir * cx + Vector((1, 0, 0)) * cz)
            uvs.append((u * 1.4, j / nk * 0.4))
    for i in range(nr):
        for j in range(nk):
            a, b = i * nk + j, (i + 1) * nk + j
            faces.append((a, a + (1 if j < nk - 1 else 1 - nk), b + (1 if j < nk - 1 else 1 - nk), b))
    faces.append(tuple(range(nr * nk + nk - 1, nr * nk - 1, -1)))
    ob = mesh_obj(imya, verts, faces, uvs, M['vint'], rodit, ostryj=70)
    bm_ = bmesh.new(); bm_.from_mesh(ob.data); bmesh.ops.recalc_face_normals(bm_, faces=bm_.faces); bm_.to_mesh(ob.data); bm_.free()
    ob.data.set_sharp_from_angle(angle=math.radians(70))
UG = math.radians(62)
for k in range(2): lopast('lopast', UG + math.pi * k, ven)
at = osi((XP - 0.06, 0, ZA), (1, 0, 0))
lathe('vtulka', [(0, -0.03), (0.035, -0.025), (0.05, -0.005), (0.06, 0.0), (0.06, 0.09), (0.04, 0.10), (0.03, 0.14)], M['stal'], ven, seg=32, at=at, ostryj=40)
for xx in (XP - 0.03, XP + 0.03):    # прижимные фланцы ступицы
    lathe('vtulka-flanec', [(0.02, 0), (0.085, 0), (0.088, 0.003), (0.088, 0.011), (0.085, 0.014), (0.02, 0.014)], M['stal'], ven, seg=40,
          at=osi((xx - 0.007, 0, ZA), (1, 0, 0)), ostryj=40)
    for i in range(6):
        a = TAU * i / 6 + 0.26
        bolt('vtulka-bolt', (xx + (0.007 if xx > XP else -0.007), 0.065 * math.cos(a), ZA + 0.065 * math.sin(a)), (1 if xx > XP else -1, 0, 0), 0.008, M['latun'], ven)
sterzhen('val', (XP + 0.07, 0, ZA), (XMOT0 + 0.02, 0, ZA), 0.018, M['stal'], ven, seg=20)
# электромотор: корпус с рёбрами, торцевые щиты с вентиляционными окнами, подшипник, лапы
RM = 0.24; at = osi((XMOT0, 0, ZA), (1, 0, 0)); L = XMOT1 - XMOT0
lathe('motor-korpus', [(0.0, 0.02), (RM - 0.02, 0.02), (RM, 0.03), (RM, L - 0.03), (RM - 0.02, L - 0.02), (0, L - 0.02)], M['motor'], ven, seg=64, at=at, ostryj=35)
for z in np.linspace(0.07, L - 0.07, 7):
    lathe('motor-rebro', [(RM - 0.002, z - 0.008), (RM + 0.014, z - 0.005), (RM + 0.014, z + 0.005), (RM - 0.002, z + 0.008)], M['motor'], ven, seg=64, at=at)
for kon, (z0, nap) in enumerate(((0.02, -1), (L - 0.02, 1))):
    zz = z0 + nap * 0.0
    lathe('motor-shchit', [(RM + 0.004, zz), (RM + 0.004, zz + nap * 0.03), (RM - 0.03, zz + nap * 0.038), (RM - 0.035, zz + nap * 0.03), (RM - 0.035, zz)],
          M['motor'], ven, seg=64, at=at, ostryj=35)
    lathe('motor-okna', [(0.06, zz + nap * 0.012), (RM - 0.035, zz + nap * 0.012)], M['temn'], ven, seg=48, at=at)
    for i in range(12):        # спицы щита между окнами
        a = TAU * i / 12
        p0 = at @ Vector((0.07 * math.cos(a), 0.07 * math.sin(a), zz + nap * 0.03)); p1 = at @ Vector(((RM - 0.035) * math.cos(a), (RM - 0.035) * math.sin(a), zz + nap * 0.03))
        brus('motor-spica', p0, p1, 0.022, 0.03, M['motor'], ven, up=(1, 0, 0), fask=0.004)
    lathe('motor-podshipnik', [(0, zz + nap * 0.09), (0.04, zz + nap * 0.09), (0.05, zz + nap * 0.075), (0.07, zz + nap * 0.04), (0.075, zz + nap * 0.03),
                               (0.06, zz + nap * 0.02)], M['motor'], ven, seg=40, at=at, ostryj=40)
    lathe('motor-maslenka', [(0, 0), (0.012, 0), (0.012, 0.025), (0.018, 0.03), (0.018, 0.045), (0, 0.05)], M['latun'], ven, seg=16,
          at=osi(at @ Vector((0, 0.065, zz + nap * 0.055)), (0, 0, 1)))
for s in (-1, 1):   # лапы
    for z in (0.08, L - 0.08):
        box('motor-lapa', (0.07, 0.10, 0.11), (XMOT0 + z, s * 0.17, ZA - RM + 0.02), M['motor'], ven, fask=0.012)
        bolt('motor-lapa-bolt', (XMOT0 + z, s * 0.19, ZA - RM - 0.035), (0, 0, 1), 0.012, M['ugol'], ven)
box('motor-klemmnik', (0.12, 0.09, 0.07), (XMOT0 + L / 2, 0, ZA + RM + 0.02), M['chugun'], ven, fask=0.012)
lathe('motor-vvod', [(0, 0), (0.022, 0), (0.022, 0.04), (0.016, 0.05), (0.016, 0.07), (0, 0.07)], M['latun'], ven, seg=16,
      at=osi((XMOT0 + L / 2 + 0.06, 0.0, ZA + RM + 0.02), (1, 0, 0)))
# деревянная станина-трапеция под мотор (как на снимке 1916 г.)
ZS = ZA - RM - 0.04
for s in (-1, 1):
    brus('stanina', (XMOT0 - 0.08, s * 0.19, ZS - 0.03), (XMOT1 + 0.08, s * 0.19, ZS - 0.03), 0.08, 0.07, M['rebro'], ven, up=(0, 0, 1))
    for x in (XMOT0 - 0.02, XMOT1 + 0.02):
        brus('stanina-noga', (x + (0.1 if x > XMOT0 else -0.1), s * 0.30, 0.0), (x, s * 0.19, ZS - 0.06), 0.07, 0.07, M['rebro'], ven, up=(1, 0, 0))
        box('stanina-bashmak', (0.1, 0.1, 0.03), (x + (0.1 if x > XMOT0 else -0.1), s * 0.30, 0.015), M['chugun'], ven, fask=0.006)
    brus('stanina-raskos', (XMOT0 - 0.1, s * 0.27, 0.22), (XMOT1 + 0.1, s * 0.27, 0.22), 0.05, 0.06, M['rebro'], ven, up=(0, 0, 1))
for x in (XMOT0 + 0.05, XMOT1 - 0.05):
    brus('stanina-poperechina', (x, -0.25, ZS - 0.03), (x, 0.25, ZS - 0.03), 0.07, 0.06, M['rebro'], ven, up=(0, 0, 1))
# кабель к рубильнику: на стойке у мотора, мраморная доска, медные ножи
XR_, YR_ = XMOT1 - 0.05, -0.72
brus('rubilnik-stoyka', (XR_, YR_, 0.0), (XR_, YR_, 1.0), 0.08, 0.06, M['rebro'], ven, up=(0, 1, 0))
box('rubilnik-bashmak', (0.22, 0.22, 0.035), (XR_, YR_, 0.0175), M['rebro'], ven, fask=0.008)
box('rubilnik-doska', (0.24, 0.03, 0.30), (XR_, YR_ - 0.045, 0.86), M['mramor'], ven, fask=0.008)
for i, dx in enumerate((-0.06, 0.0, 0.06)):
    box('rubilnik-kolodka', (0.022, 0.03, 0.04), (XR_ + dx, YR_ - 0.075, 0.78), M['med'], ven, fask=0.003)
    box('rubilnik-kolodka', (0.022, 0.03, 0.04), (XR_ + dx, YR_ - 0.075, 0.94), M['med'], ven, fask=0.003)
    brus('rubilnik-nozh', (XR_ + dx, YR_ - 0.08, 0.78), (XR_ + dx, YR_ - 0.10, 0.95), 0.008, 0.03, M['med'], ven, up=(0, 1, 0), fask=0.001)
sterzhen('rubilnik-traversa', (XR_ - 0.09, YR_ - 0.105, 0.93), (XR_ + 0.09, YR_ - 0.105, 0.93), 0.008, M['rezina'], ven, seg=10)
lathe('rubilnik-ruchka', [(0, 0), (0.014, 0), (0.016, 0.05), (0.012, 0.07), (0, 0.075)], M['rezina'], ven, seg=12, at=osi((XR_, YR_ - 0.105, 0.93), (0, -1, 0.3)))
def kabel(imya, tochki, r, rodit):
    sp = []
    P_ = [Vector(p) for p in tochki]
    for i in range(len(P_) - 1):
        p0, p1 = P_[max(i - 1, 0)], P_[i]; p2, p3 = P_[i + 1], P_[min(i + 2, len(P_) - 1)]
        for k in range(10):
            t = k / 10
            sp.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    sp.append(P_[-1])
    return sweep(imya, sp, [(r * math.cos(TAU * j / 10), r * math.sin(TAU * j / 10)) for j in range(10)], M['rezina'], rodit, tile=0.3)
kabel('kabel', [(XMOT0 + L / 2 + 0.13, 0, ZA + RM + 0.02), (XMOT1 + 0.12, -0.05, ZA + RM - 0.05), (XMOT1 + 0.12, -0.25, 0.25),
                (XMOT1 + 0.06, -0.45, 0.02), (XR_ + 0.02, YR_ + 0.05, 0.05), (XR_, YR_ + 0.035, 0.4), (XR_ + 0.0, YR_ - 0.03, 0.72)], 0.012, ven)

# ══ 6. Струйки потока: линии тока по теореме Кутты — Жуковского, ленты-«крестовины» ═══════════════════════
pot = uzel('struyki-potoka')
U = 1.0
G = (-2 * math.pi * (1 - MU) * U * (cmath.exp(-1j * ALFA) - RC ** 2 * cmath.exp(1j * ALFA) / (1 - MU) ** 2) / 1j).real   # условие Кутты
def dwdz(z): return U * (cmath.exp(-1j * ALFA) - RC ** 2 * cmath.exp(1j * ALFA) / (z - MU) ** 2) + 1j * G / (TAU * (z - MU))
def iz_zeta(zeta):
    r = cmath.sqrt(zeta * zeta - 4); z1, z2 = (zeta + r) / 2, (zeta - r) / 2
    return z1 if abs(z1 - MU) > abs(z2 - MU) else z2
def liniya_toka(h_m):
    """Линия тока, входящая на высоте h_m (м) над осью; возвращает [(x, z)] мира от x = XWING − 0.75 до XWING + 0.75."""
    X0 = complex(-0.75 / SCL, h_m / SCL)
    zeta = X0 * cmath.exp(1j * ALFA) + XC_Z
    z = iz_zeta(zeta); out = []
    dt = 0.04
    for _ in range(6000):
        def vel(z):
            W = dwdz(z) / (1 - 1 / (z * z)); return W.conjugate() / (1 - 1 / (z * z))
        k1 = vel(z); k2 = vel(z + dt / 2 * k1); k3 = vel(z + dt / 2 * k2); k4 = vel(z + dt * k3)
        z = z + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        x, zz = fiz(z + 1 / z); out.append((x, zz))
        if x > XWING + 0.75: break
    return out
def nesti(x, y, z):
    """Сжатие/расширение струек по форме канала + закрутка за винтом."""
    a, b = polu(x)
    ky, kz = a / A0, b / B0
    if x < XM:                       # перед устьем: струйки сходятся из комнаты
        u = min(1.0, (XM - x) / 0.5); ky, kz = ky * (1 + 0.7 * u), kz * (1 + 0.5 * u)
    p = Vector((x, y * ky, ZA + (z - ZA) * kz))
    if x > XD1:
        q = min(1.0, (x - XD1) / 0.25)
        a_ = math.atan2(p.z - ZA, p.y); r_ = math.hypot(p.y, p.z - ZA)
        r_ = r_ * (1 - 0.45 * q) + (RM + 0.05) * 0.45 * q if x > XP else r_ * (1 - 0.15 * q)
        if x > XP: a_ += (x - XP) * 4.0
        p = Vector((x, r_ * math.cos(a_), ZA + r_ * math.sin(a_)))
    return p
def lenta(imya, tochki, w, rodit):
    """Лента-крестовина: две узкие полосы под 90°, видна с любой стороны."""
    P_ = [Vector(p) for p in tochki]; n = len(P_)
    verts, faces, uvs = [], [], []
    for kk, ang in enumerate((math.radians(45), math.radians(-45))):
        base = len(verts)
        for i in range(n):
            T = (P_[min(i + 1, n - 1)] - P_[max(i - 1, 0)]).normalized()
            Y = Vector((0, 1, 0)); Y = (Y - T * Y.dot(T)).normalized(); Z = T.cross(Y)
            d = (Y * math.cos(ang) + Z * math.sin(ang)) * (w / 2)
            verts += [P_[i] - d, P_[i] + d]; u = i / (n - 1); uvs += [(u, 0), (u, 1)]
        for i in range(n - 1):
            a = base + 2 * i; faces.append((a, a + 2, a + 3, a + 1))
    return mesh_obj(imya, verts, faces, uvs, M['struyka'], rodit, smooth=True)
VYSOTY = [-0.215, -0.15, -0.085, -0.03, 0.025, 0.08, 0.14, 0.205]
SLOI_Y = [-0.12, 0.0, 0.12]
for h in VYSOTY:
    kj = liniya_toka(h)
    xs_kj = [p[0] for p in kj]
    z_vyh = kj[-1][1]
    for iy, y in enumerate(SLOI_Y):
        if (iy + VYSOTY.index(h)) % 2 == 1 and abs(y) > 0.01: continue   # шахматный порядок: не сплошная стена лент
        tch = []
        for x in np.arange(XM - 0.45, XWING - 0.75, 0.04): tch.append(nesti(x, y, ZA + h))
        for (x, z) in kj[::2]: tch.append(nesti(x, y, z))
        for x in np.arange(XWING + 0.79, XMOT1 + 0.35, 0.03):
            zz = z_vyh + (ZA + h - z_vyh) * min(1.0, (x - XWING - 0.75) / 0.8) * 0.5
            tch.append(nesti(x, y, zz))
        lenta('struyka', tch, 0.011, pot)

# ══ 7. Пол лаборатории: доски разной длины вразбежку, цоколь, тень, табурет, микроманометр ════════════════
pol = uzel('pol-laboratorii')
PX, PY = 2.55, 1.28
SHD = 0.13
y = -PY
while y < PY - 1e-3:
    w = min(SHD, PY - y)
    x = -PX - R.random() * 1.2
    while x < PX:
        L_ = 0.9 + R.random() * 1.6
        x0, x1 = max(x, -PX), min(x + L_, PX)
        if x1 - x0 > 0.05:
            box('pol-doska', (x1 - x0 - 0.004, w - 0.004, 0.035), ((x0 + x1) / 2, y + w / 2, -0.0175), M['pol'][R.integers(4)], pol,
                fask=0.004, tile=0.9, uvsdvig=(R.random(), R.random()))
        x += L_
    y += SHD
box('pol-cokol', (2 * PX + 0.06, 2 * PY + 0.06, 0.10), (0, 0, -0.085), M['cokol'], pol, fask=0.012, tile=1.6)
box('pol-plintus', (2 * PX + 0.1, 0.05, 0.03), (0, -PY - 0.03, -0.035), M['cokol'], pol, fask=0.008)
box('pol-plintus', (2 * PX + 0.1, 0.05, 0.03), (0, PY + 0.03, -0.035), M['cokol'], pol, fask=0.008)
mesh_obj('ten', [(-2.5, -1.25, 0.002), (2.5, -1.25, 0.002), (2.5, 1.25, 0.002), (-2.5, 1.25, 0.002)], [(0, 1, 2, 3)],
         [(0, 0), (1, 0), (1, 1), (0, 1)], M['ten'], pol, smooth=False)
# табурет
TX, TY = -0.55, -0.98
lathe('taburet-sidene', [(0, 0.44), (0.15, 0.44), (0.165, 0.45), (0.165, 0.47), (0.15, 0.48), (0, 0.48)], M['sosna'][2], pol, seg=40,
      at=osi((TX, TY, 0), (0, 0, 1)), ostryj=40)
for k in range(3):
    a = TAU * k / 3 + 0.4
    sterzhen('taburet-noga', (TX + 0.17 * math.cos(a), TY + 0.17 * math.sin(a), 0), (TX + 0.1 * math.cos(a), TY + 0.1 * math.sin(a), 0.445), 0.017, M['sosna'][0], pol, seg=10)
    a2 = a + TAU / 3
    sterzhen('taburet-perekladina', (TX + 0.15 * math.cos(a), TY + 0.15 * math.sin(a), 0.16), (TX + 0.15 * math.cos(a2), TY + 0.15 * math.sin(a2), 0.16), 0.01, M['sosna'][0], pol, seg=8)
# микроманометр на столике: наклонная стеклянная трубка с подкрашенным спиртом, латунный бачок
SX, SY = -1.02, -0.92
box('stolik-kryshka', (0.52, 0.36, 0.03), (SX, SY, 0.66), M['sosna'][1], pol, fask=0.008)
box('stolik-carga', (0.46, 0.30, 0.07), (SX, SY, 0.61), M['sosna'][0], pol, fask=0.006)
for dx in (-0.21, 0.21):
    for dy in (-0.14, 0.14):
        lathe('stolik-noga', [(0, 0), (0.016, 0), (0.019, 0.05), (0.014, 0.25), (0.02, 0.4), (0.022, 0.5), (0.02, 0.575), (0.022, 0.6), (0, 0.6)],
              M['sosna'][0], pol, seg=14, at=osi((SX + dx, SY + dy, 0), (0, 0, 1)))
NAK = math.radians(14)
d_ = Vector((math.cos(NAK), 0, math.sin(NAK)))
p0 = Vector((SX - 0.2, SY + 0.02, 0.70))
brus('manometr-doska', p0, p0 + d_ * 0.42, 0.08, 0.02, M['sosna'][2], pol, up=(-math.sin(NAK), 0, math.cos(NAK)))
for k in range(9):
    pp = p0 + d_ * (0.06 + k * 0.04) + Vector((0, 0.025, 0.012))
    box('manometr-riska', (0.002, 0.018 if k % 2 else 0.03, 0.002), pp, M['ugol'], pol, fask=0)
sterzhen('manometr-trubka', p0 + Vector((0, 0, 0.022)), p0 + d_ * 0.4 + Vector((0, 0, 0.022)), 0.0065, M['steklo'], pol, seg=12)
sterzhen('manometr-spirt', p0 + Vector((0, 0, 0.022)), p0 + d_ * 0.23 + Vector((0, 0, 0.022)), 0.0042, M['zhidk'], pol, seg=10)
lathe('manometr-bachok', [(0, 0), (0.035, 0), (0.035, 0.07), (0.04, 0.075), (0.04, 0.085), (0.01, 0.09), (0.01, 0.11), (0, 0.11)],
      M['latun'], pol, seg=28, at=osi((SX - 0.2, SY + 0.02, 0.675), (0, 0, 1)), ostryj=40)
for dx in (-0.2, 0.18):
    lathe('manometr-vint', [(0, 0), (0.008, 0), (0.008, 0.03), (0.016, 0.032), (0.016, 0.042), (0, 0.044)], M['latun'], pol, seg=12,
          at=osi((SX + dx, SY - 0.12, 0.675), (0, 0, 1)))
kabel('shlang', [(SX - 0.2, SY + 0.02, 0.785), (SX - 0.15, SY + 0.12, 0.86), (-0.9, -0.55, 0.88), (-0.88, -(A0 + TH) - 0.07, ZA - 0.1)], 0.008, pol)

# ── сдвиг: центр модели — в начало координат (по X), низ пола — у нуля ────────────────────────────────────
KOREN.location = (-0.02, 0, 0)

for o_ in PARTS:                      # единая ориентация нормалей (наружу), затем острые рёбра по углу
    if o_.name.startswith(('struyka', 'ten')): continue
    bm_ = bmesh.new(); bm_.from_mesh(o_.data); bmesh.ops.recalc_face_normals(bm_, faces=bm_.faces); bm_.to_mesh(o_.data); bm_.free()
    o_.data.set_sharp_from_angle(angle=math.radians(OSTR.get(o_.name.split('.')[0], 40)))
# слить меши внутри каждой части по материалам: узлов меньше, сжатие лучше (-kn у gltfpack держит все имена)
vl = bpy.context.view_layer
tri = 0
for p in PARTS: p.data.calc_loop_triangles(); tri += len(p.data.loop_triangles)
for e in list(KOREN.children):
    gr = {}
    for o_ in e.children:
        if o_.type == 'MESH': gr.setdefault(o_.data.materials[0].name, []).append(o_)
    for mn, obs in gr.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o_ in obs: o_.select_set(True)
        vl.objects.active = obs[0]
        if len(obs) > 1: bpy.ops.object.join()
        obs[0].name = f'{e.name}-{mn}'; obs[0].data.name = obs[0].name
bpy.ops.object.select_all(action='DESELECT')
bpy.context.view_layer.update()
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=True, export_extras=True,
                          export_image_format='AUTO', export_materials='EXPORT', export_tangents=False, export_lights=False,
                          export_cameras=False)
print('GLB', OUT, os.path.getsize(OUT), 'байт, треугольников', tri, 'мешей', len(PARTS))
