import { useEffect, useMemo, useState } from "react";
import { layoutRegions } from "../../layout2d/layoutRegions";
import { ArtworkLayer, TargetRegion } from "../../../types/app";
import { loadImageElement } from "../../../utils/image";
import {
  MODEL_BASE_TEXTURE_URL,
  MODEL_REGION_PROJECTIONS,
  SHIRT_MASK_SETTINGS
} from "../modelHackConfig";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

const getCachedImage = (source: string) => {
  const cached = imageCache.get(source);
  if (cached) {
    return cached;
  }

  const request = loadImageElement(source);
  imageCache.set(source, request);
  return request;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const getRegionArtworkCanvas = async (
  regionId: TargetRegion,
  artworkLayers: ArtworkLayer[]
) => {
  const region = layoutRegions.find((entry) => entry.id === regionId);
  if (!region) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = region.width;
  canvas.height = region.height;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const regionLayers = artworkLayers
    .filter((layer) => layer.visible && layer.targetRegion === regionId)
    .sort((left, right) => left.zIndex - right.zIndex);

  for (const layer of regionLayers) {
    try {
      const image = await getCachedImage(layer.source);
      context.save();
      context.globalAlpha = layer.opacity;
      context.translate(
        layer.x - region.x + layer.width / 2,
        layer.y - region.y + layer.height / 2
      );
      context.rotate((layer.rotation * Math.PI) / 180);
      context.drawImage(
        image,
        -layer.width / 2,
        -layer.height / 2,
        layer.width,
        layer.height
      );
      context.restore();
    } catch {
      // Ignore bad layers to keep the preview stable.
    }
  }

  return canvas;
};

export const useModelTextureComposer = (
  artworkLayers: ArtworkLayer[],
  revision: number
) => {
  const [readyRevision, setReadyRevision] = useState(0);
  const canvas = useMemo(() => document.createElement("canvas"), []);

  useEffect(() => {
    let cancelled = false;

    const compose = async () => {
      const baseImage = await getCachedImage(MODEL_BASE_TEXTURE_URL);
      if (cancelled) {
        return;
      }

      canvas.width = baseImage.naturalWidth;
      canvas.height = baseImage.naturalHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      for (const regionId of Object.keys(MODEL_REGION_PROJECTIONS) as TargetRegion[]) {
        const projection = MODEL_REGION_PROJECTIONS[regionId];
        if (!projection.supported) {
          continue;
        }

        const regionCanvas = await getRegionArtworkCanvas(regionId, artworkLayers);
        if (!regionCanvas || cancelled) {
          continue;
        }

        const targetX = Math.round(projection.x * canvas.width);
        const targetY = Math.round(projection.y * canvas.height);
        const targetWidth = Math.round(projection.width * canvas.width);
        const targetHeight = Math.round(projection.height * canvas.height);
        if (targetWidth <= 0 || targetHeight <= 0) {
          continue;
        }

        const artworkCanvas = document.createElement("canvas");
        artworkCanvas.width = targetWidth;
        artworkCanvas.height = targetHeight;
        const artworkContext = artworkCanvas.getContext("2d");
        if (!artworkContext) {
          continue;
        }

        artworkContext.clearRect(0, 0, artworkCanvas.width, artworkCanvas.height);
        artworkContext.drawImage(
          regionCanvas,
          0,
          0,
          regionCanvas.width,
          regionCanvas.height,
          0,
          0,
          artworkCanvas.width,
          artworkCanvas.height
        );

        const artworkData = artworkContext.getImageData(
          0,
          0,
          artworkCanvas.width,
          artworkCanvas.height
        );

        const baseProbeCanvas = document.createElement("canvas");
        baseProbeCanvas.width = targetWidth;
        baseProbeCanvas.height = targetHeight;
        const baseProbeContext = baseProbeCanvas.getContext("2d");
        if (!baseProbeContext) {
          continue;
        }

        baseProbeContext.drawImage(
          baseImage,
          targetX,
          targetY,
          targetWidth,
          targetHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        const baseData = baseProbeContext.getImageData(0, 0, targetWidth, targetHeight);
        const maskCenterX = targetWidth * 0.5;
        const maskCenterY = targetHeight * 0.5;
        const maskRadiusX = (targetWidth * projection.maskScaleX) / 2;
        const maskRadiusY = (targetHeight * projection.maskScaleY) / 2;
        const maskOffsetX = targetWidth * projection.maskInsetX - targetWidth * 0.07;
        const maskOffsetY = targetHeight * projection.maskInsetY - targetHeight * 0.05;

        for (let index = 0; index < artworkData.data.length; index += 4) {
          const alpha = artworkData.data[index + 3];
          if (alpha === 0) {
            continue;
          }

          const pixel = index / 4;
          const px = pixel % targetWidth;
          const py = Math.floor(pixel / targetWidth);

          const red = baseData.data[index];
          const green = baseData.data[index + 1];
          const blue = baseData.data[index + 2];

          const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
          const chroma =
            Math.max(red, green, blue) - Math.min(red, green, blue);

          const shirtConfidence =
            clamp(
              (SHIRT_MASK_SETTINGS.maxLuminance - luminance) /
                SHIRT_MASK_SETTINGS.maxLuminance,
              0,
              1
            ) *
            clamp(
              (SHIRT_MASK_SETTINGS.maxChroma - chroma) /
                SHIRT_MASK_SETTINGS.maxChroma,
              0,
              1
            );

          const ellipseX = (px - (maskCenterX + maskOffsetX)) / Math.max(maskRadiusX, 1);
          const ellipseY = (py - (maskCenterY + maskOffsetY)) / Math.max(maskRadiusY, 1);
          const ellipseDistance = ellipseX * ellipseX + ellipseY * ellipseY;
          const shapeConfidence = clamp(1.08 - ellipseDistance, 0, 1);
          const finalConfidence = shirtConfidence * shapeConfidence;

          if (finalConfidence <= 0.06) {
            artworkData.data[index + 3] = 0;
            continue;
          }

          const lightFactor = 0.72 + luminance / 255 / 2.2;
          artworkData.data[index] = clamp(
            artworkData.data[index] * lightFactor,
            0,
            255
          );
          artworkData.data[index + 1] = clamp(
            artworkData.data[index + 1] * lightFactor,
            0,
            255
          );
          artworkData.data[index + 2] = clamp(
            artworkData.data[index + 2] * lightFactor,
            0,
            255
          );
          artworkData.data[index + 3] = clamp(
            alpha * (0.18 + finalConfidence * 0.96),
            0,
            255
          );
        }

        artworkContext.putImageData(artworkData, 0, 0);
        context.drawImage(artworkCanvas, targetX, targetY, targetWidth, targetHeight);
      }

      if (!cancelled) {
        setReadyRevision(revision);
      }
    };

    void compose();

    return () => {
      cancelled = true;
    };
  }, [artworkLayers, canvas, revision]);

  return {
    textureCanvas: canvas,
    textureReadyRevision: readyRevision
  };
};
