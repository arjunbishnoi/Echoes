import BottomGradient from "@/components/BottomGradient";
import { ContentWidth, DrawerScroll } from "@/components/DrawerContentLayout";
import NotificationsBottomBar from "@/components/NotificationsBottomBar";
import ProfileUpdateItem from "@/components/ProfileUpdateItem";
import RightDrawerSearchBar from "@/components/RightDrawerSearchBar";
import TopGradient from "@/components/TopGradient";
import EmptyState from "@/components/ui/EmptyState";
import { useEchoStorage } from "@/hooks/useEchoStorage";
import { colors, sizes, spacing } from "@/theme/theme";
import type { NotifKey } from "@/types/notifications";
import { searchEchoes } from "@/utils/echoes";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Fragment, memo, useMemo, useRef, useState, type ReactNode } from "react";
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
  useEchoStorage();
  const scrollRef = useRef<any>(null);
  const topBarOffset = top;
  const topPadding = topBarOffset + sizes.floatingBar.height + spacing.xl;
  const leftTabTitle = useMemo(() => {
    if (query.trim().length > 0) return "Search Results";
    switch (filter) {
      case "friendRequests": return "Social";
      case "regular": return "Personal";
      case "all": return "All";
      default: return "All";
    }
  }, [filter, query]);
  return (
    <View style={styles.container}> 
      <DrawerScroll scrollRef={scrollRef} topPadding={topPadding} bottomPadding={sizes.list.bottomPadding} indicatorSide="right">
        <ContentWidth>
          <Text style={styles.sectionTitle}>{leftTabTitle}</Text>
        </ContentWidth>
        <View style={styles.spacer} />
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

function PersonalUpdates() {
  const { echoes } = useEchoStorage();
  const lockedSoon = echoes.filter(c => c.status === "ongoing").slice(0, 2);
  const unlockedSoon = echoes.filter(c => c.status === "locked").slice(0, 2);
  
  const aboutToChange = [
    ...lockedSoon.filter(c => c.imageUrl).map(c => ({ 
      kind: "lock" as const, 
      title: c.title, 
      coverUri: c.imageUrl!,
      participants: c.collaboratorIds,
      userAvatarUri: "https://picsum.photos/seed/user/100/100"
    })),
    ...unlockedSoon.filter(c => c.imageUrl).map(c => ({ 
      kind: "unlock" as const, 
      title: c.title, 
      coverUri: c.imageUrl!,
      participants: c.collaboratorIds,
      userAvatarUri: "https://picsum.photos/seed/user/100/100"
    }))
  ];
  
  if (aboutToChange.length === 0) {
    return (
      <EmptyState
        icon="notifications-outline"
        title="No Updates"
        subtitle="You'll see notifications about your echoes here"
      />
    );
  }
  
  return (
    <>
      {aboutToChange.map((n, idx) => (
        <Fragment key={`${n.kind}-${idx}`}>
          {idx > 0 && <View style={styles.itemSpacer} />}
          <ProfileUpdateItem 
            kind={n.kind} 
            title={n.title} 
            coverUri={n.coverUri}
            participants={n.participants}
            userAvatarUri={n.userAvatarUri}
          />
        </Fragment>
      ))}
    </>
  );
}

function SocialUpdates() {
  const router = useRouter();
  const { echoes } = useEchoStorage();
  const social = echoes.filter(c => (c.collaboratorIds && c.collaboratorIds.length > 0)).slice(0, 6);
  
  if (social.length === 0) {
    return (
      <EmptyState
        icon="people-outline"
        title="No Social Activity"
        subtitle="Friend notifications will appear here"
      />
    );
  }
  
  return (
    <>
      {social.map((c, idx) => {
        const friendId = String(idx + 1);
        const friendName = `Friend ${idx + 1}`;
        const friendAvatar = `https://picsum.photos/seed/friend-${c.id}-${idx}/100/100`;
        const variant = idx % 4;
        const handlePress = () => router.push({ pathname: "/friend/[id]", params: { id: friendId, name: friendName, avatar: friendAvatar } });
        
        return (
          <Fragment key={`s-${c.id}`}>
            {idx > 0 && <View style={styles.itemSpacer} />}
            {variant === 0 ? (
              <ProfileUpdateItem kind="friend_request" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} onPress={handlePress} />
            ) : variant === 1 ? (
              <ProfileUpdateItem kind="friend_accepted" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} onPress={handlePress} />
            ) : variant === 2 ? (
              <ProfileUpdateItem kind="friend_added_to_echo" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} echoTitle={c.title} coverUri={c.imageUrl} onPress={handlePress} />
            ) : (
              <ProfileUpdateItem kind="friend_added_content" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} photosCount={(Number(c.id) % 5) + 1} coverUri={c.imageUrl} echoTitle={c.title} onPress={handlePress} />
            )}
          </Fragment>
        );
      })}
    </>
  );
}

