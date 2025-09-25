import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/theme";

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <Text style={styles.subtitle}>This screen is under construction.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "600",
  },
  subtitle: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
});


