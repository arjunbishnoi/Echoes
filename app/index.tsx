import { Redirect } from "expo-router";
import { View } from "react-native";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuth } from "../lib/authContext";
import { colors } from "../theme/theme";

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

  return <Redirect href="/(main)/home" />;
}

const styles = {
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
