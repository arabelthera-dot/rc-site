# p544-b: первая в мире стыковка пилотируемых кораблей «Союз-4» и «Союз-5» (16 января 1969) кодом в Блендере 4.2 — диорама.
#   ~/opt/blender-run.sh --python soyuz_stykovka.py -- <выход.glb>
# Факты — только из карточки дня 01-16.yaml:
#   • «Союз-4» играл активную роль: в его стыковочном узле стоял штырь; узел «Контакт» соединял корабли только
#     механически — переходного люка между ними не было;
#   • Елисеев и Хрунов перешли из «Союза-5» в «Союз-4» через открытый космос в скафандрах «Ястреб» (жёсткий шлем,
#     ранец жизнеобеспечения); Хрунов вылез в узкий люк и шёл, перехватывая руками поручень, ногами корабль трогать
#     было нельзя; каждого держал фал со шлангом; Елисеев высунулся из люка по пояс и смотрел ему вслед;
#   • отсеки корабля: орбитальный (бытовой) отсек с люком, спускаемый аппарат, приборный отсек (агрегат); солнечные
#     батареи; внизу во время ожидания была Африка.
# ДОПУЩЕНИЕ-реконструкция (в карточке нет):
#   • все размеры (~метры): бытовой отсек — эллипсоид Ø2,2 м, спускаемый аппарат-«фара» Ø2,2 м, приборный отсек Ø2,2 м
#     с юбкой Ø2,7 м, длина корабля ~7,8 м; зазор между стыковочными шпангоутами 0,16 м, штырь входит в конус;
#   • раскладка: корабли носами друг к другу по оси X, «Союз-4» слева (штырь), «Союз-5» справа (конус);
#     люки бытовых отсеков сверху, чуть к зрителю; две нитки поручней идут по обоим бытовым отсекам и над стыком;
#   • по два крыла солнечных батарей из четырёх створок на приборном отсеке; антенны-штыри; одно сопло и четыре
#     малых сопла на днище; ферма-переходник между спускаемым и приборным отсеками;
#   • цвета: обшивка серо-оливковая (экранно-вакуумная теплоизоляция), приборный отсек светло-серый, скафандры белые,
#     светофильтр шлема золотистый; Земля — сферический сегмент R=7,5 м (масштаб условный) под кораблями: океан, суша, облака.
# Узлы glb (для chasti): stykovochnyj-uzel, orbitalnye-otseki, spuskaemye-apparaty, pribornye-otseki,
#   solnechnye-batarei, poruchni, kosmonavty, zemlya. Свет в glb не кладётся. Текста на модели и текстурах нет.
import bpy, bmesh, math, sys, os
import numpy as np
from mathutils import Vector, Matrix

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['/tmp/pomoshchniki/p544-b/3d/16/raw.glb']
OUT = A[0]
DIR = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(DIR, 'tex'); os.makedirs(TEX, exist_ok=True)
TAU = math.tau; DEG = math.pi / 180

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
rng = np.random.default_rng(1969)

# ── шумы и текстуры ─────────────────────────────────────────────────────────────────────────────────
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

def tex_obshivka(n=512, baza=(0.20, 0.23, 0.17)):
    """Теплоизоляция: стёганые маты со швами, складки, потёртости."""
    a, b, g = shum(n, 1.6), shum(n, 2.6), shum(n, 0.6)
    x = np.arange(n) / n
    shov = np.maximum(ss(0.0, 0.012, np.abs(((x * 4) % 1) - 0.5) - 0.488)[None, :],
                      ss(0.0, 0.012, np.abs(((x * 4) % 1) - 0.5) - 0.488)[:, None])
    stezh = (np.sin(x * TAU * 16)[None, :] * np.sin(x * TAU * 16)[:, None]) * 0.5 + 0.5
    col = np.array(baza) * (0.80 + 0.35 * b[..., None] + 0.1 * a[..., None]) * (1 - 0.45 * shov[..., None])
    rough = 0.70 + 0.15 * b; metal = np.zeros_like(a)
    h = 0.5 * g + 0.25 * stezh - 0.6 * shov + 0.2 * a
    return col, np.dstack([np.ones_like(a), rough, metal]), normal_iz(h, 3.0)

def tex_kraska(n=512):
    a, b = shum(n, 2.2), shum(n, 1.2)
    col = np.array([0.62, 0.63, 0.62]) * (0.86 + 0.18 * a[..., None]) - 0.05 * ss(0.75, 0.9, b)[..., None]
    rough = 0.45 + 0.2 * a
    return col, np.dstack([np.ones_like(a), rough, 0.15 * ss(0.8, 0.95, b)]), normal_iz(0.3 * a, 1.0)

