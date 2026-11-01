# Сценарий дня «Котельников, РК-1» для движка rc3d. Скрипт только собирает JSON (данные), без кода движка.
import json, copy

import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../public/muzei/izobreteniya/igry/rc3d/scen/kotelnikov-parashyut.json')
SILK, LINEN = 'fabric:#f3ecd8', 'fabric:#c2b28c'
LEATHER = 'paint:#4a2f1f'
RANEC = {'kind': 'metal', 'color': '#8d9399', 'rough': 0.55}

# Позы лётчика-модели: клип UAL + доворот рук/ног в осях тела (x — в сторону своей руки, y — вверх, z — вперёд).
LYOTCHIK_POSES = {
    'stand': {'clip': ['Idle_Loop']},
    'sit': {'clip': ['Sitting_Idle_Loop']},
    'spread': {'clip': ['Jump_Loop'], 'dir': {'ual': [1, 0.35, 0.1], 'lal': [1, 0.45, 0.15], 'uar': [1, 0.35, 0.1], 'lar': [1, 0.45, 0.15]}},
    'arms-forward': {'clip': ['Jump_Loop'], 'dir': {'uar': [0.15, -0.35, 1], 'lar': [-0.9, 0.2, 0.5]}},
    'arms-up': {'clip': ['Idle_Loop'], 'dir': {'ual': [0.3, 1, 0.1], 'lal': [0.05, 1, 0.15], 'uar': [0.3, 1, 0.1], 'lar': [0.05, 1, 0.15]}},
    'land': {'clip': ['Jump_Land'], 'once': True},
    'kneel': {'clip': ['Crouch_Idle_Loop']},
}
# Плечевые точки модели (кость plecho_L/R) в осях lyotchik (он — на высоте пояса 0,95 м): стропы идут к ним.
PLECHI = [[-0.13, 0.603, -0.065], [0.13, 0.603, -0.065]]

def kupol(id_, mat, two):
    to = [[x, y - 5.85, z] for x, y, z in PLECHI] if two else [[0, -5.85, 0]]
    return {'id': id_, 'type': 'cloth', 'shape': 'dome', 'parent': 'lyotchik', 'pos': [0, 5.85, 0], 'r': 3.8, 'h': 2.6, 'gores': 24,
            'vent': 0.25, 'open': 0, 'hidden': True, 'mat': mat, 'lines': {'n': 24, 'to': to, 'rot': 90, 'color': '#b9ab8e'}}

def strelka(id_, parent, pos, rot, scale=1):
    # Красная стрелка на причину неудачи (без текста): конус-остриё и стержень.
    return {'id': id_, 'type': 'group', 'parent': parent, 'pos': pos, 'rot': rot, 'scale': scale, 'hidden': True,
            'parts': [{'type': 'cone', 'r': 0.14, 'h': 0.32, 'pos': [0, -0.16, 0], 'rot': [180, 0, 0], 'mat': 'glow:#ff3b2f'},
                      {'type': 'cylinder', 'r': 0.045, 'h': 0.6, 'pos': [0, 0.3, 0], 'mat': 'glow:#ff3b2f'}]}

objects = [
    # Лес на горизонте и крыши деревни (Салюзи) — общий фон.
    {'id': 'les', 'type': 'group', 'copies': {'n': 40, 'radius': 150, 'face': False, 'instanced': True},
     'parts': [{'type': 'model', 'src': 'models/el.glb'}]},
    {'id': 'les2', 'type': 'group', 'copies': {'n': 46, 'radius': 172, 'start': 4, 'face': False, 'instanced': True},
     'parts': [{'type': 'model', 'src': 'models/beryoza.glb'}]},
    {'id': 'izba', 'type': 'group', 'copies': {'at': [[95, 0, -62], [106, 0, -50], [86, 0, -74], [116, 0, -38], [76, 0, -84]], 'instanced': True},
     'parts': [{'type': 'model', 'src': 'models/izba.glb'}]},
    # Лётчик-манекен: lyotchik — точка у пояса (на ней висят стропы), telo — шарнир для наклона и вращения.
    {'id': 'lyotchik', 'type': 'group', 'pos': [0, 0.95, 0]},
    {'id': 'telo', 'type': 'group', 'parent': 'lyotchik'},
    # Лётчик — готовая модель с клипами (Quaternius CC0, сборка tools/rc3d-blender/lyotchik.py); позы игры — клипы + доворот рук.
    {'id': 'chelovek', 'type': 'model', 'src': 'models/lyotchik-1912.glb', 'parent': 'telo', 'pos': [0, -0.95, 0], 'pose': 'stand', 'poses': LYOTCHIK_POSES},
    {'id': 'poyas', 'type': 'torus', 'parent': 'chelovek', 'bone': 'pelvis', 'snap': True, 'r': 0.175, 'tube': 0.022, 'pos': [0, 0.0, 0.0], 'scale': [1, 1, 0.78], 'mat': LEATHER},
    # Лямки от плечевых точек модели: спереди по груди, сзади к ранцу.
    {'id': 'lyamki', 'type': 'box', 'parent': 'chelovek', 'bone': 'spine_03', 'snap': True, 'size': [0.05, 0.42, 0.012], 'rot': [-8, 0, 0], 'copies': {'at': [[-0.10, -0.06, 0.135], [0.10, -0.06, 0.135]]}, 'mat': LEATHER},
    {'id': 'lyamkiPlecho', 'type': 'box', 'parent': 'chelovek', 'size': [0.055, 0.012, 0.2], 'pos': [0, 0.008, 0], 'bone': 'plecho_L', 'snap': True, 'mat': LEATHER},
    {'id': 'lyamkiPlechoR', 'type': 'box', 'parent': 'chelovek', 'size': [0.055, 0.012, 0.2], 'pos': [0, 0.008, 0], 'bone': 'plecho_R', 'snap': True, 'mat': LEATHER},
    # Ранец РК-1 — модель (tools/rc3d-blender/ranec_rk1.py), пропорции по схеме rk1.jpg (0.36×0.29×0.16, трапеция): корпус-лоток, заклёпки, полка, лямки; крышка — отдельная модель на петле.
    {'id': 'ranec', 'type': 'model', 'src': 'models/ranec-rk1.glb', 'parent': 'chelovek', 'bone': 'ranec_mount', 'snap': True, 'pos': [0, 0.04, -0.085]},
    {'id': 'petlya', 'type': 'group', 'parent': 'ranec', 'pos': [0, 0.125, -0.083]},
    {'id': 'kryshka', 'type': 'model', 'src': 'models/kryshka-rk1.glb', 'parent': 'petlya', 'pos': [0, -0.135, -0.008]},
    {'id': 'pruzhina', 'type': 'tube', 'parent': 'ranec', 'helix': {'r': 0.02, 'h': 0.1, 'turns': 6}, 'r': 0.004, 'radial': 5, 'rot': [-90, 0, 0], 'scale': [1, 0.3, 1],
     'copies': {'at': [[-0.09, 0.04, -0.08], [0.09, 0.04, -0.08], [-0.09, -0.06, -0.08], [0.09, -0.06, -0.08]]}, 'mat': 'metal', 'hidden': True},
    {'id': 'kolco', 'type': 'torus', 'parent': 'chelovek', 'bone': 'spine_02', 'snap': True, 'r': 0.04, 'tube': 0.008, 'pos': [0.1, -0.03, 0.135], 'rot': [90, 0, 0], 'mat': 'metal:#c9b27a'},
    kupol('kupol', SILK, True), kupol('kupolS1', SILK, False), kupol('kupolL2', LINEN, True), kupol('kupolL1', LINEN, False),
    strelka('strelkaKupol', 'lyotchik', [2.2, 5.0, 0], [0, 0, 90], 3),
    strelka('strelkaPoyas', 'telo', [0.75, 0, 0], [0, 0, 90]),
]

