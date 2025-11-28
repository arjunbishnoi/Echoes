import { Storage } from "./asyncStorage";
import { STORAGE_KEYS } from "./storageKeys";

interface FriendNickname {
  friendId: string;
  nickname: string;
}

let nicknameCache: FriendNickname[] = [];
let removedFriendsCache: string[] = [];
let isInitialized = false;

export const FriendStorage = {
  isReady: (): boolean => {
    return isInitialized;
  },

  initialize: async (): Promise<void> => {
    if (isInitialized) return;
    try {
      const [nicknames, removed] = await Promise.all([
        Storage.get<FriendNickname[]>(STORAGE_KEYS.FRIEND_NICKNAMES),
        Storage.get<string[]>(STORAGE_KEYS.REMOVED_FRIENDS),
      ]);
      nicknameCache = (nicknames as FriendNickname[] | null) || [];
      removedFriendsCache = (removed as string[] | null) || [];
      isInitialized = true;
    } catch {
      nicknameCache = [];
      removedFriendsCache = [];
      isInitialized = true;
    }
  },

  persistNicknames: async (): Promise<boolean> => {
    try {
      return await Storage.set(STORAGE_KEYS.FRIEND_NICKNAMES, nicknameCache);
    } catch {
      return false;
    }
  },

  persistRemovedFriends: async (): Promise<boolean> => {
    try {
      return await Storage.set(STORAGE_KEYS.REMOVED_FRIENDS, removedFriendsCache);
    } catch {
      return false;
    }
  },

  setNickname: async (friendId: string, nickname: string): Promise<boolean> => {
    const existingIndex = nicknameCache.findIndex((n) => n.friendId === friendId);
    
    if (nickname.trim() === "") {
      // Remove nickname if empty
      if (existingIndex !== -1) {
        nicknameCache.splice(existingIndex, 1);
        return await FriendStorage.persistNicknames();
      }
      return true;
    }
    
    const updated: FriendNickname = { friendId, nickname: nickname.trim() };
    
    if (existingIndex !== -1) {
      nicknameCache[existingIndex] = updated;
    } else {
      nicknameCache.push(updated);
    }
    
    return await FriendStorage.persistNicknames();
  },

  getNickname: (friendId: string): string | null => {
    const nickname = nicknameCache.find((n) => n.friendId === friendId);
    return nickname ? nickname.nickname : null;
  },

  getAllNicknames: (): FriendNickname[] => {
    return [...nicknameCache];
  },

  removeFriend: async (friendId: string): Promise<boolean> => {
    if (!removedFriendsCache.includes(friendId)) {
      removedFriendsCache.push(friendId);
      return await FriendStorage.persistRemovedFriends();
    }
    return true;
  },

  isFriendRemoved: (friendId: string): boolean => {
    return removedFriendsCache.includes(friendId);
  },

  getRemovedFriends: (): string[] => {
    return [...removedFriendsCache];
  },

  clear: async () => {
    nicknameCache = [];
    removedFriendsCache = [];
    isInitialized = false;
    await Promise.all([
      Storage.remove(STORAGE_KEYS.FRIEND_NICKNAMES),
      Storage.remove(STORAGE_KEYS.REMOVED_FRIENDS),
    ]);
  },
};


