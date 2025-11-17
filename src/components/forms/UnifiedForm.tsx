import { colors, radii, spacing } from "@/theme/theme";
import { getExpoSwiftUI } from "@/utils/expoUi";
import React from "react";
import { Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FormSection as NativeFormSection } from "../IOSForm";

type UnifiedFormSectionProps = {
  title?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function UnifiedFormSection({ title, style, children }: UnifiedFormSectionProps) {
  const SwiftUI = Platform.OS === "ios" ? getExpoSwiftUI() : null;

  if (SwiftUI) {
    return (
      <View style={style}>
        <SwiftUI.Host style={{ flex: 1 }}>
          <SwiftUI.Form>
            <SwiftUI.Section title={title}>
              {children}
            </SwiftUI.Section>
          </SwiftUI.Form>
        </SwiftUI.Host>
      </View>
    );
  }

  if (Platform.OS === "android") {
    const childArray = React.Children.toArray(children);

    return (
      <View style={style}>
        {title ? <Text style={styles.sectionHeader}>{title}</Text> : null}
        <View style={styles.androidSectionCard}>
          {childArray.map((child, index) => {
            const isLast = index === childArray.length - 1;
            return (
              <React.Fragment
                // eslint-disable-next-line react/no-array-index-key
                key={(child as React.ReactElement)?.key ?? `android-form-row-${index}`}
              >
                {child}
                {!isLast ? <View style={styles.androidDivider} /> : null}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <NativeFormSection title={title} style={sanitizeFallbackStyle(style)}>
      {children}
    </NativeFormSection>
  );
}

const MAX_FALLBACK_CARD_RADIUS = radii.md;

function sanitizeFallbackStyle(style?: StyleProp<ViewStyle>) {
  const flattened = StyleSheet.flatten(style);
  if (!flattened) {
    return style;
  }

  const sanitized: ViewStyle = { ...flattened };
  const radiusKeys: Array<
    | "borderRadius"
    | "borderTopLeftRadius"
    | "borderTopRightRadius"
    | "borderBottomLeftRadius"
    | "borderBottomRightRadius"
  > = [
    "borderRadius",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomLeftRadius",
    "borderBottomRightRadius",
  ];

  radiusKeys.forEach((key) => {
    const value = flattened[key];
    if (typeof value === "number" && value > MAX_FALLBACK_CARD_RADIUS) {
      sanitized[key] = MAX_FALLBACK_CARD_RADIUS;
    }
  });

  return sanitized;
}

const styles = StyleSheet.create({
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
    textTransform: "uppercase",
  },
  androidSectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: "hidden",
  },
  androidDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceBorder,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
});

