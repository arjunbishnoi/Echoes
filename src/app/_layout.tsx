import { BackButton } from "@/components/BackButton";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { colors } from "@/theme/theme";
import { ActivityStorage } from "@/utils/activityStorage";
import { AuthProvider } from "@/utils/authContext";
import { EchoDraftProvider } from "@/utils/echoDraft";
import { EchoStorage } from "@/utils/echoStorage";
import { HomeEchoProvider } from "@/utils/homeEchoContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync("#000000");
    }
  }, []);

  // Warm initialize storages early to avoid per-screen spinners
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          EchoStorage.initialize(),
          ActivityStorage.initialize(),
        ]);
      } catch (error) {
        if (__DEV__) console.error("Failed to initialize storage:", error);
      }
    })();
  }, []);

  // Prefetch critical routes and heavy components for instant navigation
  useEffect(() => {
    // Prefetch the most commonly accessed route
    void import("@/app/(main)/echo/[id]");
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.rootContainer}>
        <StatusBar style="light" />
        <AuthProvider>
          <HomeEchoProvider>
            <EchoDraftProvider>
              <Stack 
                screenOptions={{ 
                  contentStyle: { backgroundColor: colors.background },
                  animation: "default",
                  headerShown: false,
                }}
              >
                <Stack.Screen 
                  name="(auth)/sign-in" 
                  options={{ 
                    headerShown: false,
                    animation: "fade",
                  }} 
                />
                <Stack.Screen 
                  name="index" 
                  options={{ 
                    headerShown: false,
                    animation: "fade",
                  }} 
                />
                <Stack.Screen 
                  name="(main)" 
                  options={{ 
                    headerShown: false,
                    animation: "default",
                  }} 
                />
                <Stack.Screen 
                  name="echoes" 
                  options={{ 
                    headerShown: true, 
                    title: "Total Echoes",
                    headerTintColor: colors.textPrimary,
                    headerStyle: { backgroundColor: colors.background },
                    headerShadowVisible: false,
                  }} 
                />
                <Stack.Screen
                  name="friends"
                  options={({ navigation }) => ({
                    headerShown: true,
                    title: "Friends",
                    headerTintColor: colors.textPrimary,
                    headerStyle: { backgroundColor: colors.background },
                    headerShadowVisible: false,
                    headerLeft: () => <BackButton onPress={() => navigation.goBack()} size={26} style={styles.backButtonAlt} />,
                  })}
                />
                <Stack.Screen
                  name="favorites"
                  options={({ navigation }) => ({
                    headerShown: true,
                    title: "Favorites",
                    headerTintColor: colors.textPrimary,
                    headerStyle: { backgroundColor: colors.background },
                    headerShadowVisible: false,
                    headerLeft: () => <BackButton onPress={() => navigation.goBack()} size={26} style={styles.backButtonAlt} />,
                  })}
                />
                <Stack.Screen
                  name="friend/[id]"
                  options={({ navigation }) => ({
                    headerShown: true,
                    title: "",
                    presentation: "card",
                    animation: "default",
                    headerTintColor: colors.textPrimary,
                    headerStyle: { 
                      backgroundColor: 'transparent',
                    },
                    headerTransparent: true,
                    headerShadowVisible: false,
                    gestureEnabled: true,
                    fullScreenGestureEnabled: false,
                    gestureDirection: "horizontal",
                    headerBackVisible: false,
                    headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
                  })}
                />
                <Stack.Screen 
                  name="notifications" 
                  options={{ 
                    headerShown: true, 
                    title: "Notifications",
                    headerTintColor: colors.textPrimary,
                    headerStyle: { backgroundColor: colors.background },
                    headerShadowVisible: false,
                  }} 
                />
                <Stack.Screen
                  name="create"
                  options={({ navigation }) => ({
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerShown: true,
                    title: "New Echo",
                    headerTransparent: true,
                    headerBlurEffect: "dark",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                    contentStyle: { backgroundColor: colors.modalSurface },
                    gestureEnabled: true,
                    headerRight: () => (
                      <Pressable
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                        hitSlop={12}
                        style={styles.closeButton}
                      >
                        <Ionicons name="close" size={28} color={colors.white} />
                      </Pressable>
                    ),
                    headerLeft: () => (
                      <Pressable
                        onPress={() => navigation.push("create-settings")}
                        accessibilityRole="button"
                        accessibilityLabel="Settings"
                        hitSlop={12}
                        style={styles.settingsButton}
                      >
                        <Ionicons name="settings-outline" size={22} color={colors.white} />
                      </Pressable>
                    ),
                  })}
                />
                <Stack.Screen
                  name="create-settings"
                  options={({ navigation }) => ({
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerShown: true,
                    title: "Echo Settings",
                    headerTransparent: true,
                    headerBlurEffect: "dark",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                    contentStyle: { backgroundColor: colors.modalSurface },
                    gestureEnabled: true,
                    headerLeft: () => (
                      <Pressable
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel"
                        hitSlop={12}
                        style={styles.settingsButton}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </Pressable>
                    ),
                    headerRight: () => (
                      <Pressable
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        accessibilityLabel="Done"
                        hitSlop={12}
                        style={styles.settingsButton}
                      >
                        <Text style={styles.doneText}>Done</Text>
                      </Pressable>
                    ),
                  })}
                />
                <Stack.Screen
                  name="profile-modal"
                  options={({ navigation }) => ({
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerShown: true,
                    title: "Settings",
                    headerTransparent: true,
                    headerBlurEffect: "dark",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                    contentStyle: { backgroundColor: colors.modalSurface },
                    gestureEnabled: true,
                    headerRight: () => (
                      <Pressable
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                        hitSlop={12}
                        style={styles.closeButton}
                      >
                        <Ionicons name="close" size={28} color={colors.white} />
                      </Pressable>
                    ),
                  })}
                />
              </Stack>
            </EchoDraftProvider>
          </HomeEchoProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButtonAlt: {
    paddingHorizontal: 4,
    marginLeft: 0,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  settingsButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cancelText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  doneText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
});
