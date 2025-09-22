import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { colors } from "../theme/theme";

export default function Screen({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.container, style]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});





