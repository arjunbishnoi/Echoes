import React, { useMemo } from "react";
import { View, Text, StyleSheet, ImageBackground, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS } from "react-native-reanimated";
import { GestureConfig } from "../config/ui";
import { BlurView } from "expo-blur";
import { colors, radii, sizes } from "../theme/theme";

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  imageUrl?: string;
  onPress?: () => void;
};

function TimeCapsuleCardInner({ title, subtitle, style, imageUrl, id, onPress }: Props) {
  const sharedTag = id ? `echo-image-${id}` : undefined;
  const tapGesture = useMemo(() => (
    Gesture.Tap()
      .enabled(!!onPress)
      .maxDeltaX(GestureConfig.tapMaxDeltaX)
      .maxDeltaY(GestureConfig.tapMaxDeltaY)
      .onEnd((_e, success) => {
        'worklet';
        if (success && onPress) {
          runOnJS(onPress)();
        }
      })
  ), [onPress]);
  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[styles.card, style as any]}
        collapsable={false}
        {...({
          sharedTransitionTag: sharedTag,
          sharedTransitionStyle: () => {
            "worklet";
            return { borderRadius: 0 };
          },
        } as any)}
      >
        <ImageBackground
        source={imageUrl ? { uri: imageUrl } : undefined}
        resizeMode="cover"
        style={styles.image}
        imageStyle={styles.imageBorder}
      >
        <View style={{ flex: 1 }} />
        <View style={styles.blurContainer}>
          <BlurView intensity={16} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.lightOverlay} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        </ImageBackground>
      </Animated.View>
    </GestureDetector>
  );
}

const TimeCapsuleCard = React.memo(TimeCapsuleCardInner);
export default TimeCapsuleCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  image: {
    width: "100%",
    flex: 1,
  },
  imageBorder: {
    borderRadius: radii.card,
  },
  blurContainer: {
    height: sizes.list.cardBlurHeight,
    justifyContent: "flex-end",
  },
  lightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.lightOverlay,
  },
  textContainer: {
    padding: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});


