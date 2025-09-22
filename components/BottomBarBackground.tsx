import React from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { colors, radii } from "../theme/theme";
import { FROSTED_INTENSITY, FROSTED_OVERLAY_COLOR, FROSTED_BASE_FILL_COLOR, FROSTED_BASE_FILL_OPACITY } from "./frosted";

export default React.memo(function BottomBarBackground({ flipOrder = false }: { flipOrder?: boolean }) {
  return (
    <View pointerEvents="none" style={styles.container}>
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
    borderRadius: radii.pill,
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


