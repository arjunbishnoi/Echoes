import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sizes, colors } from "../theme/theme";

// Approximate vertical size of the floating bar area to align the gradient's top edge
const FLOATING_BAR_HEIGHT = sizes.floatingBar.height;
const FLOATING_BAR_BOTTOM_OFFSET = sizes.floatingBar.bottomOffset;
const BLUR_HEIGHT_RATIO = 0.6; // lower portion only, to avoid strong blur at top
const BLUR_INTENSITY = 16; // subtler blur

export default function BottomGradient() {
  const insets = useSafeAreaInsets();
  const height = insets.bottom + FLOATING_BAR_BOTTOM_OFFSET + FLOATING_BAR_HEIGHT;
  const blurHeight = Math.max(48, height * BLUR_HEIGHT_RATIO);

  return (
    <View pointerEvents="none" style={[styles.container, { height }]}>
      <BlurView
        intensity={BLUR_INTENSITY}
        tint="dark"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: blurHeight }}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)", colors.background]}
        locations={[0, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});


