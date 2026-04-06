export type TargetRegion = "front" | "back" | "leftSleeve" | "rightSleeve";

export type ArtworkType = "png" | "svg" | "image";

export type CameraPreset = "front" | "back" | "left" | "right" | "perspective";

export type MannequinPresetId = "slim" | "regular" | "oversized" | "neutral";

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
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface AvatarPreset {
  id: MannequinPresetId;
  label: string;
  description: string;
  bodyScale: [number, number, number];
  shirtScale: [number, number, number];
  shirtLength: number;
}
