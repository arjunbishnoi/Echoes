export interface User {
  id: string; // Firebase UID
  email: string;
  displayName: string;
  photoURL?: string;
  username?: string;
  friendCode?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  profileCompleted?: boolean; // Track if user has completed personalization
  // Firebase-ready fields
  friendIds?: string[]; // Array of user IDs
  blockedUserIds?: string[];
  settings?: UserSettings;
}

export interface UserSettings {
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    friendRequests: boolean;
    echoUpdates: boolean;
    echoUnlocks: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    allowFriendRequests: boolean;
  };
  theme: "light" | "dark" | "auto";
}

export interface UserProfile {
  id: string;
  displayName: string;
  username?: string;
  photoURL?: string;
  bio?: string;
}

// For friend requests
export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
  fromDisplayName?: string;
  fromUsername?: string;
  fromPhotoURL?: string;
}

// For friendship relationships
export interface Friendship {
  id: string;
  userId1: string;
  userId2: string;
  createdAt: string;
}

export interface FriendCodeLookupResult {
  id: string;
  displayName: string;
  username?: string;
}

