import { Stack } from "expo-router";
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
        <Stack.Screen name="friends" options={{ headerShown: true, title: "Friends" }} />
        <Stack.Screen name="notifications" options={{ headerShown: true, title: "Notifications" }} />
        <Stack.Screen
          name="create"
          options={{ presentation: "modal", headerShown: true, title: "New Echo" }}
        />
        <Stack.Screen
          name="profile-modal"
          options={{ presentation: "modal", headerShown: true, title: "Profile" }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
