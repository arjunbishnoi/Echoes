import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { colors, spacing } from "../theme/theme";

export default function ProfileModal() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.headerRow}>
        <Image source={{ uri: "https://i.pravatar.cc/200?img=12" }} style={styles.avatar} />
        <View style={{ marginLeft: spacing.lg }}>
          <Text style={styles.name}>Arjun Bishnoi</Text>
          <Text style={styles.sub}>@arjun</Text>
        </View>
      </View>

      <View style={{ height: spacing.xl }} />
      <Text style={styles.section}>About</Text>
      <Text style={styles.body}>This is a placeholder profile modal. Add bio, links, and more here.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  sub: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
});


