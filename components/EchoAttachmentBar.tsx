import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, radii, sizes, spacing } from "../theme/theme";
import BottomBarBackground from "./BottomBarBackground";

export type AttachmentType = "camera" | "gallery" | "audio" | "file";

export type AttachmentResult = {
  type: AttachmentType;
  assets: Array<{
    uri: string;
    name?: string;
    mimeType?: string;
    size?: number;
    width?: number;
    height?: number;
    duration?: number;
  }>;
};

type Props = {
  onResult?: (result: AttachmentResult) => void;
  widthPercent?: number | string;
};

export default function EchoAttachmentBar({ onResult, widthPercent }: Props) {

  const iconButtons = useMemo(
    () => [
      { key: "camera" as const, icon: "camera" as const, onPress: () => handleCamera() },
      { key: "gallery" as const, icon: "image" as const, onPress: () => handleGallery() },
      { key: "audio" as const, icon: "mic" as const, onPress: () => handleAudio() },
      { key: "file" as const, icon: "document" as const, onPress: () => handleFiles() },
    ],
    []
  );

  const handleCamera = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        allowsMultipleSelection: false,
        videoMaxDuration: 60,
      });
      if (!result.canceled) {
        const assets = result.assets?.map(a => ({
          uri: a.uri,
          name: a.fileName ?? undefined,
          mimeType: a.mimeType,
          size: a.fileSize,
          width: a.width,
          height: a.height,
          duration: a.duration ?? undefined,
        })) ?? [];
        onResult?.({ type: "camera", assets });
      }
    } catch (e) {}
  }, [onResult]);

  const handleGallery = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: false,
        quality: 1,
      });
      if (!result.canceled) {
        const assets = result.assets?.map(a => ({
          uri: a.uri,
          name: a.fileName ?? undefined,
          mimeType: a.mimeType,
          size: a.fileSize,
          width: a.width,
          height: a.height,
          duration: a.duration ?? undefined,
        })) ?? [];
        onResult?.({ type: "gallery", assets });
      }
    } catch (e) {}
  }, [onResult]);

  const handleAudio = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ["audio/*"], multiple: false, copyToCacheDirectory: true });
      const assets = !res.canceled && res.assets ? res.assets : [];
      if (assets.length > 0) {
        onResult?.({ type: "audio", assets });
      }
    } catch (e) {}
  }, [onResult]);

  const handleFiles = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
      const assets = !result.canceled && result.assets ? result.assets : [];
      if (assets.length > 0) {
        onResult?.({ type: "file", assets });
      }
    } catch (e) {}
  }, [onResult]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={[styles.bar, typeof widthPercent !== "undefined" ? { width: widthPercent } : null]}>
        <BottomBarBackground />
        <View style={styles.row}>
          {iconButtons.map(btn => (
            <Pressable key={btn.key} onPress={btn.onPress} style={styles.action} hitSlop={12} accessibilityRole="button" accessibilityLabel={btn.key}>
              <Ionicons name={btn.icon} size={22} color={colors.textPrimary} />
            </Pressable>
          ))}
        </View>
      </View>
      {/* Audio recording temporarily disabled to avoid expo-av deprecation warning */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: sizes.floatingBar.bottomOffset,
    alignItems: "center",
    zIndex: 2000,
  },
  bar: {
    height: sizes.floatingBar.height,
    borderRadius: radii.pill,
    width: sizes.floatingBar.widthPercent,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    overflow: "hidden",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: spacing.lg,
  },
  action: {
    width: sizes.floatingBar.sideButtonSize,
    height: sizes.floatingBar.sideButtonSize,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});


