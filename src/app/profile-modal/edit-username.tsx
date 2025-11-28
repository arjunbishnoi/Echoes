import { colors, spacing } from "@/theme/theme";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileUsernameModal() {
  const params = useLocalSearchParams<{ username?: string }>();
  const [value, setValue] = useState<string>(
    typeof params.username === "string" ? params.username : ""
  );
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleSave = useMemo(
    () => () => {
      router.replace({ pathname: "/profile-modal/edit", params: { username: value } });
    },
    [value]
  );

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          hitSlop={12}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save"
          hitSlop={12}
          style={styles.saveButton}
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      ),
    });
  }, [navigation, handleSave]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <TextInput
        autoFocus
        value={value}
        onChangeText={setValue}
        placeholder="Username"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalSurface,
    padding: spacing.lg,
  },
  input: {
    color: colors.textPrimary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    fontSize: 17,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  cancelText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 17,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  saveText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 17,
  },
});

