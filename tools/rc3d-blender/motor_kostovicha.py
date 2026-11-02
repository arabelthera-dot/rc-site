# r593-11: бензиновый мотор О. С. Костовича для дирижабля «Россия» (1883–1884) кодом в Блендере 4.2.
# Музейный экспонат на деревянном постаменте; передний правый цилиндр — в разрезе (виден бронзовый поршень и шток).
#   ~/opt/blender-run.sh --python motor_kostovicha.py -- glb    <выход.glb>
#   ~/opt/blender-run.sh --python motor_kostovicha.py -- snimok <файл.png> [ширина высота сэмплы]
#
# ЧТО ИЗ ФАЙЛА ДНЯ (01-11.yaml): 8 цилиндров двумя четвёрками навстречу друг другу; цилиндры и поршни бронзовые; коленчатый
# вал, шатуны и коромысла стальные; смесь из карбюратора по четырём патрубкам к впускным клапанам; зажигание электрическое,
# током низкого напряжения; охлаждение водяное; смазка из маслёнок; большой маховик; тёмная чугунная станина (подпись фото).
# ДОПУЩЕНИЯ: все размеры — на глаз по фото музея (ЦМВВС, Монино); кинематика коромысел упрощена; водяная рубашка,
# устройство запально-клапанных коробок, вид карбюратора, батарея и проводка зажигания — реконструкция;
# коромысла в музее — тёмные литые, здесь так же (тёмный металл).
import bpy, bmesh, math, sys, os
import numpy as np
from mathutils import Vector, Matrix
from collections import defaultdict

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['glb', '/tmp/pomoshchniki/r593-3d-mashiny-v2/11/raw.glb']
MODE = A[0]
DIR = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(DIR, 'tex'); os.makedirs(TEX, exist_ok=True)
TAU = math.tau

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# ── текстуры: периодический шум через БПФ ────────────────────────────────────────────────────────────
rng = np.random.default_rng(1884)
def shum(n, beta=2.0, aniz=(1.0, 1.0)):
    w = rng.standard_normal((n, n))
    fy = np.fft.fftfreq(n)[:, None] * aniz[0]; fx = np.fft.fftfreq(n)[None, :] * aniz[1]
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

def tex_bronza(n=512):    # литая бронза: полированные места, тёмная патина в углублениях, литейное зерно
    a, b, g = shum(n, 2.2), shum(n, 3.0), shum(n, 0.5)
    pat = ss(0.52, 0.80, a * 0.75 + g * 0.25)
    svet = np.array([0.66, 0.47, 0.24]) * (0.86 + 0.22 * b[..., None])
    temn = np.array([0.30, 0.215, 0.12]) * (0.8 + 0.3 * g[..., None])
    col = svet * (1 - pat[..., None]) + temn * pat[..., None]
    rough = 0.24 + 0.10 * b + 0.30 * pat; metal = 1.0 - 0.25 * pat
    return col, np.dstack([np.ones_like(a), rough, metal]), normal_iz(0.5 * b + 0.15 * g + 0.4 * pat, 1.6)
def tex_chugun(n=512):    # чугун под чёрной краской: разводы, сколы до серого металла, бурая ржавчина в порах
    a, b, g, c = shum(n, 2.0), shum(n, 2.8), shum(n, 0.4), shum(n, 1.4)
    skol = ss(0.80, 0.86, a * 0.6 + g * 0.4)
    rzh = ss(0.70, 0.85, c) * (1 - skol)
    kr = np.array([0.055, 0.055, 0.052]) * (0.8 + 0.4 * b[..., None])
    col = kr * (1 - skol[..., None]) + np.array([0.30, 0.30, 0.29])[None, None] * skol[..., None]
    col = col * (1 - rzh[..., None] * 0.6) + np.array([0.16, 0.08, 0.04]) * rzh[..., None] * 0.6
    rough = 0.42 + 0.2 * b + 0.15 * rzh - 0.1 * skol; metal = 0.25 + 0.65 * skol
    return col, np.dstack([np.ones_like(a), rough, metal]), normal_iz(0.3 * g + 0.35 * b + 0.6 * skol, 2.0)
def tex_stal(n=512):      # сталь: шлифовка вдоль, побежалость, тёмные пятна окисла
    a, b = shum(n, 2.4), shum(n, 2.0, aniz=(0.06, 1.0))
    ok = ss(0.62, 0.82, a)
    col = np.array([0.56, 0.56, 0.57]) * (0.85 + 0.2 * b[..., None])
    col = col * (1 - 0.55 * ok[..., None]) + np.array([0.12, 0.09, 0.07]) * ok[..., None] * 0.55
    rough = 0.22 + 0.12 * b + 0.3 * ok
    return col, np.dstack([np.ones_like(a), rough, 0.95 - 0.2 * ok]), normal_iz(0.4 * b + 0.3 * ok, 1.2)
def tex_sukno(n=256):     # тёмно-зелёное сукно на верхе постамента
    a, b = shum(n, 3.4), shum(n, 1.0)
    col = np.array([0.045, 0.075, 0.055]) * (0.85 + 0.25 * a[..., None] + 0.1 * b[..., None])
    return col, normal_iz(0.6 * a, 1.5)

def pbsdf(imya):
    m = bpy.data.materials.new(imya); m.use_nodes = True
    return m, m.node_tree.nodes['Principled BSDF'], m.node_tree
def mat(imya, cvet, metal, sher, coat=0.0):
    m, b, _ = pbsdf(imya)
    b.inputs['Base Color'].default_value = (*cvet, 1); b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = sher
    if coat: b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.05
    return m
def mat_tex(imya, col_img, orm_img=None, nor_img=None, nor_sila=1.0, rough_img=None, sher=0.5, coat=0.0):
    m, b, t = pbsdf(imya); N, L = t.nodes, t.links
    tc = N.new('ShaderNodeTexImage'); tc.image = col_img; L.new(tc.outputs['Color'], b.inputs['Base Color'])
    if orm_img:
        to = N.new('ShaderNodeTexImage'); to.image = orm_img
        sp = N.new('ShaderNodeSeparateColor'); L.new(to.outputs['Color'], sp.inputs['Color'])
        L.new(sp.outputs['Green'], b.inputs['Roughness']); L.new(sp.outputs['Blue'], b.inputs['Metallic'])
    elif rough_img:
        tr = N.new('ShaderNodeTexImage'); tr.image = rough_img; L.new(tr.outputs['Color'], b.inputs['Roughness'])
        b.inputs['Metallic'].default_value = 0.0
    else:
        b.inputs['Roughness'].default_value = sher; b.inputs['Metallic'].default_value = 0.0
    if nor_img:
        tn = N.new('ShaderNodeTexImage'); tn.image = nor_img
        nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = nor_sila
        L.new(tn.outputs['Color'], nm.inputs['Color']); L.new(nm.outputs['Normal'], b.inputs['Normal'])
    if coat: b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.08
    return m

c, o, nrm = tex_bronza(); BR = [kartinka('bronza-cvet', c), kartinka('bronza-orm', o, True), kartinka('bronza-normal', nrm, True)]
c, o, nrm = tex_chugun(); CH = [kartinka('chugun-cvet', c), kartinka('chugun-orm', o, True), kartinka('chugun-normal', nrm, True)]
c, o, nrm = tex_stal(); ST = [kartinka('stal-cvet', c), kartinka('stal-orm', o, True), kartinka('stal-normal', nrm, True)]
c, nrm = tex_sukno(); SU = [kartinka('sukno-cvet', c), kartinka('sukno-normal', nrm, True)]
def jpg(p, nc=False):
    im = bpy.data.images.load(os.path.join(TEX, p))
    if nc: im.colorspace_settings.name = 'Non-Color'
    return im
