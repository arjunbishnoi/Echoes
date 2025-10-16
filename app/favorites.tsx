import { useRouter } from "expo-router";
import { Fragment, useCallback, useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LibraryItem from "../components/LibraryItem";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useEchoStorage } from "../hooks/useEchoStorage";
import { useFavoriteEchoes } from "../hooks/useFavoriteEchoes";
import { computeEchoProgressPercent } from "../lib/echoes";
import { colors, spacing } from "../theme/theme";

const SEGMENT_WIDTH = 0.25 * (Dimensions.get("window").width - 32);

export default function FavoritesScreen() {
  const router = useRouter();
  const { echoes, isLoading } = useEchoStorage();
  const { isFavorite } = useFavoriteEchoes();

  const favoriteEchoes = useMemo(
    () => echoes.filter((echo) => isFavorite(echo.id)),
    [echoes, isFavorite]
  );

  const handleEchoPress = useCallback(
    (echoId: string, title: string, imageUrl?: string, description?: string) => {
      router.push({
        pathname: "/echo/[id]",
        params: {
          id: echoId,
          title,
          imageUrl: imageUrl ?? "",
          subtitle: description ?? "",
        },
      });
    },
    [router]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <LoadingSpinner message="Loading favorites..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {favoriteEchoes.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="No Favorites"
            subtitle="Tap the heart icon on any echo to add it to your favorites"
          />
        ) : (
          favoriteEchoes.map((echo, idx) => (
            <Fragment key={echo.id}>
              {idx > 0 && <View style={styles.separator} />}
              <LibraryItem
                title={echo.title}
                thumbnailUri={echo.imageUrl}
                progress={computeEchoProgressPercent(echo)}
                locked={echo.status === "locked"}
                completed={echo.status === "unlocked"}
                textColor={echo.status === "unlocked" ? "#EAEAEA" : undefined}
                onPress={() =>
                  handleEchoPress(echo.id, echo.title, echo.imageUrl, echo.description)
                }
                coverWidth={SEGMENT_WIDTH}
              />
            </Fragment>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: 2,
  },
});
