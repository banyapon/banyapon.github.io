"""Run with Blender: blender -b --python build_scifi_kit.py -- --config kit-config.json.

No external Python modules. Rebuilds only this kit's generated outputs.
The JSON positions use glTF coordinates (X run, Y up, Z depth).
"""
import argparse
import json
import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector

BASE = Path(__file__).resolve().parent
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument('--config', default=str(BASE / 'kit-config.json'))
parser.add_argument('--no-render', action='store_true')
args = parser.parse_args(argv)
CONFIG = json.loads(Path(args.config).read_text(encoding='utf-8'))
random.seed(CONFIG['seed'])
for folder in ('glb', 'textures', 'previews'):
    (BASE / folder).mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.engine = 'CYCLES'
scene.cycles.samples = 1
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'

COLORS = {
    'white': (0.80, 0.85, 0.86, 1),
    'gray': (0.38, 0.46, 0.50, 1),
    'dark': (0.065, 0.105, 0.14, 1),
    'cyan': (0.025, 0.56, 0.80, 1),
    'yellow': (0.96, 0.63, 0.085, 1),
    'green': (0.18, 0.65, 0.34, 1),
    'highlight': (0.95, 0.98, 0.98, 1),
    'steel': (0.22, 0.30, 0.34, 1),
    'panel': (0.73, 0.81, 0.83, 1),
    'road': (0.12, 0.17, 0.21, 1),
    'grate': (0.14, 0.22, 0.25, 1),
    'hazard': (0.94, 0.62, 0.09, 1),
    'glass': (0.10, 0.72, 0.85, 1),
    'mint': (0.47, 0.81, 0.64, 1),
    'warm': (0.91, 0.85, 0.72, 1),
    'shadow': (0.18, 0.25, 0.29, 1),
}
CELLS = {name: i for i, name in enumerate(COLORS)}
SIZE = CONFIG['atlas_size']
atlas = bpy.data.images.new('SciFi handpainted procedural atlas', width=SIZE, height=SIZE, alpha=False)
atlas.colorspace_settings.name = 'sRGB'


def math_node(nodes, operation, a=None, b=None):
    node = nodes.new('ShaderNodeMath')
    node.operation = operation
    if a is not None:
        node.inputs[0].default_value = a
    if b is not None:
        node.inputs[1].default_value = b
    return node


