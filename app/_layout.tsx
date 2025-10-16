import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BackButton } from "../components/BackButton";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import { AuthProvider } from "../lib/authContext";
import { EchoDraftProvider } from "../lib/echoDraft";
import { HomeEchoProvider } from "../lib/homeEchoContext";
import { colors } from "../theme/theme";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync("#000000");
    }
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.rootContainer}>
        <StatusBar style="light" />
        <AuthProvider>
          <HomeEchoProvider>
            <EchoDraftProvider>
              <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
                <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(main)/home" options={{ headerShown: false, title: "" }} />
                <Stack.Screen
                  name="echo/[id]"
                  options={{
                    headerShown: true,
                    title: "",
                    headerBackTitle: "",
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
                    headerBackVisible: true,
                  }}
                />
                <Stack.Screen name="echoes" options={{ headerShown: true, title: "Total Echoes" }} />
                <Stack.Screen
                  name="friends"
                  options={({ navigation }) => ({
                    headerShown: true,
                    title: "",
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
                <Stack.Screen name="notifications" options={{ headerShown: true, title: "Notifications" }} />
                <Stack.Screen
                  name="create"
                  options={({ navigation }) => ({
                    presentation: "modal",
                    headerShown: true,
                    title: "New Echo",
                    headerTransparent: true,
                    headerTranslucent: true,
                    headerLargeTitle: false,
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                    contentStyle: { backgroundColor: colors.modalSurface },
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
                    headerShown: true,
                    title: "Echo settings",
                    headerTransparent: true,
                    headerTranslucent: true,
                    headerLargeTitle: false,
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                    contentStyle: { backgroundColor: colors.modalSurface },
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
                    headerShown: true,
                    title: "Settings",
                    headerTransparent: true,
                    headerTranslucent: true,
                    headerLargeTitle: false,
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                    contentStyle: { backgroundColor: colors.modalSurface },
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
