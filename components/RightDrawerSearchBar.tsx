import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomBarBackground from "./BottomBarBackground";
import { colors, radii, spacing, sizes } from "../theme/theme";

type Props = {
  style?: any;
};

function RightDrawerSearchBar({ style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <BottomBarBackground />
      <View style={styles.contentRow}>
        <Ionicons name="search" size={22} color={colors.textSecondary} style={{ marginLeft: spacing.sm, marginRight: spacing.md }} />
        <Text style={styles.title} numberOfLines={1}>Echoes Library</Text>
      </View>
    </View>
  );
}

export default React.memo(RightDrawerSearchBar);

const styles = StyleSheet.create({
  container: {
    height: sizes.floatingBar.height,
    borderRadius: radii.pill,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});


