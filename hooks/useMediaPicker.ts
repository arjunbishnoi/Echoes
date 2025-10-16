import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import type { EchoMedia } from "../types/echo";

export function useMediaPicker() {
  const pickFromCamera = async (): Promise<EchoMedia | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need camera access to take photos.");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      return {
        id: Date.now().toString(),
        echoId: "",
        type: "photo",
        uri: result.assets[0].uri,
        thumbnailUri: result.assets[0].uri,
        createdAt: new Date().toISOString(),
        uploadedBy: "local",
      };
    }
    return null;
  };

  const pickFromPhotoLibrary = async (): Promise<EchoMedia | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your photos.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      return {
        id: Date.now().toString(),
        echoId: "",
        type: "photo",
        uri: result.assets[0].uri,
        thumbnailUri: result.assets[0].uri,
        createdAt: new Date().toISOString(),
        uploadedBy: "local",
      };
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
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      return {
        id: Date.now().toString(),
        echoId: "",
        type: "video",
        uri: result.assets[0].uri,
        thumbnailUri: result.assets[0].uri, // Using video URI as thumbnail for now
        createdAt: new Date().toISOString(),
        uploadedBy: "local",
      };
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
        id: Date.now().toString(),
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
        id: Date.now().toString(),
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

