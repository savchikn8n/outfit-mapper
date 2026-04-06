# OutFit Mapper MVP

Production-oriented MVP scaffold built web-first on React, TypeScript, and Vite, with an optional Tauri 2 desktop shell for macOS.

## Features

- Split-screen desktop UI with a 3D preview on the left and a UV layout editor on the right
- Real-time shirt texture generation from an offscreen canvas
- Artwork import for PNG and SVG files
- Layer editing: move, scale, rotate, duplicate, delete, lock, visibility, and ordering
- Mannequin preset system with a future custom-avatar placeholder
- Project JSON save/load flow and PNG export for both layout and 3D viewport
- Placeholder mannequin geometry so the app runs before final GLB assets exist

## Setup

1. Install Node.js 20+.
2. Install dependencies:

```bash
npm install
```

Optional desktop shell:

1. Install Rust/Cargo.
2. Install Tauri system prerequisites for macOS.

## Run

Primary web dev mode:

```bash
npm run dev
```

Optional Tauri desktop mode:

```bash
npm run tauri:dev
```

Web production build:

```bash
npm run build
```

Desktop build:

```bash
npm run tauri:build
```

## Asset handoff

Current MVP uses procedural placeholder geometry in [ViewerScene.tsx](/Users/apolo/Documents/OutFit Mapper/src/features/viewer3d/components/ViewerScene.tsx).

When the real mannequin and shirt model are ready:

1. Place `mannequin.glb` into [public/models/README.md](/Users/apolo/Documents/OutFit Mapper/public/models/README.md)'s directory: `/Users/apolo/Documents/OutFit Mapper/public/models/`.
2. Update [ViewerScene.tsx](/Users/apolo/Documents/OutFit Mapper/src/features/viewer3d/components/ViewerScene.tsx) to load the GLB and target the shirt mesh material with the generated texture.
3. Keep the existing Zustand state and `useTextureComposer` pipeline unchanged.

## Project structure

- [src/app/App.tsx](/Users/apolo/Documents/OutFit Mapper/src/app/App.tsx): root composition
- [src/store/projectStore.ts](/Users/apolo/Documents/OutFit Mapper/src/store/projectStore.ts): app and project state
- [src/features/layout2d/hooks/useTextureComposer.ts](/Users/apolo/Documents/OutFit Mapper/src/features/layout2d/hooks/useTextureComposer.ts): offscreen UV texture renderer
- [src/features/layout2d/components/LayoutEditor.tsx](/Users/apolo/Documents/OutFit Mapper/src/features/layout2d/components/LayoutEditor.tsx): Konva editor
- [src/features/viewer3d/components/ViewerScene.tsx](/Users/apolo/Documents/OutFit Mapper/src/features/viewer3d/components/ViewerScene.tsx): Three.js preview scene
- [src-tauri/tauri.conf.json](/Users/apolo/Documents/OutFit Mapper/src-tauri/tauri.conf.json): desktop window and build config

## Notes

- The current codebase is already web-ready. Tauri is optional and can be treated as a packaging target rather than the primary runtime.
- Project persistence uses browser-safe local storage plus JSON import/export for the MVP.
- The codebase includes a clear placeholder for future photo-based custom avatar generation, but does not attempt AI reconstruction in this version.

## Next iteration roadmap

1. Replace placeholder mannequin geometry with a production GLB mannequin and a cleanly separated shirt mesh.
2. Add proper UV islands and per-panel clipping so front, back, and sleeves map to exact garment UV coordinates.
3. Support multi-select, alignment tools, snapping, and guide lines in the 2D editor.
4. Add richer asset controls including blend modes, masks, and per-layer color adjustments.
5. Store projects with native Tauri filesystem dialogs and recent-project history.
6. Export higher-resolution print textures and turntable preview renders.
7. Add real material presets for cotton, jersey, and performance fabrics.
8. Introduce scene presets for lighting rigs, backgrounds, and studio environments.
9. Build a proper asset ingestion pipeline for SVG parsing, font handling, and linked image sanitation.
10. Add a future custom-avatar-from-photos workflow with calibration, body measurement fitting, and mesh generation.
