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

const uvRegions = {
  leftSleeve: [
    [58, 46],
    [153, 46],
    [192, 58],
    [257, 105],
    [333, 225],
    [333, 279],
    [58, 279],
    [58, 223]
  ],
  rightSleeve: [
    [543, 46],
    [638, 46],
    [703, 58],
    [780, 105],
    [902, 225],
    [902, 279],
    [628, 279],
    [628, 223]
  ],
  back: [
    [53, 395],
    [91, 338],
    [130, 310],
    [229, 310],
    [287, 340],
    [335, 338],
    [400, 310],
    [446, 310],
    [487, 339],
    [529, 395],
    [529, 913],
    [55, 913]
  ],
  front: [
    [427, 395],
    [469, 339],
    [511, 309],
    [575, 309],
    [613, 335],
    [649, 357],
    [685, 335],
    [726, 309],
    [788, 309],
    [832, 338],
    [870, 394],
    [870, 913],
    [428, 913]
  ]
} as const;

export const layoutRegions: RegionDefinition[] = [
  {
    id: "front",
    ...makeBounds(uvRegions.front),
    color: "#1c2c3a",
    points: uvRegions.front
  },
  {
    id: "back",
    ...makeBounds(uvRegions.back),
    color: "#2b2439",
    points: uvRegions.back
  },
  {
    id: "leftSleeve",
    ...makeBounds(uvRegions.leftSleeve),
    color: "#23352b",
    points: uvRegions.leftSleeve
  },
  {
    id: "rightSleeve",
    ...makeBounds(uvRegions.rightSleeve),
    color: "#363022",
    points: uvRegions.rightSleeve
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
