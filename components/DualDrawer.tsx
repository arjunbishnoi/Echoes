import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { colors } from "../theme/theme";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";

export type DrawerApi = {
  openLeft: () => void;
  openRight: () => void;
  close: () => void;
  isOpen: () => boolean;
};

type Props = {
  renderLeft?: React.ReactNode;
  renderRight?: React.ReactNode;
  children: React.ReactNode;
  leftWidthRatio?: number; // default 0.8
  rightWidthRatio?: number; // default 0.8
  onReady?: (api: DrawerApi) => void;
  edgeHitWidth?: number; // px from each edge that activates pan
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DualDrawer({
  renderLeft,
  renderRight,
  children,
  leftWidthRatio = 0.8,
  rightWidthRatio = 0.8,
  onReady,
  edgeHitWidth = 32,
}: Props) {
  const leftWidth = Math.round(SCREEN_WIDTH * leftWidthRatio);
  const rightWidth = Math.round(SCREEN_WIDTH * rightWidthRatio);

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const maxWidth = Math.max(leftWidth, rightWidth);
  const [scrimEnabled, setScrimEnabled] = useState(false);
  const [leftMounted, setLeftMounted] = useState(false);
  const [rightMounted, setRightMounted] = useState(false);
  const openSide = useSharedValue<"none" | "left" | "right">("none");

  const settleTo = useCallback((target: number, velocityX?: number) => {
    translateX.value = withSpring(target, {
      velocity: velocityX,
      stiffness: 600,
      damping: 60,
      mass: 1,
      overshootClamping: true,
    });
  }, [translateX]);

  const openLeft = useCallback(() => {
    setLeftMounted(true);
    settleTo(leftWidth);
  }, [leftWidth, settleTo]);
  const openRight = useCallback(() => {
    setRightMounted(true);
    settleTo(-rightWidth);
  }, [rightWidth, settleTo]);
  const close = useCallback(() => {
    settleTo(0);
  }, [settleTo]);
  const isOpen = useCallback(() => translateX.value !== 0, [translateX]);

  useEffect(() => {
    if (onReady) onReady({ openLeft, openRight, close, isOpen });
  }, [onReady, openLeft, openRight, close, isOpen]);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-12, 12])
    .onStart(() => {
      'worklet';
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      'worklet';
      // Edge-only activation to avoid conflicts with vertical scroll & card taps
      const touchX = (event as any)?.absoluteX ?? 0;
      const isFromLeftEdge = touchX <= edgeHitWidth;
      const isFromRightEdge = touchX >= SCREEN_WIDTH - edgeHitWidth;
      const isDrawerAlreadyOpen = Math.abs(startX.value) > 0.5;
      if (!isFromLeftEdge && !isFromRightEdge && !isDrawerAlreadyOpen) {
        return;
      }
      const next = startX.value + event.translationX;
      // rubberband outside bounds for premium feel
      let value = next;
      if (next > leftWidth) {
        value = leftWidth + (next - leftWidth) * 0.25;
      } else if (next < -rightWidth) {
        value = -rightWidth + (next + rightWidth) * 0.25;
      }
      translateX.value = value;
    })
    .onEnd((event) => {
      'worklet';
      const vx = event.velocityX;
      const x = translateX.value;
      const openLeftThreshold = leftWidth * 0.33;
      const openRightThreshold = -rightWidth * 0.33;

      if (vx > 600) {
        settleTo(leftWidth, vx);
        return;
      }
      if (vx < -600) {
        settleTo(-rightWidth, vx);
        return;
      }

      if (x >= openLeftThreshold) {
        settleTo(leftWidth, vx);
      } else if (x <= openRightThreshold) {
        settleTo(-rightWidth, vx);
      } else {
        settleTo(0, vx);
      }
    });

  const contentStyle = useAnimatedStyle(() => {
    const progress = Math.min(1, Math.abs(translateX.value) / maxWidth);
    const scale = interpolate(progress, [0, 1], [1, 0.94], Extrapolation.CLAMP);
    const radius = interpolate(progress, [0, 1], [0, 16], Extrapolation.CLAMP);
    return {
      transform: [{ translateX: translateX.value }, { scale }],
      borderRadius: radius,
      overflow: radius > 0 ? "hidden" : "visible",
    } as any;
  });

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(translateX.value, [-rightWidth, 0, leftWidth], [-leftWidth * 0.3, -leftWidth, 0], Extrapolation.CLAMP) }],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(translateX.value, [-rightWidth, 0, leftWidth], [0, rightWidth, rightWidth * 1.3], Extrapolation.CLAMP) }],
  }));

  const scrimOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(translateX.value), [0, maxWidth], [0, 0.45], Extrapolation.CLAMP),
  }));

  useDerivedValue(() => {
    const enabled = Math.abs(translateX.value) > 1;
    const side: "none" | "left" | "right" = translateX.value > 0 ? "left" : translateX.value < 0 ? "right" : "none";
    if (enabled !== scrimEnabled) runOnJS(setScrimEnabled)(enabled);
    if (side !== openSide.value) {
      openSide.value = side;
      if (side === "left") runOnJS(setLeftMounted)(true);
      if (side === "right") runOnJS(setRightMounted)(true);
      if (side === "none") {
        runOnJS(setLeftMounted)(false);
        runOnJS(setRightMounted)(false);
      }
    }
  });

  return (
    <View style={styles.container}>
      {/* Drawers are always mounted to avoid white flash on first open */}
      {renderLeft ? (
        <Animated.View pointerEvents="box-none" style={[styles.leftDrawer, { width: leftWidth }, leftStyle]}>
          <View style={styles.drawerSurface} />
          {leftMounted ? renderLeft : renderLeft}
        </Animated.View>
      ) : null}
      {renderRight ? (
        <Animated.View pointerEvents="box-none" style={[styles.rightDrawer, { width: rightWidth }, rightStyle]}>
          <View style={styles.drawerSurface} />
          {rightMounted ? renderRight : renderRight}
        </Animated.View>
      ) : null}
      {scrimEnabled ? (
        <Animated.View pointerEvents="auto" style={[styles.scrim, scrimOpacityStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>
      ) : null}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.content, contentStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  leftDrawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
  rightDrawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    alignItems: "flex-end",
  },
  drawerSurface: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121212",
  },
  content: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
  },
});


