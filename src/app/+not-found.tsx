import EmptyState from "@/components/ui/EmptyState";
import { colors } from "@/theme/theme";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFound() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        <EmptyState
          icon="alert-circle-outline"
          title="Page not found"
          subtitle="The page you’re looking for doesn’t exist."
        />
        <Link href="/" asChild>
          <Pressable style={styles.button} accessibilityRole="button" accessibilityLabel="Go home" />
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  button: {
    marginTop: 16,
    width: 200,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
});


