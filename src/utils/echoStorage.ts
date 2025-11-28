import { getDb } from "@/db/client";
import { enqueuePendingOp } from "@/db/pendingOps";
import type { Echo, EchoActivity, EchoMedia } from "@/types/echo";
import { ActivityStorage } from "./activityStorage";
import { SyncService } from "./services/syncService";

let echoesCache: Echo[] = [];
let isInitialized = false;
let currentUserId: string | null = null;

function mapMediaRow(row: any): EchoMedia {
  return {
    id: row.id,
    echoId: row.echoId,
    type: row.type,
    uri: row.uri,
    thumbnailUri: row.thumbnailUri,
    storagePath: row.storagePath,
    createdAt: row.createdAt,
    uploadedBy: row.uploadedBy,
    uploadedByName: row.uploadedByName,
    uploadedByPhotoURL: row.uploadedByPhotoURL,
  };
}

import { EchoService } from "./services/echoService";

async function reloadCache() {
  const db = getDb();
  
  // 1. Fetch all echoes
  const echoes = await db.getAllAsync<any>(`SELECT * FROM echoes ORDER BY datetime(updatedAt) DESC`);
  
  if (echoes.length === 0) {
    echoesCache = [];
    return;
  }

  // 2. Fetch all related data in parallel (N+1 Fix)
  const echoIds = echoes.map(e => `'${e.id}'`).join(',');
  
  const [allMedia, allCollaborators] = await Promise.all([
    db.getAllAsync<any>(
      `SELECT * FROM media WHERE echoId IN (${echoIds}) ORDER BY datetime(createdAt) ASC`
    ),
    db.getAllAsync<{ echoId: string, userId: string }>(
      `SELECT echoId, userId FROM collaborators WHERE echoId IN (${echoIds})`
    )
  ]);

  // 3. Map data to echoes in memory
  const mediaMap = new Map<string, EchoMedia[]>();
  for (const m of allMedia) {
    if (!mediaMap.has(m.echoId)) mediaMap.set(m.echoId, []);
    mediaMap.get(m.echoId)!.push(mapMediaRow(m));
  }

  const collaboratorMap = new Map<string, string[]>();
  for (const c of allCollaborators) {
    if (!collaboratorMap.has(c.echoId)) collaboratorMap.set(c.echoId, []);
    collaboratorMap.get(c.echoId)!.push(c.userId);
  }

  echoesCache = echoes.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    status: row.status ?? undefined,
    isPrivate: !!row.isPrivate,
    shareMode: row.shareMode ?? (row.isPrivate ? "private" : "shared"),
    ownerId: row.ownerId,
    ownerName: row.ownerName ?? undefined,
    ownerPhotoURL: row.ownerPhotoURL ?? undefined,
    lockDate: row.lockDate ?? undefined,
    unlockDate: row.unlockDate ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    collaboratorIds: collaboratorMap.get(row.id) || [],
    media: mediaMap.get(row.id) || [],
  }));
}

async function updateCollaborators(echoId: string, collaboratorIds: string[]) {
  const db = getDb();
  await db.runAsync(`DELETE FROM collaborators WHERE echoId = ?`, [echoId]);
  const uniqueIds = Array.from(new Set(collaboratorIds.filter(Boolean)));
  for (const collaboratorId of uniqueIds) {
    await db.runAsync(
      `INSERT OR REPLACE INTO collaborators (echoId, userId) VALUES (?, ?)`,
      [
        echoId,
        collaboratorId,
      ]
    );
  }
}

