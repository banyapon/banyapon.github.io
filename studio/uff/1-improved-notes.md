# Improved texture atlas for 1.glb

- Model: `1-improved.glb` (texture embedded; no external image required).
- Editable atlas: `1-improved-basecolor.png`, 4096 × 4096, sRGB.
- Preview: `1-improved-preview.png`.
- Original `1.glb` is preserved.

The existing UV islands were repacked with a fractional margin of 0.008. The original artwork was transferred with an emission bake in Blender 5.1.2, with 12-pixel color dilation around island borders. Texture wrapping is now CLAMP_TO_EDGE. This improves filtering at island borders; the 4K bake preserves the source artwork and does not invent new detail.

Validation:

- Khronos glTF Validator: zero errors, one existing warning (`NODE_SKINNED_MESH_NON_ROOT`, also present in the original).
- All geometry, normal, skin weight, joint, inverse bind matrix and animation accessor bytes are unchanged. Nodes, skins, mesh definitions and all 11 animations are unchanged.
- UV coordinates are finite and within [0, 1].
- A 1024 × 1024 triangle-interior raster check found zero overlapping UV pixels. This is a sampled check, not a mathematical guarantee at every resolution.
- Front, back and side rest-pose renders were inspected for texture alignment.

Use `1-improved.glb` in place of `1.glb` to load the improved atlas. No application references were changed.
