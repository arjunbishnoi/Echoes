import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomBarBackground from "./BottomBarBackground";
import { colors, radii, spacing, sizes } from "../theme/theme";
import type { FilterKey } from "../types/library";

type Props = {
  active: FilterKey;
  onChange: (key: FilterKey) => void;
  onPressHeart?: () => void;
  onPressMore?: () => void;
};

export default function RightDrawerTopBar({ active, onChange, onPressHeart, onPressMore }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <BottomBarBackground flipOrder />
        {/* Left section: circular search icon + title */}
        <View style={styles.leftSection}>
          <View style={styles.searchCircle}>
            <Ionicons name="search" size={18} color={colors.black} />
          </View>
          <Text style={styles.title} numberOfLines={1}>Echoes Library</Text>
        </View>

        {/* Middle section: filter icons (same as bottom bar) */}
        <View style={styles.middleSection}>
          <FilterIcon name="time-outline" active={active === "recent"} onPress={() => onChange("recent")} />
          <FilterIcon name="lock-closed-outline" active={active === "locked"} onPress={() => onChange("locked")} />
          <FilterIcon name="checkmark-outline" active={active === "completed"} onPress={() => onChange("completed")} />
          <FilterIcon name="ellipse-outline" active={active === "all"} onPress={() => onChange("all")} />
        </View>

        {/* Right section: heart + more */}
        <View style={styles.rightSection}>
          <IconButton name="heart-outline" onPress={onPressHeart} />
          <IconButton name="ellipsis-vertical" onPress={onPressMore} />
        </View>
      </View>
    </View>
  );
}

function FilterIcon({ name, active, onPress }: { name: keyof typeof Ionicons.glyphMap; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={[styles.filterButton, active && styles.filterButtonActive]} accessibilityRole="button">
      <Ionicons name={name} size={18} color={active ? colors.black : colors.textPrimary} />
    </Pressable>
  );
}

function IconButton({ name, onPress }: { name: keyof typeof Ionicons.glyphMap; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} accessibilityRole="button" style={styles.iconButton}>
      <Ionicons name={name} size={20} color={colors.textPrimary} />
    </Pressable>
  );
}

const BAR_HEIGHT = sizes.floatingBar.height; // maintain same height

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: radii.pill,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  middleSection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: colors.white,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
});


