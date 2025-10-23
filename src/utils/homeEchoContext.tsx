import React, { createContext, useContext } from "react";
import { useHomeEchoes } from "@/hooks/useHomeEchoes";

interface HomeEchoContextType {
  isVisibleOnHome: (id: string) => boolean;
  addToHome: (id: string) => void;
  removeFromHome: (id: string) => void;
  filterVisibleEchoes: <T extends { id: string }>(items: T[]) => T[];
}

const HomeEchoContext = createContext<HomeEchoContextType | null>(null);

export function HomeEchoProvider({ children }: { children: React.ReactNode }) {
  const homeEchoes = useHomeEchoes();

  return (
    <HomeEchoContext.Provider value={homeEchoes}>
      {children}
    </HomeEchoContext.Provider>
  );
}

export function useHomeEchoContext() {
  const context = useContext(HomeEchoContext);
  if (!context) {
    throw new Error("useHomeEchoContext must be used within HomeEchoProvider");
  }
  return context;
}

