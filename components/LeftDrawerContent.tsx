import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme/theme";
import { useRouter } from "expo-router";
import ProfileStatCard from "./ProfileStatCard";
import ProfileUpdateItem from "./ProfileUpdateItem";
import BottomGradient from "./BottomGradient";
import ProfileBottomBar from "./ProfileBottomBar";

type LeftDrawerContentProps = {
  insetTop: number;
};

export default function LeftDrawerContent({ insetTop }: LeftDrawerContentProps) {
  const insets = useSafeAreaInsets();
  const top = insetTop ?? insets.top;
  const router = useRouter();
  return (
    <View style={[styles.container, { paddingTop: top }]}> 
      <View style={{ flexDirection: "row", gap: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <ProfileStatCard icon="lock-closed-outline" value={21} label="Total Echoes" aspectRatio={1.2} onPress={() => router.push("/echoes")} />
        </View>
        <View style={{ flex: 1 }}>
          <ProfileStatCard icon="people-outline" value={10} label="Friends" aspectRatio={1.2} onPress={() => router.push("/friends")} />
        </View>
      </View>

      <View style={{ height: spacing.lg }} />
      <View style={{ flexDirection: "row", gap: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <ProfileStatCard icon="notifications-outline" value={6} label="Notifications" horizontal onPress={() => router.push("/notifications")} />
        </View>
      </View>

      <View style={{ height: spacing.xl }} />
      <Text style={styles.sectionTitle}>Updates</Text>
      <View style={{ height: spacing.lg }} />
      <ProfileUpdateItem
        avatarUri="https://i.pravatar.cc/100?img=48"
        name="Honey Singh"
        text="added 3 photos to Happy Birthday!"
        rightThumbUri="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=300&auto=format&fit=crop"
      />

      <BottomGradient />
      <ProfileBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
});


