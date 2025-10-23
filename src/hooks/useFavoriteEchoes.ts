import { Storage } from "@/utils/asyncStorage";
import { useCallback, useEffect, useState } from "react";

export function useFavoriteEchoes() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await Storage.getFavorites();
        if (stored) {
          setFavoriteIds(new Set(stored));
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load favorite echoes:", error);
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const persist = async () => {
      try {
        await Storage.setFavorites(Array.from(favoriteIds));
      } catch (error) {
        console.error("Failed to persist favorite echoes:", error);
      }
    };
    persist();
  }, [favoriteIds, isLoaded]);

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  const toggleFavorite = useCallback((id: string): void => {
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const sortWithFavorites = useCallback(
    <T extends { id: string }>(items: T[]): T[] => {
      const favorited = items.filter((item) => favoriteIds.has(item.id));
      const unfavorited = items.filter((item) => !favoriteIds.has(item.id));
      return [...favorited, ...unfavorited];
    },
    [favoriteIds]
  );

  return {
    isFavorite,
    toggleFavorite,
    sortWithFavorites,
    favoriteCount: favoriteIds.size,
  };
}

