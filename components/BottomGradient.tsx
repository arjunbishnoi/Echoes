import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { colors, sizes } from "../theme/theme";

// Approximate vertical size of the floating bar area to align the gradient's top edge
const FLOATING_BAR_HEIGHT = sizes.floatingBar.height;
const FLOATING_BAR_BOTTOM_OFFSET = sizes.floatingBar.bottomOffset;
const BLUR_INTENSITY = 16; // base blur intensity
const FEATHER_HEIGHT = 36; // px to soften the blur start at the top edge
const BOTTOM_BOOST_HEIGHT = 25; // px to ensure pure black at the very bottom edge
const FEATHER_STEPS = 10; // more steps = smoother transition
const CORNER_FEATHER_SIZE = 36; // px feather size for bottom corners

function BottomGradient() {
  // Start the overlay where the bottom bar starts; keep bottom edge unchanged
  const height = FLOATING_BAR_BOTTOM_OFFSET + FLOATING_BAR_HEIGHT;
  // Work around type defs: treat MaskedView as a generic component
  const Masked: any = MaskedView;

  return (
    <View pointerEvents="none" style={[styles.container, { height }]}>
  {/* Masked blur for a perfectly smooth onset */}
  <Masked
    style={StyleSheet.absoluteFill}
    maskElement={
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,1)"]}
        locations={[0, 1]}
        style={[styles.gradientTop, { height: FEATHER_HEIGHT }]}
      />
    }
  >
    <BlurView
      intensity={BLUR_INTENSITY}
      tint="dark"
      style={[styles.blurTop, { height: FEATHER_HEIGHT }]}
    />
  </Masked>
  <BlurView
    intensity={BLUR_INTENSITY}
    tint="dark"
    style={styles.blurMiddle}
  />
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)", colors.background]}
        locations={[0, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Extra bottom boost to guarantee pure black at the device edge without affecting the top start */}
      <LinearGradient
        colors={["rgba(0,0,0,0)", colors.background]}
        locations={[0, 1]}
        style={styles.bottomBoost}
      />
      {/* Corner feathering to avoid straight lines at bottom corners */}
      <LinearGradient
        colors={[colors.background, "rgba(0,0,0,0)"]}
        locations={[0, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.cornerLeft}
      />
      <LinearGradient
        colors={[colors.background, "rgba(0,0,0,0)"]}
        locations={[0, 1]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.cornerRight}
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
  gradientTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  blurTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  blurMiddle: {
    position: "absolute",
    left: 0,
    right: 0,
    top: FEATHER_HEIGHT,
    bottom: 0,
  },
  bottomBoost: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_BOOST_HEIGHT,
  },
  cornerLeft: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: CORNER_FEATHER_SIZE,
    height: CORNER_FEATHER_SIZE,
  },
  cornerRight: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: CORNER_FEATHER_SIZE,
    height: CORNER_FEATHER_SIZE,
  },
});

export default memo(BottomGradient);