# Лётчик 1910-х для 3D-игры дня «Котельников, РК-1». Повторяемая сборка из готовых моделей CC0 (Quaternius):
#   Modular Character Outfits – Fantasy (Male_Ranger: куртка, бриджи, сапоги, ремень),
#   Universal Base Characters (голова, глаза, брови),
#   Universal Animation Library (клипы: стоит, идёт, прыжок/падение, приземление, сидит, присел…).
# Скрипт: перекрашивает одежду в приглушённые цвета авиатора, режет голову базового тела по весам костей,
# шьёт кожаный шлем по форме черепа (копия кожи головы с толщиной) и очки-консервы, добавляет кости-точки
# ranec_mount (спина) и plecho_L / plecho_R (плечи, к ним стропы), переносит клипы UAL на скелет персонажа
# и выгружает GLB. Запуск:
#   ~/opt/blender/blender.sh -b --factory-startup --python ~/rc3d-proba/blender/lyotchik.py -- [выход.glb]
# Сжатие — отдельным шагом (szhat.sh: glTF-Transform meshopt + webp).
import bpy, bmesh, sys, os, math
import numpy as np
from mathutils import Vector, Matrix

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src') + '/'
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/rc3d/bl/lyotchik-raw.glb'
TEX = 1024            # размер текстур одежды

# Клипы UAL, которые нужны игре (остальные не выгружаются — экономия веса).
CLIPS = ['Idle_Loop', 'Walk_Loop', 'Jump_Start', 'Jump_Loop', 'Jump_Land', 'Sitting_Idle_Loop',
         'Crouch_Idle_Loop', 'Fixing_Kneeling', 'Swim_Idle_Loop', 'Roll', 'Hit_Chest', 'Idle_Talking_Loop']

bpy.ops.wm.read_factory_settings(use_empty=True)

def imp(f):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=SRC + f)
    return [o for o in bpy.data.objects if o not in before]

def kill(objs):
    for o in objs:
        bpy.data.objects.remove(o, do_unlink=True)

# --- 1. Анимации UAL (скелет-манекен и его меш нам не нужны — только действия).
ual = imp('UAL1.glb')
ual_actions = {a.name.replace('_Armature', ''): a for a in bpy.data.actions}
kill(ual)

# --- 2. Одежда Male_Ranger: её скелет становится скелетом лётчика.
ranger = imp('Male_Ranger.gltf')
ARM = next(o for o in ranger if o.type == 'ARMATURE'); ARM.name = 'Lyotchik'; ARM.data.name = 'Lyotchik'
KEEP = {'Male_Ranger_Arms': 'Rukava', 'Male_Ranger_Body': 'Kurtka', 'Male_Ranger_Legs': 'Bridzhi',
        'Male_Ranger_Feet_Boots': 'Sapogi', 'Male_Ranger_Body_Belt_1': 'Remen'}
kill([o for o in ranger if o.type == 'MESH' and o.name not in KEEP])
for o in [o for o in ARM.children if o.type == 'MESH']:
    o.name = KEEP[o.name]

# --- 3. Голова базового персонажа: оставляем вершины, привязанные к Head/neck_01; меш переводим на наш скелет.
base = imp('Superhero_Male_FullBody.gltf')
barm = next(o for o in base if o.type == 'ARMATURE')
for o in [o for o in base if o.type == 'MESH']:
    if o.parent != barm: kill([o]); continue
    o.parent = ARM
    for m in o.modifiers:
        if m.type == 'ARMATURE': m.object = ARM
    if o.name == 'SuperHero_Male':
        o.name = 'Golova'
        me = o.data; gi = {g.index: g.name for g in o.vertex_groups}
        bm = bmesh.new(); bm.from_mesh(me); dl = bm.verts.layers.deform.active
        drop = []
        for v in bm.verts:
            w = sum(wt for g, wt in v[dl].items() if gi[g] in ('Head', 'neck_01'))
            if w < 0.5: drop.append(v)
        bmesh.ops.delete(bm, geom=drop, context='VERTS'); bm.to_mesh(me); bm.free()
kill([barm])