const MemoPersonalUpdates = memo(PersonalUpdates);
const MemoSocialUpdates = memo(SocialUpdates);
const MemoAllUpdates = memo(function AllUpdates() {
  const router = useRouter();
  const { echoes } = useEchoStorage();
  type Item = { ts: number; node: ReactNode };
  const items: Item[] = [];
  let order = 1000;
  const pushGap = (key: string) => items.push({ ts: order--, node: <View key={key} style={styles.itemSpacer} /> });

  const personalLocks = echoes.filter(c => c.status === "ongoing").slice(0, 2);
  const personalUnlocks = echoes.filter(c => c.status === "locked").slice(0, 2);
  personalLocks.forEach((c, i) => {
    items.push({ ts: order--, node: <ProfileUpdateItem key={`pl-${c.id}-${i}`} kind="lock" title={c.title} coverUri={c.imageUrl || ""} participants={c.collaboratorIds} userAvatarUri="https://picsum.photos/seed/user/100/100" /> });
    pushGap(`gap-pl-${c.id}-${i}`);
  });
  personalUnlocks.forEach((c, i) => {
    items.push({ ts: order--, node: <ProfileUpdateItem key={`pu-${c.id}-${i}`} kind="unlock" title={c.title} coverUri={c.imageUrl || ""} participants={c.collaboratorIds} userAvatarUri="https://picsum.photos/seed/user/100/100" /> });
    pushGap(`gap-pu-${c.id}-${i}`);
  });

  const social = echoes.filter(c => (c.collaboratorIds && c.collaboratorIds.length > 0)).slice(0, 6);
  
  if (items.length === 0 && social.length === 0) {
    return (
      <ContentWidth>
        <EmptyState
          icon="notifications-outline"
          title="No Notifications"
          subtitle="All your updates will appear here"
        />
      </ContentWidth>
    );
  }
  social.forEach((c, idx) => {
    const friendId = String(idx + 1);
    const friendName = `Friend ${idx + 1}`;
    const friendAvatar = `https://picsum.photos/seed/friend-${c.id}-${idx}/100/100`;
    const variant = idx % 4;
    const key = `s-${c.id}-${variant}`;
    const handlePress = () => router.push({ pathname: "/friend/[id]", params: { id: friendId, name: friendName, avatar: friendAvatar } });
    
    let node: ReactNode;
    if (variant === 0) node = <ProfileUpdateItem key={key} kind="friend_request" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} onPress={handlePress} />;
    else if (variant === 1) node = <ProfileUpdateItem key={key} kind="friend_accepted" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} onPress={handlePress} />;
    else if (variant === 2) node = <ProfileUpdateItem key={key} kind="friend_added_to_echo" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} echoTitle={c.title} coverUri={c.imageUrl || ""} onPress={handlePress} />;
    else node = <ProfileUpdateItem key={key} kind="friend_added_content" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} photosCount={(Number(c.id) % 5) + 1} coverUri={c.imageUrl || ""} onPress={handlePress} />;
    items.push({ ts: order--, node });
    pushGap(`gap-${key}`);
  });

  const sorted = items.sort((a, b) => b.ts - a.ts);
  return <>{sorted.map(it => it.node)}</>;
});

function QueryResults({ q }: { q: string }) {
  const { echoes } = useEchoStorage();
  const hits = useMemo(() => searchEchoes(echoes, q), [echoes, q]);
  
  if (hits.length === 0) {
    return (
      <EmptyState
        icon="search-outline"
        title="No Results"
        subtitle={`No echoes match "${q}"`}
      />
    );
  }
  
  return (
    <>
      {hits.map((c, idx) => (
        <Fragment key={`q-${c.id}`}>
          {idx > 0 && <View style={styles.itemSpacer} />}
          <ProfileUpdateItem kind="friend_added_content" friendName={c.title} friendAvatarUri={`https://picsum.photos/seed/q-${c.id}/100/100`} photosCount={(Number(c.id) % 5) + 1} coverUri={c.imageUrl || ""} />
        </Fragment>
      ))}
    </>
  );
}

const MemoQueryResults = memo(QueryResults);

export default memo(LeftDrawerContent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 0,
  },
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
  spacer: {
    height: spacing.lg,
  },
  itemSpacer: {
    height: spacing.xs,
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