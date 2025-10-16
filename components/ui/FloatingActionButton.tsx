import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, type ViewStyle } from "react-native";
import { FLOATING_BUTTON_SIZE } from "../../constants/dimensions";
import { colors } from "../../theme/theme";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: ViewStyle;
}

export default function FloatingActionButton({
  onPress,
  icon = "add",
  size = FLOATING_BUTTON_SIZE,
  style,
}: FloatingActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={28} color={colors.black} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    // iOS native shadow
    ...(Platform.OS === "ios" ? {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    } : {
      // Android Material elevation
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    }),
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
    ...(Platform.OS === "ios" ? {
      shadowOpacity: 0.15,
    } : {
      elevation: 4,
    }),
  },
});


