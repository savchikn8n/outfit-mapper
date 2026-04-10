import { Group, Line, Rect } from "react-konva";
import { RegionDefinition } from "../../../types/app";

interface RegionTemplateProps {
  region: RegionDefinition;
}

export const RegionTemplate = ({ region }: RegionTemplateProps) => {
  if (!region.points) {
    return null;
  }

  return (
    <Group>
      <Line
        points={region.points.flatMap(([x, y]) => [x, y])}
        closed
        fill={region.color}
        opacity={0.28}
        stroke="#c7d4e8"
        strokeWidth={2}
      />
      {region.editorBounds ? (
        <Rect
          x={region.editorBounds.x}
          y={region.editorBounds.y}
          width={region.editorBounds.width}
          height={region.editorBounds.height}
          stroke="#8fd0ff"
          strokeWidth={2}
          dash={[10, 6]}
          cornerRadius={8}
          opacity={0.5}
        />
      ) : null}
    </Group>
  );
};
