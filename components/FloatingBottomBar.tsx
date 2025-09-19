import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, sizes } from "../theme/theme";

type Props = {
  onPressProfile?: () => void;
  onPressCreate?: () => void;
  onPressMenu?: () => void;
};

export default function FloatingBottomBar({
  onPressProfile,
  onPressCreate,
  onPressMenu,
}: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        <Pressable onPress={onPressProfile} style={styles.sideButton} hitSlop={12}>
          <Ionicons name="person-outline" size={24} color={colors.textPrimary} />
        </Pressable>

        <Pressable onPress={onPressCreate} style={styles.plusButton} hitSlop={12}>
          <Ionicons name="add" size={28} color={colors.black} />
        </Pressable>

        <Pressable onPress={onPressMenu} style={styles.sideButton} hitSlop={12}>
          <Ionicons name="menu" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: sizes.floatingBar.bottomOffset,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.floatingBarBg,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: radii.pill,
    width: sizes.floatingBar.widthPercent,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  sideButton: {
    width: sizes.floatingBar.sideButtonSize,
    height: sizes.floatingBar.sideButtonSize,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  plusButton: {
    backgroundColor: colors.white,
    height: sizes.floatingBar.plusHeight,
    borderRadius: radii.pill,
    paddingHorizontal: sizes.floatingBar.plusPaddingHorizontal,
    alignItems: "center",
    justifyContent: "center",
  },
});


