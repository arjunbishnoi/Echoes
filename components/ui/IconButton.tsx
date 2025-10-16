import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";
import { colors, spacing } from "../../theme/theme";

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  hitSlop?: number;
}

export default function IconButton({
  icon,
  onPress,
  size = 24,
  color = colors.textPrimary,
  style,
  hitSlop = 12,
}: IconButtonProps) {
  return (
    <Pressable
      style={[styles.button, style]}
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.xs,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});


