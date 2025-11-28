import { MediaThumbnailImage } from "@/components/MediaThumbnailImage";
import { colors, spacing } from "@/theme/theme";
import type { EchoMedia } from "@/types/echo";
import { Image as ExpoImage } from "expo-image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const THUMBNAIL_SIZE = 60;
const THUMBNAIL_GAP = 8;
const DISMISS_THRESHOLD = 150;

interface MediaGalleryViewerProps {
  visible: boolean;
  media: EchoMedia[];
  initialIndex: number;
  onClose: () => void;
}

const ThumbnailItem = memo(({ item, index, isActive, onPress }: { item: EchoMedia; index: number; isActive: boolean; onPress: (index: number) => void }) => {
  return (
    <Pressable
      onPress={() => onPress(index)}
      style={[styles.thumbnail, isActive && styles.thumbnailActive]}
    >
      <MediaThumbnailImage
        uri={item.thumbnailUri}
        fallbackUri={item.uri}
        style={styles.thumbnailImage}
        contentFit="cover"
      />
    </Pressable>
  );
}, (prev, next) => {
  return prev.isActive === next.isActive && prev.item.id === next.item.id && prev.index === next.index;
});

export default function MediaGalleryViewer({ visible, media, initialIndex, onClose }: MediaGalleryViewerProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [controlsVisible, setControlsVisible] = useState(true);
  const mainListRef = useRef<FlatList>(null);
  const thumbnailListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setControlsVisible(true);
    }
  }, [visible, initialIndex]);

  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
    try {
      thumbnailListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    } catch (error) {
      // ScrollToIndex can fail if item is not yet rendered, ignore gracefully
    }
  }, []);

  const handleThumbnailPress = useCallback((index: number) => {
    try {
      mainListRef.current?.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    } catch (error) {
      // ScrollToIndex can fail if item is not yet rendered, ignore gracefully
    }
  }, []);

  const toggleControls = useCallback(() => {
    setControlsVisible((prev) => !prev);
  }, []);

  const renderMainItem = useCallback(({ item }: { item: EchoMedia }) => {
    return <ZoomableImage uri={item.uri} onTap={toggleControls} onDismiss={onClose} />;
  }, [toggleControls, onClose]);

  const renderThumbnail = useCallback(({ item, index }: { item: EchoMedia; index: number }) => {
    const isActive = index === currentIndex;
    return (
      <ThumbnailItem
        item={item}
        index={index}
        isActive={isActive}
        onPress={handleThumbnailPress}
      />
    );
  }, [currentIndex, handleThumbnailPress]);

  if (!visible || media.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        {controlsVisible && (
          <Animated.View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
            <Text style={styles.counter}>
              {currentIndex + 1} / {media.length}
            </Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.doneButton}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </Animated.View>
        )}

        <FlatList
          ref={mainListRef}
          data={media}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item.id || `media-${index}`}
          renderItem={renderMainItem}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            handleIndexChange(index);
          }}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          windowSize={3}
        />

        {controlsVisible && (
          <Animated.View style={[styles.thumbnailContainer, { paddingBottom: insets.bottom + spacing.md }]}>
            <FlatList
              ref={thumbnailListRef}
              data={media}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `thumb-${item.id || index}`}
              renderItem={renderThumbnail}
              contentContainerStyle={styles.thumbnailContent}
              initialScrollIndex={initialIndex}
              getItemLayout={(_, index) => ({
                length: THUMBNAIL_SIZE + THUMBNAIL_GAP,
                offset: (THUMBNAIL_SIZE + THUMBNAIL_GAP) * index,
                index,
              })}
              onScrollToIndexFailed={() => {}}
            />
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

interface ZoomableImageProps {
  uri: string;
  onTap: () => void;
  onDismiss: () => void;
}

function ZoomableImage({ uri, onTap, onDismiss }: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const dismissTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
        savedScale.value = 3;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .enabled(false)
    .onUpdate((e) => {
      if (savedScale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const verticalPanGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-10, 10])
    .onUpdate((e) => {
      if (savedScale.value <= 1 && e.translationY > 0) {
        dismissTranslateY.value = e.translationY;
        scale.value = 1 - e.translationY / (SCREEN_HEIGHT * 2);
      }
    })
    .onEnd((e) => {
      if (savedScale.value <= 1 && e.translationY > DISMISS_THRESHOLD) {
        dismissTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
        scale.value = withTiming(0.5, { duration: 200 });
        runOnJS(onDismiss)();
      } else {
        dismissTranslateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      if (scale.value > 1) {
        scale.value = withTiming(1, { duration: 250 });
        translateX.value = withTiming(0, { duration: 250 });
        translateY.value = withTiming(0, { duration: 250 });
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withTiming(2, { duration: 250 });
        savedScale.value = 2;
      }
    });

  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd(() => {
      'worklet';
      if (savedScale.value <= 1 && onTap) {
        runOnJS(onTap)();
      }
    });

  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(
      singleTapGesture,
      Gesture.Race(verticalPanGesture, Gesture.Simultaneous(pinchGesture, panGesture))
    )
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value + dismissTranslateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.imageContainer}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.imageWrapper, animatedStyle]}>
          <ExpoImage
            source={{ uri }}
            style={styles.fullImage}
            contentFit="contain"
            transition={200}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  counter: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  doneButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  doneText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingTop: spacing.md,
  },
  thumbnailContent: {
    paddingHorizontal: spacing.md,
    gap: THUMBNAIL_GAP,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: colors.white,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailDeleteButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
});