M = {
    'bronza': mat_tex('bronza-litaya', *BR, nor_sila=0.6),
    'chugun': mat_tex('chugun-kraska', *CH, nor_sila=0.8),
    'stal':   mat_tex('stal', *ST, nor_sila=0.5),
    'derevo': mat_tex('derevo-oreh', jpg('fine_grained_wood_Diffuse.jpg'), None, jpg('fine_grained_wood_nor_gl.jpg', True), 0.8,
                      rough_img=jpg('fine_grained_wood_Rough.jpg', True), coat=0.35),
    'sukno':  mat_tex('sukno', SU[0], None, SU[1], 0.6, sher=0.95),
    'latun':  mat('latun', (0.78, 0.58, 0.28), 1.0, 0.26),
    'bronza-temn': mat('bronza-obod', (0.36, 0.24, 0.13), 1.0, 0.42),
    'med':    mat('med', (0.80, 0.45, 0.30), 1.0, 0.32),
    'blesk':  mat('stal-shlif', (0.80, 0.80, 0.79), 1.0, 0.14),
    'temn':   mat('stal-temnaya', (0.06, 0.06, 0.065), 0.8, 0.38),
    'srez':   mat('srez-krasnyj', (0.55, 0.06, 0.035), 0.0, 0.45),
    'farfor': mat('farfor', (0.86, 0.84, 0.78), 0.0, 0.18, coat=0.6),
    'ebonit': mat('ebonit', (0.025, 0.022, 0.02), 0.0, 0.3),
    'kamen':  mat('kamen-podkladka', (0.42, 0.42, 0.40), 0.0, 0.75),
    'provod': mat('provod-opletka', (0.18, 0.12, 0.07), 0.0, 0.7),
    'voda':   mat('rubashka-polost', (0.10, 0.17, 0.20), 0.0, 0.25),
}

# ── построители ───────────────────────────────────────────────────────────────────────────────────────
def uv_po_normali(me, tile):
    ul = me.uv_layers.new(name='UV')
    for p in me.polygons:
        n = p.normal; ax = max(range(3), key=lambda k: abs(n[k])); u_, v_ = [k for k in range(3) if k != ax]
        for li, vi in zip(p.loop_indices, p.vertices):
            v = me.vertices[vi].co; ul.data[li].uv = (v[u_] / tile, v[v_] / tile)

def mesh_obj(imya, verts, faces, uvs, material, rodit, smooth=True, tile=0.6):
    me = bpy.data.meshes.new(imya); me.from_pydata(verts, [], faces); me.validate()
    if uvs is not None:
        ul = me.uv_layers.new(name='UV')
        for p in me.polygons:
            for li, vi in zip(p.loop_indices, p.vertices): ul.data[li].uv = uvs[vi]
    else:
        uv_po_normali(me, tile)
    for p in me.polygons: p.use_smooth = smooth
    me.materials.append(material)
    ob = bpy.data.objects.new(imya, me); sc.collection.objects.link(ob); ob.parent = rodit
    return ob

def bm_obj(imya, bm, material, rodit, tile=0.6):
    me = bpy.data.meshes.new(imya); bm.to_mesh(me); bm.free()
    uv_po_normali(me, tile)
    for p in me.polygons: p.use_smooth = True
    me.materials.append(material)
    ob = bpy.data.objects.new(imya, me); sc.collection.objects.link(ob); ob.parent = rodit
    return ob

def osi(p, d, up=None):
    """Матрица: локальная Z → d, локальная X → проекция up (по умолчанию +Z мира или +Y), начало в p."""
    d = Vector(d).normalized()
    up = Vector(up) if up else (Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((0, 1, 0)))
    u = (up - d * up.dot(d)).normalized(); v = d.cross(u)
    m = Matrix((u, v, d)).transposed().to_4x4(); m.translation = Vector(p)
    return m

def razbit(prof):
    polosy, cur = [], []
    for p in prof:
        if p is None: polosy.append(cur); cur = [cur[-1]]
        else: cur.append(p)
    polosy.append(cur); return polosy

def lathe(imya, prof, material, rodit, seg=48, tile=0.5, at=Matrix.Identity(4), a0=0.0, a1=TAU, phase=0.0):
    """Тело вращения вокруг локальной Z. prof — [(r, z), …]; None — излом. a0..a1 — дуга (для разреза)."""
    rmax = max(p[0] for p in prof if p); nu = max(1, round(TAU * rmax / tile))
    verts, faces, uvs = [], [], []
    for pol in razbit(prof):
        if len(pol) < 2: continue
        base = len(verts); s = 0.0; vv = [0.0]
        for j in range(1, len(pol)): s += math.hypot(pol[j][0] - pol[j - 1][0], pol[j][1] - pol[j - 1][1]); vv.append(s)
        for j, (r, z) in enumerate(pol):
            for i in range(seg + 1):
                a = a0 + (a1 - a0) * i / seg + phase
                verts.append(tuple(at @ Vector((r * math.cos(a), r * math.sin(a), z))))
                uvs.append((nu * (a1 - a0) / TAU * i / seg, (pol[0][1] + vv[j]) / tile))
        for j in range(len(pol) - 1):
            for i in range(seg):
                a, b = base + j * (seg + 1) + i, base + (j + 1) * (seg + 1) + i
                faces.append((a, a + 1, b + 1, b))
    return mesh_obj(imya, verts, faces, uvs, material, rodit)

def srez_kryshki(imya, petlya, at, ugly, rodit):
    """Плоские крышки разреза: замкнутый профиль (r, z) на углах ugly — красная плоскость музейного разреза."""
    bm = bmesh.new()
    for k, a in enumerate(ugly):
        vs = [bm.verts.new(at @ Vector((r * math.cos(a), r * math.sin(a), z))) for r, z in petlya]
        f = bm.faces.new(vs[::-1] if k else vs)
    bmesh.ops.triangulate(bm, faces=list(bm.faces))
    return bm_obj(imya, bm, M['srez'], rodit, tile=0.3)

def box(imya, size, centr, material, rodit, fask=0.012, rot=None, tile=0.6, seg=2):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    if fask > 0: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=fask, segments=seg, profile=0.5, affect='EDGES')
    T = Matrix.Translation(Vector(centr)) @ (rot if rot else Matrix.Identity(4))
    bmesh.ops.transform(bm, matrix=T, verts=bm.verts)
    return bm_obj(imya, bm, material, rodit, tile)

def brus(imya, p1, p2, w, h, material, rodit, up=(0, 0, 1), fask=0.01, tile=0.6):
    """Брус от p1 до p2: ширина w (поперёк), высота h (по up)."""
    p1, p2 = Vector(p1), Vector(p2); d = (p2 - p1); L = d.length; d.normalize()
    upv = Vector(up); z = (upv - d * upv.dot(d)).normalized(); y = z.cross(d)
    R = Matrix((d, y, z)).transposed().to_4x4()
    return box(imya, (L, w, h), (p1 + p2) / 2, material, rodit, fask=fask, rot=R, tile=tile)

def plita(imya, kontur, t, at, material, rodit, fask=0.012, tile=0.6):
    """Литая плита: контур [(a, b)] в локальной плоскости XY, толщина t по локальной Z, фаска по всем рёбрам."""
    bm = bmesh.new()
    niz = [bm.verts.new(at @ Vector((a, b, -t / 2))) for a, b in kontur]
    verh = [bm.verts.new(at @ Vector((a, b, t / 2))) for a, b in kontur]
    bm.faces.new(niz[::-1]); bm.faces.new(verh)
    n = len(kontur)
    for i in range(n):
        j = (i + 1) % n; bm.faces.new((niz[i], niz[j], verh[j], verh[i]))
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    if fask > 0:
        rebra = [e for e in bm.edges if e.calc_face_angle(0) > math.radians(30)]
        bmesh.ops.bevel(bm, geom=rebra, offset=fask, segments=2, profile=0.5, affect='EDGES', clamp_overlap=True)
    return bm_obj(imya, bm, material, rodit, tile)

