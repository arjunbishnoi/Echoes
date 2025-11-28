import { storage } from "@/config/firebase.config";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable, UploadTaskSnapshot } from "firebase/storage";

export class StorageService {
  static async uploadFile(
    fileUri: string,
    storagePath: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, storagePath);
      
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      throw new Error("Failed to upload file");
    }
  }

  static async uploadEchoPhoto(
    echoId: string,
    photoUri: string,
    mediaId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = `echoes/${echoId}/photos/${mediaId}.jpg`;
    return this.uploadFile(photoUri, storagePath, onProgress);
  }

  static async uploadEchoVideo(
    echoId: string,
    videoUri: string,
    mediaId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = `echoes/${echoId}/videos/${mediaId}.mp4`;
    return this.uploadFile(videoUri, storagePath, onProgress);
  }

  static async uploadEchoAudio(
    echoId: string,
    audioUri: string,
    mediaId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = `echoes/${echoId}/audio/${mediaId}.m4a`;
    return this.uploadFile(audioUri, storagePath, onProgress);
  }

  static async uploadEchoDocument(
    echoId: string,
    documentUri: string,
    mediaId: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = `echoes/${echoId}/documents/${mediaId}_${fileName}`;
    return this.uploadFile(documentUri, storagePath, onProgress);
  }

  static async uploadProfilePhoto(
    userId: string,
    photoUri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = `users/${userId}/profile.jpg`;
    return this.uploadFile(photoUri, storagePath, onProgress);
  }

  static async deleteFile(storagePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      throw new Error("Failed to delete file");
    }
  }

  static async deleteEchoMedia(echoId: string, mediaId: string, type: "photo" | "video" | "audio" | "document"): Promise<void> {
    let storagePath: string;
    
    switch (type) {
      case "photo":
        storagePath = `echoes/${echoId}/photos/${mediaId}.jpg`;
        break;
      case "video":
        storagePath = `echoes/${echoId}/videos/${mediaId}.mp4`;
        break;
      case "audio":
        storagePath = `echoes/${echoId}/audio/${mediaId}.m4a`;
        break;
      case "document":
        storagePath = `echoes/${echoId}/documents/${mediaId}`;
        break;
    }
    
    return this.deleteFile(storagePath);
  }

  static getEchoCoverPath(echoId: string): string {
    return `echoes/${echoId}/cover.jpg`;
  }

  static async uploadEchoCover(
    echoId: string,
    imageUri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = this.getEchoCoverPath(echoId);
    return this.uploadFile(imageUri, storagePath, onProgress);
  }
}

