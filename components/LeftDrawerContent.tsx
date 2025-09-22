import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing, sizes } from "../theme/theme";
import { useRouter } from "expo-router";
import ProfileStatCard from "./ProfileStatCard";
import ProfileUpdateItem from "./ProfileUpdateItem";
import BottomGradient from "./BottomGradient";
import ProfileBottomBar from "./ProfileBottomBar";
import { DrawerScroll, ContentWidth } from "./DrawerContentLayout";

type LeftDrawerContentProps = {
  insetTop: number;
};

export default function LeftDrawerContent({ insetTop }: LeftDrawerContentProps) {
  const insets = useSafeAreaInsets();
  const top = insetTop ?? insets.top;
  const router = useRouter();
  return (
    <View style={[styles.container, { paddingTop: top }]}> 
      <DrawerScroll bottomPadding={sizes.list.bottomPadding} indicatorSide="right">
        <View style={{ flexDirection: "row", gap: spacing.lg }}>
          <View style={{ flex: 1 }}>
            <ProfileStatCard icon="lock-closed-outline" value={21} label="Total Echoes" aspectRatio={1.2} onPress={() => router.push("/echoes")} />
          </View>
          <View style={{ flex: 1 }}>
            <ProfileStatCard icon="people-outline" value={10} label="Friends" aspectRatio={1.2} onPress={() => router.push("/friends")} />
          </View>
        </View>

        <View style={{ height: spacing.lg }} />
        
        <View style={{ height: spacing.xl }} />
        <ContentWidth>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={{ height: spacing.lg }} />
          {Array.from({ length: 20 }).map((_, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 ? <View style={{ height: spacing.lg }} /> : null}
              <ProfileUpdateItem
                avatarUri={`https://i.pravatar.cc/100?img=${(48 + idx) % 70}`}
                name={idx % 2 === 0 ? "Honey Singh" : "Arjun Bishnoi"}
                text={idx % 3 === 0 ? "added 3 photos to Happy Birthday!" : idx % 3 === 1 ? "commented on World Cup Final 2025" : "reacted to your echo"}
                rightThumbUri={idx % 2 === 0 ? "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=300&auto=format&fit=crop" : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=300&auto=format&fit=crop"}
              />
            </React.Fragment>
          ))}
        </ContentWidth>
      </DrawerScroll>
      <BottomGradient />
      <ProfileBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 0,
  },
  // Scroll area spans full drawer width; content is constrained to bar width
  scroll: {
    alignSelf: "stretch",
  },
  contentWidth: {
    alignSelf: "stretch",
    marginHorizontal: 16,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
});


