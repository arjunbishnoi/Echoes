import BottomGradient from "@/components/BottomGradient";
import LibraryList from "@/components/drawer/LibraryList";
import { ContentWidth, DrawerScroll } from "@/components/DrawerContentLayout";
import LibraryBottomBar from "@/components/LibraryBottomBar";
import RightDrawerSearchBar from "@/components/RightDrawerSearchBar";
import TopGradient from "@/components/TopGradient";
import { useEchoStorage } from "@/hooks/useEchoStorage";
import { colors, sizes, spacing } from "@/theme/theme";
import { type EchoFilterType } from "@/utils/echoes";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RightDrawerContentProps = {
  insetTop: number;
};

export default function RightDrawerContent({ insetTop }: RightDrawerContentProps) {
  const insets = useSafeAreaInsets();
  const top = insetTop ?? insets.top;
  const [filter, setFilter] = useState<EchoFilterType>("recent");
  const [query, setQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  useEchoStorage();
  const isDraggingRef = useRef(false);
  const scrollRef = useRef<any>(null);
  const topBarOffset = top;
  const topPadding = topBarOffset + sizes.floatingBar.height + spacing.xl;
  const rightTabTitle = useMemo(() => {
    if (query.trim().length > 0) return "Search Results";
    switch (filter) {
      case "recent": return "Ongoing";
      case "locked": return "Locked";
      case "completed": return "Unlocked";
      case "all": return "All";
      default: return "Ongoing";
    }
  }, [filter, query]);

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
        query={query}
        onItemPress={(id) => {
          if (isDraggingRef.current) return;
          router.push({ pathname: "/(main)/echo/[id]", params: { id } });
        }}
      />
      </DrawerScroll>

      {/* Top overlay/blur mirrored from bottom, rendered above content, with safe area blackout */}
      <TopGradient safeTop={top - 10} />
      <BottomGradient />
      {/* Replace top bar with search bar and add right-side icons */}
      <View style={[styles.topBar, { top: topBarOffset }]}>
        <View style={styles.topBarRow}>
          <RightDrawerSearchBar
            style={styles.searchBar}
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
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          ) : (
            <View style={styles.headerRight}>
              <Pressable 
                accessibilityRole="button" 
                hitSlop={12} 
                style={styles.iconButton}
                onPress={() => router.push("/favorites" as Href)}
              >
                <Ionicons name="heart" size={24} color={colors.textPrimary} />
              </Pressable>
              <Pressable 
                accessibilityRole="button" 
                hitSlop={12} 
                style={styles.iconButton}
              >
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
          )}
        </View>
      </View>
      {query.trim().length === 0 && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 0,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  topBarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    marginRight: spacing.md,
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 4,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});


