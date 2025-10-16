import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./storageKeys";

export const Storage = {
  // Generic get/set
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
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

