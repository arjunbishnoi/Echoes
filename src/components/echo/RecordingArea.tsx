import EchoMediaBottomBar from "@/components/echo/EchoMediaBottomBar";
import ExpandedMediaBottomBar from "@/components/echo/ExpandedMediaBottomBar";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useMediaPicker } from "@/hooks/useMediaPicker";
import { useCallback, useEffect, useState } from "react";

type EchoMedia = import("@/types/echo").EchoMedia;

type RecordingAreaProps = {
  stagedMedia: EchoMedia[];
  onStageMedia: (media: EchoMedia | EchoMedia[]) => void;
  onRemoveItem: (id: string) => void;
  onCommitMedia: () => void;
  transitioningFromRecording?: boolean;
};

export default function RecordingArea({
  stagedMedia,
  onStageMedia,
  onRemoveItem,
  onCommitMedia,
  transitioningFromRecording,
}: RecordingAreaProps) {
  const { pickFromCamera, pickFromPhotoLibrary, pickDocument } = useMediaPicker();
  const {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    isPaused,
    pauseRecording,
    resumeRecording,
    durationMs,
    recordingUri,
    levels,
    allLevels,
    getPlaybackSoundAsync,
  } = useAudioRecorder();

  // Track when we're transitioning from canceling with staged media
  const [transitioningFromCancel, setTransitioningFromCancel] = useState(false);
  // Track when we just removed the last staged media item
  const [justClearedMedia, setJustClearedMedia] = useState(false);

  const handleStartRecording = useCallback(async () => {
    const success = await startRecording();
    if (!success) {
      // Permissions UI is handled in the hook; nothing else here
    }
  }, [startRecording]);

  const handleSaveRecording = useCallback(async () => {
    const media = await stopRecording();
    if (media) {
      onStageMedia(media);
    }
  }, [stopRecording, onStageMedia]);

  const handleCancelRecording = useCallback(async () => {
    // If there's staged media, we're transitioning to ExpandedMediaBottomBar
    if (stagedMedia.length > 0) {
      setTransitioningFromCancel(true);
      await cancelRecording();
      // Reset after the transition completes
      setTimeout(() => setTransitioningFromCancel(false), 100);
    } else {
      await cancelRecording();
    }
  }, [cancelRecording, stagedMedia.length]);

  // Detect when staged media is cleared (going from items to empty)
  useEffect(() => {
    if (stagedMedia.length === 0 && !isRecording) {
      // Check if we just had media (by setting a flag and clearing it after mount)
      const timer = setTimeout(() => setJustClearedMedia(false), 100);
      return () => clearTimeout(timer);
    } else if (stagedMedia.length > 0) {
      setJustClearedMedia(true);
    }
  }, [stagedMedia.length, isRecording]);

  // Only show media bar when not recording and nothing is staged
  if (!isRecording && stagedMedia.length === 0) {
    return (
      <EchoMediaBottomBar
        onPressCamera={async () => {
          const media = await pickFromCamera();
          if (media) onStageMedia(media);
        }}
        onPressGallery={async () => {
          const media = await pickFromPhotoLibrary();
          if (media) onStageMedia(media);
        }}
        onPressAudio={handleStartRecording}
        onPressFiles={async () => {
          const media = await pickDocument();
          if (media) onStageMedia(media);
        }}
        skipAnimation={justClearedMedia}
      />
    );
  }

  // Recording UI
  if (isRecording) {
    const AudioRecordingBottomBar = require("@/components/echo/AudioRecordingBottomBar").default;
    return (
      <AudioRecordingBottomBar
        onSave={handleSaveRecording}
        onCancel={handleCancelRecording}
        onPause={pauseRecording}
        onResume={resumeRecording}
        isPaused={isPaused}
        recordingUri={recordingUri}
        recordingDurationMs={durationMs}
        levels={levels}
        allLevels={allLevels}
        getPlaybackSoundAsync={getPlaybackSoundAsync}
        skipInitialAnimation={stagedMedia.length > 0}
        hasStagedMedia={stagedMedia.length > 0}
        onPressCamera={async () => {
          const media = await pickFromCamera();
          if (media) onStageMedia(media);
        }}
        onPressGallery={async () => {
          const media = await pickFromPhotoLibrary();
          if (media) onStageMedia(media);
        }}
        onPressAudio={handleStartRecording}
        onPressFiles={async () => {
          const media = await pickDocument();
          if (media) onStageMedia(media);
        }}
      />
    );
  }

  // Staged media UI
  return (
    <ExpandedMediaBottomBar
      selectedMedia={stagedMedia}
      onRemoveItem={onRemoveItem}
      onAddMedia={onCommitMedia}
      onPressCamera={async () => {
        const media = await pickFromCamera();
        if (media) onStageMedia(media);
      }}
      onPressGallery={async () => {
        const media = await pickFromPhotoLibrary();
        if (media) onStageMedia(Array.isArray(media) ? media : [media]);
      }}
      onPressAudio={handleStartRecording}
      onPressFiles={async () => {
        const media = await pickDocument();
        if (media) onStageMedia(media);
      }}
      skipInitialAnimation={!!transitioningFromRecording || transitioningFromCancel}
    />
  );
}


