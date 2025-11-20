import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useEffect, useRef } from "react";
import { ColorValue, StyleSheet, Animated } from "react-native";
import { useImageColors } from "@/hooks/useImageColors";
import { createGradientFromColors, getFallbackGradient } from "@/utils/imageColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  height?: number;
  echoId?: string;
  imageUrl?: string;
  scrollY?: number;
};

function ImageGradientOverlay({ height = 500, echoId, imageUrl, scrollY = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Extract colors from the cover image
  const { colors: extractedColors } = useImageColors(imageUrl);

  const gradientConfig = useMemo(() => {
    // If we have extracted colors, create a personalized gradient
    if (extractedColors) {
      return createGradientFromColors(extractedColors);
    }
    
    // Fallback to preset gradient based on echoId
    return getFallbackGradient(echoId);
  }, [extractedColors, echoId]);

  // Animate gradient position based on scroll
  useEffect(() => {
    // Calculate how much to translate the gradient up
    // As user scrolls down, gradient moves up (negative translateY)
    // We want it to eventually be positioned only in the header area
    const headerHeight = insets.top + 44; // Safe area + header height
    // The gradient should move up by the scroll amount, but stop when only header is visible
    // This means when scrollY reaches (height - headerHeight), gradient is fully in header
    const maxScroll = Math.max(0, height - headerHeight);
    
    // Clamp scroll value and calculate translateY
    // Negative translateY moves the gradient up
    const clampedScroll = Math.max(0, Math.min(scrollY, maxScroll));
    const translateValue = -clampedScroll;
    
    // Use setValue for instant updates during scroll (smoother than timing with duration 0)
    translateY.setValue(translateValue);
  }, [scrollY, height, insets.top, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={gradientConfig.colors as ColorValue[]}
        locations={gradientConfig.locations}
        style={[styles.gradient, { height }]}
      />
    </Animated.View>
  );
}

export default ImageGradientOverlay;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
    overflow: "hidden",
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
});

