# Общая библиотека моделей rc3d для Blender 4.2 (запуск: blender -b --factory-startup --python <скрипт>.py).
# Геометрия считается в осях three.js (X — вперёд/вправо, Y — вверх, Z — к зрителю) и переводится в оси Blender
# при сборке меша; экспорт glTF (+Y вверх) возвращает те же оси. 1 единица = 1 метр.
# Builder копит примитивы по материалам; Builder.object() делает один меш с несколькими материалами
# (одна модель — мало вызовов отрисовки). UV — коробочная развёртка в метрах (tile — метров на плитку текстуры).
import bpy, math, os, random
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, 'tex')
OUT = os.path.join(HERE, 'out')
D = math.pi / 180


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def to_bl(p):   # three (x, y, z) → Blender (x, -z, y)
    return (p[0], -p[2], p[1])


# ── Материалы ──
_MATS = {}
def mat(name, color=(0.8, 0.8, 0.8), rough=0.6, metal=0.0, tex=None, normal=None, nstr=0.6, tile=1.0):
    """PBR-материал. tex/normal — файлы из tex/ (png). tile хранится для UV-развёртки."""
    if name in _MATS: return _MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes['Principled BSDF']
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    if len(color) == 3: color = (*color, 1)
    bsdf.inputs['Base Color'].default_value = color
    if tex:
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(TEX, tex), check_existing=True)
        nt.links.new(t.outputs['Color'], bsdf.inputs['Base Color'])
    if normal:
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(TEX, normal), check_existing=True)
        t.image.colorspace_settings.name = 'Non-Color'
        nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = nstr
        nt.links.new(t.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    m['tile'] = tile
    _MATS[name] = m
    return m


def hexc(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)   # sRGB → линейный


def V(*a):
    return Vector(a[0]) if len(a) == 1 else Vector(a)


def frame(d):
    """Ортонормированный базис (u, v, d) для направления d."""
    d = Vector(d).normalized(); a = Vector((0, 1, 0)) if abs(d.y) < 0.9 else Vector((1, 0, 0))
    u = d.cross(a).normalized(); v = u.cross(d).normalized()
    return u, v, d


class Builder:
    def __init__(self):
        self.parts = {}   # mat name → [verts, faces, smooth]

    def _p(self, m):
        if m.name not in self.parts: self.parts[m.name] = [[], [], m]
        return self.parts[m.name]

    def mesh(self, verts, faces, m):
        P = self._p(m); o = len(P[0]); P[0].extend(Vector(v) for v in verts); P[1].extend([tuple(i + o for i in f) for f in faces])

    # Трубка по ломаной (параллельный перенос рамки), r — число или список радиусов по точкам.
    def tube(self, pts, r, m, sides=8, caps=True, closed=False):
        pts = [Vector(p) for p in pts]; n = len(pts)
        rs = r if isinstance(r, (list, tuple)) else [r] * n
        verts, faces = [], []
        t0 = (pts[1] - pts[0]).normalized(); u, v, _ = frame(t0)
        for i in range(n):
            if closed: t = (pts[(i + 1) % n] - pts[i - 1]).normalized()
            else: t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
            u = (u - t * u.dot(t)).normalized(); v = t.cross(u).normalized()
            for k in range(sides):
                a = k / sides * 2 * math.pi
                verts.append(pts[i] + (u * math.cos(a) + v * math.sin(a)) * rs[i])
        segs = n if closed else n - 1
        for i in range(segs):
            j = (i + 1) % n
            for k in range(sides):
                k2 = (k + 1) % sides
                faces.append((i * sides + k, i * sides + k2, j * sides + k2, j * sides + k))
        if caps and not closed:
            faces.append(tuple(range(sides))[::-1]); faces.append(tuple((n - 1) * sides + k for k in range(sides)))
        self.mesh(verts, faces, m)

    def cyl(self, a, b, r, m, sides=8, r2=None, caps=True):
        self.tube([a, b], [r, r if r2 is None else r2], m, sides, caps)

    def lathe(self, prof, m, seg=24, M=Matrix(), caps=False):
        """prof — [(r, y)…] снизу вверх; ось вращения — локальная Y, M — матрица размещения."""
        verts, faces = [], []; n = len(prof)
        for k in range(seg):
            a = k / seg * 2 * math.pi
            for (r, y) in prof: verts.append(M @ Vector((r * math.cos(a), y, -r * math.sin(a))))
        for k in range(seg):
            k2 = (k + 1) % seg
            for i in range(n - 1): faces.append((k * n + i, k * n + i + 1, k2 * n + i + 1, k2 * n + i))
        self.mesh(verts, faces, m)

    def torus(self, c, R, r, m, axis=(0, 1, 0), seg=24, sides=8, arc=360):
        u, v, d = frame(axis); c = Vector(c); pts = []
        full = arc >= 360; N = seg if full else seg + 1
        for i in range(N):
            a = i / seg * arc * D; pts.append(c + (u * math.cos(a) + v * math.sin(a)) * R)
        self.tube(pts, r, m, sides, caps=not full, closed=full)

    def rbox(self, c, size, m, rad=0.01, rot=(0, 0, 0), n=3):
        """Коробка со скруглёнными рёбрами: c — центр, size — (x, y, z), rad — радиус скругления."""
        hx, hy, hz = size[0] / 2, size[1] / 2, size[2] / 2; rad = min(rad, hx, hy, hz) * 0.999
        R = Euler((rot[0] * D, rot[1] * D, rot[2] * D), 'XYZ').to_matrix(); c = Vector(c)
        # Куб из 6 сеток (n+2)×(n+2): крайние ряды — на скруглении.
        verts, faces, idx = [], [], {}
        g = [-1, -1 + 1e-3] + [(-1 + 2 * (i + 1) / (n + 1)) for i in range(n)] + [1 - 1e-3, 1]
        g = sorted(set(g))
        def vid(p):
            k = (round(p[0], 5), round(p[1], 5), round(p[2], 5))
            if k not in idx:
                x, y, z = p[0] * hx, p[1] * hy, p[2] * hz
                ix, iy, iz = max(-hx + rad, min(hx - rad, x)), max(-hy + rad, min(hy - rad, y)), max(-hz + rad, min(hz - rad, z))
                dv = Vector((x - ix, y - iy, z - iz))
                q = Vector((ix, iy, iz)) + (dv.normalized() * rad if dv.length > 1e-9 else dv)
                idx[k] = len(verts); verts.append(c + R @ q)
            return idx[k]
        for ax in range(3):
            for s in (-1, 1):
                for i in range(len(g) - 1):
                    for j in range(len(g) - 1):
                        def P(a, b):
                            p = [0, 0, 0]; p[ax] = s; p[(ax + 1) % 3] = a; p[(ax + 2) % 3] = b; return p
                        f = (vid(P(g[i], g[j])), vid(P(g[i + 1], g[j])), vid(P(g[i + 1], g[j + 1])), vid(P(g[i], g[j + 1])))
                        faces.append(f if s > 0 else f[::-1])
        self.mesh(verts, faces, m)

    def box(self, c, size, m, rot=(0, 0, 0)):
        hx, hy, hz = size[0] / 2, size[1] / 2, size[2] / 2
        R = Euler((rot[0] * D, rot[1] * D, rot[2] * D), 'XYZ').to_matrix(); c = Vector(c)
        vs = [c + R @ Vector((x * hx, y * hy, z * hz)) for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]
        fs = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
        self.mesh(vs, fs, m)

    def sphere(self, c, r, m, seg=12, rings=8, scale=(1, 1, 1)):
        prof = [(r * math.sin(i / rings * math.pi), -r * math.cos(i / rings * math.pi)) for i in range(rings + 1)]
        M = Matrix.Translation(Vector(c)) @ Matrix.Diagonal((*scale, 1))
        self.lathe(prof, m, seg, M)

    def object(self, name, smooth_angle=35, uv=True, recalc=True):
        """Один меш со всеми материалами. Возвращает объект Blender."""
        me = bpy.data.meshes.new(name); verts, faces, mats = [], [], []
        fm = []
        for k, (vs, fs, m) in enumerate(self.parts.values()):
            o = len(verts); verts.extend(to_bl(v) for v in vs); faces.extend(tuple(i + o for i in f) for f in fs); fm.extend([k] * len(fs)); mats.append(m)
        me.from_pydata(verts, [], faces); me.update(calc_edges=True)
        for m in mats: me.materials.append(m)
        for p, k in zip(me.polygons, fm): p.material_index = k
        if recalc:
            import bmesh
            bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
        if uv: box_uv(me)
        me.shade_smooth()
        if smooth_angle is not None: me.set_sharp_from_angle(angle=smooth_angle * D)
        ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
        return ob


def box_uv(me):
    """Коробочная развёртка в метрах: плитка = material['tile'] метров."""
    uvl = me.uv_layers.new(name='UVMap')
    for p in me.polygons:
        m = me.materials[p.material_index] if me.materials else None
        tile = m.get('tile', 1.0) if m else 1.0
        n = p.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            a, b = [co[i] for i in range(3) if i != ax]
            uvl.data[li].uv = (a / tile, b / tile)


def export(objs, name, anim=False):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    path = os.path.join(OUT, name + '.raw.glb')
    kw = dict(filepath=path, export_format='GLB', use_selection=True, export_yup=True, export_apply=not anim,
              export_image_format='WEBP', export_morph=True, export_morph_normal=True, export_animations=anim,
              export_texcoords=True, export_normals=True, export_extras=False, export_cameras=False, export_lights=False)
    if anim: kw.update(export_animation_mode='ACTIONS', export_force_sampling=False, export_optimize_animation_size=False)
    bpy.ops.export_scene.gltf(**kw)
    print('EXPORT', path, os.path.getsize(path))
    return path


def count_tris(objs):
    t = 0
    for o in objs:
        for p in o.data.polygons: t += len(p.vertices) - 2
    return t