def tex_batareya(n=512):
    """Створка батареи: сетка ячеек 8×8 с серебристыми проводниками."""
    x = np.arange(n) / n
    gx = np.abs(((x * 8) % 1) - 0.5); lin = np.maximum(ss(0.45, 0.47, gx)[None, :], ss(0.45, 0.47, gx)[:, None])
    tonk = ss(0.48, 0.49, np.abs(((x * 32) % 1) - 0.5))[None, :] * 0.5
    a = shum(n, 1.0)
    cell = np.array([0.025, 0.04, 0.10]) * (0.85 + 0.3 * a[..., None])
    col = cell * (1 - lin[..., None]) + np.array([0.55, 0.56, 0.58]) * lin[..., None]
    col = col * (1 - tonk[..., None]) + np.array([0.30, 0.32, 0.36]) * tonk[..., None]
    rough = 0.22 + 0.4 * lin; metal = 0.3 + 0.6 * lin
    return col, np.dstack([np.ones_like(a), rough, metal]), normal_iz(-lin * 0.5, 1.5)

def tex_tkan(n=256):
    a, b = shum(n, 1.4), shum(n, 2.4)
    col = np.array([0.80, 0.80, 0.77]) * (0.9 + 0.12 * b[..., None])
    return col, normal_iz(0.6 * a + 0.3 * b, 2.5)

def tex_zemlya(n=1024):
    """Вид на Землю сверху: океан, суша (саванна и пустыня), облачные гряды; к краю — дымка."""
    yy, xx = np.mgrid[0:n, 0:n] / n
    k1, k2, k3, k4 = shum(n, 2.4), shum(n, 2.0), shum(n, 1.4), shum(n, 2.8)
    rr = np.hypot(xx - 0.5, yy - 0.5) * 2
    susha = ss(0.50, 0.53, k1 * 0.8 + 0.25 * (0.6 - np.abs(yy - 0.42) - 0.2 * xx))
    okean = np.array([0.012, 0.045, 0.13]) * (0.8 + 0.4 * k3[..., None])
    melk = np.array([0.03, 0.12, 0.20]) * ss(0.40, 0.52, k1 * 0.8 + 0.25 * (0.6 - np.abs(yy - 0.42) - 0.2 * xx))[..., None]
    pust = np.array([0.42, 0.30, 0.17]); sav = np.array([0.20, 0.22, 0.09])
    zemlya = sav * (1 - ss(0.45, 0.65, k2))[..., None] + pust * ss(0.45, 0.65, k2)[..., None]
    zemlya = zemlya * (0.75 + 0.4 * k3[..., None])
    col = okean + melk
    col = col * (1 - susha[..., None]) + zemlya * susha[..., None]
    obl = ss(0.55, 0.75, 0.6 * k4 + 0.4 * k3 + 0.15 * np.sin(yy * 40 + 6 * k2)) * 0.9
    col = col * (1 - obl[..., None]) + np.array([0.80, 0.82, 0.86]) * obl[..., None]
    dymka = ss(0.55, 1.0, rr)
    col = col * (1 - 0.55 * dymka[..., None]) + np.array([0.25, 0.45, 0.80]) * 0.55 * dymka[..., None]
    rough = 0.35 + 0.5 * susha + 0.1 * obl
    return col, np.dstack([np.ones_like(rough), rough, np.zeros_like(rough)]), normal_iz(0.4 * obl + 0.3 * susha * k3, 2.0)

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

c, o, n_ = tex_obshivka(); OB = [kartinka('obshivka-cvet', c), kartinka('obshivka-orm', o, True), kartinka('obshivka-normal', n_, True)]
c, o, n_ = tex_obshivka(baza=(0.17, 0.19, 0.15)); OB2 = [kartinka('obshivka2-cvet', c), kartinka('obshivka2-orm', o, True), OB[2]]
c, o, n_ = tex_kraska(); KR = [kartinka('kraska-cvet', c), kartinka('kraska-orm', o, True), kartinka('kraska-normal', n_, True)]
c, o, n_ = tex_batareya(); BA = [kartinka('batareya-cvet', c), kartinka('batareya-orm', o, True), kartinka('batareya-normal', n_, True)]
c, n_ = tex_tkan(); TK = [kartinka('tkan-cvet', c), kartinka('tkan-normal', n_, True)]
c, o, n_ = tex_zemlya(); ZE = [kartinka('zemlya-cvet', c), kartinka('zemlya-orm', o, True), kartinka('zemlya-normal', n_, True)]

M = {
    'obsh':   mat_tex('obshivka', OB[0], OB[1], OB[2], 0.9),
    'obsh2':  mat_tex('obshivka-sa', OB2[0], OB2[1], OB2[2], 0.9),
    'kraska': mat_tex('kraska-svetlaya', KR[0], KR[1], KR[2], 0.5),
    'batar':  mat_tex('batareya', BA[0], BA[1], BA[2], 0.6),
    'tkan':   mat_tex('skafandr-tkan', TK[0], None, TK[1], 0.8, sher=0.8),
    'zemlya': mat_tex('zemlya', ZE[0], ZE[1], ZE[2], 0.5),
    'alum':   mat('alyuminij', (0.70, 0.71, 0.72), 1.0, 0.32),
    'temn':   mat('metall-temnyj', (0.06, 0.06, 0.065), 0.8, 0.38),
    'shpang': mat('shpangout', (0.55, 0.50, 0.42), 1.0, 0.35),
    'teplo':  mat('teplozashchita', (0.18, 0.12, 0.08), 0.2, 0.7),
    'steklo': mat('steklo-illyuminatora', (0.01, 0.015, 0.03), 0.0, 0.05),
    'zoloto': mat('svetofiltr-zoloto', (0.86, 0.62, 0.28), 1.0, 0.12),
    'shlem':  mat('shlem-belyj', (0.86, 0.86, 0.84), 0.0, 0.35),
    'perch':  mat('perchatki', (0.22, 0.22, 0.23), 0.0, 0.7),
    'fal':    mat('fal', (0.70, 0.68, 0.60), 0.0, 0.75),
    'ranec':  mat('ranec', (0.72, 0.73, 0.72), 0.3, 0.45),
    'krasn':  mat('kraska-krasnaya', (0.45, 0.06, 0.04), 0.0, 0.5),
    'sopla':  mat('sopla', (0.16, 0.14, 0.13), 0.9, 0.5),
}

