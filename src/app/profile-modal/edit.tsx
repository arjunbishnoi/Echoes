import UserAvatar from "@/components/ui/UserAvatar";
import { colors, spacing } from "@/theme/theme";
import type { User } from "@/types/user";
import { useAuth } from "@/utils/authContext";
import { StorageService } from "@/utils/services/storageService";
import { UserService } from "@/utils/services/userService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { router, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();

  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [profileImage, setProfileImage] = useState(user?.photoURL || null);
  
  // Loading and validation state
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
  // Refs for input focus management
  const usernameInputRef = useRef<TextInput>(null);

  // Update navigation header with Cancel and Save
  useEffect(() => {
    navigation.setOptions({
      title: "Edit Profile",
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
          onPress={handleSaveProfile}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Save"
          disabled={isLoading}
          style={styles.saveButton}
        >
          <Text style={[styles.saveText, isLoading && styles.disabledText]}>
            {isLoading ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, isLoading]);

  const validateUsername = async (usernameValue: string): Promise<boolean> => {
    if (__DEV__) {
      console.log("[EditProfile] Validating username:", usernameValue);
    }

    if (!usernameValue.trim()) {
      setUsernameError("Username is required");
      return false;
    }

    if (usernameValue.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }

    if (usernameValue.length > 20) {
      setUsernameError("Username must be less than 20 characters");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameValue)) {
      setUsernameError("Username can only contain letters, numbers, and underscores");
      return false;
    }

    // Skip uniqueness check if username hasn't changed
    if (usernameValue === user?.username) {
      if (__DEV__) {
        console.log("[EditProfile] Username unchanged, validation passed");
      }
      setUsernameError(null);
      return true;
    }

    // Check if username is unique
    setIsCheckingUsername(true);
    try {
      const isAvailable = await UserService.isUsernameAvailable(usernameValue, user?.id);
      
      if (!isAvailable) {
        setUsernameError("Username is already taken");
        return false;
      }

      if (__DEV__) {
        console.log("[EditProfile] Username validation passed");
      }
      setUsernameError(null);
      return true;
    } catch (error) {
      console.error("[EditProfile] Username validation error:", error);
      setUsernameError("Unable to check username availability");
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    const cleanedText = text.toLowerCase().replace(/[^a-zA-Z0-9_]/g, "");
    setTempUsername(cleanedText);
    setUsernameError(null);
  };

  const handleAvatarEdit = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        // Auto-save profile image
        await saveProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const saveProfileImage = async (imageUri: string) => {
    try {
      setIsLoading(true);
      
      if (!user?.id) throw new Error("User ID not found");

      if (__DEV__) {
        console.log("[EditProfile] Uploading new profile image...");
      }

      const downloadURL = await StorageService.uploadProfilePhoto(
        user.id,
        imageUri,
        (progress) => {
          if (__DEV__) console.log(`[EditProfile] Upload progress: ${progress}%`);
        }
      );

      if (__DEV__) {
        console.log("[EditProfile] Image uploaded, URL:", downloadURL);
      }

      await updateProfile({ photoURL: downloadURL });
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile image:", error);
      Alert.alert("Error", "Failed to update profile picture. Please try again.");
      setProfileImage(user?.photoURL || null); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    // Check if there are unsaved changes
    const hasChanges = 
      displayName.trim() !== (user?.displayName || "") ||
      username !== (user?.username || "");

    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          { 
            text: "Discard", 
            style: "destructive",
            onPress: () => {
              // Reset form to original values
              setDisplayName(user?.displayName || "");
              setUsername(user?.username || "");
              setUsernameError(null);
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  }, [displayName, username, user, router]);

  const handleSaveProfile = useCallback(async () => {
    setIsLoading(true);
    
    // Clear any existing errors first
    setUsernameError(null);
    
    try {
      // Basic validation
      if (!username.trim()) {
        setUsernameError("Username is required");
        setIsLoading(false);
        return;
      }

      // Only validate username uniqueness if it actually changed
      if (username !== user?.username) {
        if (__DEV__) {
          console.log("[EditProfile] Username changed, validating:", username, "vs", user?.username);
        }
        
        const isValid = await validateUsername(username);
        if (!isValid) {
          setIsLoading(false);
          return;
        }
      } else {
        if (__DEV__) {
          console.log("[EditProfile] Username unchanged, skipping validation");
        }
      }

      // Prepare profile data for update
      const profileData: Partial<User> = {};
      
      // Only include changed fields
      if (displayName.trim() !== (user?.displayName || "")) {
        if (__DEV__) {
          console.log("[EditProfile] Display name changed:", displayName.trim(), "vs", user?.displayName);
        }
        profileData.displayName = displayName.trim();
      }
      
      if (username !== (user?.username || "")) {
        if (__DEV__) {
          console.log("[EditProfile] Username changed:", username, "vs", user?.username);
        }
        profileData.username = username;
      }

      // Update profile if there are changes
      if (Object.keys(profileData).length > 0) {
        if (__DEV__) {
          console.log("[EditProfile] Saving profile changes:", profileData);
        }
        
        await updateProfile(profileData);
        
        if (__DEV__) {
          console.log("[EditProfile] Profile update completed successfully");
        }

        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        // No changes made, just go back
        if (__DEV__) {
          console.log("[EditProfile] No changes detected, going back");
        }
        router.back();
      }
    } catch (error) {
      console.error("[EditProfile] Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [displayName, username, user, updateProfile, validateUsername, router]);

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true} // iOS 17+ automatic keyboard handling
        contentInsetAdjustmentBehavior="automatic" // Better iOS keyboard handling
      >
        {/* Avatar with edit pill below */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <UserAvatar size={AVATAR_SIZE} />
          </View>
          <Pressable
            onPress={handleAvatarEdit}
            style={styles.editPillButton}
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo"
            hitSlop={8}
            disabled={isLoading}
          >
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.editPillOverlay} />
            <View style={styles.editPillContent}>
              <Ionicons name="camera" size={16} color={colors.white} />
              <Text style={styles.editPillText}>Change Photo</Text>
            </View>
          </Pressable>
        </View>

        {/* Display Name Field */}
        <View style={styles.pillSection}>
          <Text style={styles.pillSectionTitle}>Display Name</Text>
          <View style={styles.pillContainer}>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              placeholderTextColor={colors.textSecondary}
              style={styles.pillInput}
              maxLength={50}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus next input (username) when user presses "next"
                usernameInputRef.current?.focus();
              }}
              blurOnSubmit={false}
            />
          </View>
          </View>

        {/* Username Field */}
        <View style={styles.pillSection}>
          <Text style={styles.pillSectionTitle}>Username</Text>
          <View style={styles.pillContainer}>
            <Text style={styles.atSymbol}>@</Text>
            <TextInput
              ref={usernameInputRef}
              value={username}
              onChangeText={(text) => {
                const cleanedText = text.toLowerCase().replace(/[^a-zA-Z0-9_]/g, "");
                setUsername(cleanedText);
                // Clear error when user starts typing
                if (usernameError) {
                  setUsernameError(null);
                }
              }}
              placeholder="username"
              placeholderTextColor={colors.textSecondary}
              style={styles.pillUsernameInput}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => {
                // Dismiss keyboard when user presses "done"
                usernameInputRef.current?.blur();
              }}
            />
            {isCheckingUsername && (
              <View style={styles.loadingIndicator}>
                <Ionicons name="hourglass" size={16} color={colors.textSecondary} />
              </View>
            )}
          </View>
          {usernameError && (
            <Text style={styles.errorText}>{usernameError}</Text>
          )}
          <Text style={styles.helperText}>
            3-20 characters, letters, numbers, and underscores only
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const AVATAR_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  content: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  avatarSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  editPillButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    alignSelf: "center",
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
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
    gap: 6,
  },
  editPillText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  pillSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  pillSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  pillContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 25, // Nice rounded pill shape
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  pillInput: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    paddingVertical: 0, // Remove default padding for better alignment
  },
  atSymbol: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: "500",
    marginRight: 6,
  },
  pillUsernameInput: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    paddingVertical: 0, // Remove default padding for better alignment
  },
  loadingIndicator: {
    marginLeft: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    lineHeight: 18,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: spacing.xxl,
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
  disabledText: {
    opacity: 0.5,
  },
});
