import { colors, radii, spacing } from "@/theme/theme";
import type { User } from "@/types/user";
import { useAuth } from "@/utils/authContext";
import { ProfileCompletionTracker } from "@/utils/profileCompletionTracker";
import { StorageService } from "@/utils/services/storageService";
import { UserService } from "@/utils/services/userService";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function PersonalizationScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const validateUsername = async (usernameValue: string) => {
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

    // Check if username is unique
    setIsCheckingUsername(true);
    try {
      const isAvailable = await UserService.isUsernameAvailable(usernameValue, user?.id);
      
      if (!isAvailable) {
        setUsernameError("Username is already taken");
        return false;
      }

      setUsernameError(null);
      return true;
    } catch (error) {
      setUsernameError("Unable to check username availability");
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    const cleanedText = text.toLowerCase().replace(/[^a-zA-Z0-9_]/g, "");
    setUsername(cleanedText);
    setUsernameError(null);
  };

  const handleUsernameBlur = () => {
    if (username.trim()) {
      validateUsername(username);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to select a profile picture."
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
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const handleComplete = async () => {
    if (!username.trim()) {
      setUsernameError("Username is required");
      return;
    }

    const isUsernameValid = await validateUsername(username);
    if (!isUsernameValid) {
      return;
    }

    setIsLoading(true);
    try {
      let downloadURL = null;

      // Upload profile image if selected
      if (profileImage && user?.id) {
        if (__DEV__) {
          console.log("[PersonalizationScreen] Uploading profile image...");
        }
        try {
          downloadURL = await StorageService.uploadProfilePhoto(
            user.id, 
            profileImage,
            (progress) => {
              if (__DEV__) console.log(`[PersonalizationScreen] Upload progress: ${progress}%`);
            }
          );
          if (__DEV__) {
            console.log("[PersonalizationScreen] Image uploaded, URL:", downloadURL);
          }
        } catch (uploadError) {
          console.error("[PersonalizationScreen] Failed to upload image:", uploadError);
          // We continue without the image if upload fails, or we could throw
          // For now, let's alert but continue? Or maybe fail?
          // Let's fail securely so they know.
          throw new Error("Failed to upload profile picture. Please try again.");
        }
      }

      const profileData: Partial<User> = {
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        profileCompleted: true, // Mark profile as completed
      };

      // Only include photoURL if we have a valid download URL
      if (downloadURL) {
        profileData.photoURL = downloadURL;
      }

      if (__DEV__) {
        console.log("[PersonalizationScreen] Updating profile with data:", profileData);
      }

      await updateProfile(profileData);
      
      // Mark user as completed in local tracker
      if (user?.id) {
        await ProfileCompletionTracker.markProfileCompleted(user.id);
      }
      
      if (__DEV__) {
        console.log("[PersonalizationScreen] Profile updated successfully, navigating to main");
      }
      
      router.replace("/(main)/" as Href);
    } catch (error: any) {
      console.error("[PersonalizationScreen] Error completing profile:", error);
      
      // Check if it's a network/connection issue
      const isNetworkError = error?.message?.includes("Target ID already exists") || 
                            error?.message?.includes("offline") ||
                            error?.message?.includes("network");
      
      Alert.alert(
        "Error",
        isNetworkError 
          ? "Connection issue detected. Please check your internet connection and try again."
          : "Failed to save your profile. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canComplete = username.trim().length >= 3 && !usernameError && !isCheckingUsername;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Ionicons name="person-add" size={40} color={colors.primary} />
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Let's personalize your Echoes experience
            </Text>
          </View>

          <View style={styles.form}>
            {/* Profile Picture */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionLabel}>Profile Picture</Text>
              <View style={styles.imageContainerWrapper}>
                <Pressable style={styles.imageContainer} onPress={pickImage}>
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera" size={32} color={colors.textSecondary} />
                      <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>

            {/* Display Name */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.textInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
                placeholderTextColor={colors.textSecondary}
                maxLength={50}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            {/* Username */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                Username<Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.usernameContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    usernameError && styles.textInputError,
                  ]}
                  value={username}
                  onChangeText={handleUsernameChange}
                  onBlur={handleUsernameBlur}
                  placeholder="username"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                />
                {isCheckingUsername && (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={styles.usernameLoader}
                  />
                )}
              </View>
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : (
                <Text style={styles.inputHelper}>
                  Must be unique, 3-20 characters, letters, numbers, and underscores only
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.completeButton,
              !canComplete && styles.completeButtonDisabled,
            ]}
            onPress={handleComplete}
            disabled={!canComplete || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={styles.completeButtonText}>Continue</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    flex: 1,
    gap: spacing.xxl,
  },
  imageSection: {
    alignItems: "flex-start",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "left",
  },
  imageContainerWrapper: {
    width: "100%",
    alignItems: "center",
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  inputSection: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  usernameContainer: {
    position: "relative",
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textInputError: {
    borderColor: colors.error,
  },
  usernameLoader: {
    position: "absolute",
    right: spacing.lg,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  inputHelper: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  completeButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  completeButtonDisabled: {
    backgroundColor: colors.surfaceBorder,
    opacity: 0.5,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.black,
  },
});
