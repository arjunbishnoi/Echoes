import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dummyCapsules } from "../data/dummyCapsules";
import { searchCapsules } from "../lib/echoes";
import { colors, sizes, spacing } from "../theme/theme";
import type { NotifKey } from "../types/notifications";
import BottomGradient from "./BottomGradient";
import { ContentWidth, DrawerScroll } from "./DrawerContentLayout";
import NotificationsBottomBar from "./NotificationsBottomBar";
import ProfileUpdateItem from "./ProfileUpdateItem";
import RightDrawerSearchBar from "./RightDrawerSearchBar";
import TopGradient from "./TopGradient";

type LeftDrawerContentProps = {
  insetTop: number;
};

export default function LeftDrawerContent({ insetTop }: LeftDrawerContentProps) {
  const insets = useSafeAreaInsets();
  const top = insetTop ?? insets.top;
  const [filter, setFilter] = React.useState<NotifKey>("all");
  const [query, setQuery] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const scrollRef = React.useRef<any>(null);
  const topBarOffset = top;
  const topPadding = topBarOffset + sizes.floatingBar.height + spacing.xl;
  const leftTabTitle = React.useMemo(() => {
    switch (filter) {
      case "friendRequests": return "Social";
      case "regular": return "Personal";
      case "all": return "All";
      default: return "All";
    }
  }, [filter]);
  return (
    <View style={[styles.container, { paddingTop: 0 }]}> 
      <DrawerScroll scrollRef={scrollRef} topPadding={topPadding} bottomPadding={sizes.list.bottomPadding} indicatorSide="right">
        <ContentWidth>
          <Text style={styles.sectionTitle}>{leftTabTitle}</Text>
        </ContentWidth>
        <View style={{ height: spacing.lg }} />
        <ContentWidth>
          {query.trim().length > 0 ? (
            <MemoQueryResults q={query} />
          ) : filter === "regular" ? (
            <MemoPersonalUpdates key="personal" />
          ) : filter === "friendRequests" ? (
            <MemoSocialUpdates key="social" />
          ) : (
            <MemoAllUpdates key="all" />
          )}
        </ContentWidth>
      </DrawerScroll>
      {/* Top overlay/blur mirrored from right drawer, rendered above content, with safe area blackout */}
      <TopGradient safeTop={top - 10} />
      {/* Top bar: search + Cancel like right drawer */}
      <View style={{ position: "absolute", left: 16, right: 16, top: topBarOffset }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <RightDrawerSearchBar
            title="Notifications"
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
              <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>Cancel</Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" hitSlop={12} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
            </Pressable>
          )}
        </View>
      </View>
      <BottomGradient />
      <NotificationsBottomBar
        active={filter}
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

function PersonalUpdates() {
  const aboutToChange: Array<{ kind: "lock" | "unlock"; title: string; coverUri: string }> = [];
  const lockedSoon = dummyCapsules.filter(c => c.status === "ongoing").slice(0, 2);
  const unlockedSoon = dummyCapsules.filter(c => c.status === "locked").slice(0, 2);
  lockedSoon.forEach(c => aboutToChange.push({ kind: "lock", title: c.title, coverUri: c.imageUrl }));
  unlockedSoon.forEach(c => aboutToChange.push({ kind: "unlock", title: c.title, coverUri: c.imageUrl }));
  return (
    <>
      {aboutToChange.map((n, idx) => (
        <React.Fragment key={`${n.kind}-${idx}`}>
          {idx > 0 ? <View style={{ height: spacing.xs }} /> : null}
          <ProfileUpdateItem kind={n.kind} title={n.title} coverUri={n.coverUri} />
        </React.Fragment>
      ))}
    </>
  );
}

function SocialUpdates() {
  const social = dummyCapsules.filter(c => (c.participants && c.participants.length > 1)).slice(0, 6);
  return (
    <>
      {social.map((c, idx) => {
        const friendName = `Friend ${idx + 1}`;
        const friendAvatar = `https://picsum.photos/seed/friend-${c.id}-${idx}/100/100`;
        const variant = idx % 4;
        return (
          <React.Fragment key={`s-${c.id}`}>
            {idx > 0 ? <View style={{ height: spacing.xs }} /> : null}
            {variant === 0 ? (
              <ProfileUpdateItem kind="friend_request" friendName={friendName} friendAvatarUri={friendAvatar} />
            ) : variant === 1 ? (
              <ProfileUpdateItem kind="friend_accepted" friendName={friendName} friendAvatarUri={friendAvatar} />
            ) : variant === 2 ? (
              <ProfileUpdateItem kind="friend_added_to_echo" friendName={friendName} friendAvatarUri={friendAvatar} echoTitle={c.title} coverUri={c.imageUrl} />
            ) : (
              <ProfileUpdateItem kind="friend_added_content" friendName={friendName} friendAvatarUri={friendAvatar} photosCount={(Number(c.id) % 5) + 1} coverUri={c.imageUrl} echoTitle={c.title} />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

const MemoPersonalUpdates = React.memo(PersonalUpdates);
const MemoSocialUpdates = React.memo(SocialUpdates);
const MemoAllUpdates = React.memo(function AllUpdates() {
  // Build personal + social items with pseudo-timestamps and sort desc
  type Item = { ts: number; node: React.ReactNode };
  const items: Item[] = [];
  let order = 1000;
  const pushGap = (key: string) => items.push({ ts: order--, node: <View key={key} style={{ height: spacing.xs }} /> });

  const personalLocks = dummyCapsules.filter(c => c.status === "ongoing").slice(0, 2);
  const personalUnlocks = dummyCapsules.filter(c => c.status === "locked").slice(0, 2);
  personalLocks.forEach((c, i) => {
    items.push({ ts: order--, node: <ProfileUpdateItem key={`pl-${c.id}-${i}`} kind="lock" title={c.title} coverUri={c.imageUrl} /> });
    pushGap(`gap-pl-${c.id}-${i}`);
  });
  personalUnlocks.forEach((c, i) => {
    items.push({ ts: order--, node: <ProfileUpdateItem key={`pu-${c.id}-${i}`} kind="unlock" title={c.title} coverUri={c.imageUrl} /> });
    pushGap(`gap-pu-${c.id}-${i}`);
  });

  const social = dummyCapsules.filter(c => (c.participants && c.participants.length > 1)).slice(0, 6);
  social.forEach((c, idx) => {
    const friendName = `Friend ${idx + 1}`;
    const friendAvatar = `https://picsum.photos/seed/friend-${c.id}-${idx}/100/100`;
    const variant = idx % 4;
    const key = `s-${c.id}-${variant}`;
    let node: React.ReactNode;
    if (variant === 0) node = <ProfileUpdateItem key={key} kind="friend_request" friendName={friendName} friendAvatarUri={friendAvatar} />;
    else if (variant === 1) node = <ProfileUpdateItem key={key} kind="friend_accepted" friendName={friendName} friendAvatarUri={friendAvatar} />;
    else if (variant === 2) node = <ProfileUpdateItem key={key} kind="friend_added_to_echo" friendName={friendName} friendAvatarUri={friendAvatar} echoTitle={c.title} coverUri={c.imageUrl} />;
    else node = <ProfileUpdateItem key={key} kind="friend_added_content" friendName={friendName} friendAvatarUri={friendAvatar} photosCount={(Number(c.id) % 5) + 1} coverUri={c.imageUrl} />;
    items.push({ ts: order--, node });
    pushGap(`gap-${key}`);
  });

  // Sort by ts desc (already descending due to order--), but keep logic for clarity
  const sorted = items.sort((a, b) => b.ts - a.ts);
  return <>{sorted.map(it => it.node)}</>;
});

function QueryResults({ q }: { q: string }) {
  const hits = React.useMemo(() => searchCapsules(dummyCapsules, q), [q]);
  return (
    <>
      {hits.map((c, idx) => (
        <React.Fragment key={`q-${c.id}`}>
          {idx > 0 ? <View style={{ height: spacing.sm - 30 }} /> : null}
          <ProfileUpdateItem kind="friend_added_content" friendName={c.title} friendAvatarUri={`https://picsum.photos/seed/q-${c.id}/100/100`} photosCount={(Number(c.id) % 5) + 1} coverUri={c.imageUrl} />
        </React.Fragment>
      ))}
    </>
  );
}

const MemoQueryResults = React.memo(QueryResults);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
});


