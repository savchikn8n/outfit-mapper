import { create } from "zustand";
import {
  ProjectData,
  ArtworkLayer,
  AvatarGender,
  CameraPreset,
  MannequinPresetId,
  SceneSettings,
  StatusMessage,
  TargetRegion,
  UiLanguage
} from "../types/app";
import { createId } from "../utils/id";

interface ProjectStore {
  project: ProjectData;
  selectedLayerId: string | null;
  textureRevision: number;
  statusMessage: StatusMessage;
  importArtwork: (params: { source: string; name: string; type: ArtworkLayer["type"] }) => void;
  selectLayer: (id: string | null) => void;
  updateLayer: (id: string, patch: Partial<ArtworkLayer>) => void;
  deleteSelectedLayer: () => void;
  duplicateSelectedLayer: () => void;
  reorderLayer: (id: string, direction: "up" | "down") => void;
  setLayerVisibility: (id: string, visible: boolean) => void;
  toggleLayerLock: (id: string) => void;
  setMannequinPreset: (preset: MannequinPresetId) => void;
  setAvatarGender: (gender: AvatarGender) => void;
  setLanguage: (language: UiLanguage) => void;
  setBackgroundColor: (color: string) => void;
  setShirtBaseColor: (color: string) => void;
  toggleWireframe: () => void;
  setCameraPreset: (preset: CameraPreset) => void;
  newProject: () => void;
  loadProject: (project: ProjectData) => void;
  setStatusMessage: (message: StatusMessage) => void;
}

const defaultSceneSettings: SceneSettings = {
  mannequinPreset: "regular",
  avatarGender: "male",
  language: "ru",
  backgroundColor: "#10141b",
  shirtBaseColor: "#111111",
  wireframe: false,
  cameraPreset: "perspective"
};

const createProject = (): ProjectData => ({
  id: createId("project"),
  name: "Untitled Project",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  artworkLayers: [],
  sceneSettings: defaultSceneSettings
});

const normalizeZ = (layers: ArtworkLayer[]) =>
  [...layers]
    .sort((left, right) => left.zIndex - right.zIndex)
    .map((layer, index) => ({ ...layer, zIndex: index + 1 }));

const touch = (project: ProjectData): ProjectData => ({
  ...project,
  updatedAt: new Date().toISOString()
});

