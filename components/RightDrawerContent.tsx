import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomGradient from "./BottomGradient";
import LibraryBottomBar from "./LibraryBottomBar";
import LibraryItem from "./LibraryItem";
import { spacing, sizes } from "../theme/theme";
import { useRouter } from "expo-router";
import TopGradient from "./TopGradient";
import RightDrawerSearchBar from "./RightDrawerSearchBar";
import { Ionicons } from "@expo/vector-icons";
import { DrawerScroll, ContentWidth } from "./DrawerContentLayout";

type RightDrawerContentProps = {
  insetTop: number;
};

export default function RightDrawerContent({ insetTop }: RightDrawerContentProps) {
  const insets = useSafeAreaInsets();
  const top = insetTop ?? insets.top;
  const [filter, setFilter] = React.useState<"recent" | "locked" | "completed" | "all">("recent");
  const router = useRouter();
  const isDraggingRef = React.useRef(false);
  const topBarOffset = top;
  const topPadding = topBarOffset + sizes.floatingBar.height + spacing.xl;
  return (
    <View style={[styles.container, { paddingTop: 0 }]}> 
      <DrawerScroll
        topPadding={topPadding}
        bottomPadding={sizes.list.bottomPadding}
        indicatorSide="right"
        onScrollBeginDrag={() => { isDraggingRef.current = true; }}
        onScrollEndDrag={() => { setTimeout(() => { isDraggingRef.current = false; }, 100); }}
      >
      {(() => {
        const pushEcho = (idx: number, title: string, imageUrl?: string, subtitle?: string) => {
          if (isDraggingRef.current) return;
          router.push({ pathname: "/echo/[id]", params: { id: String(idx), title, imageUrl: imageUrl ?? "", subtitle: subtitle ?? "" } });
        };

        const adjectives = ["Golden", "Silent", "Crimson", "Azure", "Emerald", "Velvet", "Echoing", "Hidden", "Wild", "Faded", "Neon", "Dusty"];
        const nouns = ["Horizon", "Memory", "Whisper", "Journey", "Harbor", "Forest", "Skyline", "Cascade", "Lantern", "Prairie", "Valley", "Monsoon"];
        const makeTitle = (seed: number) => `${adjectives[seed % adjectives.length]} ${nouns[seed % nouns.length]}`;
        const coverFor = (seed: number) => `https://picsum.photos/seed/echo-${filter}-${seed}/300/200`;

        const count = 10;
        const nodes: React.ReactNode[] = [];
        for (let i = 0; i < count; i++) {
          const title = makeTitle(i + 7);
          const img = coverFor(i + 31);
          const isLocked = filter === "locked" || (filter === "all" && i % 3 === 0);
          const isCompleted = (!isLocked) && (filter === "completed" || (filter === "all" && i % 3 === 1));
          const progressVal = isCompleted ? 1 : ((i * 3) % 10) / 10;
          const opts: Partial<React.ComponentProps<typeof LibraryItem>> = {
            thumbnailUri: img,
            progress: progressVal,
            locked: isLocked,
            completed: isCompleted,
            textColor: isCompleted ? "#EAEAEA" : undefined,
          };
          nodes.push(
            <React.Fragment key={`${filter}-${i}`}>
              {i > 0 ? <View style={{ height: sizes.list.itemSpacing }} /> : null}
              <LibraryItem
                title={title}
                {...opts}
                onPress={() => pushEcho(i + 1, title, img, `From ${filter} tab`)}
                style={{}}
              />
            </React.Fragment>
          );
        }
        return (
          <ContentWidth>
            {nodes}
          </ContentWidth>
        );
      })()}
      </DrawerScroll>

      {/* Top overlay/blur mirrored from bottom, rendered above content, with safe area blackout */}
      <TopGradient safeTop={top - 10} />
      <BottomGradient />
      {/* Replace top bar with search bar and add right-side icons */}
      <View style={{ position: "absolute", left: 16, right: 16, top: topBarOffset }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <RightDrawerSearchBar style={{ flex: 1, marginRight: spacing.md }} />
          <Pressable accessibilityRole="button" hitSlop={12} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="heart" size={20} color="#ffffff" />
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={12} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", marginLeft: spacing.sm }}>
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>
      <LibraryBottomBar anchor="bottom" active={filter} onChange={setFilter} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 0,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
});


