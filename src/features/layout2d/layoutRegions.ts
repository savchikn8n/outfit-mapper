import { RegionDefinition } from "../../types/app";

export const LAYOUT_WIDTH = 960;
export const LAYOUT_HEIGHT = 900;

export const layoutRegions: RegionDefinition[] = [
  {
    id: "front",
    x: 120,
    y: 80,
    width: 280,
    height: 420,
    color: "#1c2c3a"
  },
  {
    id: "back",
    x: 520,
    y: 80,
    width: 280,
    height: 420,
    color: "#2b2439"
  },
  {
    id: "leftSleeve",
    x: 60,
    y: 560,
    width: 220,
    height: 180,
    color: "#23352b"
  },
  {
    id: "rightSleeve",
    x: 420,
    y: 560,
    width: 220,
    height: 180,
    color: "#363022"
  }
];

const shirtPath = (width: number, height: number) =>
  [
    `M ${width * 0.22} ${height * 0.08}`,
    `Q ${width * 0.5} ${-height * 0.02} ${width * 0.78} ${height * 0.08}`,
    `L ${width * 0.98} ${height * 0.2}`,
    `L ${width * 0.84} ${height * 0.35}`,
    `L ${width * 0.78} ${height * 0.98}`,
    `L ${width * 0.22} ${height * 0.98}`,
    `L ${width * 0.16} ${height * 0.35}`,
    `L ${width * 0.02} ${height * 0.2}`,
    "Z"
  ].join(" ");

const sleevePath = (width: number, height: number) =>
  [
    `M ${width * 0.12} ${height * 0.16}`,
    `L ${width * 0.88} ${height * 0.08}`,
    `L ${width * 0.98} ${height * 0.52}`,
    `L ${width * 0.72} ${height * 0.92}`,
    `L ${width * 0.18} ${height * 0.86}`,
    `L ${width * 0.02} ${height * 0.46}`,
    "Z"
  ].join(" ");

export const getRegionShapePath = (region: RegionDefinition) =>
  region.id === "front" || region.id === "back"
    ? shirtPath(region.width, region.height)
    : sleevePath(region.width, region.height);

export const traceRegionShape = (
  context: CanvasRenderingContext2D,
  region: RegionDefinition,
  offsetX = 0,
  offsetY = 0
) => {
  const x = region.x + offsetX;
  const y = region.y + offsetY;
  const { width, height } = region;

  context.beginPath();

  if (region.id === "front" || region.id === "back") {
    context.moveTo(x + width * 0.22, y + height * 0.08);
    context.quadraticCurveTo(x + width * 0.5, y - height * 0.02, x + width * 0.78, y + height * 0.08);
    context.lineTo(x + width * 0.98, y + height * 0.2);
    context.lineTo(x + width * 0.84, y + height * 0.35);
    context.lineTo(x + width * 0.78, y + height * 0.98);
    context.lineTo(x + width * 0.22, y + height * 0.98);
    context.lineTo(x + width * 0.16, y + height * 0.35);
    context.lineTo(x + width * 0.02, y + height * 0.2);
  } else {
    context.moveTo(x + width * 0.12, y + height * 0.16);
    context.lineTo(x + width * 0.88, y + height * 0.08);
    context.lineTo(x + width * 0.98, y + height * 0.52);
    context.lineTo(x + width * 0.72, y + height * 0.92);
    context.lineTo(x + width * 0.18, y + height * 0.86);
    context.lineTo(x + width * 0.02, y + height * 0.46);
  }

  context.closePath();
};
