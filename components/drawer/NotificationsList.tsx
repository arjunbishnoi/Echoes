import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useEchoStorage } from "../../hooks/useEchoStorage";
import { spacing } from "../../theme/theme";
import ProfileUpdateItem from "../ProfileUpdateItem";
import EmptyState from "../ui/EmptyState";

interface NotificationsListProps {
  type: "personal" | "social" | "all";
}

export default function NotificationsList({ type }: NotificationsListProps) {
  if (type === "personal") {
    return <PersonalUpdates />;
  } else if (type === "social") {
    return <SocialUpdates />;
  } else {
    return <AllUpdates />;
  }
}

function PersonalUpdates() {
  const { echoes } = useEchoStorage();
  const lockedSoon = echoes.filter((c) => c.status === "ongoing").slice(0, 2);
  const unlockedSoon = echoes.filter((c) => c.status === "locked").slice(0, 2);
  
  const aboutToChange = [
    ...lockedSoon.map((c) => ({ 
      kind: "lock" as const, 
      title: c.title, 
      coverUri: c.imageUrl || "",
      participants: c.collaboratorIds,
      userAvatarUri: "https://picsum.photos/seed/user/100/100"
    })),
    ...unlockedSoon.map((c) => ({ 
      kind: "unlock" as const, 
      title: c.title, 
      coverUri: c.imageUrl || "",
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
        <React.Fragment key={`${n.kind}-${idx}`}>
          {idx > 0 ? <View style={{ height: spacing.xs }} /> : null}
          <ProfileUpdateItem 
            kind={n.kind} 
            title={n.title} 
            coverUri={n.coverUri}
            participants={n.participants}
            userAvatarUri={n.userAvatarUri}
          />
        </React.Fragment>
      ))}
    </>
  );
}

function SocialUpdates() {
  const router = useRouter();
  const { echoes } = useEchoStorage();
  const social = echoes.filter((c) => c.collaboratorIds && c.collaboratorIds.length > 0).slice(0, 6);

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
          <React.Fragment key={`s-${c.id}`}>
            {idx > 0 ? <View style={{ height: spacing.xs }} /> : null}
            {variant === 0 ? (
              <ProfileUpdateItem 
                kind="friend_request" 
                friendName={friendName} 
                friendAvatarUri={friendAvatar}
                friendId={friendId}
                onPress={handlePress}
              />
            ) : variant === 1 ? (
              <ProfileUpdateItem 
                kind="friend_accepted" 
                friendName={friendName} 
                friendAvatarUri={friendAvatar}
                friendId={friendId}
                onPress={handlePress}
              />
            ) : variant === 2 ? (
              <ProfileUpdateItem
                kind="friend_added_to_echo"
                friendName={friendName}
                friendAvatarUri={friendAvatar}
                friendId={friendId}
                echoTitle={c.title}
                coverUri={c.imageUrl || ""}
                onPress={handlePress}
              />
            ) : (
              <ProfileUpdateItem
                kind="friend_added_content"
                friendName={friendName}
                friendAvatarUri={friendAvatar}
                friendId={friendId}
                photosCount={(Number(c.id) % 5) + 1}
                coverUri={c.imageUrl || ""}
                echoTitle={c.title}
                onPress={handlePress}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

function AllUpdates() {
  const router = useRouter();
  const { echoes } = useEchoStorage();
  type Item = { ts: number; node: React.ReactNode };
  const items: Item[] = [];
  let order = 1000;
  const pushGap = (key: string) => items.push({ ts: order--, node: <View key={key} style={{ height: spacing.xs }} /> });

  const personalLocks = echoes.filter((c) => c.status === "ongoing").slice(0, 2);
  const personalUnlocks = echoes.filter((c) => c.status === "locked").slice(0, 2);
  personalLocks.forEach((c, i) => {
    items.push({ 
      ts: order--, 
      node: <ProfileUpdateItem 
        key={`pl-${c.id}-${i}`} 
        kind="lock" 
        title={c.title} 
        coverUri={c.imageUrl || ""}
        participants={c.collaboratorIds}
        userAvatarUri="https://picsum.photos/seed/user/100/100"
      /> 
    });
    pushGap(`gap-pl-${c.id}-${i}`);
  });
  personalUnlocks.forEach((c, i) => {
    items.push({ 
      ts: order--, 
      node: <ProfileUpdateItem 
        key={`pu-${c.id}-${i}`} 
        kind="unlock" 
        title={c.title} 
        coverUri={c.imageUrl || ""}
        participants={c.collaboratorIds}
        userAvatarUri="https://picsum.photos/seed/user/100/100"
      /> 
    });
    pushGap(`gap-pu-${c.id}-${i}`);
  });

  const social = echoes.filter((c) => c.collaboratorIds && c.collaboratorIds.length > 1).slice(0, 6);
  
  if (items.length === 0 && social.length === 0) {
    return (
      <EmptyState
        icon="notifications-outline"
        title="No Notifications"
        subtitle="All your updates will appear here"
      />
    );
  }
  
  social.forEach((c, idx) => {
    const friendId = String(idx + 1);
    const friendName = `Friend ${idx + 1}`;
    const friendAvatar = `https://picsum.photos/seed/friend-${c.id}-${idx}/100/100`;
    const variant = idx % 4;
    const key = `s-${c.id}-${variant}`;
    const handlePress = () => router.push({ pathname: "/friend/[id]", params: { id: friendId, name: friendName, avatar: friendAvatar } });
    
    let node: React.ReactNode;
    if (variant === 0) node = <ProfileUpdateItem key={key} kind="friend_request" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} onPress={handlePress} />;
    else if (variant === 1) node = <ProfileUpdateItem key={key} kind="friend_accepted" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} onPress={handlePress} />;
    else if (variant === 2)
      node = (
        <ProfileUpdateItem key={key} kind="friend_added_to_echo" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} echoTitle={c.title} coverUri={c.imageUrl || ""} onPress={handlePress} />
      );
    else node = <ProfileUpdateItem key={key} kind="friend_added_content" friendName={friendName} friendAvatarUri={friendAvatar} friendId={friendId} photosCount={(Number(c.id) % 5) + 1} coverUri={c.imageUrl || ""} onPress={handlePress} />;
    items.push({ ts: order--, node });
    pushGap(`gap-${key}`);
  });

  const sorted = items.sort((a, b) => b.ts - a.ts);
  return <>{sorted.map((it) => it.node)}</>;
}

const styles = StyleSheet.create({});


