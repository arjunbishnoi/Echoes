import { ActionSheetIOS, Alert, Platform, Vibration } from "react-native";
import { HAPTIC_DURATION } from "../constants/animations";

interface ActionSheetOption {
  label: string;
  onPress: () => void;
}

export function usePlatformActionSheet() {
  const showActionSheet = (title: string, message: string, options: ActionSheetOption[]) => {
    // Add haptic feedback
    if (Platform.OS === "ios") {
      Vibration.vibrate(HAPTIC_DURATION.light);
    } else {
      Vibration.vibrate(HAPTIC_DURATION.medium);
    }

    if (Platform.OS === "ios") {
      const labels = options.map((opt) => opt.label);
      labels.push("Cancel");

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          message,
          options: labels,
          cancelButtonIndex: labels.length - 1,
          destructiveButtonIndex: -1,
        },
        (buttonIndex) => {
          if (buttonIndex < options.length) {
            options[buttonIndex].onPress();
          }
        }
      );
    } else {
      const buttons: any[] = options.map((opt) => ({
        text: opt.label,
        onPress: opt.onPress,
        style: "default",
      }));
      buttons.push({ text: "Cancel", onPress: () => {}, style: "cancel" });

      Alert.alert(title, message, buttons, { cancelable: true });
    }
  };

  return { showActionSheet };
}