zastavka_objects = [
    {'id': 'shar', 'type': 'group'},
    {'id': 'obolochka', 'type': 'sphere', 'parent': 'shar', 'r': 3.5, 'scale': [1, 1.43, 1], 'pos': [0, 11.4, 0], 'mat': 'fabric:#5d6062'},
    {'id': 'setka', 'type': 'torus', 'parent': 'shar', 'r': 3.2, 'tube': 0.04, 'pos': [0, 7.6, 0], 'mat': 'paint:#3b3a36'},
    {'id': 'korzina', 'type': 'cylinder', 'parent': 'shar', 'anchor': 'base', 'r': 0.6, 'h': 1, 'pos': [0, 4.2, 0], 'mat': 'wood:#9c7b4f'},
    {'id': 'stropyShara', 'type': 'cylinder', 'parent': 'shar', 'r': 0.015, 'h': 2.9, 'rot': [0, 0, 0], 'copies': {'at': [[0.85, 6.6, 0.85], [-0.85, 6.6, 0.85], [0.85, 6.6, -0.85], [-0.85, 6.6, -0.85]]}, 'mat': 'paint:#3b3a36'},
    {'id': 'verevka', 'type': 'cylinder', 'parent': 'shar', 'anchor': 'base', 'r': 0.012, 'h': 2.72, 'pos': [0, 1.48, 0], 'mat': 'paint:#6b5f4a'},
    {'id': 'tros', 'type': 'cylinder', 'anchor': 'base', 'r': 0.014, 'h': 4.6, 'pos': [0.55, 0, 0.1], 'mat': 'dark'},
    {'id': 'lebedka', 'type': 'box', 'size': [1.2, 0.7, 0.9], 'pos': [0.9, 0.35, 0.6], 'mat': 'paint:#3e4a3a'},
    # Люди — готовая модель Quaternius (CC0), не фигуры из цилиндров.
    {'id': 'kotelnikov', 'type': 'model', 'src': 'models/chelovek-1912.glb', 'pos': [0.45, 0, -0.85], 'rot': [0, -25, 0], 'pose': 'arms-forward'},
    {'id': 'lyudi', 'type': 'model', 'src': 'models/chelovek-1912.glb', 'copies': {'at': [[-12, 0, 8], [-13.5, 0, 10], [-11, 0, 11.5], [-14.5, 0, 7], [-10, 0, 9.5], [-12.5, 0, 12.5]]}, 'rot': [0, 60, 0], 'pose': 'stand'},
    {'id': 'avto', 'type': 'group', 'pos': [-16, 0, -5], 'rot': [0, 25, 0],
     'parts': [{'type': 'box', 'size': [3.2, 0.7, 1.5], 'pos': [0, 0.85, 0], 'mat': 'paint:#2e3a2c'}, {'type': 'box', 'size': [1.1, 0.55, 1.3], 'pos': [1.1, 1.45, 0], 'mat': 'paint:#2e3a2c'},
               {'type': 'box', 'size': [0.9, 0.6, 1.4], 'pos': [-0.7, 1.45, 0], 'mat': 'paint:#4a2f22'},
               {'type': 'cylinder', 'r': 0.42, 'h': 0.12, 'rot': [90, 0, 0], 'pos': [1.05, 0.42, 0.8], 'mat': 'rubber'}, {'type': 'cylinder', 'r': 0.42, 'h': 0.12, 'rot': [90, 0, 0], 'pos': [1.05, 0.42, -0.8], 'mat': 'rubber'},
               {'type': 'cylinder', 'r': 0.42, 'h': 0.12, 'rot': [90, 0, 0], 'pos': [-1.05, 0.42, 0.8], 'mat': 'rubber'}, {'type': 'cylinder', 'r': 0.42, 'h': 0.12, 'rot': [90, 0, 0], 'pos': [-1.05, 0.42, -0.8], 'mat': 'rubber'}]},
    {'id': 'palatka', 'type': 'cone', 'seg': 4, 'r': 2.6, 'h': 2.6, 'pos': [-19, 1.3, 4], 'rot': [0, 45, 0], 'mat': 'fabric:#d8cfb8'},
    {'id': 'flagshtok', 'type': 'cylinder', 'r': 0.04, 'h': 5, 'pos': [-8, 2.5, -3], 'mat': 'wood'},
    {'id': 'flag', 'type': 'cloth', 'shape': 'sheet', 'parent': 'flagshtok', 'w': 1.3, 'h': 0.8, 'pos': [0, 2.0, 0], 'wave': 0.15, 'mat': 'fabric:#d9c38a'},
]

