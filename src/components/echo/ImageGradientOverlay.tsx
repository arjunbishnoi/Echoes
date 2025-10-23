import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { ColorValue, StyleSheet } from "react-native";

type Props = {
  imageUrl?: string;
  height?: number;
  echoId?: string;
};

// Optimized gradient presets with fewer stops for better performance
const GRADIENT_PRESETS = [
  ['rgba(186, 85, 211, 0.9)', 'rgba(75, 0, 130, 0.6)', 'rgba(10, 0, 15, 0.7)', 'rgba(0, 0, 0, 0.92)', 'rgba(0, 0, 0, 0.97)', 'rgba(0, 0, 0, 0.993)', 'rgba(0, 0, 0, 1)'],
  ['rgba(0, 191, 255, 0.9)', 'rgba(0, 100, 200, 0.6)', 'rgba(0, 10, 20, 0.7)', 'rgba(0, 0, 0, 0.92)', 'rgba(0, 0, 0, 0.97)', 'rgba(0, 0, 0, 0.993)', 'rgba(0, 0, 0, 1)'],
  ['rgba(255, 127, 80, 0.9)', 'rgba(200, 50, 50, 0.6)', 'rgba(20, 5, 5, 0.7)', 'rgba(0, 0, 0, 0.92)', 'rgba(0, 0, 0, 0.97)', 'rgba(0, 0, 0, 0.993)', 'rgba(0, 0, 0, 1)'],
  ['rgba(64, 224, 208, 0.9)', 'rgba(0, 128, 128, 0.6)', 'rgba(0, 12, 12, 0.7)', 'rgba(0, 0, 0, 0.92)', 'rgba(0, 0, 0, 0.97)', 'rgba(0, 0, 0, 0.993)', 'rgba(0, 0, 0, 1)'],
  ['rgba(255, 105, 180, 0.9)', 'rgba(150, 0, 80, 0.6)', 'rgba(15, 0, 7, 0.7)', 'rgba(0, 0, 0, 0.92)', 'rgba(0, 0, 0, 0.97)', 'rgba(0, 0, 0, 0.993)', 'rgba(0, 0, 0, 1)'],
  ['rgba(255, 215, 0, 0.9)', 'rgba(150, 100, 0, 0.6)', 'rgba(15, 10, 0, 0.7)', 'rgba(0, 0, 0, 0.92)', 'rgba(0, 0, 0, 0.97)', 'rgba(0, 0, 0, 0.993)', 'rgba(0, 0, 0, 1)'],
  ['rgba(255, 69, 96, 0.9)', 'rgba(150, 20, 40, 0.6)', 'rgba(15, 2, 5, 0.7)', 'rgba(0, 0, 0, 0.92)', 'rgba(0, 0, 0, 0.97)', 'rgba(0, 0, 0, 0.993)', 'rgba(0, 0, 0, 1)'],
  ['rgba(99, 102, 241, 0.9)', 'rgba(55, 48, 163, 0.6)', 'rgba(7, 6, 18, 0.7)', 'rgba(0, 0, 0, 0.92)', 'rgba(0, 0, 0, 0.97)', 'rgba(0, 0, 0, 0.993)', 'rgba(0, 0, 0, 1)'],
] as const;

function ImageGradientOverlay({ imageUrl, height = 500, echoId }: Props) {
  const gradientColors = useMemo(() => {
    if (!echoId) return [...GRADIENT_PRESETS[0]] as [ColorValue, ColorValue, ...ColorValue[]];
    
    const hash = echoId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const index = hash % GRADIENT_PRESETS.length;
    return [...GRADIENT_PRESETS[index]] as [ColorValue, ColorValue, ...ColorValue[]];
  }, [echoId]);

  return (
    <LinearGradient
      colors={gradientColors}
      locations={[0, 0.2, 0.5, 0.75, 0.9, 0.97, 1]}
      style={[styles.gradient, { height }]}
      pointerEvents="none"
    />
  );
}

export default ImageGradientOverlay;

const styles = StyleSheet.create({
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
});

