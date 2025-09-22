import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import { sizes, colors } from "../theme/theme";

// Mirror of BottomGradient, but anchored to the top edge and visually inverted
const FLOATING_BAR_HEIGHT = sizes.floatingBar.height;
const FLOATING_BAR_BOTTOM_OFFSET = sizes.floatingBar.bottomOffset;
const EXTRA_TOP_GRADIENT = 25; // extend a bit further down
const BLUR_INTENSITY = 16;
const FEATHER_HEIGHT = 36;
const BOTTOM_BOOST_HEIGHT = 25; // reused for a top boost here
const CORNER_FEATHER_SIZE = 36;

export default function TopGradient({ safeTop = 0 }: { safeTop?: number }) {
  const height = FLOATING_BAR_BOTTOM_OFFSET + FLOATING_BAR_HEIGHT + EXTRA_TOP_GRADIENT;
  const Masked: any = MaskedView;
  const midHeight = Math.round(height * 0.9);

  return (
    <View pointerEvents="none" style={[styles.container, { height }]}> 
      {/* Top boost: slightly stronger blur and darker overlay near the very top to soften notches/punch-holes */}
      {safeTop > 0 ? (
        <>
          <BlurView
            intensity={BLUR_INTENSITY + 12}
            tint="dark"
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: safeTop + 10 }}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0)"]}
            locations={[0, 1]}
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: safeTop + 12 }}
          />
        </>
      ) : null}
      {/* Flip content vertically to invert the visual effect */}
      <View style={{ transform: [{ scaleY: -1 }], flex: 1 }}>
        {/* Masked blur for a smooth onset (now at the bottom due to flip) */}
        <Masked
          style={StyleSheet.absoluteFill}
          maskElement={
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,1)"]}
              locations={[0, 1]}
              style={{ position: "absolute", left: 0, right: 0, top: 0, height: FEATHER_HEIGHT }}
            />
          }
        >
          <BlurView
            intensity={BLUR_INTENSITY}
            tint="dark"
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: FEATHER_HEIGHT }}
          />
        </Masked>
        <BlurView
          intensity={BLUR_INTENSITY}
          tint="dark"
          style={{ position: "absolute", left: 0, right: 0, top: FEATHER_HEIGHT, bottom: 0 }}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)", colors.background]}
          locations={[0, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Use boost at what is visually the top edge after flip */}
        <LinearGradient
          colors={["rgba(0,0,0,0)", colors.background]}
          locations={[0, 1]}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BOTTOM_BOOST_HEIGHT }}
        />
        {/* Corner feathers (also inverted by flip) */}
        <LinearGradient
          colors={[colors.background, "rgba(0,0,0,0)"]}
          locations={[0, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{ position: "absolute", left: 0, bottom: 0, width: CORNER_FEATHER_SIZE, height: CORNER_FEATHER_SIZE }}
        />
        <LinearGradient
          colors={[colors.background, "rgba(0,0,0,0)"]}
          locations={[0, 1]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={{ position: "absolute", right: 0, bottom: 0, width: CORNER_FEATHER_SIZE, height: CORNER_FEATHER_SIZE }}
        />
      </View>

      {/* Extra darkening towards the very top: stronger from midway up */}
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.62)"]}
        locations={[0, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: midHeight }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
});


