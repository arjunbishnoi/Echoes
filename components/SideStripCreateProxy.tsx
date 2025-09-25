import React from "react";
import { View, Pressable, StyleSheet } from "react-native";

type Props = {
  side: "left" | "right";
  onPress: () => void;
  width?: number; // tap target width along the seam
};

export default function SideStripCreateProxy({ side, onPress, width = 64 }: Props) {
  const edgeStyle = side === "left" ? { right: 0 } : { left: 0 };
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Create new echo"
        hitSlop={6}
        style={[styles.tapZone, edgeStyle, { width }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tapZone: {
    position: "absolute",
    top: 0,
    bottom: 0,
    // transparent overlay to capture touches at the drawer seam
    backgroundColor: "transparent",
  },
});





