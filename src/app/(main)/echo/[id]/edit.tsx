import { UnifiedFormSection } from "@/components/forms/UnifiedForm";
import { UnifiedFormRow } from "@/components/forms/UnifiedFormRow";
import { HERO_HEIGHT, HERO_IMAGE_MARGIN_TOP } from "@/constants/dimensions";
import { useEchoStorage } from "@/hooks/useEchoStorage";
import { colors, radii, spacing } from "@/theme/theme";
import { Storage } from "@/utils/asyncStorage";
import { useAuth } from "@/utils/authContext";
import { useFriends } from "@/utils/friendContext";
import { COVER_IMAGE_ASPECT_RATIO, ensureCoverImageAspectRatio } from "@/utils/image";
import { EchoService } from "@/utils/services/echoService";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionSheetIOS, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";

const AVATAR_SIZE = 56;
const COVER_ASPECT_RATIO = COVER_IMAGE_ASPECT_RATIO;

export default function EditEchoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { getEchoById, updateEcho, deleteEcho } = useEchoStorage();
  const { user } = useAuth();

  const echo = useMemo(() => {
    if (!id) return undefined;
    return getEchoById(String(id));
  }, [id, getEchoById]);

  // Prevent editing locked echoes or non-owner access
  useEffect(() => {
    if (!echo || !user) return;

    if (echo.status === "locked") {
      Alert.alert(
        "Echo is Locked",
        "This echo has been locked and cannot be edited.",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }

    if (echo.ownerId && echo.ownerId !== user.id) {
      Alert.alert(
        "Cannot Edit",
        "Only the echo owner can edit this echo.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, [echo, user?.id, router]);

  const [title, setTitle] = useState(echo?.title || "");
  const [imageUrl, setImageUrl] = useState(echo?.imageUrl || "");
  const [isPrivate, setIsPrivate] = useState(!!echo?.isPrivate);
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>(echo?.collaboratorIds || []);
  const [lockDate, setLockDate] = useState<Date | undefined>(echo?.lockDate ? new Date(echo.lockDate) : undefined);
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(echo?.unlockDate ? new Date(echo.unlockDate) : undefined);
  const [showLockPicker, setShowLockPicker] = useState(false);
  const [showUnlockPicker, setShowUnlockPicker] = useState(false);

  // Handle updated collaborators from the edit-collaborators modal
  useFocusEffect(
    useCallback(() => {
      const checkForUpdatedCollaborators = async () => {
        if (!id) return;
        const storageKey = `temp_collaborators_${id}`;
        const updatedIds = await Storage.get<string[]>(storageKey);
        if (updatedIds) {
          setCollaboratorIds(updatedIds);
          // Clear the temporary storage
          await Storage.remove(storageKey);
        }
      };
      checkForUpdatedCollaborators();
    }, [id])
  );

  // Ensure collaboratorIds are initialized from the echo once it loads
  useEffect(() => {
    if (echo && Array.isArray(echo.collaboratorIds) && echo.collaboratorIds.length > 0 && collaboratorIds.length === 0) {
      setCollaboratorIds(echo.collaboratorIds);
    }
  }, [echo, collaboratorIds.length]);

  // Extra safety: fetch echo from Firestore to ensure we have collaboratorIds
  useEffect(() => {
    if (!id) return;
    if (collaboratorIds.length > 0) return;

    let cancelled = false;
    (async () => {
      try {
        const remoteEcho = await EchoService.getEcho(String(id));
        if (!cancelled && remoteEcho?.collaboratorIds && remoteEcho.collaboratorIds.length > 0) {
          setCollaboratorIds(remoteEcho.collaboratorIds);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("[EditEcho] Failed to fetch remote echo for collaborators", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, collaboratorIds.length]);

  // Fallback: if local state is empty, fall back to echo.collaboratorIds for display / passing to modal
  const effectiveCollaboratorIds = useMemo(
    () => (collaboratorIds.length > 0 ? collaboratorIds : echo?.collaboratorIds || []),
    [collaboratorIds, echo?.collaboratorIds]
  );

  const isCollaborativeEcho = echo?.shareMode === "shared";
  const isLocked = echo?.status === "locked";
  const isOwner = echo?.ownerId && user?.id ? echo.ownerId === user.id : false;

  // Store original values to detect changes
  const originalValuesRef = useRef({
    title: echo?.title || "",
    imageUrl: echo?.imageUrl || "",
    isPrivate: !!echo?.isPrivate,
    collaboratorIds: [...(echo?.collaboratorIds || [])],
    lockDate: echo?.lockDate ? new Date(echo.lockDate).getTime() : undefined,
    unlockDate: echo?.unlockDate ? new Date(echo.unlockDate).getTime() : undefined,
  });

  const { friends } = useFriends();
  const collaboratorOptions = useMemo(
    () =>
      friends.map((f) => ({
        id: f.id,
        name: f.displayName,
        avatarUri: f.photoURL,
      })),
    [friends]
  );

  // Check if any changes have been made
  const hasChanges = useCallback(() => {
    const original = originalValuesRef.current;
    
    // Compare title
    if (title !== original.title) return true;
    
    // Compare imageUrl
    if (imageUrl !== original.imageUrl) return true;
    
    // Compare isPrivate
    if (isPrivate !== original.isPrivate) return true;
    
    // Compare collaboratorIds (check array equality)
    if (collaboratorIds.length !== original.collaboratorIds.length) return true;
    if (collaboratorIds.some(id => !original.collaboratorIds.includes(id))) return true;
    if (original.collaboratorIds.some(id => !collaboratorIds.includes(id))) return true;
    
    // Compare lockDate
    const lockDateTime = lockDate ? lockDate.getTime() : undefined;
    if (lockDateTime !== original.lockDate) return true;
    
    // Compare unlockDate
    const unlockDateTime = unlockDate ? unlockDate.getTime() : undefined;
    if (unlockDateTime !== original.unlockDate) return true;
    
    return false;
  }, [title, imageUrl, isPrivate, collaboratorIds, lockDate, unlockDate]);

  const toggleCollaborator = useCallback(
    (friendId: string) => {
      setCollaboratorIds((prev) =>
        prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
      );
    },
    []
  );

  const handleCoverImageEdit = useCallback(async () => {
    const options = imageUrl
      ? ["Take Photo", "Choose from Library", "Remove Photo", "Cancel"]
      : ["Take Photo", "Choose from Library", "Cancel"];
    
    const cancelButtonIndex = imageUrl ? 3 : 2;
    const destructiveButtonIndex = imageUrl ? 2 : undefined;

    const handleTakePhoto = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera permission is required to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: COVER_ASPECT_RATIO,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const normalizedUri = await ensureCoverImageAspectRatio(asset.uri, {
          width: asset.width,
          height: asset.height,
        });
        setImageUrl(normalizedUri);
      }
    };

    const handleChooseFromLibrary = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Photo library permission is required to select photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: COVER_ASPECT_RATIO,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const normalizedUri = await ensureCoverImageAspectRatio(asset.uri, {
          width: asset.width,
          height: asset.height,
        });
        setImageUrl(normalizedUri);
      }
    };

    const handleRemovePhoto = () => {
      setImageUrl("");
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Cover Image",
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) await handleTakePhoto();
          else if (buttonIndex === 1) await handleChooseFromLibrary();
          else if (buttonIndex === 2 && imageUrl) handleRemovePhoto();
        }
      );
    } else {
      const buttons = imageUrl
        ? [
            { text: "Take Photo", onPress: handleTakePhoto },
            { text: "Choose from Library", onPress: handleChooseFromLibrary },
            { text: "Remove Photo", onPress: handleRemovePhoto, style: "destructive" as const },
            { text: "Cancel", style: "cancel" as const },
          ]
        : [
            { text: "Take Photo", onPress: handleTakePhoto },
            { text: "Choose from Library", onPress: handleChooseFromLibrary },
            { text: "Cancel", style: "cancel" as const },
          ];

      Alert.alert("Cover Image", "Choose an option", buttons);
    }
  }, [imageUrl]);

  const handleLockDateChange = useCallback(
    (_: unknown, date?: Date) => {
      if (Platform.OS === "android") {
        setShowLockPicker(false);
      }
      if (date) setLockDate(date);
    },
    []
  );

  const handleUnlockDateChange = useCallback(
    (_: unknown, date?: Date) => {
      if (Platform.OS === "android") {
        setShowUnlockPicker(false);
      }
      if (date) setUnlockDate(date);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!id || !echo) return;

    try {
      const effectiveIsPrivate = isCollaborativeEcho ? false : isPrivate;
      const effectiveShareMode = isCollaborativeEcho ? "shared" : (isPrivate ? "private" : "shared");
      const effectiveCollaboratorIds = effectiveIsPrivate ? [] : collaboratorIds;

      await updateEcho(String(id), {
        title: title.trim() || echo.title || "Untitled",
        imageUrl: imageUrl.trim() || undefined,
        isPrivate: effectiveIsPrivate,
        collaboratorIds: effectiveCollaboratorIds,
        shareMode: effectiveShareMode,
        lockDate: lockDate ? lockDate.toISOString() : undefined,
        unlockDate: unlockDate ? unlockDate.toISOString() : undefined,
      });
      router.back();
    } catch (error) {
      console.error("Failed to save echo:", error);
      Alert.alert("Error", "Failed to save changes. Please try again.");
    }
  }, [id, echo, title, imageUrl, isPrivate, lockDate, unlockDate, updateEcho, collaboratorIds, isCollaborativeEcho]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Echo",
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            try {
              await deleteEcho(String(id));
              router.back();
            } catch {
              Alert.alert("Error", "Failed to delete echo. Please try again.");
            }
          },
        },
      ]
    );
  }, [id, title, deleteEcho, navigation]);

  const handleCancel = useCallback(() => {
    if (!hasChanges()) {
      router.back();
      return;
    }

    // Show confirmation dialog if there are unsaved changes
    Alert.alert(
      "Discard Changes?",
      "You have unsaved changes. Are you sure you want to discard them?",
      [
        {
          text: "Keep Editing",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  }, [hasChanges]);

  useEffect(() => {
    navigation.setOptions({
      title: "Edit Echo",
      headerShown: true,
      headerStyle: { backgroundColor: 'transparent' },
      headerTransparent: true,
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { color: colors.textPrimary },
      headerShadowVisible: false,
      headerBackVisible: false,
      headerLeft: () => (
        <Pressable
          onPress={handleCancel}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Save"
          style={styles.saveButton}
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      ),
    });
  }, [navigation, handleSave, handleCancel]);

  if (!echo) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Echo not found.</Text>
      </View>
    );
  }

  if (isLocked || (echo.ownerId && user && echo.ownerId !== user.id)) {
    return null; // Will redirect back via useEffect
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.coverSection}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>No Cover Image</Text>
            </View>
          )}
          <Pressable
            onPress={handleCoverImageEdit}
            style={styles.editPillButton}
            accessibilityRole="button"
            accessibilityLabel="Edit cover image"
            hitSlop={8}
          >
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.editPillOverlay} />
            <View style={styles.editPillContent}>
              <Ionicons name="pencil" size={16} color={colors.white} />
              <Text style={styles.editPillText}>Edit</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.titleContainer}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Echo title"
              placeholderTextColor={colors.textSecondary}
              style={styles.titleInput}
              returnKeyType="done"
              multiline={false}
              textAlign="center"
            />
          </View>
        </View>

        <View style={styles.formContainer}>
        {!isCollaborativeEcho && (
          <UnifiedFormSection style={styles.sectionSpacing}>
            <UnifiedFormRow
              title="Private"
              switch
              switchValue={isPrivate}
              onSwitchChange={setIsPrivate}
            />
          </UnifiedFormSection>
      )}

      <UnifiedFormSection>
        <UnifiedFormRow
          title="Lock Date"
          valueText={lockDate ? lockDate.toLocaleDateString() : "Pick Later"}
          onPress={() => setShowLockPicker(true)}
          accessibilityLabel="Pick lock date"
          showChevron
        />
        <UnifiedFormRow
          title="Unlock Date"
          valueText={unlockDate ? unlockDate.toLocaleDateString() : "Pick Later"}
          onPress={() => setShowUnlockPicker(true)}
          accessibilityLabel="Pick unlock date"
          showChevron
        />
      </UnifiedFormSection>

      {(isCollaborativeEcho || !isPrivate || effectiveCollaboratorIds.length > 0) && (
        <View style={styles.collaboratorsSection}>
          <View style={styles.collaboratorsHeader}>
            <Text style={styles.pillSectionTitle}>
              {isCollaborativeEcho ? "Collaborators" : "Choose Collaborators"}
            </Text>
            {isOwner && (
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/(main)/echo/[id]/edit-collaborators",
                    params: {
                      id: String(id),
                      initialCollaborators: JSON.stringify(effectiveCollaboratorIds),
                    },
                  });
                }}
                style={styles.editPillButtonCollaborators}
                accessibilityRole="button"
                accessibilityLabel="Edit collaborators"
                hitSlop={8}
              >
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.editPillOverlay} />
                <View style={styles.editPillContent}>
                  <Ionicons name="pencil" size={16} color={colors.white} />
                  <Text style={styles.editPillText}>Edit</Text>
                </View>
              </Pressable>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarsRow}
            style={styles.avatarsScrollView}
          >
            {effectiveCollaboratorIds.length === 0 ? (
              <View style={styles.emptyCollaborators}>
                <Text style={styles.emptyCollaboratorsText}>
                  {collaboratorOptions.length === 0 
                    ? "Add friends to invite collaborators."
                    : "No collaborators selected."}
                </Text>
              </View>
            ) : (
              collaboratorOptions
                .filter((friend) => effectiveCollaboratorIds.includes(friend.id))
                .map((friend) => (
                  <View key={friend.id} style={styles.avatarWrap}>
                    <Image
                      source={friend.avatarUri ? { uri: friend.avatarUri } : `https://picsum.photos/seed/${friend.id}/200/200`}
                      style={styles.avatarImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={200}
                    />
                  </View>
                ))
            )}
          </ScrollView>
        </View>
      )}

      {Platform.OS === "ios" && showLockPicker && (
        <Modal transparent animationType="fade" visible={showLockPicker} onRequestClose={() => setShowLockPicker(false)}>
          <TouchableWithoutFeedback onPress={() => setShowLockPicker(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.datePickerModal}>
                  <DateTimePicker
                    value={lockDate || new Date()}
                    mode="date"
                    display="inline"
                    onChange={handleLockDateChange}
                    minimumDate={new Date()}
                    textColor={colors.white}
                    themeVariant="dark"
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      {Platform.OS === "android" && showLockPicker && (
        <DateTimePicker
          value={lockDate || new Date()}
          mode="date"
          display="default"
          onChange={handleLockDateChange}
          minimumDate={new Date()}
        />
      )}
      {Platform.OS === "ios" && showUnlockPicker && (
        <Modal transparent animationType="fade" visible={showUnlockPicker} onRequestClose={() => setShowUnlockPicker(false)}>
          <TouchableWithoutFeedback onPress={() => setShowUnlockPicker(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.datePickerModal}>
                  <DateTimePicker
                    value={unlockDate || new Date()}
                    mode="date"
                    display="inline"
                    onChange={handleUnlockDateChange}
                    minimumDate={lockDate || new Date()}
                    textColor={colors.white}
                    themeVariant="dark"
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      {Platform.OS === "android" && showUnlockPicker && (
        <DateTimePicker
          value={unlockDate || new Date()}
          mode="date"
          display="default"
          onChange={handleUnlockDateChange}
          minimumDate={lockDate || new Date()}
        />
      )}

        <View style={styles.deleteSection}>
          <Pressable
            onPress={handleDelete}
            style={styles.deleteButton}
            accessibilityRole="button"
            accessibilityLabel="Delete echo"
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Delete Echo</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  content: {
    paddingTop: 0,
    paddingBottom: spacing.xxl,
  },
  coverSection: {
    height: HERO_HEIGHT,
    position: "relative",
    marginTop: spacing.xl + HERO_IMAGE_MARGIN_TOP,
    marginHorizontal: spacing.lg,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  titleContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceBorder,
  },
  titleInput: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: colors.surface,
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  editPillButton: {
    position: "absolute",
    top: 16,
    right: 16,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.12)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  editPillOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.lightOverlay,
  },
  editPillContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  editPillText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  editPillButtonCollaborators: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.12)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBannerText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  collaboratorsSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  collaboratorsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  pillSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
  sectionSpacing: {
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    fontSize: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  avatarsScrollView: {
    minHeight: AVATAR_SIZE + spacing.sm * 2,
  },
  avatarsRow: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.lg,
  },
  emptyCollaborators: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
  },
  emptyCollaboratorsText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 100,
    marginRight: spacing.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarWrapSelected: {
    borderColor: colors.white,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.surface,
  },
  avatarFallback: {
    backgroundColor: colors.surface,
  },
  avatarSelectedBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  notFoundText: {
    color: colors.textSecondary,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  cancelText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 17,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  saveText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  datePickerModal: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteSection: {
    marginTop: spacing.xl,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    borderRadius: radii.md,
    gap: 8,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
