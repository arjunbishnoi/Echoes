import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import useDrawerPair from "../hooks/useDrawerPair";
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
  const { left: leftProgress, right: rightProgress } = useDrawerPair();

  const plusAnimated = useAnimatedStyle(() => {
    const lp = leftProgress?.value ?? 0;
    const rp = rightProgress?.value ?? 0;
    // Move left when left drawer opens, right when right drawer opens
    const dx = (-lp * 140) + (rp * 140); // travel farther into side strips
    const p = Math.max(lp, rp);
    const targetH = sizes.floatingBar.height;
    const startH = sizes.floatingBar.plusHeight;
    const height = startH + (targetH - startH) * p;
    const borderRadius = height / 2;
    const scale = 1 - p * 0.05;
    return {
      transform: [{ translateX: dx }, { scale }],
      height,
      borderRadius,
      paddingHorizontal: sizes.floatingBar.plusPaddingHorizontal + (18 - sizes.floatingBar.plusPaddingHorizontal) * p,
    };
  });

  const iconShift = useAnimatedStyle(() => {
    const lp = leftProgress?.value ?? 0;
    const rp = rightProgress?.value ?? 0;
    const ix = (-lp + rp) * 10; // small extra nudge for the icon only
    return { transform: [{ translateX: ix }] };
  });
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        <Pressable onPress={onPressProfile} style={styles.sideButton} hitSlop={12} accessibilityRole="button" accessibilityLabel="Open profile">
          <Ionicons name="person-outline" size={24} color={colors.textPrimary} />
        </Pressable>

        <Animated.View style={[styles.plusButton, plusAnimated]}>
          <Pressable onPress={onPressCreate} hitSlop={12} accessibilityRole="button" accessibilityLabel="Create new echo">
            <Animated.View style={iconShift}>
              <Ionicons name="add" size={28} color={colors.black} />
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Pressable onPress={onPressMenu} style={styles.sideButton} hitSlop={12} accessibilityRole="button" accessibilityLabel="Open menu">
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
    paddingVertical: 0,
    height: sizes.floatingBar.height,
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


