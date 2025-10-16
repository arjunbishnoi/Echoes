import type { ViewStyle } from "react-native";

export interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export interface IconProps {
  size?: number;
  color?: string;
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  activeIcon?: string;
}

export interface ProgressConfig {
  value: number; // 0-1
  showLabel?: boolean;
  animate?: boolean;
}


