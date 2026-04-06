import { Group, Image as KonvaImage } from "react-konva";
import { RegionDefinition } from "../../../types/app";
import { useKonvaImage } from "../hooks/useKonvaImage";
import { templateAssetByRegion } from "../templateConfig";

interface RegionTemplateProps {
  region: RegionDefinition;
}

export const RegionTemplate = ({ region }: RegionTemplateProps) => {
  const image = useKonvaImage(templateAssetByRegion[region.id]);

  if (!image) {
    return null;
  }

  return (
    <Group x={region.x} y={region.y}>
      <KonvaImage image={image} width={region.width} height={region.height} opacity={0.86} />
    </Group>
  );
};
