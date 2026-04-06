import { RegionDefinition } from "../../types/app";

export const LAYOUT_WIDTH = 960;
export const LAYOUT_HEIGHT = 900;

export const layoutRegions: RegionDefinition[] = [
  {
    id: "front",
    label: "Front",
    x: 120,
    y: 80,
    width: 280,
    height: 420,
    color: "#1c2c3a"
  },
  {
    id: "back",
    label: "Back",
    x: 520,
    y: 80,
    width: 280,
    height: 420,
    color: "#2b2439"
  },
  {
    id: "leftSleeve",
    label: "Left Sleeve",
    x: 60,
    y: 560,
    width: 220,
    height: 180,
    color: "#23352b"
  },
  {
    id: "rightSleeve",
    label: "Right Sleeve",
    x: 420,
    y: 560,
    width: 220,
    height: 180,
    color: "#363022"
  }
];
