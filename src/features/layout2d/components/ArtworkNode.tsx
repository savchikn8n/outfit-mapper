import { Group, Image as KonvaImage, Rect, Text } from "react-konva";
import { ArtworkLayer } from "../../../types/app";
import { useKonvaImage } from "../hooks/useKonvaImage";

interface ArtworkNodeProps {
  layer: ArtworkLayer;
  isSelected: boolean;
  onSelect: () => void;
}

export const ArtworkNode = ({ layer, isSelected, onSelect }: ArtworkNodeProps) => {
  const image = useKonvaImage(layer.source);

  return (
    <Group
      id={layer.id}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      opacity={layer.visible ? layer.opacity : 0.2}
      draggable={!layer.locked}
      onClick={onSelect}
      onTap={onSelect}
    >
      {image ? (
        <KonvaImage image={image} width={layer.width} height={layer.height} />
      ) : (
        <>
          <Rect
            width={layer.width}
            height={layer.height}
            fill="#6f7d91"
            stroke={isSelected ? "#80bfff" : "#93a0b2"}
            dash={[8, 4]}
            cornerRadius={8}
          />
          <Text
            text={layer.name}
            fontSize={14}
            fill="#e5edf8"
            width={layer.width}
            align="center"
            verticalAlign="middle"
            y={layer.height / 2 - 8}
          />
        </>
      )}
      {isSelected && (
        <Rect
          width={layer.width}
          height={layer.height}
          stroke="#8fd0ff"
          strokeWidth={2}
          dash={[6, 4]}
        />
      )}
    </Group>
  );
};
