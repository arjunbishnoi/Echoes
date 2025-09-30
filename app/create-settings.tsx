import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Alert, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { FormRow, FormSection } from "../components/IOSForm";
import { useEchoDraft } from "../lib/echoDraft";
import { getExpoSwiftUI } from "../lib/expoUi";
import { colors, spacing } from "../theme/theme";

type Friend = {
  id: string;
  avatarUri: string;
  name: string;
};

export default function CreateEchoSettingsScreen() {
  const { isPrivate, setIsPrivate, collaboratorIds, setCollaboratorIds, lockDate, setLockDate, unlockDate, setUnlockDate } = useEchoDraft();
  const SwiftUI = Platform.OS === "ios" ? getExpoSwiftUI() : null;

  const friends: Friend[] = useMemo(() => (
    Array.from({ length: 16 }).map((_, i) => ({
      id: String(i + 1),
      name: `Friend ${i + 1}`,
      avatarUri: `https://picsum.photos/seed/echo-friend-${i + 1}/100/100`,
    }))
  ), []);

  function toggleCollaborator(friendId: string) {
    setCollaboratorIds(
      collaboratorIds.includes(friendId)
        ? collaboratorIds.filter(id => id !== friendId)
        : [...collaboratorIds, friendId]
    );
  }

  function formatDateLabel(date: Date | undefined): string {
    if (!date) return "Pick Later";
    try {
      return date.toLocaleDateString();
    } catch {
      return "Pick Later";
    }
  }

  function onPressLockDate() {
    Alert.alert(
      "Lock Date",
      "Set a temporary date now?",
      [
        { text: "Pick Later", style: "cancel", onPress: () => setLockDate(undefined) },
        { text: "Use Today", onPress: () => setLockDate(new Date()) },
      ]
    );
  }

  function onPressUnlockDate() {
    Alert.alert(
      "Unlock Date",
      "Set a temporary date now?",
      [
        { text: "Pick Later", style: "cancel", onPress: () => setUnlockDate(undefined) },
        { text: "Use Today", onPress: () => setUnlockDate(new Date()) },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
      {SwiftUI ? (
        <View style={{ marginBottom: spacing.xl }}>
          <SwiftUI.Host style={{ flex: 1 }}>
            <SwiftUI.Form>
              <SwiftUI.Section>
                <SwiftUI.Switch
                  value={isPrivate}
                  label="Private"
                  onValueChange={setIsPrivate}
                />
              </SwiftUI.Section>
            </SwiftUI.Form>
          </SwiftUI.Host>
        </View>
      ) : (
        <FormSection>
          <FormRow
            title="Private"
            Right={
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                thumbColor={colors.white}
              />
            }
          />
        </FormSection>
      )}

      {!isPrivate ? (
        SwiftUI ? (
          <SwiftUI.Host style={{ flex: 1 }}>
            <SwiftUI.Form>
              <SwiftUI.Section title="Choose Collaborators">
                <View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.avatarsRow}
                  >
                    {friends.map(friend => {
                      const selected = collaboratorIds.includes(friend.id);
                      return (
                        <Pressable
                          key={friend.id}
                          onPress={() => toggleCollaborator(friend.id)}
                          style={[styles.avatarWrap, selected && styles.avatarWrapSelected]}
                          accessibilityRole="button"
                          accessibilityLabel={`Select ${friend.name}`}
                        >
                          <ImageBackground
                            source={{ uri: friend.avatarUri }}
                            style={styles.avatarImage}
                            imageStyle={{ borderRadius: 100 }}
                          >
                            {selected ? (
                              <View style={styles.avatarSelectedBadge}>
                                <Ionicons name="checkmark" size={14} color={colors.black} />
                              </View>
                            ) : null}
                          </ImageBackground>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </SwiftUI.Section>
            </SwiftUI.Form>
          </SwiftUI.Host>
        ) : (
          <FormSection title="Choose Collaborators">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarsRow}
            >
              {friends.map(friend => {
                const selected = collaboratorIds.includes(friend.id);
                return (
                  <Pressable
                    key={friend.id}
                    onPress={() => toggleCollaborator(friend.id)}
                    style={[styles.avatarWrap, selected && styles.avatarWrapSelected]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${friend.name}`}
                  >
                    <ImageBackground
                      source={{ uri: friend.avatarUri }}
                      style={styles.avatarImage}
                      imageStyle={{ borderRadius: 100 }}
                    >
                      {selected ? (
                        <View style={styles.avatarSelectedBadge}>
                          <Ionicons name="checkmark" size={14} color={colors.black} />
                        </View>
                      ) : null}
                    </ImageBackground>
                  </Pressable>
                );
              })}
            </ScrollView>
          </FormSection>
        )
      ) : null}

      {SwiftUI ? (
        <SwiftUI.Host style={{ flex: 1 }}>
          <SwiftUI.Form>
            <SwiftUI.Section>
              <SwiftUI.Button onPress={onPressLockDate}>Lock Date: {formatDateLabel(lockDate)}</SwiftUI.Button>
              <SwiftUI.Button onPress={onPressUnlockDate}>Unlock Date: {formatDateLabel(unlockDate)}</SwiftUI.Button>
            </SwiftUI.Section>
          </SwiftUI.Form>
        </SwiftUI.Host>
      ) : (
        <FormSection>
          <FormRow
            title="Lock Date"
            valueText={formatDateLabel(lockDate)}
            onPress={onPressLockDate}
            accessibilityLabel="Pick lock date"
            showChevron
          />
          <FormRow
            title="Unlock Date"
            valueText={formatDateLabel(unlockDate)}
            onPress={onPressUnlockDate}
            accessibilityLabel="Pick unlock date"
            showChevron
          />
        </FormSection>
      )}
    </ScrollView>
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
    paddingBottom: spacing.xl,
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
});




