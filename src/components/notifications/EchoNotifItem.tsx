import { getDrawerCoverSizing } from "@/components/drawer/coverSizing";
import { colors, spacing } from "@/theme/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type MessagePart = { text: string; bold?: boolean };

type Props = {
  coverUri?: string;
  actorAvatarUri?: string;
  message?: MessagePart[];
  messageText?: string;
  displayName?: string;
  subtitleText?: string; // optional generic second line text
  count?: number;
  timestamp?: Date | string;
  onPressAvatar?: () => void;
  onPressContent?: () => void;
  hideCover?: boolean; // when true, omit right cover completely
  avatarSize?: number; // optional custom avatar size
  coverHeight?: number;
  activityType?:
    | "echo_created"
    | "friend_added"
    | "media_uploaded"
    | "echo_locked"
    | "echo_unlocked"
    | "collaborator_added"
    | "echo_locking_soon"
    | "echo_unlocking_soon";
  mediaType?: "photo" | "video" | "audio" | "document";
  fontSize?: number; // optional custom font size for notification text
  avatarGap?: number; // optional custom gap between avatar and text
  lineHeight?: number; // optional custom line height for notification text
  badgeVariant?: "count" | "new"; // "count" shows red badge with number, "new" shows green badge with icon
  showRightArrow?: boolean; // when true, show chevron on the right instead of a cover image
};

function formatShortTime(ts?: Date | string): string | null {
  if (!ts) return null;
  const date = typeof ts === "string" ? new Date(ts) : ts;
  const now = Date.now();
  const diffSec = Math.max(1, Math.floor((now - date.getTime()) / 1000));
  if (diffSec < 60) return "1m";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;
  return `${Math.floor(diffSec / 604800)}w`;
}

const LEFT_AVATAR_SIZE = 40;

