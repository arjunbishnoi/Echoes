import ListSeparator from "@/components/ListSeparator";
import TimeCapsuleCard from "@/components/TimeCapsuleCard";
import { HERO_HEIGHT } from "@/constants/dimensions";
import { dummyFriends } from "@/data/dummyFriends";
import { useEchoStorage } from "@/hooks/useEchoStorage";
import { useFavoriteEchoes } from "@/hooks/useFavoriteEchoes";
import { useFriendContextMenu } from "@/hooks/useFriendContextMenu";
import { colors, spacing } from "@/theme/theme";
import { computeEchoProgressPercent } from "@/utils/echoes";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FriendDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const { id, name: nameParam, avatar: avatarParam } = useLocalSearchParams<{
    id?: string;
    name?: string;
    avatar?: string;
  }>();

  const displayName = typeof nameParam === "string" && nameParam.length > 0 ? nameParam : "Friend";
  const photoURL = typeof avatarParam === "string" && avatarParam.length > 0
    ? avatarParam
    : `https://picsum.photos/seed/${id ?? "friend"}/300/300`;

  const { echoes } = useEchoStorage();
  const { isFavorite } = useFavoriteEchoes();
  const { showContextMenu } = useFriendContextMenu();

  const friendId = typeof id === "string" ? id : String(id ?? "");
  const friendProfile = useMemo(() => dummyFriends.find((f) => f.id === friendId), [friendId]);
  const friendBio = friendProfile?.bio ?? "";
  const mutuals = useMemo(() => dummyFriends.filter((f) => f.id !== friendId), [friendId]);

  const friendEchoes = useMemo(() => {
    return echoes.filter((e) => e.ownerId === friendId || (e.collaboratorIds?.includes(friendId)));
  }, [echoes, friendId]);

  const getAvatarUrls = useCallback((echo: import("@/types/echo").Echo): string[] => {
    const avatars: string[] = [];
    if (echo.ownerPhotoURL) avatars.push(echo.ownerPhotoURL);
    if (echo.collaboratorIds && echo.collaboratorIds.length > 0) {
      echo.collaboratorIds.forEach((collaboratorId) => {
        const friend = dummyFriends.find((f) => f.id === collaboratorId);
        if (friend?.photoURL) avatars.push(friend.photoURL);
      });
    }
    return avatars;
  }, []);

  const renderItem = useCallback(({ item }: { item: import("@/types/echo").Echo }) => (
    <TimeCapsuleCard
      id={item.id}
      title={item.title}
      imageUrl={item.imageUrl}
      progress={computeEchoProgressPercent(item)}
      participants={getAvatarUrls(item)}
      isPrivate={item.isPrivate}
      isPinned={false}
      isFavorite={isFavorite(item.id)}
      status={item.status === "unlocked" ? "unlocked" : item.status === "locked" ? "locked" : "ongoing"}
      style={styles.cardHeight}
      onPress={() => router.push({ pathname: "/profile-modal/echo/[id]", params: { id: item.id } })}
    />
  ), [getAvatarUrls, isFavorite]);

  const keyExtractor = useCallback((item: import("@/types/echo").Echo) => item.id, []);

  const handleEdit = useCallback(() => {
    router.push({ pathname: "/friend/[id]/edit", params: { id: friendId, name: displayName, avatar: photoURL } });
  }, [router, friendId, displayName, photoURL]);

  const handleRemove = useCallback(() => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${displayName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            // Import and use FriendStorage here
            const { FriendStorage } = await import("@/utils/friendStorage");
            await FriendStorage.initialize();
            await FriendStorage.removeFriend(friendId);
            router.back();
          },
        },
      ]
    );
  }, [displayName, friendId, router]);

  const handleContextMenu = useCallback(() => {
    showContextMenu({
      onEdit: handleEdit,
      onRemove: handleRemove,
    });
  }, [showContextMenu, handleEdit, handleRemove]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleContextMenu}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Friend options"
          style={styles.headerButton}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
        </Pressable>
      ),
    });
  }, [navigation, handleContextMenu]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xxl }]}> 
        <Image source={{ uri: photoURL }} style={styles.avatar} />
        <Text style={styles.name}>{displayName}</Text>
        {!!friendBio && <Text style={styles.bio}>{friendBio}</Text>}
      </View>
      <View style={styles.mutualsSection}>
        <View style={styles.mutualsRow}>
          <Text style={styles.mutualsInlineTitle}>{`Mutuals (${mutuals.length})`}</Text>
          <View style={styles.avatarsStack}>
            {mutuals.map((f, idx, arr) => (
              <Image
                key={`mutual-${f.id}`}
                source={{ uri: f.photoURL || `https://picsum.photos/seed/${f.id}/200/200` }}
                style={[
                  styles.avatarStacked,
                  idx > 0 ? { marginLeft: -AVATAR_MUTUAL_SIZE * 0.35 } : null,
                  { zIndex: arr.length - idx },
                ]}
              />
            ))}
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </View>
      </View>
      <FlatList
        data={friendEchoes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const AVATAR_SIZE = 160;
const AVATAR_MUTUAL_SIZE = 32; // slightly larger for mutuals per request

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
  bio: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  mutualsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  mutualsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  avatarsStack: {
    flexDirection: "row",
    alignItems: "center",
    height: AVATAR_MUTUAL_SIZE,
  },
  avatarStacked: {
    width: AVATAR_MUTUAL_SIZE,
    height: AVATAR_MUTUAL_SIZE,
    borderRadius: AVATAR_MUTUAL_SIZE / 2,
  },
  mutualsInlineTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  cardHeight: {
    height: HERO_HEIGHT,
  },
  headerButton: {
    padding: 4,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