# ── построители ──────────────────────────────────────────────────────────────────────────────────────
VSE = []
def mesh_obj(imya, verts, faces, uvs, material, rodit, smooth=True):
    me = bpy.data.meshes.new(imya); me.from_pydata([tuple(v) for v in verts], [], faces); me.validate()
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
    """Тело вращения вокруг локальной Z; prof — [(r, z), …], None — излом."""
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
                verts.append(at @ Vector((r * math.cos(a), r * math.sin(a), z)))
                uvs.append((nu * i / seg, (pol[0][1] + vv[j]) / tile))
        for j in range(len(pol) - 1):
            for i in range(seg):
                a, b = base + j * (seg + 1) + i, base + (j + 1) * (seg + 1) + i
                faces.append((a, a + 1, b + 1, b))
    return mesh_obj(imya, verts, faces, uvs, material, rodit)

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

def ramka(c, X, Y, Z):
    """Матрица из центра и трёх осей (столбцы)."""
    m = Matrix.Identity(4)
    for i, v in enumerate((X, Y, Z)):
        for k in range(3): m[k][i] = v[k]
    m[0][3], m[1][3], m[2][3] = c
    return m

def box(imya, size, T, material, rodit, fask=0.01, tile=0.6, seg=2):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    f = min(fask, min(size) * 0.45)
    if f > 0: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=f, segments=seg, profile=0.5, affect='EDGES')
    return bm_obj(imya, bm, T, material, rodit, tile)

def ellips(imya, c, X, Y, Z, material, rodit, seg=20, rings=12, tile=0.4):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    return bm_obj(imya, bm, ramka(c, X, Y, Z), material, rodit, tile)

def sterzhen(imya, p1, p2, r, material, rodit, seg=12):
    p1, p2 = Vector(p1), Vector(p2); L = (p2 - p1).length; f = r * 0.25
    return lathe(imya, [(0, 0), (r - f, 0), (r, f), (r, L - f), (r - f, L), (0, L)], material, rodit, seg=seg, at=osi(p1, p2 - p1), tile=0.2)

def tor(imya, Rr, r, at, material, rodit, seg=40, k=10):
    pr = [(Rr + r * math.cos(TAU * j / k), r * math.sin(TAU * j / k)) for j in range(k + 1)]
    return lathe(imya, pr, material, rodit, seg=seg, at=at, tile=0.2)

def truba(imya, tochki, r, material, rodit, res=8, bres=2):
    cu = bpy.data.curves.new(imya, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = r; cu.bevel_resolution = bres; cu.resolution_u = res; cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(tochki) - 1)
    for bp, p in zip(sp.bezier_points, tochki):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    ob = bpy.data.objects.new(imya + '-kr', cu); sc.collection.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.data.objects.remove(ob); bpy.data.curves.remove(cu)
    uv = me.uv_layers.new(name='UV')
    for p in me.polygons:
        p.use_smooth = True
        for li, vi in zip(p.loop_indices, p.vertices):
            v = me.vertices[vi].co; uv.data[li].uv = ((v.x + v.z) * 3, (v.y + v.z) * 3)
    me.materials.clear(); me.materials.append(material)
    o2 = bpy.data.objects.new(imya, me); sc.collection.objects.link(o2); o2.parent = rodit; VSE.append(o2)
    return o2

UZLY = {}
def uzel(imya):
    e = bpy.data.objects.new(imya, None); sc.collection.objects.link(e)
    e['uzel'] = imya; UZLY[imya] = e
    return e

U_ST = uzel('stykovochnyj-uzel'); U_OO = uzel('orbitalnye-otseki'); U_SA = uzel('spuskaemye-apparaty')
U_PO = uzel('pribornye-otseki'); U_SB = uzel('solnechnye-batarei'); U_PR = uzel('poruchni')
U_KO = uzel('kosmonavty'); U_ZE = uzel('zemlya')

