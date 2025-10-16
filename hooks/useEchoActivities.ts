import { useCallback, useState } from "react";
import { ActivityStorage } from "../lib/activityStorage";
import type { EchoActivity } from "../types/echo";

export function useEchoActivities(echoId?: string) {
  const [, forceUpdate] = useState(0);

  const refresh = useCallback(() => {
    forceUpdate((n) => n + 1);
  }, []);

  const getActivities = useCallback((): EchoActivity[] => {
    if (echoId) {
      return ActivityStorage.getByEchoId(echoId);
    }
    return ActivityStorage.getAll();
  }, [echoId]);

  return {
    activities: getActivities(),
    refresh,
  };
}

