import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ArtworkLayer, TargetRegion } from "../../../types/app";
import { layoutRegions, traceRegionShape } from "../../layout2d/layoutRegions";
import { loadImageElement } from "../../../utils/image";

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

const createRegionCanvas = async (regionId: TargetRegion, layers: ArtworkLayer[]) => {
  const region = layoutRegions.find((entry) => entry.id === regionId);
  if (!region) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round((region.height / region.width) * 1024);
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const scaleX = canvas.width / region.width;
  const scaleY = canvas.height / region.height;

  context.save();
  context.scale(scaleX, scaleY);
  traceRegionShape(context, { ...region, x: 0, y: 0 });
  context.clip();

  const regionLayers = layers
    .filter((layer) => layer.visible && layer.targetRegion === regionId)
    .sort((left, right) => left.zIndex - right.zIndex);

  for (const layer of regionLayers) {
    try {
      const image = await getCachedImage(layer.source);
      context.save();
      context.globalAlpha = layer.opacity;
      context.translate(layer.x - region.x + layer.width / 2, layer.y - region.y + layer.height / 2);
      context.rotate((layer.rotation * Math.PI) / 180);
      context.drawImage(image, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
      context.restore();
    } catch {
      // Ignore bad assets for MVP stability.
    }
  }

  context.restore();
  return canvas;
};

export const useDecalTextures = (layers: ArtworkLayer[], revision: number) => {
  const [readyRevision, setReadyRevision] = useState(0);
  const textures = useMemo(
    () => ({
      front: new THREE.CanvasTexture(document.createElement("canvas")),
      back: new THREE.CanvasTexture(document.createElement("canvas"))
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    const build = async () => {
      const [frontCanvas, backCanvas] = await Promise.all([
        createRegionCanvas("front", layers),
        createRegionCanvas("back", layers)
      ]);

      if (cancelled) {
        return;
      }

      const applyCanvas = (
        texture: THREE.CanvasTexture,
        sourceCanvas: HTMLCanvasElement | null
      ) => {
        const canvas = texture.image as HTMLCanvasElement;
        const context = canvas.getContext("2d");
        if (!context || !sourceCanvas) {
          return;
        }

        canvas.width = sourceCanvas.width;
        canvas.height = sourceCanvas.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(0, canvas.height);
        context.scale(1, -1);
        context.drawImage(sourceCanvas, 0, 0);
        context.restore();
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
        texture.needsUpdate = true;
      };

      applyCanvas(textures.front, frontCanvas);
      applyCanvas(textures.back, backCanvas);
      setReadyRevision(revision);
    };

    void build();

    return () => {
      cancelled = true;
    };
  }, [layers, revision, textures]);

  return { textures, readyRevision };
};
