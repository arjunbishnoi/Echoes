import { colors } from "@/theme/theme";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const BAR_WIDTH = 4;
const BAR_GAP = 6;
const MIN_HEIGHT = 8;
const MAX_HEIGHT = 40;

type AudioWaveformProps = {
  isPaused?: boolean;
  levels?: number[];
  allLevels?: number[];
};

export default function AudioWaveform({ isPaused = false, levels = [], allLevels = [] }: AudioWaveformProps) {
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const barCount = useMemo(() => {
    if (measuredWidth <= 0) return 7;
    const totalUnit = BAR_WIDTH + BAR_GAP;
    const count = Math.floor((measuredWidth + BAR_GAP) / totalUnit);
    return Math.max(7, count);
  }, [measuredWidth]);

  const PAUSED_MULTIPLIER = 0.85;

  // Equalizer targets during recording: use latest amplitude with per-bar weighting
  const eqTargets = useMemo(() => {
    const n = barCount;
    if (n <= 0) return [] as number[];
    const last = levels.length > 0 ? levels[levels.length - 1] : 0;
    // More reactive: varied weights to create bouncy feel
    return Array.from({ length: n }, (_, i) => {
      const center = (n - 1) / 2;
      const dist = Math.abs(i - center);
      const normalizedDist = dist / Math.max(1, center);
      // Parabolic falloff for center emphasis + randomness for bounce
      const weight = 1.0 - 0.4 * normalizedDist * normalizedDist + (Math.sin(i * 1.3) * 0.15);
      const boosted = Math.pow(last, 0.7) * weight; // power curve for more punch
      const amp = Math.max(0, Math.min(1, boosted));
      return amp;
    });
  }, [levels, barCount]);

  // Paused summary: max-per-bucket downsample of entire history
  const maxDownsample = useMemo(() => {
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
  }, [allLevels, barCount]);

  const targets = isPaused ? maxDownsample : eqTargets;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.max(0, e.nativeEvent.layout.width);
    if (w !== measuredWidth) setMeasuredWidth(w);
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      {Array.from({ length: barCount }).map((_, index) => (
        <WaveBar
          key={index}
          target={targets[index] ?? 0}
          paused={isPaused}
          pausedMultiplier={PAUSED_MULTIPLIER}
        />
      ))}
    </View>
  );
}

function WaveBar({ target, paused, pausedMultiplier }: { target: number; paused: boolean; pausedMultiplier: number }) {
  const height = useSharedValue(MIN_HEIGHT);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, target));
    const mult = paused ? pausedMultiplier : 1;
    const next = MIN_HEIGHT + clamped * (MAX_HEIGHT - MIN_HEIGHT) * mult;
    // Faster, snappier animation for bounce
    height.value = withTiming(next, { duration: paused ? 120 : 80 });
  }, [target, paused, pausedMultiplier, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    // Brightness scales with amplitude: derive alpha from target by inverting from height
  }));

  // Static background uses white; we control perceived brightness via opacity by layering alpha
  const alpha = Math.max(0.4, Math.min(1, 0.5 + 0.5 * target));
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

