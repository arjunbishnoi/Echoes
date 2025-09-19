import React, { useMemo, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { dummyCapsules } from "../../data/dummyCapsules";
import Animated, { useSharedValue, useDerivedValue, useAnimatedStyle, withTiming, useAnimatedScrollHandler, runOnJS } from "react-native-reanimated";
import { colors, spacing } from "../../theme/theme";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function EchoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const capsule = useMemo(() => dummyCapsules.find(c => c.id === id), [id]);
  const sharedTag = `echo-image-${id}`;
  const router = useRouter();
  const scrollRef = useRef<Animated.ScrollView | null>(null);
  const translateY = useSharedValue(0);
  const opacity = useDerivedValue(() => 1 - Math.min(Math.abs(translateY.value) / 200, 0.2));
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const pan = Gesture.Pan()
    .activeOffsetY(10)
    .onChange((event) => {
      // Only when scrolled to top and dragging down
      if (scrollY.value <= 0 && event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (translateY.value > 140) {
        translateY.value = 0;
        runOnJS(router.back)();
      } else {
        translateY.value = withTiming(0, { duration: 180 });
      }
    });

  if (!capsule) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.textSecondary }}>Echo not found.</Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          bounces
          overScrollMode="always"
          scrollEventThrottle={16}
          onScroll={onScroll}
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
      </Animated.View>
    </GestureDetector>
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


