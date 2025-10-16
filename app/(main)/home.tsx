import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, useWindowDimensions, View } from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import BottomGradient from "../../components/BottomGradient";
import DrawerBlurOverlay from "../../components/DrawerBlurOverlay";
import FloatingBottomBar from "../../components/FloatingBottomBar";
import LeftDrawerContent from "../../components/LeftDrawerContent";
import ListSeparator from "../../components/ListSeparator";
import PlusToSideStrip from "../../components/PlusToSideStrip";
import RightDrawerContent from "../../components/RightDrawerContent";
import { RightDrawerProgressProvider } from "../../components/RightDrawerProgress";
import SideStripCreateProxy from "../../components/SideStripCreateProxy";
import TimeCapsuleCard from "../../components/TimeCapsuleCard";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { GestureConfig } from "../../config/ui";
import { HERO_HEIGHT } from "../../constants/dimensions";
import { dummyFriends } from "../../data/dummyFriends";
import { useEchoContextMenu } from "../../hooks/useEchoContextMenu";
import { useEchoStorage } from "../../hooks/useEchoStorage";
import { useFavoriteEchoes } from "../../hooks/useFavoriteEchoes";
import { usePinnedEchoes } from "../../hooks/usePinnedEchoes";
import { useRefresh } from "../../hooks/useRefresh";
import { computeEchoProgressPercent } from "../../lib/echoes";
import { sortEchoesForHome } from "../../lib/echoSorting";
import { useHomeEchoContext } from "../../lib/homeEchoContext";
import { colors, spacing } from "../../theme/theme";
import type { Echo } from "../../types/echo";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { refreshing, onRefresh } = useRefresh();
  const router = useRouter();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const halfWidth = useMemo(() => Math.floor(screenWidth / 2), [screenWidth]);
  const leftSwipeWidth = halfWidth;
  const rightSwipeWidth = Math.max(0, halfWidth - 1);

  const { echoes, isLoading } = useEchoStorage();
  const { isPinned, togglePin } = usePinnedEchoes();
  const { isFavorite } = useFavoriteEchoes();
  const { removeFromHome, filterVisibleEchoes } = useHomeEchoContext();
  const { showContextMenu } = useEchoContextMenu();

  const homeEchoes = useMemo(() => {
    const visibleOnHome = filterVisibleEchoes(echoes);
    return sortEchoesForHome(visibleOnHome, isPinned);
  }, [echoes, filterVisibleEchoes, isPinned]);

  const getAvatarUrls = useCallback((echo: Echo): string[] => {
    const avatars: string[] = [];
    
    if (echo.ownerPhotoURL) {
      avatars.push(echo.ownerPhotoURL);
    }
    
    if (echo.collaboratorIds && echo.collaboratorIds.length > 0) {
      echo.collaboratorIds.forEach((collaboratorId) => {
        const friend = dummyFriends.find((f) => f.id === collaboratorId);
        if (friend?.photoURL) {
          avatars.push(friend.photoURL);
        }
      });
    }
    
    return avatars;
  }, []);

  const handleLongPress = useCallback(
    (item: Echo) => {
      const pinned = isPinned(item.id);
      showContextMenu({
        isPinned: pinned,
        onPin: () => {
          const success = togglePin(item.id);
          if (!success) {
            Alert.alert(
              "Maximum Pins Reached",
              "You can only pin up to 2 echoes. Please unpin an echo first.",
              [{ text: "OK" }]
            );
          }
        },
        onRemove: () => {
          Alert.alert(
            "Remove from Home",
            `Remove "${item.title}" from home screen? You can still find it in your library.`,
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Remove", 
                style: "destructive", 
                onPress: () => removeFromHome(item.id)
              },
            ]
          );
        },
      });
    },
    [isPinned, togglePin, showContextMenu, removeFromHome]
  );

  const renderItem = useCallback(
    ({ item }: { item: Echo }) => (
      <TimeCapsuleCard
        id={item.id}
        title={item.title}
        imageUrl={item.imageUrl}
        progress={computeEchoProgressPercent(item)}
        participants={getAvatarUrls(item)}
        isPrivate={item.isPrivate}
        isPinned={isPinned(item.id)}
        isFavorite={isFavorite(item.id)}
        status={item.status === "unlocked" ? "unlocked" : item.status === "locked" ? "locked" : "ongoing"}
        style={styles.cardHeight}
        onPress={leftOpen || rightOpen ? undefined : () => router.push({ pathname: "/echo/[id]", params: { id: item.id } })}
        onLongPress={leftOpen || rightOpen ? undefined : () => handleLongPress(item)}
      />
    ),
    [router, leftOpen, rightOpen, isPinned, isFavorite, handleLongPress, getAvatarUrls]
  );

  const keyExtractor = useCallback((item: Echo) => item.id, []);

  const handleRightDrawerOpen = useCallback(() => setRightOpen(true), []);
  const handleRightDrawerClose = useCallback(() => setRightOpen(false), []);
  const handleLeftDrawerOpen = useCallback(() => setLeftOpen(true), []);
  const handleLeftDrawerClose = useCallback(() => setLeftOpen(false), []);

  return (
    <Drawer
      open={rightOpen}
      onOpen={handleRightDrawerOpen}
      onClose={handleRightDrawerClose}
      drawerPosition="right"
      drawerType="slide"
      drawerStyle={{ backgroundColor: "#000000" }}
      overlayStyle={{ backgroundColor: "transparent" }}
      swipeEdgeWidth={rightSwipeWidth}
      swipeMinDistance={GestureConfig.swipeMinDistance}
      swipeMinVelocity={GestureConfig.swipeMinVelocity}
      swipeEnabled={!leftOpen}
      renderDrawerContent={() => <RightDrawerContent insetTop={insets.top} />}
    >
      <RightDrawerProgressProvider>
        <View style={styles.flex}>
          <Drawer
            open={leftOpen}
            onOpen={handleLeftDrawerOpen}
            onClose={handleLeftDrawerClose}
            drawerPosition="left"
            drawerType="slide"
            drawerStyle={{ backgroundColor: "#000000" }}
            overlayStyle={{ backgroundColor: "transparent" }}
            swipeEdgeWidth={leftSwipeWidth}
            swipeMinDistance={GestureConfig.swipeMinDistance}
            swipeMinVelocity={GestureConfig.swipeMinVelocity}
            swipeEnabled={!rightOpen}
            renderDrawerContent={() => <LeftDrawerContent insetTop={insets.top} />}
          >
            <SafeAreaView style={styles.container} edges={["top"]}>
              {isLoading ? (
                <LoadingSpinner message="Loading echoes..." />
              ) : homeEchoes.length === 0 ? (
                <EmptyState
                  icon="calendar-outline"
                  title="No Echoes Yet"
                  subtitle="Tap the + button to create your first echo"
                />
              ) : (
      <FlatList
        data={homeEchoes}
                  keyExtractor={keyExtractor}
                  contentContainerStyle={[styles.listContent, { paddingTop: spacing.lg }]}
                  contentInsetAdjustmentBehavior="never"
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={colors.textPrimary}
                      titleColor={colors.textPrimary}
                      progressBackgroundColor={colors.surface}
                      colors={[colors.textPrimary]}
                    />
                  }
                  ItemSeparatorComponent={ListSeparator}
                  renderItem={renderItem}
                  removeClippedSubviews
                  initialNumToRender={6}
                  windowSize={11}
                  maxToRenderPerBatch={8}
                  updateCellsBatchingPeriod={16}
                />
              )}
              <DrawerBlurOverlay side="right" maxOpacity={1} blurIntensity={66} />
              <DrawerBlurOverlay maxOpacity={1} blurIntensity={66} />
              <BottomGradient />
              <PlusToSideStrip />
              <FloatingBottomBar
                onPressProfile={handleLeftDrawerOpen}
                onPressCreate={() => router.push("/create")}
                onPressMenu={handleRightDrawerOpen}
              />
              {leftOpen && <SideStripCreateProxy side="left" onPress={() => router.push("/create")} />}
              {rightOpen && <SideStripCreateProxy side="right" onPress={() => router.push("/create")} />}
            </SafeAreaView>
          </Drawer>
        </View>
      </RightDrawerProgressProvider>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 120,
  },
  cardHeight: {
    height: HERO_HEIGHT,
  },
});
