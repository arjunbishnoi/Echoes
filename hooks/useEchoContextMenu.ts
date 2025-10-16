import { ActionSheetIOS, Alert, Platform } from "react-native";

interface ContextMenuOptions {
  isPinned: boolean;
  onPin: () => void;
  onRemove: () => void;
}

export function useEchoContextMenu() {
  const showContextMenu = ({ isPinned, onPin, onRemove }: ContextMenuOptions) => {
    if (Platform.OS === "ios") {
      const options = [isPinned ? "Unpin" : "Pin", "Remove", "Cancel"];
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1, // "Remove" is destructive
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            onPin();
          } else if (buttonIndex === 1) {
            onRemove();
          }
        }
      );
    } else {
      // Android
      Alert.alert(
        "Echo Options",
        "",
        [
          {
            text: isPinned ? "Unpin" : "Pin",
            onPress: onPin,
          },
          {
            text: "Remove",
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

