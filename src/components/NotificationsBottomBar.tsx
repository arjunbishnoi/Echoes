import BottomBarBackground from "@/components/BottomBarBackground";
import { indicatorPulse, indicatorSpring } from "@/config/animation";
import { colors, radii, sizes } from "@/theme/theme";
import type { NotifKey } from "@/types/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";

type Props = {
  active: NotifKey;
  onChange: (key: NotifKey) => void;
  visible?: boolean;
};

export default function NotificationsBottomBar({ active, onChange, visible = true }: Props) {
  const router = useRouter();
  const [barWidth, setBarWidth] = useState(0);
  const measuredWidth = Math.max(0, barWidth);
  const segmentWidth = measuredWidth > 0 ? measuredWidth / 3 : 0;
  const translateX = useSharedValue(0);
  const indicatorScaleX = useSharedValue(1);

  const indexFromKey = useCallback((key: NotifKey): number => {
    switch (key) {
      case "friendRequests": return 0;
      case "regular": return 1;
      case "all": return 2;
      default: return 0;
    }
  }, []);

  const propActiveIndex = useMemo(() => indexFromKey(active), [active, indexFromKey]);

  const animateToIndex = useCallback((idx: number) => {
    translateX.value = withSpring(idx * segmentWidth, indicatorSpring);
    indicatorScaleX.value = withSequence(
      withTiming(1.04, { duration: indicatorPulse.up.duration, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: indicatorPulse.down.duration, easing: Easing.out(Easing.quad) })
    );
  }, [indicatorScaleX, segmentWidth, translateX]);

  useEffect(() => { animateToIndex(propActiveIndex); }, [propActiveIndex, animateToIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.round(translateX.value) },
      { scaleX: indicatorScaleX.value },
    ],
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.row} pointerEvents="box-none">
        <View style={styles.avatarSlot}>
          <Pressable onPress={() => router.push("/profile-modal")} accessibilityRole="button" style={styles.avatarPressable} hitSlop={12}>
            <Image source={{ uri: "https://i.pravatar.cc/100?img=12" }} style={styles.avatarImage} />
          </Pressable>
        </View>
        {visible && (
          <View style={styles.bar} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
            <BottomBarBackground />
            <View style={[styles.grid, measuredWidth > 0 ? { width: measuredWidth } : null]}>
              {segmentWidth > 0 ? (
                <Animated.View style={[styles.indicator, { width: segmentWidth }, indicatorStyle]} />
              ) : null}
              <Slot icon="people" active={propActiveIndex === 0} onPress={() => { animateToIndex(0); onChange("friendRequests"); }} segmentWidth={segmentWidth} />
              <Slot icon="lock-closed" active={propActiveIndex === 1} onPress={() => { animateToIndex(1); onChange("regular"); }} segmentWidth={segmentWidth} />
              <Slot icon="ellipse" active={propActiveIndex === 2} onPress={() => { animateToIndex(2); onChange("all"); }} segmentWidth={segmentWidth} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function Slot({ icon, active, onPress, segmentWidth }: { icon: keyof typeof Ionicons.glyphMap; active: boolean; onPress: () => void; segmentWidth: number }) {
  return (
    <View style={[styles.slot, segmentWidth > 0 ? { width: segmentWidth } : null]}>
      <Pressable onPress={onPress} hitSlop={12} accessibilityRole="button" style={styles.fillPressable}>
        <Ionicons name={icon} size={22} color={active ? colors.black : colors.textPrimary} />
      </Pressable>
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
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  bar: {
    height: sizes.floatingBar.height,
    borderRadius: radii.pill,
    alignSelf: "stretch",
    flex: 1,
  },
  grid: {
    position: "relative",
    height: "100%",
    flexDirection: "row",
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
  },
  avatarSlot: {
    width: sizes.floatingBar.height,
    height: sizes.floatingBar.height,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarPressable: {
    width: sizes.floatingBar.height,
    height: sizes.floatingBar.height,
    borderRadius: sizes.floatingBar.height / 2,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  slot: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fillPressable: {
    width: "100%",
    height: "100%",
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});


