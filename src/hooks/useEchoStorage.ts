import type { Echo, EchoMedia } from "@/types/echo";
import { ActivityStorage } from "@/utils/activityStorage";
import { useAuth } from "@/utils/authContext";
import { EchoStorage } from "@/utils/echoStorage";
import { EchoCloudService } from "@/utils/services/echoCloudService";
import { useCallback, useEffect, useState } from "react";

const listeners = new Set<() => void>();
let currentSubscriptionUserId: string | null = null;
let cloudUnsubscribe: (() => void) | null = null;

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function teardownSubscription() {
  if (cloudUnsubscribe) {
    cloudUnsubscribe();
    cloudUnsubscribe = null;
  }
  currentSubscriptionUserId = null;
}

function ensureCloudSubscription(
  userId: string | null,
  handler: (remoteEchoes: Echo[]) => Promise<void>
) {
  if (!userId) {
    teardownSubscription();
    return;
  }
  if (currentSubscriptionUserId === userId && cloudUnsubscribe) {
    return;
  }
  teardownSubscription();
  currentSubscriptionUserId = userId;
  cloudUnsubscribe = EchoCloudService.subscribeToUserEchoes(userId, async (remoteEchoes) => {
    await handler(remoteEchoes);
    notifyListeners();
  });
}

export function useEchoStorage() {
  const { user } = useAuth();
  const [, setVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(!(EchoStorage.isReady() && ActivityStorage.isReady()));

  const localUpdate = useCallback(() => {
    setVersion((n) => n + 1);
  }, []);

  useEffect(() => {
    listeners.add(localUpdate);
    return () => {
      listeners.delete(localUpdate);
    };
  }, [localUpdate]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (user) {
        EchoStorage.setCurrentUser(user.id);
      }
      // If already ready, avoid async/extra spinner
      if (EchoStorage.isReady() && ActivityStorage.isReady()) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      await Promise.all([
        EchoStorage.initialize(),
        ActivityStorage.initialize(),
      ]);
      if (!cancelled) {
        setIsLoading(false);
        setVersion((n) => n + 1);
      }
    };
    init();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      ensureCloudSubscription(null, async () => Promise.resolve());
      return;
    }
    ensureCloudSubscription(user.id, async (remoteEchoes) => {
      try {
        await EchoStorage.syncRemoteEchoes(remoteEchoes, user.id);
        await EchoStorage.refreshActivitiesFromRemote(user.id);
      } catch {
        // Ignore sync failures; next snapshot will retry
      }
    });
    return () => {
      if (!user?.id) {
        teardownSubscription();
      }
    };
  }, [user?.id]);

  const refresh = useCallback(() => {
    notifyListeners();
  }, []);

  const getAllEchoes = useCallback((): Echo[] => {
    return EchoStorage.getAll();
  }, []);

  const getUserEchoes = useCallback((): Echo[] => {
    if (!user) return [];
    return EchoStorage.getUserEchoes(user.id);
  }, [user]);

  const getEchoById = useCallback((id: string): Echo | undefined => {
    return EchoStorage.getById(id);
  }, []);

  const syncSharedEchoToCloud = useCallback(
    async (echo?: Echo | null): Promise<Echo | undefined> => {
      if (!echo) return undefined;
      try {
        const synced = await EchoCloudService.saveEcho(echo);
        if (synced.imageUrl !== echo.imageUrl) {
          await EchoStorage.update(synced.id, { imageUrl: synced.imageUrl });
          refresh();
        }
        return synced;
      } catch {
        return echo;
      }
    },
    [refresh]
  );

  type CollaboratorInfo = { id: string; name: string; avatar?: string };

  const createEcho = useCallback(
    async (echo: Omit<Echo, "id" | "ownerId">, collaborators?: CollaboratorInfo[]): Promise<Echo> => {
      if (!user) throw new Error("User not authenticated");
      const echoWithOwner: Omit<Echo, "id"> = {
        ...echo,
        ownerId: user.id,
        ownerName: user.displayName,
        ownerPhotoURL: user.photoURL,
      };
      
      const newEcho = await EchoStorage.create(
        echoWithOwner,
        user.displayName,
        user.photoURL,
        collaborators
      );

      let finalEcho: Echo | undefined = newEcho;
      if (!newEcho.isPrivate && newEcho.shareMode === "shared") {
        finalEcho = (await syncSharedEchoToCloud(newEcho)) ?? newEcho;
      }

      refresh();
      return finalEcho ?? newEcho;
    },
    [user, refresh, syncSharedEchoToCloud]
  );

  const updateEcho = useCallback(
    async (id: string, updates: Partial<Echo>): Promise<Echo | undefined> => {
      const updated = await EchoStorage.update(id, updates);
      if (updated && !updated.isPrivate && updated.shareMode === "shared") {
        await syncSharedEchoToCloud(updated);
      }
      refresh();
      return updated;
    },
    [refresh, syncSharedEchoToCloud]
  );

  const deleteEcho = useCallback(
    async (id: string): Promise<boolean> => {
      const existing = EchoStorage.getById(id);
      const deleted = await EchoStorage.delete(id);
      if (deleted && existing && !existing.isPrivate && existing.shareMode === "shared") {
        await EchoCloudService.deleteEcho(id);
      }
      refresh();
      return deleted;
    },
    [refresh]
  );

  const updateEchoStatus = useCallback(
    async (id: string, status: "ongoing" | "locked" | "unlocked"): Promise<Echo | undefined> => {
      const updated = await EchoStorage.updateStatus(id, status);
      refresh();
      return updated;
    },
    [refresh]
  );

  const getEchoesByStatus = useCallback((status: "ongoing" | "locked" | "unlocked"): Echo[] => {
    if (!user) return [];
    return EchoStorage.getByStatus(status, user.id);
  }, [user]);

  const addMedia = useCallback(
    async (echoId: string, media: EchoMedia): Promise<Echo | undefined> => {
      if (!user) throw new Error("User not authenticated");
      
      const updated = await EchoStorage.addMedia(
        echoId,
        media,
        user.displayName,
        user.photoURL
      );
      refresh();
      return updated;
    },
    [user, refresh]
  );

  const addMediaBatch = useCallback(
    async (echoId: string, mediaItems: EchoMedia[]): Promise<Echo | undefined> => {
      if (!user) throw new Error("User not authenticated");
      
      const updated = await EchoStorage.addMediaBatch(
        echoId,
        mediaItems,
        user.displayName,
        user.photoURL
      );
      refresh();
      return updated;
    },
    [user, refresh]
  );

  const removeMedia = useCallback(
    async (echoId: string, mediaId: string): Promise<Echo | undefined> => {
      const updated = await EchoStorage.removeMedia(echoId, mediaId);
      refresh();
      return updated;
    },
    [refresh]
  );

  const addCollaborator = useCallback(
    async (echoId: string, userId: string, collaboratorName: string): Promise<Echo | undefined> => {
      if (!user) throw new Error("User not authenticated");
      // Pass the actor's display name + avatar so activities can show the correct profile picture and name
      const updated = await EchoStorage.addCollaborator(
        echoId,
        userId,
        collaboratorName,
        user.displayName,
        user.photoURL
      );
      if (updated && !updated.isPrivate && updated.shareMode === "shared") {
        await syncSharedEchoToCloud(updated);
      }
      refresh();
      return updated;
    },
    [refresh, syncSharedEchoToCloud]
  );

  const removeCollaborator = useCallback(
    async (echoId: string, userId: string): Promise<Echo | undefined> => {
      const updated = await EchoStorage.removeCollaborator(echoId, userId);
      if (updated && !updated.isPrivate && updated.shareMode === "shared") {
        await syncSharedEchoToCloud(updated);
      }
      refresh();
      return updated;
    },
    [refresh, syncSharedEchoToCloud]
  );

  return {
    echoes: getAllEchoes(),
    userEchoes: getUserEchoes(),
    isLoading,
    getEchoById,
    createEcho,
    updateEcho,
    deleteEcho,
    updateEchoStatus,
    getEchoesByStatus,
    addMedia,
    addMediaBatch,
    removeMedia,
    addCollaborator,
    removeCollaborator,
    refresh,
  };
}
