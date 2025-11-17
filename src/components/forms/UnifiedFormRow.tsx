import { colors, spacing } from "@/theme/theme";
import { getExpoJetpackCompose, getExpoJetpackComposePrimitives, getExpoSwiftUI } from "@/utils/expoUi";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Platform, Pressable, Switch as RNSwitch, StyleProp, StyleSheet, TextStyle, View } from "react-native";
import { FormRow as NativeFormRow } from "../IOSForm";

type UnifiedFormRowProps = {
  title: string;
  subtitle?: string;
  titleStyle?: StyleProp<TextStyle>;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightComponent?: React.ReactNode;
  valueText?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  showChevron?: boolean;
  switch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  systemImage?: string;
};

export function UnifiedFormRow({
  title,
  subtitle,
  titleStyle,
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
  const JetpackComposePrimitives =
    Platform.OS === "android" ? getExpoJetpackComposePrimitives() : null;
  const JetpackCompose = Platform.OS === "android" ? getExpoJetpackCompose() : null;

  if (SwiftUI) {
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

    return (
      <SwiftUI.Text systemImage={systemImage || leftIcon}>
        {valueText ? `${title}: ${valueText}` : title}
      </SwiftUI.Text>
    );
  }

  if (JetpackComposePrimitives) {
    const { Container, Column, Row, Text: ComposeText } = JetpackComposePrimitives;
    const ComposeSwitch = JetpackCompose?.Switch;
    const resolvedTitleStyle = StyleSheet.flatten(titleStyle) || {};
    const androidTitleColor = resolvedTitleStyle.color ?? colors.textPrimary;
    const androidTitleFontSize = resolvedTitleStyle.fontSize ?? 16;
    const androidTitleFontWeight = (resolvedTitleStyle.fontWeight ?? "600") as TextStyle["fontWeight"];

    const rightContent = (() => {
      if (isSwitch && ComposeSwitch && onSwitchChange) {
        return (
          <ComposeSwitch
            value={switchValue ?? false}
            onValueChange={onSwitchChange}
          />
        );
      }

      if (valueText) {
        return (
          <ComposeText color={colors.textSecondary} fontSize={14}>
            {valueText}
          </ComposeText>
        );
      }

      if (showChevron) {
        return (
          <ComposeText color={colors.textSecondary} fontSize={20}>
            ›
          </ComposeText>
        );
      }

      return null;
    })();

    const composeRow = (
      <Container style={styles.androidRowContainer}>
        <Row horizontalArrangement="spaceBetween" verticalAlignment="center">
          <Column horizontalAlignment="start" verticalArrangement="center">
            <ComposeText
              color={androidTitleColor}
              fontSize={androidTitleFontSize}
              fontWeight={androidTitleFontWeight}
            >
              {title}
            </ComposeText>
            {subtitle ? (
              <ComposeText color={colors.textSecondary} fontSize={13}>
                {subtitle}
              </ComposeText>
            ) : null}
          </Column>
          {rightContent}
        </Row>
      </Container>
    );

    if (onPress) {
      return (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={styles.androidRowPressable}
        >
          {composeRow}
        </Pressable>
      );
    }

    return <View style={styles.androidRowStatic}>{composeRow}</View>;
  }

  const Left = leftIcon ? <Ionicons name={leftIcon} size={20} color={colors.textPrimary} /> : undefined;
  
  let Right = rightComponent;
  if (isSwitch && onSwitchChange) {
    Right = (
      <RNSwitch
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
      titleStyle={titleStyle}
      Left={Left}
      Right={Right}
      valueText={valueText}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      showChevron={showChevron}
    />
  );
}

const styles = StyleSheet.create({
  androidRowPressable: {
    width: "100%",
    borderRadius: 0,
  },
  androidRowStatic: {
    width: "100%",
  },
  androidRowContainer: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
});

