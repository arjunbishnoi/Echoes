import BottomBarBackground from "@/components/BottomBarBackground";
import MediaGalleryViewer from "@/components/MediaGalleryViewer";
import { colors, sizes } from "@/theme/theme";
import type { EchoMedia } from "@/types/echo";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  selectedMedia: EchoMedia[];
  onRemoveItem: (id: string) => void;
  onAddMedia: () => void;
  onPressCamera: () => void;
  onPressGallery: () => void;
  onPressAudio: () => void;
  onPressFiles: () => void;
  skipInitialAnimation?: boolean;
};

const COLLAPSED_HEIGHT = sizes.floatingBar.height;
const EXPANDED_HEIGHT = 140;
const THUMBNAIL_SIZE = 60;

export default function ExpandedMediaBottomBar({
  selectedMedia,
  onRemoveItem,
  onAddMedia,
  onPressCamera,
  onPressGallery,
  onPressAudio,
  onPressFiles,
  skipInitialAnimation = false,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const narrowWidth = Math.floor(screenWidth * 0.80); // Match regular bar
  const fullWidth = screenWidth - 32; // Full width with margins
  
  const height = useSharedValue(skipInitialAnimation ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
  const width = useSharedValue(skipInitialAnimation ? fullWidth : narrowWidth);
  const thumbnailOpacity = useSharedValue(0);
  const thumbnailTranslateY = useSharedValue(10);
  const actionsOpacity = useSharedValue(0);
  const actionsTranslateY = useSharedValue(10);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onAddMediaRef = useRef(onAddMedia);
  const onRemoveItemRef = useRef(onRemoveItem);

  useEffect(() => {
    onAddMediaRef.current = onAddMedia;
    onRemoveItemRef.current = onRemoveItem;
  }, [onAddMedia, onRemoveItem]);

  const handleMediaPress = useCallback((index: number) => {
    setSelectedIndex(index);
    setGalleryVisible(true);
  }, []);

  const handleDeleteFromGallery = useCallback((index: number) => {
    const itemToDelete = selectedMedia[index];
    if (itemToDelete) {
      onRemoveItem(itemToDelete.id);
    }
  }, [selectedMedia, onRemoveItem]);

  useEffect(() => {
    if (!skipInitialAnimation) {
      // Animate from collapsed state
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
    
    // Always animate thumbnails for beautiful entrance
    thumbnailOpacity.value = withTiming(1, { 
      duration: skipInitialAnimation ? 400 : 300,
      easing: Easing.out(Easing.ease),
    });
    thumbnailTranslateY.value = withTiming(0, { 
      duration: skipInitialAnimation ? 400 : 300,
      easing: Easing.out(Easing.cubic),
    });
    
    // Animate actions icons with slight delay for stagger effect
    actionsOpacity.value = withTiming(1, { 
      duration: 350,
      easing: Easing.out(Easing.ease),
    });
    actionsTranslateY.value = withTiming(0, { 
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
  }, [height, width, fullWidth, thumbnailOpacity, thumbnailTranslateY, actionsOpacity, actionsTranslateY, skipInitialAnimation]);

  const handleCollapse = useCallback((callback: () => void) => {
    setIsCollapsing(true);
    
    thumbnailOpacity.value = withTiming(0, { 
      duration: 200,
      easing: Easing.in(Easing.ease),
    });
    thumbnailTranslateY.value = withTiming(10, { 
      duration: 200,
      easing: Easing.in(Easing.cubic),
    });
    
    height.value = withSpring(COLLAPSED_HEIGHT, {
      damping: 20,
      stiffness: 180,
      mass: 0.6,
    }, (finished) => {
      if (finished) {
        runOnJS(callback)();
        runOnJS(setIsCollapsing)(false);
      }
    });
    
    width.value = withSpring(narrowWidth, {
      damping: 20,
      stiffness: 180,
      mass: 0.6,
    });
  }, [height, width, narrowWidth, thumbnailOpacity, thumbnailTranslateY]);

  const handleAddMedia = useCallback(() => {
    handleCollapse(() => {
      onAddMediaRef.current();
    });
  }, [handleCollapse]);

  const handleCancelAll = useCallback(() => {
    handleCollapse(() => {
      selectedMedia.forEach(item => onRemoveItemRef.current(item.id));
    });
  }, [handleCollapse, selectedMedia]);

  const barAnimatedStyle = useAnimatedStyle(() => {
    const progress = (height.value - COLLAPSED_HEIGHT) / (EXPANDED_HEIGHT - COLLAPSED_HEIGHT);
    // Extended rounded corners: starts at 30 (collapsed) and goes to 28 (expanded)
    const borderRadius = 30 - (progress * 2);
    
    return {
      height: height.value,
      width: width.value,
      borderRadius,
    };
  });

  const thumbnailRowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: thumbnailOpacity.value,
    transform: [{ translateY: thumbnailTranslateY.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const progress = (height.value - COLLAPSED_HEIGHT) / (EXPANDED_HEIGHT - COLLAPSED_HEIGHT);
    const radius = 30 - (progress * 2);
    return { borderRadius: radius };
  });
  
  const actionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
    transform: [{ translateY: actionsTranslateY.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.bar, barAnimatedStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, backgroundAnimatedStyle]}>
          <BottomBarBackground borderRadius={0} />
        </Animated.View>
        
        {/* Thumbnail Row */}
        <Animated.View style={[styles.thumbnailRow, thumbnailRowAnimatedStyle]}>
          {/* Cancel Button */}
          <Pressable
            onPress={handleCancelAll}
            style={styles.cancelButton}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            disabled={isCollapsing}
          >
            <Ionicons name="close" size={24} color={colors.white} />
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailScroll}
          >
            {selectedMedia.map((item, index) => (
              <MediaThumbnail
                key={item.id}
                item={item}
                onRemove={() => onRemoveItem(item.id)}
                onPress={() => handleMediaPress(index)}
              />
            ))}
          </ScrollView>
          
          {/* Add Button */}
          <Pressable
            onPress={handleAddMedia}
            style={styles.addButton}
            accessibilityRole="button"
            accessibilityLabel={`Add ${selectedMedia.length} item${selectedMedia.length > 1 ? 's' : ''}`}
            disabled={isCollapsing}
          >
            <Ionicons name="arrow-forward" size={24} color={colors.black} />
          </Pressable>
        </Animated.View>

        {/* Action Icons Row */}
        <Animated.View style={[styles.actionsRow, actionsAnimatedStyle]}>
          <MediaSlot icon="camera" onPress={onPressCamera} label="Camera" />
          <MediaSlot icon="images" onPress={onPressGallery} label="Gallery" />
          <MediaSlot icon="mic" onPress={onPressAudio} label="Audio" />
          <MediaSlot icon="document-text" onPress={onPressFiles} label="Files" />
        </Animated.View>
      </Animated.View>

      {/* Full Screen Gallery Viewer */}
      <MediaGalleryViewer
        visible={galleryVisible}
        media={selectedMedia}
        initialIndex={selectedIndex}
        onClose={() => setGalleryVisible(false)}
        onDelete={handleDeleteFromGallery}
      />
    </View>
  );
}

function MediaThumbnail({ 
  item, 
  onRemove, 
  onPress 
}: { 
  item: EchoMedia; 
  onRemove: () => void;
  onPress: () => void;
}) {
  const isImage = item.type === "photo" || item.type === "video";

  return (
    <Pressable 
      style={styles.thumbnail}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.type}`}
    >
      {isImage ? (
        <Image source={{ uri: item.uri }} style={styles.thumbnailImage} resizeMode="cover" />
      ) : (
        <View style={styles.thumbnailIcon}>
          <Ionicons
            name={item.type === "audio" ? "musical-notes" : "document-text"}
            size={28}
            color={colors.textSecondary}
          />
        </View>
      )}
      
      {/* Remove button */}
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={styles.removeButton}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Remove"
      >
        <Ionicons name="close-circle" size={20} color={colors.white} />
      </Pressable>
    </Pressable>
  );
}

function MediaSlot({
  icon,
  onPress,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
}) {
  return (
    <View style={styles.slot}>
      <Pressable
        onPress={onPress}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.pressable}
      >
        <Ionicons name={icon} size={22} color={colors.textPrimary} />
      </Pressable>
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
  thumbnailRow: {
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
  thumbnailScroll: {
    gap: 8,
    paddingLeft: 0,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailIcon: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  removeButton: {
    position: "absolute",
    top: 2,
    right: 2,
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  addButton: {
    backgroundColor: colors.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  actionsRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    height: sizes.floatingBar.height,
  },
  slot: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  pressable: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});

