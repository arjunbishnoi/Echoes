import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/theme";
import RightDrawerSearchBar from "../RightDrawerSearchBar";

interface DrawerHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  isEditing?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onCancel?: () => void;
  rightIcons?: React.ReactNode;
  topOffset?: number;
}

export default function DrawerHeader({
  title,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  isEditing = false,
  onFocus,
  onBlur,
  onCancel,
  rightIcons,
  topOffset = 0,
}: DrawerHeaderProps) {
  return (
    <View style={[styles.container, { top: topOffset }]}>
      <View style={styles.content}>
        {showSearch ? (
          <>
            <RightDrawerSearchBar
              title={title}
              style={styles.searchBar}
              value={searchValue}
              onChangeText={onSearchChange}
              isEditing={isEditing}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {isEditing ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={12}
                onPress={onCancel}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            ) : (
              rightIcons
            )}
          </>
        ) : (
          <>
            {title && <Text style={styles.title}>{title}</Text>}
            {rightIcons}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 100,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    marginRight: spacing.md,
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
});