# ── Заставка (покадрово по описанию; время слегка растянуто для подъёма на высоту) ──
H = 120   # подъём шара (м сцены); голос говорит «двести метров» — как в источнике, высота на сцене сжата
Z = [
    {'t': 0, 'do': 'move', 'id': 'kotelnikov', 'to': [0.45, 0, -0.85]},
    {'t': 0, 'do': 'rotate', 'id': 'petlya', 'to': [100, 0, 0]},
    {'t': 0, 'do': 'sound', 'kind': 'wind', 'level': 0.25},
    {'t': 0, 'do': 'say', 'text': '1912 год, поле у деревни Салюзи под Гатчиной. Котельников готовит манекен к испытанию.'},
    {'t': 0.6, 'do': 'rotate', 'id': 'petlya', 'to': [0, 0, 0], 'dur': 0.5},
    {'t': 1.1, 'do': 'sound', 'kind': 'hit', 'k': 0.4}, {'t': 1.1, 'do': 'voice', 'file': 'ranec', 'text': 'Ранец закрыт!'},
    {'t': 1.4, 'do': 'pose', 'id': 'kotelnikov', 'pose': 'stand', 'dur': 0.6},
    {'t': 2, 'do': 'move', 'id': 'kotelnikov', 'to': [3, 0, -3], 'dur': 1.5},
    {'t': 2, 'do': 'move', 'id': 'shar', 'by': [0, H, 0], 'dur': 3.5},
    {'t': 2, 'do': 'move', 'id': 'lyotchik', 'by': [0, H, 0], 'dur': 3.5},
    {'t': 2, 'do': 'scale', 'id': 'tros', 'to': [1, (4.6 + H) / 4.6, 1], 'dur': 3.5},
    {'t': 2, 'do': 'sound', 'kind': 'creak', 'repeat': 3, 'every': 1},
    {'t': 2, 'do': 'camera', 'follow': 'lyotchik', 'lookOffset': [0, 1, 0]},
    {'t': 2, 'do': 'camera', 'offset': [9, -3, 11], 'dur': 2.5},
    {'t': 2.2, 'do': 'say', 'text': 'Шар поднимает манекен «Иван Иванович» в кожаных лямках, ранец — на спине.'},
    {'t': 4.4, 'do': 'voice', 'file': 'dvesti', 'text': 'Двести метров!'},
    {'t': 4.6, 'do': 'count', 'text': '200 метров', 'small': 'высота подъёма'},
    {'t': 5.2, 'do': 'camera', 'offset': [1.8, 2.2, 2.2], 'dur': 0.5},
    {'t': 5.6, 'do': 'voice', 'file': 'rezh', 'text': 'Режь!'},
    {'t': 5.9, 'do': 'hide', 'id': 'verevka'}, {'t': 5.9, 'do': 'sound', 'kind': 'click', 'k': 1.5},
    {'t': 5.9, 'do': 'say', 'text': 'Трос перерезан. Манекен падает камнем.'},
    {'t': 6.0, 'do': 'move', 'id': 'lyotchik', 'path': [[0.4, H - 3, 0], [1.5, H - 18, 0]], 'dur': 1.6, 'ease': 'in2'},
    {'t': 6.0, 'do': 'sound', 'kind': 'wind', 'level': 1}, {'t': 6.0, 'do': 'sound', 'kind': 'whoosh'},
    {'t': 6.0, 'do': 'camera', 'offset': [2.5, 4.5, 3], 'dur': 0.5},
    {'t': 6.7, 'do': 'rotate', 'id': 'petlya', 'to': [110, 0, 0], 'dur': 0.2},
    {'t': 6.7, 'do': 'show', 'id': 'pruzhina'}, {'t': 6.7, 'do': 'scale', 'id': 'pruzhina', 'to': [1, 1.6, 1], 'dur': 0.2},
    {'t': 6.7, 'do': 'sound', 'kind': 'click'},
    {'t': 6.75, 'do': 'move', 'id': 'kupol', 'to': [0, 0.3, -0.35]}, {'t': 6.75, 'do': 'scale', 'id': 'kupol', 'to': 0.25},
    {'t': 6.8, 'do': 'show', 'id': 'kupol'},
    {'t': 6.8, 'do': 'say', 'text': 'Крышка ранца откинулась, пружины выбросили шёлковый купол.'},
    {'t': 6.8, 'do': 'move', 'id': 'kupol', 'to': [0, 5.85, 0], 'dur': 0.6, 'ease': 'out'},
    {'t': 6.8, 'do': 'scale', 'id': 'kupol', 'to': 1, 'dur': 0.6},
    {'t': 6.8, 'do': 'open', 'id': 'kupol', 'to': 0.15, 'dur': 0.6},
    {'t': 7.5, 'do': 'open', 'id': 'kupol', 'to': 1, 'dur': 0.9},
    {'t': 7.6, 'do': 'sound', 'kind': 'crack', 'k': 1.3}, {'t': 7.6, 'do': 'sound', 'kind': 'wind', 'level': 0.35},
    {'t': 7.6, 'do': 'move', 'id': 'lyotchik', 'by': [0.5, -5, 0], 'dur': 1, 'ease': 'out2'},
    {'t': 7.6, 'do': 'pose', 'id': 'chelovek', 'pose': 'arms-up', 'dur': 0.6},
    {'t': 7.6, 'do': 'camera', 'follow': 'lyotchik', 'lookOffset': [0, 4, 0]},
    {'t': 7.6, 'do': 'camera', 'offset': [6, -7, 6], 'dur': 1.6},
    {'t': 8.0, 'do': 'say', 'text': 'Купол раскрылся в круг из 24 клиньев. Стропы двумя пучками держат манекен за плечи.'},
    {'t': 8.6, 'do': 'move', 'id': 'lyotchik', 'to': [10, 0.95, 0], 'dur': 7, 'ease': 'linear'},
    {'t': 10, 'do': 'camera', 'offset': [22, 2, 24], 'dur': 3},
    {'t': 10, 'do': 'voice', 'file': 'raskrylsya', 'text': 'Раскрылся!'},
    {'t': 10, 'do': 'count', 'text': 'Плавный спуск', 'small': 'купол держит груз'},
    {'t': 10, 'do': 'move', 'id': 'lyudi', 'by': [20, 0, -8], 'dur': 5.5},
    {'t': 10, 'do': 'move', 'id': 'kotelnikov', 'to': [12.2, 0, 1.6], 'dur': 5.5},
    {'t': 10, 'do': 'rotate', 'id': 'kotelnikov', 'to': [0, -120, 0], 'dur': 1},
    {'t': 14, 'do': 'camera', 'offset': [5, -0.4, 6], 'dur': 1.6},
    {'t': 14, 'do': 'camera', 'follow': 'lyotchik', 'lookOffset': [0, 0.6, 0]},
    {'t': 15.6, 'do': 'emit', 'kind': 'puff', 'on': 'lyotchik', 'offset': [0, -0.9, 0], 'size': 0.6, 'color': '#a99c78'},
    {'t': 15.6, 'do': 'pose', 'id': 'chelovek', 'pose': 'stand', 'dur': 0.6},
    {'t': 15.6, 'do': 'rotate', 'id': 'kupol', 'to': [0, 0, -80], 'dur': 2.2},
    {'t': 15.6, 'do': 'move', 'id': 'kupol', 'to': [3.6, 0.4, 0], 'dur': 2.2},
    {'t': 15.6, 'do': 'open', 'id': 'kupol', 'to': 0.35, 'dur': 2.2},
    {'t': 15.6, 'do': 'sound', 'kind': 'wind', 'level': 0.15},
    {'t': 15.8, 'do': 'sound', 'kind': 'applause'},
    {'t': 16.2, 'do': 'pose', 'id': 'kotelnikov', 'pose': 'wave', 'dur': 0.7},
    {'t': 16.3, 'do': 'sound', 'kind': 'bell'},
    {'t': 16.5, 'do': 'voice', 'file': 'budut', 'text': 'Будут жить лётчики!'},
    {'t': 16.5, 'do': 'camera', 'offset': [7, 2.5, 7], 'dur': 2.5},
    {'t': 16.6, 'do': 'count', 'text': 'РК-1 · 1912', 'small': 'Салюзи под Гатчиной'},
    {'t': 16.6, 'do': 'say', 'text': '1912 год, Салюзи под Гатчиной. Первый в мире ранцевый авиационный парашют РК-1 Глеба Котельникова раскрылся с высоты 200 метров.', 'cls': 'ok'},
    {'t': 21, 'do': 'end'},
]

