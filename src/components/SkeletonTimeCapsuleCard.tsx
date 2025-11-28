import { HERO_HEIGHT } from "@/constants/dimensions";
import { colors, radii, sizes } from "@/theme/theme";
import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function SkeletonTimeCapsuleCard({ style }: { style?: ViewStyle }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.card, style]}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Bottom Content Area */}
        <View style={styles.bottomContent}>
          {/* Title Placeholder */}
          <View style={styles.titlePlaceholder} />

          {/* Meta Row */}
          <View style={styles.metaRow}>
            {/* Avatars Placeholder */}
            <View style={styles.avatarPlaceholder} />
            <View style={styles.avatarPlaceholder} />
            
            {/* Progress Bar Placeholder */}
            <View style={styles.progressPlaceholder} />
            
            {/* Status Badge Placeholder */}
            <View style={styles.statusPlaceholder} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: HERO_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: 12, // Match ListSeparator roughly or add explicitly in list
  },
  container: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: "flex-end",
  },
  bottomContent: {
    padding: 16,
    gap: 12,
  },
  titlePlaceholder: {
    height: 24,
    width: "60%",
    backgroundColor: colors.surfaceBorder,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceBorder,
    marginLeft: -10, // Overlap effect
  },
  progressPlaceholder: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceBorder,
    borderRadius: 2,
  },
  statusPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceBorder,
  },
});

