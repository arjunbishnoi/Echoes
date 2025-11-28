import { colors, spacing } from "@/theme/theme";
import type { FriendCodeLookupResult } from "@/types/user";
import { useAuth } from "@/utils/authContext";
import { useFriends } from "@/utils/friendContext";
import { UserService } from "@/utils/services/userService";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const normalizeFriendCode = (code: string): string | null => {
  if (!code) return null;
  const trimmed = code.trim();
  if (!trimmed) return null;
  const clean = trimmed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length < 5) return null;
  return clean;
};

export default function AddFriendsScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const { friendsById } = useFriends();
  const [friendCode, setFriendCode] = useState<string | null>(user?.friendCode ?? null);
  const [inputCode, setInputCode] = useState("");
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [targetUser, setTargetUser] = useState<FriendCodeLookupResult | null>(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Match profile-modal header offset (same as friends screen)
  const topHeaderOffset = useMemo(() => insets.top + 44, [insets.top]);

  // Keep local friendCode in sync if auth user updates
  useEffect(() => {
    if (user?.friendCode && user.friendCode !== friendCode) {
      setFriendCode(user.friendCode);
    }
  }, [user?.friendCode]);

  // If friendCode is missing, fetch it from Firestore and backfill
  useEffect(() => {
    if (!user || friendCode) return;

    let cancelled = false;
    (async () => {
      try {
        const freshUser = await UserService.getUser(user.id);
        if (!freshUser || cancelled) return;

        if (freshUser.friendCode) {
          setFriendCode(freshUser.friendCode);
          // Also sync into auth context so the rest of the app sees it
          await updateProfile({ friendCode: freshUser.friendCode });
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("[AddFriends] Failed to load friend code", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, friendCode, updateProfile]);

  const handleLookup = async () => {
    if (!user || !inputCode.trim()) return;
    
    // Dismiss keyboard first, but don't wait for it
    inputRef.current?.blur();
    Keyboard.dismiss();
    
    const normalized = normalizeFriendCode(inputCode);
    if (!normalized) {
      setError("Please enter a valid friend code.");
      setTargetUser(null);
      return;
    }

    setIsFetchingUser(true);
    setError(null);
    setTargetUser(null);

    try {
      const friend = await UserService.resolveFriendCode(normalized);
      if (!friend) {
        setError("We couldn't find that user. Please check the code and try again.");
        return;
      }
      if (friend.id === user.id) {
        setError("You can't add yourself.");
        return;
      }

      // Check if already a friend
      if (friendsById[friend.id]) {
        setError("You are already friends with this user.");
        setTargetUser(null);
        return;
      }

      // Check if there's a pending friend request
      const hasPendingRequest = await UserService.hasPendingFriendRequest(user.id, friend.id);
      if (hasPendingRequest) {
        setError("A friend request has already been sent to this user.");
        setTargetUser(null);
        return;
      }

      setTargetUser(friend);
    } catch (error) {
      console.error("Failed to resolve friend code", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsFetchingUser(false);
    }
  };

  const handleSendRequest = async () => {
    if (!targetUser || !user || !inputCode.trim()) {
      return;
    }
    
    const normalized = normalizeFriendCode(inputCode);
    if (!normalized) {
      setError("Invalid friend code.");
      return;
    }

    setIsSendingRequest(true);
    try {
      const { target } = await UserService.sendFriendRequestByFriendCode(user.id, normalized);
      Alert.alert("Request sent", `We'll let ${target.displayName} know.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", (error as Error)?.message ?? "Failed to send the request.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleReset = () => {
    setInputCode("");
    setTargetUser(null);
    setError(null);
  };

  const handleCopyCode = async () => {
    if (!friendCode) return;
    try {
      await Clipboard.setStringAsync(friendCode);
      Alert.alert("Copied", "Your friend code has been copied to the clipboard.");
    } catch (error) {
      Alert.alert("Error", "Failed to copy code. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topHeaderOffset }]}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        scrollIndicatorInsets={{ top: topHeaderOffset, bottom: 0, left: 0, right: 0 }}
      >
        {/* Your Code Section */}
        <View style={styles.yourCodeSection}>
          <Text style={styles.yourCodeLabel}>Your code</Text>
          <View style={styles.codeRow}>
            <Pressable onPress={handleCopyCode} disabled={!friendCode}>
              <Text style={styles.codeText}>{friendCode ?? "Loading..."}</Text>
            </Pressable>
            {friendCode && (
              <Pressable
                onPress={handleCopyCode}
                style={styles.copyButton}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Copy friend code"
              >
                <Ionicons name="copy-outline" size={20} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        <Text style={styles.subtitle}>
          Share your code with friends or enter their code to send a request.
        </Text>

        {/* Input Section */}
        <View style={styles.pillSection}>
          <Text style={styles.pillSectionTitle}>Enter friend code</Text>
          <View style={styles.pillContainer}>
            <TextInput
              ref={inputRef}
              style={styles.pillInput}
              value={inputCode}
              onChangeText={(text) => {
                setInputCode(text);
                setError(null);
                setTargetUser(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="E.g. ABCD1234"
              placeholderTextColor={colors.textSecondary}
              editable={!isFetchingUser && !isSendingRequest}
            />
            {isFetchingUser ? (
              <View style={styles.searchButton}>
                <ActivityIndicator color={colors.textSecondary} size="small" />
              </View>
            ) : (
              <Pressable
                onPressIn={(e) => {
                  e.stopPropagation();
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  if (inputCode.trim() && !targetUser && !error && !isFetchingUser) {
                    handleLookup();
                  }
                }}
                disabled={!inputCode.trim() || !!targetUser || !!error || isFetchingUser}
                style={[
                  styles.searchButton,
                  (!inputCode.trim() || !!targetUser || !!error || isFetchingUser) && styles.searchButtonDisabled,
                ]}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Look up friend code"
              >
                <Ionicons
                  name="search"
                  size={18}
                  color={inputCode.trim() && !targetUser && !error ? colors.black : colors.textSecondary}
                />
              </Pressable>
            )}
          </View>
          
          {error && <Text style={styles.errorText}>{error}</Text>}

          {targetUser && (
            <View style={styles.targetUserCard}>
              <Text style={styles.targetUserLabel}>Send friend request to:</Text>
              <Text style={styles.targetUserName}>{targetUser.displayName}</Text>
              <View style={styles.targetUserActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={handleReset}
                  disabled={isSendingRequest}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.sendButton, isSendingRequest && styles.sendButtonDisabled]}
                  onPress={handleSendRequest}
                  disabled={isSendingRequest}
                >
                  {isSendingRequest ? (
                    <ActivityIndicator color={colors.black} size="small" />
                  ) : (
                    <Text style={styles.sendButtonText}>Send Request</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  container: {
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: spacing.xl,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  yourCodeSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  yourCodeLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  codeText: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  copyButton: {
    padding: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  pillSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
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
    alignItems: "stretch",
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingLeft: spacing.lg,
    paddingRight: 0,
    paddingVertical: 0,
    height: 50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
  },
  pillInput: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    paddingVertical: 0,
    letterSpacing: 1,
    paddingLeft: 0,
    paddingRight: spacing.md,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonDisabled: {
    backgroundColor: colors.surfaceBorder,
    opacity: 0.5,
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    lineHeight: 18,
  },
  targetUserCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  targetUserLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  targetUserName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.lg,
  },
  targetUserActions: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  sendButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: "600",
  },
});

