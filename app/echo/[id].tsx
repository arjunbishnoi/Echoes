import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { dummyCapsules } from "../../data/dummyCapsules";
import Animated from "react-native-reanimated";
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

  if (!capsule) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.textSecondary }}>Echo not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces
        overScrollMode="always"
        scrollEventThrottle={16}
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
          <Text style={styles.title}>{capsule.title}</Text>
          {capsule.subtitle ? <Text style={styles.subtitle}>{capsule.subtitle}</Text> : null}

          <View style={{ height: spacing.xl }} />
          <Text style={styles.sectionHeader}>About this Echo</Text>
          <Text style={styles.paragraph}>
            This is a placeholder description for the echo. Add your story, location, collaborators,
            and any media you want to preserve. The top image is shared from the card and expands to an immersive hero.
          </Text>

          <View style={{ height: 200 }} />
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
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  paragraph: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});


