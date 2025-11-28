import { db } from "@/config/firebase.config";
import type { Echo, EchoActivity, EchoFilter, EchoMedia } from "@/types/echo";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Unsubscribe,
  updateDoc,
  where
} from "firebase/firestore";

export class EchoService {
  private static readonly ECHOES_COLLECTION = "echoes";
  private static readonly ACTIVITIES_SUBCOLLECTION = "activities";

  static async getUserEchoes(userId: string): Promise<Echo[]> {
    try {
      const echoesRef = collection(db, this.ECHOES_COLLECTION);
      const ownedQuery = query(echoesRef, where("ownerId", "==", userId));
      const ownedSnap = await getDocs(ownedQuery);
      const collaborativeQuery = query(echoesRef, where("collaboratorIds", "array-contains", userId));
      const collaborativeSnap = await getDocs(collaborativeQuery);
      const echoes: Echo[] = [];
      const echoIds = new Set<string>();
      
      ownedSnap.forEach((docSnap) => {
        const echo = { ...docSnap.data(), id: docSnap.id } as Echo;
        echoes.push(echo);
        echoIds.add(docSnap.id);
      });
      
      collaborativeSnap.forEach((docSnap) => {
        if (!echoIds.has(docSnap.id)) {
          const echo = { ...docSnap.data(), id: docSnap.id } as Echo;
          echoes.push(echo);
        }
      });
      
      return echoes;
    } catch {
      return [];
    }
  }

  static async getEcho(echoId: string): Promise<Echo | null> {
    try {
      const echoRef = doc(db, this.ECHOES_COLLECTION, echoId);
      const echoSnap = await getDoc(echoRef);
      
      if (!echoSnap.exists()) {
        return null;
      }
      
      return { ...echoSnap.data(), id: echoSnap.id } as Echo;
    } catch {
      return null;
    }
  }

  static async createEcho(data: Echo | Omit<Echo, "id">): Promise<Echo> {
    try {
      const echoId = "id" in data ? data.id : doc(collection(db, this.ECHOES_COLLECTION)).id;
      const createdAt = (data as Echo).createdAt ?? new Date().toISOString();
      const updatedAt = (data as Echo).updatedAt ?? new Date().toISOString();

      // IMPORTANT: Firestore does not allow undefined – coerce optional fields to null
      const payload = {
        id: echoId,
        title: data.title ?? "Untitled Echo",
        description: (data as Echo).description ?? null,
        imageUrl: (data as Echo).imageUrl ?? null,
        status: (data as Echo).status ?? "ongoing",
        isPrivate: Boolean((data as Echo).isPrivate),
        shareMode: (data as Echo).shareMode ?? "shared",
        ownerId: (data as Echo).ownerId ?? null,
        ownerName: (data as Echo).ownerName ?? null,
        ownerPhotoURL: (data as Echo).ownerPhotoURL ?? null,
        collaboratorIds: (data as Echo).collaboratorIds ?? [],
        lockDate: (data as Echo).lockDate ?? null,
        unlockDate: (data as Echo).unlockDate ?? null,
        createdAt,
        updatedAt,
      } as Record<string, any>;
      
      await setDoc(doc(db, this.ECHOES_COLLECTION, echoId), payload);
      
      return payload as Echo;
    } catch {
      throw new Error("Failed to create echo");
    }
  }

