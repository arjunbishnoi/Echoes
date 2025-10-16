import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { UnifiedFormSection } from "../components/forms/UnifiedForm";
import { UnifiedFormRow } from "../components/forms/UnifiedFormRow";
import { useAuth } from "../lib/authContext";
import { colors, radii, spacing } from "../theme/theme";

export default function ProfileModal() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const platformName = Platform.OS === "ios" ? "iOS" : "Android";

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
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user?.photoURL || "https://picsum.photos/seed/user-avatar/120/120" }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user?.displayName || "Your Name"}</Text>
          <Text style={styles.username}>@{user?.username || user?.email?.split("@")[0] || "username"}</Text>
        </View>
      </View>

      <UnifiedFormSection style={styles.sectionSpacing}>
        <UnifiedFormRow
          title="Edit Profile"
          leftIcon="person-outline"
          systemImage="person.circle"
          showChevron
          onPress={() => Alert.alert("Edit Profile", "Edit screen coming soon")}
          accessibilityLabel="Edit Profile"
        />
        <UnifiedFormRow
          title="Friends"
          leftIcon="people-outline"
          systemImage="person.2"
          showChevron
          onPress={() => router.push("/friends")}
          accessibilityLabel="Friends"
        />
        <UnifiedFormRow
          title="Echoes Library"
          leftIcon="albums-outline"
          systemImage="square.stack.3d.up"
          showChevron
          onPress={() => router.push("/echoes")}
          accessibilityLabel="Echoes Library"
        />
        <UnifiedFormRow
          title={`Theme: ${isDarkTheme ? "Dark" : "Light"}`}
          leftIcon="moon-outline"
          switch
          switchValue={isDarkTheme}
          onSwitchChange={setIsDarkTheme}
        />
      </UnifiedFormSection>

      <UnifiedFormSection title="About">
        <UnifiedFormRow
          title="Help Center"
          leftIcon="help-circle-outline"
          systemImage="questionmark.circle"
          showChevron
          onPress={() => Alert.alert("Help", "Help center coming soon")}
          accessibilityLabel="Help Center"
        />
        <UnifiedFormRow
          title="Terms of Use"
          leftIcon="document-text-outline"
          systemImage="doc.text"
          showChevron
          onPress={() => Alert.alert("Terms", "Terms of use coming soon")}
          accessibilityLabel="Terms of Use"
        />
        <UnifiedFormRow
          title="Privacy Policy"
          leftIcon="shield-checkmark-outline"
          systemImage="hand.raised"
          showChevron
          onPress={() => Alert.alert("Privacy", "Privacy policy coming soon")}
          accessibilityLabel="Privacy Policy"
        />
        <UnifiedFormRow
          title={`Echoes for ${platformName}`}
          leftIcon="phone-portrait-outline"
          systemImage="iphone"
          valueText={appVersion}
        />
      </UnifiedFormSection>

      <Pressable
        onPress={handleSignOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        style={styles.logoutButton}
      >
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  username: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  sectionSpacing: {
    marginBottom: spacing.xl,
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
