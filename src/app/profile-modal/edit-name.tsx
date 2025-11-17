import { colors, spacing } from "@/theme/theme";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileNameModal() {
  const params = useLocalSearchParams<{ displayName?: string }>();
  const [value, setValue] = useState<string>(
    typeof params.displayName === "string" ? params.displayName : ""
  );
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleSave = useMemo(
    () => () => {
      router.replace({ pathname: "/profile-modal/edit", params: { displayName: value } });
    },
    [value]
  );

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          hitSlop={12}
          style={{ paddingHorizontal: 8, paddingVertical: 6 }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          accessibilityRole="button"
          hitSlop={12}
          style={{ paddingHorizontal: 8, paddingVertical: 6 }}
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
        placeholder="Display name"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
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
    backgroundColor: colors.background,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    fontSize: 17,
  },
  saveText: {
    color: "#0A84FF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});