# ── Игра ──
igra_objects = [
    {'id': 'samolet', 'type': 'group', 'pos': [-6, 1.4, 7], 'rot': [0, 160, 0]},
    # Аэроплан «Фарман IV» (1909–1910): модели tools/rc3d-blender/aeroplan.py, по glb на каждый узел разлома.
    {'id': 'fuzelyazh', 'type': 'group', 'parent': 'samolet',
     'parts': [{'id': 'aeroplan', 'type': 'model', 'src': 'models/aeroplan-fuzelyazh.glb'},
               {'id': 'vint', 'type': 'model', 'src': 'models/aeroplan-vint.glb', 'pos': [-2.59, 0.28, 0]}]},
    {'id': 'zont', 'type': 'cylinder', 'parent': 'fuzelyazh', 'r': 0.125, 'h': 1.5, 'rot': [0, 0, 90], 'pos': [-1.4, 0.48, 0], 'mat': 'fabric:#d8cdb2', 'hidden': True},
    {'id': 'shnur', 'type': 'tube', 'parent': 'fuzelyazh', 'points': [[-0.65, 0.48, 0], [-0.6, 0.7, 0.1], [-0.55, 0.45, 0.15]], 'r': 0.01, 'mat': 'paint:#6b5f4a', 'hidden': True},
    {'id': 'kryloVL', 'type': 'group', 'parent': 'samolet', 'pos': [-1.3, 1.0, 2.6], 'parts': [{'type': 'model', 'src': 'models/aeroplan-krylo-vl.glb'}]},
    {'id': 'kryloVR', 'type': 'group', 'parent': 'samolet', 'pos': [-1.3, 1.0, -2.6], 'parts': [{'type': 'model', 'src': 'models/aeroplan-krylo-vr.glb'}]},
    {'id': 'kryloNL', 'type': 'group', 'parent': 'samolet', 'pos': [-1.3, -0.45, 2.45], 'parts': [{'type': 'model', 'src': 'models/aeroplan-krylo-nl.glb'}]},
    {'id': 'kryloNR', 'type': 'group', 'parent': 'samolet', 'pos': [-1.3, -0.45, -2.45], 'parts': [{'type': 'model', 'src': 'models/aeroplan-krylo-nr.glb'}]},
    strelka('strelkaZont', 'fuzelyazh', [-1.4, 1.35, 0], [0, 0, 0], 1.5),
]

AIR = 150          # высота полёта аэроплана
X0 = -40           # точка начала полёта
BX = X0 + 70       # где разламывается (x)
LX, LY = BX - 0.6, AIR - 0.15   # где лётчик в момент разлома (мир)

def flight():
    return [
        {'t': 0, 'do': 'voice', 'file': 'pryzhok', 'text': 'Прыжок!'},
        {'t': 0, 'do': 'move', 'id': 'samolet', 'to': [X0, AIR, 0]}, {'t': 0, 'do': 'rotate', 'id': 'samolet', 'to': [0, 0, 0]},
        {'t': 0, 'do': 'attach', 'id': 'lyotchik', 'to': 'fuzelyazh'},
        {'t': 0, 'do': 'move', 'id': 'lyotchik', 'to': [-0.6, -0.15, 0]}, {'t': 0, 'do': 'rotate', 'id': 'lyotchik', 'to': [0, 90, 0]},
        {'t': 0, 'do': 'pose', 'id': 'chelovek', 'pose': 'sit'},
        {'t': 0, 'do': 'rotate', 'id': 'vint', 'spin': [1400, 0, 0]},
        {'t': 0, 'do': 'sound', 'kind': 'hum', 'level': 0.8}, {'t': 0, 'do': 'sound', 'kind': 'wind', 'level': 0.4},
        {'t': 0, 'do': 'camera', 'follow': 'samolet', 'lookOffset': [0, 0, 0]}, {'t': 0, 'do': 'camera', 'offset': [-12, 4, 15], 'dur': 0.05},
        {'t': 0, 'do': 'count', 'text': 'В полёте', 'small': 'высота около 150 метров'},
        {'t': 0, 'do': 'say', 'text': 'Аэроплан на высоте. Сейчас он развалится в воздухе — как в 1910 году у Мациевича.'},
        {'t': 0, 'do': 'move', 'id': 'samolet', 'by': [70, 0, 0], 'dur': 3.2, 'ease': 'linear'},
        {'t': 0.3, 'do': 'camera', 'offset': [-6, 3, 13], 'dur': 2.8},
        # Разлом: обломки падают (унаследованная скорость), щепки, хлопок.
        {'t': 3.2, 'do': 'sound', 'kind': 'crack', 'k': 1.5}, {'t': 3.2, 'do': 'sound', 'kind': 'hum', 'level': 0},
        {'t': 3.2, 'do': 'emit', 'kind': 'puff', 'on': 'fuzelyazh', 'size': 1, 'color': '#d8cdb2'},
        {'t': 3.2, 'do': 'debris', 'on': 'fuzelyazh', 'from': 'kryloVL', 'n': 10, 'size': 0.25, 'speed': 6, 'v': [18, 0, 0]},
        {'t': 3.2, 'do': 'fall', 'id': 'kryloVL', 'v': [-4, 3, 4], 'spin': [120, 30, 200]},
        {'t': 3.2, 'do': 'fall', 'id': 'kryloVR', 'v': [-3, 2, -5], 'spin': [-140, 20, -160]},
        {'t': 3.2, 'do': 'fall', 'id': 'kryloNL', 'v': [-6, 0, 3], 'spin': [90, -40, 120]},
        {'t': 3.2, 'do': 'fall', 'id': 'kryloNR', 'v': [-5, 1, -3], 'spin': [-80, 50, -90]},
        {'t': 3.2, 'do': 'fall', 'id': 'fuzelyazh', 'v': [-2, 0, 0], 'spin': [20, 10, -90]},
        {'t': 3.2, 'do': 'attach', 'id': 'lyotchik', 'to': None},
        {'t': 3.2, 'do': 'pose', 'id': 'chelovek', 'pose': 'spread', 'dur': 0.4},
        {'t': 3.2, 'do': 'slow', 'k': 0.35, 'dur': 0.2}, {'t': 3.9, 'do': 'slow', 'k': 1, 'dur': 0.6},
        {'t': 3.2, 'do': 'camera', 'follow': 'lyotchik', 'lookOffset': [0, 0, 0]}, {'t': 3.2, 'do': 'camera', 'offset': [5, 3, 8], 'dur': 0.8},
        {'t': 3.2, 'do': 'sound', 'kind': 'wind', 'level': 1},
        {'t': 3.25, 'do': 'count', 'text': 'Аэроплан развалился', 'small': 'лётчик выпал'},
    ]

