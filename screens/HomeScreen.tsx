import React, { useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import Animated from "react-native-reanimated";
import { GestureConfig } from "../config/ui";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { refreshing, onRefresh } = useRefresh();
  const router = useRouter();
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
      onOpen={() => setRightOpen(true)}
      onClose={() => setRightOpen(false)}
      drawerPosition="right"
      drawerType="slide"
      drawerStyle={{ backgroundColor: colors.surface }}
      swipeEdgeWidth={GestureConfig.swipeEdgeWidth}
      swipeMinDistance={GestureConfig.swipeMinDistance}
      swipeMinVelocity={GestureConfig.swipeMinVelocity}
      swipeEnabled={!leftOpen}
      renderDrawerContent={() => (
        <View style={[styles.drawer, { paddingTop: insets.top, alignItems: "flex-end" }]}> 
          <Text style={styles.drawerTitle}>Menu</Text>
        </View>
      )}
    >
    <Drawer
      open={leftOpen}
      onOpen={() => setLeftOpen(true)}
      onClose={() => setLeftOpen(false)}
      drawerPosition="left"
      drawerType="slide"
      drawerStyle={{ backgroundColor: colors.surface }}
      swipeEdgeWidth={GestureConfig.swipeEdgeWidth}
      swipeMinDistance={GestureConfig.swipeMinDistance}
      swipeMinVelocity={GestureConfig.swipeMinVelocity}
      swipeEnabled={!rightOpen}
      renderDrawerContent={() => (
        <View style={[styles.drawer, { paddingTop: insets.top }]}> 
          <Text style={styles.drawerTitle}>Profile</Text>
        </View>
      )}
    >
    <View style={[styles.container, { paddingTop: insets.top }] }>
      <FlatList
        data={dummyCapsules}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textPrimary}
            titleColor={colors.textPrimary}
            progressBackgroundColor={colors.surface}
            colors={[colors.textPrimary]}
            progressViewOffset={Platform.OS === "android" ? insets.top + 16 : 0}
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
      <BottomGradient />
      <FloatingBottomBar
        onPressProfile={() => setLeftOpen(true)}
        onPressCreate={() => router.push("/create")}
        onPressMenu={() => setRightOpen(true)}
      />
    </View>
    </Drawer>
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


