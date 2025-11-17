import { getDb } from "@/db/client";
import { enqueuePendingOp } from "@/db/pendingOps";
import type { Echo, EchoMedia } from "@/types/echo";
import { ActivityStorage } from "./activityStorage";

let echoesCache: Echo[] = [];
let isInitialized = false;
let currentUserId: string | null = null;

async function fetchCollaboratorIds(echoId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db.getAllAsync<{ userId: string }>(
    `SELECT userId FROM collaborators WHERE echoId = ?`,
    [echoId]
  );
  return rows.map((row) => row.userId);
}

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

async function fetchMedia(echoId: string): Promise<EchoMedia[]> {
  const db = getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM media WHERE echoId = ? ORDER BY datetime(createdAt) ASC`,
    [echoId]
  );
  return rows.map(mapMediaRow);
}

async function hydrateEcho(row: any): Promise<Echo> {
  const [media, collaboratorIds] = await Promise.all([
    fetchMedia(row.id),
    fetchCollaboratorIds(row.id),
  ]);

  return {
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
    collaboratorIds,
    media,
  };
}

async function reloadCache() {
  const db = getDb();
  const rows = await db.getAllAsync<any>(`SELECT * FROM echoes ORDER BY datetime(updatedAt) DESC`);
  echoesCache = await Promise.all(rows.map(hydrateEcho));
}

async function updateCollaborators(echoId: string, collaboratorIds: string[]) {
  const db = getDb();
  await db.runAsync(`DELETE FROM collaborators WHERE echoId = ?`, [echoId]);
  for (const collaboratorId of collaboratorIds) {
    await db.runAsync(`INSERT INTO collaborators (echoId, userId) VALUES (?, ?)`, [
      echoId,
      collaboratorId,
    ]);
  }
}

async function updateMediaForEcho(echoId: string, media: EchoMedia[]) {
  const db = getDb();
  await db.runAsync(`DELETE FROM media WHERE echoId = ?`, [echoId]);
  for (const item of media) {
    await db.runAsync(
      `INSERT INTO media (id, echoId, type, uri, thumbnailUri, storagePath, status, createdAt, uploadedBy, uploadedByName, uploadedByPhotoURL)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        echoId,
        item.type,
        item.uri ?? null,
        item.thumbnailUri ?? null,
        item.storagePath ?? null,
        "synced",
        typeof item.createdAt === "string" ? item.createdAt : new Date(item.createdAt).toISOString(),
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
    } catch (error) {
      console.error("Failed to initialize echoes:", error);
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
    );
  },

  getById: (id: string): Echo | undefined => {
    return echoesCache.find((echo) => echo.id === id);
  },

  create: async (echo: Omit<Echo, "id">, userName: string = "You", userPhotoURL?: string): Promise<Echo> => {
    const db = getDb();
    const userId = currentUserId || "local_user";
    const id = echo.id ?? Date.now().toString();
    const createdAt = echo.createdAt || new Date().toISOString();
    const updatedAt = new Date().toISOString();

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

    await updateCollaborators(id, echo.collaboratorIds || []);
    await updateMediaForEcho(id, []);
    await enqueuePendingOp("echo", id, "create", { echoId: id });

    await ActivityStorage.createEchoCreated(
      id,
      echo.title,
      userId,
      userName,
      userPhotoURL
    );

    await reloadCache();
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
    return EchoStorage.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    const db = getDb();
    await db.runAsync(`DELETE FROM echoes WHERE id = ?`, [id]);
    await enqueuePendingOp("echo", id, "delete", { echoId: id });
    const before = echoesCache.length;
    echoesCache = echoesCache.filter((e) => e.id !== id);
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
        mediaWithMetadata.createdAt,
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
    return EchoStorage.getById(echoId);
  },

  addCollaborator: async (echoId: string, userId: string, userName: string): Promise<Echo | undefined> => {
    const db = getDb();
    await db.runAsync(
      `INSERT OR IGNORE INTO collaborators (echoId, userId, displayName) VALUES (?, ?, ?)`,
      [echoId, userId, userName]
    );
    await enqueuePendingOp("echo", echoId, "update", {
      echoId,
      collaboratorId: userId,
      action: "add",
    });

    await ActivityStorage.add({
      id: `activity_${Date.now()}`,
      echoId,
      type: "collaborator_added",
      userId: currentUserId || "local_user",
      userName: "You",
      description: `added ${userName} as a collaborator`,
      timestamp: new Date().toISOString(),
      targetUserId: userId,
      targetUserName: userName,
    });

    await reloadCache();
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
};