async function removeSharedEchoesMissingFromRemote(remoteIds: Set<string>, userId: string) {
  const db = getDb();
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT DISTINCT e.id FROM echoes e
      LEFT JOIN collaborators c ON e.id = c.echoId
      WHERE e.shareMode = 'shared' AND (e.ownerId = ? OR c.userId = ?)`,
    [userId, userId]
  );

  for (const row of rows) {
    if (!remoteIds.has(row.id)) {
      await db.runAsync(`DELETE FROM echoes WHERE id = ?`, [row.id]);
    }
  }
}

async function upsertRemoteEcho(echo: Echo) {
  const db = getDb();
  const id = echo.id;
  const title = echo.title;
  const description = echo.description ?? null;
  const imageUrl = echo.imageUrl ?? null;
  const status = echo.status ?? "ongoing";
  const isPrivate = echo.isPrivate ? 1 : 0;
  const shareMode = echo.shareMode ?? "shared";
  const ownerId = echo.ownerId;
  const ownerName = echo.ownerName ?? null;
  const ownerPhotoURL = echo.ownerPhotoURL ?? null;
  const lockDate = echo.lockDate ?? null;
  const unlockDate = echo.unlockDate ?? null;
  const createdAt =
    typeof echo.createdAt === "string" ? echo.createdAt : (echo.createdAt instanceof Date ? echo.createdAt.toISOString() : new Date().toISOString());
  const updatedAt =
    typeof echo.updatedAt === "string" ? echo.updatedAt : (echo.updatedAt instanceof Date ? echo.updatedAt.toISOString() : new Date().toISOString());

  await db.runAsync(
    `INSERT INTO echoes (id, title, description, imageUrl, status, isPrivate, shareMode, ownerId, ownerName, ownerPhotoURL, lockDate, unlockDate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       imageUrl = excluded.imageUrl,
       status = excluded.status,
       isPrivate = excluded.isPrivate,
       shareMode = excluded.shareMode,
       ownerId = excluded.ownerId,
       ownerName = excluded.ownerName,
       ownerPhotoURL = excluded.ownerPhotoURL,
       lockDate = excluded.lockDate,
       unlockDate = excluded.unlockDate,
       createdAt = excluded.createdAt,
       updatedAt = excluded.updatedAt`,
    [
      id,
      title,
      description,
      imageUrl,
      status,
      isPrivate,
      shareMode,
      ownerId,
      ownerName,
      ownerPhotoURL,
      lockDate,
      unlockDate,
      createdAt,
      updatedAt,
    ]
  );

  await updateCollaborators(echo.id, echo.collaboratorIds || []);
  
  if (echo.media && echo.media.length > 0) {
    await updateMediaForEcho(echo.id, echo.media);
  }
}

async function updateMediaForEcho(echoId: string, media: EchoMedia[]) {
  const db = getDb();
  await db.runAsync(`DELETE FROM media WHERE echoId = ?`, [echoId]);
  for (const item of media) {
    await db.runAsync(
      `INSERT OR REPLACE INTO media (id, echoId, type, uri, thumbnailUri, storagePath, status, createdAt, uploadedBy, uploadedByName, uploadedByPhotoURL)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        echoId,
        item.type,
        item.uri ?? null,
        item.thumbnailUri ?? null,
        item.storagePath ?? null,
        "synced",
        typeof item.createdAt === "string" ? item.createdAt : (item.createdAt instanceof Date ? item.createdAt.toISOString() : new Date(item.createdAt).toISOString()),
        item.uploadedBy ?? null,
        item.uploadedByName ?? null,
        item.uploadedByPhotoURL ?? null,
      ]
    );
  }
}

