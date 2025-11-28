import { getDb } from "@/db/client";
import { enqueuePendingOp } from "@/db/pendingOps";
import type { EchoActivity } from "@/types/echo";
import { SyncService } from "./services/syncService";

let activitiesCache: EchoActivity[] = [];
let isInitialized = false;

async function reloadCache() {
  const db = getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM activities ORDER BY datetime(timestamp) DESC`
  );
  activitiesCache = rows.map((row) => ({
    id: row.id,
    echoId: row.echoId,
    type: row.type,
    userId: row.userId,
    userName: row.userName,
    userAvatar: row.userAvatar ?? undefined,
    description: row.description,
    timestamp: row.timestamp,
    mediaType: row.mediaType ?? undefined,
  }));
}

function sortActivities(list: EchoActivity[]): EchoActivity[] {
  return [...list].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach((l) => l());
}

export const ActivityStorage = {
  subscribe: (listener: () => void): (() => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  isReady: (): boolean => {
    return isInitialized;
  },
  initialize: async (): Promise<void> => {
    if (isInitialized) return;
    try {
      await reloadCache();
      isInitialized = true;
      notifyListeners();
    } catch {
      activitiesCache = [];
      isInitialized = true;
    }
  },

  persist: async (): Promise<boolean> => {
    return true;
  },

  getAll: (): EchoActivity[] => {
    return sortActivities(activitiesCache);
  },

  getByEchoId: (echoId: string): EchoActivity[] => {
    return sortActivities(activitiesCache.filter((a) => a.echoId === echoId));
  },

  add: async (activity: EchoActivity): Promise<EchoActivity> => {
    const db = getDb();
    await db.runAsync(
      `INSERT OR IGNORE INTO activities (id, echoId, type, description, timestamp, userId, userName, userAvatar, mediaType)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activity.id,
        activity.echoId,
        activity.type,
        activity.description ?? null,
        typeof activity.timestamp === "string" ? activity.timestamp : activity.timestamp.toISOString(),
        activity.userId ?? null,
        activity.userName ?? null,
        activity.userAvatar ?? null,
        activity.mediaType ?? null,
      ]
    );
    await enqueuePendingOp("activity", activity.id, "activity", { echoId: activity.echoId });
    await reloadCache();
    notifyListeners();
    
    // Trigger sync
    SyncService.processPendingOps().catch(() => {});
    
    return activity;
  },

  delete: async (id: string): Promise<boolean> => {
    const db = getDb();
    await db.runAsync(`DELETE FROM activities WHERE id = ?`, [id]);
    const initialLength = activitiesCache.length;
    activitiesCache = activitiesCache.filter((a) => a.id !== id);
    notifyListeners();
    return activitiesCache.length < initialLength;
  },

  createEchoCreated: async (
    echoId: string,
    echoTitle: string,
    userId: string,
    userName: string = "You",
    userAvatar?: string
  ): Promise<EchoActivity> => {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const activity: EchoActivity = {
      id: `${echoId}-created-${Date.now()}-${randomSuffix}`,
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

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const activity: EchoActivity = {
      id: `${echoId}-media-${Date.now()}-${randomSuffix}`,
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

  createBatchMediaUploaded: async (
    echoId: string,
    mediaItems: Array<{ type: "photo" | "video" | "audio" | "document" }>,
    userId: string,
    userName: string = "You",
    userAvatar?: string
  ): Promise<EchoActivity> => {
    const count = mediaItems.length;
    const types = mediaItems.map((m) => m.type);
    const uniqueTypes = [...new Set(types)];

    let description: string;

    if (count === 1) {
      const typeLabel = {
        photo: "a photo",
        video: "a video",
        audio: "an audio file",
        document: "a file",
      }[types[0]];
      description = `added ${typeLabel}`;
    } else if (uniqueTypes.length === 1) {
      const typeLabel = {
        photo: "photos",
        video: "videos",
        audio: "audio files",
        document: "files",
      }[uniqueTypes[0]];
      description = `added ${count} ${typeLabel}`;
    } else {
      description = `added ${count} items`;
    }

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const activity: EchoActivity = {
      id: `${echoId}-media-${Date.now()}-${randomSuffix}`,
      echoId,
      type: "media_uploaded",
      userId,
      userName,
      userAvatar,
      description,
      timestamp: new Date().toISOString(),
      mediaType: uniqueTypes.length === 1 ? uniqueTypes[0] : undefined,
    };
    return await ActivityStorage.add(activity);
  },

  createEchoLocked: async (echoId: string, echoTitle: string): Promise<EchoActivity> => {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const activity: EchoActivity = {
      id: `${echoId}-locked-${Date.now()}-${randomSuffix}`,
      echoId,
      type: "echo_locked",
      userId: "system",
      userName: "System",
      description: `"${echoTitle}" was locked`,
      timestamp: new Date().toISOString(),
    };
    return await ActivityStorage.add(activity);
  },

  createEchoUnlocked: async (echoId: string, echoTitle: string): Promise<EchoActivity> => {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const activity: EchoActivity = {
      id: `${echoId}-unlocked-${Date.now()}-${randomSuffix}`,
      echoId,
      type: "echo_unlocked",
      userId: "system",
      userName: "System",
      description: `"${echoTitle}" was unlocked`,
      timestamp: new Date().toISOString(),
    };
    return await ActivityStorage.add(activity);
  },

  createEchoLockingSoon: async (echoId: string, _echoTitle: string): Promise<EchoActivity> => {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const activity: EchoActivity = {
      id: `${echoId}-locksoon-${Date.now()}-${randomSuffix}`,
      echoId,
      type: "echo_locking_soon",
      userId: "system",
      userName: "System",
      description: "will be locked soon.",
      timestamp: new Date().toISOString(),
    };
    return await ActivityStorage.add(activity);
  },

  createEchoUnlockingSoon: async (echoId: string, _echoTitle: string): Promise<EchoActivity> => {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const activity: EchoActivity = {
      id: `${echoId}-unlocksoon-${Date.now()}-${randomSuffix}`,
      echoId,
      type: "echo_unlocking_soon",
      userId: "system",
      userName: "System",
      description: "unlocks soon.",
      timestamp: new Date().toISOString(),
    };
    return await ActivityStorage.add(activity);
  },

  clear: async () => {
    const db = getDb();
    await db.runAsync(`DELETE FROM activities`);
    activitiesCache = [];
    isInitialized = false;
  },

  syncActivities: async (activities: EchoActivity[]) => {
    const db = getDb();
    
    // NOTE: Avoid wrapping in an explicit transaction to prevent
    // "cannot start a transaction within a transaction" errors
    // when called from other transactional contexts.
      for (const activity of activities) {
        await db.runAsync(
          `INSERT OR IGNORE INTO activities (id, echoId, type, description, timestamp, userId, userName, userAvatar, mediaType)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            activity.id,
            activity.echoId,
            activity.type,
            activity.description ?? null,
            typeof activity.timestamp === "string" ? activity.timestamp : activity.timestamp.toISOString(),
            activity.userId ?? null,
            activity.userName ?? null,
          (activity as EchoActivity).userAvatar ?? null,
          (activity as EchoActivity).mediaType ?? null,
          ]
        );
      }
    
    await reloadCache();
    notifyListeners();
  },
};
