export const indicatorSpring = {
  stiffness: 540,
  damping: 32,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.5,
  restSpeedThreshold: 0.5,
} as const;

export const indicatorPulse = {
  up: { duration: 110 },
  down: { duration: 140 },
} as const;




