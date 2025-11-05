import IconButton from "@/components/ui/IconButton";
import { colors, radii, spacing } from "@/theme/theme";
import { FriendStorage } from "@/utils/friendStorage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const AVATAR_SIZE = 160;

export default function EditFriendScreen() {
  const { id, name: nameParam, avatar: avatarParam } = useLocalSearchParams<{
    id?: string;
    name?: string;
    avatar?: string;
  }>();

  const navigation = useNavigation();

  const friendId = typeof id === "string" ? id : String(id ?? "");
  const originalName = typeof nameParam === "string" && nameParam.length > 0 ? nameParam : "Friend";
  const photoURL = typeof avatarParam === "string" && avatarParam.length > 0
    ? avatarParam
    : `https://picsum.photos/seed/${friendId}/300/300`;

  const [nickname, setNickname] = useState(originalName);
  const [originalNickname] = useState(originalName);

  const originalValuesRef = useRef({
    nickname: originalName,
  });

  // Check if any changes have been made
  const hasChanges = useCallback(() => {
    const original = originalValuesRef.current;
    return nickname.trim() !== original.nickname;
  }, [nickname]);

  const handleSave = useCallback(async () => {
    try {
      await FriendStorage.initialize();
      await FriendStorage.setNickname(friendId, nickname.trim());
      router.back();
    } catch (error) {
      console.error("Failed to save friend nickname:", error);
      Alert.alert("Error", "Failed to save changes. Please try again.");
    }
  }, [friendId, nickname]);

  const handleCancel = useCallback(() => {
    if (!hasChanges()) {
      router.back();
      return;
    }

    // Show confirmation dialog if there are unsaved changes
    Alert.alert(
      "Discard Changes?",
      "You have unsaved changes. Are you sure you want to discard them?",
      [
        {
          text: "Keep Editing",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  }, [hasChanges]);

  const handleRemove = useCallback(() => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${originalNickname}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await FriendStorage.initialize();
            await FriendStorage.removeFriend(friendId);
            router.back();
          },
        },
      ]
    );
  }, [originalNickname, friendId]);

  useEffect(() => {
    navigation.setOptions({
      title: "Edit Friend",
      headerShown: true,
      headerStyle: { backgroundColor: 'transparent' },
      headerTransparent: true,
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { color: colors.textPrimary },
      headerShadowVisible: false,
      headerBackVisible: false,
      headerLeft: () => (
        <Pressable
          onPress={handleCancel}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      ),
      headerRight: () => (
        <IconButton
          icon="checkmark"
          onPress={handleSave}
          color={colors.white}
          style={{ backgroundColor: colors.blue }}
        />
      ),
    });
  }, [navigation, handleSave, handleCancel]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image source={{ uri: photoURL }} style={styles.avatar} />
          <Text style={styles.name}>{originalName}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Nickname</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter a nickname"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              returnKeyType="done"
              multiline={false}
            />
          </View>

          <View style={styles.removeSection}>
            <Pressable
              onPress={handleRemove}
              style={styles.removeButton}
              accessibilityRole="button"
              accessibilityLabel="Remove friend"
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.removeButtonText}>Remove Friend</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.xl + 60,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.surface,
  },
  name: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 17,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  removeSection: {
    marginTop: spacing.xl,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    borderRadius: radii.md,
    gap: 8,
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
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
  bottomSpacer: {
    height: spacing.xxl,
  },
});