def make_paint(name, color):
    """Editable procedural source shaders: layered brush noise and graphic motifs."""
    mat = bpy.data.materials.new('PROC_' + name)
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    nodes.clear()
    coord = nodes.new('ShaderNodeTexCoord')
    coord.location = (-950, 50)
    noise = nodes.new('ShaderNodeTexNoise')
    noise.noise_dimensions = '4D'
    noise.inputs['W'].default_value = random.uniform(0, 100)
    noise.label = 'Broad handpainted pigment variation'
    noise.inputs['Scale'].default_value = 5
    noise.inputs['Detail'].default_value = 2
    noise.inputs['Roughness'].default_value = 0.65
    noise.location = (-700, 220)
    links.new(coord.outputs['Generated'], noise.inputs['Vector'])
    mapping = nodes.new('ShaderNodeVectorMath')
    mapping.operation = 'MULTIPLY'
    mapping.inputs[1].default_value = (2, 45, 1)
    links.new(coord.outputs['Generated'], mapping.inputs[0])
    grain = nodes.new('ShaderNodeTexNoise')
    grain.noise_dimensions = '4D'
    grain.inputs['W'].default_value = random.uniform(0, 100)
    grain.label = 'Fine directional brush grain'
    grain.inputs['Scale'].default_value = 3
    grain.inputs['Detail'].default_value = 1
    links.new(mapping.outputs[0], grain.inputs['Vector'])
    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.location = (-420, 200)
    ramp.color_ramp.elements[0].position = 0.18
    ramp.color_ramp.elements[0].color = tuple(c * 0.92 for c in color[:3]) + (1,)
    ramp.color_ramp.elements[1].position = 0.83
    ramp.color_ramp.elements[1].color = tuple(min(1, c * 1.04 + 0.01) for c in color[:3]) + (1,)
    links.new(noise.outputs['Fac'], ramp.inputs[0])
    mix = nodes.new('ShaderNodeMixRGB')
    mix.blend_type = 'MULTIPLY'
    mix.inputs[0].default_value = 0.075
    links.new(ramp.outputs[0], mix.inputs[1])
    links.new(grain.outputs['Fac'], mix.inputs[2])
    color_out = mix.outputs[0]
    if name in ('grate', 'hazard', 'panel'):
        separate = nodes.new('ShaderNodeSeparateXYZ')
        links.new(coord.outputs['Generated'], separate.inputs[0])
        masks = []
        for axis in ('X', 'Y'):
            multiply = math_node(nodes, 'MULTIPLY', b=12 if name == 'grate' else 4)
            links.new(separate.outputs[axis], multiply.inputs[0])
            fraction = math_node(nodes, 'FRACT')
            links.new(multiply.outputs[0], fraction.inputs[0])
            threshold = math_node(nodes, 'LESS_THAN', b=0.20 if name == 'grate' else 0.028)
            links.new(fraction.outputs[0], threshold.inputs[0])
            masks.append(threshold.outputs[0])
        union = math_node(nodes, 'MAXIMUM')
        links.new(masks[0], union.inputs[0])
        links.new(masks[1], union.inputs[1])
        graphic = nodes.new('ShaderNodeMixRGB')
        links.new(union.outputs[0], graphic.inputs[0])
        graphic.inputs[1].default_value = COLORS['dark'] if name == 'grate' else color
        graphic.inputs[2].default_value = COLORS['steel'] if name == 'grate' else COLORS['gray']
        color_out = graphic.outputs[0]
        if name == 'hazard':
            add = math_node(nodes, 'ADD')
            links.new(separate.outputs['X'], add.inputs[0])
            links.new(separate.outputs['Y'], add.inputs[1])
            mult = math_node(nodes, 'MULTIPLY', b=6)
            links.new(add.outputs[0], mult.inputs[0])
            frac = math_node(nodes, 'FRACT')
            links.new(mult.outputs[0], frac.inputs[0])
            cut = math_node(nodes, 'LESS_THAN', b=0.5)
            links.new(frac.outputs[0], cut.inputs[0])
            links.new(cut.outputs[0], graphic.inputs[0])
            graphic.inputs[1].default_value = COLORS['yellow']
            graphic.inputs[2].default_value = COLORS['dark']
    emission = nodes.new('ShaderNodeEmission')
    links.new(color_out, emission.inputs['Color'])
    output = nodes.new('ShaderNodeOutputMaterial')
    links.new(emission.outputs[0], output.inputs['Surface'])
    emission.location, output.location = (260, 150), (460, 150)
    target = nodes.new('ShaderNodeTexImage')
    target.image = atlas
    target.label = 'Bake target: shared exported atlas'
    target.location = (50, -250)
    nodes.active = target
    mat['source'] = 'Procedural pigment + brush grain; baked to shared atlas for glTF'
    return mat


