import { BackButton } from "@/components/BackButton";
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
            <BackButton onPress={() => navigation.goBack()} color={colors.white} />
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
            <BackButton onPress={() => navigation.goBack()} color={colors.white} />
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
        name="add-friends"
        options={({ navigation }) => ({
          title: "Add Friends",
          headerTitleAlign: "center",
          headerBackVisible: false,
          headerLeft: () => (
            <BackButton onPress={() => navigation.goBack()} color={colors.white} />
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
            <BackButton onPress={() => navigation.goBack()} color={colors.white} />
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
        name="qr-share"
        options={({ navigation }) => ({
          title: "Your QR",
          headerTitleAlign: "center",
          headerBackVisible: false,
          headerLeft: () => (
            <BackButton onPress={() => navigation.goBack()} color={colors.white} />
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
          animation: "slide_from_right",
        })}
      />
      <Stack.Screen
        name="qr-scan"
        options={({ navigation }) => ({
          title: "Import QR",
          headerTitleAlign: "center",
          headerBackVisible: false,
          headerLeft: () => (
            <BackButton onPress={() => navigation.goBack()} color={colors.white} />
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
            <BackButton onPress={() => navigation.goBack()} color={colors.white} />
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
            <BackButton onPress={() => navigation.goBack()} color={colors.white} />
          ),
        })}
      />
    </Stack>
  );
}


