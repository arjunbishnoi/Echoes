import { Easing, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { INDICATOR_PULSE } from "../../constants/animations";

export function useTabAnimation() {
  const translateX = useSharedValue(0);
  const indicatorScaleX = useSharedValue(1);

  const animateToPosition = (position: number, config?: any) => {
    translateX.value = withSpring(position, config);
    indicatorScaleX.value = withSequence(
      withTiming(1.04, { duration: INDICATOR_PULSE.up.duration, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: INDICATOR_PULSE.down.duration, easing: Easing.out(Easing.quad) })
    );
  };

  const updatePosition = (position: number) => {
    translateX.value = position;
  };

  return {
    translateX,
    indicatorScaleX,
    animateToPosition,
    updatePosition,
  };
}