# ══ ГЕОМЕТРИЯ КОРАБЛЯ (допущения, ~метры) ════════════════════════════════════════════════════════════
X0 = 0.08                         # полузазор между стыковочными шпангоутами
OC, OA, OR = 1.40, 1.15, 1.10     # бытовой отсек: центр по оси, полуось вдоль оси, радиус
def W(sg, s, th, rad):
    """sg=+1 — «Союз-4» (нос к +X), sg=−1 — «Союз-5»; s — от носа назад; th — азимут от верха (к зрителю −)."""
    return Vector((-sg * (X0 + s), rad * math.sin(th * DEG), rad * math.cos(th * DEG)))
def AX(sg, s0=0.0): return osi(W(sg, s0, 0, 0), (-sg, 0, 0))
def r_oo(s): return OR * math.sqrt(max(0.0, 1 - ((s - OC) / OA) ** 2))
def n_oo(sg, s, th):
    ds, dr = (s - OC) / OA ** 2, r_oo(s) / OR ** 2
    return Vector((-sg * ds, dr * math.sin(th * DEG), dr * math.cos(th * DEG))).normalized()
def t_oo(sg, s, th):  # касательная вдоль меридиана (к корме)
    e = 1e-3
    return (W(sg, s + e, th, r_oo(s + e)) - W(sg, s - e, th, r_oo(s - e))).normalized()

TH_L = -24      # азимут люков
TH_P = (-6, -42)  # азимуты двух ниток поручней

def lyuk(sg, s, otkryt):
    p = W(sg, s, TH_L, r_oo(s)); n = n_oo(sg, s, TH_L); t = t_oo(sg, s, TH_L)
    tor('oo-lyuk-kolco', 0.33, 0.045, osi(p + n * 0.02, n), M['alum'], U_OO, seg=40, k=8)
    lathe('oo-lyuk-proem', [(0.33, 0.02), (0.30, -0.06), (0.0, -0.08)], M['temn'], U_OO, seg=32, at=osi(p, n))
    for i in range(10):
        a = TAU * i / 10; q = osi(p + n * 0.03, n) @ Vector((0.36 * math.cos(a), 0.36 * math.sin(a), 0))
        lathe('oo-lyuk-bolt', [(0, 0), (0.016, 0), (0.016, 0.02), (0, 0.025)], M['alum'], U_OO, seg=6, at=osi(q, n))
    if otkryt:   # крышка откинута на петле к корме
        h = p + t * 0.34 + n * 0.02
        c = h + n * 0.34; T = osi(c, t)
        lathe('oo-lyuk-kryshka', [(0, -0.03), (0.30, -0.03), (0.33, 0.0), (0.30, 0.03), (0.0, 0.05)], M['alum'], U_OO, seg=36, at=T)
        tor('oo-lyuk-shturval', 0.14, 0.015, T @ Matrix.Translation((0, 0, -0.08)), M['temn'], U_OO, seg=24, k=6)
        sterzhen('oo-lyuk-petlya', h - Vector((0, 0.08, 0)) * 0, h + n * 0.05, 0.03, M['temn'], U_OO)
    else:
        lathe('oo-lyuk-kryshka', [(0, 0.06), (0.26, 0.05), (0.30, 0.03), (0.31, 0.0)], M['alum'], U_OO, seg=36, at=osi(p, n))
        tor('oo-lyuk-shturval', 0.13, 0.014, osi(p + n * 0.09, n), M['temn'], U_OO, seg=24, k=6)