const layerDefaultsByRegion: Record<TargetRegion, Pick<ArtworkLayer, "x" | "y" | "width" | "height">> = {
  front: { x: 180, y: 180, width: 180, height: 180 },
  back: { x: 580, y: 180, width: 180, height: 180 },
  leftSleeve: { x: 90, y: 590, width: 120, height: 120 },
  rightSleeve: { x: 470, y: 590, width: 120, height: 120 }
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: createProject(),
  selectedLayerId: null,
  textureRevision: 0,
  statusMessage: { key: "ready" },
  importArtwork: ({ source, name, type }) => {
    const project = get().project;
    const layer: ArtworkLayer = {
      id: createId("layer"),
      name,
      type,
      source,
      rotation: 0,
      zIndex: project.artworkLayers.length + 1,
      opacity: 1,
      locked: false,
      visible: true,
      targetRegion: "front",
      ...layerDefaultsByRegion.front
    };

    set({
      project: touch({
        ...project,
        artworkLayers: normalizeZ([...project.artworkLayers, layer])
      }),
      selectedLayerId: layer.id,
      textureRevision: get().textureRevision + 1,
      statusMessage: { key: "imported", value: name }
    });
  },
  selectLayer: (id) => set({ selectedLayerId: id }),
  updateLayer: (id, patch) => {
    const project = get().project;
    const artworkLayers = normalizeZ(
      project.artworkLayers.map((layer) => {
        if (layer.id !== id) {
          return layer;
        }

        const targetRegion = patch.targetRegion ?? layer.targetRegion;
        const defaults = layerDefaultsByRegion[targetRegion];

        return {
          ...layer,
          ...patch,
          x: patch.targetRegion && patch.x === undefined ? defaults.x : patch.x ?? layer.x,
          y: patch.targetRegion && patch.y === undefined ? defaults.y : patch.y ?? layer.y
        };
      })
    );

    set({
      project: touch({ ...project, artworkLayers }),
      textureRevision: get().textureRevision + 1
    });
  },
  deleteSelectedLayer: () => {
    const { selectedLayerId, project, textureRevision } = get();
    if (!selectedLayerId) {
      return;
    }

    set({
      project: touch({
        ...project,
        artworkLayers: normalizeZ(
          project.artworkLayers.filter((layer) => layer.id !== selectedLayerId)
        )
      }),
      selectedLayerId: null,
      textureRevision: textureRevision + 1,
      statusMessage: { key: "layerRemoved" }
    });
  },
  duplicateSelectedLayer: () => {
    const { selectedLayerId, project, textureRevision } = get();
    const current = project.artworkLayers.find((layer) => layer.id === selectedLayerId);
    if (!current) {
      return;
    }

    const duplicate: ArtworkLayer = {
      ...current,
      id: createId("layer"),
      name: `${current.name} Copy`,
      x: current.x + 20,
      y: current.y + 20,
      zIndex: project.artworkLayers.length + 1
    };

    set({
      project: touch({
        ...project,
        artworkLayers: normalizeZ([...project.artworkLayers, duplicate])
      }),
      selectedLayerId: duplicate.id,
      textureRevision: textureRevision + 1,
      statusMessage: { key: "layerDuplicated" }
    });
  },
  reorderLayer: (id, direction) => {
    const project = get().project;
    const ordered = [...project.artworkLayers].sort((left, right) => left.zIndex - right.zIndex);
    const index = ordered.findIndex((layer) => layer.id === id);
    const swapIndex = direction === "up" ? index + 1 : index - 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) {
      return;
    }

    [ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]];

    set({
      project: touch({
        ...project,
        artworkLayers: normalizeZ(ordered)
      }),
      textureRevision: get().textureRevision + 1
    });
  },
  setLayerVisibility: (id, visible) => {
    get().updateLayer(id, { visible });
  },
  toggleLayerLock: (id) => {
    const layer = get().project.artworkLayers.find((entry) => entry.id === id);
    if (!layer) {
      return;
    }
    get().updateLayer(id, { locked: !layer.locked });
  },
  setMannequinPreset: (preset) =>
    set((state) => ({
      project: touch({
        ...state.project,
        sceneSettings: { ...state.project.sceneSettings, mannequinPreset: preset }
      }),
      statusMessage: { key: "presetChanged", value: preset }
    })),
  setAvatarGender: (gender) =>
    set((state) => ({
      project: touch({
        ...state.project,
        sceneSettings: { ...state.project.sceneSettings, avatarGender: gender }
      }),
      statusMessage: { key: "genderChanged", value: gender }
    })),
  setLanguage: (language) =>
    set((state) => ({
      project: touch({
        ...state.project,
        sceneSettings: { ...state.project.sceneSettings, language }
      })
    })),
  setBackgroundColor: (color) =>
    set((state) => ({
      project: touch({
        ...state.project,
        sceneSettings: { ...state.project.sceneSettings, backgroundColor: color }
      })
    })),
  setShirtBaseColor: (color) =>
    set((state) => ({
      project: touch({
        ...state.project,
        sceneSettings: { ...state.project.sceneSettings, shirtBaseColor: color }
      }),
      textureRevision: state.textureRevision + 1
    })),
  toggleWireframe: () =>
    set((state) => ({
      project: touch({
        ...state.project,
        sceneSettings: {
          ...state.project.sceneSettings,
          wireframe: !state.project.sceneSettings.wireframe
        }
      })
    })),
  setCameraPreset: (preset) =>
    set((state) => ({
      project: touch({
        ...state.project,
        sceneSettings: { ...state.project.sceneSettings, cameraPreset: preset }
      })
    })),
  newProject: () =>
    set({
      project: createProject(),
      selectedLayerId: null,
      textureRevision: get().textureRevision + 1,
      statusMessage: { key: "newProject" }
    }),
  loadProject: (project) =>
    set({
      project: {
        ...project,
        sceneSettings: {
          ...defaultSceneSettings,
          ...project.sceneSettings
        },
        artworkLayers: normalizeZ(project.artworkLayers)
      },
      selectedLayerId: project.artworkLayers[0]?.id ?? null,
      textureRevision: get().textureRevision + 1,
      statusMessage: { key: "projectLoaded", value: project.name }
    }),
  setStatusMessage: (message) => set({ statusMessage: message })
}));