def deploy(dome, t, slow):
    # Рывок кольца, крышка, пружины, выброс купола; slow — лён: ранец туже, ком выползает медленно.
    k = 3.2 if slow else 1
    return [
        {'t': t, 'do': 'pose', 'id': 'chelovek', 'pose': 'arms-forward', 'dur': 0.2},
        {'t': t + 0.1, 'do': 'sound', 'kind': 'click'}, {'t': t + 0.1, 'do': 'say', 'text': 'Лётчик дёрнул кольцо.' if not slow else 'Кольцо выдернуто, но тяжёлый льняной ком выползает из ранца медленно.'},
        {'t': t + 0.2, 'do': 'rotate', 'id': 'petlya', 'to': [110, 0, 0], 'dur': 0.2 * k},
        {'t': t + 0.2, 'do': 'show', 'id': 'pruzhina'}, {'t': t + 0.2, 'do': 'scale', 'id': 'pruzhina', 'to': [1, 1.6, 1], 'dur': 0.2 * k},
        {'t': t + 0.25, 'do': 'move', 'id': dome, 'to': [0, 0.3, -0.35]}, {'t': t + 0.25, 'do': 'scale', 'id': dome, 'to': 0.25},
        {'t': t + 0.3, 'do': 'show', 'id': dome},
        {'t': t + 0.3, 'do': 'move', 'id': dome, 'to': [0, 5.85, 0], 'dur': 0.6 * k, 'ease': 'out'},
        {'t': t + 0.3, 'do': 'scale', 'id': dome, 'to': 1, 'dur': 0.6 * k},
        {'t': t + 0.3, 'do': 'open', 'id': dome, 'to': 0.15, 'dur': 0.6 * k},
        {'t': t + 0.3, 'do': 'sound', 'kind': 'whoosh', 'k': 0.6},
    ]

def land_ok(t):
    return [
        {'t': t, 'do': 'emit', 'kind': 'puff', 'on': 'lyotchik', 'offset': [0, -0.9, 0], 'size': 0.6, 'color': '#a99c78'},
        {'t': t, 'do': 'pose', 'id': 'chelovek', 'pose': 'land', 'dur': 0.15}, {'t': t + 1.1, 'do': 'pose', 'id': 'chelovek', 'pose': 'stand', 'dur': 0.5},
        {'t': t, 'do': 'sound', 'kind': 'wind', 'level': 0.1},
        {'t': t, 'do': 'rotate', 'id': 'KUPOL', 'to': [0, 0, -80], 'dur': 2}, {'t': t, 'do': 'move', 'id': 'KUPOL', 'to': [3.6, 0.4, 0], 'dur': 2}, {'t': t, 'do': 'open', 'id': 'KUPOL', 'to': 0.35, 'dur': 2},
        {'t': t + 0.3, 'do': 'sound', 'kind': 'signal'},
        {'t': t + 0.3, 'do': 'camera', 'offset': [6, 1.5, 7], 'dur': 1.5},
        {'t': t + 2.5, 'do': 'end'},
    ]

def sub(lst, dome):
    return json.loads(json.dumps(lst).replace('KUPOL', dome))

def outcome_A1(when, oid, reason_try):
    # Парашют на самолёте: уходит с обломками, шнур рвётся, лётчик падает без купола.
    tl = flight()
    for e in tl:
        pass
    tl += [
        {'t': 3.2, 'do': 'hide', 'id': 'shnur'},
        {'t': 3.2, 'do': 'move', 'id': 'lyotchik', 'path': [[LX + 3, LY - 6, 0], [LX + 6, LY - 60, 0], [LX + 8, 0.3, 0]], 'dur': 4.6, 'ease': 'in2'},
        {'t': 3.4, 'do': 'show', 'id': 'strelkaZont'},
        {'t': 3.4, 'do': 'say', 'text': 'Шнур оборвался: «зонт» остался на обломках аэроплана, а лётчик падает без купола.'},
        {'t': 3.5, 'do': 'camera', 'follow': 'fuzelyazh', 'lookOffset': [0, 0, 0]}, {'t': 3.5, 'do': 'camera', 'offset': [6, 3, 7], 'dur': 0.6},
        {'t': 4.6, 'do': 'camera', 'follow': 'lyotchik', 'lookOffset': [0, 0, 0]}, {'t': 4.6, 'do': 'camera', 'offset': [9, 4, 12], 'dur': 1},
        {'t': 7.2, 'do': 'camera', 'follow': None}, {'t': 7.2, 'do': 'camera', 'pos': [LX + 30, 9, 26], 'look': [LX + 8, 1, 0], 'dur': 0.9},
        {'t': 7.8, 'do': 'emit', 'kind': 'puff', 'at': [LX + 8, 0.3, 0], 'size': 1.4, 'color': '#a99c78', 'n': 26},
        {'t': 7.8, 'do': 'sound', 'kind': 'hit', 'k': 1.2}, {'t': 7.8, 'do': 'sound', 'kind': 'wind', 'level': 0},
        {'t': 7.9, 'do': 'sound', 'kind': 'alarm', 'k': 0.6},
        {'t': 8.0, 'do': 'count', 'text': 'Лётчик не спасён', 'small': 'парашют остался на самолёте'},
        {'t': 9.5, 'do': 'end'},
    ]
    return {'id': oid, 'when': when, 'result': 'fail', 'reason': 'na-samolete', 'try': 'парашют на самолёте', 'title': 'Лётчик не спасён', 'small': 'парашют остался на самолёте', 'timeline': tl}

