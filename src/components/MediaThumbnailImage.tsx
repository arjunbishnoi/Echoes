import { colors } from "@/theme/theme";
import { Image as ExpoImage, type ImageProps } from "expo-image";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  uri?: string | null;
  fallbackUri?: string | null;
  style?: ImageProps["style"];
  contentFit?: ImageProps["contentFit"];
};

export function MediaThumbnailImage({ uri, fallbackUri, style, contentFit = "cover" }: Props) {
  const [useFallback, setUseFallback] = useState(false);

  const activeUri = !useFallback && uri ? uri : fallbackUri;

  if (!activeUri) {
    return <View style={[style, { backgroundColor: colors.surface }]} />;
  }

  return (
    <ExpoImage
      source={{ uri: activeUri }}
      style={style}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      transition={150}
      onError={() => {
        if (!useFallback && fallbackUri && fallbackUri !== uri) {
          setUseFallback(true);
        }
      }}
    />
  );
}



