import EmptyState from "@/components/ui/EmptyState";
import { colors, spacing } from "@/theme/theme";
import { Storage } from "@/utils/asyncStorage";
import { useFriends } from "@/utils/friendContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AVATAR_SIZE = 56;

export default function EditCollaboratorsScreen() {
  const { id, initialCollaborators } = useLocalSearchParams<{
    id: string;
    initialCollaborators?: string;
  }>();
  const navigation = useNavigation();
  const { friends } = useFriends();

  // Parse initial collaborators from route params
  const initialIds = useMemo(() => {
    if (!initialCollaborators) return [];
    try {
      return JSON.parse(initialCollaborators) as string[];
    } catch {
      return [];
    }
  }, [initialCollaborators]);

  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<string[]>(initialIds);

  // Sync state when initialCollaborators changes
  useEffect(() => {
    setSelectedCollaboratorIds(initialIds);
  }, [initialIds]);

  const toggleCollaborator = useCallback((friendId: string) => {
    setSelectedCollaboratorIds((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  }, []);

  const hasChanges = useMemo(() => {
    if (initialIds.length !== selectedCollaboratorIds.length) return true;
    return initialIds.some((id) => !selectedCollaboratorIds.includes(id)) ||
      selectedCollaboratorIds.some((id) => !initialIds.includes(id));
  }, [initialIds, selectedCollaboratorIds]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const handleSave = useCallback(async () => {
    // Store updated collaborators in AsyncStorage before navigating back
    const storageKey = `temp_collaborators_${id}`;
    await Storage.set(storageKey, selectedCollaboratorIds);
    router.back();
  }, [selectedCollaboratorIds, id]);

  useEffect(() => {
    navigation.setOptions({
      title: "Edit Collaborators",
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
        <Pressable
          onPress={handleSave}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Save"
          disabled={!hasChanges}
          style={styles.saveButton}
        >
          <Text style={[styles.saveText, !hasChanges && styles.disabledText]}>Save</Text>
        </Pressable>
      ),
    });
  }, [navigation, handleCancel, handleSave, hasChanges]);

  const renderFriend = useCallback(
    ({ item }: { item: typeof friends[0] }) => {
      const isSelected = selectedCollaboratorIds.includes(item.id);
      return (
        <Pressable
          style={styles.friendCard}
          onPress={() => toggleCollaborator(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`${isSelected ? "Remove" : "Add"} ${item.displayName} as collaborator`}
        >
          <Image
            source={{
              uri: item.photoURL || `https://picsum.photos/seed/${item.id}/200/200`,
            }}
            style={styles.avatar}
          />
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{item.displayName}</Text>
            {item.username && <Text style={styles.username}>@{item.username}</Text>}
          </View>
          <View style={styles.checkmarkContainer}>
            {isSelected && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={20} color={colors.black} />
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [selectedCollaboratorIds, toggleCollaborator]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {friends.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No friends yet"
          subtitle="Add friends to invite them as collaborators."
        />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceBorder,
    marginLeft: AVATAR_SIZE + spacing.md,
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
  disabledText: {
    opacity: 0.5,
  },
});

