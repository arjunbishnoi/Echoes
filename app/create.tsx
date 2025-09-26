import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/theme";

export default function CreateEchoScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
      {Array.from({ length: 24 }).map((_, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.rowTitle}>Field {index + 1}</Text>
          <Text style={styles.rowSubtitle}>Placeholder description for this field.</Text>
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
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


