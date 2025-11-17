import { UnifiedFormSection } from "@/components/forms/UnifiedForm";
import { UnifiedFormRow } from "@/components/forms/UnifiedFormRow";
import { FormSection } from "@/components/IOSForm";
import { colors, spacing } from "@/theme/theme";
import { useEchoDraft } from "@/utils/echoDraft";
import { useFriends } from "@/utils/friendContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useMemo, useState } from "react";
import { ActionSheetIOS, ImageBackground, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";

type Friend = {
  id: string;
  avatarUri: string;
  name: string;
};

export default function CreateEchoSettingsScreen() {
  const { isPrivate, setIsPrivate, collaboratorIds, setCollaboratorIds, lockDate, setLockDate, unlockDate, setUnlockDate } = useEchoDraft();
  const [showLockPicker, setShowLockPicker] = useState(false);
  const [showUnlockPicker, setShowUnlockPicker] = useState(false);

  const { friends } = useFriends();
  const collaboratorOptions: Friend[] = useMemo(
    () =>
      friends.map((f) => ({
        id: f.id,
        name: f.displayName,
        avatarUri: f.photoURL || "",
      })),
    [friends]
  );

  const toggleCollaborator = useCallback(
    (friendId: string) => {
      setCollaboratorIds((prev: string[]) =>
        prev.includes(friendId) ? prev.filter((id: string) => id !== friendId) : [...prev, friendId]
      );
    },
    [setCollaboratorIds]
  );

  const formatDateLabel = useCallback((date: Date | undefined): string => {
    if (!date) return "Pick Later";
    try {
      return date.toLocaleDateString();
    } catch {
      return "Pick Later";
    }
  }, []);

  const onPressLockDate = useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Pick Later", "Choose Date", "Cancel"],
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            setLockDate(undefined);
          } else if (buttonIndex === 1) {
            setShowLockPicker(true);
          }
        }
      );
    } else {
      setShowLockPicker(true);
    }
  }, [setLockDate]);

  const onPressUnlockDate = useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Pick Later", "Choose Date", "Cancel"],
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            setUnlockDate(undefined);
          } else if (buttonIndex === 1) {
            setShowUnlockPicker(true);
          }
        }
      );
    } else {
      setShowUnlockPicker(true);
    }
  }, [setUnlockDate]);

  const handleDateChange = useCallback(
    (type: "lock" | "unlock", event: any, selectedDate?: Date) => {
      const setDate = type === "lock" ? setLockDate : setUnlockDate;
      const setShowPicker = type === "lock" ? setShowLockPicker : setShowUnlockPicker;

      if (Platform.OS === "android") {
        setShowPicker(false);
        if (event.type === "set" && selectedDate) {
          setDate(selectedDate);
        }
      } else if (selectedDate) {
        setDate(selectedDate);
      }
    },
    [setLockDate, setUnlockDate]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
      <UnifiedFormSection style={styles.sectionSpacing}>
        <UnifiedFormRow
          title="Private"
          switch
          switchValue={isPrivate}
          onSwitchChange={setIsPrivate}
        />
      </UnifiedFormSection>

      {!isPrivate ? (
        <FormSection title="Choose Collaborators">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarsRow}
          >
            {collaboratorOptions.length === 0 ? (
              <View style={styles.emptyCollaborators}>
                <Text style={styles.emptyCollaboratorsText}>No friends available to invite.</Text>
              </View>
            ) : (
              collaboratorOptions.map(friend => {
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
                      source={friend.avatarUri ? { uri: friend.avatarUri } : undefined}
                      style={[styles.avatarImage, !friend.avatarUri && styles.avatarFallback]}
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
              })
            )}
          </ScrollView>
        </FormSection>
      ) : null}

      <UnifiedFormSection>
        <UnifiedFormRow
          title="Lock Date"
          valueText={formatDateLabel(lockDate)}
          onPress={onPressLockDate}
          accessibilityLabel="Pick lock date"
          showChevron
        />
        <UnifiedFormRow
          title="Unlock Date"
          valueText={formatDateLabel(unlockDate)}
          onPress={onPressUnlockDate}
          accessibilityLabel="Pick unlock date"
          showChevron
        />
      </UnifiedFormSection>

      {/* Native Date Pickers */}
      {Platform.OS === "ios" && showLockPicker && (
        <Modal transparent animationType="fade" visible={showLockPicker} onRequestClose={() => setShowLockPicker(false)}>
          <TouchableWithoutFeedback onPress={() => setShowLockPicker(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.datePickerModal}>
                  <DateTimePicker
                    value={lockDate || new Date()}
                    mode="date"
                    display="inline"
                    onChange={(event, date) => handleDateChange("lock", event, date)}
                    minimumDate={new Date()}
                    textColor={colors.white}
                    themeVariant="dark"
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      {Platform.OS === "android" && showLockPicker && (
        <DateTimePicker
          value={lockDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange("lock", event, date)}
          minimumDate={new Date()}
        />
      )}
      {Platform.OS === "ios" && showUnlockPicker && (
        <Modal transparent animationType="fade" visible={showUnlockPicker} onRequestClose={() => setShowUnlockPicker(false)}>
          <TouchableWithoutFeedback onPress={() => setShowUnlockPicker(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.datePickerModal}>
                  <DateTimePicker
                    value={unlockDate || new Date()}
                    mode="date"
                    display="inline"
                    onChange={(event, date) => handleDateChange("unlock", event, date)}
                    minimumDate={lockDate || new Date()}
                    textColor={colors.white}
                    themeVariant="dark"
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      {Platform.OS === "android" && showUnlockPicker && (
        <DateTimePicker
          value={unlockDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange("unlock", event, date)}
          minimumDate={lockDate || new Date()}
        />
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
  avatarsRow: {
    paddingVertical: spacing.sm,
  },
  emptyCollaborators: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
  },
  emptyCollaboratorsText: {
    color: colors.textSecondary,
    fontSize: 14,
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
    backgroundColor: colors.surface,
  },
  avatarFallback: {
    backgroundColor: colors.surface,
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
  sectionSpacing: {
    marginBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  datePickerModal: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
