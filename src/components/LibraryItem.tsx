import { GestureConfig } from "@/config/ui";
import { HERO_HEIGHT } from "@/constants/dimensions";
import { colors, radii, spacing } from "@/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

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
  onMenuPress?: () => void;
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
  onMenuPress,
  coverWidth,
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
          { color: textColor ?? colors.white }
        ]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={{ width: 12 }} />
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <GestureDetector gesture={tapGesture}>
        <Pressable
          accessibilityRole={onPress ? "button" : undefined}
          android_ripple={onPress && Platform.OS === "android" ? { color: "rgba(255,255,255,0.12)" } : undefined}
          style={styles.innerContainer}
        >
          {/* No background behind content */}
          {content}
          {locked ? (
            <View style={styles.statusBadgeLeft}>
              <Ionicons name="lock-closed" size={16} color={colors.white} />
            </View>
          ) : null}
          {!locked && completed ? (
            <View style={styles.statusBadgeLeft}>
              <Ionicons name="checkmark-sharp" size={16} color={colors.white} />
            </View>
          ) : null}
        </Pressable>
      </GestureDetector>
      {onMenuPress ? (
        <Pressable
          onPress={onMenuPress}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.white} />
        </Pressable>
      ) : null}
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
const COVER_HEIGHT = 40; // shorter height for better visual consistency
const SCALE_FACTOR = COVER_HEIGHT / HOMESCREEN_CARD_HEIGHT;
const COVER_WIDTH = Math.round(HOMESCREEN_CARD_WIDTH * SCALE_FACTOR);
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
    paddingRight: 78, // reserve space for status icon + menu button
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
});


