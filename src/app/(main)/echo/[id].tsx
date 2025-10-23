import BottomGradient from "@/components/BottomGradient";
import EchoTabBar, { type EchoTab } from "@/components/echo/EchoTabBar";
import EchoTitle from "@/components/echo/EchoTitle";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { SCREEN_WIDTH } from "@/constants/dimensions";
import { dummyFriends } from "@/data/dummyFriends";
import { useEchoActivities } from "@/hooks/useEchoActivities";
import { useEchoStorage } from "@/hooks/useEchoStorage";
import { useEchoTabs } from "@/hooks/useEchoTabs";
import { useFavoriteEchoes } from "@/hooks/useFavoriteEchoes";
import { useHeaderTitle } from "@/hooks/useHeaderTitle";
import { colors, spacing } from "@/theme/theme";
import type { Echo } from "@/types/echo";
import { computeEchoProgressPercent } from "@/utils/echoes";
import { getExpoSwiftUI } from "@/utils/expoUi";
import { useHomeEchoContext } from "@/utils/homeEchoContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionSheetIOS, Alert, Animated, Image, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const EchoContentTabs = React.lazy(() => import("@/components/echo/EchoContentTabs"));
const EchoHeroImage = React.lazy(() => import("@/components/echo/EchoHeroImage"));
const EchoProgressTimeline = React.lazy(() => import("@/components/echo/EchoProgressTimeline"));
const ImageGradientOverlay = React.lazy(() => import("@/components/echo/ImageGradientOverlay"));
const MediaGalleryViewer = React.lazy(() => import("@/components/MediaGalleryViewer"));
const RecordingArea = React.lazy(() => import("@/components/echo/RecordingArea"));