def stadion(r1, r2, L, n=14):
    """Контур «стадиона»: окружность r1 в (0,0), окружность r2 в (L,0), касательные."""
    pts = []
    for i in range(n + 1):
        a = math.pi / 2 + math.pi * i / n; pts.append((r1 * math.cos(a), r1 * math.sin(a)))
    for i in range(n + 1):
        a = -math.pi / 2 + math.pi * i / n; pts.append((L + r2 * math.cos(a), r2 * math.sin(a)))
    return pts

def sterzhen(imya, p1, p2, r, material, rodit, seg=16, fask=0.0, tile=0.3):
    p1, p2 = Vector(p1), Vector(p2); L = (p2 - p1).length
    f = fask or min(r * 0.3, L / 4)
    pr = [(0, 0), (r - f, 0), (r, f), (r, L - f), (r - f, L), (0, L)]
    return lathe(imya, pr, material, rodit, seg=seg, at=osi(p1, p2 - p1), tile=tile)

def bolty(imya, centr, napr, R, n, s, material, rodit, h=None, faza=0.0, up=None):
    h = h or s * 0.7; at0 = osi(centr, napr, up)
    for i in range(n):
        a = TAU * (i + 0.5) / n + faza
        p = at0 @ Vector((R * math.cos(a), R * math.sin(a), 0))
        lathe(imya, [(0, 0), (s, 0), (s, h * 0.8), (s * 0.75, h), (0, h * 1.05)], material, rodit, seg=6,
              at=osi(p, napr), tile=0.1, phase=math.pi / 6)

def cr(p0, p1, p2, p3, t):
    t2, t3 = t * t, t * t * t
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
def truba(imya, tochki, r, material, rodit, seg=12, shag=10, tile=0.3, torcy=True):
    """Труба по сглаженной ломаной (Катмулл-Ром), рамки — параллельный перенос."""
    P = [Vector(p) for p in tochki]
    P = [P[0] * 2 - P[1]] + P + [P[-1] * 2 - P[-2]]
    C = []
    for i in range(1, len(P) - 2):
        for k in range(shag): C.append(cr(P[i - 1], P[i], P[i + 1], P[i + 2], k / shag))
    C.append(P[-2])
    T = [(C[min(i + 1, len(C) - 1)] - C[max(i - 1, 0)]).normalized() for i in range(len(C))]
    up = Vector((0, 0, 1)) if abs(T[0].z) < 0.9 else Vector((1, 0, 0))
    u = (up - T[0] * up.dot(T[0])).normalized()
    verts, faces, uvs = [], [], []; s = 0.0
    for i, (c, t) in enumerate(zip(C, T)):
        if i: u = (u - t * u.dot(t)).normalized(); s += (C[i] - C[i - 1]).length
        v = t.cross(u)
        for k in range(seg + 1):
            a = TAU * k / seg; verts.append(tuple(c + (u * math.cos(a) + v * math.sin(a)) * r)); uvs.append((k / seg, s / tile))
    for i in range(len(C) - 1):
        for k in range(seg):
            a, b = i * (seg + 1) + k, (i + 1) * (seg + 1) + k
            faces.append((a, a + 1, b + 1, b))
    if torcy:
        for i, sgn in ((0, -1), (len(C) - 1, 1)):
            ci = len(verts); verts.append(tuple(C[i])); uvs.append((0.5, 0.5))
            for k in range(seg):
                a, b = i * (seg + 1) + k, i * (seg + 1) + k + 1
                faces.append((ci, b, a) if sgn > 0 else (ci, a, b))
    return mesh_obj(imya, verts, faces, uvs, material, rodit)

def maslenka(imya, p, material, rodit, up=(0, 0, 1)):
    """Маслёнка: латунный стаканчик с крышкой и шариком (смазка — из маслёнок, файл дня)."""
    at = osi(p, up)
    lathe(imya, [(0, 0), (0.012, 0), (0.012, 0.025), (0.022, 0.03), (0.026, 0.045), (0.026, 0.075), (0.022, 0.082),
                 (0.024, 0.088), (0.012, 0.094), (0.006, 0.104), (0, 0.106)], material, rodit, seg=20, at=at, tile=0.1)

UZLY = {}
KOREN = bpy.data.objects.new('motor-kostovicha', None); sc.collection.objects.link(KOREN)
def uzel(imya, klik=True):
    e = bpy.data.objects.new(imya, None); sc.collection.objects.link(e); e.parent = KOREN
    if klik: e['uzel'] = imya
    UZLY[imya] = e
    return e

# ── размеры (на глаз по фото ЦМВВС, допущение) ──────────────────────────────────────────────────────────
Z0 = 0.30                       # верх постамента
ZB = 0.56                       # верх продольных балок станины
YR = [-0.465, -0.155, 0.155, 0.465]          # четыре ряда цилиндров (по глубине)
ZR = [0.80 + 0.045 * i for i in range(4)]    # оси цилиндров: задние чуть выше — «лесенкой», как на фото
XI, XO = 0.20, 1.08             # внутренний и наружный торцы цилиндров (|x|)
XK = 1.30                       # ползуны штоков
XP, ZP = 1.60, 1.02             # ось качания коромысел
ZV = 1.80                       # ось коленчатого вала
YA = 0.68                       # центральные стойки (y = ±YA)
YM = 1.02                       # маховик
RM = 1.22                       # радиус маховика
RAZREZ = (1, 0)                 # разрез: правая четвёрка (x>0), передний ряд

# ── постамент (не кликается) ─────────────────────────────────────────────────────────────────────────────
pos = uzel('postament', klik=False)
PX, PY, PC = 4.3, 2.75, 0.17     # размеры, центр по y
box('post-cokol', (PX - 0.10, PY - 0.10, 0.08), (0, PC, 0.04), M['derevo'], pos, fask=0.012, tile=1.4)
box('post-korpus', (PX - 0.04, PY - 0.04, 0.17), (0, PC, 0.165), M['derevo'], pos, fask=0.01, tile=1.4)
box('post-karniz', (PX + 0.06, PY + 0.06, 0.05), (0, PC, Z0 - 0.025), M['derevo'], pos, fask=0.022, seg=3, tile=1.4)
box('post-sukno', (PX - 0.16, PY - 0.16, 0.02), (0, PC, Z0 + 0.0), M['sukno'], pos, fask=0.008, tile=0.8)
for sx in (-1, 1):                                  # филёнки на торцах и спереди — рамки из реек
    box('post-reika', (0.03, PY - 0.5, 0.025), (sx * (PX / 2 - 0.005), PC, 0.11), M['derevo'], pos, fask=0.01)
    box('post-reika', (0.03, PY - 0.5, 0.025), (sx * (PX / 2 - 0.005), PC, 0.22), M['derevo'], pos, fask=0.01)
for sy in (-1, 1):
    box('post-reika', (PX - 0.5, 0.03, 0.025), (0, PC + sy * (PY / 2 - 0.005), 0.11), M['derevo'], pos, fask=0.01)
    box('post-reika', (PX - 0.5, 0.03, 0.025), (0, PC + sy * (PY / 2 - 0.005), 0.22), M['derevo'], pos, fask=0.01)
