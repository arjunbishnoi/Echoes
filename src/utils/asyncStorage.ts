import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./storageKeys";

const STORAGE_PREFIX = "@echoes";
let currentNamespace = "anon";

const namespacedKey = (key: string) => `${STORAGE_PREFIX}:${currentNamespace}:${key}`;

export const Storage = {
  setNamespace(namespace?: string) {
    currentNamespace = namespace ? `user:${namespace}` : "anon";
  },

  getNamespace(): string {
    return currentNamespace;
  },

  // Generic get/set
  async get<T>(key: string): Promise<T | null> {
    const finalKey = namespacedKey(key);
    try {
      const value = await AsyncStorage.getItem(finalKey);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    const finalKey = namespacedKey(key);
    try {
      await AsyncStorage.setItem(finalKey, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    const finalKey = namespacedKey(key);
    try {
      await AsyncStorage.removeItem(finalKey);
      return true;
    } catch {
      return false;
    }
  },

  // Echo-specific
  getEchoes: () => Storage.get(STORAGE_KEYS.ECHOES),
  setEchoes: (data: any) => Storage.set(STORAGE_KEYS.ECHOES, data),

  getActivities: () => Storage.get(STORAGE_KEYS.ACTIVITIES),
  setActivities: (data: any) => Storage.set(STORAGE_KEYS.ACTIVITIES, data),

  getPinned: () => Storage.get<string[]>(STORAGE_KEYS.PINNED),
  setPinned: (data: string[]) => Storage.set(STORAGE_KEYS.PINNED, data),

  getHiddenFromHome: () => Storage.get<string[]>(STORAGE_KEYS.HIDDEN_FROM_HOME),
  setHiddenFromHome: (data: string[]) => Storage.set(STORAGE_KEYS.HIDDEN_FROM_HOME, data),

  getFavorites: () => Storage.get<string[]>(STORAGE_KEYS.FAVORITES),
  setFavorites: (data: string[]) => Storage.set(STORAGE_KEYS.FAVORITES, data),
};

