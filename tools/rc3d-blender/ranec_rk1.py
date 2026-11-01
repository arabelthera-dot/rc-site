# Ранец РК-1 (Котельников, 1911) для 3D-игры дня «Котельников, РК-1». Две модели (оси three.js, метры):
#   ranec-rk1.raw.glb   — корпус-лоток 0.30×0.40×0.15 (центр = объект 'ranec'), скруглённые рёбра, заклёпки по борту,
#                         внутренняя полка, упоры пружин, обрезки плечевых лямок и поясного ремня с пряжками;
#   kryshka-rk1.raw.glb — крышка 0.31×0.40 (центр = объект 'kryshka'), ребро жёсткости, заклёпки, петля сверху.
# Ид. игры не меняются: ranec / petlya / kryshka / pruzhina / kolco остаются в сцене (gen_kotelnikov.py).
# Запуск: ~/opt/blender/blender.sh -b --factory-startup --python ~/rc3d-proba/blender/ranec_rk1.py
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, numpy as np
from lib import *

reset(); random.seed(7)

# Металл: Poly Haven «metal_plate» (CC0, 1k) — некрашеная жесть/сталь, тёплый серый; цвет РК-1 в материалах
# проекта не указан, поэтому краска не выдумывается. Износ по рёбрам — маска (pointiness + AO) запекается в текстуру.
def metal_mat(name, tint=(1.0, 0.96, 0.9)):
    m = mat(name, rough=0.6, metal=0.85, tex='metal_plate_diff_1k.png', tile=0.35)
    nt = m.node_tree; bsdf = nt.nodes['Principled BSDF']
    r = nt.nodes.new('ShaderNodeTexImage'); r.image = bpy.data.images.load(os.path.join(TEX, 'metal_plate_rough_1k.png'), check_existing=True)
    r.image.colorspace_settings.name = 'Non-Color'; nt.links.new(r.outputs['Color'], bsdf.inputs['Roughness'])
    tex = [n for n in nt.nodes if n.type == 'TEX_IMAGE' and n.image.name.startswith('metal_plate_diff')][0]
    mul = nt.nodes.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs[0].default_value = 1
    nt.links.new(tex.outputs['Color'], mul.inputs[6]); mul.inputs[7].default_value = (*tint, 1)
    nt.links.new(mul.outputs[2], bsdf.inputs['Base Color'])
    return m

KR = metal_mat('metall_rk1')
KRI = mat('metall_vnutri', color=hexc('#77736c'), rough=0.7, metal=0.6)
ZAK = mat('zaklepka', color=hexc('#a7a49c'), rough=0.35, metal=1.0)
LAT = mat('pryazhka_stal', color=hexc('#b8b4aa'), rough=0.3, metal=1.0)
KOZ = mat('kozha_lyamok', rough=0.7, tex='kozha.png', normal='kozha_n.png', nstr=1.0, tile=0.25)
NIT = mat('nitka', color=hexc('#cdbf9c'), rough=0.9)
PRU = mat('pruzhina_stal', color=hexc('#6d7075'), rough=0.3, metal=1.0)

