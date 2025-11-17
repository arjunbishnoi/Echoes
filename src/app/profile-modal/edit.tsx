import { FormRow, FormSection } from "@/components/IOSForm";
import { colors, spacing } from "@/theme/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // UI-only defaults (no backend changes per request)
  const avatarUri = "https://picsum.photos/seed/arjun-bishnoi/400/400";
  const [displayName, setDisplayName] = useState("Arjun Bishnoi");
  const [username, setUsername] = useState("arjun");
  const params = useLocalSearchParams<{ displayName?: string; username?: string }>();

  useEffect(() => {
    if (typeof params.displayName === 'string') {
      setDisplayName(params.displayName);
    }
    if (typeof params.username === 'string') {
      setUsername(params.username);
    }
  }, [params.displayName, params.username]);
  const [editingField, setEditingField] = useState<null | "name" | "username">(null);
  const [tempValue, setTempValue] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: "Edit Profile" });
  }, [navigation]);

  const handleAvatarEdit = useCallback(() => {
    Alert.alert("Change Profile Photo", "Coming soon (local only)", [
      { text: "OK" },
    ]);
  }, []);


  const cancelEdit = useCallback(() => {
    setEditingField(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingField === "name") setDisplayName(tempValue.trim() || displayName);
    if (editingField === "username") setUsername(tempValue.trim() || username);
    setEditingField(null);
  }, [editingField, tempValue, displayName, username]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar with edit pill below (same as Edit Echo style) */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>
          <Pressable
            onPress={handleAvatarEdit}
            style={styles.editPillButton}
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo"
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

        {/* Fields */}
        <FormSection title="Display Name">
          <FormRow
            title={displayName}
            onPress={() =>
              router.push({ pathname: "/profile-modal/edit-name", params: { displayName } })
            }
            accessibilityLabel="Edit display name"
            showChevron
          />
        </FormSection>

        <FormSection title="Username">
          <FormRow
            title={`@${username}`}
            onPress={() =>
              router.push({
                pathname: "/profile-modal/edit-username",
                params: { username },
              })
            }
            accessibilityLabel="Edit username"
            showChevron
          />
        </FormSection>

        <FormSection title="Choose Main Colour">
          <View style={styles.colorRow}>
            {(["#0A84FF", "#5856D6", "#FF375F", "#34C759", "#FF9F0A", "#64D2FF", "#AF52DE"] as const).map((c) => (
              <Pressable key={c} accessibilityRole="button" hitSlop={8} style={[styles.colorSwatch, { backgroundColor: c }]} />
            ))}
          </View>
        </FormSection>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Edit modal with top edge actions (new modal) */}
      <Modal
        visible={!!editingField}
        transparent
        animationType="fade"
        onRequestClose={cancelEdit}
        statusBarTranslucent
      >
        <View style={styles.nativeModalContainer}>
          <View style={[styles.nativeModalHeader, { paddingTop: insets.top + spacing.md }]}> 
            <Pressable onPress={cancelEdit} accessibilityRole="button" hitSlop={12}>
              <Text style={styles.nativeBtn}>Cancel</Text>
            </Pressable>
            <Text style={styles.nativeTitle}>{editingField === "name" ? "Edit Display Name" : "Edit Username"}</Text>
            <Pressable onPress={saveEdit} accessibilityRole="button" hitSlop={12}>
              <Text style={[styles.nativeBtn, styles.nativeSave]}>Save</Text>
            </Pressable>
          </View>
          <View style={[styles.nativeBody, { paddingBottom: insets.bottom + spacing.lg }]}>
            <TextInput
              autoFocus
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={editingField === "name" ? "Enter display name" : "Enter username"}
              placeholderTextColor={colors.textSecondary}
              style={styles.modalInput}
              returnKeyType="done"
              onSubmitEditing={saveEdit}
              autoCapitalize={editingField === "username" ? "none" : undefined}
              autoCorrect={false}
            />
          </View>
        </View>
      </Modal>
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
    paddingTop: spacing.xxl + spacing.sm - 5,
    paddingBottom: spacing.xxl,
  },
  avatarSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.lg,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.surface,
  },
  editPillButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    alignSelf: "center",
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
  fieldCardInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inlineInput: {
    backgroundColor: colors.background,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    fontSize: 17,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  atPrefix: {
    color: colors.textSecondary,
    fontSize: 17,
    marginRight: spacing.xs,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  modalSheet: {
    flex: 1,
    backgroundColor: colors.modalSurface,
    borderTopLeftRadius: Platform.OS === "ios" ? 16 : 0,
    borderTopRightRadius: Platform.OS === "ios" ? 16 : 0,
    overflow: "hidden",
  },
  nativeModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  nativeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  nativeBtn: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  nativeSave: {
    color: colors.blue,
  },
  nativeTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  nativeBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  modalTopBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTopBarBtn: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "600",
  },
  modalTopBarSave: {
    color: colors.blue,
  },
  modalTopBarTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  modalBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.background,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    fontSize: 17,
  },
});
