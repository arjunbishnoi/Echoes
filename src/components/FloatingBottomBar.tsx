import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { PixelRatio, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import useDrawerPair from "@/hooks/useDrawerPair";
import { colors, radii, sizes } from "@/theme/theme";
import BottomBarBackground from "@/components/BottomBarBackground";

type Props = {
  onPressProfile?: () => void;
  onPressCreate?: () => void;
  onPressMenu?: () => void;
};

function FloatingBottomBar({
  onPressProfile,
  onPressCreate,
  onPressMenu,
}: Props) {
  const { left: leftProgress, right: rightProgress } = useDrawerPair();
  const { width: screenWidth } = useWindowDimensions();
  const onePx = 1 / PixelRatio.get();

  const plusAnimated = useAnimatedStyle(() => {
    const lp = leftProgress?.value ?? 0;
    const rp = rightProgress?.value ?? 0;
    // Overall drawer open progress
    const p = Math.max(lp, rp);

    // Size transforms as drawer opens
    const targetH = sizes.floatingBar.height;
    const startH = sizes.floatingBar.plusHeight;
    const height = startH + (targetH - startH) * p;
    const borderRadius = height / 2;
    const scale = 1 - p * 0.05;

    // Compute dynamic width of the pill (icon + horizontal padding*2),
    // then apply scale to get its effective on-screen width.
    const iconSize = 26; // matches the Ionicons size below
    // Elongate the white pill when in the side strip so the far corner isn't prominent
    const endPadding = 44;
    const paddingH = sizes.floatingBar.plusPaddingHorizontal + (endPadding - sizes.floatingBar.plusPaddingHorizontal) * p;
    const rawWidth = iconSize + paddingH * 2;
    const effectiveWidth = rawWidth * scale;

    // Distance needed so the pill's outer edge touches the screen edge (drawer seam)
    const targetDistance = (screenWidth / 2) - (effectiveWidth / 2);

    // Move left when left drawer opens, right when right drawer opens
    const dx = (-lp * targetDistance) + (rp * targetDistance);
    return {
      transform: [{ translateX: dx }, { scale }],
      height,
      borderRadius,
      paddingHorizontal: paddingH,
    };
  });

  const iconShift = useAnimatedStyle(() => {
    const lp = leftProgress?.value ?? 0;
    const rp = rightProgress?.value ?? 0;
    const p = Math.max(lp, rp);

    // Mirror the sizing math from the pill to keep alignment exact
    const targetH = sizes.floatingBar.height;
    const startH = sizes.floatingBar.plusHeight;
    const height = startH + (targetH - startH) * p;
    const scale = 1 - p * 0.05;

    const iconSize = 26;
    const endPadding = 44;
    const paddingH = sizes.floatingBar.plusPaddingHorizontal + (endPadding - sizes.floatingBar.plusPaddingHorizontal) * p;
    const rawWidth = iconSize + paddingH * 2;
    const effectiveWidth = rawWidth * scale;

    // Desired world position: center of the side strip (use strip width ~ pill height)
    const stripBias = 4; // nudge slightly towards drawer edge
    const stripCenter = (height / 2) + stripBias; // px from the respective edge

    // Compute local shifts needed inside the scaled pill to land the icon at stripCenter
    const rightShiftWorld = (effectiveWidth / 2) - stripCenter; // move icon towards the edge
    const leftShiftWorld = stripCenter - (effectiveWidth / 2);   // move icon towards the edge

    // Convert world-space to local-space inside a scaled parent
    const rightShiftLocal = rightShiftWorld / scale;
    const leftShiftLocal = leftShiftWorld / scale;

    const ix = (rp * rightShiftLocal) + (lp * leftShiftLocal);
    return { transform: [{ translateX: ix }] };
  });
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        <BottomBarBackground />
        <Pressable onPress={onPressProfile} style={styles.sideButton} hitSlop={12} accessibilityRole="button" accessibilityLabel="Open profile">
          <Ionicons name="person" size={26} color={colors.textPrimary} />
        </Pressable>

        <Animated.View style={[styles.plusButton, plusAnimated]}>
          <Pressable onPress={onPressCreate} hitSlop={12} accessibilityRole="button" accessibilityLabel="Create new echo">
            <Animated.View style={iconShift}>
              <View style={styles.iconContainer}>
                <Ionicons name="add-sharp" size={26} color={colors.black} />
                <Ionicons name="add-sharp" size={26} color={colors.black} style={[styles.iconAbsolute, { transform: [{ translateX: onePx }] }]} />
                <Ionicons name="add-sharp" size={26} color={colors.black} style={[styles.iconAbsolute, { transform: [{ translateX: -onePx }] }]} />
                <Ionicons name="add-sharp" size={26} color={colors.black} style={[styles.iconAbsolute, { transform: [{ translateY: onePx }] }]} />
                <Ionicons name="add-sharp" size={26} color={colors.black} style={[styles.iconAbsolute, { transform: [{ translateY: -onePx }] }]} />
              </View>
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Pressable onPress={onPressMenu} style={styles.sideButton} hitSlop={12} accessibilityRole="button" accessibilityLabel="Open menu">
          <View style={styles.iconContainer}>
            <View style={[styles.menuLine, { transform: [{ translateY: -4 }] }]} />
            <View style={[styles.menuLine, { transform: [{ translateY: 4 }] }]} />
          </View>
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
    // Ensure this sits above drawer overlays/gradients when moving into side strip
    zIndex: 2000,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
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
  iconContainer: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  iconAbsolute: {
    position: "absolute",
  },
  menuLine: {
    position: "absolute",
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textPrimary,
  },
});

export default memo(FloatingBottomBar);