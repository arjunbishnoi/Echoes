import { getDrawerCoverSizing } from "@/components/drawer/coverSizing";
import { GestureConfig } from "@/config/ui";
import { HERO_HEIGHT } from "@/constants/dimensions";
import { colors, radii, spacing } from "@/theme/theme";
import { memo, useMemo } from "react";
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

type Props = {
  title: string;
  thumbnailUri?: string;
  locked?: boolean;
  completed?: boolean;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onMenuPress?: () => void;
};

function LibraryItem({
  title,
  thumbnailUri,
  locked,
  completed,
  textColor,
  style,
  onPress,
  onMenuPress,
}: Props) {
  const tapGesture = useMemo(() => {
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

  const longPressGesture = useMemo(() => {
    return Gesture.LongPress()
      .minDuration(350)
      .onEnd((_evt, success) => {
        'worklet';
        if (success && onMenuPress) {
          runOnJS(onMenuPress)();
        }
      });
  }, [onMenuPress]);

  const sizing = useMemo(() => getDrawerCoverSizing(COVER_HEIGHT), []);
  const cw = Math.max(40, Math.round(sizing.width));
  const content = (
    <View style={styles.inner}>
      <View style={[styles.leftCluster, { width: cw }]}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={[styles.thumbnail, { width: cw, borderRadius: sizing.radius }]} />
        ) : (
          <View style={[styles.thumbnail, { width: cw, borderRadius: sizing.radius, backgroundColor: "rgba(255,255,255,0.18)" }]} />
        )}
      </View>
      <View style={styles.centerCluster}>
        <Text style={[
          styles.title,
          { color: textColor ?? colors.white }
        ]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <GestureDetector gesture={Gesture.Race(tapGesture, longPressGesture)}>
        <Pressable
          accessibilityRole={onPress ? "button" : undefined}
          android_ripple={onPress && Platform.OS === "android" ? { color: "rgba(255,255,255,0.12)" } : undefined}
          style={styles.innerContainer}
        >
          {/* No background behind content */}
          {content}
        </Pressable>
      </GestureDetector>
    </View>
  );
}

export default memo(LibraryItem);

const ITEM_HEIGHT = 56; // keep row height
const CONTAINER_RADIUS = 20; // keep overall shape on right side

// Calculate exact homescreen card dimensions
const SCREEN_WIDTH = Dimensions.get("window").width;
const HOMESCREEN_CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2; // subtract horizontal padding
const HOMESCREEN_CARD_HEIGHT = HERO_HEIGHT; // SCREEN_WIDTH * 0.4
const HOMESCREEN_CARD_RADIUS = radii.card; // 30

// Scale down to fit drawer while maintaining exact aspect ratio
const COVER_HEIGHT = 48; // larger height for better visual presence
const SCALE_FACTOR = COVER_HEIGHT / HOMESCREEN_CARD_HEIGHT;
const COVER_WIDTH = Math.round(HOMESCREEN_CARD_WIDTH * SCALE_FACTOR);
// Corner radius scaled from homescreen card radius for consistency
const COVER_RADIUS = Math.round(HOMESCREEN_CARD_RADIUS * SCALE_FACTOR);

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
    position: "relative",
  },
  innerContainer: {
    flex: 1,
    height: ITEM_HEIGHT,
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
    borderRadius: COVER_RADIUS,
    backgroundColor: "#222",
  },
  statusBadgeLeft: {
    position: "absolute",
    top: STATUS_ICON_TOP,
    right: 46,
    width: STATUS_ICON_SIZE,
    height: STATUS_ICON_SIZE,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: {
    position: "absolute",
    top: (ITEM_HEIGHT - 28) / 2,
    right: 12,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  centerCluster: {
    flex: 1,
    justifyContent: "center", // vertically center title
    paddingRight: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
});


