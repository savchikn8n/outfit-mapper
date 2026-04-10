import { useEffect, useMemo, useState } from "react";
import {
  layoutRegions,
  LAYOUT_HEIGHT,
  LAYOUT_WIDTH,
  traceRegionShape
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

      for (const layer of visibleLayers) {
        try {
          const image = await getCachedImage(layer.source);
          if (cancelled) {
            return;
          }

          const region = layoutRegions.find((entry) => entry.id === layer.targetRegion);
          if (!region) {
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

          const localX = (layer.x - editorBounds.x) / editorBounds.width;
          const localY = (layer.y - editorBounds.y) / editorBounds.height;
          const localWidth = layer.width / editorBounds.width;
          const localHeight = layer.height / editorBounds.height;
          const drawX =
            textureBounds.x +
            (region.textureFlipX ? 1 - localX - localWidth : localX) * textureBounds.width;
          const drawY =
            textureBounds.y +
            (region.textureFlipY ? 1 - localY - localHeight : localY) * textureBounds.height;
          const drawWidth = localWidth * textureBounds.width;
          const drawHeight = localHeight * textureBounds.height;

          context.save();
          context.scale(scaleX, scaleY);
          traceRegionShape(context, textureRegion);
          context.clip();
          context.scale(1 / scaleX, 1 / scaleY);
          context.globalAlpha = layer.opacity;
          context.translate(
            drawX * scaleX + (drawWidth * scaleX) / 2,
            drawY * scaleY + (drawHeight * scaleY) / 2
          );
          context.rotate((layer.rotation * Math.PI) / 180);
          context.drawImage(
            image,
            -(drawWidth * scaleX) / 2,
            -(drawHeight * scaleY) / 2,
            drawWidth * scaleX,
            drawHeight * scaleY
          );
          context.restore();
        } catch {
          // Ignore failed artwork loads so the editor remains responsive.
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
