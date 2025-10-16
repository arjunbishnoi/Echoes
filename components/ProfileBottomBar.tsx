import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, sizes } from "../theme/theme";
import BottomBarBackground from "./BottomBarBackground";

type Props = {
  onPressSettings?: () => void;
  showSettings?: boolean;
  trailingAccessory?: React.ReactNode;
};

function ProfileBottomBar({ onPressSettings, showSettings = true, trailingAccessory }: Props) {
  const router = useRouter();
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.row} pointerEvents="box-none">
        <View style={styles.bar}>
          <BottomBarBackground />
          <View style={styles.profileLeft}>
            <Image source={{ uri: "https://i.pravatar.cc/100?img=12" }} style={styles.avatar} />
            <Text style={styles.name}>Arjun Bishnoi</Text>
          </View>
          <Pressable onPress={() => router.push("/profile-modal")} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} accessibilityRole="button" />
          {showSettings ? (
            <Pressable onPress={onPressSettings} style={styles.settingsBtn} accessibilityRole="button">
              <Ionicons name="settings-outline" size={24} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
        {trailingAccessory ? <View style={styles.trailing}>{trailingAccessory}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: sizes.floatingBar.bottomOffset,
    alignItems: "center",
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  bar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    height: sizes.floatingBar.height,
    borderRadius: radii.pill,
    // match FloatingBottomBar width for consistent content width target
    alignSelf: "stretch",
    paddingLeft: 0,
    paddingRight: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  avatar: {
    width: sizes.floatingBar.height,
    height: sizes.floatingBar.height,
    borderRadius: sizes.floatingBar.height / 2,
    marginRight: 12,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  settingsBtn: {
    width: sizes.floatingBar.sideButtonSize,
    height: sizes.floatingBar.sideButtonSize,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  trailing: {
    width: sizes.floatingBar.sideButtonSize,
    height: sizes.floatingBar.sideButtonSize,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});


