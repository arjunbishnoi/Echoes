import { colors, radii, spacing } from "@/theme/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useCallback } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  icon?: string;
}

export default function Toast({ message, visible, onHide, duration = 3000, icon = "checkmark-circle" }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [translateY, opacity, onHide]);

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, hideToast, translateY, opacity]);

  if (!visible) return null;

  // Calculate position below header (header is typically 44px + safe area)
  const headerHeight = 44;
  const topPosition = insets.top + headerHeight + spacing.md;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topPosition,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <Pressable onPress={hideToast} style={styles.toast}>
        <Ionicons name={icon as any} size={20} color={colors.white} style={styles.icon} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    backgroundColor: colors.black,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: "100%",
    minHeight: 56,
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
});

