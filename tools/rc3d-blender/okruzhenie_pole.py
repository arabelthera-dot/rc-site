# Окружение поля Салюзи 1912 (игра «Котельников, РК-1»): ель, берёза, изба-сруб. Процедурно, без текстур.
# blender -b --factory-startup --python okruzhenie_pole.py → out/el.glb, out/beryoza.glb, out/izba.glb
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out'); os.makedirs(OUT, exist_ok=True)
def reset(): bpy.ops.wm.read_factory_settings(use_empty=True)
def M(name, col, rough=0.9):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; return m
def obj(bm, mats, name):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(m)
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    for p in me.polygons: p.use_smooth = False
    return o
def cyl(bm, p0, p1, r0, r1, seg, mi):
    d = Vector(p1) - Vector(p0); L = d.length; q = Vector((0, 0, 1)).rotation_difference(d.normalized())
    ring = lambda c, r: [bm.verts.new(Vector(c) + q @ Vector((math.cos(a) * r, math.sin(a) * r, 0))) for a in [i * 2 * math.pi / seg for i in range(seg)]]
    A = ring(p0, r0); B = ring(p1, r1)
    for i in range(seg):
        f = bm.faces.new((A[i], A[(i + 1) % seg], B[(i + 1) % seg], B[i])); f.material_index = mi
    for R in (A, B):
        f = bm.faces.new(R if R is B else R[::-1]); f.material_index = mi
def save(path):
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True)
# Blender: Z вверх. ── Ель: ствол + 11 ярусов свисающих лап (зубчатые «юбки» с провисом), неровные ── 
def el():
    reset(); random.seed(3); bm = bmesh.new(); kora = M('kora', (0.22, 0.15, 0.1)); hvoya = M('hvoya', (0.07, 0.16, 0.08), 0.95); hv2 = M('hvoya2', (0.1, 0.21, 0.1), 0.95)
    cyl(bm, (0, 0, 0), (0, 0, 13), 0.28, 0.04, 8, 0)
    tiers = 12
    for t in range(tiers):
        z = 1.6 + t * 0.95; R = 3.2 * (1 - t / tiers) ** 1.05 + 0.25; n = 9 + (tiers - t) // 2
        c = bm.verts.new((0, 0, z + 0.55))
        pts = []
        for i in range(n * 2):
            a = i * math.pi / n + random.uniform(-0.12, 0.12); r = R * (1.0 if i % 2 == 0 else 0.55) * random.uniform(0.85, 1.12)
            pts.append(bm.verts.new((math.cos(a) * r, math.sin(a) * r, z - (0.55 if i % 2 == 0 else 0.15) * R / 3 + random.uniform(-0.1, 0.1))))
        for i in range(len(pts)):
            f = bm.faces.new((c, pts[i], pts[(i + 1) % len(pts)])); f.material_index = 1 + (t % 2)
        # нижняя сторона лап, чтобы ярус не был «зонтиком» на просвет
        c2 = bm.verts.new((0, 0, z - 0.2))
        for i in range(len(pts)):
            f = bm.faces.new((c2, pts[(i + 1) % len(pts)], pts[i])); f.material_index = 1
    obj(bm, [kora, hvoya, hv2], 'el'); save(os.path.join(OUT, 'el.glb'))
# ── Берёза: белый ствол с тёмными поясами, ветви, крона из рыхлых комков (неправильные икосферы) ──
def beryoza():
    reset(); random.seed(5); bm = bmesh.new(); bel = M('beresta', (0.82, 0.8, 0.74)); tem = M('cherny', (0.12, 0.11, 0.1)); list_ = M('listva', (0.24, 0.36, 0.12), 0.95); l2 = M('listva2', (0.33, 0.43, 0.15), 0.95)
    H = 11; segs = 7; prev = (0, 0, 0)
    for i in range(segs):
        nxt = (random.uniform(-0.15, 0.15), random.uniform(-0.15, 0.15), H * (i + 1) / segs)
        cyl(bm, prev, nxt, 0.2 * (1 - i / segs) + 0.04, 0.2 * (1 - (i + 1) / segs) + 0.04, 7, 0 if i % 2 == 0 or i > 3 else 1); prev = nxt
    for k in range(9):
        a = k * 2.4; z = 4.5 + k * 0.6; e = (math.cos(a) * 2.2, math.sin(a) * 2.2, z + 1.4)
        cyl(bm, (0, 0, z), e, 0.07, 0.02, 5, 0)
    for k in range(14):
        a = random.uniform(0, 6.28); r = random.uniform(0.5, 2.6); z = random.uniform(5.5, 11.5); s = random.uniform(1.0, 1.7) * (1.2 - (z - 5.5) / 12)
        res = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=s)
        for v in res['verts']:
            v.co = Vector((v.co.x * random.uniform(0.8, 1.2), v.co.y * random.uniform(0.8, 1.2), v.co.z * 0.75 * random.uniform(0.8, 1.2))) + Vector((math.cos(a) * r, math.sin(a) * r, z))
        for f in {f for v in res['verts'] for f in v.link_faces}: f.material_index = 2 + k % 2
    obj(bm, [bel, tem, list_, l2], 'beryoza'); save(os.path.join(OUT, 'beryoza.glb'))
