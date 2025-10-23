import StatusBadge from "@/components/ui/StatusBadge";
import { colors, radii, sizes } from "@/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { memo } from "react";
import { Image, ImageBackground, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

type Props = {
  id: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  imageUrl?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  progress?: number;
  remainingLabel?: string;
  participants?: string[];
  isPinned?: boolean;
  status?: "ongoing" | "locked" | "unlocked";
  isPrivate?: boolean;
  isFavorite?: boolean;
};

function TimeCapsuleCardInner({ title, style, imageUrl, id, onPress, onLongPress, progress = 0, remainingLabel, participants, isPinned = false, status = "ongoing", isPrivate = false, isFavorite = false }: Props) {
  const sharedTag = id ? `echo-image-${id}` : undefined;
  
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      disabled={!onPress && !onLongPress}
      style={[styles.card, style]}
    >
      <Animated.View
        style={styles.cardInner}
        collapsable={false}
        {...({
          sharedTransitionTag: sharedTag,
          sharedTransitionStyle: () => {
            "worklet";
            return { borderRadius: 0 };
          },
        } as Record<string, unknown>)}
      >
        {(isPinned || isFavorite) && (
          <View style={styles.badgeRow}>
            {isFavorite && (
              <View style={styles.favoriteBadge}>
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.favoriteBadgeOverlay} />
                <View style={styles.favoriteBadgeContent}>
                  <Ionicons name="heart" size={14} color={colors.white} style={styles.iconOpacity} />
                </View>
              </View>
            )}
            {isPinned && (
              <View style={[styles.pinBadge, isFavorite && styles.pinBadgeOffset]}>
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.pinBadgeOverlay} />
                <View style={styles.pinBadgeContent}>
                  {Platform.OS === "ios" ? (
                    <SymbolView
                      name="pin.fill"
                      size={14}
                      type="hierarchical"
                      tintColor={colors.white}
                      style={styles.pinRotated}
                    />
                  ) : (
                    <Ionicons name="pin" size={14} color={colors.white} style={styles.pinRotated} />
                  )}
                </View>
              </View>
            )}
          </View>
        )}
        <ImageBackground
        source={imageUrl ? { uri: imageUrl } : undefined}
        resizeMode="cover"
        style={styles.image}
      >
        <View style={styles.spacer} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.bottomGradient}
        />
        <View style={styles.blurContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.metaRow}>
              {!isPrivate && participants && participants.length > 0 ? (
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
              ) : isPrivate ? (
                <View style={styles.privateBadge}>
                  <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                  <View style={styles.privateBadgeOverlay} />
                  <View style={styles.privateBadgeContent}>
                    <Text style={styles.privateBadgeText}>Private</Text>
                  </View>
                </View>
              ) : null}
              <View style={[styles.progressWrapper, isPrivate || !participants || participants.length === 0 ? styles.progressWrapperPrivate : null]}>
                {remainingLabel ? (
                  <Text style={styles.remainingText} numberOfLines={1}>{remainingLabel}</Text>
                ) : null}
                <View style={styles.progressTrack}>
                  <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                  <View style={styles.progressTrackOverlay} />
                  <View style={[styles.progressBar, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
                </View>
              </View>
              <StatusBadge status={status} size={28} iconOnly={true} style={styles.statusCircle} />
            </View>
          </View>
        </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

export default memo(TimeCapsuleCardInner);

const AVATAR_SIZE = 28;
const TRACK_HEIGHT = 4;
const LABEL_GAP = 6;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    position: "relative",
  },
  cardInner: {
    flex: 1,
  },
  badgeRow: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  favoriteBadgeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.lightOverlay,
  },
  favoriteBadgeContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  pinBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pinBadgeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.lightOverlay,
  },
  pinBadgeContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    flex: 1,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
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
  privateBadgeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.lightOverlay,
  },
  privateBadgeText: {
    color: "rgb(213, 213, 213)",
    fontWeight: "600",
    fontSize: 10,
    opacity: 1,
  },
  progressWrapper: {
    flex: 1,
    height: AVATAR_SIZE,
    justifyContent: "center",
    alignItems: "stretch",
    position: "relative",
  },
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
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressTrackOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.lightOverlay,
  },
  progressBar: {
    height: TRACK_HEIGHT,
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  statusCircle: {
    marginLeft: 12,
  },
  spacer: {
    flex: 1,
  },
  iconOpacity: {
    opacity: 0.95,
  },
  pinBadgeOffset: {
    marginLeft: 8,
  },
  pinRotated: {
    opacity: 0.95,
    transform: [{ rotate: '45deg' }],
  },
});