def bake_wear(ob, size=1024):
    """Запекает базовый цвет металла с износом по рёбрам (pointiness + обратный AO) в свою текстуру по 2-й UV."""
    me = ob.data; uv0 = me.uv_layers['UVMap']; uvb = me.uv_layers.new(name='bake')
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); me.uv_layers.active = uvb
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=66 * D, island_margin=0.004); bpy.ops.object.mode_set(mode='OBJECT')
    img = bpy.data.images.new(ob.name + '_bc', size, size)
    s = bpy.context.scene; s.render.engine = 'CYCLES'; s.cycles.samples = 16; s.cycles.device = 'CPU'
    keep = {}
    for m in me.materials:
        nt = m.node_tree; bsdf = nt.nodes['Principled BSDF']
        bc = bsdf.inputs['Base Color']; src = bc.links[0].from_socket if bc.links else None
        em = nt.nodes.new('ShaderNodeEmission'); out = nt.nodes['Material Output']
        uvn = nt.nodes.new('ShaderNodeUVMap'); uvn.uv_map = 'UVMap'
        for n in nt.nodes:
            if n.type == 'TEX_IMAGE': nt.links.new(uvn.outputs['UV'], n.inputs['Vector'])
        if m == KR:
            geo = nt.nodes.new('ShaderNodeNewGeometry'); ao = nt.nodes.new('ShaderNodeAmbientOcclusion'); ao.inputs['Distance'].default_value = 0.03
            nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 60; nz.inputs['Detail'].default_value = 8
            # кромка: pointiness > 0.5 → 1, плюс шум рвёт кромку
            pr = nt.nodes.new('ShaderNodeMapRange'); pr.inputs[1].default_value = 0.62; pr.inputs[2].default_value = 0.72
            nt.links.new(geo.outputs['Pointiness'], pr.inputs[0])
            nm = nt.nodes.new('ShaderNodeMath'); nm.operation = 'MULTIPLY'; nt.links.new(pr.outputs[0], nm.inputs[0])
            nr = nt.nodes.new('ShaderNodeMapRange'); nr.inputs[1].default_value = 0.42; nr.inputs[2].default_value = 0.58
            nt.links.new(nz.outputs['Fac'], nr.inputs[0]); nt.links.new(nr.outputs[0], nm.inputs[1])
            # в углах (низкий AO) — грязь
            dirt = nt.nodes.new('ShaderNodeMix'); dirt.data_type = 'RGBA'; dirt.blend_type = 'MULTIPLY'
            ai = nt.nodes.new('ShaderNodeMapRange'); ai.inputs[1].default_value = 0.4; ai.inputs[2].default_value = 1.0; ai.inputs[3].default_value = 0.55; ai.inputs[4].default_value = 1.0
            nt.links.new(ao.outputs['AO'], ai.inputs[0])
            nt.links.new(src, dirt.inputs[6]); nt.links.new(ai.outputs[0], dirt.inputs[7]); dirt.inputs[0].default_value = 1
            wear = nt.nodes.new('ShaderNodeMix'); wear.data_type = 'RGBA'
            nt.links.new(nm.outputs[0], wear.inputs[0]); nt.links.new(dirt.outputs[2], wear.inputs[6]); wear.inputs[7].default_value = (0.78, 0.76, 0.72, 1)
            nt.links.new(wear.outputs[2], em.inputs['Color'])
        elif src: nt.links.new(src, em.inputs['Color'])
        else: em.inputs['Color'].default_value = bc.default_value
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = img; nt.nodes.active = t
        keep[m.name] = (em, out.inputs['Surface'].links[0].from_socket, t)
        nt.links.new(em.outputs[0], out.inputs['Surface'])
    s.cycles.bake_type = 'EMIT'; bpy.ops.object.bake(type='EMIT', margin=4)
    img.filepath_raw = os.path.join(TEX, ob.name + '_bc.png'); img.file_format = 'PNG'; img.save()
    # металл: базовый цвет = запечённая текстура по UV 'bake'; нормаль/шершавость — плиткой по UVMap
    for m in me.materials:
        nt = m.node_tree; em, surf, t = keep[m.name]; out = nt.nodes['Material Output']
        nt.links.new(surf, out.inputs['Surface']); nt.nodes.remove(em)
        if m == KR:
            ub = nt.nodes.new('ShaderNodeUVMap'); ub.uv_map = 'bake'; nt.links.new(ub.outputs['UV'], t.inputs['Vector'])
            nt.links.new(t.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
        else: nt.nodes.remove(t)
    me.uv_layers.active = uv0; uv0.active_render = True

def remen(B, pts, side, w, th, m, shov=True, nit=NIT):
    """Плоский кожаный ремень по ломаной pts; side — направление ширины. Прошивка — стежки вдоль обеих кромок."""
    pts = [V(p) for p in pts]; side = V(side).normalized(); vs, fs = [], []
    fr = []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        sd = (side - t * side.dot(t)).normalized(); nn = t.cross(sd).normalized(); fr.append((p, t, sd, nn))
        for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1)): vs.append(p + sd * (a * w / 2) + nn * (b * th / 2))
    for i in range(len(pts) - 1):
        for k in range(4):
            k2 = (k + 1) % 4; fs.append((i * 4 + k, i * 4 + k2, (i + 1) * 4 + k2, (i + 1) * 4 + k))
    fs.append((3, 2, 1, 0)); n = len(pts) - 1; fs.append((n * 4, n * 4 + 1, n * 4 + 2, n * 4 + 3))
    B.mesh(vs, fs, m)
    if not shov: return
    for i in range(len(pts) - 1):   # стежки: короткие валики на обеих сторонах
        p0, t0, sd, nn = fr[i]; L = (pts[i + 1] - p0).length; k = int(L / 0.009)
        for j in range(k):
            c = p0 + (pts[i + 1] - p0) * ((j + 0.5) / max(k, 1))
            for a in (-1, 1):
                for b in (-1, 1):
                    q = c + sd * (a * (w / 2 - 0.0045)) + nn * (b * (th / 2 + 0.0004))
                    B.cyl(q - t0 * 0.0028, q + t0 * 0.0028, 0.0009, nit, sides=4, caps=False)

