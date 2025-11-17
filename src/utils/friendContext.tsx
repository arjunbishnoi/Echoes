import type { UserProfile } from "@/types/user";
import { useAuth } from "@/utils/authContext";
import { UserService } from "@/utils/services/userService";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type FriendContextType = {
  friends: UserProfile[];
  friendsById: Record<string, UserProfile>;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const FriendContext = createContext<FriendContextType | null>(null);

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFriends = useCallback(async () => {
    if (!user || isGuest) {
      setFriends([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await UserService.getFriends(user.id);
      setFriends(data);
    } catch (error) {
      console.error("Failed to load friends:", error);
      setFriends([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isGuest]);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  const friendsById = useMemo(() => {
    const map: Record<string, UserProfile> = {};
    for (const friend of friends) {
      map[friend.id] = friend;
    }
    return map;
  }, [friends]);

  const value = useMemo(
    () => ({
      friends,
      friendsById,
      isLoading,
      refresh: loadFriends,
    }),
    [friends, friendsById, isLoading, loadFriends]
  );

  return <FriendContext.Provider value={value}>{children}</FriendContext.Provider>;
}

export function useFriends() {
  const context = useContext(FriendContext);
  if (!context) {
    throw new Error("useFriends must be used within FriendProvider");
  }
  return context;
}

