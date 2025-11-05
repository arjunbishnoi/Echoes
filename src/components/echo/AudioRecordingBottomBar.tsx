import BottomBarBackground from "@/components/BottomBarBackground";
import AudioWaveform from "@/components/echo/AudioWaveform";
import { colors, sizes } from "@/theme/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { setAudioModeAsync } from "expo-audio";
import { Audio as AV } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  onSave: () => void;
  onCancel: () => void;
  onPause: () => void;
  onResume: () => void;
  isPaused?: boolean;
  recordingDurationMs?: number;
  levels?: number[];
  allLevels?: number[];
  getPlaybackSoundAsync?: () => Promise<import("expo-av").Audio.Sound | null>;
  skipInitialAnimation?: boolean;
  hasStagedMedia?: boolean;
};

const COLLAPSED_HEIGHT = sizes.floatingBar.height;
const EXPANDED_HEIGHT = 140;
const TOP_BTN_SIZE = 44;
const SMALL_BTN_SIZE = 36;
const H_PADDING = 16;
const ICON_GAP = 23;

export default function AudioRecordingBottomBar({
  onSave,
  onCancel,
  onPause,
  onResume,
  isPaused = false,
  recordingDurationMs = 0,
  levels,
  allLevels,
  getPlaybackSoundAsync,
  skipInitialAnimation = false,
  hasStagedMedia = false,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const narrowWidth = Math.floor(screenWidth * 0.80);
  const fullWidth = screenWidth - 32;

  const height = useSharedValue(skipInitialAnimation ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
  const width = useSharedValue(skipInitialAnimation ? fullWidth : narrowWidth);
  const waveformOpacity = useSharedValue(0);
  const waveformTranslateY = useSharedValue(10);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const onSaveRef = useRef(onSave);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onSaveRef.current = onSave;
    onCancelRef.current = onCancel;
  }, [onSave, onCancel]);

  // Expand on mount
  useEffect(() => {
    if (!skipInitialAnimation) {
      height.value = withSpring(EXPANDED_HEIGHT, {
        damping: 20,
        stiffness: 150,
        mass: 0.8,
      });

      width.value = withSpring(fullWidth, {
        damping: 20,
        stiffness: 150,
        mass: 0.8,
      });
    }

    waveformOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    waveformTranslateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [height, width, fullWidth, waveformOpacity, waveformTranslateY, skipInitialAnimation]);


  const handleCollapse = useCallback(
    (callback: () => void) => {
      setIsCollapsing(true);

      waveformOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      waveformTranslateY.value = withTiming(10, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });

      height.value = withSpring(
        COLLAPSED_HEIGHT,
        {
          damping: 20,
          stiffness: 180,
          mass: 0.6,
        },
        (finished) => {
          if (finished) {
            runOnJS(callback)();
            runOnJS(setIsCollapsing)(false);
          }
        }
      );

      width.value = withSpring(narrowWidth, {
        damping: 20,
        stiffness: 180,
        mass: 0.6,
      });
    },
    [height, width, narrowWidth, waveformOpacity, waveformTranslateY]
  );

  const handleSave = useCallback(() => {
    // Fade out before saving for smooth transition
    waveformOpacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.in(Easing.ease),
    });
    waveformTranslateY.value = withTiming(-10, {
      duration: 200,
      easing: Easing.in(Easing.cubic),
    });
    
    // Call onSave after a short delay to let animation play
    setTimeout(() => {
      onSaveRef.current();
    }, 150);
  }, [waveformOpacity, waveformTranslateY]);

  const handleCancel = useCallback(() => {
    // Don't collapse if there's staged media - fade out to prevent animation glitch
    if (hasStagedMedia) {
      setIsCollapsing(true);
      
      // Fade out content quickly
      waveformOpacity.value = withTiming(0, {
        duration: 150,
        easing: Easing.in(Easing.ease),
      });
      waveformTranslateY.value = withTiming(10, {
        duration: 150,
        easing: Easing.in(Easing.cubic),
      });
      
      // Call cancel immediately without collapsing the bar
      setTimeout(() => {
        onCancelRef.current();
        setIsCollapsing(false);
      }, 150);
    } else {
      // No staged media - collapse normally
      handleCollapse(() => {
        onCancelRef.current();
      });
    }
  }, [hasStagedMedia, handleCollapse, waveformOpacity, waveformTranslateY]);

  const handleResumeRecording = useCallback(async () => {
    // Ensure audio mode is set back to recording (in case it was changed)
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    } catch (error) {
      console.error("Failed to set audio mode for recording:", error);
    }
    
    onResume();
  }, [onResume]);
  
  // Format time as MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const barAnimatedStyle = useAnimatedStyle(() => {
    const progress =
      (height.value - COLLAPSED_HEIGHT) / (EXPANDED_HEIGHT - COLLAPSED_HEIGHT);
    const borderRadius = 30 - progress * 2;

    return {
      height: height.value,
      width: width.value,
      borderRadius,
    };
  });

  const topRowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveformOpacity.value,
    transform: [{ translateY: waveformTranslateY.value }],
  }));

  const waveformAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveformOpacity.value,
    transform: [{ translateY: waveformTranslateY.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const progress =
      (height.value - COLLAPSED_HEIGHT) / (EXPANDED_HEIGHT - COLLAPSED_HEIGHT);
    const radius = 30 - progress * 2;
    return { borderRadius: radius };
  });

  // Paused playback state
  const playerRef = useRef<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0); // 0..1
  const [progressWidth, setProgressWidth] = useState(0);
  const [soundDuration, setSoundDuration] = useState(0);

  useEffect(() => {
    return () => {
      // Unload on unmount
      (async () => {
        try {
          await playerRef.current?.unload?.();
        } catch (error) {
          // Ignore errors during unmount cleanup
        }
        playerRef.current = null;
      })();
    };
  }, []);

  const ensureLoadedAsync = useCallback(async () => {
    if (playerRef.current) return;
    if (!getPlaybackSoundAsync) return;
    // For SDK54 migration we accept a generic player with play/pause/seek/unload and onStatus(cb)
    const maybePlayer = await getPlaybackSoundAsync();
    if (maybePlayer) {
      // If it's an expo-av Sound, we adapt to a player-like API
      if (typeof maybePlayer.setOnPlaybackStatusUpdate === "function") {
        const sound = maybePlayer;
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (!status?.isLoaded) return;
          const dur = status.durationMillis ?? 1;
          const pos = status.positionMillis ?? 0;
          setPlayProgress(Math.max(0, Math.min(1, pos / dur)));
          setSoundDuration(dur);
          setIsPlaying(status.isPlaying === true);
        });
        playerRef.current = {
          play: () => sound.playAsync?.(),
          pause: () => sound.pauseAsync?.(),
          seek: (ms: number) => sound.setPositionAsync?.(ms),
          unload: () => sound.unloadAsync?.(),
        };
      } else {
        // Assume it's an expo-audio player with a similar surface
        const player = maybePlayer as any;
        if (player && typeof player.onStatus === "function") {
          player.onStatus((s: any) => {
            const dur = (s?.durationMillis ?? soundDuration) || 1;
            const pos = s?.positionMillis ?? 0;
            setPlayProgress(Math.max(0, Math.min(1, pos / dur)));
            setSoundDuration(dur);
            setIsPlaying(s?.isPlaying === true);
          });
        }
        playerRef.current = player;
      }
    }
  }, [getPlaybackSoundAsync, soundDuration]);

  const handleTogglePlay = useCallback(async () => {
    try {
      await ensureLoadedAsync();
      const player = playerRef.current;
      if (!player) return;
      // Try to derive playing state from our state; toggle accordingly
      if (isPlaying) {
        await player.pause?.();
        setIsPlaying(false);
      } else {
        try {
          await AV.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
          });
        } catch (error) {
          if (__DEV__) console.error("Failed to set audio mode for playback:", error);
        }
        await player.play?.();
        setIsPlaying(true);
      }
    } catch (error) {
      if (__DEV__) console.error("Failed to toggle playback:", error);
    }
  }, [ensureLoadedAsync, isPlaying]);

  const seekTo = useCallback(async (p: number) => {
    const clamped = Math.max(0, Math.min(1, p));
    setPlayProgress(clamped);
    try {
      await ensureLoadedAsync();
      const player = playerRef.current;
      const dur = soundDuration || 0;
      const newPos = Math.max(0, Math.min(dur, Math.round(clamped * dur)));
      await player?.seek?.(newPos);
    } catch (error) {
      if (__DEV__) console.error("Failed to seek audio:", error);
    }
  }, [ensureLoadedAsync, isPlaying, soundDuration]);

  const handleProgressLayout = useCallback((e: any) => {
    setProgressWidth(e.nativeEvent.layout.width || 0);
  }, []);

  const handleProgressTouch = useCallback(async (x: number) => {
    if (progressWidth <= 0) return;
    const p = x / progressWidth;
    await seekTo(p);
  }, [progressWidth, seekTo]);

  // Stop and unload on save/cancel
  useEffect(() => {
    const stopAndUnload = async () => {
      try {
        await playerRef.current?.pause?.();
        await playerRef.current?.unload?.();
      } catch (error) {
        if (__DEV__) console.error("Failed to unload audio player:", error);
      }
      playerRef.current = null;
      setIsPlaying(false);
      setPlayProgress(0);
    };
    onSaveRef.current = () => {
      stopAndUnload();
      onSave();
    };
    onCancelRef.current = () => {
      stopAndUnload();
      onCancel();
    };
  }, [onSave, onCancel]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.bar, barAnimatedStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, backgroundAnimatedStyle]}>
          <BottomBarBackground borderRadius={0} />
        </Animated.View>

        {/* Top Row: Timer with Cancel and Save buttons */}
        <Animated.View style={[styles.topRow, topRowAnimatedStyle]}>
          {/* Cancel Button */}
          <Pressable
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityRole="button"
            accessibilityLabel="Cancel recording"
            disabled={isCollapsing}
          >
            <Ionicons name="close" size={24} color={colors.white} />
          </Pressable>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(recordingDurationMs)}</Text>
          </View>

          {/* Save Button (Tick) */}
          <Pressable
            onPress={handleSave}
            style={styles.saveButton}
            accessibilityRole="button"
            accessibilityLabel="Save recording"
            disabled={isCollapsing}
          >
            <Ionicons name="checkmark" size={24} color={colors.black} />
          </Pressable>
        </Animated.View>

        {/* Bottom Row: Waveform or Paused Progress */}
        <View
          style={[
            styles.bottomRow,
            {
              paddingLeft: H_PADDING + Math.floor((TOP_BTN_SIZE + SMALL_BTN_SIZE) / 2) + ICON_GAP,
              paddingRight: H_PADDING + Math.floor((TOP_BTN_SIZE + SMALL_BTN_SIZE) / 2) + ICON_GAP,
            },
          ]}
          pointerEvents="box-none"
        >
          {isPaused ? (
            <>
              {/* Progress pills */}
              <Animated.View style={[styles.progressContainer, waveformAnimatedStyle]} onLayout={handleProgressLayout}>
                <View style={styles.pillBg} />
                <View style={styles.pillTrack} />
                <View style={[styles.pillFill, { width: `${Math.round(playProgress * 100)}%` }]} />
                <View
                  style={[styles.scrubber, { left: `${Math.round(playProgress * 100)}%` }]}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderGrant={(e) => {
                    const x = e.nativeEvent.locationX;
                    handleProgressTouch(x);
                  }}
                  onResponderMove={(e) => {
                    const x = e.nativeEvent.locationX;
                    handleProgressTouch(x);
                  }}
                  onResponderRelease={(e) => {
                    const x = e.nativeEvent.locationX;
                    handleProgressTouch(x);
                  }}
                />
              </Animated.View>

              {/* Play icon (centered, no background) */}
              <Animated.View style={[styles.centerPlayButton, waveformAnimatedStyle]} pointerEvents="box-none">
                <Pressable
                  onPress={handleTogglePlay}
                  style={styles.playButtonPressable}
                  accessibilityRole="button"
                  accessibilityLabel={isPlaying ? "Pause playback" : "Play recording"}
                  hitSlop={12}
                >
                  <Ionicons name={isPlaying ? "pause" : "play"} size={24} color={colors.white} />
                </Pressable>
              </Animated.View>

              {/* Resume recording icon */}
              <Animated.View pointerEvents="box-none" style={[styles.smallRight, waveformAnimatedStyle]}>
                <Pressable
                  onPress={handleResumeRecording}
                  style={styles.smallCircleRed}
                  accessibilityRole="button"
                  accessibilityLabel="Resume recording"
                >
                  <Ionicons name="mic" size={20} color={colors.white} />
                </Pressable>
              </Animated.View>
            </>
          ) : (
            <>
              {/* Pause recording icon on the right (mirrors resume icon when paused) */}
              <Animated.View pointerEvents="box-none" style={[styles.smallRight, waveformAnimatedStyle]}>
                <Pressable
                  onPress={onPause}
                  style={styles.smallCircleRed}
                  accessibilityRole="button"
                  accessibilityLabel="Pause recording"
                >
                  <Ionicons name="pause" size={20} color={colors.white} />
                </Pressable>
              </Animated.View>

              <Pressable
                style={styles.waveformPressable}
                onPress={onPause}
                accessibilityRole="button"
                accessibilityLabel="Pause recording"
              >
                <Animated.View style={[styles.waveformFullWidth, waveformAnimatedStyle]}>
                  <AudioWaveform isPaused={false} levels={levels} allLevels={allLevels} />
                </Animated.View>
              </Pressable>
            </>
          )}
        </View>
      </Animated.View>
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
  },
  bar: {
    backgroundColor: "transparent",
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    overflow: "hidden",
  },
  topRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 86,
  },
  timerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
  },
  timerText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  saveButton: {
    backgroundColor: colors.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  bottomRow: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: sizes.floatingBar.height,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  waveformPressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  waveformFullWidth: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  smallLeft: {
    position: "absolute",
    left: H_PADDING + TOP_BTN_SIZE / 2 - 10,
    alignSelf: "center",
    zIndex: 2,
  },
  centerPlayButton: {
    position: "absolute",
    left: H_PADDING,
    width: TOP_BTN_SIZE,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  playButtonPressable: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  smallRight: {
    position: "absolute",
    right: H_PADDING + TOP_BTN_SIZE / 2 - SMALL_BTN_SIZE / 2,
    alignSelf: "center",
    zIndex: 2,
  },
  smallCircleTranslucent: {
    width: SMALL_BTN_SIZE,
    height: SMALL_BTN_SIZE,
    borderRadius: SMALL_BTN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  smallCircleSolid: {
    width: SMALL_BTN_SIZE,
    height: SMALL_BTN_SIZE,
    borderRadius: SMALL_BTN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  smallCircleRed: {
    width: SMALL_BTN_SIZE,
    height: SMALL_BTN_SIZE,
    borderRadius: SMALL_BTN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B30",
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  progressContainer: {
    flex: 1,
    height: 12,
    justifyContent: "center",
  },
  pillBg: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  pillTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  pillFill: {
    position: "absolute",
    left: 0,
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  scrubber: {
    position: "absolute",
    top: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    transform: [{ translateX: -8 }],
  },
});

