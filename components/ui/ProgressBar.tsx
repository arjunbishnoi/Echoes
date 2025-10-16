import { BlurView } from "expo-blur";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { PROGRESS_TRACK_HEIGHT } from "../../constants/dimensions";
import { colors } from "../../theme/theme";

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  trackColor?: string;
  progressColor?: string;
  borderRadius?: number;
  style?: ViewStyle;
  useFrostedMaterial?: boolean;
}

export default function ProgressBar({
  progress,
  height = PROGRESS_TRACK_HEIGHT,
  trackColor = "rgba(255,255,255,0.2)",
  progressColor = colors.white,
  borderRadius = 3,
  style,
  useFrostedMaterial = false,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  return (
    <View
      style={[
        styles.track,
        { 
          height, 
          backgroundColor: useFrostedMaterial ? "rgba(0,0,0,0.12)" : trackColor, 
          borderRadius 
        },
        style,
      ]}
    >
      {useFrostedMaterial && (
        <>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.overlay} />
        </>
      )}
      <View
        style={[
          styles.progress,
          {
            height,
            width: `${clampedProgress * 100}%`,
            backgroundColor: progressColor,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.lightOverlay,
  },
  progress: {
    height: "100%",
  },
});


