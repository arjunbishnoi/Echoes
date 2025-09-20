import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing } from "../theme/theme";

type Props = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
};

function SearchBar({ placeholder = "Search", value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        returnKeyType="search"
      />
    </View>
  );
}

export default React.memo(SearchBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: "#242424",
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
  },
});


