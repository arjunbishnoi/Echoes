import type { EchoActivity } from "@/types/echo";

export type AggregatedActivity = {
  activity: EchoActivity;
  memoryCount?: number;
};

const DEFAULT_AGGREGATION_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

export function aggregateActivitiesForDisplay(
  activities: EchoActivity[],
  windowMs: number = DEFAULT_AGGREGATION_WINDOW_MS
): AggregatedActivity[] {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const aggregated: AggregatedActivity[] = [];

  for (const activity of sorted) {
    if (activity.type !== "media_uploaded") {
      aggregated.push({ activity });
      continue;
    }

    const lastGroup = aggregated[aggregated.length - 1];
    const activityTime = new Date(activity.timestamp).getTime();

    if (
      lastGroup &&
      lastGroup.activity.type === "media_uploaded" &&
      lastGroup.activity.echoId === activity.echoId &&
      lastGroup.activity.userId === activity.userId &&
      Math.abs(new Date(lastGroup.activity.timestamp).getTime() - activityTime) <= windowMs
    ) {
      lastGroup.memoryCount = (lastGroup.memoryCount ?? 1) + 1;
      continue;
    }

    aggregated.push({ activity, memoryCount: 1 });
  }

  return aggregated;
}