def pryazhka(B, c, t, side, w, m=LAT):
    """Рамочная пряжка поперёк ремня + язычок; c — центр, t — вдоль ремня, side — поперёк, нормаль наружу."""
    c, t, side = V(c), V(t).normalized(), V(side).normalized(); nn = t.cross(side).normalized(); h = 0.022; ww = w / 2 + 0.005
    cs = [c + side * a * ww + t * b * h / 2 + nn * 0.004 for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    for i in range(4): B.cyl(cs[i], cs[(i + 1) % 4], 0.0022, m, sides=8)
    B.cyl(c - side * ww + nn * 0.004, c + side * ww + nn * 0.004, 0.0018, m, sides=6)            # перекладина
    B.cyl(c + nn * 0.004, c + t * (h / 2 + 0.003) + nn * 0.0065, 0.0013, m, sides=6)             # язычок

# ── Корпус: лоток, открытый в сторону −Z (наружу от спины), крышка закрывает −Z ──
B = Builder(); W, H, Dp, t, r = 0.30, 0.40, 0.15, 0.012, 0.022
B.rbox((0, 0, Dp / 2 - t / 2), (W, H, t), KR, rad=0.006)                       # спинка (к лётчику)
for s in (-1, 1):
    B.rbox((s * (W / 2 - t / 2), 0, 0), (t, H, Dp), KR, rad=0.006)             # боковины
    B.rbox((0, s * (H / 2 - t / 2), 0), (W, t, Dp), KR, rad=0.006)             # верх/низ
for s in (-1, 1):
    for sy in (-1, 1): B.cyl(V(s * (W / 2 - r), sy * (H / 2 - r), -Dp / 2), V(s * (W / 2 - r), sy * (H / 2 - r), Dp / 2), r, KR, sides=12)  # скругление вертикальных рёбер
# отбортовка по краю проёма
for s in (-1, 1):
    B.box((s * (W / 2 - 0.004), 0, -Dp / 2 + 0.003), (0.012, H, 0.006), KR)
    B.box((0, s * (H / 2 - 0.004), -Dp / 2 + 0.003), (W, 0.012, 0.006), KR)
# внутри: полка и упоры пружин (сами пружины — объект 'pruzhina' сцены)
B.box((0, -0.01, -0.005), (W - 2 * t, 0.008, Dp - 2 * t), KRI)
for x in (-0.07, 0.07):
    for y in (0.06, -0.08): B.cyl(V(x, y, Dp / 2 - t), V(x, y, Dp / 2 - t - 0.006), 0.026, KRI, sides=12)
B.box((0, 0, Dp / 2 - t - 0.001), (W - 2 * t, H - 2 * t, 0.002), KRI)
# заклёпки по боковинам и верху/низу (видны снаружи и сзади)
for s in (-1, 1):
    for y in np.linspace(-0.17, 0.17, 7): B.sphere((s * (W / 2 + 0.0005), y, -0.045), 0.0055, ZAK, 8, 5, (0.5, 1, 1)); B.sphere((s * (W / 2 + 0.0005), y, 0.045), 0.0055, ZAK, 8, 5, (0.5, 1, 1))
    for x in np.linspace(-0.12, 0.12, 5): B.sphere((x, s * (H / 2 + 0.0005), 0), 0.0055, ZAK, 8, 5, (1, 0.5, 1))
# лямки: плоские кожаные ремни с прошивкой; плечевые — от спинки вверх и через плечо вперёд, нижние — вперёд под руку,
# поясной ремень — от боковин вперёд; стальные рамочные пряжки с язычком, кожаные шлёвки, заклёпки крепления
z0 = Dp / 2 + 0.004
for s in (-1, 1):
    x = s * 0.085
    remen(B, [(x, 0.10, z0), (x, 0.20, z0), (x, 0.235, z0 + 0.012), (x, 0.255, z0 + 0.045), (x, 0.258, z0 + 0.09), (x * 1.08, 0.245, z0 + 0.14)], (1, 0, 0), 0.042, 0.005, KOZ)
    pryazhka(B, (x, 0.13, z0 + 0.001), (0, 1, 0), (1, 0, 0), 0.042)
    remen(B, [(x, 0.115, z0 + 0.006), (x, 0.085, z0 + 0.006)], (1, 0, 0), 0.044, 0.003, KOZ, shov=False)   # шлёвка
    remen(B, [(x, -0.08, z0), (x, -0.18, z0), (x, -0.205, z0 + 0.02), (x * 1.15, -0.21, z0 + 0.07), (x * 1.3, -0.195, z0 + 0.12)], (1, 0, 0), 0.04, 0.005, KOZ)
    pryazhka(B, (x, -0.11, z0 + 0.001), (0, -1, 0), (1, 0, 0), 0.04)
    for y in (0.17, -0.15): B.sphere((x, y, z0 + 0.003), 0.0045, ZAK, 8, 5, (1, 1, 0.6))
    xb = s * (W / 2 + 0.003)
    remen(B, [(xb, -0.15, -0.03), (xb, -0.15, Dp / 2), (xb + s * 0.01, -0.15, Dp / 2 + 0.04), (xb + s * 0.005, -0.15, Dp / 2 + 0.10)], (0, 1, 0), 0.036, 0.005, KOZ)
    pryazhka(B, (xb + s * 0.004, -0.15, -0.005), (0, 0, 1), (0, 1, 0), 0.036)
korpus = B.object('ranec_rk1', smooth_angle=40)
bake_wear(korpus)
export([korpus], 'ranec-rk1')

# ── Крышка: центр = 'kryshka'; петля на верхнем крае (ось петли — у объекта 'petlya', y=+0.2, z=+0.008) ──
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
KR = metal_mat('metall_kryshka')
K = Builder(); KW, KH, KT = 0.31, 0.40, 0.012
K.rbox((0, 0, 0), (KW, KH, KT), KR, rad=0.005)
K.rbox((0, -0.01, -KT / 2 - 0.002), (0.22, 0.30, 0.006), KR, rad=0.003)         # выдавленное ребро жёсткости
K.rbox((0, -0.01, -KT / 2 - 0.005), (0.04, 0.24, 0.004), KR, rad=0.0015)
for x in np.linspace(-0.135, 0.135, 7):
    for y in (0.175, -0.185): K.sphere((x, y, -KT / 2), 0.005, ZAK, 8, 5, (1, 1, 0.5))
for y in np.linspace(-0.13, 0.12, 5):
    for x in (-0.14, 0.14): K.sphere((x, y, -KT / 2), 0.005, ZAK, 8, 5, (1, 1, 0.5))
for x0, x1, m in ((-0.15, -0.055, KR), (-0.05, 0.05, ZAK), (0.055, 0.15, KR)):   # петля: три кулака на оси
    K.cyl(V(x0, KH / 2, 0.008), V(x1, KH / 2, 0.008), 0.009, m, sides=12)
K.box((0, -KH / 2 + 0.01, -KT / 2 - 0.006), (0.05, 0.02, 0.006), LAT)            # защёлка внизу
kr = K.object('kryshka_rk1', smooth_angle=40)
bake_wear(kr)
export([kr], 'kryshka-rk1')
print('TRIS', count_tris([korpus]) if False else '', count_tris([kr]))
