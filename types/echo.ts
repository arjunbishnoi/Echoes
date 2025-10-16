export interface Echo {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  status?: "ongoing" | "locked" | "unlocked";
  isLocked?: boolean;
  media?: EchoMedia[];
  
  // Firebase-ready user fields
  ownerId: string; // The user who created the echo
  ownerName?: string; // Cached for display
  ownerPhotoURL?: string; // Cached for display
  collaboratorIds?: string[]; // User IDs (replacing participants)
  
  // Lock/unlock dates
  lockDate?: string;
  unlockDate?: string;
  
  // Privacy and sharing
  isPrivate: boolean;
  shareMode: "private" | "shared";
}

export type EchoStatus = "ongoing" | "locked" | "unlocked";

export interface EchoMedia {
  id: string;
  echoId: string;
  type: "photo" | "video" | "audio" | "document";
  uri: string;
  thumbnailUri?: string;
  createdAt: Date | string;
  
  // Firebase-ready fields
  uploadedBy: string; // User ID
  uploadedByName?: string; // Cached for display
  uploadedByPhotoURL?: string; // Cached for display
  
  // Firebase storage path (for when we add Firebase Storage)
  storagePath?: string;
}

export interface EchoActivity {
  id: string;
  echoId: string;
  type: "echo_created" | "friend_added" | "media_uploaded" | "echo_locked" | "echo_unlocked" | "collaborator_added";
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  timestamp: Date | string;
  mediaType?: "photo" | "video" | "audio" | "document";
  
  // Additional context
  targetUserId?: string; // For friend_added, collaborator_added events
  targetUserName?: string;
  mediaId?: string; // For media_uploaded events
}
