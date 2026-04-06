Drop final mannequin assets here.

Expected future structure:

- `mannequin.glb`: full mannequin with a separate shirt mesh
- `mannequin-textures/`: optional PBR maps for body and garments

Current MVP behavior:

- The app uses procedural placeholder geometry when no GLB is present.
- Replace `src/features/viewer3d/components/ViewerScene.tsx` with a GLTF loader path later without changing the editor or texture pipeline.
