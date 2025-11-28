import { db } from "@/config/firebase.config";
import type { Echo } from "@/types/echo";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  Unsubscribe,
  where,
} from "firebase/firestore";
import { StorageService } from "./storageService";

const ECHOES_COLLECTION = "echoes";

function shouldSyncEcho(echo: Echo): boolean {
  return echo.shareMode === "shared" && !echo.isPrivate;
}

function buildParticipantIds(echo: Echo): string[] {
  const participants = new Set<string>();
  if (echo.ownerId) participants.add(echo.ownerId);
  (echo.collaboratorIds ?? []).forEach((id) => participants.add(id));
  return Array.from(participants);
}

function mapFirestoreEcho(data: Record<string, any>, id: string): Echo {
  return {
    id,
    title: data.title ?? "Untitled Echo",
    description: data.description ?? undefined,
    imageUrl: data.imageUrl ?? undefined,
    status: data.status ?? "ongoing",
    isPrivate: Boolean(data.isPrivate),
    shareMode: data.shareMode ?? "shared",
    ownerId: data.ownerId,
    ownerName: data.ownerName ?? undefined,
    ownerPhotoURL: data.ownerPhotoURL ?? undefined,
    collaboratorIds: data.collaboratorIds ?? [],
    lockDate: data.lockDate ?? undefined,
    unlockDate: data.unlockDate ?? undefined,
    createdAt: data.createdAt ?? undefined,
    updatedAt: data.updatedAt ?? undefined,
  };
}

export class EchoCloudService {
  static async saveEcho(echo: Echo): Promise<Echo> {
    if (!shouldSyncEcho(echo)) {
      return echo;
    }

    let imageUrl = echo.imageUrl;
    try {
      if (imageUrl && imageUrl.startsWith("file://")) {
        imageUrl = await StorageService.uploadEchoCover(echo.id, imageUrl);
      }
    } catch {
      // Ignore cover upload failures; continue with existing URL
    }

    const now = new Date().toISOString();
    const payload = {
      title: echo.title,
      description: echo.description ?? null,
      imageUrl: imageUrl ?? null,
      status: echo.status ?? "ongoing",
      isPrivate: echo.isPrivate,
      shareMode: echo.shareMode,
      ownerId: echo.ownerId,
      ownerName: echo.ownerName ?? null,
      ownerPhotoURL: echo.ownerPhotoURL ?? null,
      collaboratorIds: echo.collaboratorIds ?? [],
      participantIds: buildParticipantIds(echo),
      lockDate: echo.lockDate ?? null,
      unlockDate: echo.unlockDate ?? null,
      createdAt: echo.createdAt ?? now,
      updatedAt: now,
    };

    await setDoc(doc(db, ECHOES_COLLECTION, echo.id), payload, { merge: true });
    return { ...echo, imageUrl: imageUrl ?? echo.imageUrl };
  }

  static subscribeToUserEchoes(userId: string, callback: (echoes: Echo[]) => void): Unsubscribe {
    const echoesRef = collection(db, ECHOES_COLLECTION);
    const q = query(echoesRef, where("participantIds", "array-contains", userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const echoes: Echo[] = [];
        snapshot.forEach((docSnap) => {
          echoes.push(mapFirestoreEcho(docSnap.data(), docSnap.id));
        });
        callback(echoes);
      },
      (_error) => {
        callback([]);
      }
    );
  }

  static async deleteEcho(echoId: string): Promise<void> {
    await deleteDoc(doc(db, ECHOES_COLLECTION, echoId));
  }
}

