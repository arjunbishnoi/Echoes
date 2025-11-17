import { colors } from "@/theme/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { Pressable } from "react-native";

export default function ProfileModalStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.textPrimary,
        headerStyle: { backgroundColor: "transparent" },
        headerTransparent: true,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.modalSurface },
        headerBackTitle: "",
      }}
    >
      <Stack.Screen
        name="index"
        options={({ navigation }) => ({
          title: "Settings",
          headerTitleAlign: "center",
          headerRight: () => (
            <Pressable
              onPress={() => navigation.getParent()?.goBack()}
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
        name="friends"
        options={({ navigation }) => ({
          title: "Friends",
          headerTitleAlign: "center",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              style={{ paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => navigation.getParent()?.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              style={{ paddingHorizontal: 4, paddingVertical: 2 }}
            >
              <Ionicons name="close" size={28} color={colors.white} />
            </Pressable>
          ),
          gestureEnabled: true,
          fullScreenGestureEnabled: false,
          gestureDirection: "horizontal",
          animation: "slide_from_right",
        })}
      />
      <Stack.Screen
        name="friends/[id]"
        options={({ navigation }) => ({
          title: "",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              style={{ paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => navigation.getParent()?.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              style={{ paddingHorizontal: 4, paddingVertical: 2 }}
            >
              <Ionicons name="close" size={28} color={colors.white} />
            </Pressable>
          ),
          gestureEnabled: true,
          fullScreenGestureEnabled: false,
          gestureDirection: "horizontal",
          animation: "slide_from_right",
        })}
      />
      <Stack.Screen
        name="edit"
        options={({ navigation }) => ({
          title: "Edit Profile",
          headerTitleAlign: "center",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              style={{ paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => navigation.getParent()?.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              style={{ paddingHorizontal: 4, paddingVertical: 2 }}
            >
              <Ionicons name="close" size={28} color={colors.white} />
            </Pressable>
          ),
          gestureEnabled: true,
          fullScreenGestureEnabled: false,
          gestureDirection: "horizontal",
          animation: "slide_from_right",
        })}
      />
      <Stack.Screen
        name="edit-name"
        options={({ navigation }) => ({
          title: "Edit Display Name",
          headerTitleAlign: "center",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              style={{ paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="edit-username"
        options={({ navigation }) => ({
          title: "Edit Username",
          headerTitleAlign: "center",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              style={{ paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </Pressable>
          ),
        })}
      />
    </Stack>
  );
}


