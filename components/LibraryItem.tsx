import React from "react";
import { View, Text, StyleSheet, Image, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii } from "../theme/theme";

type Props = {
  title: string;
  thumbnailUri?: string;
  gradientColors?: [string, string];
  solidColor?: string;
  locked?: boolean;
  progress?: number; // 0..1
  textColor?: string;
  style?: StyleProp<ViewStyle>;
};

function LibraryItem({
  title,
  thumbnailUri,
  gradientColors,
  solidColor,
  locked,
  progress = 0,
  textColor,
  style,
}: Props) {
  const content = (
    <View style={styles.inner}>
      <View style={styles.leftCluster}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, { backgroundColor: "rgba(255,255,255,0.18)" }]} />
        )}
        {locked ? (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.white} />
          </View>
        ) : null}
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

  if (gradientColors) {
    return (
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.container, style]}>
        {content}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: solidColor ?? colors.surface }, style]}>
      {content}
    </View>
  );
}

export default React.memo(LibraryItem);

const ITEM_HEIGHT = 72;
const THUMBNAIL_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  leftCluster: {
    width: THUMBNAIL_SIZE + 12,
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 12,
    backgroundColor: "#222",
  },
  lockBadge: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "rgba(88, 101, 242, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerCluster: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
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


