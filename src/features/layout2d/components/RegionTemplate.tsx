import { Group, Image as KonvaImage, Line } from "react-konva";
import { RegionDefinition } from "../../../types/app";
import { useKonvaImage } from "../hooks/useKonvaImage";

interface RegionTemplateProps {
  region: RegionDefinition;
}

export const RegionTemplate = ({ region }: RegionTemplateProps) => {
  const image = useKonvaImage(region.templateSource ?? "");

  if (!region.points) {
    return null;
  }

  return (
    <Group>
      {image && region.editorBounds ? (
        <KonvaImage
          image={image}
          x={region.editorBounds.x}
          y={region.editorBounds.y}
          width={region.editorBounds.width}
          height={region.editorBounds.height}
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
    </Group>
  );
};
