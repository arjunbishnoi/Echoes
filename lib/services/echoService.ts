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
import { db } from "../../config/firebase.config";
import type { Echo, EchoActivity, EchoFilter, EchoMedia } from "../../types/echo";

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
    } catch (error) {
      console.error("Error getting user echoes:", error);
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
    } catch (error) {
      console.error("Error getting echo:", error);
      return null;
    }
  }

  static async createEcho(data: Omit<Echo, "id">): Promise<Echo> {
    try {
      const echoId = doc(collection(db, this.ECHOES_COLLECTION)).id;
      const newEcho: Echo = {
        ...data,
        id: echoId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, this.ECHOES_COLLECTION, echoId), newEcho);
      
      return newEcho;
    } catch (error) {
      console.error("Error creating echo:", error);
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
    } catch (error) {
      console.error("Error updating echo:", error);
      throw new Error("Failed to update echo");
    }
  }

  static async deleteEcho(echoId: string): Promise<void> {
    try {
      const echoRef = doc(db, this.ECHOES_COLLECTION, echoId);
      await deleteDoc(echoRef);
    } catch (error) {
      console.error("Error deleting echo:", error);
      throw new Error("Failed to delete echo");
    }
  }

  static async addMedia(echoId: string, media: Omit<EchoMedia, "id">): Promise<EchoMedia> {
    try {
      const echo = await this.getEcho(echoId);
      if (!echo) {
        throw new Error("Echo not found");
      }
      
      const mediaId = doc(collection(db, "temp")).id;
      const newMedia: EchoMedia = {
        ...media,
        id: mediaId,
        createdAt: new Date().toISOString(),
      };
      
      const echoRef = doc(db, this.ECHOES_COLLECTION, echoId);
      await updateDoc(echoRef, {
        media: arrayUnion(newMedia),
        updatedAt: new Date().toISOString(),
      });
      
      return newMedia;
    } catch (error) {
      console.error("Error adding media:", error);
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
    } catch (error) {
      console.error("Error getting echo activities:", error);
      return [];
    }
  }

  static async addActivity(echoId: string, activity: Omit<EchoActivity, "id">): Promise<void> {
    try {
      const activityId = doc(collection(db, "temp")).id;
      const activitiesRef = collection(db, this.ECHOES_COLLECTION, echoId, this.ACTIVITIES_SUBCOLLECTION);
      await setDoc(doc(activitiesRef, activityId), {
        ...activity,
        id: activityId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding activity:", error);
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
    } catch (error) {
      console.error("Error filtering echoes:", error);
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
    } catch (error) {
      console.error("Error adding collaborator:", error);
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
    } catch (error) {
      console.error("Error removing collaborator:", error);
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
