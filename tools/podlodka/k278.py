# r570: К-278 «Комсомолец» (проект 685) кодом в Блендере — модель, текстуры, сцена, снимки, кадры облёта.
# Блендер 4.2 без окна:
#   ~/opt/blender-run.sh -t 4 -P tools/podlodka/k278.py -- glb  <выход.glb>
#   ~/opt/blender-run.sh -t 4 -P tools/podlodka/k278.py -- snimki <папка> [ширина высота сэмплы]
#   ~/opt/blender-run.sh -t 4 -P tools/podlodka/k278.py -- kadry <папка> <с> <по> [ширина высота сэмплы]
# Размеры и их источники — в RAZMERY ниже; всё, чего в источниках нет, помечено «допущение».
import bpy, bmesh, math, sys, os
import numpy as np
from mathutils import Vector

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['glb', '/tmp/k278.glb']
MODE = A[0]

RAZMERY = {
    # deepstorm.ru, проект 685 «Плавник»: длина 118,4 (117,5 ?) м, ширина 11,1 (10,7 ?) м, осадка 7,4 (8,0 ?) м.
    # opaplkomsomolec.ru (Общество памяти АПЛ «Комсомолец»): длина наибольшая по КВЛ 110 м, ширина 12,3 м, прочный корпус — цилиндр Ø 8 м.
    'L': 117.5,     # длина наибольшая, м (deepstorm, второе значение)
    'D': 10.7,      # диаметр лёгкого корпуса, м (deepstorm, второе значение)
    'SPAN': 12.3,   # размах кормового горизонтального оперения с капсулами, м — ДОПУЩЕНИЕ: 12,3 у Общества памяти — «ширина», куда она мерена, не сказано
    'D_PK': 8.0,    # прочный корпус (внутри, не видно) — для справки
}
L = RAZMERY['L']; R = RAZMERY['D'] / 2
LB, LT, RH = 17.0, 40.0, 0.75      # длина носового закругления, кормового конуса, радиус у ступицы — допущение по обводам «как у 945»
TILE = 8.0                          # одна текстура плиток покрытия = 8×8 м


def r_of(x):
    """Радиус лёгкого корпуса; x=0 — корма (ступица), x=L — нос."""
    if x >= L - LB:
        t = max(0.0, (L - x) / LB)
        return R * (1 - (1 - t) ** 2.4) ** (1 / 2.4)
    if x <= LT:
        t = max(0.0, x / LT)
        return RH + (R - RH) * (1 - (1 - t) ** 2)
    return R


