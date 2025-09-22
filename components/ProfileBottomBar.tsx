import React from "react";
import { View, Pressable, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomBarBackground from "./BottomBarBackground";
import { useRouter } from "expo-router";
import { colors, radii, sizes } from "../theme/theme";

type Props = {
  onPressSettings?: () => void;
};

export default function ProfileBottomBar({ onPressSettings }: Props) {
  const router = useRouter();
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        <BottomBarBackground />
        <View style={styles.profileLeft}>
          <Image source={{ uri: "https://i.pravatar.cc/100?img=12" }} style={styles.avatar} />
          <Text style={styles.name}>Arjun Bishnoi</Text>
        </View>
        <Pressable onPress={() => router.push("/profile-modal")} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} accessibilityRole="button" />
        <Pressable onPress={onPressSettings} style={styles.settingsBtn} accessibilityRole="button">
          <Ionicons name="settings-outline" size={24} color={colors.white} />
        </Pressable>
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
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    height: sizes.floatingBar.height,
    borderRadius: radii.pill,
    // match FloatingBottomBar width for consistent content width target
    alignSelf: "stretch",
    marginHorizontal: 16,
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
});


