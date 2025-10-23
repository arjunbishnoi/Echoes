import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors } from "@/theme/theme";

interface StatusBadgeProps {
  status: "ongoing" | "locked" | "unlocked";
  size?: number;
  style?: ViewStyle;
  iconOnly?: boolean;
  iconColor?: string;
}

export default function StatusBadge({ status, size = 32, style, iconOnly = false, iconColor }: StatusBadgeProps) {
  // Scale text size proportionally to badge size (32:10 ratio = 0.3125)
  const fontSize = Math.round(size * 0.3125);
  // Scale padding proportionally to badge size (32:12 ratio = 0.375)
  const paddingHorizontal = iconOnly ? 0 : Math.round(size * 0.375);
  // Scale icon size proportionally to badge size (32:12 ratio = 0.375)
  const iconSize = Math.round(size * 0.375);
  
  // Default icon color based on mode
  const defaultIconColor = iconColor || (iconOnly ? colors.white : colors.textSecondary);

  const getStatusConfig = () => {
    switch (status) {
      case "ongoing":
        return { icon: "time" as const, label: "Ongoing" };
      case "locked":
        return { icon: "lock-closed" as const, label: "Locked" };
      case "unlocked":
        return { icon: "checkmark" as const, label: "Unlocked" };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.badge,
        { 
          height: size, 
          width: iconOnly ? size : undefined,
          borderRadius: size / 2, 
          paddingHorizontal 
        },
        style,
      ]}
    >
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Ionicons 
          name={config.icon} 
          size={iconSize} 
          color={defaultIconColor} 
          style={iconOnly ? undefined : styles.icon} 
        />
        {!iconOnly && <Text style={[styles.text, { fontSize }]}>{config.label}</Text>}
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
  icon: {
    marginRight: 4,
    opacity: 0.8,
  },
  text: {
    color: colors.textSecondary,
    fontWeight: "500",
    opacity: 0.8,
  },
});