# ---------- текстуры: плитки резинового покрытия (карта нормалей швов, цвет, шероховатость) ----------
def tex_plitki(n=1024):
    rng = np.random.default_rng(278)
    px = n / TILE                     # пикселей на метр
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
    tw, th = 0.8, 0.5                 # плитка 0,8 × 0,5 м — допущение (размер плиток в источниках не дан)
    row = np.floor(yy / (th * px)).astype(int)
    shift = (row % 2) * 0.5 * tw * px
    col = np.floor((xx + shift) / (tw * px)).astype(int) % int(round(TILE / tw))
    row = row % int(round(TILE / th))
    fx = ((xx + shift) / (tw * px)) % 1.0
    fy = (yy / (th * px)) % 1.0
    d = np.minimum(np.minimum(fx, 1 - fx) * tw * px, np.minimum(fy, 1 - fy) * th * px)  # до шва, пиксели
    groove = np.clip(d / 2.5, 0, 1) ** 0.6                                              # шов ~5 px = 4 см
    ids = row * 64 + col
    tile_h = rng.normal(0, 1, 4096).astype(np.float32)[ids]                             # плитки чуть разной толщины
    tile_tx = rng.normal(0, 1, 4096).astype(np.float32)[ids]
    tile_ty = rng.normal(0, 1, 4096).astype(np.float32)[ids]
    noise = rng.normal(0, 1, (n, n)).astype(np.float32)
    for _ in range(2):  # мягкий шум «резины»
        noise = (noise + np.roll(noise, 1, 0) + np.roll(noise, -1, 0) + np.roll(noise, 1, 1) + np.roll(noise, -1, 1)) / 5
    H = groove * 1.0 + 0.05 * tile_h + 0.004 * (tile_tx * (fx - .5) * tw * px + tile_ty * (fy - .5) * th * px) / 10 + 0.06 * noise
    gx = (np.roll(H, -1, 1) - np.roll(H, 1, 1)) * 0.5
    gy = (np.roll(H, -1, 0) - np.roll(H, 1, 0)) * 0.5
    s = 2.2
    nx, ny, nz = -gx * s, -gy * s, np.ones_like(H)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    nrm = np.stack([nx / ln * .5 + .5, ny / ln * .5 + .5, nz / ln * .5 + .5, np.ones_like(H)], -1)
    shade = 1 + 0.045 * rng.normal(0, 1, 4096).astype(np.float32)[ids] + 0.03 * noise
    base = 0.028 * shade * (0.75 + 0.25 * groove)
    col = np.stack([base, base * 1.03, base * 1.08, np.ones_like(H)], -1)
    rough = np.clip(0.62 + 0.08 * rng.normal(0, 1, 4096).astype(np.float32)[ids] + 0.15 * (1 - groove), 0, 1)
    orm = np.stack([0.55 + 0.45 * groove, rough, np.zeros_like(H), np.ones_like(H)], -1)
    out = {}
    for name, arr, cs in (('k278_plitki_normal', nrm, 'Non-Color'), ('k278_plitki_cvet', col, 'sRGB'), ('k278_plitki_orm', orm, 'Non-Color')):
        im = bpy.data.images.new(name, n, n, alpha=False, float_buffer=False)
        im.colorspace_settings.name = cs
        a = arr.astype(np.float32)
        if cs == 'sRGB':   # линейный цвет → sRGB для 8-битного изображения
            a[..., :3] = np.where(a[..., :3] <= 0.0031308, a[..., :3] * 12.92, 1.055 * np.power(a[..., :3], 1 / 2.4) - 0.055)
        im.pixels.foreach_set(a[::-1].ravel())
        im.file_format = 'JPEG'
        out[name] = im
    return out


def mat_rezina(tx):
    m = bpy.data.materials.new('rezina_pokrytie')
    m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bs = N['Principled BSDF']
    t_c = N.new('ShaderNodeTexImage'); t_c.image = tx['k278_plitki_cvet']
    t_o = N.new('ShaderNodeTexImage'); t_o.image = tx['k278_plitki_orm']
    t_n = N.new('ShaderNodeTexImage'); t_n.image = tx['k278_plitki_normal']
    sep = N.new('ShaderNodeSeparateColor')
    nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = 1.0
    Lk.new(t_c.outputs['Color'], bs.inputs['Base Color'])
    Lk.new(t_o.outputs['Color'], sep.inputs['Color'])
    Lk.new(sep.outputs['Green'], bs.inputs['Roughness'])
    Lk.new(sep.outputs['Blue'], bs.inputs['Metallic'])
    Lk.new(t_n.outputs['Color'], nm.inputs['Color'])
    Lk.new(nm.outputs['Normal'], bs.inputs['Normal'])
    bs.inputs['Specular IOR Level'].default_value = 0.45
    return m


