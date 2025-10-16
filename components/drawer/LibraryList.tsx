import React, { useMemo } from "react";
import { ActionSheetIOS, Alert, Dimensions, Platform, StyleSheet, View } from "react-native";
import { useEchoStorage } from "../../hooks/useEchoStorage";
import { computeEchoProgressPercent, filterEchoesByStatus, type EchoFilterType } from "../../lib/echoes";
import { ContentWidth } from "../DrawerContentLayout";
import LibraryItem from "../LibraryItem";
import { AllEmptyState, LockedEmptyState, OngoingEmptyState, UnlockedEmptyState } from "./LibraryEmptyStates";

interface LibraryListProps {
  filter: EchoFilterType;
  onItemPress: (id: string, title: string, imageUrl?: string, subtitle?: string) => void;
}

export default function LibraryList({ filter, onItemPress }: LibraryListProps) {
  const { echoes: all, updateEchoStatus } = useEchoStorage();
  const segmentWidth = 0.25 * (Dimensions.get("window").width - 32);

  const filtered = useMemo(() => filterEchoesByStatus(all, filter), [all, filter]);

  const handleLongPress = (echoId: string, echoTitle: string, currentStatus: string) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `Change Status: ${echoTitle}`,
          options: ["Ongoing", "Locked", "Completed", "Cancel"],
          cancelButtonIndex: 3,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) await updateEchoStatus(echoId, "ongoing");
          else if (buttonIndex === 1) await updateEchoStatus(echoId, "locked");
          else if (buttonIndex === 2) await updateEchoStatus(echoId, "unlocked");
        }
      );
    } else {
      Alert.alert(
        `Change Status: ${echoTitle}`,
        "Select new status",
        [
          { text: "Ongoing", onPress: async () => await updateEchoStatus(echoId, "ongoing") },
          { text: "Locked", onPress: async () => await updateEchoStatus(echoId, "locked") },
          { text: "Completed", onPress: async () => await updateEchoStatus(echoId, "unlocked") },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const renderList = (list: typeof all, opts?: { locked?: boolean; completed?: boolean }) => (
    <ContentWidth>
      {list.map((c, idx) => {
        const locked = opts?.locked ?? c.status === "locked";
        const completed = opts?.completed ?? c.status === "unlocked";
        const progressVal = completed ? 1 : computeEchoProgressPercent(c);

        return (
          <React.Fragment key={`${filter}-${c.id}`}>
            {idx > 0 ? <View style={{ height: 2 }} /> : null}
            <LibraryItem
              title={c.title}
              thumbnailUri={c.imageUrl}
              progress={progressVal}
              locked={locked}
              completed={completed}
              textColor={completed ? "#EAEAEA" : undefined}
              onPress={() => onItemPress(c.id, c.title, c.imageUrl, c.description)}
              onLongPress={() => handleLongPress(c.id, c.title, c.status)}
              coverWidth={segmentWidth}
            />
          </React.Fragment>
        );
      })}
    </ContentWidth>
  );

  if (filter === "all") {
    if (all.length === 0) {
      return <AllEmptyState />;
    }
    const ongoing = filterEchoesByStatus(all, "recent");
    const locked = filterEchoesByStatus(all, "locked");
    const unlocked = filterEchoesByStatus(all, "completed");
    return (
      <>
        {ongoing.length > 0 && renderList(ongoing)}
        {locked.length > 0 && (
          <>
            <View style={{ height: 2 }} />
            {renderList(locked, { locked: true })}
          </>
        )}
        {unlocked.length > 0 && (
          <>
            <View style={{ height: 2 }} />
            {renderList(unlocked, { completed: true })}
          </>
        )}
      </>
    );
  }

  // Show empty states for specific filters
  if (filtered.length === 0) {
    if (filter === "recent") return <OngoingEmptyState />;
    if (filter === "locked") return <LockedEmptyState />;
    if (filter === "completed") return <UnlockedEmptyState />;
  }

  return renderList(filtered);
}

const styles = StyleSheet.create({});


