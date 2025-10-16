import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEchoStorage } from "../hooks/useEchoStorage";
import { type EchoFilterType } from "../lib/echoes";
import { sizes, spacing } from "../theme/theme";
import BottomGradient from "./BottomGradient";
import LibraryList from "./drawer/LibraryList";
import { ContentWidth, DrawerScroll } from "./DrawerContentLayout";
import LibraryBottomBar from "./LibraryBottomBar";
import RightDrawerSearchBar from "./RightDrawerSearchBar";
import TopGradient from "./TopGradient";

type RightDrawerContentProps = {
  insetTop: number;
};

export default function RightDrawerContent({ insetTop }: RightDrawerContentProps) {
  const insets = useSafeAreaInsets();
  const top = insetTop ?? insets.top;
  const [filter, setFilter] = React.useState<EchoFilterType>("recent");
  const [query, setQuery] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const router = useRouter();
  useEchoStorage();
  const isDraggingRef = React.useRef(false);
  const scrollRef = React.useRef<any>(null);
  const topBarOffset = top;
  const topPadding = topBarOffset + sizes.floatingBar.height + spacing.xl;
  const rightTabTitle = React.useMemo(() => {
    switch (filter) {
      case "recent": return "Ongoing";
      case "locked": return "Locked";
      case "completed": return "Unlocked";
      case "all": return "All";
      default: return "Ongoing";
    }
  }, [filter]);
  return (
    <View style={[styles.container, { paddingTop: 0 }]}> 
      <DrawerScroll
        scrollRef={scrollRef}
        topPadding={topPadding}
        bottomPadding={sizes.list.bottomPadding}
        indicatorSide="right"
        onScrollBeginDrag={() => { isDraggingRef.current = true; }}
        onScrollEndDrag={() => { setTimeout(() => { isDraggingRef.current = false; }, 100); }}
      >
      <ContentWidth>
        <Text style={styles.title}>{rightTabTitle}</Text>
      </ContentWidth>
      <View style={{ height: spacing.lg }} />
      <LibraryList
        filter={query.trim().length > 0 ? "all" : filter}
        onItemPress={(id, title, imageUrl, subtitle) => {
          if (isDraggingRef.current) return;
          router.push({ pathname: "/echo/[id]", params: { id, title, imageUrl: imageUrl ?? "", subtitle: subtitle ?? "" } });
        }}
      />
      </DrawerScroll>

      {/* Top overlay/blur mirrored from bottom, rendered above content, with safe area blackout */}
      <TopGradient safeTop={top - 10} />
      <BottomGradient />
      {/* Replace top bar with search bar and add right-side icons */}
      <View style={{ position: "absolute", left: 16, right: 16, top: topBarOffset }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <RightDrawerSearchBar
            style={{ flex: 1, marginRight: spacing.md }}
            value={query}
            onChangeText={setQuery}
            isEditing={isEditing}
            onFocus={() => setIsEditing(true)}
            onBlur={() => {}}
          />
          {isEditing ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => { setQuery(""); setIsEditing(false); }}
              style={{ paddingHorizontal: 8, paddingVertical: 8 }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "700" }}>Cancel</Text>
            </Pressable>
          ) : (
            <>
              <Pressable 
                accessibilityRole="button" 
                hitSlop={12} 
                style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
                onPress={() => router.push("/favorites")}
              >
                <Ionicons name="heart" size={20} color="#ffffff" />
              </Pressable>
              <Pressable accessibilityRole="button" hitSlop={12} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", marginLeft: spacing.sm }}>
                <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
              </Pressable>
            </>
          )}
        </View>
      </View>
      <LibraryBottomBar
        anchor="bottom"
        active={filter}
        onChange={(key) => {
          if (key === filter && scrollRef.current) {
            scrollRef.current.scrollTo({ y: 0, animated: true });
          }
          setFilter(key);
        }}
      />
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


