"""Verify editable source: blender -b scifi-platform-kit.blend --python verify_blender.py."""
import bpy
import json
from pathlib import Path

base = Path(__file__).resolve().parent
report = {'blender': bpy.app.version_string, 'checks': {}}
checks = report['checks']
atlas = bpy.data.images.get('SciFi handpainted procedural atlas')
checks['atlasPacked'] = bool(atlas and atlas.packed_file)
checks['proceduralMaterials'] = len([m for m in bpy.data.materials if m.name.startswith('PROC_')]) == 16
checks['moduleCount'] = len(bpy.data.collections['02_MODULE_LIBRARY'].objects) == 12
generator = bpy.data.objects['LIVE_Platform_Array_EDIT_MODIFIER']
modifier = generator.modifiers[0]
socket = next(s for s in modifier.node_group.interface.items_tree if s.name == 'Count')
sample_sizes = []
for count in (3, 9):
    modifier[socket.identifier] = count
    generator.update_tag()
    bpy.context.view_layer.update()
    evaluated = generator.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    sample_sizes.append({'count': count, 'vertices': len(mesh.vertices), 'uv_layers': len(mesh.uv_layers)})
    evaluated.to_mesh_clear()
checks['geometryNodesScales'] = sample_sizes[0]['vertices'] > 0 and sample_sizes[1]['vertices'] == sample_sizes[0]['vertices'] * 3
checks['geometryNodesKeepsUV'] = all(s['uv_layers'] > 0 for s in sample_sizes)
report['geometryNodesSamples'] = sample_sizes
(base / 'qa-blender.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print('SOURCE_QA', json.dumps(report), flush=True)
if not all(checks.values()):
    raise RuntimeError('Blender source checks failed')
