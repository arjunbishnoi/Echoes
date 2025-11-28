import UserAvatar from "@/components/ui/UserAvatar";
import { colors, radii, spacing } from "@/theme/theme";
import { useAuth } from "@/utils/authContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, type Href } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ProfileModal() {
  const router = useRouter();
  const { user, isGuest, signOut } = useAuth();
  
  const displayNameUI = isGuest
    ? "Guest"
    : user?.displayName || user?.username || user?.email || "Echoes user";
  const usernameUI = isGuest
    ? "guest"
    : user?.username || user?.email?.split("@")[0] || "echoes-user";

  const handleSignOut = async () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };
  const handleGuestAuth = async () => {
    try {
      await signOut();
    } catch {
      // no-op
    } finally {
      router.replace("/(auth)/sign-in");
    }
  };

  const showProfileActions = !isGuest;

  return (
    <View style={styles.container}>
    <ScrollView
        style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        {isGuest ? (
          <View style={[styles.avatar, styles.guestAvatar]} />
        ) : (
          <UserAvatar size={160} />
        )}
        <View style={styles.userInfo}>
          <Text style={styles.name}>{displayNameUI}</Text>
            <Text style={styles.username}>@{usernameUI}</Text>
        </View>
      </View>

      {isGuest && (
        <Pressable
          onPress={handleGuestAuth}
          accessibilityRole="button"
          accessibilityLabel="Sign up or log in"
          style={styles.authButton}
        >
          <Text style={styles.authButtonText}>Sign up / Login</Text>
        </Pressable>
      )}

      {showProfileActions && (
          <View style={styles.sectionsContainer}>
            {/* Edit Profile Section */}
            <Pressable
              style={styles.modernSection}
            onPress={() => router.push("/profile-modal/edit" as Href)}
              accessibilityRole="button"
            accessibilityLabel="Edit Profile"
            >
              <View style={styles.sectionContent}>
                <View style={styles.sectionLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="pencil-outline" size={24} color={colors.white} />
                  </View>
                  <Text style={styles.sectionTitle}>Edit Profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </Pressable>

            {/* Friends Section */}
            <Pressable
              style={styles.modernSection}
            onPress={() => router.push("/profile-modal/friends" as Href)}
              accessibilityRole="button"
            accessibilityLabel="Friends"
            >
              <View style={styles.sectionContent}>
                <View style={styles.sectionLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="people-outline" size={24} color={colors.white} />
                  </View>
                  <Text style={styles.sectionTitle}>Friends</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </Pressable>

            {/* Add Friends Section */}
            <Pressable
              style={styles.modernSection}
              onPress={() => router.push("/profile-modal/add-friends" as Href)}
              accessibilityRole="button"
              accessibilityLabel="Add Friends"
            >
              <View style={styles.sectionContent}>
                <View style={styles.sectionLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="person-add-outline" size={24} color={colors.white} />
                  </View>
                  <Text style={styles.sectionTitle}>Add Friends</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {!isGuest && (
        <View style={styles.logoutContainer}>
        <Pressable
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.surface,
  },
  guestAvatar: {
    backgroundColor: colors.white,
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
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  userInfo: {
    marginTop: spacing.sm,
    alignItems: "center",
  },
  authButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    alignSelf: "stretch",
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  authButtonText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  sectionsContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  modernSection: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    marginBottom: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  sectionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    width: "100%",
  },
  sectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  logoutContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.modalSurface,
  },
  logoutButton: {
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  logoutText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "800",
  },
});


