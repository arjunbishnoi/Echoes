import type { EchoActivity } from "@/types/echo";
import { ActivityStorage } from "@/utils/activityStorage";
import { useCallback, useState } from "react";

export function useEchoActivities(echoId?: string, options?: { defer?: boolean }) {
  const [isLoaded, setIsLoaded] = useState(!options?.defer);
  const [, forceUpdate] = useState(0);

  const refresh = useCallback(() => {
    forceUpdate((n) => n + 1);
  }, []);

  const load = useCallback(() => {
    if (!isLoaded) {
      setIsLoaded(true);
    }
  }, [isLoaded]);

  const getActivities = useCallback((): EchoActivity[] => {
    if (!isLoaded) return [];
    if (echoId) {
      return ActivityStorage.getByEchoId(echoId);
    }
    return ActivityStorage.getAll();
  }, [echoId, isLoaded]);

  return {
    activities: getActivities(),
    refresh,
    load,
    isLoaded,
  };
}

