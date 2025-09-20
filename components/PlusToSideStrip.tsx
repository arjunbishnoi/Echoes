import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, interpolate } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useDrawerProgress } from "react-native-drawer-layout";
import { colors, sizes } from "../theme/theme";

// Animates the home + button into the right side strip as drawer opens
export default function PlusToSideStrip() {
  const progress = useDrawerProgress();
  const { width, height } = useWindowDimensions();

  const plusSize = sizes.floatingBar.plusHeight; // starting size
  const circleSize = 44; // target circular size in strip
  const bottomCenterY = height - (sizes.floatingBar.bottomOffset + sizes.floatingBar.height / 2);
  const startX = width / 2; // centered plus button in bar
  const endX = width - 36; // side strip position from right edge
  const startY = bottomCenterY;
  const endY = bottomCenterY; // keep level; adjust if needed

  const animatedStyle = useAnimatedStyle(() => {
    const x = interpolate(progress.value, [0, 1], [startX, endX]);
    const y = interpolate(progress.value, [0, 1], [startY, endY]);
    const size = interpolate(progress.value, [0, 1], [plusSize, circleSize]);
    return {
      transform: [{ translateX: x - size / 2 }, { translateY: y - size / 2 }],
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.white,
      opacity: 1,
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject]}>
      <Animated.View style={[styles.circle, animatedStyle]}>
        <Ionicons name="add" size={24} color={colors.black} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});


