import EchoNotifItem from "@/components/notifications/EchoNotifItem";
import EmptyState from "@/components/ui/EmptyState";
import { useEchoActivities } from "@/hooks/useEchoActivities";
import { useEchoStorage } from "@/hooks/useEchoStorage";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { spacing } from "@/theme/theme";
import { useAuth } from "@/utils/authContext";
import { useFriends } from "@/utils/friendContext";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

interface NotificationsListProps {
  type: "personal" | "social" | "all";
  query?: string;
}

export default function NotificationsList({ type, query = "" }: NotificationsListProps) {
  const isSocialTab = type === "social";
  const isPersonalTab = type === "personal";
  const isAllTab = type === "all";

  // For the "All" tab, we want a single empty state when there are no notifications at all.
  // We consider only the activity types that actually render in this list.
  const { activities } = useEchoActivities();
  const { incomingRequests, acceptedOutgoing } = useFriendRequests();
  const trimmedQuery = query.trim().toLowerCase();
  const hasAnyRelevantForAll =
    activities.some(
      (activity) =>
        activity.type === "media_uploaded" ||
        activity.type === "collaborator_added" ||
        activity.type === "echo_locking_soon" ||
        activity.type === "echo_unlocking_soon"
    ) || incomingRequests.length > 0 || acceptedOutgoing.length > 0;
  const showAllEmptyState = isAllTab && !trimmedQuery.length && !hasAnyRelevantForAll;

  if (showAllEmptyState) {
    return (
      <EmptyState
        icon="notifications-outline"
        title="No notifications yet"
        subtitle="Updates from friends and echoes will appear here."
      />
    );
  }

  return (
    <>
      {(isSocialTab || isAllTab) && (
        <OnlySocialNotifications showEmptyState={isSocialTab} query={query} />
      )}
      {(isPersonalTab || isAllTab) && (
        <PersonalNotifications showEmptyState={isPersonalTab} query={query} />
      )}
      {!isSocialTab && !isPersonalTab && !isAllTab && (
        <EmptyState
          icon="notifications-outline"
          title="No notifications yet"
          subtitle="Updates from friends and echoes will appear here."
        />
      )}
    </>
  );
}

type CollaboratorProps = {
  showEmptyState: boolean;
  query?: string;
};

