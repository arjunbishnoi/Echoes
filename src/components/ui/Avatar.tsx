import { Image, StyleSheet, View, type ImageStyle, type ViewStyle } from "react-native";
import { AVATAR_SIZE_MEDIUM } from "@/constants/dimensions";

interface AvatarProps {
  uri: string;
  size?: number;
  style?: ImageStyle;
  borderWidth?: number;
  borderColor?: string;
}

export default function Avatar({
  uri,
  size = AVATAR_SIZE_MEDIUM,
  style,
  borderWidth = 0,
  borderColor = "transparent",
}: AvatarProps) {
  return (
    <Image
      source={{ uri }}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor,
        },
        style as ImageStyle,
      ]}
    />
  );
}

interface AvatarStackProps {
  uris: string[];
  size?: number;
  maxVisible?: number;
  overlapRatio?: number;
  spacing?: number; // Spacing between avatars when not overlapping (set to disable overlap)
  style?: ViewStyle;
}

export function AvatarStack({
  uris,
  size = AVATAR_SIZE_MEDIUM,
  maxVisible = 5,
  overlapRatio = 0.4,
  spacing,
  style,
}: AvatarStackProps) {
  const visibleUris = uris.slice(0, maxVisible);
  
  // If spacing is defined, use it instead of overlap
  const useSpacing = spacing !== undefined;
  
  return (
    <View style={[styles.stack, { height: size, gap: useSpacing ? spacing : undefined }, style]}>
      {visibleUris.map((uri, idx, arr) => (
        <Avatar
          key={`avatar-${idx}`}
          uri={uri}
          size={size}
          style={{
            ...(useSpacing ? {} : idx > 0 ? ({ marginLeft: -size * overlapRatio } as ImageStyle) : {}),
            zIndex: (arr.length - idx) as unknown as number,
          } as ImageStyle}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#333",
  },
  stack: {
    flexDirection: "row",
    alignItems: "center",
  },
});


