import { AvatarPreset } from "../../types/app";

export const avatarPresets: AvatarPreset[] = [
  {
    id: "slim",
    bodyScale: [0.92, 1.02, 0.9],
    shirtScale: [0.98, 1, 0.96],
    shirtLength: 1.94
  },
  {
    id: "regular",
    bodyScale: [1, 1, 1],
    shirtScale: [1, 1, 1],
    shirtLength: 2
  },
  {
    id: "oversized",
    bodyScale: [1.06, 1, 1.08],
    shirtScale: [1.12, 1.05, 1.12],
    shirtLength: 2.1
  },
  {
    id: "neutral",
    bodyScale: [0.97, 1.01, 0.98],
    shirtScale: [1.02, 1.02, 1],
    shirtLength: 2.02
  }
];
