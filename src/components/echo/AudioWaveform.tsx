import { colors } from "@/theme/theme";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, SharedValue, useAnimatedReaction, runOnJS } from "react-native-reanimated";

const BAR_WIDTH = 4;
const BAR_GAP = 6;
const MIN_HEIGHT = 8;
const MAX_HEIGHT = 40;

type AudioWaveformProps = {
  isPaused?: boolean;
  levels?: number[]; // Deprecated for live recording, used for legacy or fallback
  allLevels?: number[];
  metering?: SharedValue<number>;
};

export default function AudioWaveform({ isPaused = false, levels = [], allLevels = [], metering }: AudioWaveformProps) {
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const barCount = useMemo(() => {
    if (measuredWidth <= 0) return 7;
    const totalUnit = BAR_WIDTH + BAR_GAP;
    const count = Math.floor((measuredWidth + BAR_GAP) / totalUnit);
    return Math.max(7, count);
  }, [measuredWidth]);

  const PAUSED_MULTIPLIER = 0.85;

  // Pre-calculate weights for each bar index
  const barWeights = useMemo(() => {
    const n = barCount;
    return Array.from({ length: n }, (_, i) => {
      const center = (n - 1) / 2;
      const dist = Math.abs(i - center);
      const normalizedDist = dist / Math.max(1, center);
      // Parabolic falloff for center emphasis + randomness for bounce
      return 1.0 - 0.4 * normalizedDist * normalizedDist + (Math.sin(i * 1.3) * 0.15);
    });
  }, [barCount]);

  // Paused summary: max-per-bucket downsample of entire history
  const maxDownsample = useMemo(() => {
    if (!isPaused) return [] as number[];
    const n = barCount;
    if (n <= 0) return [] as number[];
    const len = allLevels.length;
    if (len === 0) return Array(n).fill(0) as number[];
    const size = Math.ceil(len / n) || 1;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const s = i * size;
      const e = Math.min(len, s + size);
      let m = 0;
      for (let j = s; j < e; j++) m = Math.max(m, allLevels[j] ?? 0);
      out.push(m);
    }
    return out;
  }, [allLevels, barCount, isPaused]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.max(0, e.nativeEvent.layout.width);
    if (w !== measuredWidth) setMeasuredWidth(w);
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      {Array.from({ length: barCount }).map((_, index) => (
        <WaveBar
          key={index}
          target={isPaused ? (maxDownsample[index] ?? 0) : 0}
          weight={barWeights[index]}
          paused={isPaused}
          pausedMultiplier={PAUSED_MULTIPLIER}
          metering={metering}
        />
      ))}
    </View>
  );
}

function WaveBar({ target, weight, paused, pausedMultiplier, metering }: { target: number; weight: number; paused: boolean; pausedMultiplier: number; metering?: SharedValue<number> }) {
  const height = useSharedValue(MIN_HEIGHT);

  // Reactive update from SharedValue (Live Recording)
  useAnimatedReaction(
    () => {
      if (paused || !metering) return null;
      return metering.value;
    },
    (meterVal) => {
      if (meterVal !== null) {
        const boosted = Math.pow(meterVal, 0.7) * weight;
        const clamped = Math.max(0, Math.min(1, boosted));
        const next = MIN_HEIGHT + clamped * (MAX_HEIGHT - MIN_HEIGHT);
        height.value = withTiming(next, { duration: 80 });
      }
    },
    [paused, weight, metering] // dependencies
  );

  // React Effect update from props (Paused / Legacy)
  useEffect(() => {
    if (!paused && metering) return; // Let Reanimated handle it
    
    const clamped = Math.max(0, Math.min(1, target));
    const mult = paused ? pausedMultiplier : 1;
    const next = MIN_HEIGHT + clamped * (MAX_HEIGHT - MIN_HEIGHT) * mult;
    height.value = withTiming(next, { duration: paused ? 120 : 80 });
  }, [target, paused, pausedMultiplier, height, metering]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  // Static background uses white; we control perceived brightness via opacity by layering alpha
  const alpha = Math.max(0.4, Math.min(1, 0.5 + 0.5 * (metering ? 0.5 : target))); // approximate alpha for shared value
  return <Animated.View style={[styles.bar, { backgroundColor: `rgba(255,255,255,${alpha})` }, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: MAX_HEIGHT + 10,
  },
  bar: {
    width: BAR_WIDTH,
    backgroundColor: colors.white,
    borderRadius: BAR_WIDTH / 2,
    opacity: 0.9,
  },
});