def mat_prosto(name, col, metal, rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bs = m.node_tree.nodes['Principled BSDF']
    bs.inputs['Base Color'].default_value = (*col, 1)
    bs.inputs['Metallic'].default_value = metal
    bs.inputs['Roughness'].default_value = rough
    return m


# ---------- сетки ----------
def mesh_obj(name, verts, faces, uvs=None, mat=None, smooth=True):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    if uvs is not None:
        ul = me.uv_layers.new(name='UVMap')
        k = 0
        for f, fu in zip(me.polygons, uvs):
            for li, uv in zip(f.loop_indices, fu):
                ul.data[li].uv = uv
    me.validate()
    if smooth:
        me.shade_smooth()
    if mat:
        me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


def uv_world(verts, f, axes=(0, 2)):
    return [(verts[i][axes[0]] / TILE, verts[i][axes[1]] / TILE) for i in f]


def korpus(mat):
    xs = list(np.linspace(0, LT, 70)) + list(np.linspace(LT, L - LB, 50)[1:]) + \
        [L - LB + LB * math.sin(a) for a in np.linspace(0, math.pi / 2, 60)[1:-1]]
    NS = 160
    V, F, U = [], [], []
    for x in xs:
        r = r_of(x)
        for j in range(NS):
            a = -math.pi / 2 + 2 * math.pi * j / NS
            V.append((x, r * math.cos(a), r * math.sin(a)))
    nr = len(xs)
    rep = 4  # плиток по окружности: 4 повтора текстуры (≈ 0,52 м ряд)
    for i in range(nr - 1):
        for j in range(NS):
            j1 = (j + 1) % NS
            F.append((i * NS + j, i * NS + j1, (i + 1) * NS + j1, (i + 1) * NS + j))
            U.append([(xs[i] / TILE, rep * j / NS), (xs[i] / TILE, rep * (j + 1) / NS),
                      (xs[i + 1] / TILE, rep * (j + 1) / NS), (xs[i + 1] / TILE, rep * j / NS)])
    tip = len(V); V.append((L, 0, 0))
    for j in range(NS):
        j1 = (j + 1) % NS; b = (nr - 1) * NS
        F.append((b + j, b + j1, tip)); U.append([(xs[-1] / TILE, rep * j / NS), (xs[-1] / TILE, rep * (j + 1) / NS), (L / TILE, rep * (j + .5) / NS)])
    return mesh_obj('korpus', V, F, U, mat)


def naca(s, t=0.12):
    s = min(max(s, 0.0), 1.0)
    return 5 * t * (0.2969 * math.sqrt(s) - 0.1260 * s - 0.3516 * s * s + 0.2843 * s ** 3 - 0.1036 * s ** 4)


def ograzhdenie(mat):
    """Ограждение выдвижных устройств (рубка). Длина, высота, ширина — допущение по пропорциям лодок «Рубина» того поколения."""
    xc, LF, HF, WF = 74.0, 21.0, 5.6, 3.4
    M = 72
    ss = [0.5 - 0.5 * math.cos(math.pi * k / (M // 2)) for k in range(M // 2 + 1)]
    hs = [-1.4, -0.35, 0.0, 0.25] + [0.25 + (HF - 0.25) * math.sin(math.pi / 2 * k / 14) for k in range(1, 15)]
    V, F, U = [], [], []
    rings = []
    for h in hs:
        u = max(0.0, h) / HF
        xF = xc + LF / 2 - 1.8 * u ** 2.2
        xR = xc - LF / 2 + 7.5 * u ** 1.6
        wf = 1.0
        if h < 0.25:   # галтель к корпусу
            k = (0.25 - h) / 1.65
            xF += 2.2 * k; xR -= 1.2 * k; wf = 1 + 0.55 * math.sqrt(k)
        rt = 0.9
        if h > HF - rt:
            wf *= math.sqrt(max(0.0, 1 - ((h - (HF - rt)) / rt) ** 2)) * 0.97 + 0.03
        ring = []
        pts = [(s, +1) for s in ss] + [(s, -1) for s in reversed(ss[1:-1])]
        for s, sg in pts:
            x = xF - s * (xF - xR)
            y = sg * WF / 2 * wf * (naca(s, 0.24) / 0.12) * 1.0
            ring.append(len(V)); V.append((x, y, R + h))
        rings.append(ring)
    n = len(rings[0])
    for a, b in zip(rings[:-1], rings[1:]):
        for j in range(n):
            j1 = (j + 1) % n
            f = (a[j], a[j1], b[j1], b[j]); F.append(f); U.append(uv_world(V, f))
    top = rings[-1]; h2 = M // 2
    for k in range(h2 - 1):  # крышка: верх ↔ низ
        f = (top[k], top[k + 1], top[(n - k - 1) % n], top[(n - k) % n] if k else top[0])
        if k == 0:
            f = (top[0], top[1], top[n - 1])
        F.append(f); U.append(uv_world(V, f, (0, 1)))
    f = (top[h2 - 1], top[h2], top[h2 + 1]); F.append(f); U.append(uv_world(V, f, (0, 1)))
    return mesh_obj('ograzhdenie', V, F, U, mat)


def krylo(name, mat, root, span_dir, thick_dir, span, c_root, c_tip, sweep, s0=0.0, s1=1.0, tc=0.12, K=10, M=28, cap=True):
    """Рулевая поверхность: root — передняя кромка у корня; хорда вдоль −X."""
    root, sd, td = Vector(root), Vector(span_dir).normalized(), Vector(thick_dir).normalized()
    ss = [s0 + (s1 - s0) * (0.5 - 0.5 * math.cos(math.pi * k / M)) for k in range(M + 1)]
    V, F, U, rings = [], [], [], []
    for k in range(K + 1):
        u = k / K
        sp = span * u
        c = c_root + (c_tip - c_root) * u
        if cap and u > 0.85:
            c *= 0.75 + 0.25 * math.sqrt(max(0, 1 - ((u - .85) / .15) ** 2))
        le = root + sd * sp + Vector((-sweep * u, 0, 0))
        ring = []
        for s, sg in [(s, 1) for s in ss] + [(s, -1) for s in reversed(ss[1:-1])]:
            p = le + Vector((-s * c, 0, 0)) + td * (sg * c * naca(s, tc) * (1 if not cap or u < .95 else 0.6))
            ring.append(len(V)); V.append(tuple(p))
        rings.append(ring)
    n = len(rings[0])
    axes = (0, 2) if abs(td.z) < 0.5 else (0, 1)
    for a, b in zip(rings[:-1], rings[1:]):
        for j in range(n):
            j1 = (j + 1) % n
            f = (a[j], a[j1], b[j1], b[j]); F.append(f); U.append(uv_world(V, f, axes if abs(td.z) < .5 else (0, 1)))
    c0 = len(V); V.append(tuple(sum((Vector(V[i]) for i in rings[-1]), Vector()) / n))
    for j in range(n):
        f = (rings[-1][j], rings[-1][(j + 1) % n], c0); F.append(f); U.append(uv_world(V, f, (0, 1)))
    return mesh_obj(name, V, F, U, mat)


def telo_vrashcheniya(name, mat, x0, x1, rmax, yc=0.0, zc=0.0, NS=48, K=40, nose=0.35, tail=0.45):
    """Капсула/обтекатель: x1 — нос (впереди), x0 — хвост."""
    V, F, U = [], [], []
    xs = [x0 + (x1 - x0) * (0.5 - 0.5 * math.cos(math.pi * k / K)) for k in range(K + 1)]
    Lc = x1 - x0
    for x in xs:
        t = (x - x0) / Lc
        if t > 1 - nose:
            q = (1 - t) / nose; r = rmax * (1 - (1 - q) ** 2.2) ** (1 / 2.2)
        elif t < tail:
            q = t / tail; r = rmax * (0.18 + 0.82 * (1 - (1 - q) ** 2))
        else:
            r = rmax
        for j in range(NS):
            a = 2 * math.pi * j / NS
            V.append((x, yc + r * math.cos(a), zc + r * math.sin(a)))
    for i in range(K):
        for j in range(NS):
            j1 = (j + 1) % NS
            F.append((i * NS + j, i * NS + j1, (i + 1) * NS + j1, (i + 1) * NS + j))
            U.append([(xs[i] / TILE, j / NS), (xs[i] / TILE, (j + 1) / NS), (xs[i + 1] / TILE, (j + 1) / NS), (xs[i + 1] / TILE, j / NS)])
    for end, xx in ((0, x0), (K, x1)):
        c = len(V); V.append((xx, yc, zc))
        for j in range(NS):
            j1 = (j + 1) % NS
            f = (end * NS + j1, end * NS + j, c) if end == 0 else (end * NS + j, end * NS + j1, c)
            F.append(f); U.append([(0, 0)] * 3)
    return mesh_obj(name, V, F, U, mat)


def vint(name, mat, xp, yc, zc, Dp, r0, nb, pitch, cmax, skew, rake=0.15, K=16, M=26):
    """Гребной винт: nb саблевидных лопастей (число лопастей — допущение)."""
    Rp = Dp / 2
    V, F = [], []
    for b in range(nb):
        th0 = 2 * math.pi * b / nb
        rings = []
        for k in range(K + 1):
            u = k / K
            rho = r0 * 0.85 + (Rp - r0 * 0.85) * u
            c = cmax * (0.55 + 0.45 * math.sin(math.pi * min(1.0, 0.25 + u))) * math.sqrt(max(0.0, 1 - u ** 3)) + 0.02
            t = 0.10 * cmax * (1 - 0.85 * u) + 0.01
            phi = math.atan2(pitch, 2 * math.pi * rho)
            ths = th0 + skew * u ** 2
            ring = []
            for m in range(M):
                w = 2 * math.pi * m / M
                xi = 0.5 * c * math.cos(w)
                eta = 0.5 * t * math.sin(w) * (1 - 0.4 * math.cos(w))
                ax = xi * math.sin(phi) + eta * math.cos(phi) - rake * u * Rp * 0.3
                arc = xi * math.cos(phi) - eta * math.sin(phi)
                al = ths + arc / rho
                ring.append(len(V)); V.append((xp + ax, yc + rho * math.cos(al), zc + rho * math.sin(al)))
            rings.append(ring)
        for a, bb in zip(rings[:-1], rings[1:]):
            for j in range(M):
                j1 = (j + 1) % M
                F.append((a[j], a[j1], bb[j1], bb[j]))
        c0 = len(V); V.append(tuple(sum((Vector(V[i]) for i in rings[-1]), Vector()) / M))
        for j in range(M):
            F.append((rings[-1][j], rings[-1][(j + 1) % M], c0))
    ob = mesh_obj(name, V, F, None, mat)
    return ob


def plashki(name, mat, items, off=0.02):
    """Тёмные вырезы на поверхности корпуса (шпигаты, щиты ТА): items — (x, угол, длина, высота в м)."""
    V, F = [], []
    for x, a0, dl, dh in items:
        n_seg = 4
        base = len(V)
        for ix in range(n_seg + 1):
            xx = x - dl / 2 + dl * ix / n_seg
            r = r_of(xx) + off
            for ia in range(2):
                a = a0 + (ia - .5) * dh / max(r, .5)
                V.append((xx, r * math.cos(a), r * math.sin(a)))
        for ix in range(n_seg):
            F.append((base + 2 * ix, base + 2 * ix + 2, base + 2 * ix + 3, base + 2 * ix + 1))
    return mesh_obj(name, V, F, None, mat)


def stroit():
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob)
    tx = tex_plitki()
    m_r = mat_rezina(tx)
    m_bronza = mat_prosto('bronza_vint', (0.78, 0.55, 0.34), 1.0, 0.26)
    m_stal = mat_prosto('stal', (0.55, 0.56, 0.58), 1.0, 0.35)
    m_dyra = mat_prosto('shpigat_temnyj', (0.002, 0.002, 0.002), 0.0, 0.9)
    parts = []
    parts.append(korpus(m_r))
    parts.append(ograzhdenie(m_r))
    # кормовое оперение: крест; на концах горизонтальных — капсулы с запасными винтами (deepstorm: «на концах
    # горизонтального оперения, в двух водонепроницаемых капсулах находились электродвигатели по 300 кВт»)
    xle, cr, ct, sw = 15.0, 9.0, 6.0, 2.2
    rr = r_of(xle - 4)
    y_pod = RAZMERY['SPAN'] / 2 - 0.62
    for sg in (1, -1):
        sp = y_pod - (rr - 0.6)
        parts.append(krylo(f'stabilizator_{sg}', m_r, (xle, sg * (rr - 0.6), 0), (0, sg, 0), (0, 0, 1), sp, cr, ct, sw, 0.0, 0.66, 0.11, cap=False))
        parts.append(krylo(f'rul_glubiny_{sg}', m_r, (xle - 0.12, sg * (rr - 0.6), 0), (0, sg, 0), (0, 0, 1), sp - 0.3, cr, ct, sw, 0.68, 1.0, 0.11, cap=False))
        parts.append(telo_vrashcheniya(f'kapsula_{sg}', m_r, xle - 9.6, xle + 1.6, 0.62, yc=sg * y_pod))
        parts.append(vint(f'vint_kapsuly_{sg}', m_bronza, xle - 10.0, sg * y_pod, 0, 1.5, 0.16, 5, 1.2, 0.42, 0.5))
        parts.append(telo_vrashcheniya(f'obtekatel_vinta_{sg}', m_stal, xle - 10.5, xle - 9.55, 0.17, yc=sg * y_pod, nose=0.2, tail=0.8))
    parts.append(krylo('kil_verh', m_r, (xle + 0.5, 0, rr - 0.6), (0, 0, 1), (0, 1, 0), 7.2 - rr, cr, ct, sw * 1.4, 0.0, 0.66, 0.11))
    parts.append(krylo('rul_napr_verh', m_r, (xle + 0.5 - 0.12, 0, rr - 0.6), (0, 0, 1), (0, 1, 0), 7.0 - rr, cr, ct, sw * 1.4, 0.68, 1.0, 0.11))
    parts.append(krylo('kil_niz', m_r, (xle + 0.5, 0, -(rr - 0.6)), (0, 0, -1), (0, 1, 0), 6.0 - rr, cr, ct, sw * 1.4, 0.0, 0.66, 0.11))
    parts.append(krylo('rul_napr_niz', m_r, (xle + 0.5 - 0.12, 0, -(rr - 0.6)), (0, 0, -1), (0, 1, 0), 5.8 - rr, cr, ct, sw * 1.4, 0.68, 1.0, 0.11))
    # носовые горизонтальные рули — выдвижные (deepstorm), здесь выдвинуты; размер — допущение
    for sg in (1, -1):
        parts.append(krylo(f'nos_rul_{sg}', m_r, (L - 12.0, sg * (r_of(L - 13) - 0.4), 0.8), (0, sg, 0), (0, 0, 1), 3.0, 2.6, 1.8, 0.6, 0.0, 1.0, 0.12))
    # главный винт: одновальная (Общество памяти); 7 лопастей, Ø 5,6 м — допущение
    parts.append(telo_vrashcheniya('stupica', m_bronza, -3.6, 0.6, RH + 0.02, nose=0.05, tail=0.9, NS=64))
    parts.append(vint('vint_glavnyj', m_bronza, -1.3, 0, 0, 5.6, RH, 7, 6.5, 2.3, 0.7))
    # шпигаты со щитовыми закрытиями (deepstorm) — ряды тёмных прорезей; шаг и размер — допущение
    it = []
    for sg in (1, -1):
        for x in np.arange(44.0, 99.0, 1.55):
            it.append((x, sg * math.radians(18) if sg > 0 else math.pi - math.radians(18), 0.85, 0.20))
        for x in np.arange(52.0, 92.0, 2.4):
            it.append((x, math.radians(-12) if sg > 0 else math.pi + math.radians(12), 1.1, 0.16))
    parts.append(plashki('shpigaty', m_dyra, it))
    # ниши торпедных аппаратов со щитами (deepstorm: 6 ТА 533 мм) — по 3 на борт, тёмный контур
    it = []
    for sg in (1, -1):
        for k, a in enumerate((14, 2, -10)):
            ang = math.radians(a) if sg > 0 else math.pi - math.radians(a)
            x = L - 8.0 - 0.6 * k
            for dx, dh, dl in ((-0.85, 0.95, 0.07), (0.85, 0.95, 0.07)):
                it.append((x + dx, ang, dl, dh))
            for da in (-0.45, 0.45):
                it.append((x, ang + da / R, 1.75, 0.06))
    parts.append(plashki('shchity_ta', m_dyra, it, off=0.025))
    root = bpy.data.objects.new('K-278_Komsomolec', None)
    bpy.context.collection.objects.link(root)
    for p in parts:
        p.parent = root
    return root, parts


# ---------- сцена: тёмный фон, контровой свет ----------
def svet_i_scena(w, h, samples):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.02
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception:
        pass
    sc.cycles.max_bounces = 6
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.view_settings.view_transform = 'AgX'
    try:
        sc.view_settings.look = 'AgX - Punchy'
    except Exception:
        pass
    sc.view_settings.exposure = 0.0
    world = bpy.data.worlds.new('W'); sc.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (0.0025, 0.003, 0.0045, 1)
    bg.inputs['Strength'].default_value = 1.0
    # пол: чёрное зеркало с размытием, как у предметной съёмки
    bpy.ops.mesh.primitive_plane_add(size=2000, location=(L / 2, 0, -R - 4.5))
    fl = bpy.context.object; fl.name = 'pol'
    fm = mat_prosto('pol', (0.002, 0.002, 0.0025), 0.0, 0.3); fl.data.materials.append(fm)

    def area(name, loc, rot_to, size, size_y, energy, col):
        ld = bpy.data.lights.new(name, 'AREA'); ld.shape = 'RECTANGLE'
        ld.size, ld.size_y, ld.energy, ld.color = size, size_y, energy, col
        try:
            ld.spread = math.radians(50)
        except Exception:
            pass
        ob = bpy.data.objects.new(name, ld); sc.collection.objects.link(ob)
        ob.location = loc
        d = Vector(rot_to) - Vector(loc)
        ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        return ob
    c = (L / 2, 0, 0)
    area('kontr_levyj', (L / 2 + 10, 70, 38), c, 140, 8, 9.0e4, (0.82, 0.90, 1.0))
    area('kontr_pravyj', (L / 2 - 10, -75, 30), c, 140, 8, 6.0e4, (0.85, 0.92, 1.0))
    area('verh_softboks', (L / 2, 0, 90), c, 120, 40, 5.0e3, (1.0, 0.97, 0.92))
    area('zapolnenie', (L / 2 + 20, -40, -2), c, 60, 30, 8.0e2, (1.0, 0.9, 0.8))
    cam_d = bpy.data.cameras.new('kamera'); cam_d.lens = 50; cam_d.clip_end = 3000
    cam_d.dof.use_dof = False
    cam = bpy.data.objects.new('kamera', cam_d); sc.collection.objects.link(cam); sc.camera = cam
    return cam


def navesti(cam, pos, tgt, lens=50):
    cam.location = pos
    cam.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = lens


SNIMKI = [  # имя, камера, цель, объектив
    ('1-geroj',  (L + 38, -62, 14), (L * 0.55, 0, 1.5), 38),
    ('2-profil', (L / 2 + 4, -175, 2), (L / 2 - 2, 0, 0.5), 50),
    ('3-korma',  (-26, -24, 7), (9, 0, 0.5), 32),
    ('4-rubka-shvy', (L * 0.66 + 26, -20, 15), (74, 0, 5.5), 45),
]

# облёт 18 с: ключевые точки (с, камера, цель, объектив) — сплайн Катмулла — Рома
OBLET = [
    (0.0, (L + 70, -80, 10), (L * 0.55, 0, 0), 40),
    (4.0, (L * 0.75, -60, 9), (L * 0.6, 0, 3), 36),
    (8.0, (L * 0.3, -42, 6), (30, 0, 2), 34),
    (11.0, (-20, -30, 4), (8, 0, 0), 30),
    (13.5, (-30, 22, 14), (10, 0, 1), 30),
    (16.0, (20, 52, 30), (55, 0, 3), 34),
    (18.0, (L * 0.55, 70, 34), (L * 0.6, 0, 2), 38),
]
DUR, FPS = 18.0, 30


def cr(p0, p1, p2, p3, t):
    p0, p1, p2, p3 = map(Vector, (p0, p1, p2, p3))
    t2, t3 = t * t, t * t * t
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)


def oblet(tsec):
    ts = [k[0] for k in OBLET]
    i = max(0, min(len(ts) - 2, sum(1 for t in ts if t <= tsec) - 1))
    u = (tsec - ts[i]) / (ts[i + 1] - ts[i])
    u = u * u * (3 - 2 * u) * 0.35 + u * 0.65   # мягче на ключах
    g = lambda j: OBLET[max(0, min(len(OBLET) - 1, j))]
    pos = cr(g(i - 1)[1], g(i)[1], g(i + 1)[1], g(i + 2)[1], u)
    tgt = cr(g(i - 1)[2], g(i)[2], g(i + 1)[2], g(i + 2)[2], u)
    lens = g(i)[3] + (g(i + 1)[3] - g(i)[3]) * u
    return pos, tgt, lens


def main():
    root, parts = stroit()
    if MODE == 'glb':
        out = A[1]
        bpy.ops.object.select_all(action='DESELECT')
        for p in parts + [root]:
            p.select_set(True)
        bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_image_format='JPEG',
                                  export_jpeg_quality=88, export_apply=True, export_tangents=False, export_yup=True)
        for p in parts:
            p.data.calc_loop_triangles()
        tri = sum(len(p.data.loop_triangles) for p in parts)
        print('GLB', out, os.path.getsize(out), 'байт, треугольников', tri)
        return
    w, h, smp = (int(A[-3]), int(A[-2]), int(A[-1])) if len(A) >= (5 if MODE == 'snimki' else 7) else (1920, 1080, 96)
    cam = svet_i_scena(w, h, smp)
    vg = [p for p in parts if p.name == 'vint_glavnyj'][0]
    vk = [p for p in parts if p.name.startswith('vint_kapsuly')]
    sc = bpy.context.scene
    if MODE == 'snimki':
        d = A[1]; os.makedirs(d, exist_ok=True)
        only = os.environ.get('ONLY')
        for name, pos, tgt, lens in SNIMKI:
            if only and only not in name:
                continue
            navesti(cam, pos, tgt, lens)
            sc.render.filepath = os.path.join(d, f'{name}.png')
            bpy.ops.render.render(write_still=True)
    elif MODE == 'kadry':
        d, a, b = A[1], int(A[2]), int(A[3]); os.makedirs(d, exist_ok=True)
        for f in range(a, b + 1):
            t = f / FPS
            pos, tgt, lens = oblet(t)
            navesti(cam, pos, tgt, lens)
            vg.rotation_euler = (t * 2 * math.pi * 0.25, 0, 0)  # винт медленно крутится (вокруг оси X)
            sc.render.filepath = os.path.join(d, f'f{f:05d}.png')
            bpy.ops.render.render(write_still=True)


main()
