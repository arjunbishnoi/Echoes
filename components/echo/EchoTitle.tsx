import React from "react";
import { StyleSheet, Text, type LayoutChangeEvent } from "react-native";
import { colors } from "../../theme/theme";

interface EchoTitleProps {
  title: string;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export default function EchoTitle({ title, onLayout }: EchoTitleProps) {
  return (
    <Text style={styles.title} onLayout={onLayout}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
});


