import { Group, Image as KonvaImage, Line } from "react-konva";
import { RegionDefinition } from "../../../types/app";
import { useKonvaImage } from "../hooks/useKonvaImage";

interface RegionTemplateProps {
  region: RegionDefinition;
}

export const RegionTemplate = ({ region }: RegionTemplateProps) => {
  const image = useKonvaImage(region.templateSource ?? "");
  const templateBounds = region.editorBounds ?? region;

  if (!region.points) {
    return null;
  }

  return (
    <Group>
      {image ? (
        <KonvaImage
          image={image}
          x={templateBounds.x}
          y={templateBounds.y}
          width={templateBounds.width}
          height={templateBounds.height}
          listening={false}
        />
      ) : null}
      <Line
        points={region.points.flatMap(([x, y]) => [x, y])}
        closed
        fill={image ? undefined : region.color}
        opacity={image ? 0.9 : 0.28}
        stroke="#c7d4e8"
        strokeWidth={2}
      />
      {region.placementBounds ? (
        <Line
          points={[
            region.placementBounds.x,
            region.placementBounds.y,
            region.placementBounds.x + region.placementBounds.width,
            region.placementBounds.y,
            region.placementBounds.x + region.placementBounds.width,
            region.placementBounds.y + region.placementBounds.height,
            region.placementBounds.x,
            region.placementBounds.y + region.placementBounds.height
          ]}
          closed
          stroke="#7bc2ff"
          strokeWidth={2}
          dash={[12, 8]}
          opacity={0.7}
          listening={false}
        />
      ) : null}
    </Group>
  );
};