def outcome_A2(oid, silk, two):
    dome = {(True, True): 'kupol', (True, False): 'kupolS1', (False, True): 'kupolL2', (False, False): 'kupolL1'}[(silk, two)]
    tl = flight()
    if silk:
        tl += [{'t': 3.2, 'do': 'move', 'id': 'lyotchik', 'path': [[LX + 2.5, LY - 4, 0], [LX + 5, LY - 16, 0]], 'dur': 1.4, 'ease': 'in2'}]
        tl += deploy(dome, 3.9, False)
        tl += [
            {'t': 4.9, 'do': 'open', 'id': dome, 'to': 1, 'dur': 0.9, 'ease': 'out'},
            {'t': 5.0, 'do': 'sound', 'kind': 'crack', 'k': 1.3}, {'t': 5.0, 'do': 'sound', 'kind': 'wind', 'level': 0.35},
            {'t': 5.0, 'do': 'move', 'id': 'lyotchik', 'by': [0.6, -5, 0], 'dur': 1, 'ease': 'out2'},
            {'t': 5.0, 'do': 'pose', 'id': 'chelovek', 'pose': 'arms-up', 'dur': 0.5},
            {'t': 5.0, 'do': 'camera', 'follow': 'lyotchik', 'lookOffset': [0, 4, 0]}, {'t': 5.0, 'do': 'camera', 'offset': [6, -7, 6], 'dur': 1.4},
            {'t': 5.0, 'do': 'count', 'text': 'Купол раскрылся', 'small': 'за мгновение'},
        ]
        y_after = LY - 16 - 5
        if two:
            tl += [
                {'t': 5.4, 'do': 'say', 'text': 'Шёлк с тросиком в кромке наполнился за мгновение. Две группы строп держат лётчика за плечи — он висит ровно и разворачивается по ветру.'},
                {'t': 6.0, 'do': 'move', 'id': 'lyotchik', 'to': [LX + 14, 0.95, 4], 'dur': 6.5, 'ease': 'linear'},
                {'t': 6.5, 'do': 'rotate', 'id': 'lyotchik', 'by': [0, 70, 0], 'dur': 2.5},
                {'t': 7.0, 'do': 'camera', 'offset': [18, 1, 20], 'dur': 2.5},
                {'t': 10.6, 'do': 'camera', 'follow': 'lyotchik', 'lookOffset': [0, 0.5, 0]}, {'t': 10.6, 'do': 'camera', 'offset': [5, 0.2, 6], 'dur': 1.4},
            ]
            tl += sub(land_ok(12.5), dome)
            return {'id': oid, 'when': {'gde': 'ranec', 'tkan': 'shyolk', 'stropy': 'plechi'}, 'result': 'ok', 'title': 'Лётчик спасён', 'small': 'РК-1: ранец, шёлк, лямки на плечах',
                    'text': 'Так сделал Котельников: парашют всегда на человеке, лёгкий шёлк с тросиком в кромке раскрывается быстро, а две группы строп держат лётчика ровно и дают ему разворачиваться. Это первый в мире авиационный ранцевый парашют РК-1.', 'timeline': tl}
        # шёлк + один узел у пояса: переворачивает и крутит
        tl += [
            {'t': 5.6, 'do': 'rotate', 'id': 'telo', 'to': [0, 0, 70], 'dur': 1.0},
            {'t': 5.8, 'do': 'rotate', 'id': 'telo', 'spin': [0, 260, 0]},
            {'t': 5.8, 'do': 'rotate', 'id': dome, 'to': [0, 0, 14], 'dur': 0.8, 'repeat': 4, 'every': 1.6},
            {'t': 6.6, 'do': 'rotate', 'id': dome, 'to': [0, 0, -14], 'dur': 0.8, 'repeat': 4, 'every': 1.6},
            {'t': 5.8, 'do': 'say', 'text': 'Купол раскрылся, но все стропы сходятся в одну точку на поясе: лётчика перевернуло, он крутится вокруг своей оси, купол раскачивается.'},
            {'t': 6.0, 'do': 'move', 'id': 'lyotchik', 'to': [LX + 12, 0.35, 0], 'dur': 6.2, 'ease': 'linear'},
            {'t': 6.3, 'do': 'show', 'id': 'strelkaPoyas'},
            {'t': 6.3, 'do': 'camera', 'offset': [4, 1, 5], 'dur': 1.2},
            {'t': 8.5, 'do': 'camera', 'offset': [14, 2, 16], 'dur': 2},
            {'t': 12.2, 'do': 'rotate', 'id': 'telo', 'spin': [0, 0, 0]}, {'t': 12.2, 'do': 'rotate', 'id': 'telo', 'to': [0, 0, 88], 'dur': 0.3},
            {'t': 12.2, 'do': 'sound', 'kind': 'hit', 'k': 0.8},
            {'t': 12.2, 'do': 'emit', 'kind': 'puff', 'on': 'lyotchik', 'size': 0.8, 'color': '#a99c78'},
            {'t': 12.3, 'do': 'move', 'id': 'lyotchik', 'by': [7, 0, 0], 'dur': 2.2, 'ease': 'out'},
            {'t': 12.3, 'do': 'move', 'id': dome, 'to': [2, 1.0, 0], 'dur': 2.2}, {'t': 12.3, 'do': 'rotate', 'id': dome, 'to': [0, 0, -75], 'dur': 1.5},
            {'t': 12.3, 'do': 'emit', 'kind': 'puff', 'on': 'lyotchik', 'size': 0.6, 'color': '#a99c78', 'repeat': 4, 'every': 0.5},
            {'t': 12.3, 'do': 'count', 'text': 'Посадка боком', 'small': 'ветер тащит по траве'},
            {'t': 12.4, 'do': 'sound', 'kind': 'alarm', 'k': 0.5},
            {'t': 15.0, 'do': 'end'},
        ]
        return {'id': oid, 'when': {'gde': 'ranec', 'tkan': 'shyolk', 'stropy': 'poyas'}, 'result': 'fail', 'reason': 'odin-uzel', 'try': 'стропы одним узлом к поясу', 'title': 'Лётчика крутит', 'small': 'стропы в одной точке',
                'text': 'Купол цел, но лётчик крутится и падает боком. Сбруя Котельникова на плечах не давала парашютисту закрутиться и позволяла быстро отстегнуться на земле, а две группы строп дают разворот и скольжение.', 'timeline': tl,
                'hint': 'Что сделать сейчас: нажми «Ещё раз» и раздели стропы на две группы к плечевым лямкам.'}
    # лён: медленное раскрытие у самой земли
    tl += [{'t': 3.2, 'do': 'move', 'id': 'lyotchik', 'path': [[LX + 2.5, LY - 6, 0], [LX + 5, LY - 50, 0], [LX + 7, 34, 0]], 'dur': 5.2, 'ease': 'in2'}]
    tl += deploy(dome, 3.9, True)
    tl += [
        {'t': 4.6, 'do': 'show', 'id': 'strelkaKupol'},
        {'t': 6.2, 'do': 'open', 'id': dome, 'to': 0.35, 'dur': 2.2, 'ease': 'linear'},
        {'t': 6.0, 'do': 'count', 'text': 'Купол не раскрывается', 'small': 'тяжёлая ткань'},
        {'t': 8.4, 'do': 'open', 'id': dome, 'to': 1, 'dur': 1.2, 'ease': 'out'},
        {'t': 8.4, 'do': 'sound', 'kind': 'crack', 'k': 0.8},
        {'t': 8.4, 'do': 'move', 'id': 'lyotchik', 'by': [1, -14, 0], 'dur': 1.0, 'ease': 'out2'},
        {'t': 8.4, 'do': 'say', 'text': 'Льняной купол раскрылся поздно, у самой земли.'},
        {'t': 8.4, 'do': 'camera', 'offset': [10, 1, 12], 'dur': 1},
    ]
    if two:
        tl += [
            {'t': 9.4, 'do': 'move', 'id': 'lyotchik', 'to': [LX + 9, 0.6, 0], 'dur': 1.3, 'ease': 'in2'},
            {'t': 10.7, 'do': 'pose', 'id': 'chelovek', 'pose': 'kneel', 'dur': 0.2},
            {'t': 10.7, 'do': 'move', 'id': 'lyotchik', 'by': [0, -0.25, 0], 'dur': 0.2},
            {'t': 10.7, 'do': 'sound', 'kind': 'hit', 'k': 1}, {'t': 10.7, 'do': 'sound', 'kind': 'wind', 'level': 0},
            {'t': 10.7, 'do': 'emit', 'kind': 'puff', 'on': 'lyotchik', 'offset': [0, -0.6, 0], 'size': 1, 'color': '#a99c78'},
            {'t': 10.7, 'do': 'move', 'id': dome, 'to': [3, 0.6, 0], 'dur': 2}, {'t': 10.7, 'do': 'rotate', 'id': dome, 'to': [0, 0, -80], 'dur': 2},
            {'t': 10.8, 'do': 'count', 'text': 'Жёсткая посадка', 'small': 'купол раскрылся поздно'},
            {'t': 10.9, 'do': 'sound', 'kind': 'alarm', 'k': 0.5},
            {'t': 13, 'do': 'end'},
        ]
        return {'id': oid, 'when': {'gde': 'ranec', 'tkan': 'lyon', 'stropy': 'plechi'}, 'result': 'fail', 'reason': 'lyon', 'try': 'купол из льна', 'title': 'Жёсткая посадка', 'small': 'купол раскрылся поздно',
                'text': 'Лён тяжёлый и плохо складывается, поэтому Котельников заменил его лёгким шёлком. По физике тяжёлая плотная ткань дольше наполняется воздухом: купол раскрылся у самой земли.', 'timeline': tl,
                'hint': 'Что сделать сейчас: нажми «Ещё раз» и сшей купол из шёлка с тросиком в кромке.'}
    tl += [
        {'t': 9.4, 'do': 'rotate', 'id': 'telo', 'to': [0, 0, 70], 'dur': 0.6}, {'t': 9.6, 'do': 'rotate', 'id': 'telo', 'spin': [0, 260, 0]},
        {'t': 9.5, 'do': 'show', 'id': 'strelkaPoyas'},
        {'t': 9.4, 'do': 'move', 'id': 'lyotchik', 'to': [LX + 9, 0.35, 0], 'dur': 1.4, 'ease': 'in2'},
        {'t': 10.8, 'do': 'rotate', 'id': 'telo', 'spin': [0, 0, 0]}, {'t': 10.8, 'do': 'rotate', 'id': 'telo', 'to': [0, 0, 88], 'dur': 0.2},
        {'t': 10.8, 'do': 'sound', 'kind': 'hit', 'k': 1.1}, {'t': 10.8, 'do': 'sound', 'kind': 'wind', 'level': 0},
        {'t': 10.8, 'do': 'emit', 'kind': 'puff', 'on': 'lyotchik', 'size': 1, 'color': '#a99c78'},
        {'t': 10.8, 'do': 'move', 'id': dome, 'to': [3, 0.8, 0], 'dur': 2}, {'t': 10.8, 'do': 'rotate', 'id': dome, 'to': [0, 0, -80], 'dur': 2},
        {'t': 10.9, 'do': 'count', 'text': 'Удар о землю боком', 'small': 'поздний купол и стропы в одной точке'},
        {'t': 11.0, 'do': 'sound', 'kind': 'alarm', 'k': 0.5},
        {'t': 13, 'do': 'end'},
    ]
    return {'id': oid, 'when': {'gde': 'ranec', 'tkan': 'lyon', 'stropy': 'poyas'}, 'result': 'fail', 'reason': 'lyon', 'try': 'купол из льна', 'title': 'Удар о землю', 'small': 'две ошибки сразу',
            'text': 'Две старые ошибки сразу: тяжёлая льняная ткань раскрывается слишком медленно, а стропы в одной точке на поясе крутят лётчика.', 'timeline': tl,
            'hint': 'Что сделать сейчас: нажми «Ещё раз», выбери шёлк и две группы строп к плечам.'}

