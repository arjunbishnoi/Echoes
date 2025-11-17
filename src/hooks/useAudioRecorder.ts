import type { EchoMedia } from "@/types/echo";
import type { AudioPlayer, AudioRecorder } from "expo-audio";
import {
    AudioModule,
    RecordingPresets,
    createAudioPlayer,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

const generateUniqueId = (): string => {
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).substr(2, 9);
  const random2 = Math.random().toString(36).substr(2, 9);
  const random3 = Math.floor(Math.random() * 1000000);
  return `${timestamp}-${random1}-${random2}-${random3}`;
};

export function useAudioRecorder() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const recordingRef = useRef<AudioRecorder | null>(null);
  const [levels, setLevels] = useState<number[]>([]);
  const [allLevels, setAllLevels] = useState<number[]>([]);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);
  const previewPlayerRef = useRef<AudioPlayer | null>(null);

  const stopStatusInterval = useCallback(() => {
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  }, []);

  const updateLevelsFromMetering = useCallback((metering: number) => {
    const amp = Math.max(0, Math.min(1, (metering + 60) / 60));
    setAllLevels((prev) => {
      const next = prev.length > 5000 ? prev.slice(prev.length - 4000) : prev;
      return [...next, amp];
    });
    setLevels((prev) => {
      const MAX_LIVE = 1200;
      const next = prev.length > MAX_LIVE ? prev.slice(prev.length - (MAX_LIVE - 1)) : prev;
      return [...next, amp];
    });
  }, []);

  const ensureRecorder = useCallback((): AudioRecorder => {
    if (!recordingRef.current) {
      recordingRef.current = new AudioModule.AudioRecorder({
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
    }
    return recordingRef.current;
  }, []);

  const releasePreviewPlayer = useCallback(() => {
    try {
      previewPlayerRef.current?.remove?.();
    } catch {
      // ignore preview cleanup errors
    }
    previewPlayerRef.current = null;
  }, []);

  const startStatusInterval = useCallback(
    (recorder: AudioRecorder) => {
      stopStatusInterval();
      statusIntervalRef.current = setInterval(() => {
        try {
          const status = recorder.getStatus();
          setDurationMs(status.durationMillis ?? 0);
          setRecordingUri(status.url ?? null);
          if (!isPausedRef.current && typeof status.metering === "number") {
            updateLevelsFromMetering(status.metering);
          }
        } catch {
          // ignore polling errors
        }
      }, 100);
    },
    [stopStatusInterval, updateLevelsFromMetering]
  );

  const clearRecorder = useCallback(async () => {
    try {
      await recordingRef.current?.stop();
    } catch {}
    stopStatusInterval();
    recordingRef.current = null;
    releasePreviewPlayer();
  }, [releasePreviewPlayer, stopStatusInterval]);

  useEffect(() => {
    return () => {
      void clearRecorder();
    };
  }, [clearRecorder]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      releasePreviewPlayer();
      let granted = hasPermission === true;
      if (!granted) {
        const permission = await requestRecordingPermissionsAsync();
        granted = permission.granted;
        setHasPermission(granted);
      }
      if (!granted) return false;

      const recorder = ensureRecorder();
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync({
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      recorder.record();

      setIsRecording(true);
      setIsPaused(false);
      isPausedRef.current = false;
      setLevels([]);
      setAllLevels([]);
      startStatusInterval(recorder);
      return true;
    } catch (err) {
      console.error("Failed to start recording:", err);
      return false;
    }
  }, [ensureRecorder, hasPermission, releasePreviewPlayer, startStatusInterval]);

  const stopRecording = useCallback(async (): Promise<EchoMedia | null> => {
    const recorder = recordingRef.current;
    if (!recorder) return null;

    try {
      await recorder.stop();
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }

    stopStatusInterval();
    const status = recorder.getStatus();
    const uri = status.url ?? null;

    setIsRecording(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setRecordingUri(uri);
    recordingRef.current = null;
    releasePreviewPlayer();

    if (uri) {
      return {
        id: generateUniqueId(),
        echoId: "",
        type: "audio",
        uri,
        createdAt: new Date().toISOString(),
        uploadedBy: "local",
      };
    }

    return null;
  }, [releasePreviewPlayer, stopStatusInterval]);

  const cancelRecording = useCallback(async () => {
    const recorder = recordingRef.current;
    if (!recorder) return;

    try {
      await recorder.stop();
    } catch (err) {
      console.error("Failed to cancel recording:", err);
    }

    stopStatusInterval();
    setIsRecording(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setRecordingUri(null);
    recordingRef.current = null;
    setLevels([]);
    setAllLevels([]);
    releasePreviewPlayer();
  }, [releasePreviewPlayer, stopStatusInterval]);

  const pauseRecording = useCallback(async (): Promise<boolean> => {
    const recorder = recordingRef.current;
    if (!recorder || !isRecording || isPaused) return false;

    try {
      recorder.pause();
      setIsPaused(true);
      isPausedRef.current = true;
      return true;
    } catch (err) {
      console.error("Failed to pause recording:", err);
      return false;
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(async (): Promise<boolean> => {
    const recorder = recordingRef.current;
    if (!recorder || !isRecording || !isPaused) return false;

    try {
      recorder.record();
      setIsPaused(false);
      isPausedRef.current = false;
      releasePreviewPlayer();
      return true;
    } catch (err) {
      console.error("Failed to resume recording:", err);
      return false;
    }
  }, [isRecording, isPaused]);

  const getPlaybackSoundAsync = useCallback(async (): Promise<AudioPlayer | null> => {
    if (!recordingUri) return null;
    if (!previewPlayerRef.current) {
      try {
        previewPlayerRef.current = createAudioPlayer({ uri: recordingUri }, { updateInterval: 200 });
      } catch (error) {
        if (__DEV__) console.error("Failed to create preview player:", error);
        previewPlayerRef.current = null;
        return null;
      }
    }
    return previewPlayerRef.current;
  }, [recordingUri]);

  return {
    hasPermission,
    isRecording,
    isPaused,
    durationMs,
    recordingUri,
    levels,
    allLevels,
    getPlaybackSoundAsync,
    startRecording,
    stopRecording,
    cancelRecording,
    pauseRecording,
    resumeRecording,
  };
}

