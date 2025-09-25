import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dummyCapsules } from "../data/dummyCapsules";
import { computeCapsuleProgressPercent, filterCapsulesByStatus, searchCapsules, type CapsuleFilter } from "../lib/echoes";
import { sizes, spacing } from "../theme/theme";
import BottomGradient from "./BottomGradient";
import { ContentWidth, DrawerScroll } from "./DrawerContentLayout";
import LibraryBottomBar from "./LibraryBottomBar";
import LibraryItem from "./LibraryItem";
import RightDrawerSearchBar from "./RightDrawerSearchBar";
import TopGradient from "./TopGradient";

type RightDrawerContentProps = {
  insetTop: number;
};

export default function RightDrawerContent({ insetTop }: RightDrawerContentProps) {
  const insets = useSafeAreaInsets();
  const top = insetTop ?? insets.top;
  const [filter, setFilter] = React.useState<CapsuleFilter>("recent");
  const [query, setQuery] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const router = useRouter();
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
      {(() => {
        const all = dummyCapsules; // sorted desc by id
        const pushEcho = (id: string, title: string, imageUrl?: string, subtitle?: string) => {
          if (isDraggingRef.current) return;
          router.push({ pathname: "/echo/[id]", params: { id, title, imageUrl: imageUrl ?? "", subtitle: subtitle ?? "" } });
        };

        const filtered = React.useMemo(() => filterCapsulesByStatus(all, filter), [all, filter]);
        const searched = React.useMemo(() => searchCapsules(all, query), [all, query]);
        const listToRender = query.trim().length > 0 ? searched : filtered;

        const renderList = (list: typeof all, opts?: { locked?: boolean; completed?: boolean }) => (
          <ContentWidth>
            {list.map((c, idx) => {
              const locked = opts?.locked ?? c.status === "locked";
              const completed = opts?.completed ?? c.status === "unlocked";
              const progressVal = completed ? 1 : computeCapsuleProgressPercent(c);
              return (
                <React.Fragment key={`${query ? "q" : filter}-${c.id}`}>
                  {idx > 0 ? <View style={{ height: sizes.list.itemSpacing }} /> : null}
                  <LibraryItem
                    title={c.title}
                    thumbnailUri={c.imageUrl}
                    progress={progressVal}
                    locked={locked}
                    completed={completed}
                    textColor={completed ? "#EAEAEA" : undefined}
                    onPress={() => pushEcho(c.id, c.title, c.imageUrl, c.description)}
                  />
                </React.Fragment>
              );
            })}
          </ContentWidth>
        );

        if (query.trim().length > 0) return renderList(listToRender);

        if (filter === "all") {
          const ongoing = filterCapsulesByStatus(all, "recent");
          const locked = filterCapsulesByStatus(all, "locked");
          const unlocked = filterCapsulesByStatus(all, "completed");
          return (
            <>
              {renderList(ongoing)}
              <View style={{ height: sizes.list.itemSpacing }} />
              {renderList(locked, { locked: true })}
              <View style={{ height: sizes.list.itemSpacing }} />
              {renderList(unlocked, { completed: true })}
            </>
          );
        }

        return renderList(listToRender);
      })()}
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
              <Pressable accessibilityRole="button" hitSlop={12} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
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


