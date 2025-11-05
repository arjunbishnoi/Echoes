export const STORAGE_KEYS = {
  ECHOES: "@echoes/data",
  ACTIVITIES: "@echoes/activities",
  PINNED: "@echoes/pinned",
  HIDDEN_FROM_HOME: "@echoes/hidden",
  FAVORITES: "@echoes/favorites",
  FRIEND_NICKNAMES: "@echoes/friend-nicknames",
  REMOVED_FRIENDS: "@echoes/removed-friends",
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];


