import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Easing, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { indicatorPulse, indicatorSpring } from "../config/animation";
import { TAB_INDICATOR_WIDTH_RATIO } from "../constants/dimensions";

export type TabType = "allMedia" | "history";

export function useEchoTabs(defaultTab: TabType = "allMedia") {
  const [selectedTab, setSelectedTab] = useState<TabType>(defaultTab);
  const [barWidth, setBarWidth] = useState(0);
  const isTabTapping = useRef(false);

  const measuredWidth = Math.max(0, barWidth);
  const segmentWidth = measuredWidth > 0 ? measuredWidth / 2 : 0;

  const translateX = useSharedValue(0);
  const indicatorScaleX = useSharedValue(1);

  const indexFromTab = useCallback((tab: TabType): number => {
    return tab === "allMedia" ? 0 : 1;
  }, []);

  const propActiveIndex = useMemo(() => indexFromTab(selectedTab), [selectedTab, indexFromTab]);

  const animateToIndex = useCallback(
    (idx: number) => {
      const indicatorWidth = segmentWidth * TAB_INDICATOR_WIDTH_RATIO;
      const centerOffset = (segmentWidth - indicatorWidth) / 2;
      translateX.value = withSpring(idx * segmentWidth + centerOffset, indicatorSpring);
      indicatorScaleX.value = withSequence(
        withTiming(1.04, { duration: indicatorPulse.up.duration, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: indicatorPulse.down.duration, easing: Easing.out(Easing.quad) })
      );
    },
    [indicatorScaleX, segmentWidth, translateX]
  );

  const updateIndicatorPosition = useCallback(
    (scrollOffset: number, screenWidth: number) => {
      if (segmentWidth > 0) {
        const progress = scrollOffset / screenWidth;
        const indicatorWidth = segmentWidth * TAB_INDICATOR_WIDTH_RATIO;
        const centerOffset = (segmentWidth - indicatorWidth) / 2;
        translateX.value = progress * segmentWidth + centerOffset;
      }
    },
    [segmentWidth, translateX]
  );

  useEffect(() => {
    animateToIndex(propActiveIndex);
  }, [propActiveIndex, animateToIndex]);

  return {
    selectedTab,
    setSelectedTab,
    barWidth,
    setBarWidth,
    segmentWidth,
    translateX,
    indicatorScaleX,
    propActiveIndex,
    isTabTapping,
    animateToIndex,
    updateIndicatorPosition,
    indexFromTab,
  };
}


