import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/theme";

type Props = (
  | {
      kind: "lock" | "unlock";
      title: string;
      coverUri: string;
      participants?: string[];
      userAvatarUri?: string;
    }
  | {
      kind: "friend_request" | "friend_accepted" | "friend_added_to_echo" | "friend_added_content";
      friendName: string;
      friendAvatarUri: string;
      friendId?: string;
      echoTitle?: string;
      coverUri?: string;
      photosCount?: number;
      onAcceptRequest?: () => void;
      onDeclineRequest?: () => void;
      onPress?: () => void;
    }
  | {
      avatarUri: string;
      name: string;
      text: string;
      rightThumbUri: string;
    }
);

function ProfileUpdateItem(props: Props) {
  if ("kind" in props) {
    if (props.kind === "lock" || props.kind === "unlock") {
      const isUnlock = props.kind === "unlock";
      const isShared = props.participants && props.participants.length > 0;
      return (
        <View style={styles.row}> 
          {isShared ? (
            <View style={styles.sharedIconWrap}>
              <Ionicons name="people" size={16} color={colors.white} />
            </View>
          ) : (
            <Image 
              source={{ uri: props.userAvatarUri || 'https://picsum.photos/seed/user/100/100' }} 
              style={styles.avatar} 
            />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.notifText} numberOfLines={3}>
              <Text style={styles.notifBold}>{props.title}</Text>
              <Text> will be {isUnlock ? "unlocked" : "locked"} in 1 day.</Text>
            </Text>
          </View>
          <View style={styles.coverContainer}>
            <Image source={{ uri: props.coverUri }} style={styles.largeThumb} />
            <View style={styles.coverIconOverlay}>
              <View style={styles.coverIconShadow}>
                <Ionicons name={isUnlock ? "checkmark" : "lock-closed"} size={20} color={colors.white} />
              </View>
            </View>
          </View>
        </View>
      );
    }
    if (props.kind === "friend_request") {
      return (
        <Pressable 
          style={styles.rowCentered}
          onPress={props.onPress}
          disabled={!props.onPress}
        > 
          <Image source={{ uri: props.friendAvatarUri }} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.notifText} numberOfLines={3}>
              <Text style={styles.notifBold}>{props.friendName}</Text>
              <Text> wants to be your friend.</Text>
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <Pressable 
              accessibilityRole="button" 
              hitSlop={12} 
              onPress={(e) => {
                e.stopPropagation();
                props.onAcceptRequest?.();
              }}
            >
              <Ionicons name="person-add" size={20} color={colors.white} />
            </Pressable>
          </View>
        </Pressable>
      );
    }
    if (props.kind === "friend_accepted") {
      return (
        <Pressable 
          style={styles.rowCentered}
          onPress={props.onPress}
          disabled={!props.onPress}
        > 
          <Image source={{ uri: props.friendAvatarUri }} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.notifText} numberOfLines={3}>
              <Text style={styles.notifBold}>{props.friendName}</Text>
              <Text> accepted your friend request.</Text>
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark" size={24} color={colors.white} />
          </View>
        </Pressable>
      );
    }
    if (props.kind === "friend_added_to_echo") {
      return (
        <View style={styles.rowCentered}> 
          <Image source={{ uri: props.friendAvatarUri }} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.notifText} numberOfLines={3}>
              <Text style={styles.notifBold}>{props.friendName}</Text>
              <Text> added you to {props.echoTitle ?? "an echo"}.</Text>
            </Text>
          </View>
          {props.coverUri && <Image source={{ uri: props.coverUri }} style={styles.largeThumb} />}
        </View>
      );
    }
    if (props.kind === "friend_added_content") {
      return (
        <View style={styles.rowCentered}> 
          <Image source={{ uri: props.friendAvatarUri }} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.notifText} numberOfLines={3}>
              <Text style={styles.notifBold}>{props.friendName}</Text>
              <Text> added {props.photosCount ?? 3} photos to {props.echoTitle ?? "an echo"}.</Text>
            </Text>
          </View>
          {props.coverUri && <Image source={{ uri: props.coverUri }} style={styles.largeThumb} />}
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
  sharedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#555",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  coverContainer: {
    position: "relative",
    width: 48,
    height: 48,
  },
  coverIconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  coverIconShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
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
  iconContainer: {
    width: 48,
    height: 48,
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
  textContainer: {
    flex: 1,
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  contentFlex: {
    flex: 1,
    justifyContent: "center",
  },
  rowCentered: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
});

export default memo(ProfileUpdateItem);