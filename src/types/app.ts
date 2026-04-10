export type TargetRegion = "front" | "back" | "leftSleeve" | "rightSleeve";

export type ArtworkType = "png" | "svg" | "image";

export type CameraPreset = "front" | "back" | "left" | "right" | "perspective";

export type MannequinPresetId = "slim" | "regular" | "oversized" | "neutral";
export type AvatarGender = "male" | "female";
export type UiLanguage = "en" | "ru";

export interface ArtworkLayer {
  id: string;
  name: string;
  type: ArtworkType;
  source: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  targetRegion: TargetRegion;
}

export interface SceneSettings {
  mannequinPreset: MannequinPresetId;
  avatarGender: AvatarGender;
  language: UiLanguage;
  backgroundColor: string;
  shirtBaseColor: string;
  wireframe: boolean;
  cameraPreset: CameraPreset;
}

export interface ProjectData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  artworkLayers: ArtworkLayer[];
  sceneSettings: SceneSettings;
}

export interface RegionDefinition {
  id: TargetRegion;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points?: ReadonlyArray<readonly [number, number]>;
  templateSource?: string;
  templateWidth?: number;
  templateHeight?: number;
  editorBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  placementBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  textureBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  texturePoints?: ReadonlyArray<readonly [number, number]>;
  textureFlipY?: boolean;
  textureFlipX?: boolean;
  textureCalibration?: {
    offsetX?: number;
    offsetY?: number;
    scaleX?: number;
    scaleY?: number;
  };
}

export interface AvatarPreset {
  id: MannequinPresetId;
  bodyScale: [number, number, number];
  shirtScale: [number, number, number];
  shirtLength: number;
}

export type StatusMessageKey =
  | "ready"
  | "imported"
  | "layerRemoved"
  | "layerDuplicated"
  | "presetChanged"
  | "genderChanged"
  | "layoutExported"
  | "previewExported"
  | "projectExported"
  | "projectSaved"
  | "projectOpenFailed"
  | "newProject"
  | "projectLoaded";

export interface StatusMessage {
  key: StatusMessageKey;
  value?: string;
}
