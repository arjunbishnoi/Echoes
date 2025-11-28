import { colors, spacing } from "@/theme/theme";
import type { FriendCodeLookupResult } from "@/types/user";
import { useAuth } from "@/utils/authContext";
import { UserService } from "@/utils/services/userService";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import RNQRGenerator from "rn-qr-generator";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const QR_PREFIX = "ECHOES_FRIEND:";

const normalizeFriendCode = (payload: string): string | null => {
  if (!payload) return null;
  const trimmed = payload.trim();
  if (!trimmed) return null;
  if (trimmed.toUpperCase().startsWith(QR_PREFIX)) {
    return trimmed.toUpperCase().replace(QR_PREFIX, "");
  }
  const clean = trimmed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length < 5) return null;
  return clean;
};

export default function QRScanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [isDecodingImage, setIsDecodingImage] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [targetUser, setTargetUser] = useState<FriendCodeLookupResult | null>(null);
  const [pendingFriendCode, setPendingFriendCode] = useState<string | null>(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<"unknown" | "granted" | "denied">(
    "unknown",
  );

  const instructions = useMemo(() => {
    if (targetUser) {
      return `Send friend request to "${targetUser.displayName}"?`;
    }
    if (scanError) {
      return scanError;
    }
    if (selectedImageUri || manualCode) {
      return "Hang tight while we process that QR code.";
    }
    return "Import a friend's QR screenshot from your Photos or paste their code.";
  }, [targetUser, scanError, selectedImageUri, manualCode]);

  const resolveFriend = async (rawCode: string) => {
    if (!user) return;
    const normalized = normalizeFriendCode(rawCode);
    if (!normalized) {
      setScanError("That doesn't look like an Echoes friend code.");
      return;
    }
    setIsFetchingUser(true);
    setScanError(null);
    try {
      const friend = await UserService.resolveFriendCode(normalized);
      if (!friend) {
        setScanError("We couldn't find that user. Ask them to refresh their QR.");
        setTargetUser(null);
        setPendingFriendCode(null);
        return;
      }
      if (friend.id === user.id) {
        setScanError("You can't add yourself.");
        setTargetUser(null);
        setPendingFriendCode(null);
        return;
      }
      setPendingFriendCode(normalized);
      setTargetUser(friend);
    } catch (error) {
      console.error("Failed to resolve friend code", error);
      setScanError("Something went wrong. Try again.");
      setTargetUser(null);
      setPendingFriendCode(null);
    } finally {
      setIsFetchingUser(false);
    }
  };

  const handleImportFromPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setPermissionStatus(permission.status === "granted" ? "granted" : "denied");
    if (permission.status !== "granted") {
      Alert.alert("Permission needed", "Allow Photos access to pick QR screenshots.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.canceled || !result.assets?.length) {
      return;
    }
    const asset = result.assets[0];
    setSelectedImageUri(asset.uri);
    setTargetUser(null);
    setPendingFriendCode(null);
    setScanError(null);
    setManualCode("");
    setIsDecodingImage(true);
    try {
      const detection = await RNQRGenerator.detect({ uri: asset.uri });
      const qrPayload = detection.values?.[0];
      const normalized = normalizeFriendCode(qrPayload ?? "");
      if (!normalized) {
        setScanError("That photo doesn't contain an Echoes friend QR.");
        return;
      }
      await resolveFriend(normalized);
    } catch (error) {
      console.error("Failed to decode QR image", error);
      setScanError("We couldn't read a QR code in that image.");
    } finally {
      setIsDecodingImage(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      setScanError("Enter a friend code first.");
      return;
    }
    void resolveFriend(manualCode);
  };

  const handleSendRequest = async () => {
    if (!targetUser || !user || !pendingFriendCode) {
      return;
    }
    setIsSendingRequest(true);
    try {
      const { target } = await UserService.sendFriendRequestByFriendCode(user.id, pendingFriendCode);
      Alert.alert("Request sent", `We'll let ${target.displayName} know.`);
      router.back();
    } catch (error) {
      Alert.alert("Error", (error as Error)?.message ?? "Failed to send the request.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const resetState = () => {
    setSelectedImageUri(null);
    setManualCode("");
    setTargetUser(null);
    setPendingFriendCode(null);
    setScanError(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Import a QR</Text>
        <Text style={styles.subtitle}>
          Choose a screenshot from Photos or paste a code—no camera scanning needed.
        </Text>

        <View style={styles.previewCard}>
          {selectedImageUri ? (
            <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewText}>Imported QR screenshot will show up here.</Text>
            </View>
          )}
          <Pressable style={styles.primaryButton} onPress={handleImportFromPhotos}>
            <Text style={styles.primaryButtonText}>Import from Photos</Text>
          </Pressable>
          {permissionStatus === "denied" && (
            <Text style={styles.permissionHint}>
              Photo access is required to import QR screenshots. Enable it in Settings.
            </Text>
          )}
        </View>

        <View style={styles.manualEntryCard}>
          <Text style={styles.inputLabel}>Or paste their friend code</Text>
          <TextInput
            style={styles.input}
            value={manualCode}
            onChangeText={(text) => {
              setManualCode(text);
              setScanError(null);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="E.g. ABCD1234"
            placeholderTextColor={colors.textSecondary}
          />
          <Pressable
            style={[
              styles.secondaryButton,
              (!manualCode.trim() || isFetchingUser) && styles.disabledButton,
            ]}
            onPress={handleManualSubmit}
            disabled={!manualCode.trim() || isFetchingUser}
          >
            <Text style={styles.secondaryButtonText}>
              {isFetchingUser ? "Looking up…" : "Lookup code"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={[styles.instructions, scanError && styles.errorText]}>{instructions}</Text>
          {(isDecodingImage || isFetchingUser) && (
            <ActivityIndicator style={{ marginTop: spacing.sm }} color={colors.white} />
          )}
          {scanError && (
            <Pressable style={[styles.secondaryButton, styles.tryAgainButton]} onPress={resetState}>
              <Text style={styles.secondaryButtonText}>Try again</Text>
            </Pressable>
          )}
        </View>

        {targetUser ? (
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>
              Send friend request to "{targetUser.displayName}"?
            </Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.secondaryButton} onPress={resetState} disabled={isSendingRequest}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, isSendingRequest && styles.primaryDisabled]}
                onPress={handleSendRequest}
                disabled={isSendingRequest}
              >
                <Text style={styles.primaryButtonText}>
                  {isSendingRequest ? "Sending…" : "Send Request"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </Pressable>
        )}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
  },
  previewPlaceholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  previewText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  permissionHint: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  manualEntryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 16,
    letterSpacing: 1,
  },
  instructionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  instructions: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  errorText: {
    color: "#FF6B6B",
  },
  tryAgainButton: {
    width: "100%",
  },
  confirmCard: {
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  confirmTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  confirmActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.blue,
    alignItems: "center",
  },
  primaryDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

