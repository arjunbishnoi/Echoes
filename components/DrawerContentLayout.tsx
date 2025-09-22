import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { sizes } from "../theme/theme";

export function DrawerScroll({
  children,
  topPadding = 0,
  bottomPadding = sizes.list.bottomPadding,
  indicatorSide = "right",
  onScrollBeginDrag,
  onScrollEndDrag,
}: {
  children: React.ReactNode;
  topPadding?: number;
  bottomPadding?: number;
  indicatorSide?: "left" | "right";
  onScrollBeginDrag?: () => void;
  onScrollEndDrag?: () => void;
}) {
  const insets = indicatorSide === "right" ? { right: 0 } : { left: 0 };
  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: topPadding, paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator
      indicatorStyle="white"
      scrollIndicatorInsets={insets}
      keyboardShouldPersistTaps="handled"
      style={styles.scroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
    >
      {children}
    </ScrollView>
  );
}

export function ContentWidth({ children, horizontalMargin = 16 }: { children: React.ReactNode; horizontalMargin?: number }) {
  return <View style={[styles.contentWidth, { marginHorizontal: horizontalMargin }]}>{children}</View>;
}

const styles = StyleSheet.create({
  scroll: {
    alignSelf: "stretch",
  },
  contentWidth: {
    alignSelf: "stretch",
  },
});


