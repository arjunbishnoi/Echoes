import { ContentWidth } from "@/components/DrawerContentLayout";
import LibraryItem from "@/components/LibraryItem";
import { useEchoStorage } from "@/hooks/useEchoStorage";
import { useFavoriteEchoes } from "@/hooks/useFavoriteEchoes";
import { usePinnedEchoes } from "@/hooks/usePinnedEchoes";
import { filterEchoesByStatus, searchEchoes, type EchoFilterType } from "@/utils/echoes";
import React, { useMemo } from "react";
import { ActionSheetIOS, Alert, Dimensions, Platform, View } from "react-native";
import { AllEmptyState, LockedEmptyState, OngoingEmptyState, SearchEmptyState, UnlockedEmptyState } from "./LibraryEmptyStates";

interface LibraryListProps {
  filter: EchoFilterType;
  query?: string;
  onItemPress: (id: string) => void;
}

export default function LibraryList({ filter, query, onItemPress }: LibraryListProps) {
  const { echoes: all, updateEchoStatus, deleteEcho } = useEchoStorage();
  const { isFavorite, toggleFavorite } = useFavoriteEchoes();
  const { isPinned, togglePin } = usePinnedEchoes();
  const segmentWidth = 0.25 * (Dimensions.get("window").width - 32);

  const filtered = useMemo(() => {
    if (query && query.trim().length > 0) {
      return searchEchoes(all, query);
    }
    return filterEchoesByStatus(all, filter);
  }, [all, filter, query]);

  const handleStatusChange = (echoId: string, echoTitle: string) => {
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

  const handleDelete = (echoId: string, echoTitle: string) => {
    Alert.alert(
      "Delete Echo",
      `Are you sure you want to permanently delete "${echoTitle}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteEcho(echoId);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleMenuPress = (echoId: string, echoTitle: string) => {
    const pinned = isPinned(echoId);
    const favorited = isFavorite(echoId);

    if (Platform.OS === "ios") {
      const options = [
        "Change Status",
        pinned ? "Unpin" : "Pin",
        favorited ? "Remove from Favorites" : "Add to Favorites",
        "Delete",
        "Cancel",
      ];

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: echoTitle,
          options,
          cancelButtonIndex: 4,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            handleStatusChange(echoId, echoTitle);
          } else if (buttonIndex === 1) {
            const success = togglePin(echoId);
            if (!success && !pinned) {
              Alert.alert("Pin Limit", "You can only pin up to 2 echoes at a time.");
            }
          } else if (buttonIndex === 2) {
            toggleFavorite(echoId);
          } else if (buttonIndex === 3) {
            handleDelete(echoId, echoTitle);
          }
        }
      );
    } else {
      Alert.alert(
        echoTitle,
        "Select an action",
        [
          {
            text: "Change Status",
            onPress: () => handleStatusChange(echoId, echoTitle),
          },
          {
            text: pinned ? "Unpin" : "Pin",
            onPress: () => {
              const success = togglePin(echoId);
              if (!success && !pinned) {
                Alert.alert("Pin Limit", "You can only pin up to 2 echoes at a time.");
              }
            },
          },
          {
            text: favorited ? "Remove from Favorites" : "Add to Favorites",
            onPress: () => toggleFavorite(echoId),
          },
          {
            text: "Delete",
            onPress: () => handleDelete(echoId, echoTitle),
            style: "destructive",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    }
  };

  const renderList = (list: typeof all, opts?: { locked?: boolean; completed?: boolean }) => (
    <ContentWidth>
      {list.map((c, idx) => {
        const locked = opts?.locked ?? c.status === "locked";
        const completed = opts?.completed ?? c.status === "unlocked";

        return (
          <React.Fragment key={`${filter}-${c.id}`}>
            {idx > 0 ? <View style={{ height: 2 }} /> : null}
            <LibraryItem
              title={c.title}
              thumbnailUri={c.imageUrl}
              locked={locked}
              completed={completed}
              textColor={completed ? "#EAEAEA" : undefined}
              onPress={() => onItemPress(c.id)}
              onMenuPress={() => handleMenuPress(c.id, c.title ?? "Echo")}
              coverWidth={segmentWidth}
            />
          </React.Fragment>
        );
      })}
    </ContentWidth>
  );

  if (query && query.trim().length > 0) {
    if (filtered.length === 0) {
      return <SearchEmptyState />;
    }
    return renderList(filtered);
  }

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

  if (filtered.length === 0) {
    if (filter === "recent") return <OngoingEmptyState />;
    if (filter === "locked") return <LockedEmptyState />;
    if (filter === "completed") return <UnlockedEmptyState />;
  }

  return renderList(filtered);
}


