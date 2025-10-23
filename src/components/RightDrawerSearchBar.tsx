import BottomBarBackground from "@/components/BottomBarBackground";
import { colors, radii, sizes, spacing } from "@/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

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
  const inputRef = useRef<TextInput>(null);
  useEffect(() => {
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
        {value.length > 0 && (
          <Pressable
            onPress={() => onChangeText?.("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default memo(RightDrawerSearchBar);

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
  clearButton: {
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
    padding: spacing.xs,
  },
});


