import { RegionDefinition } from "../../types/app";

export const LAYOUT_WIDTH = 960;
export const LAYOUT_HEIGHT = 960;

const makeBounds = (points: ReadonlyArray<readonly [number, number]>) => {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};

const flipPointsY = (points: ReadonlyArray<readonly [number, number]>) => {
  const bounds = makeBounds(points);
  return points.map(([x, y]) => [x, bounds.y + bounds.height - (y - bounds.y)] as const);
};

const uvRegions = {
  back: [
    [28, 300],
    [181, 300],
    [201, 282],
    [247, 282],
    [268, 300],
    [386, 300],
    [357, 668],
    [263, 668],
    [248, 621],
    [196, 598],
    [149, 621],
    [141, 668],
    [42, 668]
  ],
  front: [
    [573, 300],
    [691, 300],
    [712, 282],
    [757, 282],
    [779, 300],
    [932, 300],
    [919, 668],
    [823, 668],
    [815, 621],
    [768, 598],
    [720, 619],
    [704, 668],
    [603, 668]
  ],
  leftSleeve: [
    [173, 721],
    [385, 721],
    [372, 933],
    [186, 933]
  ],
  rightSleeve: [
    [585, 721],
    [797, 721],
    [784, 933],
    [598, 933]
  ]
} as const;

const displayFront = flipPointsY(uvRegions.front);
const displayBack = flipPointsY(uvRegions.back);
const displayLeftSleeve = uvRegions.leftSleeve;
const displayRightSleeve = uvRegions.rightSleeve;

export const layoutRegions: RegionDefinition[] = [
  {
    id: "front",
    ...makeBounds(displayFront),
    color: "#1c2c3a",
    points: displayFront,
    texturePoints: uvRegions.front,
    textureFlipY: true
  },
  {
    id: "back",
    ...makeBounds(displayBack),
    color: "#2b2439",
    points: displayBack,
    texturePoints: uvRegions.back,
    textureFlipY: true
  },
  {
    id: "leftSleeve",
    ...makeBounds(displayLeftSleeve),
    color: "#23352b",
    points: displayLeftSleeve,
    texturePoints: uvRegions.leftSleeve
  },
  {
    id: "rightSleeve",
    ...makeBounds(displayRightSleeve),
    color: "#363022",
    points: displayRightSleeve,
    texturePoints: uvRegions.rightSleeve
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
  region.points
    ? [
        `M ${region.points[0][0]} ${region.points[0][1]}`,
        ...region.points.slice(1).map(([x, y]) => `L ${x} ${y}`),
        "Z"
      ].join(" ")
    : region.id === "front" || region.id === "back"
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

  if (region.points) {
    const [first, ...rest] = region.points;
    context.moveTo(first[0] + offsetX, first[1] + offsetY);
    rest.forEach(([pointX, pointY]) => {
      context.lineTo(pointX + offsetX, pointY + offsetY);
    });
  } else if (region.id === "front" || region.id === "back") {
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
