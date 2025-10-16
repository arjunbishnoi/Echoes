import { ref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTaskSnapshot } from "firebase/storage";
import { storage } from "../../config/firebase.config";

/**
 * StorageService - Handles Firebase Storage operations for media files
 */
export class StorageService {
  /**
   * Upload file to Firebase Storage
   * @param filePath - Local file URI
   * @param storagePath - Path in Firebase Storage (e.g., "echoes/echoId/mediaId.jpg")
   * @param onProgress - Optional callback for upload progress
   * @returns Download URL of uploaded file
   */
  static async uploadFile(
    fileUri: string,
    storagePath: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Fetch the file as a blob
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      // Create a reference to the file location
      const storageRef = ref(storage, storagePath);
      
      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          async () => {
            // Upload completed successfully, get download URL
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
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  }

  /**
   * Upload photo to echo folder
   */
  static async uploadEchoPhoto(
    echoId: string,
    photoUri: string,
    mediaId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = `echoes/${echoId}/photos/${mediaId}.jpg`;
    return this.uploadFile(photoUri, storagePath, onProgress);
  }

  /**
   * Upload video to echo folder
   */
  static async uploadEchoVideo(
    echoId: string,
    videoUri: string,
    mediaId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = `echoes/${echoId}/videos/${mediaId}.mp4`;
    return this.uploadFile(videoUri, storagePath, onProgress);
  }

  /**
   * Upload audio to echo folder
   */
  static async uploadEchoAudio(
    echoId: string,
    audioUri: string,
    mediaId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = `echoes/${echoId}/audio/${mediaId}.m4a`;
    return this.uploadFile(audioUri, storagePath, onProgress);
  }

  /**
   * Upload document to echo folder
   */
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

  /**
   * Upload user profile photo
   */
  static async uploadProfilePhoto(
    userId: string,
    photoUri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = `users/${userId}/profile.jpg`;
    return this.uploadFile(photoUri, storagePath, onProgress);
  }

  /**
   * Delete file from Firebase Storage
   */
  static async deleteFile(storagePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file");
    }
  }

  /**
   * Delete echo media file
   */
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
        // For documents, we need the full file name with extension
        // This is a simplified version - in production, store the full storage path in Firestore
        storagePath = `echoes/${echoId}/documents/${mediaId}`;
        break;
    }
    
    return this.deleteFile(storagePath);
  }

  /**
   * Get storage path for echo cover image
   */
  static getEchoCoverPath(echoId: string): string {
    return `echoes/${echoId}/cover.jpg`;
  }

  /**
   * Upload echo cover image
   */
  static async uploadEchoCover(
    echoId: string,
    imageUri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storagePath = this.getEchoCoverPath(echoId);
    return this.uploadFile(imageUri, storagePath, onProgress);
  }
}

