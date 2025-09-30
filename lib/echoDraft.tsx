import React, { createContext, useContext, useMemo, useState } from "react";

type EchoDraftState = {
  isPrivate: boolean;
  collaboratorIds: string[];
  lockDate?: Date;
  unlockDate?: Date;
};

type EchoDraftContextType = EchoDraftState & {
  setIsPrivate: (v: boolean) => void;
  setCollaboratorIds: (ids: string[]) => void;
  setLockDate: (d: Date | undefined) => void;
  setUnlockDate: (d: Date | undefined) => void;
  reset: () => void;
};

const defaultState: EchoDraftState = {
  isPrivate: true,
  collaboratorIds: [],
  lockDate: undefined,
  unlockDate: undefined,
};

const EchoDraftContext = createContext<EchoDraftContextType | undefined>(undefined);

export function EchoDraftProvider({ children }: { children: React.ReactNode }) {
  const [isPrivate, setIsPrivate] = useState<boolean>(defaultState.isPrivate);
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>(defaultState.collaboratorIds);
  const [lockDate, setLockDate] = useState<Date | undefined>(defaultState.lockDate);
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(defaultState.unlockDate);

  const value = useMemo(() => ({
    isPrivate,
    collaboratorIds,
    lockDate,
    unlockDate,
    setIsPrivate,
    setCollaboratorIds,
    setLockDate,
    setUnlockDate,
    reset: () => {
      setIsPrivate(defaultState.isPrivate);
      setCollaboratorIds(defaultState.collaboratorIds);
      setLockDate(defaultState.lockDate);
      setUnlockDate(defaultState.unlockDate);
    },
  }), [isPrivate, collaboratorIds, lockDate, unlockDate]);

  return (
    <EchoDraftContext.Provider value={value}>{children}</EchoDraftContext.Provider>
  );
}

export function useEchoDraft(): EchoDraftContextType {
  const ctx = useContext(EchoDraftContext);
  if (!ctx) throw new Error("useEchoDraft must be used within EchoDraftProvider");
  return ctx;
}