def korabl(sg):
    at = AX(sg)
    # стыковочный шпангоут
    lathe('st-shpangout', [(0.0, 0.0), (0.30, 0.0), None, (0.30, 0.0), (0.47, 0.0), (0.47, 0.07), None, (0.47, 0.07), (0.41, 0.09),
                           (0.41, 0.30), (0.44, 0.34)], M['shpang'], U_ST, seg=48, at=at)
    for i in range(8):
        a = TAU * (i + 0.5) / 8
        p = at @ Vector((0.44 * math.cos(a), 0.44 * math.sin(a), 0.035))
        box('st-zamok', (0.07, 0.07, 0.12), osi(p, (-sg, 0, 0)), M['temn'], U_ST, fask=0.01)
    if sg > 0:   # «Союз-4» — активный: штырь
        lathe('st-shtyr-osnova', [(0.0, 0.0), (0.26, 0.0), (0.26, -0.03), (0.14, -0.06), (0.11, -0.10), (0.0, -0.10)], M['alum'], U_ST, seg=32, at=at)
        lathe('st-shtyr', [(0.0, -0.10), (0.05, -0.10), (0.05, -0.32), (0.07, -0.34), (0.07, -0.38), (0.0, -0.44)], M['alum'], U_ST, seg=24, at=at)
        for i in range(4):
            a = TAU * i / 4 + 0.4
            sterzhen('st-shtyr-amortizator', at @ Vector((0.22 * math.cos(a), 0.22 * math.sin(a), -0.01)), at @ Vector((0.07 * math.cos(a), 0.07 * math.sin(a), -0.12)), 0.018, M['temn'], U_ST)
    else:        # «Союз-5» — пассивный: приёмный конус
        lathe('st-konus', [(0.41, 0.0), (0.36, 0.04), (0.10, 0.36), (0.06, 0.40), (0.0, 0.40)], M['alum'], U_ST, seg=48, at=at)
        lathe('st-konus-gnezdo', [(0.075, 0.30), (0.075, 0.395)], M['temn'], U_ST, seg=16, at=at)
    # бытовой отсек — эллипсоид
    pr = []
    t0, t1 = math.asin(0.40 / OR), math.pi - math.asin(0.62 / OR)
    for i in range(25):
        t = t0 + (t1 - t0) * i / 24; pr.append((OR * math.sin(t), OC - OA * math.cos(t)))
    pr = [(0.44, 0.34)] + pr
    lathe('oo-korpus', pr, M['obsh'], U_OO, seg=64, at=at, tile=0.9)
    # пояс и антенны бытового отсека
    tor('oo-poyas', OR + 0.01, 0.025, AX(sg, OC), M['alum'], U_OO, seg=64, k=6)
    for th, s, L in ((70, 0.9, 1.1), (-110, 1.0, 0.9), (150, 1.9, 1.0)):
        p = W(sg, s, th, r_oo(s)); n = n_oo(sg, s, th)
        lathe('oo-antenna-osn', [(0, 0), (0.05, 0), (0.035, 0.08), (0, 0.09)], M['temn'], U_OO, seg=10, at=osi(p, n))
        sterzhen('oo-antenna', p + n * 0.08, p + n * 0.08 + (n + Vector((-sg * 0.6, 0, 0))).normalized() * L, 0.01, M['alum'], U_OO, seg=6)
    # спускаемый аппарат — «фара»
    lathe('sa-gorlovina', [(0.62, 2.33), (0.64, 2.38), (0.64, 2.44), (0.60, 2.46)], M['shpang'], U_SA, seg=48, at=at)
    fara = [(0.60, 2.46), (0.70, 2.56), (0.82, 2.82), (0.93, 3.18), (1.01, 3.58), (1.07, 3.98), (1.10, 4.28), (1.10, 4.42)]
    lathe('sa-korpus', fara, M['obsh2'], U_SA, seg=64, at=at, tile=0.9)
    lathe('sa-teplozashchita', [(1.10, 4.42), (1.13, 4.45), (1.13, 4.52), (1.04, 4.58), (0.6, 4.63)], M['teplo'], U_SA, seg=64, at=at)
    for th, s in ((-95, 3.35), (-150, 3.05)):     # иллюминаторы
        r = 0.82 + (s - 2.82) / (3.18 - 2.82) * (0.93 - 0.82) if s < 3.18 else 0.93 + (s - 3.18) / 0.40 * 0.08
        p = W(sg, s, th, r); n = Vector((0, math.sin(th * DEG), math.cos(th * DEG)))
        n = (n + Vector((-sg * 0.25, 0, 0))).normalized()
        tor('sa-illyuminator-rama', 0.11, 0.025, osi(p, n), M['alum'], U_SA, seg=24, k=6)
        lathe('sa-illyuminator', [(0.0, 0.01), (0.10, 0.0)], M['steklo'], U_SA, seg=24, at=osi(p, n))
    p = W(sg, 2.95, -60, 0.88); n = Vector((0, math.sin(-60 * DEG), math.cos(-60 * DEG)))   # перископ-визир
    lathe('sa-vizir', [(0, 0), (0.13, 0), (0.12, 0.10), (0.09, 0.16), (0.0, 0.17)], M['alum'], U_SA, seg=20, at=osi(p, n))
    lathe('sa-vizir-steklo', [(0.0, 0.172), (0.06, 0.165)], M['steklo'], U_SA, seg=16, at=osi(p, n))
    # ферма-переходник
    lathe('po-perehodnik', [(0.86, 4.60), (0.86, 4.98)], M['temn'], U_PO, seg=40, at=at)
    tor('po-ferma-kolco', 0.97, 0.03, AX(sg, 4.62), M['alum'], U_PO, seg=48, k=6)
    tor('po-ferma-kolco', 1.06, 0.03, AX(sg, 4.96), M['alum'], U_PO, seg=48, k=6)
    for i in range(16):
        a0, a1 = TAU * i / 16, TAU * (i + 0.5) / 16
        sterzhen('po-ferma', AX(sg, 4.62) @ Vector((0.97 * math.cos(a0), 0.97 * math.sin(a0), 0)),
                 AX(sg, 4.96) @ Vector((1.06 * math.cos(a1), 1.06 * math.sin(a1), 0)), 0.02, M['alum'], U_PO, seg=6)
        a2 = TAU * (i + 1) / 16
        sterzhen('po-ferma', AX(sg, 4.96) @ Vector((1.06 * math.cos(a1), 1.06 * math.sin(a1), 0)),
                 AX(sg, 4.62) @ Vector((0.97 * math.cos(a2), 0.97 * math.sin(a2), 0)), 0.02, M['alum'], U_PO, seg=6)
    # приборный отсек
    lathe('po-korpus', [(1.06, 4.96), (1.10, 5.00), (1.10, 6.22), (1.36, 6.48), (1.36, 7.24), (1.31, 7.30), (0.9, 7.32), (0.0, 7.33)],
          M['kraska'], U_PO, seg=64, at=at, tile=1.2)
    for i in range(24):  # рёбра радиатора
        a = TAU * i / 24
        T = AX(sg, 5.6) @ ramka((1.115 * math.cos(a), 1.115 * math.sin(a), 0), Vector((math.cos(a), math.sin(a), 0)) * 1,
                                Vector((-math.sin(a), math.cos(a), 0)), Vector((0, 0, 1)))
        box('po-radiator', (0.03, 0.06, 1.1), T, M['alum'], U_PO, fask=0.008)
    tor('po-poyas', 1.37, 0.03, AX(sg, 6.86), M['temn'], U_PO, seg=64, k=6)
    tor('po-poyas', 1.11, 0.025, AX(sg, 5.02), M['temn'], U_PO, seg=64, k=6)
    lathe('po-soplo', [(0.0, 7.33), (0.16, 7.33), (0.13, 7.42), (0.17, 7.55), (0.30, 7.80), None, (0.30, 7.80), (0.28, 7.80), (0.15, 7.56), (0.11, 7.45)],
          M['sopla'], U_PO, seg=32, at=at)
    for i in range(4):
        a = TAU * i / 4 + 0.78
        c0 = AX(sg) @ Vector((0.75 * math.cos(a), 0.75 * math.sin(a), 7.32))
        lathe('po-soplo-maloe', [(0.0, 0.0), (0.06, 0.0), (0.05, 0.06), (0.11, 0.20), None, (0.11, 0.20), (0.09, 0.20), (0.04, 0.07)],
              M['sopla'], U_PO, seg=16, at=osi(c0, (-sg, 0, 0)) if False else Matrix.Translation(c0) @ AX(sg).to_3x3().to_4x4())
    for th in (40, 200):
        p = W(sg, 7.0, th, 1.36); n = Vector((0, math.sin(th * DEG), math.cos(th * DEG)))
        sterzhen('po-antenna', p, p + (n + Vector((-sg * 0.5, 0, 0))).normalized() * 1.3, 0.012, M['alum'], U_PO, seg=6)
    # солнечные батареи: два крыла по 4 створки
    for th in (-62, 118):
        nr = Vector((0, math.sin(th * DEG), math.cos(th * DEG)))
        bx = Vector((-sg, 0, 0)); bn = nr.cross(bx).normalized()
        base = W(sg, 6.86, th, 1.36)
        sterzhen('sb-kronshtejn', base, base + nr * 0.42, 0.04, M['alum'], U_SB, seg=10)
        box('sb-sharnir', (0.12, 0.12, 0.12), ramka(base + nr * 0.42, bx, bn, nr), M['temn'], U_SB, fask=0.02)
        for k in range(4):
            c = base + nr * (0.52 + 0.47 + k * 0.98)
            box('sb-stvorka', (1.40, 0.035, 0.94), ramka(c, bx, bn, nr), M['batar'], U_SB, fask=0.008, tile=0.8)
            box('sb-rama', (1.44, 0.025, 0.04), ramka(c - nr * 0.47, bx, bn, nr), M['alum'], U_SB, fask=0.006)
            if k == 3: box('sb-rama', (1.44, 0.025, 0.04), ramka(c + nr * 0.47, bx, bn, nr), M['alum'], U_SB, fask=0.006)
        sterzhen('sb-lonzheron', base + nr * 0.48, base + nr * 4.4, 0.016, M['alum'], U_SB, seg=6)
    lyuk(sg, 1.62 if sg > 0 else 1.40, otkryt=(sg < 0))

