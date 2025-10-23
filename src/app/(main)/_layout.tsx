import { BackButton } from "@/components/BackButton";
import { colors } from "@/theme/theme";
import { Stack } from "expo-router";
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
        options={({ navigation }) => ({
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
          headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
          contentStyle: { backgroundColor: colors.background },
        })}
      />
      <Stack.Screen
        name="echo/[id]/edit"
        options={({ navigation }) => ({
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
          headerLeft: () => <BackButton onPress={() => navigation.goBack()} size={26} style={styles.backButton} />,
          contentStyle: { backgroundColor: colors.background },
        })}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 4,
    marginLeft: 0,
  },
});
