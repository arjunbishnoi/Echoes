import ListSeparator from "@/components/ListSeparator";
import TimeCapsuleCard from "@/components/TimeCapsuleCard";
import EmptyState from "@/components/ui/EmptyState";
import { HERO_HEIGHT } from "@/constants/dimensions";
import { useEchoStorage } from "@/hooks/useEchoStorage";
import { useFavoriteEchoes } from "@/hooks/useFavoriteEchoes";
import { useFriendContextMenu } from "@/hooks/useFriendContextMenu";
import { useHeaderTitle } from "@/hooks/useHeaderTitle";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { colors, spacing } from "@/theme/theme";
import { useAuth } from "@/utils/authContext";
import { computeEchoProgressPercent } from "@/utils/echoes";
import { useFriends } from "@/utils/friendContext";
import { UserService } from "@/utils/services/userService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useNavigation, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FriendDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();
  const { id, name: nameParam, avatar: avatarParam } = useLocalSearchParams<{
    id?: string;
    name?: string;
    avatar?: string;
  }>();

  const { echoes } = useEchoStorage();
  const { isFavorite } = useFavoriteEchoes();
  const { showContextMenu } = useFriendContextMenu();
  const { user } = useAuth();

  const friendId = typeof id === "string" ? id : String(id ?? "");
  const { friendsById, refresh } = useFriends();
  const [externalProfile, setExternalProfile] = useState<import("@/types/user").UserProfile | null>(null);
  const friendProfile = friendsById[friendId] ?? externalProfile ?? null;
  const friendBio = friendProfile?.bio ?? "";
  const fallbackDisplayName =
    typeof nameParam === "string" && nameParam.length > 0 ? nameParam : "Friend";
  const fallbackPhotoURL =
    typeof avatarParam === "string" && avatarParam.length > 0
      ? avatarParam
      : `https://picsum.photos/seed/${friendId || "friend"}/300/300`;
  const displayName = friendProfile?.displayName ?? fallbackDisplayName;
  const username =
    (friendProfile?.username ?? null) ||
    (typeof friendId === "string" && friendId.length > 0 ? friendId : null);
  const photoURL = friendProfile?.photoURL ?? fallbackPhotoURL;
  const [incomingRequestId, setIncomingRequestId] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState(false);
  
  // Header title hook for scrolling - only measure the display name text
  const { showHeaderTitle, handleTitleLayout, handleTitleContainerLayout, handleScroll, titleContainerRef } = useHeaderTitle(insets.top);
  
  // Track scroll position for header shadow
  const [showHeaderShadow, setShowHeaderShadow] = useState(false);

  useEffect(() => {
    if (friendsById[friendId]) {
      setExternalProfile(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const profile = await UserService.getUser(friendId);
        if (!cancelled && profile) {
          setExternalProfile({
            id: profile.id,
            displayName: profile.displayName,
            username: profile.username,
            photoURL: profile.photoURL,
            bio: profile.bio,
          });
        }
      } catch (error) {
        if (__DEV__) console.warn("Failed to load friend profile:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [friendId, friendsById]);

  // Listen for incoming friend requests from this user to the current user
  useEffect(() => {
    if (!user) return;
    const unsubscribe = UserService.subscribeToIncomingFriendRequests(
      user.id,
      (requests) => {
        const match = requests.find((r) => r.fromUserId === friendId && r.status === "pending");
        setIncomingRequestId(match?.id ?? null);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [user?.id, friendId]);

  const friendEchoes = useMemo(() => {
    if (!user) return [];

    return echoes.filter((e) => {
      const participantIds = [e.ownerId, ...(e.collaboratorIds ?? [])];
      const hasFriend = participantIds.includes(friendId);
      const hasMe = participantIds.includes(user.id);
      // Only echoes where both you and this friend are participants
      return hasFriend && hasMe;
    });
  }, [echoes, friendId, user?.id]);

  const collaboratorProfileIds = useMemo(() => {
    const ids = new Set<string>();
    friendEchoes.forEach((echo) => {
      if (echo.ownerId) ids.add(echo.ownerId);
      echo.collaboratorIds?.forEach((id) => {
        if (id) ids.add(id);
      });
    });
    return Array.from(ids);
  }, [friendEchoes, friendId]);

  const collaboratorProfiles = useUserProfiles(collaboratorProfileIds);

  const getParticipantData = useCallback((echo: import("@/types/echo").Echo) => {
    const participants: { avatar: string; id?: string }[] = [];
    const seenIds = new Set<string>();

    if (echo.ownerId) {
      let ownerAvatar =
        echo.ownerPhotoURL ||
        friendsById[echo.ownerId]?.photoURL ||
        collaboratorProfiles[echo.ownerId]?.photoURL;

      // Fallback to current user if owner is me
      if (!ownerAvatar && user && echo.ownerId === user.id) {
        ownerAvatar = user.photoURL;
      }

      if (ownerAvatar) {
        participants.push({ avatar: ownerAvatar, id: echo.ownerId });
        seenIds.add(echo.ownerId);
      }
    }

    echo.collaboratorIds?.forEach((collaboratorId) => {
      if (seenIds.has(collaboratorId)) return;

      let friendAvatar =
        friendsById[collaboratorId]?.photoURL ||
        collaboratorProfiles[collaboratorId]?.photoURL;

      // If the collaborator is the current user, use their avatar
      if (!friendAvatar && user && collaboratorId === user.id) {
        friendAvatar = user.photoURL;
      }

      if (friendAvatar) {
        participants.push({ avatar: friendAvatar, id: collaboratorId });
        seenIds.add(collaboratorId);
      }
    });

    return participants;
  }, [friendsById, user, collaboratorProfiles]);

  const renderItem = useCallback(
    ({ item }: { item: import("@/types/echo").Echo }) => {
      const isProfileModalFlow = pathname.startsWith("/profile-modal");
      const targetPathname = isProfileModalFlow ? "/profile-modal/echo/[id]" : "/(main)/echo/[id]";

      return (
    <TimeCapsuleCard
      id={item.id}
      title={item.title}
      imageUrl={item.imageUrl}
      progress={computeEchoProgressPercent(item)}
      participants={getParticipantData(item)}
      isPrivate={item.isPrivate}
      isPinned={false}
      isFavorite={isFavorite(item.id)}
          status={
            item.status === "unlocked"
              ? "unlocked"
              : item.status === "locked"
              ? "locked"
              : "ongoing"
          }
      style={styles.cardHeight}
          onPress={() =>
            router.push({
              pathname: targetPathname,
              params: { id: item.id },
            })
          }
    />
      );
    },
    [getParticipantData, isFavorite, pathname, router]
  );

  const keyExtractor = useCallback((item: import("@/types/echo").Echo) => item.id, []);

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

  const handleAcceptRequest = useCallback(async () => {
    if (!incomingRequestId || !user) return;
    setProcessingRequest(true);
    try {
      await UserService.acceptFriendRequest(incomingRequestId);
      setIncomingRequestId(null);
      await refresh();
      Alert.alert("Friend added", `You're now friends with ${displayName}.`);
    } catch (error) {
      Alert.alert("Error", (error as Error)?.message ?? "Failed to accept friend request.");
    } finally {
      setProcessingRequest(false);
    }
  }, [incomingRequestId, user?.id, refresh, displayName]);

  const handleDeclineRequest = useCallback(async () => {
    if (!incomingRequestId || !user) return;
    setProcessingRequest(true);
    try {
      await UserService.declineFriendRequest(incomingRequestId);
      setIncomingRequestId(null);
    } catch (error) {
      Alert.alert("Error", (error as Error)?.message ?? "Failed to decline friend request.");
    } finally {
      setProcessingRequest(false);
    }
  }, [incomingRequestId, user?.id]);

  const handleContextMenu = useCallback(() => {
    showContextMenu({
      onRemove: handleRemove,
    });
  }, [showContextMenu, handleRemove]);

  // Update navigation header when title or shadow changes
  useEffect(() => {
    navigation.setOptions({
      title: showHeaderTitle ? displayName : "",
      headerShadowVisible: showHeaderShadow,
      headerStyle: {
        backgroundColor: 'transparent',
      },
      headerRight: () => (
        <Pressable
          onPress={handleContextMenu}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Friend options"
          style={styles.headerButton}
        >
          <View style={styles.iconWrapper}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
          </View>
        </Pressable>
      ),
    });
  }, [navigation, handleContextMenu, showHeaderTitle, showHeaderShadow, displayName]);

  const renderHeader = useCallback(() => (
      <View style={[styles.header, { paddingTop: insets.top + spacing.xxl }]}> 
        <Image source={{ uri: photoURL }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <View ref={titleContainerRef} onLayout={handleTitleContainerLayout}>
          <Text style={styles.name} onLayout={handleTitleLayout}>{displayName}</Text>
        </View>
        {!!username && <Text style={styles.username}>@{username}</Text>}
      </View>
      {incomingRequestId && (
        <View style={styles.requestActions}>
          <Pressable
            style={[styles.requestButton, styles.requestDecline]}
            onPress={handleDeclineRequest}
            disabled={processingRequest}
          >
            <Text style={styles.requestDeclineText}>Decline</Text>
          </Pressable>
          <Pressable
            style={[styles.requestButton, styles.requestAccept]}
            onPress={handleAcceptRequest}
            disabled={processingRequest}
          >
            <Text style={styles.requestAcceptText}>Accept</Text>
          </Pressable>
        </View>
      )}
      {!!friendBio && <Text style={styles.bio}>{friendBio}</Text>}
      </View>
  ), [photoURL, displayName, username, friendBio, incomingRequestId, processingRequest, insets.top, handleAcceptRequest, handleDeclineRequest, titleContainerRef, handleTitleContainerLayout, handleTitleLayout]);

  const handleScrollEvent = useCallback((e: any) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    handleScroll(scrollY);
    setShowHeaderShadow(scrollY > 5);
  }, [handleScroll]);

  return (
    <View style={styles.container}>
      <FlatList
        data={friendEchoes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScrollEvent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="albums-outline"
              title="No echoes together yet"
              subtitle="Create a shared echo with this friend to see it here."
            />
          </View>
        }
      />
    </View>
  );
}

const AVATAR_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  header: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.surface,
  },
  userInfo: {
    marginTop: spacing.sm,
    alignItems: "center",
  },
  name: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
    marginTop: spacing.md,
    textAlign: "center",
  },
  username: {
    marginTop: 2,
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  bio: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
      emptyContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  cardHeight: {
    height: HERO_HEIGHT,
  },
      requestActions: {
        flexDirection: "row",
        marginTop: spacing.lg,
        gap: spacing.md,
      },
      requestButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
      },
      requestDecline: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.surfaceBorder,
      },
      requestDeclineText: {
        color: colors.textSecondary,
        fontSize: 15,
        fontWeight: "600",
      },
      requestAccept: {
        backgroundColor: colors.white,
      },
      requestAcceptText: {
        color: colors.black,
        fontSize: 15,
        fontWeight: "600",
  },
  headerButton: {
    width: 44,
    height: 44,
    padding: 0,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    marginTop: -7,
  },
});
