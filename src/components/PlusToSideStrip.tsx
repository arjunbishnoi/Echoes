import { colors, sizes } from "@/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useDrawerProgress } from "react-native-drawer-layout";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";

export default function PlusToSideStrip() {
  const progress = useDrawerProgress();
  const { width, height } = useWindowDimensions();

  const plusSize = sizes.floatingBar.plusHeight;
  const circleSize = 44;
  const bottomCenterY = height - (sizes.floatingBar.bottomOffset + sizes.floatingBar.height / 2);
  const startX = width / 2;
  const endX = width - 36;
  const startY = bottomCenterY;
  const endY = bottomCenterY;

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const x = interpolate(t, [0, 1], [startX, endX]);
    const y = interpolate(t, [0, 1], [startY, endY]);
    const size = interpolate(t, [0, 1], [plusSize, circleSize]);
    return {
      transform: [
        { translateX: Math.round(x - size / 2) },
        { translateY: Math.round(y - size / 2) },
      ],
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.white,
      opacity: 1,
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject]}>
      <Animated.View style={[styles.circle, animatedStyle]}>
        <Ionicons name="add" size={24} color={colors.black} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});





