import { useEffect, useMemo, useState } from "react";
import { layoutRegions, traceRegionShape } from "../layoutRegions";
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

      const scaleX = canvas.width / 960;
      const scaleY = canvas.height / 900;

      for (const region of layoutRegions) {
        context.save();
        context.scale(scaleX, scaleY);
        context.fillStyle = region.color;
        context.globalAlpha = 0.12;
        traceRegionShape(context, region);
        context.fill();
        context.restore();
      }

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

          context.save();
          context.scale(scaleX, scaleY);
          traceRegionShape(context, region);
          context.clip();
          context.scale(1 / scaleX, 1 / scaleY);
          context.globalAlpha = layer.opacity;
          context.translate(layer.x * scaleX + (layer.width * scaleX) / 2, layer.y * scaleY + (layer.height * scaleY) / 2);
          context.rotate((layer.rotation * Math.PI) / 180);
          context.drawImage(
            image,
            -(layer.width * scaleX) / 2,
            -(layer.height * scaleY) / 2,
            layer.width * scaleX,
            layer.height * scaleY
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
