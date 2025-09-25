import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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

  const content = (
    <View style={styles.inner}>
      <View style={styles.leftCluster}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, { backgroundColor: "rgba(255,255,255,0.18)" }]} />
        )}
      </View>
      <View style={styles.centerCluster}>
        <Text style={[styles.title, { color: textColor ?? colors.white }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
        </View>
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
        {/* Accentified background: blurred cover image or solid fallback */}
        {thumbnailUri ? (
          <>
            <Image source={{ uri: thumbnailUri }} style={[StyleSheet.absoluteFill, { opacity: 1 }]} resizeMode="cover" />
            <BlurView intensity={90} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { }]} />
          </>
        ) : gradientColors ? (
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: solidColor ?? colors.surface }]} />
        )}
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

const ITEM_HEIGHT = 64; // slightly reduced height
const CONTAINER_RADIUS = 20;
const COVER_WIDTH = 72; // keep previous cover length so it is no longer square

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    borderRadius: CONTAINER_RADIUS,
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16, // no left padding so cover aligns flush left
  },
  leftCluster: {
    width: COVER_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  thumbnail: {
    width: COVER_WIDTH,
    height: ITEM_HEIGHT,
    borderTopRightRadius: CONTAINER_RADIUS,
    borderBottomRightRadius: CONTAINER_RADIUS,
    backgroundColor: "#222",
  },
  statusBadgeRight: {
    position: "absolute",
    top: 8,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerCluster: {
    flex: 1,
    justifyContent: "center", // vertically center title + progress bar
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
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.white,
  },
});


