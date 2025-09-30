import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    ImageBackground,
    Keyboard,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, sizes, spacing } from "../theme/theme";

export default function CreateEchoScreen() {
  const [coverImageUri, setCoverImageUri] = useState<string | undefined>(undefined);
  const [echoName, setEchoName] = useState("");
  const nameInputRef = useRef<TextInput>(null);
  const translateUp = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const hasName = echoName.trim().length > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  async function requestAndPickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your photos to pick a cover image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.9,
      exif: false,
    });
    if (!result.canceled) {
      setCoverImageUri(result.assets[0]?.uri);
    }
  }

  function onCreateEcho() {
    if (!hasName) return;
    // For now just show a confirmation. Integrate API/navigation as needed.
    Alert.alert("Echo created", `Name: ${echoName}`);
  }

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const clearance = 0; // keep small gap above the keyboard
    const onShow = (e: any) => {
      const height = e?.endCoordinates?.height ?? 0;
      const duration = e?.duration ?? 280;
      Animated.timing(translateUp, {
        toValue: Math.max(0, height - (insets.bottom + clearance)),
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };
    const onHide = (e: any) => {
      const duration = e?.duration ?? 220;
      Animated.timing(translateUp, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };
    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [translateUp, insets.bottom]);

  return (
    <View style={{ flex: 1 }}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: sizes.list.bottomPadding + spacing.xl }]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={requestAndPickImage} style={styles.coverPressable} accessibilityRole="button" accessibilityLabel="Pick cover photo">
        <View style={styles.coverContainer}>
          {coverImageUri ? (
            <ImageBackground source={{ uri: coverImageUri }} resizeMode="cover" style={styles.coverImage}>
              <View style={styles.coverOverlay} />
              <View style={styles.coverCta}>
                <Ionicons name="image" size={18} color={colors.white} />
                <Text style={styles.coverCtaText}>Change cover photo</Text>
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}> 
              <Ionicons name="image" size={24} color={colors.textSecondary} />
              <Text style={styles.coverPlaceholderText}>Add cover photo</Text>
            </View>
          )}
        </View>
      </Pressable>

      <View style={styles.fieldGroup}>
        <TextInput
          style={styles.textInput}
          placeholder="Echo Name"
          placeholderTextColor="#BEBEBE"
          value={echoName}
          onChangeText={setEchoName}
          autoCapitalize="sentences"
          autoCorrect
          selectionColor={colors.white}
          ref={nameInputRef}
          autoFocus
        />
      </View>

      {/* Settings (privacy, collaborators, dates) moved to settings modal */}

    </ScrollView>
    <Animated.View style={[
      styles.footerContainer,
      {
        paddingBottom: insets.bottom + spacing.lg,
        transform: [{ translateY: Animated.multiply(translateUp, -1) }],
      },
    ]}>
      <Pressable
        onPress={onCreateEcho}
        disabled={!hasName}
        style={[styles.createButton, !hasName && styles.createButtonDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Create Echo"
      >
        <Text style={[styles.createButtonText, !hasName && styles.createButtonTextDisabled]}>Create Echo</Text>
      </Pressable>
    </Animated.View>
    </View>
  );
}

const AVATAR_SIZE = 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalSurface,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: sizes.list.bottomPadding,
  },
  footerContainer: {
    paddingHorizontal: spacing.lg,
    backgroundColor: "transparent",
  },
  coverPressable: {
    marginBottom: spacing.lg,
  },
  coverContainer: {
    borderRadius: radii.card,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  coverImage: {
    width: "100%",
    aspectRatio: 16 / 8,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  coverCta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.28)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  coverCtaText: {
    color: colors.white,
    fontWeight: "600",
  },
  coverPlaceholder: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  coverPlaceholderText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  textInput: {
    backgroundColor: colors.surface,
    color: colors.white,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: 16,
  },
  rowInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceBorder,
  },
  rowLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  rowValue: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  avatarsRow: {
    paddingVertical: spacing.sm,
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
  rowPressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceBorder,
  },
  createButton: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  createButtonDisabled: {
    opacity: 0.35,
  },
  createButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "800",
  },
  createButtonTextDisabled: {
    color: colors.black,
  },
});

