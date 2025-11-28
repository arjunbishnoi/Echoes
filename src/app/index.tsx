import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { colors } from "@/theme/theme";
import { useAuth } from "@/utils/authContext";
import { ProfileCompletionTracker } from "@/utils/profileCompletionTracker";
import { Redirect, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [needsPersonalization, setNeedsPersonalization] = useState(false);

  // Check profile completion status when user changes
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user || !isAuthenticated) {
        setCheckingProfile(false);
        return;
      }

      try {
        const needsCompletion = await ProfileCompletionTracker.needsProfileCompletion(user);
        setNeedsPersonalization(needsCompletion);
      } catch (error) {
        console.error('[Index] Error checking profile completion:', error);
        setNeedsPersonalization(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    setCheckingProfile(true);
    checkProfileCompletion();
  }, [user, isAuthenticated]);

  if (isLoading || checkingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (needsPersonalization) {
    return <Redirect href="/(auth)/personalization" />;
  }

  // Redirect to main authenticated route (resolves to /(main)/index)
  return <Redirect href={"/(main)/" as Href} />;
}

const styles = {
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
