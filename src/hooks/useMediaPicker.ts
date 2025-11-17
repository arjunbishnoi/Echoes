import type { EchoMedia } from "@/types/echo";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

const generateUniqueId = (): string => {
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).substr(2, 9);
  const random2 = Math.random().toString(36).substr(2, 9);
  const random3 = Math.floor(Math.random() * 1000000);
  return `${timestamp}-${random1}-${random2}-${random3}`;
};

const buildEchoMediaFromAsset = (asset: ImagePicker.ImagePickerAsset): EchoMedia => {
  const type = asset.type === "video" ? "video" : "photo";
  return {
    id: generateUniqueId(),
    echoId: "",
    type,
    uri: asset.uri,
    thumbnailUri: asset.uri,
    createdAt: new Date().toISOString(),
    uploadedBy: "local",
  };
};

export function useMediaPicker() {
  const pickFromCamera = async (): Promise<EchoMedia | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need camera access to take photos.");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 0.95,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      return buildEchoMediaFromAsset(result.assets[0]);
    }
    return null;
  };

  const pickFromPhotoLibrary = async (): Promise<EchoMedia[] | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your photos.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos", "livePhotos"],
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
      exif: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      return result.assets.map((asset) => buildEchoMediaFromAsset(asset));
    }
    return null;
  };

  const pickVideo = async (): Promise<EchoMedia | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your media library.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 0.95,
    });

    if (!result.canceled && result.assets[0]) {
      return buildEchoMediaFromAsset(result.assets[0]);
    }
    return null;
  };

  const pickAudio = async (): Promise<EchoMedia | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      return {
        id: generateUniqueId(),
        echoId: "",
        type: "audio",
        uri: result.assets[0].uri,
        createdAt: new Date().toISOString(),
        uploadedBy: "local",
      };
    }
    return null;
  };

  const pickDocument = async (): Promise<EchoMedia | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      return {
        id: generateUniqueId(),
        echoId: "",
        type: "document",
        uri: result.assets[0].uri,
        createdAt: new Date().toISOString(),
        uploadedBy: "local",
      };
    }
    return null;
  };

  return {
    pickFromCamera,
    pickFromPhotoLibrary,
    pickVideo,
    pickAudio,
    pickDocument,
  };
}

