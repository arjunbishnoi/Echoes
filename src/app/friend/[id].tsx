import { dummyFriends } from "@/data/dummyFriends";
import { colors, spacing } from "@/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MUTUAL_FRIENDS_COUNT = 3;
const SHARED_ECHOES_COUNT = 6;
const SHARED_ECHOES_PREVIEW = 3;

export default function FriendDetailScreen() {
  const { id, name: nameParam, avatar: avatarParam } = useLocalSearchParams<{
    id: string;
    name?: string;
    avatar?: string;
  }>();

  const insets = useSafeAreaInsets();

  const friend = useMemo(() => {
    const found = dummyFriends.find((f) => f.id === id);
    if (found) {
      return {
        id: found.id,
        displayName: found.displayName,
        username: found.username,
        photoURL: found.photoURL,
        bio: found.bio,
      };
    }
    return {
      id: String(id),
      displayName: nameParam ?? "Friend",
      username: "@user",
      photoURL: typeof avatarParam === "string" ? avatarParam : "https://picsum.photos/seed/default/200/200",
      bio: undefined,
    };
  }, [id, nameParam, avatarParam]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 100 }]}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Image source={{ uri: friend.photoURL }} style={styles.avatar} />
          <Text style={styles.name}>{friend.displayName}</Text>
          <Text style={styles.username}>{friend.username}</Text>
          {friend.bio && <Text style={styles.bio}>{friend.bio}</Text>}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{MUTUAL_FRIENDS_COUNT}</Text>
            <Text style={styles.statLabel}>Mutual Friends</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{SHARED_ECHOES_COUNT}</Text>
            <Text style={styles.statLabel}>Shared Echoes</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons name="chatbubble" size={18} color={colors.black} style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Message</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.white} />
          </Pressable>
        </View>

        {/* Shared Echoes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared Echoes</Text>
          <View style={styles.echoesGrid}>
            {Array.from({ length: SHARED_ECHOES_PREVIEW }).map((_, idx) => (
              <View key={idx} style={styles.echoCard}>
                <Image
                  source={{ uri: `https://picsum.photos/seed/echo-${friend.id}-${idx}/200/200` }}
                  style={styles.echoImage}
                />
              </View>
            ))}
          </View>
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
  scrollContent: {
    paddingTop: 0,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surfaceBorder,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: spacing.md + 2,
    borderRadius: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.black,
  },
  buttonIcon: {
    marginRight: 8,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 24,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  echoesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  echoCard: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  echoImage: {
    width: "100%",
    height: "100%",
  },
});