outcomes = [
    outcome_A2('ok', True, True),
    outcome_A2('lyon', False, True),
    outcome_A2('uzel', True, False),
    outcome_A2('lyon-uzel', False, False),
]
a1 = [({'gde': 'samolet', 'tkan': 'shyolk', 'stropy': 'plechi'}, 'zont'), ({'gde': 'samolet', 'tkan': 'lyon', 'stropy': 'plechi'}, 'zont-lyon'),
      ({'gde': 'samolet', 'tkan': 'shyolk', 'stropy': 'poyas'}, 'zont-uzel'), ({'gde': 'samolet', 'tkan': 'lyon', 'stropy': 'poyas'}, 'zont-vse')]
texts = {
    'zont': 'Парашют остался на самолёте, а самолёт разрушился. По физике прибор, прикреплённый к машине, падает вместе с машиной. «Зонты» на самолёте были ненадёжны.',
    'zont-lyon': 'Парашют на самолёте не достаётся лётчику, а лён ещё и тяжелее шёлка.',
    'zont-uzel': 'Главная ошибка — парашют на самолёте: он ушёл вместе с обломками.',
    'zont-vse': 'Все три решения — старые, и первое губит сразу: парашют ушёл вместе с обломками аэроплана.',
}
hints = {
    'zont': 'Что сделать сейчас: нажми «Ещё раз» и перенеси парашют на лётчика — в ранец.',
    'zont-lyon': 'Что сделать сейчас: нажми «Ещё раз», положи парашют в ранец на спину и выбери шёлк.',
    'zont-uzel': 'Что сделать сейчас: нажми «Ещё раз», положи парашют в ранец на спину, стропы — к плечам.',
    'zont-vse': 'Что сделать сейчас: нажми «Ещё раз» и начни с ранца на спине лётчика.',
}
for when, oid in a1:
    o = outcome_A1(when, oid, None); o['text'] = texts[oid]; o['hint'] = hints[oid]; outcomes.append(o)

choices = [
    {'id': 'gde', 'label': 'Где лежит парашют', 'default': 'samolet', 'options': [
        {'id': 'samolet', 'label': 'На самолёте: «зонт» на фюзеляже', 'say': 'Длинный сложенный «зонт» закреплён на фюзеляже, к лётчику идёт шнур. Так было до Котельникова.',
         'setup': [{'do': 'hide', 'id': ['ranec', 'kolco']}, {'do': 'show', 'id': ['zont', 'shnur']}, {'do': 'camera', 'pos': [-9.5, 3.6, 2.5], 'look': [-6, 1.8, 7], 'dur': 1.2}]},
        {'id': 'ranec', 'label': 'На лётчике: ранец с пружинами', 'say': 'Металлический ранец на спине лётчика: внутри пружины, на груди — кольцо.',
         'setup': [{'do': 'camera', 'pos': [1.6, 1.8, -2.4], 'look': [0, 1.25, -0.2], 'dur': 1.2}]}]},
    {'id': 'tkan', 'label': 'Из чего купол', 'default': 'lyon', 'options': [
        {'id': 'lyon', 'label': 'Плотный лён', 'say': 'Лён тяжёлый и плохо складывается: ранец стал больше и тяжелее.',
         'setup': [{'do': 'scale', 'id': 'ranec', 'to': [1.35, 1.3, 1.5], 'dur': 0.5}]},
        {'id': 'shyolk', 'label': 'Шёлк, 24 клина, тросик в кромке', 'say': 'Лёгкий шёлк складывается в маленький комок, тонкий стальной тросик в кромке помогает куполу распахнуться.'}]},
    {'id': 'stropy', 'label': 'Как стропы держат человека', 'default': 'poyas', 'options': [
        {'id': 'poyas', 'label': 'Одним узлом к поясу', 'say': 'Все стропы сходятся в один узел у пояса.', 'setup': [{'do': 'hide', 'id': 'lyamki'}]},
        {'id': 'plechi', 'label': 'Двумя группами к плечам', 'say': 'Стропы двумя группами пристёгнуты к плечевым лямкам из толстой кожи.'}]},
]

