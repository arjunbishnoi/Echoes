import { colors, radii, spacing } from "@/theme/theme";
import type { Echo } from "@/types/echo";
import { Storage } from "@/utils/asyncStorage";
import { useAuth } from "@/utils/authContext";
import { sortEchoesForHome } from "@/utils/echoSorting";
import { ProfileCompletionTracker } from "@/utils/profileCompletionTracker";
import { EchoService } from "@/utils/services/echoService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function SignIn() {
  const router = useRouter();
  const { signInWithGoogle, signInAsGuest, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const user = await signInWithGoogle();
      
      if (user) {
        // Start preloading images for home screen while auth context syncs data
        try {
           // Ensure we are reading settings for this user
           Storage.setNamespace(user.id);
           const [remoteEchoes, pinnedIds, hiddenIds] = await Promise.all([
             EchoService.getUserEchoes(user.id),
             Storage.getPinned(),
             Storage.getHiddenFromHome()
           ]);

           const pinnedSet = new Set(pinnedIds || []);
           const hiddenSet = new Set(hiddenIds || []);

           const visibleEchoes = remoteEchoes.filter((e: Echo) => !hiddenSet.has(e.id));
           const topEchoes = sortEchoesForHome(visibleEchoes, pinnedSet).slice(0, 8);

           const prefetchTasks: Promise<boolean>[] = [];
           topEchoes.forEach((echo: Echo) => {
             if (echo.imageUrl) {
               prefetchTasks.push(Image.prefetch(echo.imageUrl));
             }
             if (echo.ownerPhotoURL) {
               prefetchTasks.push(Image.prefetch(echo.ownerPhotoURL));
             }
           });

           // Wait for images to cache
           await Promise.all(prefetchTasks);

        } catch (e) {
           console.warn("Failed to preload home images:", e);
           // Proceed anyway
        }

        const needsCompletion = await ProfileCompletionTracker.needsProfileCompletion(user);
        if (needsCompletion) {
          router.replace("/(auth)/personalization" as Href);
        } else {
          router.replace("/(main)/" as Href);
        }
      } else {
        // Fallback if no user returned
      router.replace("/" as Href);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert(
        "Sign In Failed",
        "Unable to sign in with Google. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        <View style={styles.brandingContainer}>
          <Ionicons name="lock-closed" size={40} color={colors.white} />
          <Text style={styles.appName}>Echoes</Text>
        </View>

        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="time-outline"
            title="Time Capsules"
            description="Create digital time capsules with photos, videos, and memories"
          />
          <FeatureItem
            icon="people-outline"
            title="Share with Friends"
            description="Collaborate with friends on shared echoes and moments"
          />
          <FeatureItem
            icon="lock-closed-outline"
            title="Lock & Unlock"
            description="Set dates to lock and unlock your precious memories"
          />
        </View>
      </View>

      <View style={styles.signInContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.googleButton,
            pressed && styles.googleButtonPressed,
            (isSigningIn || isLoading) && styles.googleButtonDisabled,
          ]}
          onPress={handleGoogleSignIn}
          disabled={isSigningIn || isLoading}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
        >
          {isSigningIn || isLoading ? (
            <ActivityIndicator color={colors.textSecondary} style={styles.spinner} />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color={colors.black} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.guestButton}
          onPress={async () => {
            try {
              await signInAsGuest();
              router.replace("/(main)/" as Href);
            } catch (error) {
              console.error("Guest sign in error:", error);
              Alert.alert("Error", "Unable to continue as guest. Please try again.");
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Continue as Guest"
        >
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

type FeatureItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={24} color={colors.white} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: "center",
  },
  brandingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  appName: {
    fontSize: 40,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  featuresContainer: {
    gap: spacing.xl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTextContainer: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  signInContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    gap: spacing.md,
    minHeight: 56,
  },
  googleButtonPressed: {
    opacity: 0.7,
  },
  googleButtonDisabled: {
    opacity: 0.5,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.black,
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
  guestButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
