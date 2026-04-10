import { Group, Line } from "react-konva";
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
    </Group>
  );
};
