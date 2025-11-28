import EmptyState from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import { colors, spacing } from "@/theme/theme";
import type { UserProfile } from "@/types/user";
import { useFriends } from "@/utils/friendContext";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const AVATAR_SIZE = 56;

export default function FriendsScreen() {
  const router = useRouter();
  const { friends, isLoading, refresh } = useFriends();

  const handleFriendPress = useCallback(
    (friend: UserProfile) => {
      router.push({
        pathname: "/friend/[id]",
        params: {
          id: friend.id,
          name: friend.displayName,
          avatar: friend.photoURL,
        },
      });
    },
    [router]
  );

  const renderFriend = useCallback(
    ({ item }: { item: UserProfile }) => (
      <Pressable
        style={styles.friendCard}
        onPress={() => handleFriendPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.displayName}'s profile`}
      >
        <Avatar
          uri={item.photoURL}
          userId={item.id}
          size={AVATAR_SIZE}
          showFallback={true}
        />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.username}>{item.username}</Text>
        </View>
      </Pressable>
    ),
    [handleFriendPress]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        contentContainerStyle={[
          styles.listContent,
          friends.length === 0 && styles.emptyListContent,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="people-outline"
              title="No friends yet"
              subtitle="Add friends to collaborate on echoes."
            />
          ) : null
        }
        refreshing={isLoading}
        onRefresh={refresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  listContent: {
    padding: spacing.lg,
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
    marginBottom: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceBorder,
    marginLeft: AVATAR_SIZE + spacing.md,
  },
});
