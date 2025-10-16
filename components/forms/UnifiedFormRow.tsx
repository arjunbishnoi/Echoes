import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Switch } from "react-native";
import { getExpoSwiftUI } from "../../lib/expoUi";
import { colors } from "../../theme/theme";
import { FormRow as NativeFormRow } from "../IOSForm";

type UnifiedFormRowProps = {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightComponent?: React.ReactNode;
  valueText?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  showChevron?: boolean;
  // Switch-specific props
  switch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  // Button props (for SwiftUI)
  systemImage?: string;
};

/**
 * Unified FormRow that automatically uses SwiftUI on iOS when available,
 * or falls back to native FormRow on Android/Web
 */
export function UnifiedFormRow({
  title,
  subtitle,
  leftIcon,
  rightComponent,
  valueText,
  onPress,
  accessibilityLabel,
  showChevron,
  switch: isSwitch,
  switchValue,
  onSwitchChange,
  systemImage,
}: UnifiedFormRowProps) {
  const SwiftUI = Platform.OS === "ios" ? getExpoSwiftUI() : null;

  if (SwiftUI) {
    // SwiftUI rendering
    if (isSwitch && onSwitchChange) {
      return (
        <SwiftUI.Switch
          value={switchValue ?? false}
          label={title}
          onValueChange={onSwitchChange}
        />
      );
    }

    if (onPress) {
      return (
        <SwiftUI.Button
          systemImage={systemImage || leftIcon}
          onPress={onPress}
        >
          {title}
        </SwiftUI.Button>
      );
    }

    // Static text row
    return (
      <SwiftUI.Text systemImage={systemImage || leftIcon}>
        {valueText ? `${title}: ${valueText}` : title}
      </SwiftUI.Text>
    );
  }

  // Native rendering
  const Left = leftIcon ? <Ionicons name={leftIcon} size={20} color={colors.textPrimary} /> : undefined;
  
  let Right = rightComponent;
  if (isSwitch && onSwitchChange) {
    Right = (
      <Switch
        value={switchValue ?? false}
        onValueChange={onSwitchChange}
        trackColor={{ false: "#E5E5EA", true: "#34C759" }}
        thumbColor={colors.white}
      />
    );
  }

  return (
    <NativeFormRow
      title={title}
      subtitle={subtitle}
      Left={Left}
      Right={Right}
      valueText={valueText}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      showChevron={showChevron}
    />
  );
}

