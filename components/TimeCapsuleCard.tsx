import { Ionicons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Image, ImageBackground, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS } from "react-native-reanimated";
import { GestureConfig } from "../config/ui";
import { colors, radii, sizes } from "../theme/theme";

type Props = {
  id: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  imageUrl?: string;
  onPress?: () => void;
  // New UI elements for progress + remaining time
  progress?: number; // 0..1 time elapsed
  remainingLabel?: string; // e.g., "12 days left"
  participants?: string[]; // list of avatar URIs for shared echoes; empty/undefined for private
};

function TimeCapsuleCardInner({ title, style, imageUrl, id, onPress, progress = 0, remainingLabel, participants }: Props) {
  const sharedTag = id ? `echo-image-${id}` : undefined;
  const tapGesture = useMemo(() => (
    Gesture.Tap()
      .enabled(!!onPress)
      .maxDeltaX(GestureConfig.tapMaxDeltaX)
      .maxDeltaY(GestureConfig.tapMaxDeltaY)
      .onEnd((_e, success) => {
        'worklet';
        if (success && onPress) {
          runOnJS(onPress)();
        }
      })
  ), [onPress]);
  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[styles.card, style as any]}
        collapsable={false}
        {...({
          sharedTransitionTag: sharedTag,
          sharedTransitionStyle: () => {
            "worklet";
            return { borderRadius: 0 };
          },
        } as any)}
      >
        <ImageBackground
        source={imageUrl ? { uri: imageUrl } : undefined}
        resizeMode="cover"
        style={styles.image}
      >
        <View style={{ flex: 1 }} />
        <View style={styles.blurContainer}>
          {/* Single masked blur with a small feather (no seams) */}
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <View style={StyleSheet.absoluteFill}>
                {/* Feather region: small ramp from transparent to opaque */}
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,1)"]}
                  locations={[0, 1]}
                  style={{ position: "absolute", left: 0, right: 0, top: 0, height: 22 }}
                />
                {/* Solid mask below: guarantees fully opaque blur to the bottom */}
                <View style={{ position: "absolute", left: 0, right: 0, top: 20, bottom: 0, backgroundColor: "black" }} />
              </View>
            }
          >
            <BlurView intensity={32} tint="default" style={StyleSheet.absoluteFill} />
          </MaskedView>
          {/* Pure blur only – no color overlays */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {/* Meta row: stacked avatars if shared; none if private. Progress adapts to fill when no avatars */}
            <View style={styles.metaRow}>
              {participants && participants.length > 1 ? (
                <View style={styles.avatarsStack}>
                  {participants.slice(0, 5).map((uri, idx, arr) => (
                    <Image
                      key={`${id}-p-${idx}`}
                      source={{ uri }}
                      style={[
                        styles.avatarStacked,
                        idx > 0 ? { marginLeft: -AVATAR_SIZE * 0.4 } : null,
                        { zIndex: arr.length - idx },
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.privateBadge}>
                  <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                  <View style={styles.privateBadgeOverlay} />
                  <View style={styles.privateBadgeContent}>
                    <Ionicons name="lock-closed" size={12} color={colors.white} style={styles.privateIcon} />
                    <Text style={styles.privateBadgeText}>Private</Text>
                  </View>
                </View>
              )}
              <View style={[styles.progressWrapper, !participants || participants.length <= 1 ? styles.progressWrapperPrivate : null]}>
                {remainingLabel ? (
                  <Text style={styles.remainingText} numberOfLines={1}>{remainingLabel}</Text>
                ) : null}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
                </View>
              </View>
            </View>
          </View>
        </View>
        </ImageBackground>
      </Animated.View>
    </GestureDetector>
  );
}

const TimeCapsuleCard = React.memo(TimeCapsuleCardInner);
export default TimeCapsuleCard;

const AVATAR_SIZE = 28; // increased to subsume prior border thickness
const TRACK_HEIGHT = 4;
const LABEL_GAP = 6;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  image: {
    width: "100%",
    flex: 1,
  },
  blurContainer: {
    height: sizes.list.cardBlurHeight,
    justifyContent: "flex-end",
  },
  textContainer: {
    padding: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarsStack: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    height: AVATAR_SIZE,
  },
  avatarStacked: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 0,
  },
  privateBadge: {
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  privateBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  privateIcon: {
    marginRight: 6,
    opacity: 0.9,
  },
  privateBadgeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.lightOverlay,
  },
  privateBadgeText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 10,
    opacity: 0.9,
  },
  progressWrapper: {
    flex: 1,
    height: AVATAR_SIZE,
    justifyContent: "center",
    alignItems: "stretch",
    position: "relative",
  },
  // Private echoes (no avatars): extend bar to align with title (full width of meta row)
  progressWrapperPrivate: {
    marginLeft: 0,
  },
  remainingText: {
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: "right",
    position: "absolute",
    right: 0,
    bottom: AVATAR_SIZE / 2 + TRACK_HEIGHT / 2 + LABEL_GAP,
    fontWeight: "600",
  },
  progressTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    top: AVATAR_SIZE / 2 - TRACK_HEIGHT / 2,
    height: TRACK_HEIGHT,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: TRACK_HEIGHT,
    backgroundColor: colors.white,
    borderRadius: 4,
  },
});