def obj(n): return bpy.data.objects[n]

# --- 4. Текстуры: уменьшить, перекрасить (numpy), обрезать по UV.
def img_np(img):
    a = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32); img.pixels.foreach_get(a)
    return a.reshape(img.size[1], img.size[0], 4)

def np_img(name, arr):
    h, w = arr.shape[:2]
    im = bpy.data.images.new(name, w, h, alpha=False); im.pixels.foreach_set(arr.astype(np.float32).ravel()); im.pack()
    return im

def rgb2hsv(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(-1); mn = rgb.min(-1); d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
    return np.stack([h, s, mx], -1)

def hsv2rgb(hsv):
    h, s, v = hsv[..., 0] * 6, hsv[..., 1], hsv[..., 2]
    i = np.floor(h).astype(int) % 6; f = h - np.floor(h)
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    out = np.zeros(h.shape + (3,), np.float32)
    for k, (a, b, c) in enumerate([(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]):
        m = i == k; out[m, 0] = a[m]; out[m, 1] = b[m]; out[m, 2] = c[m]
    return out

def scaled(path, size):
    im = bpy.data.images.load(SRC + path); im.scale(size, size); return im

def recolor(base_arr, target, other_sat=0.55, other_val=0.85):
    """Зелёное сукно Ranger → цвет target (sRGB 0..1) с сохранением светотени ткани; остальное — приглушить."""
    rgb = base_arr[..., :3]; hsv = rgb2hsv(rgb)
    g = (hsv[..., 0] > 0.17) & (hsv[..., 0] < 0.47) & (hsv[..., 1] > 0.12)
    lum = rgb @ np.array([0.3, 0.59, 0.11], np.float32)
    k = (lum / max(1e-3, float(np.median(lum[g])))) ** 0.35   # светотень сукна, сжатая: тёмное и светлое сукно → один тон
    out = base_arr.copy()
    grey = lum[..., None]; muted = (grey + (rgb - grey) * other_sat) * other_val
    out[..., :3] = np.where(g[..., None], np.clip(np.array(target, np.float32) * k[..., None], 0, 1), muted)
    return out

rb = img_np(scaled('T_Ranger_BaseColor.png', TEX))
IM_KURTKA = np_img('T_Lyotchik_Kurtka', recolor(rb, (0.29, 0.18, 0.11)))     # кожанка: тёмно-коричневая
IM_BRIDZHI = np_img('T_Lyotchik_Bridzhi', recolor(rb, (0.46, 0.43, 0.33)))   # бриджи: хаки-серые
IM_NOR = scaled('T_Ranger_Normal.png', TEX); IM_ORM = scaled('T_Ranger_ORM.png', TEX)

def ranger_mat(name, base_img, rough_k=1.0):
    src = bpy.data.materials['MI_Ranger']
    m = src.copy(); m.name = name
    for n in m.node_tree.nodes:
        if n.type == 'TEX_IMAGE' and n.image and 'BaseColor' in n.image.name: n.image = base_img
        elif n.type == 'TEX_IMAGE' and n.image and 'Normal' in n.image.name: n.image = IM_NOR
        elif n.type == 'TEX_IMAGE' and n.image and 'ORM' in n.image.name: n.image = IM_ORM
    return m

M_KURTKA = ranger_mat('M_Kurtka', IM_KURTKA); M_BRIDZHI = ranger_mat('M_Bridzhi', IM_BRIDZHI)
for on, mat in [('Rukava', M_KURTKA), ('Kurtka', M_KURTKA), ('Remen', M_KURTKA), ('Sapogi', M_KURTKA), ('Bridzhi', M_BRIDZHI)]:
    o = obj(on)
    for s in o.material_slots:
        if s.material and s.material.name.startswith('MI_Ranger'): s.material = mat

# Брови: белая маска волос → тёмно-русый.
for m in bpy.data.materials:
    if m.name.startswith('MI_Hair'):
        for n in m.node_tree.nodes:
            if n.type == 'TEX_IMAGE' and n.image and 'BaseColor' in n.image.name and not n.image.get('tinted'):
                a = img_np(n.image); a[..., :3] *= np.array([0.30, 0.21, 0.14], np.float32)
                n.image.pixels.foreach_set(a.ravel()); n.image['tinted'] = 1; n.image.pack()
for im in list(bpy.data.images):
    if im.users and max(im.size) > TEX: im.scale(TEX, TEX)

# --- 5. Шлем: копия кожи головы (лоб, темя, затылок, уши) с толщиной; очки-консервы на лбу.
golova = obj('Golova')
me = golova.data
vz = np.array([v.co.z for v in me.vertices]); vy = np.array([v.co.y for v in me.vertices])
z_top, z_bot = vz.max(), vz.min(); y_front = vy.min()
print('HEAD z', round(z_bot, 3), round(z_top, 3), 'y_front', round(y_front, 3), 'y_back', round(vy.max(), 3))
H = z_top - z_bot
Z_BROW = z_top - 0.30 * H       # линия шлема над бровями
Z_NAPE = z_bot + 0.30 * H       # шлем закрывает уши и затылок до шеи
Y_FACE = y_front + 0.075        # всё, что позади этой плоскости, — под шлемом
shlem = golova.copy(); shlem.data = golova.data.copy(); shlem.name = 'Shlem'; bpy.context.collection.objects.link(shlem)
bm = bmesh.new(); bm.from_mesh(shlem.data)
drop = [v for v in bm.verts if not (v.co.z > Z_BROW or (v.co.z > Z_NAPE and v.co.y > Y_FACE))]
bmesh.ops.delete(bm, geom=drop, context='VERTS')
for v in bm.verts: v.co += v.normal * 0.007          # чуть больше черепа
bm.to_mesh(shlem.data); bm.free()
sol = shlem.modifiers.new('tolshchina', 'SOLIDIFY'); sol.thickness = 0.006; sol.offset = 1
# Solidify должен стоять до Armature, иначе кожа не будет двигаться с головой.
bpy.context.view_layer.objects.active = shlem
bpy.ops.object.modifier_move_to_index(modifier='tolshchina', index=0)
bpy.ops.object.modifier_apply(modifier='tolshchina')
m_shlem = bpy.data.materials.new('M_Shlem'); m_shlem.use_nodes = True
bs = m_shlem.node_tree.nodes['Principled BSDF']
bs.inputs['Base Color'].default_value = (0.11, 0.065, 0.04, 1); bs.inputs['Roughness'].default_value = 0.45
shlem.data.materials.clear(); shlem.data.materials.append(m_shlem)
bpy.ops.object.select_all(action='DESELECT'); shlem.select_set(True); bpy.ops.object.shade_smooth()

# Очки: две оправы + стёкла + ремешок, жёстко на кости Head.
hb = ARM.data.bones['Head']
m_med = bpy.data.materials.new('M_Ochki'); m_med.use_nodes = True
b2 = m_med.node_tree.nodes['Principled BSDF']; b2.inputs['Base Color'].default_value = (0.35, 0.25, 0.12, 1)
b2.inputs['Metallic'].default_value = 0.9; b2.inputs['Roughness'].default_value = 0.35
m_glass = bpy.data.materials.new('M_Steklo'); m_glass.use_nodes = True
b3 = m_glass.node_tree.nodes['Principled BSDF']; b3.inputs['Base Color'].default_value = (0.05, 0.07, 0.07, 1)
b3.inputs['Roughness'].default_value = 0.05; b3.inputs['Metallic'].default_value = 0.3
# Лоб: передняя точка шлема на высоте немного выше линии шлема.
band = [v.co for v in shlem.data.vertices if abs(v.co.z - (Z_BROW + 0.035)) < 0.012]
fy = min(c.y for c in band); fz = Z_BROW + 0.035
parts = []
for sx in (-1, 1):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.024, depth=0.022, location=(sx * 0.034, fy - 0.012, fz), rotation=(math.radians(90 - 20), 0, 0))
    r = bpy.context.object; r.data.materials.append(m_med); parts.append(r)
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.019, depth=0.004, location=(sx * 0.034, fy - 0.024, fz + 0.004), rotation=(math.radians(90 - 20), 0, 0))
    g = bpy.context.object; g.data.materials.append(m_glass); parts.append(g)
bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.006, depth=0.03, location=(0, fy - 0.014, fz), rotation=(0, math.radians(90), 0))
mo = bpy.context.object; mo.data.materials.append(m_med); parts.append(mo)
bpy.ops.object.select_all(action='DESELECT')
for p in parts: p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]; bpy.ops.object.join(); ochki = bpy.context.object; ochki.name = 'Ochki'
bpy.ops.object.shade_smooth()
# Привязка очков к кости через вес (как скин), чтобы выгрузка была одним скинованным мешем на скелете.
def skin_to(o, bone):
    o.parent = ARM; o.matrix_parent_inverse = ARM.matrix_world.inverted()
    vg = o.vertex_groups.new(name=bone); vg.add(list(range(len(o.data.vertices))), 1.0, 'REPLACE')
    md = o.modifiers.new('Armature', 'ARMATURE'); md.object = ARM
skin_to(ochki, 'Head')

# --- 6. Точки крепления: кости ranec_mount (середина спины), plecho_L / plecho_R (верх плеч).
kurtka = obj('Kurtka')
kv = [kurtka.matrix_world @ v.co for v in kurtka.data.vertices]
bpy.context.view_layer.objects.active = ARM; bpy.ops.object.mode_set(mode='EDIT')
eb = ARM.data.edit_bones
sp3 = eb['spine_03']; sp2 = eb['spine_02']
def back_y(z, x=0.0, tol=0.03):
    c = [v.y for v in kv if abs(v.z - z) < tol and abs(v.x - x) < 0.05]
    return max(c)
