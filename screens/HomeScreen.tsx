import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FloatingBottomBar from "../components/FloatingBottomBar";
import TimeCapsuleCard from "../components/TimeCapsuleCard";
import BottomGradient from "../components/BottomGradient";
import ListSeparator from "../components/ListSeparator";
import { dummyCapsules } from "../data/dummyCapsules";
import { colors, spacing, sizes } from "../theme/theme";
import { useRefresh } from "../hooks/useRefresh";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { refreshing, onRefresh } = useRefresh();
  const renderItem = useCallback(({ item }: { item: { id: string; title: string; subtitle: string } }) => (
    <TimeCapsuleCard title={item.title} subtitle={item.subtitle} style={{ minHeight: sizes.list.cardMinHeight }} />
  ), []);
  const keyExtractor = useCallback((item: { id: string }) => item.id, []);
  return (
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
        onPressProfile={() => {}}
        onPressCreate={() => {}}
        onPressMenu={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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


