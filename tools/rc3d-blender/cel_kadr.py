import bpy, math, os
M='/home/agent/worktrees/claude2-r7-3d/public/muzei/izobreteniya/igry/rc3d/assets/models/'
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
def imp(n,loc,rot=(0,0,0),s=1):
    bpy.ops.import_scene.gltf(filepath=RAW.get(n,M+n))
    obs=bpy.context.selected_objects
    root=[o for o in obs if o.parent is None]
    e=bpy.data.objects.new(n,None); sc.collection.objects.link(e)
    for o in root: o.parent=e
    e.location=loc; e.rotation_euler=[math.radians(a) for a in rot]; e.scale=(s,s,s); return e
RAW={'lyotchik-1912.glb':'/tmp/rc3d/bl/lyotchik-raw.glb','ranec-rk1.glb':'/home/agent/rc3d-proba/blender/out/ranec-rk1.raw.glb'}
for p in ['fuzelyazh','krylo-nl','krylo-nr','krylo-vl','krylo-vr','vint']: RAW['aeroplan-'+p+'.glb']='/home/agent/worktrees/claude2-r7-3d/tools/rc3d-blender/out/'+'aeroplan-'+p+'.raw.glb'
# аэроплан на высоте 400 м, летит по +X
H=400
for p in ['aeroplan-fuzelyazh','aeroplan-krylo-nl','aeroplan-krylo-nr','aeroplan-krylo-vl','aeroplan-krylo-vr','aeroplan-vint']:
    imp(p+'.glb',(0,0,H),(0,0,0))
L=imp('lyotchik-1912.glb',(1.5,-3.2,H-4.0),(70,0,20))
R=imp('ranec-rk1.glb',(0,0,0)); R.parent=L; R.location=(0,-0.18,1.3)
# земля: лоскуты полей + перелески
bpy.ops.mesh.primitive_plane_add(size=12000,location=(0,0,0)); g=bpy.context.object
bpy.ops.object.modifier_add(type='SUBSURF'); 
m=bpy.data.materials.new('zemlya'); m.use_nodes=True; nt=m.node_tree; N=nt.nodes; Lk=nt.links
bs=N['Principled BSDF']; bs.inputs['Roughness'].default_value=0.95
tc=N.new('ShaderNodeTexCoord'); v=N.new('ShaderNodeTexVoronoi'); v.inputs['Scale'].default_value=0.025
nz=N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value=0.4; nz.inputs['Detail'].default_value=12
Lk.new(tc.outputs['Object'],nz.inputs['Vector'])
mix=N.new('ShaderNodeMix'); mix.data_type='VECTOR'; mix.inputs[0].default_value=0.12
Lk.new(tc.outputs['Object'],mix.inputs[4]); Lk.new(nz.outputs['Color'],mix.inputs[5]); Lk.new(mix.outputs[1],v.inputs['Vector'])
cr=N.new('ShaderNodeValToRGB'); e=cr.color_ramp; e.interpolation='CONSTANT'
cols=[(0,(0.10,0.17,0.05)),(0.18,(0.27,0.30,0.09)),(0.38,(0.45,0.40,0.16)),(0.55,(0.16,0.24,0.07)),(0.72,(0.035,0.07,0.03)),(0.9,(0.33,0.36,0.12))]
e.elements[0].position=0; e.elements[0].color=(*cols[0][1],1); e.elements[1].position=cols[1][0]; e.elements[1].color=(*cols[1][1],1)
for p,c in cols[2:]:
    el=e.elements.new(p); el.color=(*c,1)
Lk.new(v.outputs['Color'],cr.inputs[0])
n2=N.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value=0.08; n2.inputs['Detail'].default_value=15
Lk.new(tc.outputs['Object'],n2.inputs['Vector'])
mx=N.new('ShaderNodeMix'); mx.data_type='RGBA'; mx.blend_type='OVERLAY'; mx.inputs[0].default_value=0.5
Lk.new(cr.outputs['Color'],mx.inputs[6]); Lk.new(n2.outputs['Color'],mx.inputs[7]); Lk.new(mx.outputs[2],bs.inputs['Base Color'])
bm=N.new('ShaderNodeBump'); bm.inputs['Strength'].default_value=0.6; Lk.new(n2.outputs['Fac'],bm.inputs['Height']); Lk.new(bm.outputs['Normal'],bs.inputs['Normal'])
g.data.materials.append(m)
# небо и солнце
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; sk=w.node_tree.nodes.new('ShaderNodeTexSky'); sk.sky_type='NISHITA'
sk.sun_elevation=math.radians(22); sk.sun_rotation=math.radians(200); sk.altitude=400; sk.air_density=1.6; sk.dust_density=2.5
w.node_tree.links.new(sk.outputs[0],w.node_tree.nodes['Background'].inputs[0]); w.node_tree.nodes['Background'].inputs[1].default_value=0.35
bpy.ops.object.light_add(type='SUN'); s=bpy.context.object; s.data.energy=2.2; s.data.angle=math.radians(1)
s.rotation_euler=(math.radians(68),0,math.radians(200+90))
# камера: рядом с лётчиком, взгляд вниз-вперёд, аэроплан сверху в кадре
bpy.ops.object.camera_add(location=(6.5,-10.5,H+0.5)); c=bpy.context.object; sc.camera=c
c.data.lens=20
tg=bpy.data.objects.new('t',None); sc.collection.objects.link(tg); tg.location=(0.5,0.0,H-14)
k=c.constraints.new('TRACK_TO'); k.target=tg
# дымка — туман по глубине (mist)
vl=sc.view_layers[0]; vl.use_pass_mist=True; w.mist_settings.start=60; w.mist_settings.depth=9000; w.mist_settings.falloff='QUADRATIC'
sc.render.engine='CYCLES'; sc.cycles.samples=int(os.environ.get('SMP','48')); sc.cycles.use_denoising=True
sc.render.resolution_x=1280; sc.render.resolution_y=720; sc.view_settings.view_transform='AgX'; sc.view_settings.look='AgX - Punchy'; sc.view_settings.exposure=-0.6
sc.use_nodes=True; ct=sc.node_tree; rl=ct.nodes['Render Layers']; co=ct.nodes['Composite']
mm=ct.nodes.new('CompositorNodeMixRGB'); mm.inputs[2].default_value=(0.55,0.66,0.82,1)
mul=ct.nodes.new('CompositorNodeMath'); mul.operation='MULTIPLY'; mul.inputs[1].default_value=0.55; ct.links.new(rl.outputs['Mist'],mul.inputs[0]); ct.links.new(mul.outputs[0],mm.inputs[0]); ct.links.new(rl.outputs['Image'],mm.inputs[1]); ct.links.new(mm.outputs[0],co.inputs[0])
gl=ct.nodes.new('CompositorNodeGlare'); gl.glare_type='FOG_GLOW'; gl.threshold=0.9
ct.links.new(mm.outputs[0],gl.inputs[0]); ct.links.new(gl.outputs[0],co.inputs[0])
sc.render.filepath=os.environ.get('OUT','/tmp/rc3d/shots/k9-cel.png'); bpy.ops.render.render(write_still=True)
