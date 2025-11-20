import { BackButton } from "@/components/BackButton";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/contexts/ToastContext";
import { runMigrations } from "@/db/client";
import { colors } from "@/theme/theme";
import { ActivityStorage } from "@/utils/activityStorage";
import { AuthProvider } from "@/utils/authContext";
import { EchoDraftProvider } from "@/utils/echoDraft";
import { EchoStorage } from "@/utils/echoStorage";
import { FriendProvider } from "@/utils/friendContext";
import { HomeEchoProvider } from "@/utils/homeEchoContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as FileSystem from "expo-file-system";
import * as ExpoFont from "expo-font";
import { type FontSource } from "expo-font";
import { Stack, router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ioniconsBase64 } from "../../assets/fonts/ioniconsBase64";

const patchedIonicons = Ionicons as typeof Ionicons & {
  // relax typing to avoid conflicts with upstream declaration
  font?: Record<string, any>;
  loadFont: () => Promise<void>;
};

const ioniconsFontMap: Record<string, any> = ((patchedIonicons as any).font ?? {});
(patchedIonicons as any).font = ioniconsFontMap;

let ioniconsFontSetupPromise: Promise<void> | null = null;

async function resolveIoniconsFontSource(): Promise<FontSource> {
  // Web: data URI is sufficient and avoids any network fetch.
  if (Platform.OS === "web") {
    return { uri: `data:font/ttf;base64,${ioniconsBase64}` };
  }

  // Native: write the font to a local file (never return data: for native)
  const cacheDir = (FileSystem as any).cacheDirectory as string | undefined;
  const docDir = (FileSystem as any).documentDirectory as string | undefined;
  const candidateDirs = [
    cacheDir,
    docDir,
    cacheDir ? `${cacheDir}tmp/` : undefined,
  ].filter(Boolean) as string[];

  for (const base of candidateDirs) {
    try {
      const fontsDir = base.endsWith("/") ? `${base}fonts/` : `${base}/fonts/`;
      try { await FileSystem.makeDirectoryAsync(fontsDir, { intermediates: true }); } catch {}
      const targetPath = `${fontsDir}ionicons.ttf`;
      const info = await FileSystem.getInfoAsync(targetPath);
      if (!info.exists) {
        const enc = (FileSystem as any).EncodingType?.Base64 ?? ("base64" as any);
        await FileSystem.writeAsStringAsync(targetPath, ioniconsBase64, { encoding: enc });
      }
      return { uri: targetPath };
    } catch {
      // try next directory
    }
  }

  // If everything fails, return the existing mapping to avoid passing data: on native.
  // Ionicons will keep its default asset in that case.
  return (patchedIonicons as any).font?.ionicons ? (patchedIonicons as any).font.ionicons : { uri: "" };
}

async function prepareIoniconsFont(): Promise<void> {
  if (!ioniconsFontSetupPromise) {
    ioniconsFontSetupPromise = (async () => {
      const fontSource = await resolveIoniconsFontSource();
      ioniconsFontMap.ionicons = fontSource;
      (patchedIonicons as any).font = ioniconsFontMap;
      await ExpoFont.loadAsync({ ionicons: fontSource });
    })();
  }

  return ioniconsFontSetupPromise;
}

patchedIonicons.loadFont = () => prepareIoniconsFont();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<Error | null>(null);

  useEffect(() => {
    void prepareIoniconsFont()
      .then(() => {
        setFontsLoaded(true);
      })
      .catch((error: unknown) => {
        setFontError(error instanceof Error ? error : new Error(String(error)));
      });
  }, []);

  useEffect(() => {
    if (fontError && __DEV__) {
      console.error("Failed to load Ionicons font:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync("#000000");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await runMigrations();
      } catch (error) {
        if (__DEV__) console.error("Database migration failed:", error);
      }
    })();
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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.rootContainer}>
        <StatusBar style="light" />
        <AuthProvider>
          <FriendProvider>
            <HomeEchoProvider>
              <EchoDraftProvider>
                <ToastProvider>
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
                  options={{
                    headerShown: true,
                    title: "Friends",
                    headerTintColor: colors.textPrimary,
                    headerStyle: { backgroundColor: colors.background },
                    headerShadowVisible: false,
                    headerLeft: () => <BackButton onPress={() => router.back()} size={26} style={styles.backButtonAlt} />,
                  }}
                />
                <Stack.Screen
                  name="favorites"
                  options={{
                    headerShown: true,
                    title: "Favorites",
                    headerTintColor: colors.textPrimary,
                    headerStyle: { backgroundColor: colors.background },
                    headerShadowVisible: false,
                    headerLeft: () => <BackButton onPress={() => router.back()} size={26} style={styles.backButtonAlt} />,
                  }}
                />
                <Stack.Screen
                  name="friend/[id]"
                  options={{
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
                    headerLeft: () => <BackButton onPress={() => router.back()} />,
                  }}
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
                  options={{
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
                        onPress={() => router.back()}
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
                        onPress={() => router.push("/create-settings" as Href)}
                        accessibilityRole="button"
                        accessibilityLabel="Settings"
                        hitSlop={12}
                        style={styles.settingsButton}
                      >
                        <Ionicons name="settings-outline" size={22} color={colors.white} />
                      </Pressable>
                    ),
                  }}
                />
                <Stack.Screen
                  name="create-settings"
                  options={{
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
                        onPress={() => router.back()}
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
                        onPress={() => router.back()}
                        accessibilityRole="button"
                        accessibilityLabel="Done"
                        hitSlop={12}
                        style={styles.settingsButton}
                      >
                        <Text style={styles.doneText}>Done</Text>
                      </Pressable>
                    ),
                  }}
                />
                <Stack.Screen
                  name="profile-modal"
                  options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.modalSurface },
                    gestureEnabled: true,
                  }}
                />
                </Stack>
                </ToastProvider>
              </EchoDraftProvider>
            </HomeEchoProvider>
          </FriendProvider>
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