source_materials = {name: make_paint(name, color) for name, color in COLORS.items()}
swatches = bpy.data.collections.new('03_PROCEDURAL_SHADER_SOURCES')
scene.collection.children.link(swatches)
for name, index in CELLS.items():
    bpy.ops.mesh.primitive_plane_add(size=1, location=(index % 4, index // 4, 0))
    ob = bpy.context.object
    ob.name = 'SOURCE_' + name
    for coll in list(ob.users_collection):
        coll.objects.unlink(ob)
    swatches.objects.link(ob)
    ob.data.materials.append(source_materials[name])
    for item in ob.data.uv_layers.active.data:
        u, v = item.uv
        item.uv = ((index % 4 + u) / 4, (index // 4 + v) / 4)
bpy.ops.object.select_all(action='DESELECT')
for ob in swatches.objects:
    ob.select_set(True)
bpy.context.view_layer.objects.active = list(swatches.objects)[0]
scene.render.bake.margin = 0
bpy.ops.object.bake(type='EMIT')
atlas.filepath_raw = str(BASE / 'textures/scifi-handpainted-atlas.png')
atlas.file_format = 'PNG'
atlas.save()
atlas.pack()
swatches.hide_render = True
swatches.hide_viewport = True

material = bpy.data.materials.new('SciFi_shared_baked_paint')
material.use_nodes = True
nodes, links = material.node_tree.nodes, material.node_tree.links
shader = nodes.get('Principled BSDF')
shader.inputs['Roughness'].default_value = 0.82
shader.inputs['Metallic'].default_value = 0
texture = nodes.new('ShaderNodeTexImage')
texture.image = atlas
texture.interpolation = 'Linear'
texture.extension = 'EXTEND'
links.new(texture.outputs['Color'], shader.inputs['Base Color'])
links.new(texture.outputs['Color'], shader.inputs['Emission Color'])
shader.inputs['Emission Strength'].default_value = 0.08

library = bpy.data.collections.new('02_MODULE_LIBRARY')
scene.collection.children.link(library)
modules = {}
manifest = {'units': 'meters', 'coordinates': 'glTF: X run, Y up, Z depth', 'pivot': 'center of walkable top; ramp center at low top', 'modules': {}, 'parallax': CONFIG['parallax']}
pieces = []


def assign_atlas(ob, name):
    ob.data.materials.clear()
    ob.data.materials.append(material)
    layer = ob.data.uv_layers.active or ob.data.uv_layers.new(name='UVMap')
    index = CELLS[name]
    # Insets keep filtering in the chosen palette cell, including mip levels.
    border = 0.025
    for face in ob.data.polygons:
        if abs(face.normal.z) > 0.6:
            axes = (0, 1)
        elif abs(face.normal.y) > 0.6:
            axes = (0, 2)
        else:
            axes = (1, 2)
        coords = [ob.data.vertices[ob.data.loops[i].vertex_index].co for i in face.loop_indices]
        low = [min(v[a] for v in coords) for a in axes]
        high = [max(v[a] for v in coords) for a in axes]
        for li, co in zip(face.loop_indices, coords):
            u, v = [(co[a] - lo) / max(hi - lo, 1e-6) for a, lo, hi in zip(axes, low, high)]
            layer.data[li].uv = ((index % 4 + border + u * (1 - 2 * border)) / 4, (index // 4 + border + v * (1 - 2 * border)) / 4)


def box(name, center, dims, paint='white', bevel=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    ob = bpy.context.object
    ob.name = name
    ob.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    amount = CONFIG['bevel'] if bevel is None else bevel
    if amount > 0:
        modifier = ob.modifiers.new('Painted edge bevel', 'BEVEL')
        modifier.width = min(amount, min(dims) * 0.22)
        modifier.segments = 1
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    assign_atlas(ob, paint)
    pieces.append(ob)
    return ob


def build_module(spec):
    pieces.clear()
    length, depth, thick = spec['length'], spec.get('depth', CONFIG['module_depth']), spec['thickness']
    accent, surface, kind = spec['accent'], spec['surface'], spec['kind']
    if kind in ('pillar', 'wall'):
        box('Armored white chassis', (0, 0, -thick / 2), (length, depth, thick), 'white')
    else:
        box('Armored white chassis', (0, 0, -(thick + 0.06) / 2), (length, depth, thick - 0.06), 'white')
    if kind in ('pillar', 'wall'):
        for sign in (-1, 1):
            box('Inset painted side', (0, sign * (depth / 2 + 0.006), -thick / 2), (length * 0.72, 0.025, thick * 0.76), 'gray')
            box('Colored vertical identifier', (-length * 0.24, sign * (depth / 2 + 0.024), -thick / 2), (0.11, 0.016, thick * 0.70), accent, 0.006)
            for z in (-0.26, -thick + 0.26):
                box('Edge inset', (0, sign * (depth / 2 + 0.024), z), (length * 0.65, 0.016, 0.07), 'dark', 0.005)
    else:
        # Chassis top is z=0. Insets and lane decals sit below the collision top.
        box('Deck recess', (0, 0, -0.043), (length - 0.12, depth - 0.18, 0.020), 'dark', 0.005)
        for sign in (-1, 1):
            box('Raised perimeter edge', (0, sign * (depth / 2 - 0.055), -0.025), (length, 0.11, 0.05), 'white', 0.008)
            box('Raised end frame', (sign * (length / 2 - 0.055), 0, -0.025), (0.11, depth - 0.16, 0.05), 'white', 0.008)
        segment_count = max(1, math.ceil(length / 1.0))
        seg = (length - 0.26) / segment_count
        for i in range(segment_count):
            x = -(length - 0.26) / 2 + seg * (i + 0.5)
            box('Inset deck tile', (x, 0, -0.014), (seg - 0.025, depth - 0.35, 0.024), surface, 0.009)
        for sign in (-1, 1):
            y = sign * (depth / 2 - 0.09)
            box('Top edge stripe', (0, y, -0.009), (length - 0.16, 0.075, 0.014), accent, 0.004)
            side_y = sign * (depth / 2 + 0.012)
            box('Side chassis inset', (0, side_y, -thick * 0.55), (length - 0.16, 0.035, thick * 0.46), 'gray', 0.01)
            box('Long color band', (0, side_y + sign * 0.020, -thick * 0.35), (length - 0.18, 0.02, 0.08), accent, 0.005)
            box('Bright painted edge', (0, side_y + sign * 0.021, -0.05), (length - 0.14, 0.02, 0.025), 'highlight', 0.003)
            for i in range(segment_count):
                x = -length / 2 + (i + 0.5) * length / segment_count
                box('Vent recess', (x, side_y + sign * 0.026, -thick * 0.70), (0.30, 0.025, 0.10), 'dark', 0.007)
                for k in range(3):
                    box('Vent fin', (x - 0.095 + k * 0.095, side_y + sign * 0.042, -thick * 0.70), (0.025, 0.012, 0.075), 'steel', 0.003)
        for sign in (-1, 1):
            x = sign * (length / 2 - 0.10)
            box('Join end cap', (x, 0, -0.05), (0.08, depth - 0.15, 0.085), 'gray', 0.01)
            box('End safety paint', (x, 0, -0.012), (0.085, 0.52, 0.02), 'hazard', 0.002)
        if surface == 'road':
            for i in range(segment_count):
                x = -length / 2 + (i + 0.5) * length / segment_count
                box('Road center dash', (x, 0, -0.0008), (0.48, 0.075, 0.003), 'yellow', 0)
            for sign in (-1, 1):
                box('Road shoulder line', (0, sign * (depth / 2 - 0.36), -0.0008), (length - 0.30, 0.035, 0.003), 'highlight', 0)
        if kind in ('platform', 'bridge'):
            box('Underside spine', (0, 0, -thick - 0.07), (length * 0.70, depth * 0.44, 0.15), 'dark', 0.018)
            for sign in (-1, 1):
                box('Underside accent', (sign * length * 0.27, 0, -thick - 0.14), (0.24, depth * 0.46, 0.035), accent, 0.006)
    if kind == 'ramp':
        # Shear all vertices together, preserving exactly matching UVs and lane details.
        rise = spec.get('rise', 1)
        for ob in pieces:
            for vertex in ob.data.vertices:
                x = vertex.co.x + ob.location.x
                vertex.co.z += (x / length + 0.5) * rise
            ob.data.update()
    bpy.ops.object.select_all(action='DESELECT')
    for ob in pieces:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = pieces[0]
    bpy.ops.object.join()
    ob = bpy.context.object
    ob.name = spec['id']
    # Uniform pivots at top center, regardless of chassis dimensions.
    scene.cursor.location = (0, 0, 0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for coll in list(ob.users_collection):
        coll.objects.unlink(ob)
    library.objects.link(ob)
    ob['module_id'] = spec['id']
    ob['walkable'] = kind not in ('wall', 'pillar')
    ob['length_m'] = length
    ob['depth_m'] = depth
    ob['surface'] = surface
    ob['collision_top'] = 0.0
    collider = {'shape': 'ramp' if kind == 'ramp' else 'box', 'min': [-length / 2, -thick, -depth / 2], 'max': [length / 2, 0, depth / 2], 'walkable': ob['walkable']}
    if kind == 'ramp':
        collider['rise'] = spec.get('rise', 1)
        collider['max'][1] = collider['rise']
        collider['vertices'] = [[x, y + (x / length + 0.5) * collider['rise'], z] for x in (-length / 2, length / 2) for z in (-depth / 2, depth / 2) for y in (-thick, 0)]
    manifest['modules'][spec['id']] = {'file': 'glb/' + spec['id'] + '.glb', 'kind': kind, 'length': length, 'depth': depth, 'thickness': thick, 'accent': accent, 'surface': surface, 'collider': collider, 'triangles': sum(len(f.vertices) - 2 for f in ob.data.polygons)}
    modules[spec['id']] = ob
    export_selection(BASE / 'glb' / (spec['id'] + '.glb'))
    print('EXPORTED', spec['id'], flush=True)


def export_selection(path):
    bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', use_selection=True, export_yup=True, export_apply=True, export_animations=False, export_extras=True, export_materials='EXPORT', export_texcoords=True)


for spec in CONFIG['modules']:
    build_module(spec)

level_collection = bpy.data.collections.new('01_LEVEL_DEMO')
scene.collection.children.link(level_collection)
instance_manifest = []
for index, item in enumerate(CONFIG['level']['instances']):
    source = modules[item['module']]
    ob = bpy.data.objects.new(f'{index:02d}_' + source.name, source.data)
    level_collection.objects.link(ob)
    x, y, z = item['position']
    ob.location = (x, -z, y)
    ob['module_id'] = item['module']
    ob['decor_only'] = item.get('decor_only', False)
    instance_manifest.append({'id': ob.name, **item})
bpy.ops.object.select_all(action='DESELECT')
for ob in level_collection.objects:
    ob.select_set(True)
bpy.context.view_layer.objects.active = list(level_collection.objects)[0]
export_selection(BASE / 'glb' / (CONFIG['level']['id'] + '.glb'))
manifest['level'] = {**CONFIG['level'], 'file': 'glb/' + CONFIG['level']['id'] + '.glb', 'instances': instance_manifest}

# A live Geometry Nodes tool for authoring repeated platforms without rerunning Python.
generator_collection = bpy.data.collections.new('04_LIVE_GEOMETRY_NODES_TOOL')
scene.collection.children.link(generator_collection)
generator = bpy.data.objects.new('LIVE_Platform_Array_EDIT_MODIFIER', bpy.data.meshes.new('Generator carrier'))
generator_collection.objects.link(generator)
generator.location = (0, 8, 0)
group = bpy.data.node_groups.new('SciFi Platform Array | count spacing rise', 'GeometryNodeTree')
group.interface.new_socket(name='Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
for name, socket_type, default, low, high in [('Count', 'NodeSocketInt', 6, 1, 64), ('Spacing X', 'NodeSocketFloat', 3.8, 1, 12), ('Step Height', 'NodeSocketFloat', 0.45, -2, 2)]:
    socket = group.interface.new_socket(name=name, in_out='INPUT', socket_type=socket_type)
    socket.default_value, socket.min_value, socket.max_value = default, low, high
object_socket = group.interface.new_socket(name='Module', in_out='INPUT', socket_type='NodeSocketObject')
object_socket.default_value = modules['platform-blue-3m']
nodes, links = group.nodes, group.links
inputs = nodes.new('NodeGroupInput')
inputs.location = (-600, 0)
vector = nodes.new('ShaderNodeCombineXYZ')
vector.location = (-380, 0)
links.new(inputs.outputs['Spacing X'], vector.inputs['X'])
links.new(inputs.outputs['Step Height'], vector.inputs['Z'])
line = nodes.new('GeometryNodeMeshLine')
line.mode = 'OFFSET'
line.location = (-150, 80)
links.new(inputs.outputs['Count'], line.inputs['Count'])
links.new(vector.outputs[0], line.inputs['Offset'])
info = nodes.new('GeometryNodeObjectInfo')
info.transform_space = 'ORIGINAL'
info.inputs['As Instance'].default_value = True
info.location = (-150, -160)
links.new(inputs.outputs['Module'], info.inputs['Object'])
instances = nodes.new('GeometryNodeInstanceOnPoints')
instances.location = (100, 80)
links.new(line.outputs['Mesh'], instances.inputs['Points'])
links.new(info.outputs['Geometry'], instances.inputs['Instance'])
realize = nodes.new('GeometryNodeRealizeInstances')
realize.location = (310, 80)
links.new(instances.outputs[0], realize.inputs[0])
out = nodes.new('NodeGroupOutput')
out.location = (520, 80)
links.new(realize.outputs[0], out.inputs['Geometry'])
modifier = generator.modifiers.new('Change Count / Spacing / Height / Module', 'NODES')
modifier.node_group = group
generator_collection.hide_render = True
generator['instructions'] = 'Choose any library module; edit Count, Spacing X and Step Height. Apply modifier before manual GLB export.'

library.hide_render = True
library.hide_viewport = True
world = bpy.data.worlds.new('Bright pale studio')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.60, 0.75, 0.82, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = 0.65
scene.world = world
bpy.ops.object.light_add(type='AREA', location=(10, -10, 14))
light = bpy.context.object
light.name = 'Soft daylight'
light.data.energy, light.data.size = 1800, 12
light.rotation_euler = (Vector((10, 0, 0)) - light.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.camera_add(location=(17, -36, 17))
camera = bpy.context.object
camera.name = 'Level overview camera'
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 44
camera.rotation_euler = (Vector((18, 0, 1.0)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
scene.camera = camera
scene.cycles.samples = 24
scene.render.resolution_x, scene.render.resolution_y = 1920, 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False
scene.render.filepath = str(BASE / 'previews/level-overview.png')
manifest['atlas'] = {'file': 'textures/scifi-handpainted-atlas.png', 'size': [SIZE, SIZE], 'cells': CELLS, 'inset_per_cell': 0.025, 'source': 'Blender procedural brush shaders, emission-baked'}
(BASE / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
# Store this script and its editable configuration inside the blend as well.
for filename in ('build_scifi_kit.py', 'kit-config.json'):
    text = bpy.data.texts.new(filename)
    text.write((BASE / filename).read_text(encoding='utf-8'))
bpy.ops.object.select_all(action='DESELECT')
for ob in level_collection.objects:
    ob.select_set(True)
bpy.context.view_layer.objects.active = list(level_collection.objects)[0]
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_distance = 38
            area.spaces.active.region_3d.view_location = (18, 0, 1)
            area.spaces.active.shading.type = 'MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath=str(BASE / 'scifi-platform-kit.blend'))
if not args.no_render:
    bpy.ops.render.render(write_still=True)
    # Individual module contact sheet, each displayed at a consistent scale.
    level_collection.hide_render = True
    library.hide_render = False
    library.hide_viewport = False
    for i, ob in enumerate(modules.values()):
        ob.location = ((i % 4) * 7, (i // 4) * 5.0, 0)
    camera.location = (10, -25, 28)
    camera.rotation_euler = (Vector((10, 5, -0.3)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.ortho_scale = 29
    light.location = (10, -5, 18)
    scene.render.resolution_x, scene.render.resolution_y = 1600, 1100
    scene.render.filepath = str(BASE / 'previews/module-catalog.png')
    bpy.ops.render.render(write_still=True)
print('KIT COMPLETE', BASE, flush=True)
