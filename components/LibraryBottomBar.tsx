import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomBarBackground from "./BottomBarBackground";
import { colors, radii, sizes } from "../theme/theme";
import type { FilterKey } from "../types/library";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming, Easing } from "react-native-reanimated";
import { indicatorSpring, indicatorPulse } from "../config/animation";

// moved to types/library

type Props = {
  active: FilterKey;
  onChange: (key: FilterKey) => void;
  anchor?: "top" | "bottom";
  offset?: number; // distance from the anchored edge
};

function LibraryBottomBar({ active, onChange, anchor = "bottom", offset }: Props) {
  const [barWidth, setBarWidth] = React.useState(0);
  const measuredWidth = Math.max(0, barWidth);
  const segmentWidth = measuredWidth > 0 ? measuredWidth / 4 : 0;
  const gridWidth = measuredWidth;
  const translateX = useSharedValue(0);
  const indicatorScaleX = useSharedValue(1);

  const activeIndexFromKey = React.useCallback((key: FilterKey): number => {
    switch (key) {
      case "recent": return 0;
      case "locked": return 1;
      case "completed": return 2;
      case "all": return 3;
      default: return 0;
    }
  }, []);

  const propActiveIndex = React.useMemo(() => activeIndexFromKey(active), [active, activeIndexFromKey]);

  const animateToIndex = React.useCallback((idx: number) => {
    // Premium-gravity feel: firm start, smooth settle
    translateX.value = withSpring(idx * segmentWidth, indicatorSpring);
    // Subtle bounce on the pill width for crispness
    indicatorScaleX.value = withSequence(
      withTiming(1.04, { duration: indicatorPulse.up.duration, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: indicatorPulse.down.duration, easing: Easing.out(Easing.quad) })
    );
  }, [indicatorScaleX, segmentWidth, translateX]);

  React.useEffect(() => {
    // Sync to external updates smoothly
    animateToIndex(propActiveIndex);
  }, [propActiveIndex, animateToIndex]);

  const indicatorStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: Math.round(translateX.value) },
        { scaleX: indicatorScaleX.value },
      ],
    };
  });
  const edgeOffset = offset ?? sizes.floatingBar.bottomOffset;
  const containerStyle = [
    styles.containerBase,
    anchor === "top" ? { top: edgeOffset } : { bottom: edgeOffset },
  ] as const;
  return (
    <View style={containerStyle} pointerEvents="box-none">
      <View style={styles.bar} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        <BottomBarBackground />
        <View style={[styles.grid, gridWidth > 0 ? { width: gridWidth } : null]}>
          {/* Moving indicator sized to exactly 1/4th of the grid width */}
          {segmentWidth > 0 ? (
            <Animated.View style={[styles.indicator, { width: segmentWidth }, indicatorStyle]} />
          ) : null}
          <MemoIconButton
            name="time"
            active={propActiveIndex === 0}
            position="first"
            onPress={() => {
              animateToIndex(0);
              requestAnimationFrame(() => requestAnimationFrame(() => onChange("recent")));
            }}
            segmentWidth={segmentWidth}
          />
          <MemoIconButton
            name="lock-closed"
            active={propActiveIndex === 1}
            position="middle"
            onPress={() => {
              animateToIndex(1);
              requestAnimationFrame(() => requestAnimationFrame(() => onChange("locked")));
            }}
            segmentWidth={segmentWidth}
          />
          <MemoIconButton
            name="checkmark-sharp"
            active={propActiveIndex === 2}
            position="middle"
            onPress={() => {
              animateToIndex(2);
              requestAnimationFrame(() => requestAnimationFrame(() => onChange("completed")));
            }}
            segmentWidth={segmentWidth}
          />
          <MemoIconButton
            name="ellipse"
            active={propActiveIndex === 3}
            position="last"
            onPress={() => {
              animateToIndex(3);
              requestAnimationFrame(() => requestAnimationFrame(() => onChange("all")));
            }}
            segmentWidth={segmentWidth}
          />
        </View>
      </View>
    </View>
  );
}

export default React.memo(LibraryBottomBar);

function IconButton({ name, active, position, onPress, segmentWidth }: { name: keyof typeof Ionicons.glyphMap; active: boolean; position: "first" | "middle" | "last"; onPress: () => void; segmentWidth: number }) {
  const slotStyle = [styles.slot, segmentWidth > 0 ? { width: segmentWidth } : null];
  return (
    <View style={slotStyle}>
      <Pressable
        onPress={onPress}
        style={styles.fillPressable}
        hitSlop={12}
        accessibilityRole="button"
      >
        <Ionicons name={name} size={22} color={active ? colors.black : colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const MemoIconButton = React.memo(IconButton);

const styles = StyleSheet.create({
  containerBase: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: sizes.floatingBar.height,
    borderRadius: radii.pill,
    alignSelf: "stretch",
    marginHorizontal: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  grid: {
    position: "relative",
    height: "100%",
    marginLeft: 0,
    marginRight: 0,
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
  activePressable: {
    backgroundColor: colors.white,
    height: "100%",
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});