korabl(+1); korabl(-1)

# ── поручни: две нитки по обоим бытовым отсекам и над стыком ──────────────────────────────────────────
for th in TH_P:
    pts = []
    for sg, rng_s in ((+1, np.linspace(2.05, 0.40, 14)), (-1, np.linspace(0.40, 2.05, 14))):
        for s in rng_s: pts.append(W(sg, float(s), th, max(r_oo(float(s)), 0.44) + 0.12))
    truba('pr-poruchen', pts, 0.022, M['krasn'], U_PR, res=4, bres=2)
    for sg in (+1, -1):
        for s in (0.45, 0.85, 1.25, 1.65, 2.0):
            r = max(r_oo(s), 0.44)
            sterzhen('pr-stojka', W(sg, s, th, r - 0.02), W(sg, s, th, r + 0.12), 0.016, M['alum'], U_PR, seg=6)

# ── космонавты в скафандрах ───────────────────────────────────────────────────────────────────────────
def ruka(imya, plecho, lokot, kist, r=0.068):
    truba(imya + '-ruka', [plecho, lokot, kist], r, M['tkan'], U_KO, res=6, bres=3)
    tor(imya + '-manzheta', r * 1.05, 0.018, osi(kist + (lokot - kist).normalized() * 0.04, lokot - kist), M['perch'], U_KO, seg=16, k=6)
    d = (kist - lokot).normalized(); a, b = d.orthogonal().normalized(), None
    b = d.cross(a)
    ellips(imya + '-perchatka', kist + d * 0.04, d * 0.085, a * 0.06, b * 0.04, M['perch'], U_KO, seg=12, rings=8)

