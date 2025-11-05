import type { EchoMedia } from "@/types/echo";
import { Audio } from "expo-av";
import { useCallback, useRef, useState } from "react";

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
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [levels, setLevels] = useState<number[]>([]);
  const [allLevels, setAllLevels] = useState<number[]>([]);
  const pausedSoundRef = useRef<Audio.Sound | null>(null);

  // No-op

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      let granted = hasPermission === true;
      if (!granted) {
        const req = await Audio.requestPermissionsAsync();
        granted = req.status === "granted";
        setHasPermission(granted);
      }
      if (!granted) return false;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      const recordingOptions = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          isMeteringEnabled: true,
        },
      };
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
      setIsPaused(false);
      setLevels([]);
      setAllLevels([]);
      
      // Get URI for playback when paused
      const uri = recording.getURI();
      setRecordingUri(uri);
      // Set status updates
      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) return;
        if (typeof status.durationMillis === "number") setDurationMs(status.durationMillis);
        if (status.metering !== undefined && typeof status.metering === "number" && !isPaused) {
          const amp = Math.max(0, Math.min(1, (status.metering + 60) / 60));
          setAllLevels(prev => {
            const next = prev.length > 5000 ? prev.slice(prev.length - 4000) : prev;
            return [...next, amp];
          });
          setLevels(prev => {
            const MAX_LIVE = 1200;
            const next = prev.length > MAX_LIVE ? prev.slice(prev.length - (MAX_LIVE - 1)) : prev;
            return [...next, amp];
          });
        }
      });
      recording.setProgressUpdateInterval(50);
      
      return true;
    } catch (err) {
      console.error("Failed to start recording:", err);
      return false;
    }
  }, [hasPermission]);

  const stopRecording = useCallback(async (): Promise<EchoMedia | null> => {
    const recording = recordingRef.current;
    if (!recording) return null;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const media: EchoMedia = {
          id: generateUniqueId(),
          echoId: "",
          type: "audio",
          uri,
          createdAt: new Date().toISOString(),
          uploadedBy: "local",
        };
        
        setIsRecording(false);
        setIsPaused(false);
        setRecordingUri(null);
        recordingRef.current = null;
        try { await pausedSoundRef.current?.unloadAsync(); } catch {}
        pausedSoundRef.current = null;
        return media;
      }
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }

    setIsRecording(false);
    setIsPaused(false);
    setRecordingUri(null);
    recordingRef.current = null;
    try { await pausedSoundRef.current?.unloadAsync(); } catch {}
    pausedSoundRef.current = null;
    return null;
  }, []);

  const cancelRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
    } catch (err) {
      console.error("Failed to cancel recording:", err);
    }

    setIsRecording(false);
    setIsPaused(false);
    setRecordingUri(null);
    recordingRef.current = null;
    setLevels([]);
    setAllLevels([]);
    try { await pausedSoundRef.current?.unloadAsync(); } catch {}
    pausedSoundRef.current = null;
  }, []);

  const pauseRecording = useCallback(async (): Promise<boolean> => {
    const recording = recordingRef.current;
    if (!recording || !isRecording || isPaused) return false;

    try {
      await recording.pauseAsync();
      setIsPaused(true);
      // Prepare a playback sound for paused state if possible
      try {
        const { sound } = await recording.createNewLoadedSoundAsync(
          { isLooping: false, progressUpdateIntervalMillis: 50 },
          () => {}
        );
        // Unload any previous
        try { await pausedSoundRef.current?.unloadAsync(); } catch {}
        pausedSoundRef.current = sound;
      } catch (e) {
        // ignore if not supported
      }
      return true;
    } catch (err) {
      console.error("Failed to pause recording:", err);
      return false;
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(async (): Promise<boolean> => {
    const recording = recordingRef.current;
    if (!recording || !isRecording || !isPaused) return false;

    try {
      try { await pausedSoundRef.current?.unloadAsync(); } catch {}
      pausedSoundRef.current = null;
      await recording.startAsync();
      setIsPaused(false);
      return true;
    } catch (err) {
      console.error("Failed to resume recording:", err);
      return false;
    }
  }, [isRecording, isPaused]);

  const getPlaybackSoundAsync = useCallback(async (): Promise<Audio.Sound | null> => {
    if (pausedSoundRef.current) return pausedSoundRef.current;
    const uri = recordingUri;
    if (!uri) return null;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
      pausedSoundRef.current = sound;
      return sound;
    } catch (error) {
      if (__DEV__) console.error("Failed to create sound:", error);
      return null;
    }
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

