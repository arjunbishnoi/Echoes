import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/theme";

type Props = (
  | {
      kind: "lock" | "unlock";
      title: string;
      coverUri: string;
    }
  | {
      kind: "friend_request" | "friend_accepted" | "friend_added_to_echo" | "friend_added_content";
      friendName: string;
      friendAvatarUri: string;
      echoTitle?: string;
      coverUri?: string;
      photosCount?: number;
      onAcceptRequest?: () => void;
      onDeclineRequest?: () => void;
    }
  | {
      avatarUri: string;
      name: string;
      text: string;
      rightThumbUri: string;
    }
);

export default function ProfileUpdateItem(props: Props) {
  if ("kind" in props) {
    if (props.kind === "lock" || props.kind === "unlock") {
      const isUnlock = props.kind === "unlock";
      return (
        <View style={styles.row}> 
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <Ionicons name={isUnlock ? "checkmark" : "lock-closed"} size={18} color={colors.white} />
            </View>
          </View>
          <View style={{ flex: 1, justifyContent: "center", marginRight: spacing.lg }}>
            <Text style={styles.notifText} numberOfLines={3}>
              <Text style={styles.notifBold}>{props.title}</Text>
              <Text> will be {isUnlock ? "unlocked" : "locked"} in 1 day.</Text>
            </Text>
          </View>
          <Image source={{ uri: props.coverUri }} style={styles.largeThumb} />
        </View>
      );
    }
    if (props.kind === "friend_request") {
      return (
        <View style={[styles.row, { alignItems: "center" }]}> 
          <Image source={{ uri: props.friendAvatarUri }} style={styles.avatar} />
          <View style={{ flex: 1, justifyContent: "center", marginRight: spacing.lg }}>
            <Text style={styles.notifText} numberOfLines={3}>
              <Text style={styles.notifBold}>{props.friendName}</Text>
              <Text> wants to be your friend.</Text>
            </Text>
          </View>
          <View style={styles.actionsRow}>
            <Pressable accessibilityRole="button" hitSlop={8} style={[styles.actionBtn, { backgroundColor: "#2A6E3A" }]} onPress={props.onAcceptRequest}>
              <Ionicons name="checkmark" size={16} color={colors.white} />
            </Pressable>
            <Pressable accessibilityRole="button" hitSlop={8} style={[styles.actionBtn, { backgroundColor: "#6E2A2A", marginLeft: 8 }]} onPress={props.onDeclineRequest}>
              <Ionicons name="close" size={16} color={colors.white} />
            </Pressable>
          </View>
        </View>
      );
    }
    if (props.kind === "friend_accepted") {
      return (
        <View style={[styles.row, { alignItems: "center" }]}> 
          <Image source={{ uri: props.friendAvatarUri }} style={styles.avatar} />
          <View style={{ flex: 1, justifyContent: "center", marginRight: spacing.lg }}>
            <Text style={styles.notifText} numberOfLines={3}>
              <Text style={styles.notifBold}>{props.friendName}</Text>
              <Text> accepted your friend request.</Text>
            </Text>
          </View>
        </View>
      );
    }
    if (props.kind === "friend_added_to_echo") {
      return (
        <View style={[styles.row, { alignItems: "center" }]}> 
          <Image source={{ uri: props.friendAvatarUri }} style={styles.avatar} />
          <View style={{ flex: 1, justifyContent: "center", marginRight: spacing.lg }}>
            <Text style={styles.notifText} numberOfLines={3}>
              <Text style={styles.notifBold}>{props.friendName}</Text>
              <Text> added you to {props.echoTitle ?? "an echo"}.</Text>
            </Text>
          </View>
          {props.coverUri ? <Image source={{ uri: props.coverUri }} style={styles.largeThumb} /> : null}
        </View>
      );
    }
    if (props.kind === "friend_added_content") {
      return (
        <View style={[styles.row, { alignItems: "center" }]}> 
          <Image source={{ uri: props.friendAvatarUri }} style={styles.avatar} />
          <View style={{ flex: 1, justifyContent: "center", marginRight: spacing.lg }}>
            <Text style={styles.notifText} numberOfLines={3}>
              <Text style={styles.notifBold}>{props.friendName}</Text>
              <Text> added {props.photosCount ?? 3} photos to {props.echoTitle ?? "an echo"}.</Text>
            </Text>
          </View>
          {props.coverUri ? <Image source={{ uri: props.coverUri }} style={styles.largeThumb} /> : null}
        </View>
      );
    }
    return null;
  }
  const { avatarUri, name, text, rightThumbUri } = props;
  return (
    <View style={styles.row}>
      <Image source={{ uri: avatarUri }} style={styles.avatar} />
      <View style={{ flex: 1, marginRight: spacing.lg }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      <Image source={{ uri: rightThumbUri }} style={styles.thumb} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
  },
  iconWrap: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.md,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  text: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  notifText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
  },
  notifBold: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  largeThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
});







