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
  
  ownerId: string;
  ownerName?: string;
  ownerPhotoURL?: string;
  collaboratorIds?: string[];
  
  lockDate?: string;
  unlockDate?: string;
  
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
  
  uploadedBy: string;
  uploadedByName?: string;
  uploadedByPhotoURL?: string;
  
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
  
  targetUserId?: string;
  targetUserName?: string;
  mediaId?: string;
}
