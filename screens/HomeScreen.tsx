import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, useWindowDimensions, View } from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import BottomGradient from "../components/BottomGradient";
import DrawerBlurOverlay from "../components/DrawerBlurOverlay";
import FloatingBottomBar from "../components/FloatingBottomBar";
import LeftDrawerContent from "../components/LeftDrawerContent";
import ListSeparator from "../components/ListSeparator";
import PlusToSideStrip from "../components/PlusToSideStrip";
import RightDrawerContent from "../components/RightDrawerContent";
import { RightDrawerProgressProvider } from "../components/RightDrawerProgress";
import SideStripCreateProxy from "../components/SideStripCreateProxy";
import TimeCapsuleCard from "../components/TimeCapsuleCard";
import { GestureConfig } from "../config/ui";
import { dummyCapsules } from "../data/dummyCapsules";
import { useRefresh } from "../hooks/useRefresh";
import { computeCapsuleProgressPercent } from "../lib/echoes";
import { colors, sizes, spacing } from "../theme/theme";
import type { Capsule } from "../types/capsule";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { refreshing, onRefresh } = useRefresh();
  const router = useRouter();
  const refreshExtraOffset = spacing.lg; // tweak this to move the refresh icon
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);
  const halfWidth = Math.floor(screenWidth / 2);
  const leftSwipeWidth = halfWidth; // left half
  const rightSwipeWidth = Math.max(0, halfWidth - 1); // right half minus 1px to avoid overlap
  // rely only on open state for press disabling
  // no extra overlay gesture; rely on Drawer gestures for stability
  const ongoingCapsules = useMemo(() => dummyCapsules.filter(c => c.status === "ongoing"), []);
  const renderItem = useCallback(({ item }: { item: Capsule }) => (
    <TimeCapsuleCard
      id={item.id}
      title={item.title}
      imageUrl={item.imageUrl}
      progress={computeCapsuleProgressPercent(item)}
      participants={item.participants}
      style={{ minHeight: sizes.list.cardMinHeight }}
      onPress={leftOpen || rightOpen ? undefined : () => router.push({ pathname: "/echo/[id]", params: { id: item.id } })}
    />
  ), [router, leftOpen, rightOpen]);
  const keyExtractor = useCallback((item: Capsule) => item.id, []);
  return (
    <Drawer
      open={rightOpen}
      onOpen={() => { setRightOpen(true); }}
      onClose={() => { setRightOpen(false); }}
      drawerPosition="right"
      drawerType="slide"
      drawerStyle={{ backgroundColor: "#000000" }}
      overlayStyle={{ backgroundColor: "transparent" }}
      swipeEdgeWidth={rightSwipeWidth}
      swipeMinDistance={GestureConfig.swipeMinDistance}
      swipeMinVelocity={GestureConfig.swipeMinVelocity}
      swipeEnabled={!leftOpen}
      renderDrawerContent={() => (<RightDrawerContent insetTop={insets.top} />)}
    >
    <RightDrawerProgressProvider>
    <View style={{ flex: 1 }}>
      <Drawer
        open={leftOpen}
        onOpen={() => { setLeftOpen(true); }}
        onClose={() => { setLeftOpen(false); }}
        drawerPosition="left"
        drawerType="slide"
        drawerStyle={{ backgroundColor: "#000000" }}
        overlayStyle={{ backgroundColor: "transparent" }}
        swipeEdgeWidth={leftSwipeWidth}
        swipeMinDistance={GestureConfig.swipeMinDistance}
        swipeMinVelocity={GestureConfig.swipeMinVelocity}
        swipeEnabled={!rightOpen}
      renderDrawerContent={() => (<LeftDrawerContent insetTop={insets.top} />)}
      >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <FlatList
          data={ongoingCapsules}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: spacing.lg },
          ]}
          contentInsetAdjustmentBehavior="never"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.textPrimary}
              titleColor={colors.textPrimary}
              progressBackgroundColor={colors.surface}
              colors={[colors.textPrimary]}
              progressViewOffset={refreshExtraOffset}
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
        <DrawerBlurOverlay side="right" maxOpacity={1} blurIntensity={66} />
        <DrawerBlurOverlay maxOpacity={1} blurIntensity={66} />
        <BottomGradient />
        {/* Animate plus to side strip with premium spring feel */}
        <PlusToSideStrip />
        <FloatingBottomBar
          onPressProfile={() => setLeftOpen(true)}
          onPressCreate={() => router.push("/create")}
          onPressMenu={() => setRightOpen(true)}
        />
        {/* Ensure tapping near the side strip still opens create while drawer is open */}
        {leftOpen ? <SideStripCreateProxy side="left" onPress={() => router.push("/create")} /> : null}
        {rightOpen ? <SideStripCreateProxy side="right" onPress={() => router.push("/create")} /> : null}
      </SafeAreaView>
      </Drawer>
    </View>
    </RightDrawerProgressProvider>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  drawer: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  drawerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 120,
  },
  refreshHeader: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
});


