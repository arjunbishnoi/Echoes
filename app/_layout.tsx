import { Stack } from "expo-router";
import { Drawer } from "react-native-drawer-layout";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="echo/[id]"
          options={{ headerShown: false, gestureEnabled: true }}
        />
        <Stack.Screen
          name="create"
          options={{ presentation: "modal", headerShown: true, title: "New Echo" }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