box('post-tablichka', (0.5, 0.012, 0.09), (0, PC - PY / 2 - 0.012, 0.165), M['latun'], pos, fask=0.004)  # латунная табличка без надписи
for x in (-0.22, 0.22):
    lathe('post-vint', [(0, 0), (0.008, 0), (0.008, 0.004), (0, 0.006)], M['latun'], pos, seg=10, at=osi((x, PC - PY / 2 - 0.018, 0.165), (0, -1, 0)))

# ── станина: чугун ───────────────────────────────────────────────────────────────────────────────────────
stn = uzel('stanina')
XL = 1.86
for sy in (-1, 1):                                  # две продольные балки двутавром
    y = sy * 0.52
    box('stn-balka', (2 * XL, 0.07, 0.12), (0, y, ZB - 0.075), M['chugun'], stn, fask=0.008)
    box('stn-polka', (2 * XL + 0.02, 0.17, 0.03), (0, y, ZB - 0.015), M['chugun'], stn, fask=0.01)
    box('stn-polka', (2 * XL + 0.02, 0.17, 0.03), (0, y, ZB - 0.135), M['chugun'], stn, fask=0.01)
    for x in np.linspace(-XL + 0.12, XL - 0.12, 10):
        lathe('stn-bolt', [(0, 0), (0.016, 0), (0.016, 0.012), (0.012, 0.016), (0, 0.017)], M['temn'], stn, seg=6,
              at=osi((x, y + 0.055, ZB), (0, 0, 1)), phase=math.pi / 6)
    for sx in (-1, 1):                              # литые лапы-опоры на каменных подкладках
        x = sx * (XL - 0.22)
        kontur = [(-0.17, 0), (0.17, 0), (0.11, 0.15), (0.07, 0.17), (-0.07, 0.17), (-0.11, 0.15)]
        plita('stn-lapa', kontur, 0.1, osi((x, y, Z0 + 0.02), (0, -1, 0), up=(1, 0, 0)), M['chugun'], stn, fask=0.012)
        box('stn-podkladka', (0.40, 0.22, 0.04), (x, y, Z0 + 0.01), M['kamen'], stn, fask=0.008)
for x in (-1.62, -0.95, -0.45, 0.0, 0.45, 0.95, 1.62):    # поперечины (на них ложементы цилиндров)
    if abs(x) > 1.5:
        box('stn-plita-torec', (0.66, 1.62, 0.06), (x, 0, ZB - 0.03), M['chugun'], stn, fask=0.014); continue
    w = 1.62 if abs(x) < 0.5 else 1.04
    box('stn-poperechina', (0.09, w, 0.08), (x, 0, ZB - 0.06), M['chugun'], stn, fask=0.012)
for sx in (-1, 1):                                  # ложементы под цилиндрами
    for x in (0.45, 0.95):
        for y, z in zip(YR, ZR):
            box('stn-lozhement', (0.08, 0.20, z - 0.13 - ZB), (sx * x, y, (ZB + z - 0.13) / 2), M['chugun'], stn, fask=0.012)
# центральные А-стойки под коленчатым валом
for sy in (-1, 1):
    y = sy * YA
    for sx in (-1, 1):
        brus('stn-noga', (sx * 0.44, y, ZB - 0.02), (sx * 0.075, y, ZV - 0.07), 0.075, 0.09, M['chugun'], stn, up=(0, 1, 0), fask=0.014)
        box('stn-noga-lapa', (0.2, 0.15, 0.04), (sx * 0.44, y, ZB + 0.0), M['chugun'], stn, fask=0.012)
    for z, hw in ((0.92, 0.37), (1.52, 0.17)):
        box('stn-styazhka', (2 * hw, 0.05, 0.06), (0, y, z), M['chugun'], stn, fask=0.012)
    lathe('stn-podshipnik', [(0.04, -0.06), (0.085, -0.06), (0.095, -0.05), (0.095, 0.05), (0.085, 0.06), (0.04, 0.06)],
          M['chugun'], stn, seg=40, at=osi((0, y, ZV), (0, 1, 0)))
    box('stn-podshipnik-kryshka', (0.30, 0.10, 0.05), (0, y, ZV + 0.095), M['chugun'], stn, fask=0.014)
    for sx in (-1, 1):
        lathe('stn-bolt', [(0, 0), (0.016, 0), (0.016, 0.014), (0.012, 0.02), (0, 0.021)], M['temn'], stn, seg=6,
              at=osi((sx * 0.11, y, ZV + 0.12), (0, 0, 1)), phase=math.pi / 6)
# низкие А-стойки у торцов: несут ось качания коромысел
for sx in (-1, 1):
    for sy in (-1, 1):
        y = sy * 0.70
        kontur = [(-0.30, 0), (0.30, 0), (0.30, 0.04), (0.06, ZP - ZB - 0.02), (0.06, ZP - ZB + 0.07), (-0.06, ZP - ZB + 0.07),
                  (-0.06, ZP - ZB - 0.02), (-0.30, 0.04)]
        plita('stn-stoyka-torec', kontur, 0.07, osi((sx * XP, y, ZB), (0, -1, 0), up=(1, 0, 0)), M['chugun'], stn, fask=0.014)
        kontur2 = [(-0.17, 0.05), (0.17, 0.05), (0.04, ZP - ZB - 0.1), (-0.04, ZP - ZB - 0.1)]   # ребро жёсткости
        plita('stn-rebro', kontur2, 0.12, osi((sx * XP, y, ZB), (0, -1, 0), up=(1, 0, 0)), M['chugun'], stn, fask=0.012)
        lathe('stn-podshipnik', [(0.03, -0.05), (0.07, -0.05), (0.078, -0.04), (0.078, 0.04), (0.07, 0.05), (0.03, 0.05)],
              M['chugun'], stn, seg=32, at=osi((sx * XP, y, ZP), (0, 1, 0)))
        # трубчатые раскосы от торцевых стоек к верху центральных (как на фото музея)
        sterzhen('stn-raskos', (sx * XP, y, ZP + 0.07), (sx * 0.12, sy * YA, ZV - 0.12), 0.022, M['stal'], stn, seg=12)
        lathe('stn-raskos-gaika', [(0.022, -0.03), (0.034, -0.03), (0.034, 0.03), (0.022, 0.03)], M['temn'], stn, seg=6,
              at=osi(Vector((sx * XP, y, ZP + 0.07)).lerp(Vector((sx * 0.12, sy * YA, ZV - 0.12)), 0.12),
                     Vector((sx * 0.12, sy * YA, ZV - 0.12)) - Vector((sx * XP, y, ZP + 0.07))))

# ── цилиндры: бронза, водяная рубашка ─────────────────────────────────────────────────────────────────────
cil = uzel('cilindry')
L = XO - XI
RB, RG, RJ = 0.098, 0.112, 0.142      # канал, гильза, рубашка (наружный)
def petlya_gilza():
    return [(RB, 0.0), (0.168, 0.0), (0.175, 0.007), (0.175, 0.04), (0.168, 0.047), (RG, 0.047), (RG, L - 0.04),
            (0.158, L - 0.04), (0.165, L - 0.033), (0.165, L - 0.006), (0.158, L), (RB, L)]
def petlya_rubashka():
    pts = [(RG + 0.012, 0.047), (RJ, 0.047)]
    for s in (0.26, 0.5, 0.74):                     # литые пояса-бандажи
        z = s * L; pts += [(RJ, z - 0.024), (RJ + 0.008, z - 0.016), (RJ + 0.008, z + 0.016), (RJ, z + 0.024)]
    pts += [(RJ, L - 0.04), (RG + 0.012, L - 0.04)]
    return pts
