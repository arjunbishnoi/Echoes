import { ActionSheetIOS, Alert, Platform } from "react-native";

interface FriendContextMenuOptions {
  onEdit: () => void;
  onRemove: () => void;
}

export function useFriendContextMenu() {
  const showContextMenu = ({ onEdit, onRemove }: FriendContextMenuOptions) => {
    if (Platform.OS === "ios") {
      const options = ["Edit", "Remove Friend", "Cancel"];
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1, // "Remove Friend" is destructive
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            onEdit();
          } else if (buttonIndex === 1) {
            onRemove();
          }
        }
      );
    } else {
      // Android
      Alert.alert(
        "Friend Options",
        "",
        [
          {
            text: "Edit",
            onPress: onEdit,
          },
          {
            text: "Remove Friend",
            onPress: onRemove,
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

  return { showContextMenu };
}