function EchoNotifItem({
  coverUri,
  actorAvatarUri,
  message,
  messageText,
  displayName,
  subtitleText,
  count,
  timestamp,
  onPressAvatar,
  onPressContent,
  hideCover,
  avatarSize: customAvatarSize,
  coverHeight,
  activityType,
  mediaType,
  fontSize,
  avatarGap,
  lineHeight,
  badgeVariant = "count",
  showRightArrow,
}: Props) {
  const shortTime = useMemo(() => formatShortTime(timestamp), [timestamp]);
  const coverSizing = useMemo(() => getDrawerCoverSizing(coverHeight ?? 30), [coverHeight]);
  const avatarSize = customAvatarSize ?? (coverHeight ?? 46);
  const formattedSubtitle = useMemo(() => {
    if (subtitleText == null) return null;
    const s = String(subtitleText).trim().toLowerCase();
    return /[.!?]$/.test(s) ? s : `${s}.`;
  }, [subtitleText]);
  
  const badgeSize = avatarSize * 0.42; // Badge is 42% of avatar size (increased)
  const textSize = fontSize ?? 13; // Default font size is 13
  const gapSize = avatarGap ?? spacing.sm; // Default gap is spacing.sm
  const textLineHeight = lineHeight ?? textSize; // Default line height equals font size
  const hasCover = !hideCover && (coverHeight != null || showRightArrow); // Treat right arrow as a "cover" for sizing
  const messageAreaHeight = hasCover ? coverSizing.height : undefined; // Match cover height when present

  const AvatarWithBadge = ({ uri, size, count }: { uri?: string; size: number; count?: number }) => {
    const isLockSoon = activityType === "echo_locking_soon";
    const isUnlockSoon = activityType === "echo_unlocking_soon";
    const badgeColor = badgeVariant === "new" ? "#34C759" : "#DC143C"; // Green for "new", red for "count"
    
    return (
      <View style={[styles.avatarContainer, { width: size, height: size }]}>
        {isLockSoon || isUnlockSoon ? (
          <View
            style={[
              styles.leftAvatar,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: colors.surfaceBorder,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Ionicons
              name={isLockSoon ? "lock-closed" : "checkmark"}
              size={size * 0.52}
              color={colors.white}
            />
          </View>
        ) : uri ? (
          <Image
            source={{ uri }}
            style={[styles.leftAvatar, { width: size, height: size, borderRadius: size / 2 }]}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={120}
          />
        ) : (
          <View style={[styles.leftAvatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: "#222" }]} />
        )}
        {activityType && !isLockSoon && !isUnlockSoon && (
          <View style={[styles.badge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, backgroundColor: badgeColor }]}>
            {badgeVariant === "new" ? (
              <Ionicons name="sparkles" size={badgeSize * 0.55} color={colors.white} />
            ) : count ? (
              <Text style={[styles.badgeText, { fontSize: badgeSize * 0.48, lineHeight: badgeSize * 0.6 }]}>
                {count}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {onPressAvatar ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onPressAvatar} style={[styles.leftAvatarWrap, { marginRight: gapSize }]}>
          <AvatarWithBadge uri={actorAvatarUri} size={avatarSize} count={count} />
        </Pressable>
      ) : (
        <View style={[styles.leftAvatarWrap, { marginRight: gapSize }]}>
          <AvatarWithBadge uri={actorAvatarUri} size={avatarSize} count={count} />
        </View>
      )}
      {onPressContent ? (
        <Pressable 
          accessibilityRole="button" 
          hitSlop={8} 
          onPress={onPressContent} 
          style={[
            styles.messageArea,
            showRightArrow && { marginRight: spacing.xs },
            hasCover && {
              height: messageAreaHeight,
              justifyContent: "flex-start",
              gap: 4,
              paddingTop: 3,
            },
          ]}
        >
          {displayName != null && (formattedSubtitle != null || count != null) ? (
            <>
              <Text style={[styles.messageText, { fontSize: textSize, lineHeight: textLineHeight, fontWeight: "600" }]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.messageSecondary, { fontSize: textSize, lineHeight: textLineHeight }]} numberOfLines={1}>
                {formattedSubtitle != null ? formattedSubtitle : (count === 1 ? "added a memory." : `added ${String(count)} memories.`)}
                {shortTime ? <Text style={[styles.messageSecondary, { fontSize: textSize, lineHeight: textLineHeight }]}> {shortTime}</Text> : null}
              </Text>
            </>
          ) : (
            <Text style={[styles.messageText, { fontSize: textSize, lineHeight: textLineHeight }]} numberOfLines={2}>
              {messageText
                ? messageText
                : message?.map((part, idx) => (
                    <Text key={idx}>{part.text}</Text>
                  ))}
            {shortTime ? <Text style={[styles.messageSecondary, { fontSize: textSize, lineHeight: textLineHeight }]}> {shortTime}</Text> : null}
            </Text>
          )}
        </Pressable>
      ) : (
        <View 
          style={[
            styles.messageArea,
            showRightArrow && { marginRight: spacing.xs },
            hasCover && {
              height: messageAreaHeight,
              justifyContent: "flex-start",
              gap: 4,
              paddingTop: 3,
            },
          ]}
        >
          {displayName != null && (formattedSubtitle != null || count != null) ? (
            <>
              <Text style={[styles.messageText, styles.messageBold, { fontSize: textSize, lineHeight: textLineHeight, fontWeight: "600" }]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.messageText, styles.messageSecondary, { fontSize: textSize, lineHeight: textLineHeight }]} numberOfLines={1}>
                {formattedSubtitle != null ? formattedSubtitle : (count === 1 ? "added a memory." : `added ${String(count)} memories.`)}
                {shortTime ? <Text style={[styles.timeText, { fontSize: textSize, lineHeight: textLineHeight }]}> {shortTime}</Text> : null}
              </Text>
            </>
          ) : (
            <Text style={[styles.messageText, { fontSize: textSize, lineHeight: textLineHeight }]} numberOfLines={2}>
              {messageText
                ? messageText
                : message?.map((part, idx) => (
                    <Text key={idx}>{part.text}</Text>
                  ))}
              {shortTime ? <Text style={[styles.timeText, { fontSize: textSize, lineHeight: textLineHeight }]}> {shortTime}</Text> : null}
            </Text>
          )}
        </View>
      )}
      {!hideCover && onPressContent ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onPressContent}
          style={[
            styles.rightCoverWrap,
            {
              width: showRightArrow ? 26 : coverSizing.width,
              height: coverSizing.height,
              borderRadius: coverSizing.radius,
              borderTopLeftRadius: coverSizing.radius,
              borderTopRightRadius: coverSizing.radius,
              borderBottomLeftRadius: coverSizing.radius,
              borderBottomRightRadius: coverSizing.radius,
            },
          ]}
        >
          {showRightArrow ? (
            <View
              style={{
                width: 26,
                height: coverSizing.height,
                borderRadius: coverSizing.radius,
                alignItems: "flex-end",
                justifyContent: "center",
                paddingRight: 6,
              }}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
          ) : coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={{
                width: coverSizing.width,
                height: coverSizing.height,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <View
              style={{
                width: coverSizing.width,
                height: coverSizing.height,
                borderRadius: coverSizing.radius,
                borderTopLeftRadius: coverSizing.radius,
                borderTopRightRadius: coverSizing.radius,
                borderBottomLeftRadius: coverSizing.radius,
                borderBottomRightRadius: coverSizing.radius,
                backgroundColor: "rgba(255,255,255,0.18)",
              }}
            />
          )}
        </Pressable>
      ) : null}
      {!hideCover && !onPressContent ? (
      <View
        style={[
          styles.rightCoverWrap,
          {
            width: showRightArrow ? 26 : coverSizing.width,
            height: coverSizing.height,
            borderRadius: coverSizing.radius,
            borderTopLeftRadius: coverSizing.radius,
            borderTopRightRadius: coverSizing.radius,
            borderBottomLeftRadius: coverSizing.radius,
            borderBottomRightRadius: coverSizing.radius,
          },
        ]}
      >
        {showRightArrow ? (
          <View
            style={{
              width: 26,
              height: coverSizing.height,
              borderRadius: coverSizing.radius,
              alignItems: "flex-end",
              justifyContent: "center",
              paddingRight: 6,
            }}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </View>
        ) : coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={{
              width: coverSizing.width,
              height: coverSizing.height,
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
          ) : (
          <View
            style={{
              width: coverSizing.width,
              height: coverSizing.height,
              borderRadius: coverSizing.radius,
              borderTopLeftRadius: coverSizing.radius,
              borderTopRightRadius: coverSizing.radius,
              borderBottomLeftRadius: coverSizing.radius,
              borderBottomRightRadius: coverSizing.radius,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          />
          )}
        </View>
      ) : null}
    </View>
  );
}

export default memo(EchoNotifItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 0,
    marginBottom: 6,
    borderRadius: 12,
    paddingRight: 0,
    backgroundColor: "transparent",
  },
  leftAvatarWrap: {
    position: "relative",
    marginRight: spacing.sm,
  },
  avatarContainer: {
    position: "relative",
  },
  leftAvatar: {
    width: LEFT_AVATAR_SIZE,
    height: LEFT_AVATAR_SIZE,
    borderRadius: LEFT_AVATAR_SIZE / 2,
  },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#DC143C",
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.white,
    fontWeight: "bold",
    textAlign: "center",
    includeFontPadding: false,
  },
  messageArea: {
    flex: 1,
    marginRight: spacing.md,
    justifyContent: "center",
    gap: 2,
  },
  messageText: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 13,
    fontWeight: "500",
  },
  messageSecondary: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 13,
    fontWeight: "400",
  },
  messageBold: {
    fontWeight: "500",
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 13,
  },
  rightCoverWrap: {
    overflow: "hidden",
  },
});