def shlem(c, vpered, verh, bok):
    ellips('ko-shlem', c, bok * 0.18, vpered * 0.18, verh * 0.19, M['shlem'], U_KO, seg=28, rings=16)
    vz = (vpered * 0.85 - verh * 0.1).normalized()
    ellips('ko-svetofiltr', c + vz * 0.04, bok * 0.155, vpered * 0.16, verh * 0.14, M['zoloto'], U_KO, seg=24, rings=14)
    tor('ko-shlem-kolco', 0.15, 0.03, osi(c - verh * 0.17, verh), M['alum'], U_KO, seg=24, k=6)

def tulovishche(P, os_, gr, bok):
    """P — таз; os_ — вдоль тела к голове; gr — из груди наружу (вперёд); bok — вбок."""
    ellips('ko-tors', P + os_ * 0.34, bok * 0.25, gr * 0.18, os_ * 0.34, M['tkan'], U_KO)
    ellips('ko-taz', P, bok * 0.21, gr * 0.16, os_ * 0.17, M['tkan'], U_KO)
    tor('ko-poyas', 0.21, 0.025, ramka(P + os_ * 0.08, bok * 1.0, gr * 0.78, os_), M['perch'], U_KO, seg=24, k=6)
    box('ko-ranec', (0.42, 0.15, 0.55), ramka(P + os_ * 0.36 - gr * 0.25, bok, gr, os_), M['ranec'], U_KO, fask=0.05, seg=3)
    box('ko-ranec-kryshka', (0.30, 0.03, 0.40), ramka(P + os_ * 0.38 - gr * 0.33, bok, gr, os_), M['alum'], U_KO, fask=0.01)
    box('ko-pult', (0.18, 0.06, 0.12), ramka(P + os_ * 0.42 + gr * 0.19, bok, gr, os_), M['perch'], U_KO, fask=0.015)
    for z in (-1, 1):
        sterzhen('ko-razem', P + os_ * 0.30 + bok * z * 0.2 + gr * 0.08, P + os_ * 0.30 + bok * z * 0.29 + gr * 0.06, 0.035, M['alum'], U_KO)
    shlem(P + os_ * 0.83, gr, os_, bok)

# Хрунов: на поручнях бытового отсека «Союза-4», тело вдоль корабля, грудью к обшивке, ноги не касаются
sh = 1.15; thc = sum(TH_P) / 2
Q = W(+1, sh, thc, r_oo(sh) + 0.12); n = n_oo(+1, sh, thc); L = t_oo(+1, sh, thc)
L = (L - n * L.dot(n)).normalized(); S = L.cross(n).normalized()
P = Q - L * 0.98 + n * 0.30
tulovishche(P, L, -n, S)
for z in (-1, 1):   # руки на двух нитках поручня
    kist = W(+1, sh, TH_P[0] if z * S.y < 0 else TH_P[1], r_oo(sh) + 0.12)
    kist = W(+1, sh, TH_P[0], r_oo(sh) + 0.12) if (W(+1, sh, TH_P[0], 1) - Q).dot(S) * z > 0 else W(+1, sh, TH_P[1], r_oo(sh) + 0.12)
    plecho = P + L * 0.58 + S * z * 0.26
    lokot = (plecho + kist) / 2 + n * 0.10 + S * z * 0.05
    ruka('ko-hrunov', plecho, lokot, kist + n * 0.04)
for z, k in ((-1, 0.0), (1, 0.12)):   # ноги чуть разведены и согнуты — парят над обшивкой
    t0 = P + S * z * 0.11; ko = P - L * 0.44 + S * z * 0.15 + n * (0.10 + k); st = P - L * 0.86 + S * z * 0.17 + n * (0.04 + k * 1.5)
    truba('ko-noga', [t0, ko, st], 0.085, M['tkan'], U_KO, res=6, bres=3)
    tor('ko-koleno', 0.088, 0.016, osi(ko, (st - t0)), M['perch'], U_KO, seg=16, k=6)
    ellips('ko-botinok', st - L * 0.05 - n * 0.06, S * 0.075, L * 0.08, n * 0.14, M['perch'], U_KO, seg=14, rings=8)
POYAS_H = P + L * 0.08 - n * 0.0 + S * 0.22

# Елисеев: по пояс из люка «Союза-5», смотрит вслед товарищу
s5 = 1.40; c5 = W(-1, s5, TH_L, r_oo(s5)); n5 = n_oo(-1, s5, TH_L)
F = Vector((-1, 0, 0.0)); F = (F - n5 * F.dot(n5)).normalized(); S5 = n5.cross(F).normalized()
P5 = c5 + n5 * 0.02
ellips('ko-tors', P5 + n5 * 0.34, S5 * 0.25, F * 0.18, n5 * 0.34, M['tkan'], U_KO)
box('ko-ranec', (0.42, 0.15, 0.50), ramka(P5 + n5 * 0.40 - F * 0.25, S5, F, n5), M['ranec'], U_KO, fask=0.05, seg=3)
box('ko-pult', (0.18, 0.06, 0.12), ramka(P5 + n5 * 0.42 + F * 0.19, S5, F, n5), M['perch'], U_KO, fask=0.015)
shlem(P5 + n5 * 0.83, (F * 0.8 + n5 * 0.2).normalized(), n5, S5)
ruka('ko-eliseev', P5 + n5 * 0.60 + S5 * 0.26, P5 + n5 * 0.30 + S5 * 0.42 + F * 0.05, P5 + n5 * 0.06 + S5 * 0.36 + F * 0.02)
ruka('ko-eliseev', P5 + n5 * 0.60 - S5 * 0.26, P5 + n5 * 0.68 - S5 * 0.42 + F * 0.28, P5 + n5 * 0.95 - S5 * 0.30 + F * 0.55)

