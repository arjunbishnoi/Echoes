import { colors } from "@/theme/theme";
import { BlurView } from "expo-blur";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

type TextBlurPillProps = {
  label: string;
  size?: number;
  style?: ViewStyle;
};

export default function TextBlurPill({ label, size = 28, style }: TextBlurPillProps) {
  const fontSize = Math.round(size * 0.36);
  const paddingHorizontal = Math.round(size * 0.5);
  return (
    <View
      style={[
        styles.pill,
        { height: size, borderRadius: size / 2, paddingHorizontal },
        style,
      ]}
    >
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <Text style={[styles.text, { fontSize }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  text: {
    color: colors.textSecondary,
    fontWeight: "700",
  },
});


