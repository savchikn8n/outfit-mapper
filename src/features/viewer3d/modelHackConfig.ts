import { TargetRegion } from "../../types/app";

export const MODEL_URL = "/models/black-tshirt-model.glb";
export const MODEL_BASE_TEXTURE_URL = "/models/black-tshirt-source-texture.jpg";

export const MODEL_REGION_PROJECTIONS: Record<
  TargetRegion,
  { x: number; y: number; width: number; height: number; supported: boolean }
> = {
  front: { x: 0.06, y: 0.18, width: 0.36, height: 0.44, supported: true },
  back: { x: 0.21, y: 0.57, width: 0.38, height: 0.31, supported: true },
  leftSleeve: { x: 0.01, y: 0.15, width: 0.14, height: 0.22, supported: false },
  rightSleeve: { x: 0.78, y: 0.57, width: 0.16, height: 0.2, supported: false }
};

export const SHIRT_MASK_SETTINGS = {
  maxLuminance: 58,
  maxChroma: 52
};
