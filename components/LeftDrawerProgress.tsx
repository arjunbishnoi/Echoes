import React from "react";
import type { SharedValue } from "react-native-reanimated";
import { useDrawerProgress } from "react-native-drawer-layout";

const Ctx = React.createContext<SharedValue<number> | null>(null);

export function LeftDrawerProgressProvider({ children }: { children: React.ReactNode }) {
  const progress = useDrawerProgress();
  return <Ctx.Provider value={progress}>{children}</Ctx.Provider>;
}

export function useLeftDrawerProgress(): SharedValue<number> {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    throw new Error("useLeftDrawerProgress must be used within LeftDrawerProgressProvider");
  }
  return ctx;
}


