import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const GestureConfig = {
  // Allow swipe to start anywhere on screen; adapts to device width
  swipeEdgeWidth: SCREEN_WIDTH,
  // Keep a small distance to avoid accidental triggers from taps/vertical scroll
  swipeMinDistance: 16,
  swipeMinVelocity: 200,
  tapMaxDeltaX: 8,
  tapMaxDeltaY: 8,
} as const;



