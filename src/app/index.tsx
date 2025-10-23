import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { colors } from "@/theme/theme";
import { useAuth } from "@/utils/authContext";
import { Redirect, type Href } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
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
