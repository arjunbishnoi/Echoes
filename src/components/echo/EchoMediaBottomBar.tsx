import BottomBarBackground from "@/components/BottomBarBackground";
import { colors, sizes } from "@/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

type Props = {
  onPressCamera: () => void;
  onPressGallery: () => void;
  onPressAudio: () => void;
  onLongPressAudio?: () => void;
  onPressFiles: () => void;
  skipAnimation?: boolean;
};

export default function EchoMediaBottomBar({ 
  onPressCamera, 
  onPressGallery, 
  onPressAudio, 
  onLongPressAudio,
  onPressFiles,
  skipAnimation = false
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  // Try 65% of screen width to match drawer width
  const barWidthCalculated = Math.floor(screenWidth * 0.80);
  const extendedRadius = 30; // More rounded corners than default pill
  
  const [barWidth, setBarWidth] = useState(0);
  const measuredWidth = Math.max(0, barWidth);
  const segmentWidth = measuredWidth > 0 ? measuredWidth / 4 : 0;
  const gridWidth = measuredWidth;

  // Animation values for icons
  const iconsOpacity = useSharedValue(skipAnimation ? 1 : 0);
  const iconsTranslateY = useSharedValue(skipAnimation ? 0 : 8);

  // Animate icons in on mount (only if not skipping animation)
  useEffect(() => {
    if (!skipAnimation) {
      // Start animation immediately for snappier feel
      iconsOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      iconsTranslateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [iconsOpacity, iconsTranslateY, skipAnimation]);

  const iconsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconsOpacity.value,
    transform: [{ translateY: iconsTranslateY.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={[styles.bar, { width: barWidthCalculated, borderRadius: extendedRadius }]} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        <BottomBarBackground borderRadius={extendedRadius} />
        <Animated.View style={[styles.grid, gridWidth > 0 ? { width: gridWidth } : null, iconsAnimatedStyle]}>
          <MediaSlot icon="camera" onPress={onPressCamera} label="Camera" segmentWidth={segmentWidth} />
          <MediaSlot icon="images" onPress={onPressGallery} label="Gallery" segmentWidth={segmentWidth} />
          <MediaSlot icon="mic" onPress={onPressAudio} onLongPress={onLongPressAudio} label="Audio" segmentWidth={segmentWidth} />
          <MediaSlot icon="document-text" onPress={onPressFiles} label="Files" segmentWidth={segmentWidth} />
        </Animated.View>
      </View>
    </View>
  );
}

function MediaSlot({ 
  icon, 
  onPress, 
  onLongPress,
  label,
  segmentWidth 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  onPress: () => void; 
  onLongPress?: () => void;
  label: string;
  segmentWidth: number;
}) {
  const slotStyle = [styles.slot, segmentWidth > 0 ? { width: segmentWidth } : null];
  
  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };
  
  return (
    <View style={slotStyle}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress ? handleLongPress : undefined}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.pressable}
        delayLongPress={500}
      >
        <Ionicons name={icon} size={22} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: sizes.floatingBar.bottomOffset,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: sizes.floatingBar.height,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  grid: {
    position: "relative",
    height: "100%",
    marginLeft: 0,
    marginRight: 0,
    flexDirection: "row",
  },
  slot: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  pressable: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});