for sx in (-1, 1):
    for i, (y, z) in enumerate(zip(YR, ZR)):
        at = osi((sx * XI, y, z), (sx, 0, 0), up=(0, 0, 1))
        cut = (sx, i) == RAZREZ
        a0, a1 = (math.pi / 2, TAU) if cut else (0.0, TAU)
        sg = 48 if not cut else 40
        pg, pr = petlya_gilza(), petlya_rubashka()
        lathe('cil-gilza', pg + [pg[0]], M['bronza'], cil, seg=sg, at=at, a0=a0, a1=a1)
        lathe('cil-rubashka', pr + [pr[0]], M['bronza'], cil, seg=sg, at=at, a0=a0, a1=a1)
        # крышка наружного торца с сальником штока
        kr = [(0.03, L), (0.15, L), (0.155, L + 0.005), (0.155, L + 0.03), (0.12, L + 0.04), (0.06, L + 0.05),
              (0.045, L + 0.06), (0.045, L + 0.11), (0.04, L + 0.115), (0.03, L + 0.115)]
        lathe('cil-kryshka', kr + [(0.03, L)], M['bronza'], cil, seg=sg, at=at, a0=a0, a1=a1)
        lathe('cil-salnik', [(0.03, L + 0.115), (0.052, L + 0.115), (0.052, L + 0.15), (0.045, L + 0.158), (0.03, L + 0.158)],
              M['latun'], cil, seg=24, at=at, a0=a0, a1=a1)
        if cut:
            srez_kryshki('cil-srez', pg, at, (a0, a1), cil)
            srez_kryshki('cil-srez', pr, at, (a0, a1), cil)
            srez_kryshki('cil-srez', kr, at, (a0, a1), cil)
            # полость водяной рубашки — тёмная, чтобы читался зазор
            lathe('cil-voda', [(RG + 0.001, 0.05), (RG + 0.001, L - 0.043)], M['voda'], cil, seg=sg, at=at, a0=a0, a1=a1)
        n_b = 8
        for k in range(n_b):
            a = TAU * (k + 0.5) / n_b
            if cut and (a % TAU) < math.pi / 2 + 0.05: continue
            for zz, rr, napr in ((0.047, 0.152, 1), (L - 0.04, 0.150, -1)):
                p = at @ Vector((rr * math.cos(a), rr * math.sin(a), zz))
                lathe('cil-bolt', [(0, 0), (0.014, 0), (0.014, 0.012), (0.01, 0.016), (0, 0.017)], M['temn'], cil, seg=6,
                      at=osi(p, (sx * napr, 0, 0)), phase=math.pi / 6)
        # кран-штуцер водяной рубашки сверху
        p = at @ Vector((RJ, 0, 0.62 * L))
        lathe('cil-shtucer', [(0, 0), (0.022, 0), (0.022, 0.03), (0.016, 0.035), (0.016, 0.06), (0.02, 0.064), (0.02, 0.075), (0, 0.078)],
              M['latun'], cil, seg=16, at=osi(p, (0, 0, 1)))
    # водяные трубки рубашек: общая медная гребёнка вдоль четвёрки
    xs = sx * (XI + 0.62 * L)
    pts = [(xs, YR[0] - 0.05, ZR[0] + RJ + 0.078)] + [(xs, y, z + RJ + 0.1) for y, z in zip(YR, ZR)] + [(xs, YR[3] + 0.12, ZR[3] + RJ + 0.12)]
    truba('cil-vodyanaya-truba', pts, 0.018, M['med'], cil, seg=12, shag=6)

# ── поршень в разрезе, штоки, ползуны, тяжки к коромыслам ─────────────────────────────────────────────────
por = uzel('porshen-v-razreze')
for sx in (-1, 1):
    for i, (y, z) in enumerate(zip(YR, ZR)):
        at = osi((sx * XI, y, z), (sx, 0, 0), up=(0, 0, 1))
        cut = (sx, i) == RAZREZ
        if cut:   # бронзовый поршень с канавками колец и пальцем
            p0 = 0.40 * L; pl = 0.20
            prof = [(0, p0), (RB - 0.006, p0), (RB - 0.002, p0 + 0.004)]
            for k in range(3):
                zk = p0 + 0.03 + k * 0.03
                prof += [(RB - 0.002, zk), (RB - 0.012, zk + 0.002), (RB - 0.012, zk + 0.01), (RB - 0.002, zk + 0.012)]
            prof += [(RB - 0.002, p0 + pl - 0.004), (RB - 0.006, p0 + pl), (0.045, p0 + pl), (0.045, p0 + pl + 0.02), (0, p0 + pl + 0.02)]
            lathe('por-porshen', prof, M['bronza'], por, seg=40, at=at)
            for k in range(3):   # стальные кольца
                zk = p0 + 0.03 + k * 0.03
                lathe('por-kolco', [(RB - 0.011, zk + 0.002), (RB - 0.0005, zk + 0.002), (RB - 0.0005, zk + 0.01), (RB - 0.011, zk + 0.01)] + [(RB - 0.011, zk + 0.002)],
                      M['temn'], por, seg=40, at=at)
            x0 = sx * (XI + p0 + pl)
        else:
            x0 = sx * (XO + 0.15)
        sterzhen('por-shtok', (x0, y, z), (sx * XK, y, z), 0.022, M['blesk'], por, seg=16)
        # ползун (крейцкопф) с пальцем
        box('por-polzun', (0.12, 0.10, 0.11), (sx * XK, y, z), M['stal'], por, fask=0.016, seg=3)
        sterzhen('por-palec', (sx * XK, y - 0.07, z), (sx * XK, y + 0.07, z), 0.018, M['blesk'], por, seg=16)
        # тяжка ползун → низ коромысла (стальная, с проушинами)
        xa, xb, zb_ = sx * XK, sx * (XP + 0.02), ZP - 0.16
        for dy in (-0.07, 0.07):
            d = Vector((xb - xa, 0, zb_ - z)); Ld = d.length; ang = math.atan2(d.z, d.x)
            plita('por-tyazhka', stadion(0.035, 0.03, Ld), 0.018,
                  Matrix.Translation((xa, y + dy, z)) @ Matrix.Rotation(-ang, 4, 'Y') @ osi((0, 0, 0), (0, -1, 0), up=(1, 0, 0)),
                  M['stal'], por, fask=0.005)

# ── коромысла (литые, тёмные) и длинные тяги к коленчатому валу ─────────────────────────────────────────────
kor = uzel('koromysla-i-tyagi')
def list_kontur(h0, h1, n=10):
    """Лист коромысла: от низа (h0) до верха (h1), шире в середине."""
    lev, prav = [], []
    for k in range(n + 1):
        t = k / n; h = h0 + (h1 - h0) * t
        w = 0.05 + 0.075 * math.sin(math.pi * min(1, t * 1.15)) ** 0.8
        lev.append((-w, h)); prav.append((w, h))
    niz = [(0.05 * math.cos(math.pi + math.pi * k / 6), h0 - 0.05 * math.sin(math.pi * k / 6)) for k in range(1, 6)]
    verh = [(0.05 * math.cos(math.pi * k / 6), h1 + 0.05 * math.sin(math.pi * k / 6)) for k in range(1, 6)]
    return prav + verh + lev[::-1] + niz
