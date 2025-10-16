import React, { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SCREEN_WIDTH } from "../../constants/dimensions";
import type { EchoActivity, EchoMedia } from "../../types/echo";
import HistoryList from "./HistoryList";
import LockedContent from "./LockedContent";
import MediaGrid from "./MediaGrid";

interface EchoContentTabsProps {
  isLocked: boolean;
  media?: EchoMedia[];
  activities?: EchoActivity[];
  scrollViewRef: React.RefObject<ScrollView | null>;
  currentPage: number;
  onPageChange: (page: number) => void;
  onScroll: (scrollOffset: number) => void;
  isTabTapping: React.MutableRefObject<boolean>;
  onMediaPress?: (item: EchoMedia) => void;
  scrollEnabled?: boolean;
}

export default function EchoContentTabs({
  isLocked,
  media,
  activities,
  scrollViewRef,
  currentPage,
  onPageChange,
  onScroll,
  isTabTapping,
  onMediaPress,
  scrollEnabled = true,
}: EchoContentTabsProps) {
  const handleMomentumScrollEnd = useCallback(
    (event: any) => {
      const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      onPageChange(page);
    },
    [onPageChange]
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      scrollEnabled={scrollEnabled}
      showsHorizontalScrollIndicator={false}
      directionalLockEnabled
      onScroll={(event) => {
        if (isTabTapping.current) return;
        const scrollOffset = event.nativeEvent.contentOffset.x;
        onScroll(scrollOffset);
      }}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      contentOffset={{ x: currentPage * SCREEN_WIDTH, y: 0 }}
      style={styles.container}
      scrollEventThrottle={16}
    >
      {/* All Media Page */}
      <View style={[styles.page, { width: SCREEN_WIDTH }]}>
        {isLocked ? <LockedContent /> : <MediaGrid media={media} onMediaPress={onMediaPress} />}
      </View>

      {/* History Page */}
      <View style={[styles.page, { width: SCREEN_WIDTH }]}>
        <HistoryList activities={activities} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});


