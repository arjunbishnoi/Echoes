import { useCallback, useEffect, useState } from "react";
import { Storage } from "../lib/asyncStorage";

export function useHomeEchoes() {
  // Track which echoes are visible on home screen
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await Storage.getHiddenFromHome();
        if (stored) {
          setHiddenIds(new Set(stored));
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load hidden echoes:", error);
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  // Persist to storage whenever hiddenIds changes
  useEffect(() => {
    if (!isLoaded) return;
    const persist = async () => {
      try {
        await Storage.setHiddenFromHome(Array.from(hiddenIds));
      } catch (error) {
        console.error("Failed to persist hidden echoes:", error);
      }
    };
    persist();
  }, [hiddenIds, isLoaded]);

  const isVisibleOnHome = useCallback((id: string) => !hiddenIds.has(id), [hiddenIds]);

  const removeFromHome = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, []);

  const addToHome = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const filterVisibleEchoes = useCallback(
    <T extends { id: string }>(items: T[]): T[] => {
      return items.filter((item) => !hiddenIds.has(item.id));
    },
    [hiddenIds]
  );

  return {
    isVisibleOnHome,
    removeFromHome,
    addToHome,
    filterVisibleEchoes,
  };
}