# фал со шлангом: от люка «Союза-5» провисающей петлёй над стыком к поясу Хрунова
a0 = c5 + n5 * 0.1 + F * 0.25
fal = [a0, a0 + n5 * 0.6 + F * 0.3, Vector((0.6, -0.9, 2.1)), Vector((-0.3, -1.05, 2.25)), Vector((-0.9, -0.95, 1.9)), P + n * 0.05 + S * 0.24]
truba('ko-fal', fal, 0.028, M['fal'], U_KO, res=10, bres=2)
for t in (0.25, 0.5, 0.75):   # хомуты на фале
    pass

# ── Земля внизу дугой ─────────────────────────────────────────────────────────────────────────────────
RZ, ZTOP, AMAX = 7.5, -2.7, 50 * DEG
C = Vector((0, 0.0, ZTOP - RZ))
verts, faces, uvs = [], [], []
NR, NS = 30, 112
span = RZ * math.sin(AMAX)
verts.append(C + Vector((0, 0, RZ))); uvs.append((0.5, 0.5))
for i in range(1, NR + 1):
    t = AMAX * i / NR
    for j in range(NS):
        a = TAU * j / NS
        v = C + Vector((RZ * math.sin(t) * math.cos(a), RZ * math.sin(t) * math.sin(a), RZ * math.cos(t)))
        verts.append(v); uvs.append(((v.x - C.x) / span * 0.5 + 0.5, (v.y - C.y) / span * 0.5 + 0.5))
for j in range(NS): faces.append((0, 1 + j, 1 + (j + 1) % NS))
for i in range(NR - 1):
    for j in range(NS):
        a, b = 1 + i * NS + j, 1 + i * NS + (j + 1) % NS
        faces.append((a, a + NS, b + NS, b))
mesh_obj('zemlya-shar', verts, faces, uvs, M['zemlya'], U_ZE)
# торец сегмента — тонкий голубой край атмосферы
rim = []
for k, (rr, dz) in enumerate(((RZ, 0.0), (RZ + 0.25, 0.08), (RZ + 0.25, -0.35), (RZ - 0.4, -0.5))):
    rim.append((rr * math.sin(AMAX) + (0 if k < 3 else 0), RZ * math.cos(AMAX) + dz))
lathe('zemlya-atmosfera', [(RZ * math.sin(AMAX) * 0.999, RZ * math.cos(AMAX)), (RZ * math.sin(AMAX) + 0.10, RZ * math.cos(AMAX) + 0.02),
                           (RZ * math.sin(AMAX) + 0.06, RZ * math.cos(AMAX) - 0.18), (RZ * math.sin(AMAX) * 0.6, RZ * math.cos(AMAX) - 0.9),
                           (0.0, RZ * math.cos(AMAX) - 1.1)],
      mat('atmosfera', (0.20, 0.42, 0.85), 0.0, 0.4, emis=((0.15, 0.35, 0.9), 0.6)), U_ZE, seg=96, at=Matrix.Translation(C))

# ── слить меши внутри узла по материалам ───────────────────────────────────────────────────────────────
def sliyanie():
    gruppy = {}
    for o in VSE:
        gruppy.setdefault(o.parent.name, {}).setdefault(o.data.materials[0].name, []).append(o)
    for imya, e in UZLY.items():
        for mn, obs in gruppy.get(imya, {}).items():
            for ob in obs:
                mw = ob.matrix_world.copy(); ob.parent = None; ob.matrix_world = mw
            if len(obs) > 1:
                with bpy.context.temp_override(active_object=obs[0], object=obs[0], selected_objects=obs, selected_editable_objects=obs):
                    bpy.ops.object.join()
            ob = obs[0]; ob.name = f'{imya}--{mn}'; ob.data.name = ob.name
            with bpy.context.temp_override(active_object=ob, object=ob, selected_objects=[ob], selected_editable_objects=[ob]):
                bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
                bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))
            ob.parent = e
bpy.context.view_layer.update()
sliyanie()

tri = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH':
        ob.data.calc_loop_triangles(); tri += len(ob.data.loop_triangles)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=True, export_extras=True,
                          export_image_format='JPEG', export_materials='EXPORT', export_tangents=False, export_lights=False,
                          export_cameras=False)
print('GLB', OUT, os.path.getsize(OUT), 'байт, треугольников', tri, 'узлы', list(UZLY))
