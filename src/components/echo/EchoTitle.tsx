import { colors } from "@/theme/theme";
import { memo } from "react";
import { StyleSheet, Text, type LayoutChangeEvent } from "react-native";

interface EchoTitleProps {
  title: string;
  onLayout?: (event: LayoutChangeEvent) => void;
}

function EchoTitle({ title, onLayout }: EchoTitleProps) {
  return (
    <Text style={styles.title} onLayout={onLayout}>
      {title}
    </Text>
  );
}

export default memo(EchoTitle);

const styles = StyleSheet.create({
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
});


