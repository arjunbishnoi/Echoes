import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { FormRow, FormSection } from "../components/IOSForm";
import { getExpoSwiftUI } from "../lib/expoUi";
import { colors, radii, spacing } from "../theme/theme";

export default function ProfileModal() {
  const router = useRouter();
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const platformName = Platform.OS === "ios" ? "iOS" : "Android";
  const SwiftUI = Platform.OS === "ios" ? getExpoSwiftUI() : null;
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Pressable onPress={() => Alert.alert("Edit Profile", "Edit screen coming soon")} style={styles.profileHeader} accessibilityRole="button" accessibilityLabel="Edit Profile">
        <Image
          source={{ uri: "https://picsum.photos/seed/user-avatar/120/120" }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Your Name</Text>
          <Text style={styles.editText}>Edit Profile</Text>
        </View>
      </Pressable>

      {SwiftUI ? (
        <View style={{ marginBottom: spacing.xl }}>
          <SwiftUI.Host style={{ flex: 1 }}>
            <SwiftUI.Form>
              <SwiftUI.Section>
                <SwiftUI.Button onPress={() => router.push("/friends")}>Friends</SwiftUI.Button>
                <SwiftUI.Button onPress={() => router.push("/echoes")}>Echoes Library</SwiftUI.Button>
                <SwiftUI.Switch
                  value={isDarkTheme}
                  label={`Theme: ${isDarkTheme ? "Dark" : "Light"}`}
                  onValueChange={setIsDarkTheme}
                />
              </SwiftUI.Section>
            </SwiftUI.Form>
          </SwiftUI.Host>
        </View>
      ) : (
        <FormSection>
          <FormRow
            title="Friends"
            Left={<Ionicons name="people-outline" size={20} color={colors.textPrimary} />}
            showChevron
            onPress={() => router.push("/friends")}
            accessibilityLabel="Friends"
          />
          <FormRow
            title="Echoes Library"
            Left={<Ionicons name="albums-outline" size={20} color={colors.textPrimary} />}
            showChevron
            onPress={() => router.push("/echoes")}
            accessibilityLabel="Echoes Library"
          />
          <FormRow
            title={`Theme: ${isDarkTheme ? "Dark" : "Light"}`}
            Left={<Ionicons name="moon-outline" size={20} color={colors.textPrimary} />}
            Right={
              <Switch
                value={isDarkTheme}
                onValueChange={setIsDarkTheme}
                trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                thumbColor={colors.white}
              />
            }
          />
        </FormSection>
      )}

      {SwiftUI ? (
        <SwiftUI.Host style={{ flex: 1 }}>
          <SwiftUI.Form>
            <SwiftUI.Section title="About">
              <SwiftUI.Button>Help Center</SwiftUI.Button>
              <SwiftUI.Button>Terms of Use</SwiftUI.Button>
              <SwiftUI.Button>Privacy Policy</SwiftUI.Button>
              <SwiftUI.Text>{`Echoes for ${platformName} ${appVersion}`}</SwiftUI.Text>
            </SwiftUI.Section>
          </SwiftUI.Form>
        </SwiftUI.Host>
      ) : (
        <FormSection title="About">
          <FormRow
            title="Help Center"
            Left={<Ionicons name="help-circle-outline" size={20} color={colors.textPrimary} />}
            showChevron
            accessibilityLabel="Help Center"
          />
          <FormRow
            title="Terms of Use"
            Left={<Ionicons name="document-text-outline" size={20} color={colors.textPrimary} />}
            showChevron
            accessibilityLabel="Terms of Use"
          />
          <FormRow
            title="Privacy Policy"
            Left={<Ionicons name="shield-checkmark-outline" size={20} color={colors.textPrimary} />}
            showChevron
            accessibilityLabel="Privacy Policy"
          />
          <FormRow
            title={`Echoes for ${platformName}`}
            Left={<Ionicons name="phone-portrait-outline" size={20} color={colors.textPrimary} />}
            Right={<Text style={styles.versionText}>{appVersion}</Text>}
          />
        </FormSection>
      )}

      <Pressable
        onPress={() => {
          Alert.alert("Log out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log out", style: "destructive" },
          ]);
        }}
        accessibilityRole="button"
        accessibilityLabel="Log out"
        style={styles.logoutButton}
      >
        <Text style={styles.logoutText}>Log out</Text>
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
    padding: 16,
    paddingBottom: 32,
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
  editText: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceBorder,
  },
  settingsIconLeft: {
    marginRight: spacing.md,
  },
  row: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceBorder,
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionHeader: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  rowSubtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  versionText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
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




