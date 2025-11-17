import { HERO_HEIGHT } from "@/constants/dimensions";
import { radii, spacing } from "@/theme/theme";
import { Dimensions } from "react-native";

// Source of truth for matching the right drawer library cover thumbnail sizing
export type DrawerCoverSizing = {
  width: number;
  height: number;
  radius: number;
};

export function getDrawerCoverSizing(coverHeight = 40): DrawerCoverSizing {
  const screenWidth = Dimensions.get("window").width;
  const homescreenCardWidth = screenWidth - spacing.lg * 2;
  const homescreenCardHeight = HERO_HEIGHT;
  const homescreenCardRadius = radii.card;

  const scale = coverHeight / homescreenCardHeight;
  const width = Math.round(homescreenCardWidth * scale);
  const radius = Math.round(homescreenCardRadius * scale);

  return { width, height: coverHeight, radius };
}


