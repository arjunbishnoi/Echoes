import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, Pressable, TextInput, Platform } from "react-native";
import { colors, spacing, sizes } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ProfileStatCard from "../components/ProfileStatCard";

export default function ProfileModal() {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState("Arjun Bishnoi");
  const [handle, setHandle] = React.useState("@arjun");
  const [bio, setBio] = React.useState("Building memories with echoes. Traveler, foodie, and a bit of a nerd.");

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: sizes.list.bottomPadding }}>
      {/* Avatar + Edit Photo */}
      <View style={{ alignItems: "center" }}>
        <View style={{ position: "relative" }}>
          <Image source={{ uri: "https://i.pravatar.cc/300?img=12" }} style={styles.avatarBig} />
          <Pressable
            onPress={() => {}}
            hitSlop={10}
            accessibilityRole="button"
            android_ripple={Platform.OS === "android" ? { color: "rgba(255,255,255,0.15)", borderless: true } : undefined}
            style={styles.editPhotoBtn}
          >
            <Ionicons name="camera" size={18} color={colors.black} />
          </Pressable>
        </View>
      </View>

      <View style={{ height: spacing.lg }} />
      {/* Name + Handle with Edit toggle */}
      <View style={styles.nameRow}>
        <View style={{ flex: 1 }}>
          {editing ? (
            <>
              <TextInput value={name} onChangeText={setName} style={styles.inputName} placeholder="Name" placeholderTextColor={colors.textSecondary} />
              <View style={{ height: spacing.xs }} />
              <TextInput value={handle} onChangeText={setHandle} style={styles.inputHandle} placeholder="@handle" placeholderTextColor={colors.textSecondary} />
            </>
          ) : (
            <>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.sub}>{handle}</Text>
            </>
          )}
        </View>
        <Pressable
          onPress={() => setEditing(e => !e)}
          accessibilityRole="button"
          android_ripple={Platform.OS === "android" ? { color: "rgba(255,255,255,0.15)", borderless: true } : undefined}
          style={styles.editBtn}
        >
          <Text style={styles.editText}>{editing ? "Save" : "Edit"}</Text>
        </Pressable>
      </View>

      <View style={{ height: spacing.lg }} />
      {/* Bio */}
      <Text style={styles.section}>Bio</Text>
      {editing ? (
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          style={styles.inputBio}
          placeholder="Tell the world about yourself"
          placeholderTextColor={colors.textSecondary}
        />
      ) : (
        <Text style={styles.body}>{bio}</Text>
      )}

      <View style={{ height: spacing.xl }} />
      {/* Account overview */}
      <Text style={styles.section}>Overview</Text>
      <View style={{ height: spacing.md }} />
      <View style={{ flexDirection: "row", gap: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <ProfileStatCard icon="lock-closed-outline" value={21} label="Total Echoes" aspectRatio={1.1} compact onPress={() => router.push("/echoes")} />
        </View>
        <View style={{ flex: 1 }}>
          <ProfileStatCard icon="people-outline" value={10} label="Friends" aspectRatio={1.1} compact onPress={() => router.push("/friends")} />
        </View>
      </View>

      <View style={{ height: spacing.xl }} />
      {/* Quick links */}
      <View style={styles.cardList}>
        <ListItem icon="people-outline" label="Friends" onPress={() => router.push("/friends")} />
        <ListItem icon="notifications-outline" label="Notifications" onPress={() => router.push("/notifications")} />
        <ListItem icon="lock-closed-outline" label="Privacy & Security" onPress={() => {}} />
        <ListItem icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
        <ListItem icon="information-circle-outline" label="About" onPress={() => {}} />
      </View>

      <View style={{ height: spacing.lg }} />
      <Pressable onPress={() => {}} accessibilityRole="button" android_ripple={Platform.OS === "android" ? { color: "rgba(0,0,0,0.08)", borderless: true } : undefined} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

function ListItem({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.itemRow} android_ripple={Platform.OS === "android" ? { color: "rgba(255,255,255,0.10)" } : undefined}>
      <Ionicons name={icon} size={22} color={colors.textPrimary} />
      <Text style={styles.itemLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avatarBig: { width: 120, height: 120, borderRadius: 60 },
  editPhotoBtn: { position: "absolute", right: 0, bottom: 0, backgroundColor: colors.white, borderRadius: 16, padding: 6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  sub: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  inputName: { color: colors.textPrimary, fontSize: 20, fontWeight: "800", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2B2B2B", paddingVertical: 6 },
  inputHandle: { color: colors.textSecondary, fontSize: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2B2B2B", paddingVertical: 6 },
  editBtn: { backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  editText: { color: colors.black, fontWeight: "700" },
  section: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  inputBio: { color: colors.textPrimary, lineHeight: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: "#2B2B2B", borderRadius: 12, padding: spacing.md, minHeight: 80 },
  cardList: { borderRadius: 16, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2B2B2B" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: "#0A0A0A" },
  itemLabel: { color: colors.textPrimary, fontSize: 16, fontWeight: "600" },
  logoutBtn: { alignSelf: "stretch", marginTop: spacing.lg, backgroundColor: colors.white, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  logoutText: { color: colors.black, fontWeight: "800" },
});




