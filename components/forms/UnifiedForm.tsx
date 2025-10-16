import React from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import { getExpoSwiftUI } from "../../lib/expoUi";
import { FormSection as NativeFormSection } from "../IOSForm";

type UnifiedFormSectionProps = {
  title?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * Unified FormSection that automatically uses SwiftUI on iOS when available,
 * or falls back to native FormSection on Android/Web
 */
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

  return (
    <NativeFormSection title={title} style={style}>
      {children}
    </NativeFormSection>
  );
}

