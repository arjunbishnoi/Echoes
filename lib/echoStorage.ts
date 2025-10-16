import type { Echo, EchoMedia } from "../types/echo";
import { ActivityStorage } from "./activityStorage";
import { Storage } from "./asyncStorage";

let echoesCache: Echo[] = [];
let isInitialized = false;
let currentUserId: string | null = null;

export const EchoStorage = {
  setCurrentUser: (userId: string | null) => {
    currentUserId = userId;
  },

  initialize: async (): Promise<void> => {
    if (isInitialized) return;
    try {
      const stored = await Storage.getEchoes();
      echoesCache = (stored as Echo[] | null) || [];
      isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize echoes:", error);
      echoesCache = [];
      isInitialized = true;
    }
  },

  persist: async (): Promise<boolean> => {
    try {
      return await Storage.setEchoes(echoesCache);
    } catch (error) {
      console.error("Failed to persist echoes:", error);
      return false;
    }
  },

  getAll: (): Echo[] => {
    return [...echoesCache];
  },

  getUserEchoes: (userId?: string): Echo[] => {
    const targetUserId = userId || currentUserId;
    if (!targetUserId) return [];
    
    return echoesCache.filter(
      (echo) =>
        echo.ownerId === targetUserId ||
        echo.collaboratorIds?.includes(targetUserId)
    );
  },

  getById: (id: string): Echo | undefined => {
    return echoesCache.find((echo) => echo.id === id);
  },

  create: async (echo: Omit<Echo, "id">, userName: string = "You", userPhotoURL?: string): Promise<Echo> => {
    const userId = currentUserId || "mock_user";
    
    const newEcho: Echo = {
      ...echo,
      id: Date.now().toString(),
      createdAt: echo.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: echo.status || "ongoing",
      media: [],
      ownerId: userId,
      ownerName: userName,
      ownerPhotoURL: userPhotoURL,
      collaboratorIds: echo.collaboratorIds || [],
      shareMode: echo.isPrivate ? "private" : "shared",
    };
    echoesCache = [newEcho, ...echoesCache];
    
    await ActivityStorage.createEchoCreated(
      newEcho.id,
      newEcho.title,
      userId,
      userName,
      userPhotoURL
    );
    
    await EchoStorage.persist();
    
    return newEcho;
  },

  update: async (id: string, updates: Partial<Echo>): Promise<Echo | undefined> => {
    const index = echoesCache.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    
    echoesCache[index] = {
      ...echoesCache[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await EchoStorage.persist();
    return echoesCache[index];
  },

  delete: async (id: string): Promise<boolean> => {
    const initialLength = echoesCache.length;
    echoesCache = echoesCache.filter((e) => e.id !== id);
    await EchoStorage.persist();
    return echoesCache.length < initialLength;
  },

  updateStatus: async (id: string, status: "ongoing" | "locked" | "unlocked"): Promise<Echo | undefined> => {
    return await EchoStorage.update(id, { status });
  },

  getByStatus: (status: "ongoing" | "locked" | "unlocked", userId?: string): Echo[] => {
    const userEchoes = EchoStorage.getUserEchoes(userId);
    return userEchoes.filter((e) => e.status === status);
  },

  addMedia: async (echoId: string, media: EchoMedia, userName: string = "You", userPhotoURL?: string): Promise<Echo | undefined> => {
    const echo = echoesCache.find((e) => e.id === echoId);
    if (!echo) return undefined;

    const userId = currentUserId || "mock_user";
    const mediaWithMetadata: EchoMedia = {
      ...media,
      echoId,
      uploadedBy: userId,
      uploadedByName: userName,
      uploadedByPhotoURL: userPhotoURL,
    };
    const updatedMedia = [...(echo.media || []), mediaWithMetadata];
    
    await ActivityStorage.createMediaUploaded(
      echoId,
      media.type,
      userId,
      userName,
      userPhotoURL
    );
    
    return await EchoStorage.update(echoId, { media: updatedMedia });
  },

  removeMedia: async (echoId: string, mediaId: string): Promise<Echo | undefined> => {
    const echo = echoesCache.find((e) => e.id === echoId);
    if (!echo) return undefined;

    const updatedMedia = (echo.media || []).filter((m) => m.id !== mediaId);
    return await EchoStorage.update(echoId, { media: updatedMedia });
  },

  addCollaborator: async (echoId: string, userId: string, userName: string): Promise<Echo | undefined> => {
    const echo = echoesCache.find((e) => e.id === echoId);
    if (!echo) return undefined;

    const collaboratorIds = [...(echo.collaboratorIds || [])];
    if (!collaboratorIds.includes(userId)) {
      collaboratorIds.push(userId);
      
      const currentUserName = "You";
      await ActivityStorage.add({
        id: `activity_${Date.now()}`,
        echoId,
        type: "collaborator_added",
        userId: currentUserId || "mock_user",
        userName: currentUserName,
        description: `added ${userName} as a collaborator`,
        timestamp: new Date().toISOString(),
        targetUserId: userId,
        targetUserName: userName,
      });
      
      return await EchoStorage.update(echoId, { collaboratorIds });
    }
    
    return echo;
  },

  removeCollaborator: async (echoId: string, userId: string): Promise<Echo | undefined> => {
    const echo = echoesCache.find((e) => e.id === echoId);
    if (!echo) return undefined;

    const collaboratorIds = (echo.collaboratorIds || []).filter((id) => id !== userId);
    return await EchoStorage.update(echoId, { collaboratorIds });
  },

  canUserAccess: (echoId: string, userId?: string): boolean => {
    const targetUserId = userId || currentUserId;
    if (!targetUserId) return false;
    
    const echo = echoesCache.find((e) => e.id === echoId);
    if (!echo) return false;
    
    return (
      echo.ownerId === targetUserId ||
      echo.collaboratorIds?.includes(targetUserId) ||
      false
    );
  },

  clear: () => {
    echoesCache = [];
    currentUserId = null;
    isInitialized = false;
  },
};