sc = {
    'id': 'kotelnikov-parashyut',
    'title': 'Котельников: первый в мире авиационный ранцевый парашют РК-1',
    # Главные объекты дня — только готовые модели glTF (проверка tools/rc3d-proverka краснеет на фигурах из примитивов).
    'glavnye': ['ranec', 'kryshka', 'chelovek', 'aeroplan', 'kotelnikov'],
    'istochniki': 'Опыт: 3D-заставка и игра по фактам дня. Размеры ранца и купола условные, высота и время на сцене сжаты. Купол из 24 клиньев, стальной тросик в кромке, 24 стропы двумя группами к плечам, ранец на спине, испытание с аэростата на 200 метров у Салюзи под Гатчиной в 1912 году — Президентская библиотека, «Ростех», История.РФ, УрФУ, «Коммерсантъ. Наука», «Гатчина-инфо». Реплики в заставке стилизованы.',
    # Небо — HDRI Poly Haven (свет и солнце из неё, резкий фон 4K-JPG), земля — аэросъёмка Poly Haven aerial_* двумя текстурами
    # с макро-маской из той же текстуры, вдали — та же текстура крупнее; дымка к горизонту экспоненциальная.
    'env': {'sky': 'day', 'ground': 'field', 'size': 12000, 'fogDensity': 0.0006, 'shadow': 22,
            'hdri': 'sky/kloofendal_48d_1k.hdr', 'background': 'sky/kloofendal_48d_bg.jpg', 'bgFloor': 0.012, 'exposure': 1.0, 'envIntensity': 1.0, 'sunI': 3.0,
            'groundTex': 'tex/aerial_grass_rock', 'groundRes': {'diffuse': '2k'}, 'groundTile': 22, 'groundTex2': 'tex/aerial_ground_rock', 'groundRes2': '2k', 'groundTile2K': 0.8,
            'groundMix': 0.75, 'groundMacro': 0.6, 'groundMaskTile': 520, 'groundFar': [40, 450, 0.65], 'groundColor': '#dcefb8',
            'grass': {'n': 7000, 'areas': [[0, 0, 10], [0, 0, 22], [0, 0, 40]], 'h': 0.3, 'base': '#4f5f26', 'tip': '#c7c07a'}},
    'camera': {'pos': [1.6, 1.8, -2.4], 'look': [0, 1.25, -0.2], 'min': 0.6, 'max': 260, 'fov': 42},
    'objects': objects,
    'zastavka': {
        'title': 'Заставка дня: испытание РК-1 у Гатчины', 'lead': 'Котельников первым в мире спрятал парашют в ранец за спиной лётчика: дёрнул кольцо — и купол спас жизнь.',
        'alt': 'Трёхмерная сцена: воздушный шар поднимает манекен с ранцем, трос обрезают, купол раскрывается, манекен опускается на поле',
        'loop': True, 'pause': 3, 'camera': {'pos': [1.4, 1.7, -2.4], 'look': [0, 1.25, -0.3], 'min': 0.6, 'max': 300, 'fov': 42},
        'objects': zastavka_objects, 'timeline': Z,
    },
    'igra': {
        'title': 'Игра: спаси лётчика', 'kicker': 'Игра в 3D · решение с последствием',
        'lead': 'Ты — помощник Котельникова в 1911 году. Собери спасательный прибор и нажми «Прыжок!»: аэроплан развалится в воздухе, и ты увидишь, спасёт ли твой прибор лётчика.',
        'alt': 'Трёхмерная сцена: лётчик-манекен в лямках на поле, рядом аэроплан. Поворачивается пальцем или мышью',
        'button': 'Прыжок!', 'resetLabel': 'Ещё раз', 'points': 30,
        'startText': 'Лётчик на поле, рядом аэроплан. Выбери три решения и нажми «Прыжок!».',
        'hint': 'Что сделать сейчас: выбери, где лежит парашют, из чего купол и как стропы держат человека, и нажми «Прыжок!». Сцену можно крутить пальцем или мышью.',
        'watchHint': 'Что сделать сейчас: ничего не нажимай — смотри, раскрылся ли купол, как быстро и висит ли лётчик ровно.',
        'again': 'Так ты уже пробовал, и лётчика спасти не удалось. Смотри внимательно, в какой момент всё сорвётся.',
        'resetSay': 'Аэроплан снова на поле, твои выборы сохранены. Уже полученные баллы повторно не начисляются.',
        'camera': {'pos': [1.6, 1.8, -2.4], 'look': [0, 1.25, -0.2], 'min': 0.6, 'max': 260, 'fov': 42},
        'objects': igra_objects,
        'choices': choices, 'outcomes': outcomes,
        'rules': {
            'zachem': 'Ты — помощник Глеба Котельникова, 1911 год. Год назад на глазах у всего Петербурга разбился лётчик Лев Мациевич. Самолёт сломался в небе, и спасти лётчика было нечем. Твоя задача — собрать прибор, который спасёт человека, если аэроплан развалится в воздухе.',
            'shagi': [
                '**Выбери, где лежит парашют.** На самолёте или на лётчике в ранце. Смотри на модель: где закреплён свёрток ткани.',
                '**Выбери ткань купола.** Лён или шёлк. Смотри, какого размера стал ранец.',
                '**Выбери, как стропы держат человека.** Одним узлом к поясу или двумя группами к плечам. Стропы — это тонкие верёвки от купола к человеку.',
                '**Нажми «Прыжок!».** Аэроплан на высоте разломится, лётчик выпадет и дёрнет кольцо.',
                '**Смотри на три вещи.** Раскрылся ли купол; как быстро он раскрылся; висит ли лётчик ровно или крутится.',
            ],
            'oshibki': [
                'Видишь: лётчик падает, а парашют улетает с обломками самолёта. Значит, парашют остался на машине, а машина сломалась. Что поменять: положи парашют в ранец на спину лётчика.',
                'Видишь: ранец огромный, купол выползает медленно и раскрывается у самой земли. Значит, ткань слишком тяжёлая — это лён. Что поменять: возьми шёлк. Шёлк лёгкий, складывается в маленький комок, а тонкий стальной тросик в краю купола помогает ему быстро распахнуться.',
                'Видишь: купол раскрылся, но лётчик крутится и падает боком, ветер тащит его по земле. Значит, все стропы сходятся в одну точку на поясе. Что поменять: раздели стропы на две группы и пристегни их к плечам. Тогда человек висит ровно и может поворачивать.',
            ],
            'povtor': 'Как повторить. Нажми «Ещё раз» — самолёт снова на поле, твои выборы сохранены. Поменяй один выбор и снова нажми «Прыжок!» — так сразу видно, что именно мешало. Над картинкой всегда написано, что сделать сейчас; счётчик под сценой показывает, сколько причин неудачи найдено, баллы за каждую начисляются один раз.',
            'final': 'Верное решение — парашют в металлическом ранце на спине, купол из шёлка с тросиком, стропы двумя группами к плечам. Лётчик дёргает кольцо, пружины выбрасывают белый купол, он раскрывается за мгновение, лётчик ровно спускается и встаёт на ноги. Так Глеб Котельников в 1911 году создал первый в мире авиационный ранцевый парашют РК-1, а в 1912 году его манекен опустился на поле под Гатчиной с высоты 200 метров.',
        },
    },
}
json.dump(sc, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('ok', OUT)
