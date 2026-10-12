# UFF Sci-fi Platform Kit

ชุดชิ้นส่วนสำหรับเกม **2.5D Side Scrolling Platform** โทนขาว–เทา แถบฟ้า เหลือง เขียว พร้อมพื้นถนนและพื้นตะแกรงแบบ Minimal Toon

## เปิดใช้งาน

- **Blender source:** [scifi-platform-kit.blend](scifi-platform-kit.blend)
- **ด่านตัวอย่าง:** [glb/level-demo.glb](glb/level-demo.glb)
- **ลองวิ่งและกระโดด:** [index.html](index.html) — เปิดผ่าน HTTP server
- **ภาพโมดูล:** [previews/module-catalog.png](previews/module-catalog.png)
- **ภาพด่าน:** [previews/level-overview.png](previews/level-overview.png)
- **Texture atlas:** [textures/scifi-handpainted-atlas.png](textures/scifi-handpainted-atlas.png)

จากราก repository รัน `python -m http.server 8765` แล้วเปิด `http://localhost:8765/studio/uff/scifi-kit/`

หน้า preview ใช้ A/D หรือ ←/→ เพื่อเดิน, Space เพื่อกระโดด, R เพื่อเริ่มใหม่ และมีปุ่มสัมผัสบนมือถือ รองรับ collision ของด้านข้าง ด้านล่าง พื้นเดิน และทางลาด ตัวละครมาจาก `../1-improved.glb` ไฟล์ต้นฉบับเกมไม่ได้ถูกเปลี่ยน หน้า preview ใช้ Three.js 0.180.0 จาก CDN จึงต้องเชื่อมต่ออินเทอร์เน็ตครั้งแรก

## โมดูลแยกชิ้น

GLB แต่ละไฟล์ฝัง texture ไว้แล้ว ไม่ต้องโหลด PNG เพิ่ม

| ไฟล์ใน `glb/` | ขนาด X × depth × thickness (เมตร) | รายละเอียด |
|---|---|---|
| `ground-panel-4m.glb` | 4 × 2.4 × 0.65 | พื้นแผ่นโลหะขาว แถบฟ้า |
| `ground-road-4m.glb` | 4 × 2.4 × 0.65 | ถนนสีเทาเข้ม เส้นแบ่งเลนเหลือง |
| `ground-grate-4m.glb` | 4 × 2.4 × 0.65 | พื้นตะแกรง แถบเขียว |
| `platform-blue-3m.glb` | 3 × 2.4 × 0.38 | แพลตฟอร์มแถบฟ้า |
| `platform-yellow-3m.glb` | 3 × 2.4 × 0.38 | แพลตฟอร์มแถบเหลือง |
| `platform-green-3m.glb` | 3 × 2.4 × 0.38 | แพลตฟอร์มแถบเขียว |
| `platform-grate-3m.glb` | 3 × 2.4 × 0.38 | แพลตฟอร์มตะแกรงแถบฟ้า |
| `platform-small-2m.glb` | 2 × 2.4 × 0.38 | แพลตฟอร์มสั้นแถบเขียว |
| `bridge-grate-6m.glb` | 6 × 2.4 × 0.45 | สะพานตะแกรงแถบเหลือง |
| `ramp-road-4m.glb` | 4 × 2.4 × 0.45 | ทางลาดถนนสูงขึ้น 1 เมตร |
| `support-pillar-2m.glb` | 0.8 × 0.8 × 2 | เสาค้ำสำหรับตกแต่ง |
| `wall-panel-2m.glb` | 2 × 0.24 × 2.4 | แผงผนังสำหรับตกแต่ง |

ความหนาในตารางคือ chassis หลัก แพลตฟอร์มและสะพานมีคานตกแต่งด้านล่างเพิ่มอีกประมาณ 0.15 เมตร ลายตะแกรงเป็น texture บนแผ่นทึบเพื่อให้ตัวละครวิ่งได้ต่อเนื่อง

## ประกอบด่านใน Blender

ไฟล์ `.blend` ใช้ Blender 5.1.2 มี collection ดังนี้:

1. `01_LEVEL_DEMO` — ด่านตัวอย่างยาว 41.5 เมตร เส้นทางพื้นล่างมีช่องกระโดด 1.5 เมตร และเส้นทางแพลตฟอร์มด้านบน แก้ตำแหน่งหรือ duplicate ชิ้นได้โดยตรง
2. `02_MODULE_LIBRARY` — ชิ้นต้นแบบ 12 แบบ ซ่อนไว้เพื่อไม่ให้ทับกันที่จุดกำเนิด เปิด collection เมื่อต้องการเลือกต้นแบบ แล้ว duplicate ไปวางในด่าน
3. `03_PROCEDURAL_SHADER_SOURCES` — วัสดุ procedural 16 แบบ พร้อม node สำหรับสี, brush grain, ลายแผ่นโลหะ, ตะแกรง และแถบ safety ซ่อนไว้จาก viewport และ render
4. `04_LIVE_GEOMETRY_NODES_TOOL` — เลือก `LIVE_Platform_Array_EDIT_MODIFIER` แล้วแก้ **Count**, **Spacing X**, **Step Height**, **Module** ใน modifier เพื่อสร้างแนวแพลตฟอร์มแบบ live ตัว generator วางไว้ลึกด้านหลังด่าน ไม่รวมใน GLB ตัวอย่าง

Blender ใช้ X วิ่งซ้าย–ขวา, Z ขึ้น–ลง, Y ความลึก ส่วน GLB และ JSON ใช้ **X วิ่ง, Y ขึ้น, Z ความลึก** การ export แปลงแกนให้อัตโนมัติ: `(X, Y, Z) Blender → (X, Z, -Y) GLB`

