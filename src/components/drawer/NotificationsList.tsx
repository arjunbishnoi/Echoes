import EchoNotifItem from "@/components/notifications/EchoNotifItem";
// Using a larger custom spacer for notifications to increase vertical gap
import EmptyState from "@/components/ui/EmptyState";
import { useEchoStorage } from "@/hooks/useEchoStorage";
import { spacing } from "@/theme/theme";
import { useFriends } from "@/utils/friendContext";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

interface NotificationsListProps {
  type: "personal" | "social" | "all";
}

export default function NotificationsList({ type }: NotificationsListProps) {
  // For now, all tabs show the single social notification type we're building
  return <OnlySocialAddedItems />;
}

function OnlySocialAddedItems() {
  const router = useRouter();
  const { echoes } = useEchoStorage();
  const { friendsById } = useFriends();
  const social = echoes.filter((c) => c.collaboratorIds && c.collaboratorIds.length > 0).slice(0, 6);

  if (social.length === 0) {
    return (
      <EmptyState
        icon="people-outline"
        title="No collaborator activity"
        subtitle="Invite friends to echoes to see updates here."
      />
    );
  }

  return (
    <>
      {social.map((c, idx) => {
        const collaboratorProfiles =
          c.collaboratorIds?.map((id) => friendsById[id]).filter(Boolean) ?? [];
        const firstCollaborator = collaboratorProfiles[0];
        const friendName =
          firstCollaborator?.displayName ||
          collaboratorProfiles.map((profile) => profile.displayName).join(", ") ||
          c.ownerName ||
          "Collaborator";
        const friendAvatar =
          firstCollaborator?.photoURL ||
          c.ownerPhotoURL ||
          `https://picsum.photos/seed/friend-${c.id}-${idx}/100/100`;
        const handlePressFriend = () =>
          router.push({
            pathname: "/friend/[id]",
            params: {
              id: firstCollaborator?.id ?? "",
              name: friendName,
              avatar: friendAvatar,
            },
          });
        const handlePressEcho = () => router.push({ pathname: "/(main)/echo/[id]", params: { id: c.id } });
        const countAdded = c.media?.length ?? 0;
        const timestamp = new Date(Date.now() - (idx + 1) * 60 * 60 * 1000);
        let coverUri = c.imageUrl && c.imageUrl.length > 0 ? c.imageUrl : `https://picsum.photos/seed/echo-${c.id}-${idx}/600/400`;
        
        return (
          <React.Fragment key={`s-${c.id}`}>
            {idx > 0 ? <View style={{ height: spacing.lg }} /> : null}
            <EchoNotifItem
              actorAvatarUri={friendAvatar}
              coverUri={coverUri}
              displayName={friendName}
              count={countAdded}
              timestamp={timestamp}
              onPressAvatar={handlePressFriend}
              onPressContent={handlePressEcho}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}


