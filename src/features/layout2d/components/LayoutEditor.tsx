import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Group, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import { ArtworkLayer } from "../../../types/app";
import { useI18n } from "../../../app/i18n";
import { layoutRegions, LAYOUT_HEIGHT, LAYOUT_WIDTH } from "../layoutRegions";
import { ArtworkNode } from "./ArtworkNode";

interface LayoutEditorProps {
  layers: ArtworkLayer[];
  activeRegion: "front" | "back" | "leftSleeve" | "rightSleeve" | "all";
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onChangeLayer: (id: string, patch: Partial<ArtworkLayer>) => void;
  onStageReady: (stage: Konva.Stage) => void;
}

const stagePadding = 32;

export const LayoutEditor = ({
  layers,
  activeRegion,
  selectedLayerId,
  onSelectLayer,
  onChangeLayer,
  onStageReady
}: LayoutEditorProps) => {
  const { getRegionLabel } = useI18n();
  const [stageSize, setStageSize] = useState({ width: 980, height: 920 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedLayerId) ?? null,
    [layers, selectedLayerId]
  );

  useEffect(() => {
    const resize = () => {
      const width = containerRef.current?.clientWidth ?? 980;
      const height = containerRef.current?.clientHeight ?? 920;
      setStageSize({ width, height });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (stageRef.current) {
      onStageReady(stageRef.current);
    }
  }, [onStageReady]);

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (!stage || !transformer) {
      return;
    }

    if (!selectedLayerId) {
      transformer.nodes([]);
      return;
    }

    const node = stage.findOne(`#${selectedLayerId}`);
    if (node) {
      transformer.nodes([node]);
    } else {
      transformer.nodes([]);
    }
  }, [selectedLayerId, layers]);

  const scale = Math.min(
    (stageSize.width - stagePadding) /
      (activeRegion === "all"
        ? LAYOUT_WIDTH
        : (layoutRegions.find((region) => region.id === activeRegion)?.width ?? LAYOUT_WIDTH) + 120),
    (stageSize.height - stagePadding) /
      (activeRegion === "all"
        ? LAYOUT_HEIGHT
        : (layoutRegions.find((region) => region.id === activeRegion)?.height ?? LAYOUT_HEIGHT) + 120)
  );

  const visibleRegions =
    activeRegion === "all"
      ? layoutRegions
      : layoutRegions.filter((region) => region.id === activeRegion);

  const regionBounds =
    activeRegion === "all"
      ? { x: 0, y: 0, width: LAYOUT_WIDTH, height: LAYOUT_HEIGHT }
      : (() => {
          const region = layoutRegions.find((entry) => entry.id === activeRegion);
          if (!region) {
            return { x: 0, y: 0, width: LAYOUT_WIDTH, height: LAYOUT_HEIGHT };
          }
          return {
            x: Math.max(0, region.x - 60),
            y: Math.max(0, region.y - 60),
            width: Math.min(LAYOUT_WIDTH, region.width + 120),
            height: Math.min(LAYOUT_HEIGHT, region.height + 120)
          };
        })();

  const offsetX =
    stagePadding / 2 -
    regionBounds.x * scale +
    (stageSize.width - stagePadding - regionBounds.width * scale) / 2;
  const offsetY =
    stagePadding / 2 -
    regionBounds.y * scale +
    (stageSize.height - stagePadding - regionBounds.height * scale) / 2;

  return (
    <div className="layout-stage-shell" ref={containerRef}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={(event) => {
          if (event.target === event.target.getStage()) {
            onSelectLayer(null);
          }
        }}
      >
        <Layer scaleX={scale} scaleY={scale} x={offsetX} y={offsetY}>
          <Rect
            x={0}
            y={0}
            width={LAYOUT_WIDTH}
            height={LAYOUT_HEIGHT}
            fill="#0f141d"
            cornerRadius={24}
          />

          {visibleRegions.map((region) => (
            <Group key={region.id}>
              <Rect
                x={region.x}
                y={region.y}
                width={region.width}
                height={region.height}
                fill={region.color}
                opacity={0.9}
                stroke="#607089"
                strokeWidth={2}
                cornerRadius={18}
              />
              <Text
                x={region.x}
                y={region.y - 28}
                text={getRegionLabel(region.id)}
                fill="#c7d4e8"
                fontSize={18}
                fontStyle="bold"
              />
            </Group>
          ))}

          {[...layers]
            .sort((left, right) => left.zIndex - right.zIndex)
            .map((layer) => (
              <ArtworkNode
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerId === layer.id}
                onSelect={() => !layer.locked && onSelectLayer(layer.id)}
              />
            ))}

          <Transformer
            ref={transformerRef}
            rotateEnabled
            borderStroke="#8fd0ff"
            anchorStroke="#8fd0ff"
            anchorFill="#0d2236"
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right"
            ]}
            ignoreStroke
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 24 || newBox.height < 24) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>

      {selectedLayer && stageRef.current && (
        <LayoutEditorBindings
          stage={stageRef.current}
          layer={selectedLayer}
          onChangeLayer={onChangeLayer}
        />
      )}
    </div>
  );
};

interface LayoutEditorBindingsProps {
  stage: Konva.Stage;
  layer: ArtworkLayer;
  onChangeLayer: (id: string, patch: Partial<ArtworkLayer>) => void;
}

const LayoutEditorBindings = ({
  stage,
  layer,
  onChangeLayer
}: LayoutEditorBindingsProps) => {
  useEffect(() => {
    const node = stage.findOne(`#${layer.id}`) as Konva.Group | null;
    if (!node) {
      return;
    }

    node.id(layer.id);
    node.draggable(!layer.locked);
    node.off("dragend.mvp transformend.mvp");

    node.on("dragend.mvp", () => {
      onChangeLayer(layer.id, {
        x: node.x(),
        y: node.y()
      });
    });

    node.on("transformend.mvp", () => {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scale({ x: 1, y: 1 });
      onChangeLayer(layer.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(24, node.width() * scaleX),
        height: Math.max(24, node.height() * scaleY),
        rotation: node.rotation()
      });
    });

    return () => {
      node.off("dragend.mvp transformend.mvp");
    };
  }, [layer, onChangeLayer, stage]);

  return null;
};
