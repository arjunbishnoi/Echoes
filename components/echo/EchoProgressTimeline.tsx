import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/theme";
import { AvatarStack } from "../ui/Avatar";
import PrivateBadge from "../ui/PrivateBadge";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";

interface EchoProgressTimelineProps {
  startDate: Date;
  endDate?: Date | null;
  progress: number; // 0..1
  participants?: string[]; // Avatar URLs
  status?: "ongoing" | "locked" | "unlocked";
  isPrivate?: boolean; // Whether the echo is private or shared
}

export default function EchoProgressTimeline({ startDate, endDate, progress, participants, status = "ongoing", isPrivate = false }: EchoProgressTimelineProps) {
  const hasCollaborators = !isPrivate && participants && participants.length > 0;
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.date}>{formatDate(startDate)}</Text>
        <ProgressBar
          progress={progress || 0}
          height={6}
          trackColor="rgba(255,255,255,0.2)"
          progressColor="rgba(255,255,255,0.5)"
          style={styles.track}
          useFrostedMaterial={true}
        />
        <Text style={styles.date}>{endDate ? formatDate(endDate) : "-"}</Text>
      </View>
      
      {/* Status and Private/Avatar badges below progress bar */}
      <View style={styles.badgeRow}>
        <StatusBadge status={status} size={40} />
        <View style={styles.badgeSpacer} />
        {hasCollaborators ? (
          <AvatarStack uris={participants} maxVisible={5} size={40} spacing={8} />
        ) : isPrivate ? (
          <PrivateBadge size={40} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  track: {
    flex: 2,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.8,
    minWidth: 50,
  },
  badgeRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSpacer: {
    width: spacing.sm,
  },
});


