import { getDb } from "@/db/client";
import { clearPendingOpsForEntity, listPendingOps, PendingAction, PendingEntityType } from "@/db/pendingOps";
import type { Echo, EchoActivity, EchoMedia } from "@/types/echo";
import { EchoService } from "@/utils/services/echoService";
import { StorageService } from "@/utils/services/storageService";
import * as FileSystem from "expo-file-system/legacy";

let isSyncing = false;

// Helper to avoid circular dependency with EchoStorage
async function getEchoFromDb(id: string): Promise<Echo | null> {
  const db = getDb();
  const row = await db.getFirstAsync<any>("SELECT * FROM echoes WHERE id = ?", [id]);
  if (!row) return null;
  
  // Fetch collaborators
  const collabRows = await db.getAllAsync<{ userId: string }>(
    `SELECT userId FROM collaborators WHERE echoId = ?`, [id]
  );
  const collaboratorIds = collabRows.map(r => r.userId);
  
  // Fetch media
  const mediaRows = await db.getAllAsync<any>(
    `SELECT * FROM media WHERE echoId = ? ORDER BY datetime(createdAt) ASC`, [id]
  );
  const media = mediaRows.map(m => ({
    id: m.id,
    echoId: m.echoId,
    type: m.type,
    uri: m.uri,
    thumbnailUri: m.thumbnailUri,
    storagePath: m.storagePath,
    createdAt: m.createdAt,
    uploadedBy: m.uploadedBy,
    uploadedByName: m.uploadedByName,
    uploadedByPhotoURL: m.uploadedByPhotoURL,
  }));

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

async function getActivityFromDb(echoId: string, activityId: string): Promise<EchoActivity | null> {
   const db = getDb();
   const row = await db.getFirstAsync<any>(
      "SELECT * FROM activities WHERE id = ? AND echoId = ?", 
      [activityId, echoId]
   );
   
   if (!row) return null;
   
   return {
      id: row.id,
      echoId: row.echoId,
      type: row.type,
      userId: row.userId,
      userName: row.userName,
      userAvatar: row.userAvatar ?? undefined,
      description: row.description,
      timestamp: row.timestamp,
      mediaType: row.mediaType ?? undefined,
   };
}

export const SyncService = {
  processPendingOps: async () => {
    if (isSyncing) return;
    isSyncing = true;

    try {
      const pendingOps = await listPendingOps();
      
      for (const op of pendingOps) {
        try {
          const payload = JSON.parse(op.payload);
          
          switch (op.entityType as PendingEntityType) {
            case "echo":
              await handleEchoOp(op.entityId, op.action as PendingAction, payload);
              break;
            case "media":
              await handleMediaOp(op.entityId, op.action as PendingAction, payload);
              break;
            case "activity":
              await handleActivityOp(op.entityId, op.action as PendingAction, payload);
              break;
          }
          
          // If successful, remove the pending op
          await clearPendingOpsForEntity(op.entityType as PendingEntityType, op.entityId);
          
        } catch {
          // Continue to next op - don't block entire queue
        }
      }
    } catch {
    } finally {
      isSyncing = false;
    }
  }
};

async function handleEchoOp(echoId: string, action: PendingAction, payload: any) {
  const echo = await getEchoFromDb(echoId);

  switch (action) {
    case "create":
      if (echo) {
        await EchoService.createEcho(echo);
      }
      break;
      
    case "update":
      if (payload.updates) {
        await EchoService.updateEcho(echoId, payload.updates);
      } else if (payload.status) { // Handle specific status update
         await EchoService.updateEcho(echoId, { status: payload.status });
      } else if (payload.collaboratorId && payload.action) {
         if (payload.action === 'add') {
            await EchoService.addCollaborator(echoId, payload.collaboratorId);
         } else if (payload.action === 'remove') {
            await EchoService.removeCollaborator(echoId, payload.collaboratorId);
         }
      }
      // Also handle if we just need to sync the current state of the echo
      else if (echo) {
         // Fallback: sync current state fields
         await EchoService.updateEcho(echoId, {
            title: echo.title,
            description: echo.description,
            status: echo.status,
            isPrivate: echo.isPrivate,
            lockDate: echo.lockDate,
            unlockDate: echo.unlockDate,
            shareMode: echo.shareMode
         });
      }
      break;
      
    case "delete":
      await EchoService.deleteEcho(echoId);
      break;
  }
}

async function handleMediaOp(mediaId: string, action: PendingAction, payload: any) {
  const { echoId } = payload;
  
  switch (action) {
    case "add_media":
      const echo = await getEchoFromDb(echoId);
      const mediaItem = echo?.media?.find(m => m.id === mediaId);
      
      if (!mediaItem) {
        return;
      }
      
      // Upload file to storage if it's a local file
      let downloadUrl = mediaItem.uri;
      if (mediaItem.uri.startsWith("file://")) {
         // Verify file exists before attempting upload
         const fileInfo = await FileSystem.getInfoAsync(mediaItem.uri);
         if (!fileInfo.exists) {
            // We can't upload it. We should probably delete the media item from the echo 
            // OR just fail this op gracefully (remove from pending so we don't retry forever)
            // For now, let's just return, which effectively "completes" the op without action, removing it from queue.
            // But wait, if we don't upload, the echo on server will have no media or broken link if we synced metadata?
            // Actually, we haven't synced the media metadata to server yet (that's what this op does at the end).
            // So if we skip here, the server just won't have this media item. Correct.
            return; 
         }

         try {
            const onProgress = (_p: number) => {};
            
            if (mediaItem.type === "photo") {
               downloadUrl = await StorageService.uploadEchoPhoto(echoId, mediaItem.uri, mediaId, onProgress);
            } else if (mediaItem.type === "video") {
               downloadUrl = await StorageService.uploadEchoVideo(echoId, mediaItem.uri, mediaId, onProgress);
            } else if (mediaItem.type === "audio") {
               downloadUrl = await StorageService.uploadEchoAudio(echoId, mediaItem.uri, mediaId, onProgress);
            } else if (mediaItem.type === "document") {
               downloadUrl = await StorageService.uploadEchoDocument(echoId, mediaItem.uri, mediaId, "doc", onProgress);
            }
         } catch (e) {
            throw e; // Retry later
         }
      }
      
      const mediaToSync: EchoMedia = {
         ...mediaItem,
         uri: downloadUrl,
         storagePath: StorageService.getEchoCoverPath(echoId).replace("cover.jpg", `${mediaItem.type}s/${mediaId}`) 
      };
      
      await EchoService.addMedia(echoId, mediaToSync);
      break;
      
    case "delete_media":
       const remoteEcho = await EchoService.getEcho(echoId);
       if (remoteEcho && remoteEcho.media) {
          const updatedMedia = remoteEcho.media.filter(m => m.id !== mediaId);
          await EchoService.updateEcho(echoId, { media: updatedMedia });
          
          try {
             await StorageService.deleteEchoMedia(echoId, mediaId, "photo");
          } catch {
             // Unable to remove photo; proceed with remaining cleanup
          }
          try {
             await StorageService.deleteEchoMedia(echoId, mediaId, "video");
          } catch {
             // Ignore video deletion failures
          }
          try {
             await StorageService.deleteEchoMedia(echoId, mediaId, "audio");
          } catch {
             // Ignore audio deletion failures
          }
       }
      break;
  }
}

async function handleActivityOp(activityId: string, _action: PendingAction, payload: any) {
   const activity = await getActivityFromDb(payload.echoId, activityId);
   
   if (!activity) return;
   
   await EchoService.addActivity(payload.echoId, activity);
}