for sx in (-1, 1):
    sterzhen('kor-os', (sx * XP, -0.76, ZP), (sx * XP, 0.76, ZP), 0.03, M['blesk'], kor, seg=20)
    for i, (y, z) in enumerate(zip(YR, ZR)):
        h0, h1 = -0.16, ZV - ZP
        at = Matrix.Translation((sx * XP, y, ZP)) @ Matrix.Rotation(-sx * math.radians(4), 4, 'Y') @ osi((0, 0, 0), (0, -1, 0), up=(1, 0, 0))
        plita('kor-list', list_kontur(h0, h1), 0.05, at, M['chugun'], kor, fask=0.014)
        for hh, rr in ((0.0, 0.06), (h1, 0.05), (h0, 0.045)):     # литые бобышки под оси
            p = at @ Vector((0, hh, 0))
            lathe('kor-bobyshka', [(0.02, -0.045), (rr - 0.008, -0.045), (rr, -0.037), (rr, 0.037), (rr - 0.008, 0.045), (0.02, 0.045)],
                  M['chugun'], kor, seg=24, at=osi(p, (0, 1, 0)))
        for hh in (0.25, 0.45):                               # заклёпки рёбер
            for ww in (-0.06, 0.06):
                p = at @ Vector((ww, hh, -0.026))
                lathe('kor-zaklepka', [(0, 0), (0.011, 0), (0.008, 0.006), (0, 0.008)], M['temn'], kor, seg=8, at=osi(p, (0, -1, 0)))
        top = at @ Vector((0, h1, 0))
        # длинная стальная тяга (шатун) к шейке коленчатого вала
        ugol = 0 if i in (0, 3) else math.pi
        pin = Vector((0.085 * math.sin(ugol), y + sx * 0.03, ZV + 0.085 * math.cos(ugol)))
        a, b = Vector((top.x, y + sx * 0.03, top.z)), pin
        d = b - a; Ld = d.length
        prof = [(0, 0.05), (0.024, 0.05), (0.03, 0.07), (0.026, Ld * 0.5), (0.022, Ld - 0.08), (0.03, Ld - 0.06), (0.03, Ld - 0.05), (0, Ld - 0.05)]
        lathe('kor-tyaga', prof, M['stal'], kor, seg=16, at=osi(a, d), tile=0.4)
        for p, r in ((a, 0.05), (b, 0.055)):                # проушины-головки
            lathe('kor-golovka', [(0.03, -0.022), (r - 0.008, -0.022), (r, -0.014), (r, 0.014), (r - 0.008, 0.022), (0.03, 0.022)],
                  M['stal'], kor, seg=28, at=osi(p, (0, 1, 0)))
            sterzhen('kor-palec', p - Vector((0, 0.03, 0)), p + Vector((0, 0.03, 0)), 0.026, M['blesk'], kor, seg=14)
        maslenka('kor-maslenka', b + Vector((0, 0, 0.05)), M['latun'], kor)

# ── коленчатый вал (сталь) ──────────────────────────────────────────────────────────────────────────────
kv = uzel('kolenval')
sterzhen('kv-val', (0, -1.03, ZV), (0, YM + 0.12, ZV), 0.036, M['stal'], kv, seg=24)
for i, y in enumerate(YR):
    ugol = 0 if i in (0, 3) else math.pi
    for dy in (-0.085, 0.085):
        kont = stadion(0.075, 0.05, 0.085)
        # стадион вдоль локальной X → поворот так, чтобы щека смотрела к шейке
        at = Matrix.Translation((0, y + dy, ZV)) @ Matrix.Rotation(-(math.pi / 2 - ugol), 4, 'Y') @ Matrix(((1, 0, 0, 0), (0, 0, 1, 0), (0, -1, 0, 0), (0, 0, 0, 1)))
        plita('kv-scheka', kont, 0.03, at, M['stal'], kv, fask=0.008)
    pin = (0.085 * math.sin(ugol), y, ZV + 0.085 * math.cos(ugol))
    sterzhen('kv-sheyka', (pin[0], y - 0.085, pin[2]), (pin[0], y + 0.085, pin[2]), 0.03, M['blesk'], kv, seg=20)
for y in (-YA, YA):
    maslenka('kv-maslenka', (0, y, ZV + 0.12), M['latun'], kv)
for y in (-0.82, YM - 0.16):     # установочные кольца
    lathe('kv-kolco', [(0.036, -0.018), (0.05, -0.018), (0.055, -0.012), (0.055, 0.012), (0.05, 0.018), (0.036, 0.018)],
          M['stal'], kv, seg=24, at=osi((0, y, ZV), (0, 1, 0)))

# ── маховик ────────────────────────────────────────────────────────────────────────────────────────────
mh = uzel('mahovik')
atm = osi((0, YM, ZV), (0, 1, 0), up=(0, 0, 1))
obod = [(RM - 0.05, -0.022), (RM - 0.035, -0.035), (RM - 0.004, -0.04), (RM + 0.006, -0.032), (RM + 0.012, -0.012),
        (RM + 0.012, 0.012), (RM + 0.006, 0.032), (RM - 0.004, 0.04), (RM - 0.035, 0.035), (RM - 0.05, 0.022), (RM - 0.055, 0.0)]
lathe('mh-obod', obod + [obod[0]], M['bronza-temn'], mh, seg=160, at=atm, tile=0.6)
lathe('mh-stupica', [(0.036, -0.12), (0.07, -0.12), (0.08, -0.11), (0.08, -0.07), (0.13, -0.065), (0.135, -0.05), (0.09, -0.04),
                     (0.075, 0), (0.09, 0.04), (0.135, 0.05), (0.13, 0.065), (0.08, 0.07), (0.08, 0.11), (0.07, 0.12), (0.036, 0.12)],
      M['stal'], mh, seg=40, at=atm)
NS = 36
for k in range(NS):     # тангенциальные спицы попеременно с двух фланцев ступицы
    a = TAU * k / NS; side = 1 if k % 2 else -1
    tang = 0.12 * side
    ph = at = None
    p_hub = atm @ Vector((0.12 * math.cos(a + tang * 3), 0.12 * math.sin(a + tang * 3), side * 0.058))
    p_rim = atm @ Vector(((RM - 0.045) * math.cos(a), (RM - 0.045) * math.sin(a), side * 0.008))
    sterzhen('mh-spica', p_hub, p_rim, 0.0065, M['temn'], mh, seg=6)
    lathe('mh-nippel', [(0.0065, 0), (0.011, 0), (0.011, 0.03), (0.0065, 0.035)], M['latun'], mh, seg=6,
          at=osi(p_rim - (p_rim - p_hub).normalized() * 0.035, p_rim - p_hub))

# ── запально-клапанные коробки и электрическое зажигание ───────────────────────────────────────────────────
zz = uzel('zazhiganie')
for i, (y, z) in enumerate(zip(YR, ZR)):
    box('zz-korobka', (2 * XI + 0.02, 0.24, 0.30), (0, y, z), M['bronza'], zz, fask=0.03, seg=3)
    box('zz-kryshka', (0.30, 0.26, 0.035), (0, y, z + 0.165), M['bronza'], zz, fask=0.012)
    for sx in (-1, 1):
        for sy in (-1, 1):
            lathe('zz-bolt', [(0, 0), (0.012, 0), (0.012, 0.01), (0.009, 0.014), (0, 0.015)], M['temn'], zz, seg=6,
                  at=osi((sx * 0.12, y + sy * 0.1, z + 0.183), (0, 0, 1)), phase=math.pi / 6)
    # впускной клапан: латунный колпак с пружиной
    lathe('zz-klapan', [(0, 0), (0.05, 0), (0.05, 0.02), (0.035, 0.03), (0.035, 0.06), (0.042, 0.065), (0.042, 0.08), (0.02, 0.09), (0, 0.092)],
          M['latun'], zz, seg=24, at=osi((0.09, y, z + 0.182), (0, 0, 1)))
    # запал: латунь + фарфоровый изолятор, на передней стенке коробки
    pz = Vector((0.0, y, z + 0.182))
    lathe('zz-zapal', [(0, 0), (0.03, 0), (0.03, 0.015), (0.022, 0.02), (0.022, 0.03)], M['latun'], zz, seg=16, at=osi(pz, (0, 0, 1)))
    lathe('zz-izolyator', [(0.02, 0.03), (0.024, 0.035), (0.018, 0.045), (0.022, 0.05), (0.016, 0.06), (0.019, 0.065), (0.012, 0.075), (0, 0.078)],
          M['farfor'], zz, seg=16, at=osi(pz, (0, 0, 1)))
    # провод от запала к прерывателю на конце коленчатого вала
    k0 = pz + Vector((0, 0, 0.077))
    pts = [k0, k0 + Vector((0.01, 0, 0.06)), Vector((0.04 + 0.025 * i, y - 0.1, z + 0.36 + 0.03 * i)),
           Vector((0.04 + 0.025 * i, -0.78, 1.32 + 0.03 * i)), Vector((0.10, -0.98, ZV - 0.12 + 0.02 * i)),
           Vector((0.05, -0.99, ZV - 0.04))]
    truba('zz-provod', pts, 0.008, M['provod'], zz, seg=8, shag=8)
