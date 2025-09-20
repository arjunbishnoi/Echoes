import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors, spacing } from "../theme/theme";

type Props = {
  avatarUri: string;
  name: string;
  text: string;
  rightThumbUri: string;
};

export default function ProfileUpdateItem({ avatarUri, name, text, rightThumbUri }: Props) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: avatarUri }} style={styles.avatar} />
      <View style={{ flex: 1, marginRight: spacing.lg }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      <Image source={{ uri: rightThumbUri }} style={styles.thumb} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.md,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  text: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
});


