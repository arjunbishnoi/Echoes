import { colors, radii, spacing } from "@/theme/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { AudioRecorder } from "expo-audio";
import {
    AudioModule,
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved: (asset: { uri: string; name?: string; mimeType?: string; duration?: number; size?: number }) => void;
};

export default function AudioRecorderModal({ visible, onClose, onSaved }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<AudioRecorder | null>(null);
  const [durationMs, setDurationMs] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const req = await requestRecordingPermissionsAsync();
      if (!mounted) return;
      setHasPermission(req.granted);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      interval = setInterval(async () => {
        try {
          const rec = recordingRef.current;
          if (!rec) return;
          const status = rec.getStatus();
          if (status.isRecording && typeof status.durationMillis === "number") {
            setDurationMs(status.durationMillis);
          }
        } catch {
          // ignore polling errors
        }
      }, 300);
    } else {
      setDurationMs(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    if (hasPermission !== true) return;
    try {
      if (!recordingRef.current) {
        recordingRef.current = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recordingRef.current.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      recordingRef.current.record();
      setIsRecording(true);
    } catch (error) {
      if (__DEV__) console.error("Failed to start modal recorder:", error);
    }
  }, [hasPermission]);

  const stopAndSave = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    try {
      await recording.stop();
      const status = recording.getStatus();
      if (status.url) {
        onSaved({
          uri: status.url,
          name: `echo-audio-${Date.now()}.m4a`,
          mimeType: "audio/m4a",
          duration: durationMs,
        });
      }
    } catch (error) {
      if (__DEV__) console.error("Failed to stop modal recorder:", error);
    }
    setIsRecording(false);
    recordingRef.current = null;
    onClose();
  }, [onClose, onSaved, durationMs]);

  const closeIfIdle = useCallback(() => {
    if (!isRecording) onClose();
  }, [isRecording, onClose]);

  const mm = Math.floor(durationMs / 1000 / 60).toString().padStart(2, "0");
  const ss = Math.floor((durationMs / 1000) % 60).toString().padStart(2, "0");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeIfIdle}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Record audio</Text>
          <Text style={styles.timer}>{mm}:{ss}</Text>
          <View style={styles.row}>
            {isRecording ? (
              <Pressable style={[styles.button, styles.danger]} onPress={stopAndSave} accessibilityLabel="Stop and save">
                <Ionicons name="stop" size={22} color={colors.white} />
              </Pressable>
            ) : (
              <Pressable style={styles.button} onPress={startRecording} disabled={hasPermission === false} accessibilityLabel="Start recording">
                <Ionicons name="mic" size={22} color={colors.white} />
              </Pressable>
            )}
            <Pressable style={styles.button} onPress={closeIfIdle} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    backgroundColor: colors.modalSurface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    minWidth: 280,
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  timer: {
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  button: {
    backgroundColor: "#444",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
  },
  danger: {
    backgroundColor: "#B3261E",
  },
});