# прерыватель-распределитель на переднем конце вала: эбонитовый диск, латунные щётки
atp = osi((0, -0.98, ZV), (0, 1, 0))
lathe('zz-preryvatel', [(0.036, -0.03), (0.11, -0.03), (0.12, -0.02), (0.12, 0.02), (0.11, 0.03), (0.036, 0.03)], M['ebonit'], zz, seg=40, at=atp)
lathe('zz-preryvatel-kolco', [(0.08, -0.034), (0.10, -0.034), (0.10, 0.034), (0.08, 0.034)], M['latun'], zz, seg=40, at=atp)
for k in range(4):
    a = TAU * k / 4 + math.pi / 4
    p = atp @ Vector((0.16 * math.cos(a), 0.16 * math.sin(a), 0))
    sterzhen('zz-shchetka', p, atp @ Vector((0.105 * math.cos(a), 0.105 * math.sin(a), 0)), 0.01, M['latun'], zz, seg=8)
box('zz-kronshtein', (0.36, 0.04, 0.05), (0, -0.98, ZV), M['chugun'], zz, fask=0.01)
for sx in (-1, 1):
    brus('zz-kronshtein-noga', (sx * 0.18, -0.98, ZV), (sx * 0.12, -YA + 0.02, ZV - 0.25), 0.04, 0.04, M['chugun'], zz, up=(0, 0, 1), fask=0.008)
# батарея (элементы низкого напряжения) в деревянном ящике на постаменте — реконструкция
bx, by = 1.05, -1.0
box('zz-batareya', (0.42, 0.24, 0.20), (bx, by, Z0 + 0.11), M['derevo'], zz, fask=0.015, seg=3, tile=0.5)
box('zz-batareya-kryshka', (0.44, 0.26, 0.025), (bx, by, Z0 + 0.22), M['ebonit'], zz, fask=0.008)
for dx in (-0.12, 0.12):
    lathe('zz-klemma', [(0, 0), (0.022, 0), (0.022, 0.012), (0.012, 0.016), (0.012, 0.05), (0.018, 0.055), (0.018, 0.065), (0, 0.067)],
          M['latun'], zz, seg=12, at=osi((bx + dx, by, Z0 + 0.232), (0, 0, 1)))
truba('zz-provod', [(bx - 0.12, by, Z0 + 0.29), (bx - 0.3, by + 0.05, Z0 + 0.45), (0.5, -0.95, 1.4), (0.2, -1.0, ZV - 0.16), (0.0, -1.0, ZV - 0.12)],
      0.009, M['provod'], zz, seg=8, shag=8)

# ── карбюратор и четыре патрубка ────────────────────────────────────────────────────────────────────────
kb = uzel('karbyurator')
CX, CY, CZ = -0.12, -0.98, 1.06
atc = osi((CX, CY, CZ), (0, 0, 1))
lathe('kb-korpus', [(0, -0.02), (0.05, -0.02), (0.06, 0.0), (0.105, 0.01), (0.115, 0.03), (0.115, 0.06), (0.11, 0.07), None,
                    (0.11, 0.07), (0.11, 0.24), (0.118, 0.25), (0.118, 0.27), (0.11, 0.28), (0.07, 0.30), (0.05, 0.33), (0.05, 0.36),
                    (0.06, 0.37), (0.06, 0.39), (0, 0.395)], M['latun'], kb, seg=40, at=atc)
for zk in (0.11, 0.2):
    lathe('kb-poyas', [(0.11, zk - 0.012), (0.117, zk - 0.006), (0.117, zk + 0.006), (0.11, zk + 0.012)], M['med'], kb, seg=40, at=atc)
lathe('kb-homut', [(0.118, 0.13), (0.13, 0.135), (0.13, 0.165), (0.118, 0.17)], M['chugun'], kb, seg=40, at=atc)
brus('kb-kronshtein-k-stoike', (CX - 0.05, CY + 0.12, CZ + 0.15), (-0.27, -YA + 0.03, 1.16), 0.04, 0.04, M['chugun'], kb, fask=0.008)
# бензопровод сверху (медная трубка из бака дирижабля — бак не показан)
truba('kb-benzoprovod', [(CX, CY, CZ + 0.39), (CX, CY, CZ + 0.5), (CX - 0.2, CY - 0.05, CZ + 0.62), (CX - 0.55, CY + 0.05, CZ + 0.66)],
      0.011, M['med'], kb, seg=10, shag=8)
lathe('kb-kranik', [(0, -0.03), (0.022, -0.03), (0.026, 0), (0.022, 0.03), (0, 0.03)], M['latun'], kb, seg=16,
      at=osi((CX - 0.2, CY - 0.05, CZ + 0.62), (1, 0, 0)))
# четыре патрубка к впускным клапанам коробок
for i, (y, z) in enumerate(zip(YR, ZR)):
    dx = -0.045 + 0.03 * i; xi = -0.15 + 0.025 * i
    a = Vector((CX + dx, CY + 0.02 * i - 0.03, CZ - 0.02))
    pts = [a, a + Vector((0, 0, -0.06)), Vector((xi, CY + 0.2, CZ - 0.06)),
           Vector((xi, y - 0.16, z + 0.33)), Vector((xi, y, z + 0.33)), Vector((xi, y, z + 0.19))]
    truba('kb-patrubok', pts, 0.016, M['med'], kb, seg=12, shag=8)
    lathe('kb-flanec', [(0.016, 0), (0.03, 0), (0.034, 0.005), (0.034, 0.012), (0.03, 0.016), (0.016, 0.016)], M['latun'], kb, seg=16,
          at=osi((xi, y, z + 0.183), (0, 0, 1)))

# ── пол зала и мягкие тени (запечены numpy-градиентом в альфу; света в glb нет) ─────────────────────────────
def ten_png(imya, n, alfa):
    im = bpy.data.images.new(imya, n, n, alpha=True)
    px = np.zeros((n, n, 4), np.float32); px[..., 3] = np.clip(alfa, 0, 1)
    im.pixels.foreach_set(px.ravel())
    put = os.path.join(TEX, imya + '.png'); im.filepath_raw = put; im.file_format = 'PNG'; im.save()
    bpy.data.images.remove(im); return bpy.data.images.load(put)
def mat_ten(imya, img):
    m, b, t = pbsdf(imya); N, L = t.nodes, t.links
    tx = N.new('ShaderNodeTexImage'); tx.image = img
    b.inputs['Base Color'].default_value = (0, 0, 0, 1); b.inputs['Roughness'].default_value = 1.0
    L.new(tx.outputs['Alpha'], b.inputs['Alpha'])
    m.blend_method = 'BLEND'
    if hasattr(m, 'shadow_method'): m.shadow_method = 'NONE'
    return m
