import React, { useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import FloatingBottomBar from "../components/FloatingBottomBar";
import TimeCapsuleCard from "../components/TimeCapsuleCard";
import BottomGradient from "../components/BottomGradient";
import ListSeparator from "../components/ListSeparator";
import { dummyCapsules } from "../data/dummyCapsules";
import type { Capsule } from "../types/capsule";
import { colors, spacing, sizes } from "../theme/theme";
import { useRefresh } from "../hooks/useRefresh";
import { useRouter } from "expo-router";
import { Drawer } from "react-native-drawer-layout";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { GestureConfig } from "../config/ui";
import LeftDrawerContent from "../components/LeftDrawerContent";
import RightDrawerContent from "../components/RightDrawerContent";
import DrawerBlurOverlay from "../components/DrawerBlurOverlay";
import { RightDrawerProgressProvider } from "../components/RightDrawerProgress";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { refreshing, onRefresh } = useRefresh();
  const router = useRouter();
  const refreshExtraOffset = spacing.lg; // tweak this to move the refresh icon
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);
  // rely only on open state for press disabling
  // no extra overlay gesture; rely on Drawer gestures for stability
  const renderItem = useCallback(({ item }: { item: Capsule }) => (
    <TimeCapsuleCard
      id={item.id}
      title={item.title}
      subtitle={item.subtitle}
      imageUrl={item.imageUrl}
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
      overlayStyle={{ backgroundColor: "rgba(242,242,242,0.18)" }}
      swipeEdgeWidth={GestureConfig.swipeEdgeWidth}
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
        overlayStyle={{ backgroundColor: "rgba(242,242,242,0.18)" }}
        swipeEdgeWidth={GestureConfig.swipeEdgeWidth}
        swipeMinDistance={GestureConfig.swipeMinDistance}
        swipeMinVelocity={GestureConfig.swipeMinVelocity}
        swipeEnabled={!rightOpen}
      renderDrawerContent={() => (<LeftDrawerContent insetTop={insets.top} />)}
      >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <FlatList
          data={dummyCapsules}
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
        <DrawerBlurOverlay maxOpacity={1} blurIntensity={20} />
        <BottomGradient />
        <FloatingBottomBar
          onPressProfile={() => setLeftOpen(true)}
          onPressCreate={() => router.push("/create")}
          onPressMenu={() => setRightOpen(true)}
        />
      </SafeAreaView>
      </Drawer>
      <DrawerBlurOverlay maxOpacity={1} blurIntensity={20} />
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


