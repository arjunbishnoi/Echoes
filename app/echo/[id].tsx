import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionSheetIOS, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomGradient from "../../components/BottomGradient";
import EchoContentTabs from "../../components/echo/EchoContentTabs";
import EchoHeroImage from "../../components/echo/EchoHeroImage";
import EchoProgressTimeline from "../../components/echo/EchoProgressTimeline";
import EchoTabBar, { type EchoTab } from "../../components/echo/EchoTabBar";
import EchoTitle from "../../components/echo/EchoTitle";
import FloatingActionButton from "../../components/ui/FloatingActionButton";
import { SCREEN_WIDTH } from "../../constants/dimensions";
import { dummyFriends } from "../../data/dummyFriends";
import { useEchoActivities } from "../../hooks/useEchoActivities";
import { useEchoStorage } from "../../hooks/useEchoStorage";
import { useEchoTabs } from "../../hooks/useEchoTabs";
import { useFavoriteEchoes } from "../../hooks/useFavoriteEchoes";
import { useHeaderTitle } from "../../hooks/useHeaderTitle";
import { useMediaPicker } from "../../hooks/useMediaPicker";
import { computeEchoProgressPercent } from "../../lib/echoes";
import { getExpoSwiftUI } from "../../lib/expoUi";
import { useHomeEchoContext } from "../../lib/homeEchoContext";
import { colors, spacing } from "../../theme/theme";
import type { Echo } from "../../types/echo";

