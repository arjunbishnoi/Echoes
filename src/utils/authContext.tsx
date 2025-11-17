import type { User } from "@/types/user";
import { ActivityStorage } from "@/utils/activityStorage";
import { Storage } from "@/utils/asyncStorage";
import { EchoStorage } from "@/utils/echoStorage";
import { FriendStorage } from "@/utils/friendStorage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthService } from "./services/authService";
import { UserService } from "./services/userService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const namespaceRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((firebaseUser) => {
      if (isGuest) {
        setIsLoading(false);
        return;
      }
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  const signInWithGoogle = async () => {
    try {
      await AuthService.signInWithGoogle();
      setIsGuest(false);
    } catch (error) {
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      await AuthService.signInWithApple();
      setIsGuest(false);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setIsGuest(false);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const signInAsGuest = async () => {
    try {
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        email: "guest@echoes.app",
        displayName: "Guest User",
        username: "guest",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        friendIds: [],
        blockedUserIds: [],
        settings: {
          notifications: {
            pushEnabled: false,
            emailEnabled: false,
            friendRequests: false,
            echoUpdates: false,
            echoUnlocks: false,
          },
          privacy: {
            profileVisibility: "private",
            allowFriendRequests: false,
          },
          theme: "dark",
        },
      };

      setIsGuest(true);
      setUser(guestUser);
      setIsLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error("No user logged in");

      const updatedUser = await UserService.updateUser(user.id, data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const applyNamespace = async () => {
      const nextNamespace = isGuest ? "guest" : user?.id ?? "anon";
      if (namespaceRef.current === nextNamespace) {
        return;
      }
      namespaceRef.current = nextNamespace;
      Storage.setNamespace(nextNamespace);
      await Promise.all([
        EchoStorage.clear(),
        ActivityStorage.clear(),
        FriendStorage.clear(),
      ]);
    };
    void applyNamespace();
  }, [user?.id, isGuest]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isGuest,
        signInWithGoogle,
        signInWithApple,
        signInAsGuest,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
