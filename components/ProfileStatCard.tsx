import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../theme/theme";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
  square?: boolean; // deprecated in favor of aspectRatio
  aspectRatio?: number; // width / height, e.g., 1.3 makes it a bit shorter
  compact?: boolean; // tighter vertical layout (e.g., for notifications row)
  horizontal?: boolean; // center-left icon with text beside it, arrow centered right
  onPress?: () => void;
};

function ProfileStatCard({ icon, value, label, square = false, aspectRatio, compact = false, horizontal = false, onPress }: Props) {
  if (horizontal) {
    return (
      <Pressable onPress={onPress} style={[styles.cardRow]} accessibilityRole="button">
        <View style={[styles.iconWrap, { position: "relative", top: undefined, left: undefined, marginRight: spacing.lg }]}>
          <Ionicons name={icon} size={18} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={[
      styles.card,
      square && styles.square,
      aspectRatio ? { aspectRatio } : null,
      compact ? styles.compact : null,
    ]} accessibilityRole="button">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.white} />
      </View>
      <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} style={styles.arrow} />
      <View style={[styles.bottomLeft, compact ? { bottom: spacing.md } : null]}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    minHeight: 90,
  },
  square: {
    aspectRatio: 1,
  },
  compact: {
    minHeight: 84,
  },
  cardRow: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
  },
  arrow: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
  },
  bottomLeft: {
    position: "absolute",
    left: spacing.lg,
    bottom: spacing.lg,
    right: spacing.lg + 24,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});