export default function EchoDetailScreen() {
  const { id, title: titleParam, imageUrl: imageParam, subtitle: subtitleParam } = useLocalSearchParams<{
    id: string;
    title?: string;
    imageUrl?: string;
    subtitle?: string;
  }>();

  const { getEchoById, addMedia, deleteEcho } = useEchoStorage();
  const { pickFromCamera, pickFromPhotoLibrary, pickVideo, pickAudio } = useMediaPicker();
  const { activities } = useEchoActivities(id);
  
  const capsule = useMemo(() => {
    const found = getEchoById(id);
    if (found) return found;
    return {
      id: String(id),
      title: titleParam ?? "Echo",
      subtitle: subtitleParam ?? "",
      imageUrl: typeof imageParam === "string" ? imageParam : undefined,
      isLocked: false,
      status: "ongoing" as const,
      media: [],
      ownerId: "",
      isPrivate: true,
      shareMode: "private" as const,
    };
  }, [id, titleParam, imageParam, subtitleParam, getEchoById]);

  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const SwiftUI = Platform.OS === "ios" ? getExpoSwiftUI() : null;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const capsuleData = capsule as Echo;
  const isUnlocked = capsuleData.status === "unlocked";
  const isLocked = capsuleData.status === "locked";
  const isOngoing = capsuleData.status === "ongoing";
  
  const [currentPage, setCurrentPage] = useState(() => (isUnlocked ? 0 : 1));
  const scrollX = useSharedValue(0);

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

  const getAvatarUrls = useCallback((cap: Echo): string[] => {
    const avatars: string[] = [];
    
    if (cap.ownerPhotoURL) {
      avatars.push(cap.ownerPhotoURL);
    }
    
    if (cap.collaboratorIds && cap.collaboratorIds.length > 0) {
      cap.collaboratorIds.forEach((collaboratorId) => {
        const friend = dummyFriends.find((f) => f.id === collaboratorId);
        if (friend?.photoURL) {
          avatars.push(friend.photoURL);
        }
      });
    }
    
    return avatars;
  }, []);
  
  const collaboratorAvatars = useMemo(() => getAvatarUrls(capsuleData), [capsuleData, getAvatarUrls]);
  const progress = useMemo(() => computeEchoProgressPercent(capsuleData), [capsuleData]);

  const startDate = useMemo(() => {
    const createdAtMs = capsuleData.createdAt ? new Date(capsuleData.createdAt).getTime() : Date.now();
    return new Date(createdAtMs);
  }, [capsuleData.createdAt]);

  const rightDate = useMemo(() => {
    if (isOngoing && capsuleData.lockDate) {
      return new Date(capsuleData.lockDate);
    }
    if ((isLocked || isUnlocked) && capsuleData.unlockDate) {
      return new Date(capsuleData.unlockDate);
    }
    return null;
  }, [isOngoing, isLocked, isUnlocked, capsuleData.lockDate, capsuleData.unlockDate]);

  useEffect(() => {
    const desiredPage = isUnlocked ? 0 : 1;
    const desiredTab: EchoTab = isUnlocked ? "allMedia" : "history";
    setSelectedTab(desiredTab);
    setCurrentPage(desiredPage);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ x: desiredPage * SCREEN_WIDTH, animated: false });
    });
  }, [isUnlocked, setSelectedTab]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      setSelectedTab(page === 0 ? "allMedia" : "history");
    },
    [setSelectedTab]
  );

  const handleTabPress = useCallback(
    (tab: EchoTab) => {
      // Block navigation to allMedia if echo is not unlocked
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

  const handlePlusButtonPress = useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Add Content",
          message: "Choose the type of content to add",
          options: ["Take Photo", "Photo Library", "Record Video", "Record Audio", "Cancel"],
          cancelButtonIndex: 4,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            const media = await pickFromCamera();
            if (media) {
              addMedia(capsule.id, { ...media, uploadedBy: "local" });
            }
          } else if (buttonIndex === 1) {
            const media = await pickFromPhotoLibrary();
            if (media) {
              addMedia(capsule.id, { ...media, uploadedBy: "local" });
            }
          } else if (buttonIndex === 2) {
            const media = await pickVideo();
            if (media) {
              addMedia(capsule.id, { ...media, uploadedBy: "local" });
            }
          } else if (buttonIndex === 3) {
            const media = await pickAudio();
            if (media) {
              addMedia(capsule.id, { ...media, uploadedBy: "local" });
            }
          }
        }
      );
    } else {
      Alert.alert(
        "Add Content",
        "Choose the type of content to add",
        [
          {
            text: "Take Photo",
            onPress: async () => {
              const media = await pickFromCamera();
              if (media) {
                addMedia(capsule.id, { ...media, uploadedBy: "local" });
              }
            },
          },
          {
            text: "Photo Library",
            onPress: async () => {
              const media = await pickFromPhotoLibrary();
              if (media) {
                addMedia(capsule.id, { ...media, uploadedBy: "local" });
              }
            },
          },
          {
            text: "Record Video",
            onPress: async () => {
              const media = await pickVideo();
              if (media) {
                addMedia(capsule.id, { ...media, uploadedBy: "local" });
              }
            },
          },
          {
            text: "Record Audio",
            onPress: async () => {
              const media = await pickAudio();
              if (media) {
                addMedia(capsule.id, { ...media, uploadedBy: "local" });
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  }, [pickFromCamera, pickFromPhotoLibrary, pickVideo, pickAudio, addMedia, capsule.id]);

  const handleMoreOptions = useCallback(() => {
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
            router.push({ pathname: "/echo/[id]/edit", params: { id: String(capsule.id) } });
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
            { text: "Edit", onPress: () => router.push({ pathname: "/echo/[id]/edit", params: { id: String(capsule.id) } }) },
            { text: "Remove from Home", onPress: () => removeFromHome(capsule.id), style: "destructive" as const },
            { text: "Cancel", style: "cancel" as const },
          ]
        : [
            { text: "Edit", onPress: () => router.push({ pathname: "/echo/[id]/edit", params: { id: String(capsule.id) } }) },
            { text: "Add to Home", onPress: () => addToHome(capsule.id) },
            { text: "Cancel", style: "cancel" as const },
          ];
      
      Alert.alert("Echo Options", "", buttons, { cancelable: true });
    }
  }, [capsule.id, capsule.title, isVisibleOnHome, addToHome, removeFromHome, router]);

  const handleDelete = useCallback(() => {
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

  useEffect(() => {
    const onHome = isVisibleOnHome(capsule.id);
    const favorited = isFavorite(capsule.id);
    
    navigation.setOptions({
      title: showHeaderTitle ? capsule.title : "",
      headerRight: () => (
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
                    onPress={() => router.push({ pathname: "/echo/[id]/edit", params: { id: String(capsule.id) } })}
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
      ),
    });
  }, [navigation, showHeaderTitle, capsule.title, capsule.id, handleMoreOptions, handleDelete, addToHome, removeFromHome, isVisibleOnHome, isFavorite, toggleFavorite, router, SwiftUI]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          handleScroll(y);
        }}
      >
        <EchoHeroImage imageUrl={capsule.imageUrl} sharedTag={`echo-image-${id}`} />

        <View style={styles.contentContainer}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.titleContainer}>
              <EchoTitle title={capsule.title} onLayout={handleTitleLayout} />
            </View>

            <EchoProgressTimeline 
              startDate={startDate} 
              endDate={rightDate} 
              progress={progress} 
              participants={collaboratorAvatars}
              isPrivate={capsuleData.isPrivate}
              status={capsuleData.status}
            />
          </View>

          {/* Bottom card containing tabs and content */}
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

            <EchoContentTabs
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
              onMediaPress={(item) => {
                // Media viewer to be implemented
                Alert.alert("Media", `Viewing ${item.type}: ${item.uri.split("/").pop()}`);
              }}
            />
          </View>
        </View>
      </ScrollView>

      <BottomGradient />

      {/* Only show + button for ongoing echoes (locked/unlocked echoes can't add content) */}
      {isOngoing && (
        <FloatingActionButton
          onPress={handlePlusButtonPress}
          style={styles.floatingButton}
        />
      )}
    </View>
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
    backgroundColor: colors.black,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 0,
    paddingBottom: spacing.xxl + spacing.xl + 20,
  },
  floatingButton: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.lg,
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