  static async updateEcho(echoId: string, data: Partial<Echo>): Promise<void> {
    try {
      const echoRef = doc(db, this.ECHOES_COLLECTION, echoId);
      await updateDoc(echoRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      throw new Error("Failed to update echo");
    }
  }

  static async deleteEcho(echoId: string): Promise<void> {
    try {
      const echoRef = doc(db, this.ECHOES_COLLECTION, echoId);
      await deleteDoc(echoRef);
    } catch {
      throw new Error("Failed to delete echo");
    }
  }

  static async addMedia(echoId: string, media: EchoMedia | Omit<EchoMedia, "id">): Promise<EchoMedia> {
    try {
      const echo = await this.getEcho(echoId);
      if (!echo) {
        throw new Error("Echo not found");
      }
      
      const mediaId = "id" in media ? media.id : doc(collection(db, "temp")).id;
      const newMedia: EchoMedia = {
        ...media,
        id: mediaId,
        createdAt: media.createdAt ?? new Date().toISOString(),
      };
      
      const echoRef = doc(db, this.ECHOES_COLLECTION, echoId);
      await updateDoc(echoRef, {
        media: arrayUnion(newMedia),
        updatedAt: new Date().toISOString(),
      });
      
      return newMedia;
    } catch {
      throw new Error("Failed to add media");
    }
  }

  static async getEchoActivities(echoId: string): Promise<EchoActivity[]> {
    try {
      const activitiesRef = collection(db, this.ECHOES_COLLECTION, echoId, this.ACTIVITIES_SUBCOLLECTION);
      const q = query(activitiesRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      
      const activities: EchoActivity[] = [];
      snapshot.forEach((docSnap) => {
        activities.push({ ...docSnap.data(), id: docSnap.id } as EchoActivity);
      });
      
      return activities;
    } catch {
      return [];
    }
  }

  static async getActivitiesForEchoes(echoIds: string[]): Promise<EchoActivity[]> {
    if (echoIds.length === 0) return [];
    
    try {
      // We can't do a collection group query easily filtered by parent ID without complex indexing
      // So we'll fetch in parallel for the relevant echoes
      // Limit parallel requests to avoid overwhelming connection
      const BATCH_SIZE = 5;
      const allActivities: EchoActivity[] = [];
      
      for (let i = 0; i < echoIds.length; i += BATCH_SIZE) {
        const batch = echoIds.slice(i, i + BATCH_SIZE);
        const promises = batch.map(id => this.getEchoActivities(id));
        const results = await Promise.all(promises);
        results.forEach(activities => allActivities.push(...activities));
      }
      
      return allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch {
      return [];
    }
  }

  static async addActivity(echoId: string, activity: EchoActivity | Omit<EchoActivity, "id">): Promise<void> {
    try {
      const activityId = "id" in activity ? activity.id : doc(collection(db, "temp")).id;
      const activitiesRef = collection(db, this.ECHOES_COLLECTION, echoId, this.ACTIVITIES_SUBCOLLECTION);
      
      // Normalize optional fields to avoid undefined in Firestore
      const payload: Record<string, any> = {
        id: activityId,
        echoId,
        type: activity.type,
        description: activity.description ?? null,
        timestamp:
          typeof activity.timestamp === "string"
            ? activity.timestamp
            : activity.timestamp ?? new Date().toISOString(),
        userId: activity.userId ?? null,
        userName: activity.userName ?? null,
        userAvatar: (activity as EchoActivity).userAvatar ?? null,
        mediaType: (activity as EchoActivity).mediaType ?? null,
        // keep any extra fields but strip undefined
      };

      await setDoc(doc(activitiesRef, activityId), payload);
    } catch {
      throw new Error("Failed to add activity");
    }
  }

  static async filterEchoes(filter: EchoFilter): Promise<Echo[]> {
    try {
      const echoesRef = collection(db, this.ECHOES_COLLECTION);
      let q = query(echoesRef);
      
      if (filter.status) {
        q = query(q, where("status", "==", filter.status));
      }
      if (filter.ownerId) {
        q = query(q, where("ownerId", "==", filter.ownerId));
      }
      if (filter.collaboratorId) {
        q = query(q, where("collaboratorIds", "array-contains", filter.collaboratorId));
      }
      if (filter.isPrivate !== undefined) {
        q = query(q, where("isPrivate", "==", filter.isPrivate));
      }
      if (filter.isPinned !== undefined) {
        q = query(q, where("isPinned", "==", filter.isPinned));
      }
      
      const snapshot = await getDocs(q);
      const echoes: Echo[] = [];
      
      snapshot.forEach((docSnap) => {
        echoes.push({ ...docSnap.data(), id: docSnap.id } as Echo);
      });
      
      return echoes;
    } catch {
      return [];
    }
  }

  static async addCollaborator(echoId: string, userId: string): Promise<void> {
    try {
      const echoRef = doc(db, this.ECHOES_COLLECTION, echoId);
      await updateDoc(echoRef, {
        collaboratorIds: arrayUnion(userId),
        updatedAt: new Date().toISOString(),
      });
    } catch {
      throw new Error("Failed to add collaborator");
    }
  }

  static async removeCollaborator(echoId: string, userId: string): Promise<void> {
    try {
      const echoRef = doc(db, this.ECHOES_COLLECTION, echoId);
      await updateDoc(echoRef, {
        collaboratorIds: arrayRemove(userId),
        updatedAt: new Date().toISOString(),
      });
    } catch {
      throw new Error("Failed to remove collaborator");
    }
  }

  static subscribeToEcho(echoId: string, callback: (echo: Echo | null) => void): Unsubscribe {
    const echoRef = doc(db, this.ECHOES_COLLECTION, echoId);
    return onSnapshot(echoRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ ...snapshot.data(), id: snapshot.id } as Echo);
      } else {
        callback(null);
      }
    });
  }

  static subscribeToUserEchoes(userId: string, callback: (echoes: Echo[]) => void): Unsubscribe {
    const echoesRef = collection(db, this.ECHOES_COLLECTION);
    const q = query(echoesRef, where("ownerId", "==", userId));
    
    return onSnapshot(q, (snapshot) => {
      const echoes: Echo[] = [];
      snapshot.forEach((docSnap) => {
        echoes.push({ ...docSnap.data(), id: docSnap.id } as Echo);
      });
      callback(echoes);
    });
  }
}
