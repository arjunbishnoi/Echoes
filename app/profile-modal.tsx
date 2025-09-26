import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/theme";

export default function ProfileModal() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
      {Array.from({ length: 24 }).map((_, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.rowTitle}>Setting {index + 1}</Text>
          <Text style={styles.rowSubtitle}>Example description for this setting.</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceBorder,
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  rowSubtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
});




