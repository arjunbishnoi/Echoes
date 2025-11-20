import { spacing } from "@/theme/theme";
import type { EchoActivity } from "@/types/echo";
import { StyleSheet, View } from "react-native";
import EchoNotifItem from "../notifications/EchoNotifItem";
import EmptyState from "../ui/EmptyState";

interface HistoryListProps {
  activities?: EchoActivity[];
}

function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const activityDate = new Date(date);
  const seconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

export default function HistoryList({ activities = [] }: HistoryListProps) {
  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="time-outline"
          title="No Activity Yet"
          subtitle="Echo activity will appear here"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activities.map((activity, index) => {
        const uniqueKey = activity.id || `history-${activity.timestamp}-${activity.userId || index}-${index}`;
        const isYou = activity.userName === "You";
        const actorAvatarUri =
          activity.userAvatar ||
          (isYou ? "https://picsum.photos/seed/user/100/100" : `https://picsum.photos/seed/${activity.userId}/100/100`);

        return (
          <View key={uniqueKey}>
            {index > 0 ? <View style={{ height: spacing.xl }} /> : null}
            <View style={styles.row}>
              <EchoNotifItem
                actorAvatarUri={actorAvatarUri}
                displayName={activity.userName}
                subtitleText={activity.description}
                timestamp={activity.timestamp}
                hideCover
                avatarSize={56}
                activityType={activity.type}
                mediaType={activity.mediaType}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    minHeight: 300,
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  row: {
    paddingVertical: 0,
  },
});


