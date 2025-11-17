import { getDrawerCoverSizing } from "@/components/drawer/coverSizing";
import { colors, spacing } from "@/theme/theme";
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
}: Props) {
  const shortTime = useMemo(() => formatShortTime(timestamp), [timestamp]);
  const coverSizing = useMemo(() => getDrawerCoverSizing(36), []);
  const avatarSize = coverSizing.height; // keep avatar height equal to cover height for consistency
  const formattedSubtitle = useMemo(() => {
    if (subtitleText == null) return null;
    const s = String(subtitleText).trim().toLowerCase();
    return /[.!?]$/.test(s) ? s : `${s}.`;
  }, [subtitleText]);
  return (
    <View style={styles.container}>
      {onPressAvatar ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onPressAvatar} style={styles.leftAvatarWrap}>
          {actorAvatarUri ? (
            <Image source={{ uri: actorAvatarUri }} style={[styles.leftAvatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]} />
          ) : (
            <View style={[styles.leftAvatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: "#222" }]} />
          )}
        </Pressable>
      ) : (
        <View style={styles.leftAvatarWrap}>
          {actorAvatarUri ? (
            <Image source={{ uri: actorAvatarUri }} style={[styles.leftAvatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]} />
          ) : (
            <View style={[styles.leftAvatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: "#222" }]} />
          )}
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
  leftAvatar: {
    width: LEFT_AVATAR_SIZE,
    height: LEFT_AVATAR_SIZE,
    borderRadius: LEFT_AVATAR_SIZE / 2,
  },
  messageArea: {
    flex: 1,
    marginRight: spacing.md,
    justifyContent: "center",
  },
  messageText: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 15,
    fontWeight: "400",
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "400",
  },
  messageSecondary: {
    color: colors.textSecondary,
  },
  messageBold: {
    color: colors.white,
    fontWeight: "600",
  },
  rightCoverWrap: {
    overflow: "hidden",
  },
});