# ── Изба: сруб из брёвен «в обло» с выпусками на углах, двускатная тёсовая крыша, окно с наличником ──
def izba():
    reset(); bm = bmesh.new(); brevno = M('brevno', (0.42, 0.31, 0.2)); torec = M('torec', (0.55, 0.42, 0.27)); tes = M('tes', (0.33, 0.29, 0.24)); okno = M('steklo', (0.05, 0.06, 0.07), 0.2); nal = M('nalichnik', (0.75, 0.7, 0.6))
    W, Dp, r, rows = 6.0, 5.0, 0.13, 12; ov = 0.35
    for i in range(rows):
        z = r + i * 2 * r * 0.92
        sh = 0 if i % 2 == 0 else r * 0.9
        for y in (-Dp / 2, Dp / 2):
            cyl(bm, (-W / 2 - ov, y, z + sh * 0), (W / 2 + ov, y, z), r, r, 8, 0)
        for x in (-W / 2, W / 2):
            cyl(bm, (x, -Dp / 2 - ov, z + r * 0.92), (x, Dp / 2 + ov, z + r * 0.92), r, r, 8, 0)
    Hw = r + rows * 2 * r * 0.92
    # фронтоны (треугольники из брёвен по торцам x = ±W/2)
    rh = 2.2
    for x in (-W / 2, W / 2):
        a = bm.verts.new((x, -Dp / 2, Hw)); b = bm.verts.new((x, Dp / 2, Hw)); c = bm.verts.new((x, 0, Hw + rh))
        f = bm.faces.new((a, b, c) if x > 0 else (b, a, c)); f.material_index = 0
    # крыша: тёс досками, свес
    over = 0.6; boards = 14
    for s in (-1, 1):
        for k in range(boards):
            x0 = -W / 2 - over + k * (W + 2 * over) / boards; x1 = x0 + (W + 2 * over) / boards * 0.96
            dz = 0.02 * (k % 2)
            p = [(x0, s * (Dp / 2 + over), Hw - over * rh / (Dp / 2) + dz), (x1, s * (Dp / 2 + over), Hw - over * rh / (Dp / 2) + dz), (x1, 0, Hw + rh + 0.05 + dz), (x0, 0, Hw + rh + 0.05 + dz)]
            vs = [bm.verts.new(q) for q in p]; vt = [bm.verts.new((q[0], q[1], q[2] + 0.05)) for q in p]
            f = bm.faces.new(vt if s > 0 else vt[::-1]); f.material_index = 2
            f = bm.faces.new(vs[::-1] if s > 0 else vs); f.material_index = 2
    # окно с наличником на длинной стене (y = +D/2) и на торце
    def window(cx, cy, cz, nx):
        w, h = 0.7, 0.85
        def box(c, sx, sy, sz, mi):
            res = bmesh.ops.create_cube(bm, size=1)
            for v in res['verts']: v.co = Vector((v.co.x * sx + c[0], v.co.y * sy + c[1], v.co.z * sz + c[2]))
            for f in {f for v in res['verts'] for f in v.link_faces}: f.material_index = mi
        t = 0.3
        if nx: box((cx, cy, cz), t, w, h, 3); box((cx + 0.05 * (1 if cx > 0 else -1), cy, cz + h / 2 + 0.12), t, w + 0.4, 0.22, 4); box((cx + 0.05 * (1 if cx > 0 else -1), cy, cz - h / 2 - 0.08), t, w + 0.3, 0.1, 4)
        else:
            box((cx, cy, cz), w, t, h, 3); box((cx, cy, cz + h / 2 + 0.14), w + 0.4, t + 0.06, 0.26, 4); box((cx, cy, cz - h / 2 - 0.08), w + 0.3, t + 0.06, 0.1, 4)
            for sx in (-1, 1): box((cx + sx * (w / 2 + 0.07), cy, cz), 0.12, t + 0.06, h + 0.1, 4)
    window(-1.3, Dp / 2, 1.6, False); window(1.3, Dp / 2, 1.6, False); window(W / 2, 0, 1.6, True); window(-W / 2, 0, 1.6, True); window(-1.3, -Dp / 2, 1.6, False)
    o = obj(bm, [brevno, torec, tes, okno, nal], 'izba'); save(os.path.join(OUT, 'izba.glb'))
el(); beryoza(); izba()
