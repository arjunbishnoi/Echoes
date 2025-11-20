import Toast from "@/components/ui/Toast";
import React, { createContext, useContext, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";

interface ToastContextType {
  showToast: (message: string, icon?: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIcon, setToastIcon] = useState<string>("checkmark-circle");
  const [toastDuration, setToastDuration] = useState(3000);

  const showToast = useCallback((message: string, icon: string = "checkmark-circle", duration: number = 3000) => {
    setToastMessage(message);
    setToastIcon(icon);
    setToastDuration(duration);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View style={styles.toastContainer} pointerEvents="box-none">
        <Toast
          message={toastMessage}
          visible={toastVisible}
          onHide={hideToast}
          icon={toastIcon}
          duration={toastDuration}
        />
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    pointerEvents: "box-none",
  },
});