export const EchoStorage = {
  isReady: (): boolean => {
    return isInitialized;
  },
  setCurrentUser: (userId: string | null) => {
    currentUserId = userId;
  },

  initialize: async (): Promise<void> => {
    if (isInitialized) return;
    try {
      await reloadCache();
      isInitialized = true;
    } catch {
      echoesCache = [];
      isInitialized = true;
    }
  },

  persist: async (): Promise<boolean> => {
    return true;
  },

  getAll: (): Echo[] => {
    return [...echoesCache];
  },

  getUserEchoes: (userId?: string): Echo[] => {
    const targetUserId = userId || currentUserId;
    if (!targetUserId) return [];

    return echoesCache.filter(
      (echo) =>
        echo.ownerId === targetUserId || echo.collaboratorIds?.includes(targetUserId)
    ).sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    });
  },

  getById: (id: string): Echo | undefined => {
    return echoesCache.find((echo) => echo.id === id);
  },

  create: async (
    echo: Omit<Echo, "id">,
    userName: string = "You",
    userPhotoURL?: string,
    collaborators?: { id: string; name: string; avatar?: string }[]
  ): Promise<Echo> => {
    const db = getDb();
    const userId = currentUserId || "local_user";
    const id = globalThis.crypto?.randomUUID?.() ?? Date.now().toString();
    const createdAt = typeof echo.createdAt === 'string' ? echo.createdAt : (echo.createdAt instanceof Date ? echo.createdAt.toISOString() : new Date().toISOString());
    const updatedAt = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO echoes (id, title, description, imageUrl, status, isPrivate, shareMode, ownerId, ownerName, ownerPhotoURL, lockDate, unlockDate, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          echo.title,
          echo.description ?? null,
          echo.imageUrl ?? null,
          echo.status ?? "ongoing",
          echo.isPrivate ? 1 : 0,
          echo.shareMode ?? (echo.isPrivate ? "private" : "shared"),
          userId,
          userName,
          userPhotoURL ?? null,
          echo.lockDate ?? null,
          echo.unlockDate ?? null,
          createdAt,
          updatedAt,
        ]
      );

      // Inline collaborator updates to ensure transaction safety
      if (echo.collaboratorIds && echo.collaboratorIds.length > 0) {
        const uniqueIds = Array.from(new Set(echo.collaboratorIds.filter(Boolean)));
        for (const collaboratorId of uniqueIds) {
          await db.runAsync(
            `INSERT OR REPLACE INTO collaborators (echoId, userId) VALUES (?, ?)`,
            [id, collaboratorId]
          );
        }
      }

      // Helper for media would also go here, but new echoes usually start empty or media is added via separate call
      // But if updates.media was supported in create, we'd do it here.
      // The original code called updateMediaForEcho(id, []) which deletes all media. Safe to skip as it's new.
      
      await enqueuePendingOp("echo", id, "create", { echoId: id });
    });

    // 1) Owner-created activity
    await ActivityStorage.createEchoCreated(id, echo.title, userId, userName, userPhotoURL);

    // 2) Collaborator-added activities for any initial collaborators
    // These drive history + social notifications for people added at creation time.
    if (echo.collaboratorIds && echo.collaboratorIds.length > 0) {
      const uniqueIds = Array.from(new Set(echo.collaboratorIds.filter(Boolean)));
      const infoById = new Map(
        (collaborators ?? []).map((c) => [c.id, c] as const)
      );
      const now = new Date().toISOString();
      for (const collaboratorId of uniqueIds) {
        const info = infoById.get(collaboratorId);
        const collaboratorName = info?.name ?? "Friend";
        await ActivityStorage.add({
          id: `activity_${id}_collab_${collaboratorId}_${Date.now()}`,
          echoId: id,
          type: "collaborator_added",
      userId,
      userName,
          userAvatar: userPhotoURL,
          description: `added "${collaboratorName}".`,
          timestamp: now,
        });
      }
    }

    await reloadCache();
    
    // Trigger background sync
    SyncService.processPendingOps().catch(() => {});
    
    return EchoStorage.getById(id)!;
  },

  update: async (id: string, updates: Partial<Echo>): Promise<Echo | undefined> => {
    const db = getDb();
    const existing = EchoStorage.getById(id);
    if (!existing) return undefined;
    const updatedAt = new Date().toISOString();

    await db.runAsync(
      `UPDATE echoes SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        imageUrl = COALESCE(?, imageUrl),
        status = COALESCE(?, status),
        isPrivate = COALESCE(?, isPrivate),
        shareMode = COALESCE(?, shareMode),
        lockDate = COALESCE(?, lockDate),
        unlockDate = COALESCE(?, unlockDate),
        updatedAt = ?
      WHERE id = ?`,
      [
        updates.title ?? null,
        updates.description ?? null,
        updates.imageUrl ?? null,
        updates.status ?? null,
        typeof updates.isPrivate === "boolean" ? (updates.isPrivate ? 1 : 0) : null,
        updates.shareMode ?? null,
        updates.lockDate ?? null,
        updates.unlockDate ?? null,
        updatedAt,
        id,
      ]
    );

    if (updates.collaboratorIds) {
      await updateCollaborators(id, updates.collaboratorIds);
    }
    if (updates.media) {
      await updateMediaForEcho(id, updates.media);
    }

    await enqueuePendingOp("echo", id, "update", { echoId: id, updates });

    await reloadCache();
    
    // Trigger background sync
    SyncService.processPendingOps().catch(() => {});
    
    return EchoStorage.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    const db = getDb();
    await db.runAsync(`DELETE FROM echoes WHERE id = ?`, [id]);
    await enqueuePendingOp("echo", id, "delete", { echoId: id });
    const before = echoesCache.length;
    echoesCache = echoesCache.filter((e) => e.id !== id);
    
    // Trigger background sync
    SyncService.processPendingOps().catch(() => {});
    
    return before !== echoesCache.length;
  },

  updateStatus: async (id: string, status: "ongoing" | "locked" | "unlocked"): Promise<Echo | undefined> => {
    return await EchoStorage.update(id, { status });
  },

  getByStatus: (status: "ongoing" | "locked" | "unlocked", userId?: string): Echo[] => {
    const userEchoes = EchoStorage.getUserEchoes(userId);
    return userEchoes.filter((e) => e.status === status);
  },

  addMedia: async (echoId: string, media: EchoMedia, userName: string = "You", userPhotoURL?: string): Promise<Echo | undefined> => {
    const db = getDb();
    const echo = EchoStorage.getById(echoId);
    if (!echo) return undefined;

    const userId = currentUserId || "local_user";
    const mediaWithMetadata: EchoMedia = {
      ...media,
      echoId,
      uploadedBy: userId,
      uploadedByName: userName,
      uploadedByPhotoURL: userPhotoURL,
      createdAt:
        typeof media.createdAt === "string" ? media.createdAt : new Date().toISOString(),
    };

    const createdAtStr = typeof mediaWithMetadata.createdAt === "string" ? mediaWithMetadata.createdAt : new Date().toISOString();

    await db.runAsync(
      `INSERT OR REPLACE INTO media (id, echoId, type, uri, thumbnailUri, storagePath, status, createdAt, uploadedBy, uploadedByName, uploadedByPhotoURL)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mediaWithMetadata.id,
        echoId,
        mediaWithMetadata.type,
        mediaWithMetadata.uri ?? null,
        mediaWithMetadata.thumbnailUri ?? null,
        mediaWithMetadata.storagePath ?? null,
        "pending",
        createdAtStr,
        mediaWithMetadata.uploadedBy ?? null,
        mediaWithMetadata.uploadedByName ?? null,
        mediaWithMetadata.uploadedByPhotoURL ?? null,
      ]
    );

    await enqueuePendingOp("media", mediaWithMetadata.id, "add_media", {
      echoId,
      mediaId: mediaWithMetadata.id,
    });

    await ActivityStorage.createMediaUploaded(
      echoId,
      media.type,
      userId,
      userName,
      userPhotoURL
    );

    await reloadCache();
    
    // Trigger background sync
    SyncService.processPendingOps().catch(() => {});
    
    return EchoStorage.getById(echoId);
  },

  addMediaBatch: async (
    echoId: string,
    mediaItems: EchoMedia[],
    userName: string = "You",
    userPhotoURL?: string
  ): Promise<Echo | undefined> => {
    for (const item of mediaItems) {
      await EchoStorage.addMedia(echoId, item, userName, userPhotoURL);
    }
    return EchoStorage.getById(echoId);
  },

  removeMedia: async (echoId: string, mediaId: string): Promise<Echo | undefined> => {
    const db = getDb();
    await db.runAsync(`DELETE FROM media WHERE id = ?`, [mediaId]);
    await enqueuePendingOp("media", mediaId, "delete_media", { echoId, mediaId });
    await reloadCache();
    
    // Trigger background sync
    SyncService.processPendingOps().catch(() => {});
    
    return EchoStorage.getById(echoId);
  },

  addCollaborator: async (
    echoId: string,
    userId: string,
    collaboratorName: string,
    actorName?: string,
    actorPhotoURL?: string
  ): Promise<Echo | undefined> => {
    const db = getDb();
    await db.runAsync(
      `INSERT OR IGNORE INTO collaborators (echoId, userId, displayName) VALUES (?, ?, ?)`,
      [echoId, userId, collaboratorName]
    );
    await enqueuePendingOp("echo", echoId, "update", {
      echoId,
      collaboratorId: userId,
      action: "add",
    });

    const actorId = currentUserId || "local_user";
    const now = new Date().toISOString();

    // Activity seen by everyone: "<ActorName> added \"Friend Name\"."
    await ActivityStorage.add({
      id: `activity_${echoId}_collab_${userId}_${Date.now()}`,
      echoId,
      type: "collaborator_added",
      userId: actorId,
      userName: actorName ?? "Someone",
      userAvatar: actorPhotoURL,
      description: `added "${collaboratorName}".`,
      timestamp: now,
    });

    await reloadCache();
    
    // Trigger background sync
    SyncService.processPendingOps().catch(() => {});
    
    return EchoStorage.getById(echoId);
  },

  removeCollaborator: async (echoId: string, userId: string): Promise<Echo | undefined> => {
    const db = getDb();
    await db.runAsync(`DELETE FROM collaborators WHERE echoId = ? AND userId = ?`, [
      echoId,
      userId,
    ]);
    await enqueuePendingOp("echo", echoId, "update", {
      echoId,
      collaboratorId: userId,
      action: "remove",
    });
    await reloadCache();
    
    // Trigger background sync
    SyncService.processPendingOps().catch(() => {});
    
    return EchoStorage.getById(echoId);
  },

  canUserAccess: (echoId: string, userId?: string): boolean => {
    const targetUserId = userId || currentUserId;
    if (!targetUserId) return false;

    const echo = EchoStorage.getById(echoId);
    if (!echo) return false;

    return (
      echo.ownerId === targetUserId || echo.collaboratorIds?.includes(targetUserId) || false
    );
  },

  clear: async () => {
    const db = getDb();
    await db.runAsync(`DELETE FROM media`);
    await db.runAsync(`DELETE FROM collaborators`);
    await db.runAsync(`DELETE FROM activities`);
    await db.runAsync(`DELETE FROM echoes`);
    await db.runAsync(`DELETE FROM pending_ops`);
    await ActivityStorage.clear();
    echoesCache = [];
    currentUserId = null;
    isInitialized = false;
  },
  syncRemoteEchoes: async (remoteEchoes: Echo[], userId: string) => {
    const remoteIds = new Set(remoteEchoes.map((e) => e.id));
    await removeSharedEchoesMissingFromRemote(remoteIds, userId);
    for (const remoteEcho of remoteEchoes) {
      await upsertRemoteEcho(remoteEcho);
    }
    await reloadCache();
  },
  syncActivities: async (activities: EchoActivity[], userId: string) => {
    // We only sync activities for echoes the user has access to
    // This prevents syncing irrelevant data
    const userEchoes = EchoStorage.getUserEchoes(userId);
    const userEchoIds = new Set(userEchoes.map((e) => e.id));
    
    const relevantActivities = activities.filter(a => userEchoIds.has(a.echoId));
    
    if (relevantActivities.length > 0) {
      await ActivityStorage.syncActivities(relevantActivities);
    }
  },

  // Helper to fetch and sync latest activities from remote
  refreshActivitiesFromRemote: async (userId: string) => {
    try {
      const userEchoes = EchoStorage.getUserEchoes(userId);
      const echoIds = userEchoes.map((e) => e.id);
      
      if (echoIds.length > 0) {
        const remoteActivities = await EchoService.getActivitiesForEchoes(echoIds);
        await EchoStorage.syncActivities(remoteActivities, userId);
      }

      // After syncing activities, ensure we have "locking/unlocking soon" notifications
      const DAY_MS = 24 * 60 * 60 * 1000;
      const now = Date.now();

      for (const echo of userEchoes) {
        const activitiesForEcho = ActivityStorage.getByEchoId(echo.id);

        if (echo.lockDate) {
          const lockMs = new Date(echo.lockDate).getTime();
          const diff = lockMs - now;
          const hasLockSoon = activitiesForEcho.some((a) => a.type === "echo_locking_soon");
          if (diff > 0 && diff <= DAY_MS && !hasLockSoon) {
            await ActivityStorage.createEchoLockingSoon(echo.id, echo.title);
          }
        }

        if (echo.unlockDate) {
          const unlockMs = new Date(echo.unlockDate).getTime();
          const diff = unlockMs - now;
          const hasUnlockSoon = activitiesForEcho.some((a) => a.type === "echo_unlocking_soon");
          if (diff > 0 && diff <= DAY_MS && !hasUnlockSoon) {
            await ActivityStorage.createEchoUnlockingSoon(echo.id, echo.title);
          }
        }
      }
    } catch {
    }
  }
};
