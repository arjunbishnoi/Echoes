import { colors, spacing } from "@/theme/theme";
import type { EchoActivity } from "@/types/echo";
import { Image, StyleSheet, Text, View } from "react-native";
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
        const isUser = activity.userName === "You";
        const uniqueKey = activity.id || `history-${activity.timestamp}-${activity.userId || index}-${index}`;

        return (
          <View key={uniqueKey} style={styles.item}>
            <View style={styles.avatar}>
              <Image
                source={{ 
                  uri: activity.userAvatar || 
                    (isUser ? "https://picsum.photos/seed/user/100/100" : `https://picsum.photos/seed/${activity.userId}/100/100`)
                }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.text}>
                <Text style={styles.friendName}>{activity.userName}</Text> {activity.description}
              </Text>
              <Text style={styles.time}>{getTimeAgo(activity.timestamp)}</Text>
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
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl + spacing.xl + 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceBorder,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 2,
  },
  friendName: {
    fontWeight: "600",
  },
  time: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});


