import {
  ArtworkLayer,
  AvatarGender,
  CameraPreset,
  MannequinPresetId,
  ProjectData,
  SceneSettings,
  TargetRegion,
  UiLanguage
} from "../../types/app";
import { createId } from "../../utils/id";

const validRegions: TargetRegion[] = ["front", "back", "leftSleeve", "rightSleeve"];
const validPresets: MannequinPresetId[] = ["slim", "regular", "oversized", "neutral"];
const validGenders: AvatarGender[] = ["male", "female"];
const validLanguages: UiLanguage[] = ["en", "ru"];
const validCameraPresets: CameraPreset[] = ["front", "back", "left", "right", "perspective"];

export const defaultSceneSettings: SceneSettings = {
  mannequinPreset: "regular",
  avatarGender: "male",
  language: "ru",
  backgroundColor: "#10141b",
  shirtBaseColor: "#111111",
  wireframe: false,
  cameraPreset: "perspective"
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const asString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;

const asBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

const asEnum = <T extends string>(value: unknown, valid: readonly T[], fallback: T): T =>
  typeof value === "string" && valid.includes(value as T) ? (value as T) : fallback;

const normalizeLayer = (value: unknown, index: number): ArtworkLayer | null => {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: asString(value.id, createId("layer")),
    name: asString(value.name, `Layer ${index + 1}`),
    type: asEnum(value.type, ["png", "svg", "image"], "image"),
    source: asString(value.source, ""),
    x: asNumber(value.x, 180),
    y: asNumber(value.y, 180),
    width: Math.max(24, asNumber(value.width, 180)),
    height: Math.max(24, asNumber(value.height, 180)),
    rotation: asNumber(value.rotation, 0),
    zIndex: Math.max(1, asNumber(value.zIndex, index + 1)),
    opacity: Math.max(0, Math.min(1, asNumber(value.opacity, 1))),
    locked: asBoolean(value.locked, false),
    visible: asBoolean(value.visible, true),
    targetRegion: asEnum(value.targetRegion, validRegions, "front")
  };
};

export const normalizeProjectData = (value: unknown): ProjectData | null => {
  if (!isRecord(value)) {
    return null;
  }

  const rawScene = isRecord(value.sceneSettings) ? value.sceneSettings : {};
  const artworkLayers = Array.isArray(value.artworkLayers)
    ? value.artworkLayers.map(normalizeLayer).filter((layer): layer is ArtworkLayer => Boolean(layer))
    : [];

  return {
    id: asString(value.id, createId("project")),
    name: asString(value.name, "Untitled Project"),
    createdAt: asString(value.createdAt, new Date().toISOString()),
    updatedAt: asString(value.updatedAt, new Date().toISOString()),
    artworkLayers,
    sceneSettings: {
      mannequinPreset: asEnum(rawScene.mannequinPreset, validPresets, defaultSceneSettings.mannequinPreset),
      avatarGender: asEnum(rawScene.avatarGender, validGenders, defaultSceneSettings.avatarGender),
      language: asEnum(rawScene.language, validLanguages, defaultSceneSettings.language),
      backgroundColor: asString(rawScene.backgroundColor, defaultSceneSettings.backgroundColor),
      shirtBaseColor: asString(rawScene.shirtBaseColor, defaultSceneSettings.shirtBaseColor),
      wireframe: asBoolean(rawScene.wireframe, defaultSceneSettings.wireframe),
      cameraPreset: asEnum(rawScene.cameraPreset, validCameraPresets, defaultSceneSettings.cameraPreset)
    }
  };
};
