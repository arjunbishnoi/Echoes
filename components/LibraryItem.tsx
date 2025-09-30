import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { GestureConfig } from "../config/ui";
import { colors, radii } from "../theme/theme";

type Props = {
  title: string;
  thumbnailUri?: string;
  gradientColors?: [string, string];
  solidColor?: string;
  locked?: boolean;
  completed?: boolean;
  progress?: number; // 0..1
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  coverWidth?: number;
};

function LibraryItem({
  title,
  thumbnailUri,
  gradientColors,
  solidColor,
  locked,
  completed,
  progress = 0,
  textColor,
  style,
  onPress,
  coverWidth,
}: Props) {
  const tapGesture = React.useMemo(() => {
    return Gesture.Tap()
      .maxDeltaX(GestureConfig.tapMaxDeltaX)
      .maxDeltaY(GestureConfig.tapMaxDeltaY)
      .onEnd((_evt, success) => {
        'worklet';
        if (success && onPress) {
          runOnJS(onPress)();
        }
      });
  }, [onPress]);

  const cw = Math.max(40, Math.round(coverWidth ?? COVER_WIDTH));
  const content = (
    <View style={styles.inner}>
      <View style={[styles.leftCluster, { width: cw }]}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={[styles.thumbnail, { width: cw }]} />
        ) : (
          <View style={[styles.thumbnail, { width: cw, backgroundColor: "rgba(255,255,255,0.18)" }]} />
        )}
      </View>
      <View style={styles.centerCluster}>
        <Text style={[
          styles.title,
          { color: textColor ?? colors.white, marginBottom: completed ? 0 : 6 }
        ]} numberOfLines={1}>
          {title}
        </Text>
        {!completed ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
          </View>
        ) : null}
      </View>
      <View style={{ width: 12 }} />
    </View>
  );

  return (
    <GestureDetector gesture={tapGesture}>
      <Pressable
        accessibilityRole={onPress ? "button" : undefined}
        android_ripple={onPress && Platform.OS === "android" ? { color: "rgba(255,255,255,0.12)" } : undefined}
        style={[styles.container, style]}
      >
        {/* No background behind content */}
        {content}
        {locked ? (
          <View style={styles.statusBadgeRight}>
            <Ionicons name="lock-closed" size={16} color={colors.white} />
          </View>
        ) : null}
        {!locked && completed ? (
          <View style={styles.statusBadgeRight}>
            <Ionicons name="checkmark-sharp" size={16} color={colors.white} />
          </View>
        ) : null}
      </Pressable>
    </GestureDetector>
  );
}

export default React.memo(LibraryItem);

const ITEM_HEIGHT = 56; // keep row height
const CONTAINER_RADIUS = 20; // keep overall shape on right side
const COVER_WIDTH = 64; // shorter width
const COVER_HEIGHT = 48; // taller height
const STATUS_ICON_SIZE = 24;
const STATUS_ICON_TOP = (ITEM_HEIGHT - STATUS_ICON_SIZE) / 2; // center vertically

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: CONTAINER_RADIUS,
    borderBottomRightRadius: CONTAINER_RADIUS,
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 0,
  },
  leftCluster: {
    width: COVER_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  thumbnail: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: 8,
    backgroundColor: "#222",
  },
  statusBadgeRight: {
    position: "absolute",
    top: STATUS_ICON_TOP,
    right: 10,
    width: STATUS_ICON_SIZE,
    height: STATUS_ICON_SIZE,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerCluster: {
    flex: 1,
    justifyContent: "center", // vertically center title + progress bar
    paddingRight: STATUS_ICON_SIZE + 12, // reserve space for the centered status icon
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6, // consistent gap between title and progress bar
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 0,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.white,
  },
});


