import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dummyCapsules } from "../../data/dummyCapsules";
import { computeCapsuleProgressPercent } from "../../lib/echoes";
import { colors, spacing } from "../../theme/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function EchoDetail() {
  const { id, title: titleParam, imageUrl: imageParam, subtitle: subtitleParam } = useLocalSearchParams<{ id: string; title?: string; imageUrl?: string; subtitle?: string }>();
  const capsule = useMemo(() => {
    const found = dummyCapsules.find(c => c.id === id);
    if (found) return found;
    return { id: String(id), title: titleParam ?? "Echo", subtitle: subtitleParam ?? "", imageUrl: typeof imageParam === "string" ? imageParam : undefined } as any;
  }, [id, titleParam, imageParam, subtitleParam]);
  const sharedTag = `echo-image-${id}`;
  const navigation = useNavigation();
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const titleTopRef = useRef(0);
  const titleHeightRef = useRef(0);
  const insets = useSafeAreaInsets();

  if (!capsule) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.textSecondary }}>Echo not found.</Text>
      </View>
    );
  }

  const progress = computeCapsuleProgressPercent(capsule);
  const collaborators = capsule.participants ?? [];

  useEffect(() => {
    navigation.setOptions({ title: showHeaderTitle ? capsule.title : "" });
  }, [navigation, showHeaderTitle, capsule.title]);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces
        overScrollMode="always"
        scrollEventThrottle={16}
        onScroll={(e: any) => {
          const y = e?.nativeEvent?.contentOffset?.y ?? 0;
          // Reveal header title only after the on-screen title has fully scrolled past the top edge
          const extraOffset = insets.top + 24; // delay to ensure it's well past the top edge under the translucent header
          const threshold = Math.max(0, titleTopRef.current + titleHeightRef.current + extraOffset);
          if (y >= threshold && !showHeaderTitle) setShowHeaderTitle(true);
          if (y < threshold && showHeaderTitle) setShowHeaderTitle(false);
        }}
      >
        <Animated.View
          {...({
            sharedTransitionTag: sharedTag,
            sharedTransitionStyle: () => {
              "worklet";
              return { borderRadius: 0 };
            },
          } as any)}
          style={styles.heroContainer}
        >
          <Animated.Image
            source={capsule.imageUrl ? { uri: capsule.imageUrl } : undefined}
            resizeMode="cover"
            style={styles.hero}
          />
        </Animated.View>

        <View style={styles.content}>
          <Text
            style={styles.title}
            onLayout={e => {
              titleTopRef.current = e.nativeEvent.layout.y;
              titleHeightRef.current = e.nativeEvent.layout.height;
            }}
          >
            {capsule.title}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
          </View>
          {collaborators.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collaboratorsRow}
            >
              {collaborators.map((uri: string, idx: number) => (
                <Image key={`col-${idx}`} source={{ uri }} style={styles.avatar} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.privateBadge}>
              <View style={styles.privateBadgeOverlay} />
              <View style={styles.privateBadgeContent}>
                <Ionicons name="lock-closed" size={12} color={colors.white} style={styles.privateIcon} />
                <Text style={styles.privateBadgeText}>Private</Text>
              </View>
            </View>
          )}

          {/* Fake sections to demo scrolling */}
          {Array.from({ length: 16 }).map((_, index) => (
            <View key={`sec-${index}`} style={styles.fakeRow}>
              <Text style={styles.fakeTitle}>{`Section ${index + 1}`}</Text>
              <Text style={styles.fakeSubtitle}>Example content for this section.</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const HERO_HEIGHT = Math.round(SCREEN_WIDTH * 0.75);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingTop: 0,
  },
  heroContainer: {
    width: "100%",
    height: HERO_HEIGHT,
    backgroundColor: colors.surface,
  },
  hero: {
    width: "100%",
    height: "100%",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  collaboratorsRow: {
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  fakeRow: {
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceBorder,
  },
  fakeTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  fakeSubtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  privateBadge: {
    alignSelf: "flex-start",
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  privateBadgeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.lightOverlay,
  },
  privateBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  privateIcon: {
    marginRight: 6,
    opacity: 0.9,
  },
  privateBadgeText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 10,
    opacity: 0.9,
  },
  
});


