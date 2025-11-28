import { ActionSheetIOS, Alert, Platform } from "react-native";

interface FriendContextMenuOptions {
  onEdit?: () => void;
  onRemove: () => void;
}

export function useFriendContextMenu() {
  const showContextMenu = ({ onEdit, onRemove }: FriendContextMenuOptions) => {
    if (Platform.OS === "ios") {
      const options = onEdit ? ["Edit", "Remove Friend", "Cancel"] : ["Remove Friend", "Cancel"];
      const cancelButtonIndex = onEdit ? 2 : 1;
      const destructiveButtonIndex = onEdit ? 1 : 0;
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex, // "Remove Friend" is destructive
        },
        (buttonIndex) => {
          if (onEdit && buttonIndex === 0) {
            onEdit();
          } else if (onEdit && buttonIndex === 1) {
            onRemove();
          } else if (!onEdit && buttonIndex === 0) {
            onRemove();
          }
        }
      );
    } else {
      // Android
      const buttons = [];
      
      if (onEdit) {
        buttons.push({
            text: "Edit",
            onPress: onEdit,
        });
      }
      
      buttons.push(
          {
            text: "Remove Friend",
            onPress: onRemove,
          style: "destructive" as const,
          },
          {
            text: "Cancel",
          style: "cancel" as const,
        }
      );
      
      Alert.alert(
        "Friend Options",
        "",
        buttons,
        { cancelable: true }
      );
    }
  };

  return { showContextMenu };
}


