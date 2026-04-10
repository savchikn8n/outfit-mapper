import { useEffect, useMemo, useState } from "react";
import {
  layoutRegions,
  LAYOUT_HEIGHT,
  LAYOUT_WIDTH
} from "../layoutRegions";
import { ArtworkLayer } from "../../../types/app";
import { loadImageElement } from "../../../utils/image";

const TEXTURE_SIZE = 2048;

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

const makeCanvas = (width: number, height: number) => {
  const element = document.createElement("canvas");
  element.width = Math.max(1, width);
  element.height = Math.max(1, height);
  return element;
};

export const useTextureComposer = (
  artworkLayers: ArtworkLayer[],
  shirtBaseColor: string,
  revision: number
) => {
  const [readyRevision, setReadyRevision] = useState(0);

  const canvas = useMemo(() => {
    const element = document.createElement("canvas");
    element.width = TEXTURE_SIZE;
    element.height = TEXTURE_SIZE;
    return element;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const draw = async () => {
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = shirtBaseColor;
      context.fillRect(0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width / LAYOUT_WIDTH;
      const scaleY = canvas.height / LAYOUT_HEIGHT;

      const visibleLayers = [...artworkLayers]
        .filter((layer) => layer.visible)
        .sort((left, right) => left.zIndex - right.zIndex);

      for (const region of layoutRegions) {
        const layersForRegion = visibleLayers.filter((layer) => layer.targetRegion === region.id);
        if (layersForRegion.length === 0) {
          continue;
        }

        const textureRegion = region.texturePoints
          ? {
              ...region,
              points: region.texturePoints,
              ...(() => {
                const xs = region.texturePoints.map(([x]) => x);
                const ys = region.texturePoints.map(([, y]) => y);
                return {
                  x: Math.min(...xs),
                  y: Math.min(...ys),
                  width: Math.max(...xs) - Math.min(...xs),
                  height: Math.max(...ys) - Math.min(...ys)
                };
              })()
            }
          : region;
        const editorBounds = region.editorBounds ?? region;
        const textureBounds = region.textureBounds ?? textureRegion;
        const calibration = {
          offsetX: region.textureCalibration?.offsetX ?? 0,
          offsetY: region.textureCalibration?.offsetY ?? 0,
          scaleX: region.textureCalibration?.scaleX ?? 1,
          scaleY: region.textureCalibration?.scaleY ?? 1
        };
        const regionCanvas = makeCanvas(
          Math.round(textureBounds.width * scaleX),
          Math.round(textureBounds.height * scaleY)
        );
        const regionContext = regionCanvas.getContext("2d");
        if (!regionContext) {
          continue;
        }

        regionContext.clearRect(0, 0, regionCanvas.width, regionCanvas.height);

        for (const layer of layersForRegion) {
          try {
            const image = await getCachedImage(layer.source);
            if (cancelled) {
              return;
            }

            const localX = (layer.x - editorBounds.x) / editorBounds.width;
            const localY = (layer.y - editorBounds.y) / editorBounds.height;
            const localWidth = layer.width / editorBounds.width;
            const localHeight = layer.height / editorBounds.height;
            const baseWidth = localWidth * regionCanvas.width;
            const baseHeight = localHeight * regionCanvas.height;
            const drawWidth = baseWidth * calibration.scaleX;
            const drawHeight = baseHeight * calibration.scaleY;
            const centerX =
              ((region.textureFlipX ? 1 - localX - localWidth / 2 : localX + localWidth / 2) +
                calibration.offsetX) *
              regionCanvas.width;
            const centerY =
              ((region.textureFlipY ? 1 - localY - localHeight / 2 : localY + localHeight / 2) +
                calibration.offsetY) *
              regionCanvas.height;

            regionContext.save();
            regionContext.globalAlpha = layer.opacity;
            regionContext.translate(centerX, centerY);
            regionContext.rotate((layer.rotation * Math.PI) / 180);
            regionContext.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            regionContext.restore();
          } catch {
            // Ignore failed artwork loads so the editor remains responsive.
          }
        }

        try {
          const templateImage = region.templateSource
            ? await getCachedImage(region.templateSource)
            : null;
          if (cancelled) {
            return;
          }

          if (templateImage) {
            regionContext.save();
            regionContext.globalCompositeOperation = "destination-in";
            regionContext.drawImage(templateImage, 0, 0, regionCanvas.width, regionCanvas.height);
            regionContext.restore();
          }

          context.drawImage(
            regionCanvas,
            textureBounds.x * scaleX,
            textureBounds.y * scaleY,
            regionCanvas.width,
            regionCanvas.height
          );
        } catch {
          // Ignore failed template loads so the editor remains responsive.
        }
      }

      if (!cancelled) {
        setReadyRevision(revision);
      }
    };

    void draw();

    return () => {
      cancelled = true;
    };
  }, [artworkLayers, canvas, revision, shirtBaseColor]);

  return {
    textureCanvas: canvas,
    textureReadyRevision: readyRevision
  };
};
