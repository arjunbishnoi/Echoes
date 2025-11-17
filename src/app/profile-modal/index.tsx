import { UnifiedFormSection } from "@/components/forms/UnifiedForm";
import { UnifiedFormRow } from "@/components/forms/UnifiedFormRow";
import { colors, radii, spacing } from "@/theme/theme";
import { useAuth } from "@/utils/authContext";
import Constants from "expo-constants";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ProfileModal() {
  const router = useRouter();
  const { user, isGuest, signOut } = useAuth();
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  
  const displayNameUI = isGuest
    ? "Guest"
    : user?.displayName || user?.username || user?.email || "Echoes user";
  const usernameUI = isGuest
    ? "guest"
    : user?.username || user?.email?.split("@")[0] || "echoes-user";
  const avatarUri = !isGuest ? user?.photoURL : undefined;

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

  const guestControlTitleStyle = isGuest ? styles.guestFormRowTitle : undefined;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.profileHeader}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.guestAvatar]} />
        )}
        <View style={styles.userInfo}>
          <Text style={styles.name}>{displayNameUI}</Text>
          <Text style={styles.username}>{usernameUI}</Text>
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
        <UnifiedFormSection style={styles.sectionSpacing}>
          <UnifiedFormRow
            title="Edit Profile"
            leftIcon="person-outline"
            systemImage="person.circle"
            showChevron
            onPress={() => router.push("/profile-modal/edit" as Href)}
            accessibilityLabel="Edit Profile"
          />
          <UnifiedFormRow
            title="Friends"
            leftIcon="people-outline"
            systemImage="person.2"
            showChevron
            onPress={() => router.push("/profile-modal/friends" as Href)}
            accessibilityLabel="Friends"
          />
        </UnifiedFormSection>
      )}

      <UnifiedFormSection style={[styles.sectionSpacing, isGuest && styles.pillFormSection]}>
        <UnifiedFormRow
          title="Echoes Library"
          leftIcon="albums-outline"
          systemImage="square.stack.3d.up"
          showChevron
          onPress={() => router.push("/echoes" as Href)}
          accessibilityLabel="Echoes Library"
          titleStyle={guestControlTitleStyle}
        />
        <UnifiedFormRow
          title={`Theme: ${isDarkTheme ? "Dark" : "Light"}`}
          leftIcon="moon-outline"
          switch
          switchValue={isDarkTheme}
          onSwitchChange={setIsDarkTheme}
          titleStyle={guestControlTitleStyle}
        />
      </UnifiedFormSection>

      <UnifiedFormSection
        title="About"
        style={[styles.sectionSpacing, isGuest && styles.pillFormSection]}
      >
        <UnifiedFormRow
          title="How it Works"
          leftIcon="help-circle-outline"
          systemImage="questionmark.circle"
          showChevron
          onPress={() => Alert.alert("How it Works", "Coming soon")}
          accessibilityLabel="How it Works"
          titleStyle={guestControlTitleStyle}
        />
        <UnifiedFormRow
          title="Terms of Use"
          leftIcon="document-text-outline"
          systemImage="doc.text"
          showChevron
          onPress={() => Alert.alert("Terms", "Terms of use coming soon")}
          accessibilityLabel="Terms of Use"
          titleStyle={guestControlTitleStyle}
        />
        <UnifiedFormRow
          title="Privacy Policy"
          leftIcon="shield-checkmark-outline"
          systemImage="hand.raised"
          showChevron
          onPress={() => Alert.alert("Privacy", "Privacy policy coming soon")}
          accessibilityLabel="Privacy Policy"
          titleStyle={guestControlTitleStyle}
        />
        <UnifiedFormRow
          title="Echoes for iOS"
          leftIcon="phone-portrait-outline"
          systemImage="iphone"
          valueText={appVersion}
          titleStyle={guestControlTitleStyle}
        />
      </UnifiedFormSection>

      {!isGuest && (
        <Pressable
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
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
    marginBottom: spacing.lg,
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
  sectionSpacing: {
    marginBottom: spacing.xl,
  },
  pillFormSection: {
    borderRadius: radii.pill,
  },
  guestFormRowTitle: {
    fontSize: 15,
    fontWeight: "400",
  },
  logoutButton: {
    marginTop: spacing.lg,
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