Pivot ของทุกชิ้นอยู่กลางด้านบนที่ระดับพื้นเดิน 0 เพื่อให้ต่อพื้นง่าย ชิ้นยาว 4 เมตรต่อกันด้วยระยะ center 4 เมตร ทางลาด pivot อยู่ที่ X กลางชิ้นและระดับ 0 ของปลายต่ำ: ปลายซ้าย X=-2 มี Y=0, ปลายขวา X=2 มี Y=1 ใน GLB เสาและผนังมี pivot กลางด้านบนและยื่นลงด้านล่าง

เมื่อต้องการ export แนว Geometry Nodes ให้เลือก generator เปิด render ของ collection หากจำเป็น แล้ว export GLB โดยเปิด **Selected Objects** และ **Apply Modifiers**; node graph มี Realize Instances ไว้แล้ว ข้อมูล UV และ material มาจากต้นแบบ

## สร้างใหม่ด้วย procedural builder

แก้ [kit-config.json](kit-config.json) เพื่อเปลี่ยน seed, ความละเอียด atlas, ความลึกโมดูล, bevel, สีแถบ, ความยาว/ความหนา/ความสูงทางลาด และรายชื่อชิ้นในด่าน ตำแหน่ง `position` ใช้แกน GLB

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe' -b --python studio/uff/scifi-kit/build_scifi_kit.py
```

หรือใช้ `blender -b --python build_scifi_kit.py -- --config kit-config.json --no-render` จากโฟลเดอร์นี้ หาก Blender อยู่ใน PATH

Builder สร้าง geometry และ shader ใน Blender, bake ลักษณะสีทาด้วยมือจาก procedural nodes เป็น atlas 2048², export GLB 12 ชิ้น + ด่าน แล้วบันทึก `.blend` ที่ยังมี shader ต้นฉบับและ Geometry Nodes อยู่ ตัว script ไม่ต้องใช้ Python package ภายนอก ทุกครั้งที่รันจะสร้าง output ของ kit นี้ใหม่ จึงควรบันทึกด่านที่แก้เองเป็นไฟล์ Blender ชื่ออื่นก่อน

GLB ที่ส่งมาผ่าน glTF Transform `dedup` และ `prune` แล้ว หากสร้างใหม่และต้องการ optimize ซ้ำ ให้รัน `npm install` แล้ว `npm run optimize` ในโฟลเดอร์ kit นี้ ไม่ใช้ Draco/Meshopt เพื่อให้โหลดได้ด้วย GLTFLoader มาตรฐาน

การแก้ procedural material ใน `.blend` ไม่ได้เปลี่ยน baked atlas ทันที ถ้าเปลี่ยนโทนสีถาวรให้แก้ `COLORS`/`make_paint()` ใน builder แล้วรันใหม่ หรือ bake emission จาก collection shader sources ด้วยตัวเอง atlas แบ่ง 4×4 ช่อง มี inset UV 2.5% ต่อช่องเพื่อลดสีรั่วเมื่อ filtering

## Collision และข้อมูลด่าน

[manifest.json](manifest.json) มีไฟล์โมดูล, ขนาด, pivot, จำนวน triangle, box/ramp collider และตำแหน่ง instance ส่วน `decor_only: true` ของเสาและผนังใช้ตกแต่งและถูกข้ามใน collision ของ preview

GLB เป็น visual asset; เอนจินต้องสร้าง collider จาก manifest หรือสร้าง proxy เอง ไม่ได้ฝัง physics engine เฉพาะค่าย ทางลาดมี vertex ของ wedge และค่า `rise` ให้สร้าง convex hull / triangle collider ได้ พื้นตกแต่งและ vent ไม่ควรใช้เป็น collision ของตัวละคร

Preview ล็อกตัวละครที่ Z=0 ใช้ความเร็ว 5 เมตร/วินาที, jump speed 8, gravity 18 จึงกระโดดสูงประมาณ 1.78 เมตร ด่านออกแบบระยะขั้นและช่องว่างให้เหมาะกับขนาดตัวละครเดิม 1.7 เมตร

## Parallax background 2 ชั้น

| ภาพ | ประเภท | ขนาด | ความเร็วเทียบกล้อง |
|---|---|---|---|
| [parallax/city-far.png](parallax/city-far.png) | RGB เมืองไกล + ท้องฟ้า | 2172 × 724 | 0.12 |
| [parallax/city-near.png](parallax/city-near.png) | RGBA เมืองชั้นใกล้ พื้นหลังโปร่งใส | 2172 × 724 | 0.30 |

เลื่อนสองภาพไปทางตรงข้ามกับการเคลื่อนกล้อง วาง far หลัง near แล้ววาง geometry เกมอยู่ด้านหน้า ภาพที่สร้างไม่ได้รับประกัน seamless โดยตรง จึงใช้ **mirrored repeat** สลับภาพปกติกับภาพกลับซ้าย–ขวาใน preview เพื่อให้ขอบชนกันโดยไม่กระโดดสี โดยยังมีรูปแบบเมืองสะท้อนเป็นจังหวะเมื่อเลื่อนไกล

ภาพสร้างด้วย built-in `imagegen` ส่วน texture ของโมดูลสร้างและ bake ใน Blender prompt ฉบับเต็มอยู่ใน [parallax/prompts.json](parallax/prompts.json)

## ตรวจสอบ

[validation.json](validation.json) บันทึกผล Khronos glTF Validator สำหรับ GLB ทุกชิ้น และ [qa-results.json](qa-results.json) บันทึกการตรวจ Geometry Nodes กับหน้า preview ตรวจภาพด่านและโมดูลหลัง render ใน Blender แล้ว

อ้างอิงเครื่องมือ: [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [glTF Transform](https://gltf-transform.dev/cli)
