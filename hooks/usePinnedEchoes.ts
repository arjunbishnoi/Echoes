import { useCallback, useEffect, useState } from "react";
import { Storage } from "../lib/asyncStorage";

export function usePinnedEchoes() {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await Storage.getPinned();
        if (stored) {
          setPinnedIds(new Set(stored));
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load pinned echoes:", error);
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  // Persist to storage whenever pinnedIds changes
  useEffect(() => {
    if (!isLoaded) return;
    const persist = async () => {
      try {
        await Storage.setPinned(Array.from(pinnedIds));
      } catch (error) {
        console.error("Failed to persist pinned echoes:", error);
      }
    };
    persist();
  }, [pinnedIds, isLoaded]);

  const isPinned = useCallback((id: string) => pinnedIds.has(id), [pinnedIds]);

  const togglePin = useCallback((id: string): boolean => {
    let success = true;
    setPinnedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        // Max 2 pins
        if (newSet.size >= 2) {
          success = false;
          return prev; // Don't change state
        }
        newSet.add(id);
      }
      return newSet;
    });
    return success;
  }, []);

  const sortWithPinned = useCallback(
    <T extends { id: string }>(items: T[]): T[] => {
      const pinned = items.filter((item) => pinnedIds.has(item.id));
      const unpinned = items.filter((item) => !pinnedIds.has(item.id));
      return [...pinned, ...unpinned];
    },
    [pinnedIds]
  );

  return {
    isPinned,
    togglePin,
    sortWithPinned,
    pinnedCount: pinnedIds.size,
  };
}

