import { BlurView } from "expo-blur";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors } from "@/theme/theme";

interface PrivateBadgeProps {
  size?: number;
  style?: ViewStyle;
}

export default function PrivateBadge({ size = 32, style }: PrivateBadgeProps) {
  // Scale text size proportionally to badge size (32:10 ratio = 0.3125)
  const fontSize = Math.round(size * 0.3125);
  // Scale padding proportionally to badge size (32:12 ratio = 0.375)
  const paddingHorizontal = Math.round(size * 0.375);
  
  return (
    <View
      style={[
        styles.badge,
        { height: size, borderRadius: size / 2, paddingHorizontal },
        style,
      ]}
    >
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={[styles.text, { fontSize }]}>Private</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.lightOverlay,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.textSecondary,
    fontWeight: "500",
    opacity: 0.8,
  },
});