function OnlySocialNotifications({ showEmptyState, query = "" }: CollaboratorProps) {
  const router = useRouter();
  const { activities } = useEchoActivities();
  const { friendsById } = useFriends();
  const { getEchoById } = useEchoStorage();
  const { user } = useAuth();
  const { incomingRequests, acceptedOutgoing } = useFriendRequests();

  const trimmedQuery = query.trim().toLowerCase();
  type SocialItem =
    | { kind: "friendRequest"; request: import("@/types/user").FriendRequest; timestamp: number }
    | { kind: "friendAccepted"; request: import("@/types/user").FriendRequest; timestamp: number }
    | { kind: "echo"; activity: import("@/types/echo").EchoActivity; timestamp: number };

  const items: SocialItem[] = [];

  // 1) Friend request notifications (social)
  incomingRequests
    .filter((req) => req.status === "pending")
    .forEach((req) => {
      const name = (req.fromDisplayName ?? "").toLowerCase();
      const username = (req.fromUsername ?? "").toLowerCase();
      if (
        trimmedQuery.length &&
        !(
          (name && name.includes(trimmedQuery)) ||
          (username && username.includes(trimmedQuery))
        )
      ) {
        return;
      }
      const ts = new Date(req.createdAt ?? new Date().toISOString()).getTime();
      items.push({ kind: "friendRequest", request: req, timestamp: ts });
    });

  // 2) Friend request accepted notifications (someone accepted a request I sent)
  acceptedOutgoing.forEach((req) => {
    const ts = new Date(req.updatedAt ?? req.createdAt ?? new Date().toISOString()).getTime();
    items.push({ kind: "friendAccepted", request: req, timestamp: ts });
  });

  // 3) Echo-related social notifications (media uploads, collaborator_added, collaborative time-status)
  activities.forEach((activity) => {
    // Skip my own actions for friend-activity types
    if (activity.userId === user?.id && (activity.type === "media_uploaded" || activity.type === "collaborator_added")) {
      return;
    }

    const isTimeStatus =
      activity.type === "echo_locking_soon" || activity.type === "echo_unlocking_soon";

    // Only consider activity types that are social
    if (
      activity.type !== "media_uploaded" &&
      activity.type !== "collaborator_added" &&
      !isTimeStatus
    ) {
      return;
    }

    const echo = getEchoById(activity.echoId);
    if (!echo) return;

    // For time-based notifications in social: only collaborative/shared echoes
    if (isTimeStatus) {
      const isPrivateEcho = echo.isPrivate || echo.shareMode === "private";
      const isCollaborativeEcho = !isPrivateEcho && (echo.collaboratorIds?.length ?? 0) > 0;
      if (!isCollaborativeEcho) return;
    }

    // Apply text search filter (by friend name, echo title, or activity description)
    if (trimmedQuery.length) {
      const echoTitle = echo.title?.toLowerCase() ?? "";
      const actorProfile =
        !isTimeStatus && activity.userId ? friendsById[activity.userId] : undefined;
      const actorName = isTimeStatus
        ? echoTitle
        : (activity.userName || actorProfile?.displayName || "").toString().toLowerCase();
      const description = (activity.description ?? "").toString().toLowerCase();

      const matches =
        (echoTitle && echoTitle.includes(trimmedQuery)) ||
        (actorName && actorName.includes(trimmedQuery)) ||
        (description && description.includes(trimmedQuery));

      if (!matches) return;
    }

    const ts = new Date(activity.timestamp as any).getTime();
    items.push({ kind: "echo", activity, timestamp: ts });
  });

  // Sort all social items purely by time (newest first)
  items.sort((a, b) => b.timestamp - a.timestamp);

  const hasAnyResults = items.length > 0;

  if (!hasAnyResults) {
    // If there's no search query, fall back to the original "no activity" empty state
    if (!trimmedQuery.length) {
    return showEmptyState ? (
      <EmptyState
        icon="image-outline"
        title="No collaborator activity"
        subtitle="Invite friends to echoes to see updates here."
        />
      ) : null;
    }

    // If there *is* a query, show a search-focused empty state
    return showEmptyState ? (
      <EmptyState
        icon="image-outline"
        title="No notifications found"
        subtitle="Try a different name or echo title."
      />
    ) : null;
  }

  return (
    <>
      {items.slice(0, 20).map((item, idx) => {
        const showSpacer = idx > 0;

        if (item.kind === "friendRequest") {
          const { request } = item;
          const displayName = request.fromDisplayName ?? "New friend";
          const avatarUri =
            request.fromPhotoURL ||
            `https://picsum.photos/seed/${request.fromUserId}/200/200`;

          const handlePressFriendRequest = () => {
            router.push({
              pathname: "/friend/[id]",
              params: {
                id: request.fromUserId,
                name: displayName,
                avatar: avatarUri,
              },
            });
          };

          return (
            <React.Fragment key={`fr-${request.id}`}>
              {showSpacer ? <View style={{ height: spacing.lg }} /> : null}
              <EchoNotifItem
                actorAvatarUri={avatarUri}
                displayName={displayName}
                subtitleText="New friend request"
                timestamp={request.createdAt}
                onPressContent={handlePressFriendRequest}
                hideCover={false}
                coverHeight={34}
                avatarSize={34}
                avatarGap={10}
                badgeVariant="new"
                showRightArrow
              />
            </React.Fragment>
          );
        }

        if (item.kind === "friendAccepted") {
          const { request } = item;
          const friendId = request.toUserId;
          const friendProfile = friendsById[friendId];
          const displayName = friendProfile?.displayName ?? "New friend";
          const avatarUri =
            friendProfile?.photoURL ||
            `https://picsum.photos/seed/${friendId}/200/200`;

          const handlePressFriend = () => {
            router.push({
              pathname: "/friend/[id]",
              params: {
                id: friendId,
                name: displayName,
                avatar: avatarUri,
              },
            });
          };

          return (
            <React.Fragment key={`fra-${request.id}`}>
              {showSpacer ? <View style={{ height: spacing.lg }} /> : null}
              <EchoNotifItem
                actorAvatarUri={avatarUri}
                displayName={displayName}
                subtitleText="accepted your request."
                timestamp={request.updatedAt ?? request.createdAt}
                onPressContent={handlePressFriend}
                hideCover={false}
                coverHeight={34}
                avatarSize={34}
                avatarGap={10}
                badgeVariant="new"
                showRightArrow
              />
            </React.Fragment>
          );
        }

        const { activity } = item;
        const echo = getEchoById(activity.echoId);
        if (!echo) return null;

        const isMemoryUpload = activity.type === "media_uploaded";
        const isCollaboratorAdded = activity.type === "collaborator_added";
        const isTimeStatus =
          activity.type === "echo_locking_soon" || activity.type === "echo_unlocking_soon";

        // Resolve actor details
        const actorProfile =
          !isTimeStatus && activity.userId ? friendsById[activity.userId] : undefined;
        const actorName = isTimeStatus
          ? echo.title
          : activity.userName || actorProfile?.displayName || "Someone";
        const actorAvatar =
          isTimeStatus
            ? undefined
            : activity.userAvatar ||
              actorProfile?.photoURL ||
              `https://picsum.photos/seed/${activity.userId}/100/100`;

        const handlePressFriend = () => {
          if (activity.userId) {
            router.push({
              pathname: "/friend/[id]",
              params: {
                id: activity.userId,
                name: actorName,
                avatar: actorAvatar,
              },
            });
          }
        };
        const handlePressEcho = () =>
          router.push({ pathname: "/(main)/echo/[id]", params: { id: echo.id } });
        
        const coverUri =
          echo.imageUrl && echo.imageUrl.length > 0
            ? echo.imageUrl
            : `https://picsum.photos/seed/echo-${echo.id}/600/400`;
        
        return (
          <React.Fragment key={`act-${activity.id}-${idx}`}>
            {showSpacer ? <View style={{ height: spacing.lg }} /> : null}
            <EchoNotifItem
              actorAvatarUri={actorAvatar}
              coverUri={coverUri}
              displayName={actorName}
              subtitleText={
                isCollaboratorAdded
                  ? "created an echo."
                  : isTimeStatus
                    ? activity.type === "echo_locking_soon"
                      ? "will be locked soon."
                      : "unlocks soon."
                    : undefined
              }
              count={isMemoryUpload ? 1 : undefined}
              timestamp={activity.timestamp}
              onPressAvatar={handlePressFriend}
              onPressContent={handlePressEcho}
              coverHeight={34}
              avatarSize={34}
              activityType={activity.type}
              avatarGap={10}
              badgeVariant={isCollaboratorAdded ? "new" : isTimeStatus ? undefined : "count"}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}

function PersonalNotifications({ showEmptyState, query = "" }: CollaboratorProps) {
  const router = useRouter();
  const { activities } = useEchoActivities();
  const { getEchoById } = useEchoStorage();

  // Only lock/unlock soon notifications for private echoes (personal)
  const timeStatusActivities = activities.filter((activity) => {
    return activity.type === "echo_locking_soon" || activity.type === "echo_unlocking_soon";
  });

  const items = timeStatusActivities
    .map((activity) => {
      const echo = getEchoById(activity.echoId);
      if (!echo) return null;

      const isPrivateEcho = echo.isPrivate || echo.shareMode === "private";
      if (!isPrivateEcho) return null;

      return { activity, echo };
    })
    .filter((x): x is { activity: any; echo: any } => x != null)
    .sort((a, b) => {
      const timeA = new Date(a.activity.timestamp).getTime();
      const timeB = new Date(b.activity.timestamp).getTime();
      return timeB - timeA;
    });

  const trimmedQuery = query.trim().toLowerCase();
  const filteredItems = trimmedQuery.length
    ? items.filter(({ activity, echo }) => {
        const title = (echo.title ?? "").toString().toLowerCase();
        const description = (activity.description ?? "").toString().toLowerCase();
        return (
          (title && title.includes(trimmedQuery)) ||
          (description && description.includes(trimmedQuery))
        );
      })
    : items;

  if (filteredItems.length === 0) {
    // If there's no search query, show the original personal-empty copy
    if (!trimmedQuery.length) {
      return showEmptyState ? (
        <EmptyState
          icon="lock-closed"
          title="No personal updates"
          subtitle="Lock and unlock reminders for your private echoes will appear here."
        />
      ) : null;
    }

    // If there *is* a query, show the search empty state for personal tab
    return showEmptyState ? (
      <EmptyState
        icon="lock-closed"
        title="No notifications found"
        subtitle="Try a different echo name."
      />
    ) : null;
  }

  return (
    <>
      {filteredItems.slice(0, 10).map(({ activity, echo }, idx) => {
        const isLockSoon = activity.type === "echo_locking_soon";
        const title = echo.title ?? "Echo";
        const coverUri =
          echo.imageUrl && echo.imageUrl.length > 0
            ? echo.imageUrl
            : `https://picsum.photos/seed/echo-${echo.id}/600/400`;

        const handlePressEcho = () =>
          router.push({ pathname: "/(main)/echo/[id]", params: { id: echo.id } });

        return (
          <React.Fragment key={`personal-${activity.id}`}>
            {idx > 0 ? <View style={{ height: spacing.lg }} /> : null}
            <EchoNotifItem
              actorAvatarUri={undefined}
              coverUri={coverUri}
              displayName={title}
              subtitleText={isLockSoon ? "will be locked soon." : "unlocks soon."}
              timestamp={new Date(activity.timestamp)}
              onPressContent={handlePressEcho}
              coverHeight={34}
              avatarSize={34}
              activityType={activity.type}
              avatarGap={10}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}


