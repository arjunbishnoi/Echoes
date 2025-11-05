import { BackButton } from "@/components/BackButton";
import { colors } from "@/theme/theme";
import { Stack, router } from "expo-router";
import { StyleSheet } from "react-native";

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }} 
      />
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
          headerBackVisible: false,
          headerLeft: () => <BackButton onPress={() => router.back()} />,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen
        name="echo/[id]/edit"
        options={{
          headerShown: true,
          title: "Edit Echo",
          presentation: "card",
          animation: "default",
          headerTintColor: colors.textPrimary,
          headerStyle: { 
            backgroundColor: 'transparent',
          },
          headerTransparent: true,
          headerShadowVisible: false,
          gestureEnabled: true,
          headerBackVisible: false,
          headerLeft: () => <BackButton onPress={() => router.back()} size={26} style={styles.backButton} />,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      {/** friend/[id]/edit is declared via file-based routing; explicit registration removed to avoid duplication */}
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 4,
    marginLeft: 0,
  },
});
