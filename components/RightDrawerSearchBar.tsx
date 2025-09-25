import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { colors, radii, sizes, spacing } from "../theme/theme";
import BottomBarBackground from "./BottomBarBackground";

type Props = {
  style?: any;
  title?: string;
  value?: string;
  onChangeText?: (v: string) => void;
  isEditing?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

function RightDrawerSearchBar({ style, title = "Echoes Library", value = "", onChangeText, isEditing, onFocus, onBlur }: Props) {
  const inputRef = React.useRef<TextInput>(null);
  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isEditing]);
  return (
    <View style={[styles.container, style]}>
      <BottomBarBackground />
      <View style={styles.contentRow}>
        <Ionicons name="search" size={22} color={colors.textSecondary} style={{ marginLeft: spacing.sm, marginRight: spacing.md }} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={title}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          selectionColor={colors.white}
        />
      </View>
    </View>
  );
}

export default React.memo(RightDrawerSearchBar);

const styles = StyleSheet.create({
  container: {
    height: sizes.floatingBar.height,
    borderRadius: radii.pill,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});


