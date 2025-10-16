import { useCallback, useEffect, useState } from "react";
import { ActivityStorage } from "../lib/activityStorage";
import { useAuth } from "../lib/authContext";
import { EchoStorage } from "../lib/echoStorage";
import type { Echo, EchoMedia } from "../types/echo";

export function useEchoStorage() {
  const { user } = useAuth();
  const [, forceUpdate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (user) {
        EchoStorage.setCurrentUser(user.id);
      }
      await Promise.all([
        EchoStorage.initialize(),
        ActivityStorage.initialize(),
      ]);
      setIsLoading(false);
      forceUpdate((n) => n + 1);
    };
    init();
  }, [user]);

  const refresh = useCallback(() => {
    forceUpdate((n) => n + 1);
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

  const createEcho = useCallback(
    async (echo: Omit<Echo, "id" | "ownerId">): Promise<Echo> => {
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
        user.photoURL
      );
      refresh();
      return newEcho;
    },
    [user, refresh]
  );

  const updateEcho = useCallback(
    async (id: string, updates: Partial<Echo>): Promise<Echo | undefined> => {
      const updated = await EchoStorage.update(id, updates);
      refresh();
      return updated;
    },
    [refresh]
  );

  const deleteEcho = useCallback(
    async (id: string): Promise<boolean> => {
      const deleted = await EchoStorage.delete(id);
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

  const removeMedia = useCallback(
    async (echoId: string, mediaId: string): Promise<Echo | undefined> => {
      const updated = await EchoStorage.removeMedia(echoId, mediaId);
      refresh();
      return updated;
    },
    [refresh]
  );

  const addCollaborator = useCallback(
    async (echoId: string, userId: string, userName: string): Promise<Echo | undefined> => {
      const updated = await EchoStorage.addCollaborator(echoId, userId, userName);
      refresh();
      return updated;
    },
    [refresh]
  );

  const removeCollaborator = useCallback(
    async (echoId: string, userId: string): Promise<Echo | undefined> => {
      const updated = await EchoStorage.removeCollaborator(echoId, userId);
      refresh();
      return updated;
    },
    [refresh]
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
    removeMedia,
    addCollaborator,
    removeCollaborator,
    refresh,
  };
}
