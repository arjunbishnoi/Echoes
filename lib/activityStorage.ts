import type { EchoActivity } from "../types/echo";
import { Storage } from "./asyncStorage";

// In-memory cache for activities
let activitiesCache: EchoActivity[] = [];
let isInitialized = false;

export const ActivityStorage = {
  // Initialize from AsyncStorage
  initialize: async (): Promise<void> => {
    if (isInitialized) return;
    try {
      const stored = await Storage.getActivities();
      activitiesCache = (stored as EchoActivity[] | null) || [];
      isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize activities:", error);
      activitiesCache = [];
      isInitialized = true;
    }
  },

  // Save to AsyncStorage
  persist: async (): Promise<boolean> => {
    try {
      return await Storage.setActivities(activitiesCache);
    } catch (error) {
      console.error("Failed to persist activities:", error);
      return false;
    }
  },

  getAll: (): EchoActivity[] => {
    return [...activitiesCache].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA; // Newest first
    });
  },

  getByEchoId: (echoId: string): EchoActivity[] => {
    return activitiesCache
      .filter((a) => a.echoId === echoId)
      .sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA; // Newest first
      });
  },

  add: async (activity: EchoActivity): Promise<EchoActivity> => {
    activitiesCache = [activity, ...activitiesCache];
    await ActivityStorage.persist();
    return activity;
  },

  delete: async (id: string): Promise<boolean> => {
    const initialLength = activitiesCache.length;
    activitiesCache = activitiesCache.filter((a) => a.id !== id);
    await ActivityStorage.persist();
    return activitiesCache.length < initialLength;
  },

  // Helper to create echo creation activity
  createEchoCreated: async (
    echoId: string,
    echoTitle: string,
    userId: string,
    userName: string = "You",
    userAvatar?: string
  ): Promise<EchoActivity> => {
    const activity: EchoActivity = {
      id: `${echoId}-created-${Date.now()}`,
      echoId,
      type: "echo_created",
      userId,
      userName,
      userAvatar,
      description: `created "${echoTitle}"`,
      timestamp: new Date().toISOString(),
    };
    return await ActivityStorage.add(activity);
  },

  // Helper to create media upload activity
  createMediaUploaded: async (
    echoId: string,
    mediaType: "photo" | "video" | "audio" | "document",
    userId: string,
    userName: string = "You",
    userAvatar?: string
  ): Promise<EchoActivity> => {
    const typeLabel = {
      photo: "a photo",
      video: "a video",
      audio: "an audio file",
      document: "a file",
    }[mediaType];

    const activity: EchoActivity = {
      id: `${echoId}-media-${Date.now()}`,
      echoId,
      type: "media_uploaded",
      userId,
      userName,
      userAvatar,
      description: `added ${typeLabel}`,
      timestamp: new Date().toISOString(),
      mediaType,
    };
    return await ActivityStorage.add(activity);
  },

  // Helper to create echo locked activity
  createEchoLocked: async (echoId: string, echoTitle: string): Promise<EchoActivity> => {
    const activity: EchoActivity = {
      id: `${echoId}-locked-${Date.now()}`,
      echoId,
      type: "echo_locked",
      userId: "system",
      userName: "System",
      description: `"${echoTitle}" was locked`,
      timestamp: new Date().toISOString(),
    };
    return await ActivityStorage.add(activity);
  },

  // Helper to create echo unlocked activity
  createEchoUnlocked: async (echoId: string, echoTitle: string): Promise<EchoActivity> => {
    const activity: EchoActivity = {
      id: `${echoId}-unlocked-${Date.now()}`,
      echoId,
      type: "echo_unlocked",
      userId: "system",
      userName: "System",
      description: `"${echoTitle}" was unlocked`,
      timestamp: new Date().toISOString(),
    };
    return await ActivityStorage.add(activity);
  },

  // Clear all data (for sign out)
  clear: () => {
    activitiesCache = [];
    isInitialized = false;
  },
};
