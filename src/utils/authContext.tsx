import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types/user";
import { AuthService } from "./services/authService";
import { UserService } from "./services/userService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signInWithGoogle,
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
