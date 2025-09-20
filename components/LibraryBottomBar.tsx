import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, sizes } from "../theme/theme";
import type { FilterKey } from "../types/library";

// moved to types/library

type Props = {
  active: FilterKey;
  onChange: (key: FilterKey) => void;
};

function LibraryBottomBar({ active, onChange }: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        <IconButton
          name="time-outline"
          active={active === "recent"}
          position="first"
          onPress={() => onChange("recent")}
        />
        <IconButton
          name="lock-closed-outline"
          active={active === "locked"}
          position="middle"
          onPress={() => onChange("locked")}
        />
        <IconButton
          name="checkmark-outline"
          active={active === "completed"}
          position="middle"
          onPress={() => onChange("completed")}
        />
        <IconButton
          name="ellipse-outline"
          active={active === "all"}
          position="last"
          onPress={() => onChange("all")}
        />
      </View>
    </View>
  );
}

export default React.memo(LibraryBottomBar);

function IconButton({ name, active, position, onPress }: { name: keyof typeof Ionicons.glyphMap; active: boolean; position: "first" | "middle" | "last"; onPress: () => void }) {
  const slotStyle = [
    styles.slot,
    position === "first" ? styles.slotFirst : position === "last" ? styles.slotLast : styles.slotMiddle,
  ];
  return (
    <View style={slotStyle}>
      <Pressable
        onPress={onPress}
        style={[active ? styles.activePressable : styles.inactivePressable]}
        hitSlop={12}
        accessibilityRole="button"
      >
        <Ionicons name={name} size={22} color={active ? colors.black : colors.textPrimary} />
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
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.floatingBarBg,
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
  slot: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  slotFirst: {
    paddingLeft: 0,
    paddingRight: 8,
  },
  slotLast: {
    paddingLeft: 8,
    paddingRight: 0,
  },
  slotMiddle: {
    paddingHorizontal: 8,
  },
  inactivePressable: {
    width: sizes.floatingBar.sideButtonSize,
    height: sizes.floatingBar.sideButtonSize,
    borderRadius: 999,
    alignSelf: "center",
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


