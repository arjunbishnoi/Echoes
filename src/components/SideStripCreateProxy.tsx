import { sizes } from "@/theme/theme";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  side: "left" | "right";
  onPressCreate: () => void;
};

export default function SideStripCreateProxy({ side, onPressCreate }: Props) {
  const buttonSize = sizes.floatingBar.height;
  const bottomOffset = sizes.floatingBar.bottomOffset;
  const buttonCenterY = bottomOffset + (buttonSize / 2);
  const tapZoneHeight = buttonSize + 4;
  const tapZoneWidth = buttonSize + 4;
  const edgeDistance = 0;
  
  const positionStyle = side === "left" 
    ? { right: edgeDistance } 
    : { left: edgeDistance };
  
  const borderRadiusStyle = side === "left"
    ? { 
        borderTopLeftRadius: tapZoneHeight / 2,
        borderBottomLeftRadius: tapZoneHeight / 2,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }
    : { 
        borderTopRightRadius: tapZoneHeight / 2,
        borderBottomRightRadius: tapZoneHeight / 2,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      };
  
  return (
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onPressCreate();
        }}
        accessibilityRole="button"
        accessibilityLabel="Create new echo"
        style={[
          styles.createZone,
          positionStyle,
          borderRadiusStyle,
          { 
            width: tapZoneWidth,
            height: tapZoneHeight,
            bottom: buttonCenterY - (tapZoneHeight / 2),
            backgroundColor: 'transparent',
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 999,
  },
  createZone: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    elevation: 1000,
  },
});