export default function EchoDetailScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  // Defer heavy operations until after initial render
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { getEchoById, addMedia, addMediaBatch, deleteEcho, isLoading } = useEchoStorage();
  // Audio and media picking are moved to lazy RecordingArea to reduce initial bundle
  
  // Defer activities loading until History tab is viewed
  const { activities, load: loadActivities } = useEchoActivities(id, { defer: true });
  
  const capsule = useMemo(() => {
    return getEchoById(id);
  }, [id, getEchoById]);

  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const SwiftUI = Platform.OS === "ios" ? getExpoSwiftUI() : null;
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);
  
  // Batch UI state together for better performance
  const [uiState, setUiState] = useState({
    galleryVisible: false,
    selectedMediaIndex: 0,
    showHeaderShadow: false,
  });
  const [stagedMedia, setStagedMedia] = useState<import("@/types/echo").EchoMedia[]>([]);
  const [transitioningFromRecording, setTransitioningFromRecording] = useState(false);
  
  // Reset and initialize when ID changes
  useEffect(() => {
    // Batch state reset
    setUiState({
      galleryVisible: false,
      selectedMediaIndex: 0,
      showHeaderShadow: false,
    });
    setStagedMedia([]);
    scrollX.value = 0;
    setIsInitialized(false);
    
    // Initialize immediately for faster perceived performance
    setTimeout(() => {
      setIsInitialized(true);
    }, 0);
  }, [id, scrollX]);
  
  const capsuleData = capsule ?? ({} as Echo);
  const isUnlocked = capsuleData.status === "unlocked";
  const isLocked = capsuleData.status === "locked";
  const isOngoing = capsuleData.status === "ongoing";
  
  const [currentPage, setCurrentPage] = useState(0);
  
  // Update page when unlock status changes
  useEffect(() => {
    if (capsule) {
      const isUnlocked = capsule.status === "unlocked";
      setCurrentPage(isUnlocked ? 0 : 1);
    }
  }, [capsule?.status]);
  
  // Fade-in animation for smooth transitions
  const [fadeAnim] = useState(new Animated.Value(0));

  const {
    selectedTab,
    setSelectedTab,
    barWidth,
    setBarWidth,
    segmentWidth,
    translateX,
    indicatorScaleX,
    isTabTapping,
    animateToIndex,
    updateIndicatorPosition,
  } = useEchoTabs(isUnlocked ? "allMedia" as const : "history" as const);

  const { showHeaderTitle, handleTitleLayout, handleScroll } = useHeaderTitle(insets.top);
  const { isVisibleOnHome, addToHome, removeFromHome } = useHomeEchoContext();
  const { isFavorite, toggleFavorite } = useFavoriteEchoes();

  // Defer heavy computations - only compute when initialized
  const [collaboratorAvatars, setCollaboratorAvatars] = useState<string[]>([]);
  
  useEffect(() => {
    if (!isInitialized || !capsule) return;
    
    // Defer to next frame for smoother navigation
    const timeoutId = setTimeout(() => {
      const avatars: string[] = [];
      
      if (capsuleData.ownerPhotoURL) {
        avatars.push(capsuleData.ownerPhotoURL);
      }
      
      if (capsuleData.collaboratorIds && capsuleData.collaboratorIds.length > 0) {
        capsuleData.collaboratorIds.forEach((collaboratorId) => {
          const friend = dummyFriends.find((f) => f.id === collaboratorId);
          if (friend?.photoURL) {
            avatars.push(friend.photoURL);
          }
        });
      }
      
      setCollaboratorAvatars(avatars);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [isInitialized, capsule, capsuleData.ownerPhotoURL, capsuleData.collaboratorIds]);
  
  // Optimize progress calculation - only when needed
  const progress = useMemo(() => {
    if (!isInitialized || !capsule) return 0;
    return computeEchoProgressPercent(capsuleData);
  }, [isInitialized, capsule, capsuleData.status, capsuleData.lockDate, capsuleData.unlockDate]);

  const startDate = useMemo(() => {
    if (!isInitialized || !capsule) return new Date();
    const createdAtMs = capsuleData.createdAt ? new Date(capsuleData.createdAt).getTime() : Date.now();
    return new Date(createdAtMs);
  }, [isInitialized, capsule, capsuleData.createdAt]);

  const rightDate = useMemo(() => {
    if (!isInitialized || !capsule) return null;
    if (isOngoing && capsuleData.lockDate) {
      return new Date(capsuleData.lockDate);
    }
    if ((isLocked || isUnlocked) && capsuleData.unlockDate) {
      return new Date(capsuleData.unlockDate);
    }
    return null;
  }, [isInitialized, capsule, isOngoing, isLocked, isUnlocked, capsuleData.lockDate, capsuleData.unlockDate]);

  // Combine scroll reset and page update for better performance
  useEffect(() => {
    if (!capsule) return;
    
    // Reset main scroll position
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
    
    // Update page based on unlock status
    const desiredPage = capsule.status === "unlocked" ? 0 : 1;
    const desiredTab: EchoTab = capsule.status === "unlocked" ? "allMedia" : "history";
    setSelectedTab(desiredTab);
    setCurrentPage(desiredPage);
    
    // Set horizontal scroll
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ x: desiredPage * SCREEN_WIDTH, animated: false });
    });
  }, [id, capsule?.status, setSelectedTab]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      setSelectedTab(page === 0 ? "allMedia" : "history");
    },
    [setSelectedTab]
  );

  const handleMediaPress = useCallback((item: import("@/types/echo").EchoMedia) => {
    if (!capsule) return;
    const index = capsule.media?.findIndex(m => m.id === item.id) ?? 0;
    setUiState(prev => ({ ...prev, selectedMediaIndex: index, galleryVisible: true }));
  }, [capsule]);

  const handleTabPress = useCallback(
    (tab: EchoTab) => {
      const nextTab = tab === "allMedia" && !isUnlocked ? "history" : tab;
      setSelectedTab(nextTab);
      const newPage = nextTab === "allMedia" ? 0 : 1;
      setCurrentPage(newPage);

      isTabTapping.current = true;
      scrollViewRef.current?.scrollTo({ x: newPage * SCREEN_WIDTH, animated: true });
      animateToIndex(newPage);

      setTimeout(() => {
        isTabTapping.current = false;
      }, 300);
    },
    [setSelectedTab, animateToIndex, isTabTapping, isUnlocked]
  );


  const handleMoreOptions = useCallback(() => {
    if (!capsule) return;
    const onHome = isVisibleOnHome(capsule.id);
    
    if (Platform.OS === "ios") {
      const options = onHome 
        ? ["Edit", "Remove from Home", "Cancel"]
        : ["Edit", "Add to Home", "Cancel"];
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
          destructiveButtonIndex: onHome ? 1 : undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            router.push({ pathname: "/(main)/echo/[id]/edit", params: { id: String(capsule.id) } });
          } else if (buttonIndex === 1) {
            if (onHome) {
              Alert.alert(
                "Remove from Home",
                `Remove "${capsule.title}" from home screen? You can still find it in your library.`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", style: "destructive", onPress: () => removeFromHome(capsule.id) },
                ]
              );
            } else {
              addToHome(capsule.id);
            }
          }
        }
      );
    } else {
      const buttons = onHome
        ? [
            { text: "Edit", onPress: () => router.push({ pathname: "/(main)/echo/[id]/edit", params: { id: String(capsule.id) } }) },
            { text: "Remove from Home", onPress: () => removeFromHome(capsule.id), style: "destructive" as const },
            { text: "Cancel", style: "cancel" as const },
          ]
        : [
            { text: "Edit", onPress: () => router.push({ pathname: "/(main)/echo/[id]/edit", params: { id: String(capsule.id) } }) },
            { text: "Add to Home", onPress: () => addToHome(capsule.id) },
            { text: "Cancel", style: "cancel" as const },
          ];
      
      Alert.alert("Echo Options", "", buttons, { cancelable: true });
    }
  }, [capsule, isVisibleOnHome, addToHome, removeFromHome, router]);

  const handleDelete = useCallback(() => {
    if (!capsule) return;
    Alert.alert(
      "Delete Echo",
      `Are you sure you want to delete "${capsule.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteEcho(capsule.id);
            if (success) {
              router.back();
            }
          },
        },
      ]
    );
  }, [capsule, deleteEcho, router]);

  const handleRecordingSaved = useCallback((media: import("@/types/echo").EchoMedia | import("@/types/echo").EchoMedia[]) => {
    setTransitioningFromRecording(true);
    setStagedMedia(prev => Array.isArray(media) ? [...prev, ...media] : [...prev, media]);
    setTimeout(() => setTransitioningFromRecording(false), 100);
  }, []);

  // Memoize header buttons to prevent re-creation
  const HeaderRightButtons = useMemo(() => {
    if (!capsule) return () => null;
    
    const onHome = isVisibleOnHome(capsule.id);
    const favorited = isFavorite(capsule.id);
    
    return () => (
      <View style={styles.headerRight}>
        <Pressable 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleFavorite(capsule.id);
          }} 
          hitSlop={12} 
          accessibilityRole="button" 
          style={styles.iconButton}
        >
          <Ionicons 
            name={favorited ? "heart" : "heart-outline"} 
            size={24} 
            color={colors.textPrimary} 
          />
        </Pressable>
        {Platform.OS === "ios" && SwiftUI ? (
          <SwiftUI.Host style={styles.swiftUIHost}>
            <SwiftUI.ContextMenu>
              <SwiftUI.ContextMenu.Items>
                <SwiftUI.Button 
                  systemImage="pencil" 
                  onPress={() => router.push({ pathname: "/(main)/echo/[id]/edit", params: { id: String(capsule.id) } })}
                >
                  Edit
                </SwiftUI.Button>
                <SwiftUI.Button 
                  systemImage={onHome ? "house.fill" : "house"} 
                  onPress={() => {
                    if (onHome) {
                      Alert.alert(
                        "Remove from Home",
                        `Remove "${capsule.title}" from home screen? You can still find it in your library.`,
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Remove", style: "destructive", onPress: () => removeFromHome(capsule.id) },
                        ]
                      );
                    } else {
                      addToHome(capsule.id);
                    }
                  }}
                >
                  {onHome ? "Remove from Home" : "Add to Home"}
                </SwiftUI.Button>
                <SwiftUI.Button 
                  systemImage="trash" 
                  role="destructive" 
                  onPress={handleDelete}
                >
                  Delete
                </SwiftUI.Button>
              </SwiftUI.ContextMenu.Items>
              <SwiftUI.ContextMenu.Trigger>
                <SwiftUI.Image systemName="ellipsis" />
              </SwiftUI.ContextMenu.Trigger>
            </SwiftUI.ContextMenu>
          </SwiftUI.Host>
        ) : (
          <Pressable 
            onPress={handleMoreOptions} 
            hitSlop={12} 
            accessibilityRole="button" 
            style={styles.iconButton}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
          </Pressable>
        )}
      </View>
    );
  }, [capsule, isVisibleOnHome, isFavorite, toggleFavorite, handleMoreOptions, handleDelete, addToHome, removeFromHome, router, SwiftUI]);

  // Update navigation options only when header title or shadow changes
  useEffect(() => {
    navigation.setOptions({
      title: showHeaderTitle ? capsule?.title : "",
      headerShadowVisible: uiState.showHeaderShadow,
      headerStyle: {
        backgroundColor: 'transparent',
      },
      headerRight: HeaderRightButtons,
    });
  }, [navigation, showHeaderTitle, uiState.showHeaderShadow, capsule?.title, HeaderRightButtons]);

  // Fade in when correct data loads
  useEffect(() => {
    if (capsule && capsule.id === id) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [capsule?.id, id, fadeAnim]);
  
  // Pre-load images for faster display
  useEffect(() => {
    if (capsule?.imageUrl) {
      Image.prefetch(capsule.imageUrl);
    }
  }, [capsule?.imageUrl]);

  // Progressive hydration for instant perceived load
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, [id]);

  // Show loading state while echoes are being loaded
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading echo..." />
      </View>
    );
  }

  // Show not found state if echo doesn't exist
  if (!capsule) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title="Echo Not Found"
          subtitle="This echo may have been deleted or doesn't exist"
        />
      </View>
    );
  }

  if (__DEV__) console.log("EchoNavRender:", Date.now());
  
  return (
    <Animated.View key={id} style={[styles.container, { opacity: fadeAnim }]}>
      {/* Key forces complete reset, opacity hides transition */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          handleScroll(y);
          setUiState(prev => ({ ...prev, showHeaderShadow: y > 5 }));
        }}
      >
        <Suspense fallback={null}>
          <ImageGradientOverlay 
            key={`gradient-${id}`}
            imageUrl={capsule.imageUrl} 
            echoId={capsule.id} 
            height={800} 
          />
          <EchoHeroImage 
            key={`hero-${id}`}
            imageUrl={capsule.imageUrl} 
            sharedTag={`echo-image-${id}`} 
          />
        </Suspense>

        <View style={styles.contentContainer}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.titleContainer}>
              <EchoTitle title={capsule.title} onLayout={handleTitleLayout} />
            </View>

            {isHydrated && (
              <Suspense fallback={null}>
                <EchoProgressTimeline 
                  startDate={startDate} 
                  endDate={rightDate} 
                  progress={progress} 
                  participants={collaboratorAvatars}
                  isPrivate={capsuleData.isPrivate}
                  status={capsuleData.status}
                />
              </Suspense>
            )}
          </View>

          {/* Bottom card containing tabs and content */}
          {isHydrated && (
            <View style={styles.bottomCard}>
              <EchoTabBar
                selectedTab={selectedTab}
                onTabPress={handleTabPress}
                barWidth={barWidth}
                segmentWidth={segmentWidth}
                translateX={translateX}
                indicatorScaleX={indicatorScaleX}
                onLayout={setBarWidth}
                allLocked={!isUnlocked}
              />
              <Suspense fallback={null}>
                <EchoContentTabs
                  key={id}
                  isLocked={!isUnlocked}
                  media={capsule.media}
                  activities={activities}
                  scrollViewRef={scrollViewRef}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onScroll={(scrollOffset) => {
                    scrollX.value = scrollOffset;
                    updateIndicatorPosition(scrollOffset, SCREEN_WIDTH);
                  }}
                  isTabTapping={isTabTapping}
                  scrollEnabled={isUnlocked}
                  onMediaPress={handleMediaPress}
                  onHistoryTabViewed={loadActivities}
                />
              </Suspense>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Only show bottom gradient for ongoing echoes when hydrated */}
      {isOngoing && isHydrated && <BottomGradient />}

      {/* Recording and media picking moved behind lazy boundary */}
      {isOngoing && isHydrated && (
        <Suspense fallback={null}>
          <RecordingArea
            stagedMedia={stagedMedia}
            onStageMedia={handleRecordingSaved}
            onRemoveItem={(id: string) => setStagedMedia(prev => prev.filter(m => m.id !== id))}
            onCommitMedia={() => {
              addMediaBatch(capsule.id, stagedMedia);
              setStagedMedia([]);
            }}
            transitioningFromRecording={transitioningFromRecording}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <MediaGalleryViewer
          key={`gallery-${id}`}
          visible={uiState.galleryVisible}
          media={capsule.media || []}
          initialIndex={uiState.selectedMediaIndex}
          onClose={() => setUiState(prev => ({ ...prev, galleryVisible: false }))}
        />
      </Suspense>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingTop: 0,
  },
  contentContainer: {
    paddingTop: 0,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  titleContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    marginTop: 0,
  },
  bottomCard: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 0,
    paddingBottom: spacing.xxl + spacing.xl + 20,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.black,
  },
  notFoundText: {
    color: colors.textSecondary,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 4,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  swiftUIHost: {
    width: 35,
    height: 35,
  },
});
