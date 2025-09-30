import React, { Children, isValidElement, ReactElement } from "react";
import { Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, spacing } from "../theme/theme";

type FormSectionProps = {
  title?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function FormSection({ title, style, children }: FormSectionProps) {
  const childArray = Children.toArray(children);
  return (
    <View style={styles.sectionWrap}>
      {title ? <Text style={styles.sectionHeader}>{title}</Text> : null}
      <View style={[styles.card, style]}>
        {childArray.map((child, index) => {
          if (
            isValidElement(child) &&
            // @ts-expect-error displayName runtime check
            (child.type?.displayName === "FormRow" || child.type?.name === "FormRow")
          ) {
            const isLast = index === childArray.length - 1;
            return React.cloneElement(child as ReactElement, { isLast });
          }
          return child as ReactElement;
        })}
      </View>
    </View>
  );
}

type FormRowProps = {
  title: string;
  subtitle?: string;
  Left?: React.ReactNode;
  Right?: React.ReactNode;
  valueText?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  showChevron?: boolean;
  isLast?: boolean;
};

export function FormRow({
  title,
  subtitle,
  Left,
  Right,
  valueText,
  onPress,
  accessibilityLabel,
  showChevron,
  isLast,
}: FormRowProps) {
  const Container = onPress ? Pressable : View;
  return (
    <View>
      <Container
        onPress={onPress}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={accessibilityLabel}
        style={styles.row}
      >
        <View style={styles.rowLeftWrap}>
          {Left ? <View style={styles.leftIcon}>{Left}</View> : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{title}</Text>
            {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.rowRightWrap}>
          {valueText ? <Text style={styles.rowValue}>{valueText}</Text> : null}
          {Right ? <View style={{ marginLeft: spacing.sm }}>{Right}</View> : null}
          {showChevron ? (
            <Text style={styles.chevron}>{Platform.OS === "ios" ? "›" : ">"}</Text>
          ) : null}
        </View>
      </Container>
      {!isLast ? <View style={styles.separator} /> : null}
    </View>
  );
}

FormRow.displayName = "FormRow";

const styles = StyleSheet.create({
  sectionWrap: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.4,
    marginBottom: spacing.md,
    marginLeft: spacing.md,
    textTransform: "none",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    overflow: "hidden",
  },
  row: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeftWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  leftIcon: {
    marginRight: spacing.md,
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "400",
  },
  rowSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rowRightWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowValue: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: "400",
  },
  chevron: {
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    fontSize: 20,
    lineHeight: 20,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceBorder,
    marginLeft: 16,
  },
});


