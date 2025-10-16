import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { colors } from "../theme/theme";

type BackButtonProps = {
  onPress: () => void;
  color?: string;
  size?: number;
  style?: object;
};

/**
 * Reusable back button component for consistent navigation
 */
export function BackButton({ onPress, color = colors.textPrimary, size = 24, style }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={[styles.container, style]}
    >
      <Ionicons name="chevron-back" size={size} color={color} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  icon: {
    marginLeft: -6,
  },
});

