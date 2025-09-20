import React from "react";
import { StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useDrawerProgress } from "react-native-drawer-layout";

type DrawerBlurOverlayProps = {
  maxOpacity?: number;
  blurIntensity?: number;
};

export default function DrawerBlurOverlay({ maxOpacity = 1, blurIntensity = 20 }: DrawerBlurOverlayProps) {
  const progress = useDrawerProgress();
  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value * maxOpacity }), [progress, maxOpacity]);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, animatedStyle]}>
      <BlurView tint="regular" intensity={blurIntensity} style={StyleSheet.absoluteFillObject} />
    </Animated.View>
  );
}


