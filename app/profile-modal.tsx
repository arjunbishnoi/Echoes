import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/theme";

export default function ProfileModal() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
      <View style={{ alignItems: "center" }}>
        <Image source={{ uri: "https://i.pravatar.cc/300?img=12" }} style={styles.avatarBig} />
        <View style={{ height: spacing.md }} />
        <Text style={styles.name}>Arjun Bishnoi</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avatarBig: { width: 120, height: 120, borderRadius: 60 },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
});




