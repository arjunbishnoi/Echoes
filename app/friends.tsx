import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/theme";

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
});


