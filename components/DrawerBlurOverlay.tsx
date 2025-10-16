import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { useDrawerProgress } from "react-native-drawer-layout";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useRightDrawerProgress } from "./RightDrawerProgress";
import { FROSTED_INTENSITY, FROSTED_OVERLAY_COLOR } from "./frosted";

type DrawerBlurOverlayProps = {
  maxOpacity?: number;
  blurIntensity?: number;
  side?: "left" | "right";
};

export default function DrawerBlurOverlay({ maxOpacity = 1, blurIntensity = 20, side }: DrawerBlurOverlayProps) {
  const leftProgress = useDrawerProgress();
  const rightProgress = useRightDrawerProgress();
  const progress = side === "right" ? rightProgress : leftProgress;
  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value * maxOpacity }), [progress, maxOpacity]);
  
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, animatedStyle]}>
      <BlurView tint="dark" intensity={blurIntensity ?? FROSTED_INTENSITY} style={StyleSheet.absoluteFillObject} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: FROSTED_OVERLAY_COLOR }]} />
    </Animated.View>
  );
}
