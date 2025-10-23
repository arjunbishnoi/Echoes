import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/theme";

type BadgePillProps = {
  size?: number;
  icon: keyof typeof Ionicons.glyphMap;
  overlay?: boolean;
  rotate?: string;
  style?: any;
};

export function BadgePill({ size = 28, icon, overlay = true, rotate, style }: BadgePillProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      {overlay ? <View style={styles.overlay} /> : null}
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={colors.white} style={rotate ? { transform: [{ rotate }] } : undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.lightOverlay,
  },
});

export default BadgePill;


