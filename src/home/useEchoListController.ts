import { useEchoActivities } from "@/hooks/useEchoActivities";
import { useEchoStorage } from "@/hooks/useEchoStorage";
import { useFavoriteEchoes } from "@/hooks/useFavoriteEchoes";
import { useHomeEchoes } from "@/hooks/useHomeEchoes";
import { usePinnedEchoes } from "@/hooks/usePinnedEchoes";
import type { Echo } from "@/types/echo";
import { useMemo } from "react";
import { buildLastActivityIndex } from "./activityIndex";

export function useEchoListController() {
  const { echoes } = useEchoStorage();
  const { isPinned } = usePinnedEchoes();
  const { isFavorite } = useFavoriteEchoes();
  const { filterVisibleEchoes } = useHomeEchoes();
  const { activities } = useEchoActivities(undefined, { defer: false });

  const orderedEchoes: Echo[] = useMemo(() => {
    const visible = filterVisibleEchoes(echoes);
    if (visible.length === 0) return [];

    const lastIndex = buildLastActivityIndex(visible, activities);

    const pinned: Echo[] = [];
    const unpinned: Echo[] = [];
    for (const e of visible) {
      if (isPinned(e.id)) pinned.push(e);
      else unpinned.push(e);
    }

    // Keep pinned order stable by their own last activity (or createdAt) to avoid jitter
    pinned.sort((a, b) => {
      const ta = lastIndex[a.id] ?? 0;
      const tb = lastIndex[b.id] ?? 0;
      return tb - ta;
    });

    // Sort the rest by last activity desc
    unpinned.sort((a, b) => {
      const ta = lastIndex[a.id] ?? 0;
      const tb = lastIndex[b.id] ?? 0;
      return tb - ta;
    });

    return [...pinned, ...unpinned];
  }, [echoes, activities, filterVisibleEchoes, isPinned]);

  const byId = useMemo(() => {
    const map: Record<string, {
      isPinned: boolean;
      isFavorite: boolean;
      status: "ongoing" | "locked" | "unlocked" | undefined;
      isPrivate: boolean | undefined;
    }> = {};
    for (const e of orderedEchoes) {
      map[e.id] = {
        isPinned: isPinned(e.id),
        isFavorite: isFavorite(e.id),
        status: e.status,
        isPrivate: e.isPrivate,
      };
    }
    return map;
  }, [orderedEchoes, isPinned, isFavorite]);

  return {
    orderedEchoes,
    byId,
  };
}


