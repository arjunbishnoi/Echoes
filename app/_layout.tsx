import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "../theme/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="echo/[id]"
          options={{ headerShown: false, gestureEnabled: true }}
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
            headerLeft: () => (
              <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" style={{ paddingHorizontal: 4 }}>
                <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
              </Pressable>
            ),
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
                style={{ paddingHorizontal: 4, paddingVertical: 2 }}
              >
                <Ionicons name="close" size={28} color={colors.white} />
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
                style={{ paddingHorizontal: 4, paddingVertical: 2 }}
              >
                <Ionicons name="close" size={28} color={colors.white} />
              </Pressable>
            ),
          })}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
