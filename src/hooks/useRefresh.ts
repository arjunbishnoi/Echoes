import { useCallback, useState } from "react";

export function useRefresh(durationMs: number = 1200) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    const timeout = setTimeout(() => {
      setRefreshing(false);
    }, durationMs);
    return () => clearTimeout(timeout);
  }, [refreshing, durationMs]);

  return { refreshing, onRefresh } as const;
}


