import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TextInput, Image, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing } from "../theme/theme";
import { useRouter } from "expo-router";

export default function CreateEchoScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photos to select a cover image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri ?? null);
    }
  }, []);

  const onSave = useCallback(() => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a title for your echo.");
      return;
    }
    // Here we would persist the new echo; for now just dismiss
    router.back();
  }, [router, title]);

  return (
    <View style={styles.container}>
      <Pressable onPress={pickImage} style={[styles.cover, !imageUri && styles.coverPlaceholder]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <Text style={styles.coverText}>Pick cover image</Text>
        )}
      </Pressable>

      <View style={{ height: spacing.xl }} />

      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Name your echo"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        returnKeyType="done"
      />

      <View style={{ height: spacing.xl }} />

      <Pressable onPress={onSave} style={styles.saveButton}>
        <Text style={styles.saveText}>Create</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  cover: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  coverPlaceholder: {
    borderStyle: "dashed",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverText: {
    color: colors.textSecondary,
  },
  label: {
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    color: colors.textPrimary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  saveButton: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: colors.black,
    fontWeight: "700",
  },
});


