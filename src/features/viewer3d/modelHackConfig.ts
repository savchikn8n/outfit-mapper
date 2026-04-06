import { TargetRegion } from "../../types/app";

export const MODEL_URL = "/models/black-tshirt-model.glb";
export const MODEL_BASE_TEXTURE_URL = "/models/black-tshirt-source-texture.jpg";

export const MODEL_REGION_PROJECTIONS: Record<
  TargetRegion,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    supported: boolean;
    maskInsetX: number;
    maskInsetY: number;
    maskScaleX: number;
    maskScaleY: number;
  }
> = {
  front: {
    x: 0.09,
    y: 0.2,
    width: 0.28,
    height: 0.35,
    supported: true,
    maskInsetX: 0.14,
    maskInsetY: 0.07,
    maskScaleX: 0.72,
    maskScaleY: 0.82
  },
  back: {
    x: 0.24,
    y: 0.59,
    width: 0.3,
    height: 0.24,
    supported: true,
    maskInsetX: 0.12,
    maskInsetY: 0.12,
    maskScaleX: 0.76,
    maskScaleY: 0.72
  },
  leftSleeve: {
    x: 0.01,
    y: 0.15,
    width: 0.14,
    height: 0.22,
    supported: false,
    maskInsetX: 0,
    maskInsetY: 0,
    maskScaleX: 1,
    maskScaleY: 1
  },
  rightSleeve: {
    x: 0.78,
    y: 0.57,
    width: 0.16,
    height: 0.2,
    supported: false,
    maskInsetX: 0,
    maskInsetY: 0,
    maskScaleX: 1,
    maskScaleY: 1
  }
};

export const SHIRT_MASK_SETTINGS = {
  maxLuminance: 48,
  maxChroma: 36
};
