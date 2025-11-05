import { HERO_HEIGHT, HERO_IMAGE_MARGIN_TOP } from "@/constants/dimensions";
import { spacing } from "@/theme/theme";
import { Image, StyleSheet, View } from "react-native";

interface EchoHeroImageProps {
  imageUrl?: string;
}

function EchoHeroImage({ imageUrl }: EchoHeroImageProps) {
  return (
    <View style={styles.container}>
      <Image
        key={imageUrl}
        source={imageUrl ? { uri: imageUrl, cache: 'force-cache' } : undefined}
        resizeMode="cover"
        style={styles.image}
        fadeDuration={0}
      />
    </View>
  );
}

export default EchoHeroImage;

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    position: "relative",
    marginTop: spacing.xl + HERO_IMAGE_MARGIN_TOP,
    marginHorizontal: spacing.lg,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 24,
    elevation: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
});


