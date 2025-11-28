import UserAvatar from "@/components/ui/UserAvatar";
import { colors, spacing } from "@/theme/theme";
import { useAuth } from "@/utils/authContext";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";

const QR_PREFIX = "ECHOES_FRIEND:";

export default function QRShareScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const friendCode = user?.friendCode;
  const qrValue = friendCode ? `${QR_PREFIX}${friendCode}` : "";
  const [isSaving, setIsSaving] = useState(false);
  const qrRef = useRef<QRCode | null>(null);

  const handleCopy = async () => {
    if (!friendCode) return;
    await Clipboard.setStringAsync(friendCode);
    Alert.alert("Copied", "Your friend code has been copied to the clipboard.");
  };

  const handleShare = async () => {
    if (!friendCode) return;
    try {
      await Share.share({
        message: `Add me on Echoes! Scan my QR or use this code: ${friendCode}`,
      });
    } catch {
      Alert.alert("Error", "Unable to open the share sheet. Please try again.");
    }
  };

  const handleSaveToPhotos = async () => {
    if (!friendCode || !qrRef.current) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow Echoes to save photos to store your QR code.");
      return;
    }
    setIsSaving(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        qrRef.current?.toDataURL((data) => {
          if (data) resolve(data);
          else reject(new Error("Failed to capture QR data"));
        });
      });
      const fileUri = `${FileSystem.cacheDirectory}echoes-qr-${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert("Saved", "QR code saved to your Photos.");
    } catch (error) {
      console.error("Failed to save QR image", error);
      Alert.alert("Error", "Couldn't save the QR image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <Text style={styles.title}>Share your QR</Text>
        <Text style={styles.subtitle}>
          Friends can scan this QR or enter your code to send you a friend request.
        </Text>

        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <UserAvatar size={72} />
            <Text style={styles.displayName}>{user?.displayName || user?.username || "You"}</Text>
            <Text style={styles.username}>@{user?.username || "username"}</Text>
          </View>

          <View style={styles.qrWrapper}>
            {friendCode ? (
              <QRCode
                value={qrValue}
                size={220}
                backgroundColor={colors.surface}
                getRef={(ref) => {
                  qrRef.current = ref;
                }}
              />
            ) : (
              <View style={styles.missingWrapper}>
                <Text style={styles.missingText}>Generating your friend code…</Text>
              </View>
            )}
          </View>

          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>Friend code</Text>
            <Text style={styles.codeValue}>{friendCode ?? "…"}</Text>
          </View>

          <View style={styles.actionsColumn}>
            <Pressable
              style={[styles.actionButton, !friendCode && styles.actionDisabled]}
              onPress={handleCopy}
              disabled={!friendCode}
            >
              <Text style={styles.actionText}>Copy code</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, !friendCode && styles.actionDisabled]}
              onPress={handleShare}
              disabled={!friendCode}
            >
              <Text style={styles.actionText}>Share QR</Text>
            </Pressable>
            <Pressable
              style={[
                styles.secondaryActionButton,
                (!friendCode || isSaving) && styles.actionDisabled,
              ]}
              onPress={handleSaveToPhotos}
              disabled={!friendCode || isSaving}
            >
              <Text style={styles.secondaryActionText}>
                {isSaving ? "Saving…" : "Save to Photos"}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Done</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.xxl,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    marginTop: spacing.xxl,
    width: "100%",
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: spacing.xxl,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    alignItems: "center",
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  displayName: {
    marginTop: spacing.md,
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  username: {
    marginTop: spacing.xs,
    fontSize: 15,
    color: colors.textSecondary,
  },
  qrWrapper: {
    width: 260,
    height: 260,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  missingWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  missingText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  codeRow: {
    width: "100%",
    paddingVertical: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  codeLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  codeValue: {
    marginTop: spacing.xs,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  actionsColumn: {
    width: "100%",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.blue,
    alignItems: "center",
  },
  secondaryActionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  actionDisabled: {
    backgroundColor: colors.surfaceBorder,
  },
  actionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryActionText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});

