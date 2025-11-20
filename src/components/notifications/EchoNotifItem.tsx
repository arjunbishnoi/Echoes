import { getDrawerCoverSizing } from "@/components/drawer/coverSizing";
import { colors, spacing } from "@/theme/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo, useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
  activityType?: "echo_created" | "friend_added" | "media_uploaded" | "echo_locked" | "echo_unlocked" | "collaborator_added";
  mediaType?: "photo" | "video" | "audio" | "document";
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

// Get icon for activity type
function getActivityIcon(
  activityType?: "echo_created" | "friend_added" | "media_uploaded" | "echo_locked" | "echo_unlocked" | "collaborator_added",
  mediaType?: "photo" | "video" | "audio" | "document"
): string {
  if (activityType === "media_uploaded") {
    switch (mediaType) {
      case "photo":
        return "images";
      case "video":
        return "videocam";
      case "audio":
        return "mic";
      case "document":
        return "document";
      default:
        return "images";
    }
  }
  
  switch (activityType) {
    case "echo_created":
      return "add-circle";
    case "friend_added":
      return "person-add";
    case "echo_locked":
      return "lock-closed";
    case "echo_unlocked":
      return "lock-open";
    case "collaborator_added":
      return "people";
    default:
      return "ellipse";
  }
}

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
  activityType,
  mediaType,
}: Props) {
  const shortTime = useMemo(() => formatShortTime(timestamp), [timestamp]);
  const coverSizing = useMemo(() => getDrawerCoverSizing(36), []);
  const avatarSize = customAvatarSize ?? coverSizing.height; // use custom size if provided, otherwise keep avatar height equal to cover height for consistency
  const formattedSubtitle = useMemo(() => {
    if (subtitleText == null) return null;
    const s = String(subtitleText).trim().toLowerCase();
    return /[.!?]$/.test(s) ? s : `${s}.`;
  }, [subtitleText]);
  
  const activityIcon = useMemo(() => getActivityIcon(activityType, mediaType), [activityType, mediaType]);
  const badgeSize = avatarSize * 0.35; // Badge is 35% of avatar size
  const badgeIconSize = badgeSize * 0.5; // Icon is 50% of badge size

  const AvatarWithBadge = ({ uri, size }: { uri?: string; size: number }) => (
    <View style={[styles.avatarContainer, { width: size, height: size }]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.leftAvatar, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.leftAvatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: "#222" }]} />
      )}
      {activityType && (
        <View style={[styles.badge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}>
          <Ionicons name={activityIcon as any} size={badgeIconSize} color={colors.white} />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {onPressAvatar ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onPressAvatar} style={styles.leftAvatarWrap}>
          <AvatarWithBadge uri={actorAvatarUri} size={avatarSize} />
        </Pressable>
      ) : (
        <View style={styles.leftAvatarWrap}>
          <AvatarWithBadge uri={actorAvatarUri} size={avatarSize} />
        </View>
      )}
      {onPressContent ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onPressContent} style={styles.messageArea}>
          {displayName != null && (formattedSubtitle != null || count != null) ? (
            <>
              <Text style={[styles.messageText, styles.messageBold]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.messageText, styles.messageSecondary]} numberOfLines={1}>
                {formattedSubtitle != null ? formattedSubtitle : (count === 1 ? "added a memory." : `added ${String(count)} memories.`)}
                {shortTime ? <Text style={styles.timeText}> {shortTime}</Text> : null}
              </Text>
            </>
          ) : (
            <Text style={styles.messageText} numberOfLines={2}>
              {messageText
                ? messageText
                : message?.map((part, idx) => (
                    <Text key={idx}>{part.text}</Text>
                  ))}
              {shortTime ? <Text style={styles.timeText}> {shortTime}</Text> : null}
            </Text>
          )}
        </Pressable>
      ) : (
        <View style={styles.messageArea}>
          {displayName != null && (formattedSubtitle != null || count != null) ? (
            <>
              <Text style={[styles.messageText, styles.messageBold]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.messageText, styles.messageSecondary]} numberOfLines={1}>
                {formattedSubtitle != null ? formattedSubtitle : (count === 1 ? "added a memory." : `added ${String(count)} memories.`)}
                {shortTime ? <Text style={styles.timeText}> {shortTime}</Text> : null}
              </Text>
            </>
          ) : (
            <Text style={styles.messageText} numberOfLines={2}>
              {messageText
                ? messageText
                : message?.map((part, idx) => (
                    <Text key={idx}>{part.text}</Text>
                  ))}
              {shortTime ? <Text style={styles.timeText}> {shortTime}</Text> : null}
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
              width: coverSizing.width,
              height: coverSizing.height,
              borderRadius: coverSizing.radius,
              borderTopLeftRadius: coverSizing.radius,
              borderTopRightRadius: coverSizing.radius,
              borderBottomLeftRadius: coverSizing.radius,
              borderBottomRightRadius: coverSizing.radius,
            },
          ]}
        >
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={{
                width: coverSizing.width,
                height: coverSizing.height,
              }}
              resizeMode="cover"
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
            width: coverSizing.width,
            height: coverSizing.height,
            borderRadius: coverSizing.radius,
            borderTopLeftRadius: coverSizing.radius,
            borderTopRightRadius: coverSizing.radius,
            borderBottomLeftRadius: coverSizing.radius,
            borderBottomRightRadius: coverSizing.radius,
          },
        ]}
      >
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={{
              width: coverSizing.width,
              height: coverSizing.height,
            }}
            resizeMode="cover"
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
    borderRadius: 12,
    paddingRight: 0,
    backgroundColor: "transparent",
  },
  leftAvatarWrap: {
    position: "relative",
    marginRight: spacing.md,
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
    bottom: 0,
    right: 0,
    backgroundColor: colors.black,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  messageArea: {
    flex: 1,
    marginRight: spacing.md,
    justifyContent: "center",
  },
  messageText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "400",
  },
  messagePrimary: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  messageSecondary: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  messageBold: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  rightCoverWrap: {
    overflow: "hidden",
  },
});


