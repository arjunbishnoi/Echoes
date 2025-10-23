import { FROSTED_BASE_FILL_COLOR, FROSTED_BASE_FILL_OPACITY, FROSTED_INTENSITY, FROSTED_OVERLAY_COLOR } from "@/components/frosted";
import { radii } from "@/theme/theme";
import { BlurView } from "expo-blur";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

export default memo(function BottomBarBackground({ 
  flipOrder = false, 
  borderRadius = radii.pill 
}: { 
  flipOrder?: boolean;
  borderRadius?: number;
}) {
  return (
    <View pointerEvents="none" style={[styles.container, { borderRadius }]}>
      {flipOrder ? (
        <>
          <View style={styles.overlay} />
          <View style={styles.baseFill} />
          <BlurView tint="dark" intensity={FROSTED_INTENSITY} style={StyleSheet.absoluteFill} />
        </>
      ) : (
        <>
          <BlurView tint="dark" intensity={FROSTED_INTENSITY} style={StyleSheet.absoluteFill} />
          <View style={styles.baseFill} />
          <View style={styles.overlay} />
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  baseFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: FROSTED_BASE_FILL_COLOR,
    opacity: FROSTED_BASE_FILL_OPACITY,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: FROSTED_OVERLAY_COLOR,
  },
});


