import type { User } from "@/types/user";
import { UserService } from "@/utils/services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

type ProfileSnapshot = Pick<User, "id" | "displayName" | "username" | "photoURL">;

const CACHE_KEY = "collaborator_profiles_cache_v1";

const profileCache = new Map<string, ProfileSnapshot | null>();
const listeners = new Set<() => void>();
const pendingFetches = new Map<string, Promise<void>>();
let cacheHydrated = false;
let hydratePromise: Promise<void> | null = null;
let persistTimeout: ReturnType<typeof setTimeout> | null = null;

function notifyListeners() {
  listeners.forEach((listener) => {
    listener();
  });
}

async function persistCache() {
  try {
    const serializable: Record<string, ProfileSnapshot> = {};
    profileCache.forEach((value, key) => {
      if (value) {
        serializable[key] = value;
      }
    });
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(serializable));
  } catch {
    // Best effort persistence
  }
}

function schedulePersist() {
  if (persistTimeout) return;
  persistTimeout = setTimeout(() => {
    persistTimeout = null;
    void persistCache();
  }, 250);
}

async function hydrateCache() {
  if (cacheHydrated) return;
  if (hydratePromise) {
    await hydratePromise;
    return;
  }
  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, ProfileSnapshot>;
        Object.entries(parsed).forEach(([id, snapshot]) => {
          profileCache.set(id, snapshot);
        });
      }
    } catch {
      // Ignore hydration failures
    } finally {
      cacheHydrated = true;
      hydratePromise = null;
      notifyListeners();
    }
  })();
  await hydratePromise;
}

async function fetchProfile(id: string) {
  if (pendingFetches.has(id)) return;
  const promise = (async () => {
    try {
      await hydrateCache();
      const profile = await UserService.getUser(id);
      if (profile) {
        profileCache.set(id, {
          id: profile.id,
          displayName: profile.displayName,
          username: profile.username,
          photoURL: profile.photoURL,
        });
      } else {
        profileCache.set(id, null);
      }
      schedulePersist();
    } catch {
      // Ignore fetch failure, will retry on next request
    } finally {
      pendingFetches.delete(id);
      notifyListeners();
    }
  })();
  pendingFetches.set(id, promise);
}

export function useUserProfiles(ids: string[]) {
  const key = useMemo(() => ids.filter(Boolean).sort(), [ids]);
  const [version, setVersion] = useState(0);

  const handleUpdate = useCallback(() => {
    setVersion((n) => n + 1);
  }, []);

  useEffect(() => {
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, [handleUpdate]);

  useEffect(() => {
    void hydrateCache();
  }, []);

  useEffect(() => {
    key.forEach((id) => {
      if (!profileCache.has(id)) {
        void fetchProfile(id);
      }
    });
  }, [key]);

  const signature = useMemo(() => key.join("|"), [key]);

  const data = useMemo(() => {
    const snapshot: Record<string, ProfileSnapshot> = {};
    key.forEach((id) => {
      const profile = profileCache.get(id);
      if (profile) {
        snapshot[id] = profile;
      }
    });
    return snapshot;
  }, [key, signature, version]);

  return data;
}

