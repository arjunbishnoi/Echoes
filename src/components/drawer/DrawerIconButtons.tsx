import { colors, spacing } from "@/theme/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet } from "react-native";

interface DrawerIconButtonsProps {
  icons: {
    name: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }[];
}

export default function DrawerIconButtons({ icons }: DrawerIconButtonsProps) {
  return (
    <>
      {icons.map((icon, index) => (
        <Pressable
          key={index}
          accessibilityRole="button"
          hitSlop={12}
          onPress={icon.onPress}
          style={[styles.button, index > 0 && styles.buttonSpaced]}
        >
          <Ionicons name={icon.name} size={20} color={colors.white} />
        </Pressable>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSpaced: {
    marginLeft: spacing.sm,
  },
});


