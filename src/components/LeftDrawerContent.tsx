import BottomGradient from "@/components/BottomGradient";
import NotificationsList from "@/components/drawer/NotificationsList";
import { ContentWidth, DrawerScroll } from "@/components/DrawerContentLayout";
import NotificationsBottomBar from "@/components/NotificationsBottomBar";
import RightDrawerSearchBar from "@/components/RightDrawerSearchBar";
import TopGradient from "@/components/TopGradient";
import { colors, sizes, spacing } from "@/theme/theme";
import type { NotifKey } from "@/types/notifications";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LeftDrawerContentProps = {
  insetTop: number;
};

function LeftDrawerContent({ insetTop }: LeftDrawerContentProps) {
  const insets = useSafeAreaInsets();
  const top = insetTop ?? insets.top;
  const [filter, setFilter] = useState<NotifKey>("all");
  const [query, setQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const scrollRef = useRef<any>(null);
  const topBarOffset = top;
  const topPadding = topBarOffset + sizes.floatingBar.height + spacing.xl + spacing.md;
  
  const leftTabTitle = (() => {
    if (query.trim().length > 0) return "Search Results";
    switch (filter) {
      case "friendRequests": return "Social";
      case "regular": return "Personal";
      case "all": return "All";
      default: return "All";
    }
  })();

  const mappedType: "personal" | "social" | "all" = (() => {
    if (filter === "friendRequests") return "social";
    if (filter === "regular") return "personal";
    return "all";
  })();

  return (
    <View style={styles.container}> 
      <DrawerScroll scrollRef={scrollRef} topPadding={topPadding} bottomPadding={sizes.list.bottomPadding} indicatorSide="right">
        <View style={styles.spacer} />
        <ContentWidth>
          <View style={{ height: spacing.xl }} />
          <NotificationsList type={mappedType} />
          <View style={{ height: spacing.xl }} />
        </ContentWidth>
      </DrawerScroll>
      <TopGradient safeTop={top - 10} />
      <View style={[styles.topBar, { top: topBarOffset }]}>
        <View style={styles.topBarRow}>
          <RightDrawerSearchBar
            title="Notifications"
            style={styles.searchBarFlex}
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
            <Pressable accessibilityRole="button" hitSlop={12} style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
            </Pressable>
          )}
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>{leftTabTitle}</Text>
        </View>
      </View>
      <BottomGradient />
      <NotificationsBottomBar
        active={filter}
        visible={query.trim().length === 0}
        onChange={(k) => {
          if (k === filter && scrollRef.current) {
            scrollRef.current.scrollTo({ y: 0, animated: true });
          }
          setFilter(k);
        }}
      />
    </View>
  );
}

export default memo(LeftDrawerContent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  spacer: {
    height: 0,
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
  headerRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBarFlex: {
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
  moreButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});