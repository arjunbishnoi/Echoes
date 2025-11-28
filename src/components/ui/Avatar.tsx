import { AVATAR_SIZE_MEDIUM } from "@/constants/dimensions";
import { colors } from "@/theme/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { StyleSheet, View, type ImageStyle, type ViewStyle } from "react-native";

interface AvatarProps {
  uri?: string;
  userId?: string;
  size?: number;
  style?: ImageStyle;
  borderWidth?: number;
  borderColor?: string;
  showFallback?: boolean; // Whether to show random image fallback or blank
}

export default function Avatar({
  uri,
  userId,
  size = AVATAR_SIZE_MEDIUM,
  style,
  borderWidth = 0,
  borderColor = "transparent",
  showFallback = false, // Default to blank, not random images
}: AvatarProps) {
  // If we have a URI, show the image
  if (uri) {
  return (
    <Image
      source={uri}
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
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
    />
    );
  }

  // If showFallback is true, show random image (for friends, etc.)
  if (showFallback && userId) {
    const fallbackUri = `https://picsum.photos/seed/${userId}/400/400`;
    return (
      <Image
        source={fallbackUri}
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
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />
    );
  }

  // Default: show blank placeholder with person icon
  return (
    <View
      style={[
        styles.avatar,
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor,
        },
        style as ImageStyle,
      ]}
    >
      <Ionicons 
        name="person" 
        size={size * 0.5} 
        color={colors.textSecondary} 
      />
    </View>
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
          showFallback={true} // For friend avatars, show fallback images
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
  placeholder: {
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stack: {
    flexDirection: "row",
    alignItems: "center",
  },
});


