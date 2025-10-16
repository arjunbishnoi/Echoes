import { Image, StyleSheet, View } from "react-native";
import { HERO_HEIGHT, HERO_IMAGE_MARGIN_TOP } from "../../constants/dimensions";
import { spacing } from "../../theme/theme";

interface EchoHeroImageProps {
  imageUrl?: string;
  sharedTag: string;
}

export default function EchoHeroImage({ imageUrl, sharedTag }: EchoHeroImageProps) {
  return (
    <View style={styles.container}>
      <Image
        source={imageUrl ? { uri: imageUrl } : undefined}
        resizeMode="cover"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    position: "relative",
    marginTop: spacing.xl + HERO_IMAGE_MARGIN_TOP,
    marginHorizontal: spacing.lg,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
});