def blur(a, k):
    for _ in range(k):
        a = (a + np.roll(a, 1, 0) + np.roll(a, -1, 0) + np.roll(a, 1, 1) + np.roll(a, -1, 1)) / 5
    return a
def ploskost(imya, x0, x1, y0, y1, z, material, rodit):
    mesh_obj(imya, [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)], [(0, 1, 2, 3)],
             [(0, 0), (1, 0), (1, 1), (0, 1)], material, rodit, smooth=False)
# студийный пол: тёплый серый круг, к краю растворяется в фоне (альфа), под постаментом мягкая тень — всё в одной текстуре
FX, FY = 2.40, 2.00
n = 512; u = (np.arange(n) + 0.5) / n
X = (u[None, :] - 0.5) * 2 * FX; Y = (u[:, None] - 0.5) * 2 * FY
d = np.sqrt(np.maximum(np.abs(X) - (PX / 2 - 0.08), 0) ** 2 + np.maximum(np.abs(Y) - (PY / 2 - 0.08), 0) ** 2)
ten = 0.85 * np.exp(-d / 0.30)
rr = np.sqrt((X / FX) ** 2 + (Y / FY) ** 2)
alfa = np.maximum(ss(1.0, 0.35, rr) * 0.95, ten)
svet = (0.30 + 0.06 * (1 - rr)) * (1 - ten)
rgb = np.dstack([svet * 1.0, svet * 0.95, svet * 0.88])
im = bpy.data.images.new('pol-studiya', n, n, alpha=True)
px = np.dstack([np.clip(rgb, 0, 1), np.clip(alfa, 0, 1)]).astype(np.float32)
im.pixels.foreach_set(px.ravel())
put = os.path.join(TEX, 'pol-studiya.png'); im.filepath_raw = put; im.file_format = 'PNG'; im.save()
bpy.data.images.remove(im); im = bpy.data.images.load(put)
m_pol, _b, _t = pbsdf('pol-studiya'); _tx = _t.nodes.new('ShaderNodeTexImage'); _tx.image = im
_t.links.new(_tx.outputs['Color'], _b.inputs['Base Color']); _t.links.new(_tx.outputs['Alpha'], _b.inputs['Alpha'])
_b.inputs['Roughness'].default_value = 0.85; m_pol.blend_method = 'BLEND'
ploskost('pol-studiya', -FX, FX, PC - FY, PC + FY, 0.0, m_pol, pos)
# тень машины на сукне: под балками станины, стойками и маховиком
SX, SY = PX / 2 - 0.1, PY / 2 - 0.1
X = (u[None, :] - 0.5) * 2 * SX; Y = PC + (u[:, None] - 0.5) * 2 * SY
a = np.zeros((n, n))
a += (np.abs(X) < 1.85) * (np.abs(Y) < 0.62) * 0.45
a += (np.abs(X) < 0.35) * (np.abs(Y - YM) < 0.10) * 0.55
for yy in (-YA, YA):
    a += (np.abs(X) < 0.55) * (np.abs(Y - yy) < 0.12) * 0.35
for xx in (-XP, XP):
    a += (np.abs(X - xx) < 0.25) * (np.abs(Y) < 0.75) * 0.3
a = blur(np.clip(a, 0, 0.7), 14)
ploskost('ten-sukno', -SX, SX, PC - SY, PC + SY, Z0 + 0.0115, mat_ten('ten-sukno', ten_png('ten-sukno', n, a)), pos)
# искра в прерывателе: зажигание под током (слабая эмиссия, без ламп)
m_isk = mat('iskra', (0.55, 0.75, 1.0), 0.0, 0.3)
_b = m_isk.node_tree.nodes['Principled BSDF']; _b.inputs['Emission Color'].default_value = (0.55, 0.75, 1.0, 1); _b.inputs['Emission Strength'].default_value = 3.0
for k in range(4):
    aa = TAU * k / 4 + math.pi / 4
    p = atp @ Vector((0.122 * math.cos(aa), 0.122 * math.sin(aa), 0))
    lathe('zz-iskra', [(0, -0.012), (0.006, -0.006), (0.009, 0), (0.006, 0.006), (0, 0.012)], m_isk, zz, seg=8, at=osi(p, (math.cos(aa), 0, math.sin(aa))))
    if k == 0:
        for j in range(5):
            q = Vector((math.cos(j * 1.3), 0.4 * math.sin(j * 2.1), math.sin(j * 1.3))).normalized()
            sterzhen('zz-iskra-luch', p, p + q * (0.03 + 0.01 * (j % 2)), 0.0025, m_isk, zz, seg=5)

# ── слияние мешей по (родитель, материал), автосглаживание ───────────────────────────────────────────────
gr = defaultdict(list)
for ob in list(sc.objects):
    if ob.type == 'MESH': gr[(ob.parent.name, ob.active_material.name)].append(ob)
for (r_imya, m_imya), obs in gr.items():
    bpy.ops.object.select_all(action='DESELECT')
    for ob in obs: ob.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    if len(obs) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = ob.data.name = f'{r_imya}~{m_imya}'
    ob.data.set_sharp_from_angle(angle=math.radians(40))
    bpy.ops.object.mode_set(mode='OBJECT')
    me = ob.data
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(me); bm.free()
    me.set_sharp_from_angle(angle=math.radians(40))
KOREN.location = (0, -PC, -1.45)     # центр около начала координат

def main():
    if MODE == 'glb':
        out = A[1]
        bpy.ops.object.select_all(action='DESELECT')
        bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_apply=True, export_extras=True,
                                  export_image_format='WEBP', export_image_quality=80, export_materials='EXPORT',
                                  export_tangents=False, export_lights=False, export_cameras=False)
        tri = 0
        for p in sc.objects:
            if p.type == 'MESH': p.data.calc_loop_triangles(); tri += len(p.data.loop_triangles)
        print('GLB', out, os.path.getsize(out), 'байт, треугольников', tri)
        return
    if MODE == 'snimok':
        out = A[1]; w, h, smp = (int(A[2]), int(A[3]), int(A[4])) if len(A) >= 5 else (1000, 700, 24)
        sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = smp; sc.cycles.use_denoising = True
        sc.render.resolution_x, sc.render.resolution_y = w, h
        sc.view_settings.view_transform = 'AgX'
        wd = bpy.data.worlds.new('W'); sc.world = wd; wd.use_nodes = True
        wd.node_tree.nodes['Background'].inputs['Color'].default_value = (0.5, 0.5, 0.52, 1)
        wd.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.7
        for imya, loc, e in (('k', (4, -5, 6), 4.0), ('r', (-5, 4, 3), 2.0)):
            ld = bpy.data.lights.new(imya, 'SUN'); ld.energy = e; ob = bpy.data.objects.new(imya, ld); sc.collection.objects.link(ob)
            ob.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        cd = bpy.data.cameras.new('c'); cam = bpy.data.objects.new('c', cd); sc.collection.objects.link(cam); sc.camera = cam
        vid = os.environ.get('VID', 'pered')
        pos = {'pered': (4.2, -6.2, 2.4), 'bok': (-6.5, -2.0, 1.6), 'blizko': (2.0, -2.6, 0.6)}[vid]
        cel = {'pered': (0, 0, 0), 'bok': (0, 0, 0), 'blizko': (0.6, -0.5, -0.6)}[vid]
        cam.location = pos; cam.rotation_euler = (Vector(cel) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler(); cd.lens = 35
        sc.render.filepath = out; bpy.ops.render.render(write_still=True)

main()