def top_z(x, y=None, tol=0.03):
    c = [v.z for v in kv if abs(v.x - x) < tol and abs(v.y - eb['clavicle_l'].head.y) < 0.06]
    return max(c)
zr = (sp3.head.z + sp2.head.z) / 2 + 0.03
for name, head in [('ranec_mount', Vector((0, back_y(zr), zr))),
                   ('plecho_L', Vector((0.13, eb['upperarm_l'].head.y, top_z(0.13)))),
                   ('plecho_R', Vector((-0.13, eb['upperarm_r'].head.y, top_z(-0.13))))]:
    b = eb.new(name); b.head = head; b.tail = head + Vector((0, 0, 0.08)); b.roll = 0
    b.parent = sp3; b.use_deform = False
    print('MOUNT', name, tuple(round(x, 3) for x in head))
bpy.ops.object.mode_set(mode='OBJECT')

# --- 7. Клипы: действия UAL → дорожки NLA скелета лётчика (кости совпадают по именам).
ad = ARM.animation_data or ARM.animation_data_create()
for c in CLIPS:
    a = ual_actions[c]
    # смещения костей, кроме корня и таза, отбрасываем: у UAL-манекена другая длина костей, нужны только повороты
    for fc in list(a.fcurves):
        if fc.data_path.endswith('location') and not any(k in fc.data_path for k in ('"root"', '"pelvis"')):
            a.fcurves.remove(fc)
    a.name = c
    tr = ad.nla_tracks.new(); tr.name = c
    st = tr.strips.new(c, int(a.frame_range[0]), a); tr.mute = False
ad.action = None
for a in list(bpy.data.actions):
    if a.name not in CLIPS: bpy.data.actions.remove(a)

# --- 8. Мусор импортёров и выгрузка.
for o in list(bpy.data.objects):
    if o.type == 'MESH' and o.parent is None: kill([o])
for o in bpy.data.objects:
    if o.type == 'MESH':
        for m in o.modifiers:
            if m.type == 'ARMATURE': m.object = ARM
print('OBJECTS', [(o.name, o.type, len(o.data.polygons) if o.type == 'MESH' else '') for o in bpy.data.objects])
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=True, export_animation_mode='NLA_TRACKS',
                          export_def_bones=False, export_image_format='WEBP', export_image_quality=82,
                          export_apply=False, export_yup=True, export_skins=True, export_morph=False)
print('SAVED', OUT, os.path.getsize(OUT))
