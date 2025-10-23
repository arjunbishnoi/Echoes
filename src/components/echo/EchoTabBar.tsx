import { colors, sizes, spacing } from "@/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

export type EchoTab = "allMedia" | "history";

interface EchoTabBarProps {
  selectedTab: EchoTab;
  onTabPress: (tab: EchoTab) => void;
  barWidth: number;
  segmentWidth: number;
  translateX: SharedValue<number>;
  indicatorScaleX: SharedValue<number>;
  onLayout: (width: number) => void;
  allLocked?: boolean;
}

function EchoTabBar({
  selectedTab,
  onTabPress,
  barWidth,
  segmentWidth,
  translateX,
  indicatorScaleX,
  onLayout,
  allLocked,
}: EchoTabBarProps) {
  const propActiveIndex = selectedTab === "allMedia" ? 0 : 1;
  const measuredWidth = Math.max(0, barWidth);

  return (
    <View style={styles.container}>
      <View
        style={styles.bar}
        onLayout={(e) => onLayout(e.nativeEvent.layout.width)}
      >
        <View style={[styles.grid, measuredWidth > 0 ? { width: measuredWidth } : null]}>
          <TabSlot
            icon="grid-outline"
            activeIcon="grid"
            active={propActiveIndex === 0}
            onPress={() => {
              if (!allLocked) onTabPress("allMedia");
            }}
            segmentWidth={segmentWidth}
            disabled={!!allLocked}
          />
          <TabSlot
            icon="time-outline"
            activeIcon="time"
            active={propActiveIndex === 1}
            onPress={() => onTabPress("history")}
            segmentWidth={segmentWidth}
          />
        </View>
      </View>
    </View>
  );
}

interface TabSlotProps {
  icon: string;
  activeIcon: string;
  active: boolean;
  onPress: () => void;
  segmentWidth: number;
  disabled?: boolean;
}

function TabSlot({ icon, activeIcon, active, onPress, segmentWidth, disabled }: TabSlotProps) {
  const iconName = (active ? activeIcon : icon) as keyof typeof Ionicons.glyphMap;
  return (
    <View style={[styles.slot, segmentWidth > 0 ? { width: segmentWidth } : null]}>
      <Pressable onPress={onPress} hitSlop={12} accessibilityRole="button" disabled={disabled} style={styles.slotPressable}>
        <Ionicons
          name={iconName}
          size={20}
          color={disabled ? "rgba(255,255,255,0.35)" : active ? colors.white : colors.textSecondary}
        />
        {disabled ? (
          <Ionicons name="lock-closed" size={12} color={colors.textSecondary} style={{ position: "absolute", right: segmentWidth > 0 ? segmentWidth / 2 - 14 : -6, bottom: 14 }} />
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,
    paddingTop: 0,
    marginTop: -spacing.sm,
  },
  bar: {
    height: sizes.floatingBar.height,
    alignSelf: "stretch",
    flex: 1,
    backgroundColor: "transparent",
    position: "relative",
  },
  grid: {
    position: "relative",
    height: "100%",
    flexDirection: "row",
  },
  slot: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  slotPressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(EchoTabBar);
